import React from "react";

import {
    Card, CardBody, CardHeader,
    Col, Table, Modal, ModalBody, ModalFooter, ModalHeader, Button,
    Input, InputGroup, Label, FormGroup, Form, Row
} from 'reactstrap';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';
import { Menu, Item } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';
import { contextMenu } from 'react-contexify';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN, PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN, MONTHS_IN_PAST_FOR_AMC, MONTHS_IN_FUTURE_FOR_AMC, DEFAULT_MIN_MONTHS_OF_STOCK, CANCELLED_SHIPMENT_STATUS, PSM_PROCUREMENT_AGENT_ID, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, NO_OF_MONTHS_ON_LEFT_CLICKED, ON_HOLD_SHIPMENT_STATUS, NO_OF_MONTHS_ON_RIGHT_CLICKED, DEFAULT_MAX_MONTHS_OF_STOCK } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { Link } from "react-router-dom";
import NumberFormat from 'react-number-format';

import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Bar, Line, Pie } from 'react-chartjs-2';
import pdfIcon from '../../assets/img/pdf.png';
import { LOGO } from '../../CommonComponent/Logo.js'
import jsPDF from "jspdf";
import "jspdf-autotable";
import csvicon from '../../assets/img/csv.png';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';

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
                labelString: i18n.t('static.dashboard.unit')
            },
            stacked: false,
            ticks: {
                beginAtZero: true
            },
            position: 'left',
        },
        {
            id: 'B',
            scaleLabel: {
                display: true,
                labelString: i18n.t('static.dashboard.months')
            },
            stacked: false,
            ticks: {
                beginAtZero: true
            },
            position: 'right',
        }
        ]
    },
    tooltips: {
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
            minMonthOfStock: 0,
            reorderFrequency: 0,
            programPlanningUnitList: [],
            openingBalanceArray: [],
            closingBalanceArray: [],
            monthsOfStockArray: [],
            suggestedShipmentChangedFlag: 0,
            psmShipmentsTotalData: [],
            nonPsmShipmentsTotalData: [],
            artmisShipmentsTotalData: [],
            plannedPsmChangedFlag: 0,
            message: '',
            activeTab: new Array(3).fill('1'),
            jsonArrForGraph: [],
            display: 'none',
            lang: localStorage.getItem('lang'),
            unmetDemand: [],
            expiredStock: []

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

        var openningArr = [...[("Opening Balance").replaceAll(' ', '%20')], ... this.state.openingBalanceArray]
        var consumptionArr = [...["Consumption"], ...this.state.consumptionTotalData]
        var suggestedArr = [...[("Suggested Shipments").replaceAll(' ', '%20')], ...this.state.suggestedShipmentsTotalData.map(item => item.suggestedOrderQty)]
        var psmShipmentArr = [...[("PSM Shipments in QAT").replaceAll(' ', '%20')], ...this.state.psmShipmentsTotalData.map(item => item.qty)]
        var artmisShipmentArr = [...[("PSM Shipments from ARTMIS").replaceAll(' ', '%20')], ...this.state.artmisShipmentsTotalData.map(item => item.qty)]
        var nonPsmShipmentArr = [...[("Non PSM Shipment").replaceAll(' ', '%20')], ...this.state.nonPsmShipmentsTotalData.map(item => item.qty)]
        var inventoryArr = [...["Adjustments"], ...this.state.inventoryTotalData]
        var closingBalanceArr = [...[("Ending Balance").replaceAll(' ', '%20')], ...this.state.closingBalanceArray]
        var amcgArr = [...["AMC"], ...this.state.amcTotalData]
        var monthsOfStockArr = [...[("Months of Stock").replaceAll(' ', '%20')], ... this.state.monthsOfStockArray]
        var minStockArr = [...[("Min stock").replaceAll(' ', '%20')], ...this.state.minStockArray]
        var maxStockArr = [...[("Max stock").replaceAll(' ', '%20')], ...this.state.maxStockArray]

        A.push(openningArr)
        A.push(consumptionArr)
        A.push(suggestedArr)
        A.push(psmShipmentArr)
        A.push(artmisShipmentArr)
        A.push(nonPsmShipmentArr)
        A.push(inventoryArr)
        A.push(closingBalanceArr)
        A.push(amcgArr)
        A.push(monthsOfStockArr)
        A.push(minStockArr)
        A.push(maxStockArr)
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

        var canvas = document.getElementById("cool-canvas1");
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

        var openningArr = [...["Opening Balance"], ... this.state.openingBalanceArray]
        var consumptionArr = [...["Consumption"], ...this.state.consumptionTotalData]
        var suggestedArr = [...["Suggested Shipments"], ...this.state.suggestedShipmentsTotalData.map(item => item.suggestedOrderQty)]
        var psmShipmentArr = [...["PSM Shipments in QAT"], ...this.state.psmShipmentsTotalData.map(item => item.qty)]
        var artmisShipmentArr = [...["PSM Shipments from ARTMIS"], ...this.state.artmisShipmentsTotalData.map(item => item.qty)]
        var nonPsmShipmentArr = [...["Non PSM Shipment"], ...this.state.nonPsmShipmentsTotalData.map(item => item.qty)]
        var inventoryArr = [...["Adjustments"], ...this.state.inventoryTotalData]
        var closingBalanceArr = [...["Ending Balance"], ...this.state.closingBalanceArray]
        var amcgArr = [...["AMC"], ...this.state.amcTotalData]
        var monthsOfStockArr = [...["Months of Stock"], ... this.state.monthsOfStockArray]
        var minStocArr = [...["Min stock"], ...this.state.minStockArray]
        var maxStockArr = [...["Max stock"], ...this.state.maxStockArray]

        const data = [openningArr, consumptionArr, suggestedArr, psmShipmentArr, artmisShipmentArr, nonPsmShipmentArr, inventoryArr, closingBalanceArr, amcgArr, monthsOfStockArr, minStocArr, maxStockArr];

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
        doc.save("SupplyPlan.pdf")

    }


    componentDidMount() {
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
                        var programJson = {
                            name: getLabelText(programNameLabel, this.state.lang) + "~v" + myResult[i].version,
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
        var programPlanningUnitListAll = []
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
                for (var i = 0; i < programJson.regionList.length; i++) {
                    var regionJson = {
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
                        if (myResult[i].program.id == programId) {
                            var productJson = {
                                name: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                                id: myResult[i].planningUnit.id
                            }
                            proList[i] = productJson;
                            programPlanningUnitListAll.push(myResult[i]);
                        }
                    }

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
                            if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0) {
                                if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                                    var dataSourceJson = {
                                        name: getLabelText(dataSourceResult[k].label, this.state.lang),
                                        id: dataSourceResult[k].dataSourceId
                                    }
                                    dataSourceList[k] = dataSourceJson
                                }
                            }
                        }
                        this.setState({
                            planningUnitList: proList,
                            programPlanningUnitList: myResult,
                            regionList: regionList,
                            programJson: programJson,
                            dataSourceList: dataSourceList,
                            programPlanningUnitListAll: programPlanningUnitListAll
                        })
                        this.formSubmit(this.state.monthCount)
                    }.bind(this);
                }.bind(this);
            }.bind(this);
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

        var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.planningUnit.id = planningUnitId))[0];
        var minMonthsOfStock = programPlanningUnit.minMonthsOfStock;
        var reorderFrequencyInMonths = programPlanningUnit.reorderFrequencyInMonths;

        var regionListFiltered = [];
        if (regionId != -1) {
            regionListFiltered = (this.state.regionList).filter(r => r.id == regionId);
        } else {
            regionListFiltered = this.state.regionList
        }

        var consumptionTotalData = [];

        var consumptionDataForAllMonths = [];
        var amcTotalData = [];

        var consumptionTotalMonthWise = [];
        var filteredArray = [];
        var minStockArray = [];
        var maxStockArray = [];

        var inventoryTotalData = [];
        var expectedBalTotalData = [];
        var suggestedShipmentsTotalData = [];
        var inventoryTotalMonthWise = [];
        var filteredArrayInventory = [];
        var openingBalanceArray = [];
        var closingBalanceArray = [];

        var psmShipmentsTotalData = [];
        var nonPsmShipmentsTotalData = [];
        var artmisShipmentsTotalData = [];
        var jsonArrForGraph = [];
        var monthsOfStockArray = [];
        var unmetDemand = [];
        var plannedTotalShipmentsBasedOnMonth = [];
        var draftTotalShipmentsBasedOnMonth = [];
        var submittedTotalShipmentsBasedOnMonth = [];
        var approvedTotalShipmentsBasedOnMonth = [];
        var shippedTotalShipmentsBasedOnMonth = [];
        var arrivedTotalShipmentsBasedOnMonth = [];
        var deliveredTotalShipmentsBasedOnMonth = [];
        var cancelledTotalShipmentsBasedOnMonth = [];
        var onHoldTotalShipmentsBasedOnMonth = [];
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
                var batchNoRequired = this.state.programPlanningUnitListAll.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].batchNoRequired;
                this.setState({
                    batchNoRequired: batchNoRequired
                })
                var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                var consumptionListForlastActualConsumptionDate = consumptionList.filter(c => c.actualFlag == true);
                var lastActualConsumptionDate = "";
                for (var lcd = 0; lcd < consumptionListForlastActualConsumptionDate.length; lcd++) {
                    if (lcd == 0) {
                        lastActualConsumptionDate = consumptionListForlastActualConsumptionDate[lcd].consumptionDate;
                    }
                    if (lastActualConsumptionDate < consumptionListForlastActualConsumptionDate[lcd].consumptionDate) {
                        lastActualConsumptionDate = consumptionListForlastActualConsumptionDate[lcd].consumptionDate;
                    }
                }
                if (regionId != -1) {
                    consumptionList = consumptionList.filter(c => c.region.id == regionId)
                }

                for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                    var consumptionQty = 0;
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
                    for (var c = 0; c < PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN; c++) {
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
                            if (amcArrayForMonth.length == MONTHS_IN_PAST_FOR_AMC) {
                                c = PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN;
                            }
                        }

                    }

                    for (var c = 0; c < PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN; c++) {
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
                            if (amcArrayForMonth.length == MONTHS_IN_FUTURE_FOR_AMC) {
                                c = PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN;
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


                        // Calculations for Max Stock
                        var minForMonths = 0;
                        if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + reorderFrequencyInMonths)) {
                            minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                        } else {
                            minForMonths = (maxForMonths + reorderFrequencyInMonths);
                        }
                        var maxStock = parseInt(parseInt(amcCalcualted) * parseInt(minForMonths));;
                        maxStockArray.push(maxStock);
                    } else {
                        amcTotalData.push("");
                        minStockArray.push("");
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
                        var c = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate) && c.region.id == regionListFiltered[reg].id);
                        var filteredJsonInventory = { adjustmentQty: '', region: { id: regionListFiltered[reg].id }, month: m[i] };
                        for (var j = 0; j < c.length; j++) {
                            adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                            adjustmentQtyForRegion += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                            filteredJsonInventory = { month: m[i], region: c[j].region, adjustmentQty: adjustmentQtyForRegion, inventoryId: c[j].inventoryId, inventoryDate: c[j].inventoryDate };
                        }
                        filteredArrayInventory.push(filteredJsonInventory);
                    }
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

                // Shipments part
                var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS);
                for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                    var psm = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.erpFlag == false && c.procurementAgent.id == PSM_PROCUREMENT_AGENT_ID)
                    var nonPsm = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.procurementAgent.id != PSM_PROCUREMENT_AGENT_ID)
                    var artmisShipments = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.erpFlag == true)
                    var psmQty = 0;
                    var psmToBeAccounted = 0;
                    var nonPsmQty = 0;
                    var nonPsmToBeAccounted = 0;
                    var artmisQty = 0;
                    var artmisToBeAccounted = 0;
                    var psmEmergencyOrder = 0;
                    var artmisEmergencyOrder = 0;
                    var nonPsmEmergencyOrder = 0;
                    for (var j = 0; j < psm.length; j++) {
                        psmQty += parseInt((psm[j].shipmentQty));
                        if (psm[j].accountFlag == 1) {
                            psmToBeAccounted = 1;
                        }
                        if (psm[j].emergencyOrder == 1) {
                            psmEmergencyOrder = 1;
                        }
                    }
                    if (psm.length == 0) {
                        psmShipmentsTotalData.push("");
                    } else {
                        psmShipmentsTotalData.push({ qty: psmQty, accountFlag: psmToBeAccounted, index: i, month: m[i], isEmergencyOrder: psmEmergencyOrder });
                    }

                    for (var np = 0; np < nonPsm.length; np++) {
                        nonPsmQty += parseInt((nonPsm[np].shipmentQty));
                        if (nonPsm[np].accountFlag == 1) {
                            nonPsmToBeAccounted = 1;
                        }

                        if (nonPsm[np].emergencyOrder == 1) {
                            nonPsmEmergencyOrder = 1;
                        }
                    }
                    if (nonPsm.length == 0) {
                        nonPsmShipmentsTotalData.push("");
                    } else {
                        nonPsmShipmentsTotalData.push({ qty: nonPsmQty, accountFlag: nonPsmToBeAccounted, index: i, month: m[i], isEmergencyOrder: nonPsmEmergencyOrder });
                    }

                    for (var a = 0; a < artmisShipments.length; a++) {
                        artmisQty += parseInt((artmisShipments[a].shipmentQty));
                        if (artmisShipments[a].accountFlag == 1) {
                            artmisToBeAccounted = 1;
                        }
                        if (psm[a].emergencyOrder == 1) {
                            artmisEmergencyOrder = 1;
                        }
                    }
                    if (artmisShipments.length == 0) {
                        artmisShipmentsTotalData.push("");
                    } else {
                        artmisShipmentsTotalData.push({ qty: artmisQty, accountFlag: artmisToBeAccounted, index: i, month: m[i], isEmergencyOrder: artmisEmergencyOrder });
                    }
                }

                // Calculation of opening and closing balance
                var openingBalance = 0;
                var totalConsumption = 0;
                var totalAdjustments = 0;
                var totalShipments = 0;

                var consumptionRemainingList = consumptionList.filter(c => c.consumptionDate < m[0].startDate);
                for (var j = 0; j < consumptionRemainingList.length; j++) {
                    var count = 0;
                    for (var k = 0; k < consumptionRemainingList.length; k++) {
                        if (consumptionRemainingList[j].consumptionDate == consumptionRemainingList[k].consumptionDate && consumptionRemainingList[j].region.id == consumptionRemainingList[k].region.id && j != k) {
                            count++;
                        } else {

                        }
                    }
                    if (count == 0) {
                        totalConsumption += parseInt((consumptionRemainingList[j].consumptionQty));
                    } else {
                        if (consumptionRemainingList[j].actualFlag.toString() == 'true') {
                            totalConsumption += parseInt((consumptionRemainingList[j].consumptionQty));
                        }
                    }
                }

                var adjustmentsRemainingList = inventoryList.filter(c => c.inventoryDate < m[0].startDate);
                for (var j = 0; j < adjustmentsRemainingList.length; j++) {
                    totalAdjustments += parseFloat((adjustmentsRemainingList[j].adjustmentQty * adjustmentsRemainingList[j].multiplier));
                }

                var shipmentsRemainingList = shipmentList.filter(c => c.expectedDeliveryDate < m[0].startDate && c.accountFlag == true);
                for (var j = 0; j < shipmentsRemainingList.length; j++) {
                    totalShipments += parseInt((shipmentsRemainingList[j].shipmentQty));
                }
                openingBalance = totalAdjustments - totalConsumption + totalShipments;
                openingBalanceArray.push(openingBalance);
                for (var i = 1; i <= TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {

                    var consumptionQtyForCB = 0;
                    if (consumptionTotalData[i - 1] != "") {
                        consumptionQtyForCB = consumptionTotalData[i - 1];
                    }
                    var inventoryQtyForCB = 0;
                    if (inventoryTotalData[i - 1] != "") {
                        inventoryQtyForCB = inventoryTotalData[i - 1];
                    }
                    var psmShipmentQtyForCB = 0;
                    if (psmShipmentsTotalData[i - 1] != "" && psmShipmentsTotalData[i - 1].accountFlag == true) {
                        psmShipmentQtyForCB = psmShipmentsTotalData[i - 1].qty;
                    }

                    var nonPsmShipmentQtyForCB = 0;
                    if (nonPsmShipmentsTotalData[i - 1] != "" && nonPsmShipmentsTotalData[i - 1].accountFlag == true) {
                        nonPsmShipmentQtyForCB = nonPsmShipmentsTotalData[i - 1].qty;
                    }

                    var artmisShipmentQtyForCB = 0;
                    if (artmisShipmentsTotalData[i - 1] != "" && artmisShipmentsTotalData[i - 1].accountFlag == true) {
                        artmisShipmentQtyForCB = artmisShipmentsTotalData[i - 1].qty;
                    }

                    // Suggested shipments part
                    var s = i - 1;
                    var month = m[s].startDate;
                    var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                    var compare = (month >= currentMonth);
                    var stockInHand = openingBalanceArray[s] - consumptionQtyForCB + inventoryQtyForCB + psmShipmentQtyForCB + nonPsmShipmentQtyForCB + artmisShipmentQtyForCB;
                    if (compare && parseInt(stockInHand) <= parseInt(minStockArray[s])) {
                        var suggestedOrd = parseInt(maxStockArray[s] - minStockArray[s]);
                        if (suggestedOrd == 0) {
                            var addLeadTimes = parseInt(parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                                parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                                parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime)) + 1;
                            var expectedDeliveryDate = moment(month).subtract(addLeadTimes, 'months').format("YYYY-MM-DD");
                            var isEmergencyOrder = 0;
                            if (expectedDeliveryDate >= currentMonth) {
                                isEmergencyOrder = 0;
                            } else {
                                isEmergencyOrder = 1;
                            }
                            suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": m[s].startDate, "isEmergencyOrder": isEmergencyOrder });
                        } else {
                            var addLeadTimes = parseInt(parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                                parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                                parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime)) + 1;
                            var expectedDeliveryDate = moment(month).subtract(addLeadTimes, 'months').format("YYYY-MM-DD");
                            var isEmergencyOrder = 0;
                            if (expectedDeliveryDate >= currentMonth) {
                                isEmergencyOrder = 0;
                            } else {
                                isEmergencyOrder = 1;
                            }
                            suggestedShipmentsTotalData.push({ "suggestedOrderQty": suggestedOrd, "month": m[s].startDate, "isEmergencyOrder": isEmergencyOrder });
                        }
                    } else {
                        var addLeadTimes = parseInt(parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                            parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                            parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime)) + 1;
                        var expectedDeliveryDate = moment(month).subtract(addLeadTimes, 'months').format("YYYY-MM-DD");
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
                    var closingBalance = openingBalanceArray[i - 1] - consumptionQtyForCB + inventoryQtyForCB + psmShipmentQtyForCB + nonPsmShipmentQtyForCB + artmisShipmentQtyForCB + suggestedShipmentQtyForCB;
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

                // Calculating shipments based on shipment status
                var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);

                for (var i = 0; i < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; i++) {
                    var shipmentsBasedOnMonth = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate));

                    var plannedShipmentQty = 0;
                    var draftShipmentQty = 0;
                    var submittedShipmentQty = 0;
                    var approvedShipmentQty = 0;
                    var shippedShipmentQty = 0;
                    var arrivedShipmentQty = 0;
                    var deliveredShipmentQty = 0;
                    var cancelledShipmentQty = 0;
                    var onHoldShipmentQty = 0;

                    var plannedShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS);
                    for (var j = 0; j < plannedShipments.length; j++) {
                        plannedShipmentQty += parseInt((plannedShipments[j].shipmentQty));
                    }
                    plannedTotalShipmentsBasedOnMonth.push(plannedShipmentQty);

                    var draftShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS);
                    for (var j = 0; j < draftShipments.length; j++) {
                        draftShipmentQty += parseInt((draftShipments[j].shipmentQty));
                    }
                    draftTotalShipmentsBasedOnMonth.push(draftShipmentQty);

                    var submittedShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS);
                    for (var j = 0; j < submittedShipments.length; j++) {
                        submittedShipmentQty += parseInt((submittedShipments[j].shipmentQty));
                    }
                    submittedTotalShipmentsBasedOnMonth.push(submittedShipmentQty);

                    var approvedShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS);
                    for (var j = 0; j < approvedShipments.length; j++) {
                        approvedShipmentQty += parseInt((approvedShipments[j].shipmentQty));
                    }
                    approvedTotalShipmentsBasedOnMonth.push(approvedShipmentQty);

                    var shippedShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS);
                    for (var j = 0; j < shippedShipments.length; j++) {
                        shippedShipmentQty += parseInt((shippedShipments[j].shipmentQty));
                    }
                    shippedTotalShipmentsBasedOnMonth.push(shippedShipmentQty);

                    var arrivedShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS);
                    for (var j = 0; j < arrivedShipments.length; j++) {
                        arrivedShipmentQty += parseInt((arrivedShipments[j].shipmentQty));
                    }
                    arrivedTotalShipmentsBasedOnMonth.push(arrivedShipmentQty);

                    var deliveredShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS);
                    for (var j = 0; j < deliveredShipments.length; j++) {
                        deliveredShipmentQty += parseInt((deliveredShipments[j].shipmentQty));
                    }
                    deliveredTotalShipmentsBasedOnMonth.push(deliveredShipmentQty);

                    var cancelledShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == CANCELLED_SHIPMENT_STATUS);
                    for (var j = 0; j < cancelledShipments.length; j++) {
                        cancelledShipmentQty += parseInt((cancelledShipments[j].shipmentQty));
                    }
                    cancelledTotalShipmentsBasedOnMonth.push(cancelledShipmentQty);

                    var onHoldShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS);
                    for (var j = 0; j < onHoldShipments.length; j++) {
                        onHoldShipmentQty += parseInt((onHoldShipments[j].shipmentQty));
                    }
                    onHoldTotalShipmentsBasedOnMonth.push(onHoldShipmentQty);

                }

                // Logic for expired stock count
                // for (var es = 0; es < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; es++) {
                //     var expiredBatchNumbers = programJson.batchInfoList.filter(c => c.expiryDate <= m[es].endDate && c.expiryDate >= m[es].startDate);
                //     var expiredStock = 0;
                //     for (var ebn = 0; ebn < expiredBatchNumbers.length; ebn++) {
                //         var shipmentList = programJson.shipmentList;
                //         var shipmentBatchArray = [];
                //         for (var ship = 0; ship < shipmentList.length; ship++) {
                //             var batchInfoList = shipmentList[ship].batchInfoList;
                //             for (var bi = 0; bi < batchInfoList.length; bi++) {
                //                 shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
                //             }
                //         }
                //         var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == expiredBatchNumbers[ebn].batchNo)[0];
                //         var totalStockForBatchNumber = stockForBatchNumber.qty;

                //         var consumptionList = programJson.consumptionList;
                //         var consumptionBatchArray = [];
                //         for (var con = 0; con < consumptionList.length; con++) {
                //             var batchInfoList = consumptionList[con].batchInfoList;
                //             for (var bi = 0; bi < batchInfoList.length; bi++) {
                //                 consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
                //             }
                //         }
                //         var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == expiredBatchNumbers[ebn].batchNo);
                //         var consumptionQty = 0;
                //         for (var b = 0; b < consumptionForBatchNumber.length; b++) {
                //             consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
                //         }
                //         var inventoryList = programJson.inventoryList;
                //         var inventoryBatchArray = [];
                //         for (var inv = 0; inv < inventoryList.length; inv++) {
                //             var batchInfoList = inventoryList[inv].batchInfoList;
                //             for (var bi = 0; bi < batchInfoList.length; bi++) {
                //                 inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
                //             }
                //         }
                //         var inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == expiredBatchNumbers[ebn].batchNo);
                //         var adjustmentQty = 0;
                //         for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                //             adjustmentQty += parseFloat(inventoryForBatchNumber[b].qty);
                //         }

                //         var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
                //         expiredStock += parseInt(remainingBatchQty);
                //     }
                // }

                // Building json for graph
                for (var jsonForGraph = 0; jsonForGraph < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; jsonForGraph++) {
                    var json = {
                        month: m[jsonForGraph].month,
                        consumption: consumptionTotalData[jsonForGraph],
                        stock: closingBalanceArray[jsonForGraph],
                        planned: plannedTotalShipmentsBasedOnMonth[jsonForGraph],
                        draft: draftTotalShipmentsBasedOnMonth[jsonForGraph],
                        submitted: submittedTotalShipmentsBasedOnMonth[jsonForGraph],
                        approved: approvedTotalShipmentsBasedOnMonth[jsonForGraph],
                        shipped: shippedTotalShipmentsBasedOnMonth[jsonForGraph],
                        arrived: arrivedTotalShipmentsBasedOnMonth[jsonForGraph],
                        delivered: deliveredTotalShipmentsBasedOnMonth[jsonForGraph],
                        cancelled: cancelledTotalShipmentsBasedOnMonth[jsonForGraph],
                        onHold: onHoldTotalShipmentsBasedOnMonth[jsonForGraph],
                        mos: monthsOfStockArray[jsonForGraph]
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
                    consumptionFilteredArray: filteredArray,
                    consumptionTotalMonthWise: consumptionTotalMonthWise,
                    amcTotalData: amcTotalData,
                    minStockArray: minStockArray,
                    maxStockArray: maxStockArray,
                    monthsOfStockArray: monthsOfStockArray,
                    planningUnitName: planningUnitName,
                    psmShipmentsTotalData: psmShipmentsTotalData,
                    nonPsmShipmentsTotalData: nonPsmShipmentsTotalData,
                    artmisShipmentsTotalData: artmisShipmentsTotalData,
                    jsonArrForGraph: jsonArrForGraph,
                    lastActualConsumptionDate: lastActualConsumptionDate,
                    unmetDemand: unmetDemand
                })
            }.bind(this)
        }.bind(this)

    }

    toggleLarge(supplyPlanType, month, quantity, startDate, endDate, isEmergencyOrder) {
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
            inventoryBatchInfoDuplicateError: '',
            shipmentBatchInfoDuplicateError: '',
            inventoryNoStockError: '',
            consumptionNoStockError: ''

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
        } else if (supplyPlanType == 'psmShipments') {
            this.setState({
                psmShipments: !this.state.psmShipments
            });
            this.shipmentsDetailsClicked(supplyPlanType, startDate, endDate);
        } else if (supplyPlanType == 'artmisShipments') {
            this.setState({
                artmisShipments: !this.state.artmisShipments,
            });
            this.shipmentsDetailsClicked(supplyPlanType, startDate, endDate);
        }
        else if (supplyPlanType == 'nonPsmShipments') {
            this.setState({
                nonPsmShipments: !this.state.nonPsmShipments
            });
            this.shipmentsDetailsClicked(supplyPlanType, startDate, endDate);
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
            inventoryChangedFlag: 0,
            consumptionDuplicateError: '',
            inventoryDuplicateError: '',
            inventoryNoStockError: '',
            consumptionNoStockError: '',
            consumptionBatchInfoDuplicateError: '',
            inventoryBatchInfoDuplicateError: '',
            shipmentBatchInfoDuplicateError: '',

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
            var dataSourceList = this.state.dataSourceList;
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
                    var batchList = []
                    var batchInfoList = programJson.batchInfoList;
                    for (var k = 0; k < batchInfoList.length; k++) {
                        if (batchInfoList[k].expiryDate >= startDate && batchInfoList[k].createdDate <= startDate) {
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
                        colWidths: [80, 150, 200, 80, 80, 350],
                        columns: [
                            { type: 'text', readOnly: true, title: i18n.t('static.report.month') },
                            { type: 'dropdown', readOnly: true, source: this.state.regionList, title: i18n.t('static.region.region') },
                            { type: 'dropdown', source: dataSourceList, title: i18n.t('static.inventory.dataSource') },
                            { type: 'numeric', title: i18n.t('static.consumption.consumptionqty') },
                            { type: 'numeric', title: i18n.t('static.consumption.daysofstockout') },
                            { type: 'text', title: i18n.t('static.program.notes') },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.index') },
                            { type: 'hidden', title: i18n.t('static.report.consumptionDate') },
                            { type: 'checkbox', title: i18n.t('static.consumption.actualflag') },
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
                        editable: false,
                        allowInsertRow: false,
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
                            if (batchInfo != "") {
                                var cell = elInstance.getCell(`D${y + 1}`)
                                cell.classList.add('readonly');
                            }
                        },
                        contextMenu: function (obj, x, y, e) {
                            var items = [];
                            //Add consumption batch info
                            var rowData = obj.getRowData(y)
                            if (rowData[8] == true && this.state.batchNoRequired == true) {
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
                                        for (var sb = 0; sb < batchInfo.length; sb++) {
                                            var data = [];
                                            data[0] = batchInfo[sb].batch.batchId;
                                            data[1] = batchInfo[sb].consumptionQty;
                                            data[2] = batchInfo[sb].consumptionTransBatchInfoId;
                                            data[3] = y;
                                            json.push(data);
                                        }
                                        if (batchInfo.length == 0) {
                                            var data = [];
                                            data[0] = "";
                                            data[1] = "";
                                            data[2] = 0;
                                            data[3] = y;
                                            json.push(data)
                                        }
                                        var options = {
                                            data: json,
                                            columnDrag: true,
                                            colWidths: [100, 150, 290, 100],
                                            columns: [
                                                {
                                                    title: i18n.t('static.supplyPlan.batchId'),
                                                    type: 'dropdown',
                                                    source: this.state.batchInfoList
                                                },
                                                {
                                                    title: i18n.t('static.report.consupmtionqty'),
                                                    type: 'number',
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
                                            search: true,
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
                                                                data[2] = 0;
                                                                data[3] = y;
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
        var elInstance = instance.jexcel;
        elInstance.hideIndex(0);
    }

    loadedBatchInfoConsumption = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
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
            var dataSourceList = this.state.dataSourceList;
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
                    var batchList = []
                    var batchInfoList = programJson.batchInfoList;
                    for (var k = 0; k < batchInfoList.length; k++) {
                        if (batchInfoList[k].expiryDate >= moment(endDate).startOf("month").format("YYYY-MM-DD") && batchInfoList[k].createdDate <= moment(endDate).startOf("month").format("YYYY-MM-DD")) {
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
                            if (countrySKUResult[k].realmCountry.id == programJson.realmCountry.realmCountryId) {
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
                            data = [];
                            data[0] = month;
                            data[1] = inventoryList[j].region.id;
                            data[2] = inventoryList[j].dataSource.id;
                            data[3] = inventoryList[j].realmCountryPlanningUnit.id;
                            data[4] = inventoryList[j].multiplier;
                            data[5] = expectedBal;
                            data[6] = `=E${j + 1}*F${j + 1}`;
                            data[7] = inventoryList[j].adjustmentQty;
                            data[8] = `=E${j + 1}*H${j + 1}`;
                            data[9] = inventoryList[j].actualQty;
                            data[10] = `=E${j + 1}*J${j + 1}`;

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
                            data[6] = `=E1*F1`;
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
                            nestedHeaders: [
                                [
                                    {
                                        title: '',
                                        colspan: '5',
                                    },
                                    {
                                        title: i18n.t('static.inventory.expectedStock'),
                                        colspan: '2'
                                    },
                                    {
                                        title: i18n.t('static.inventory.manualAdjustment'),
                                        colspan: '2'
                                    }, {
                                        title: i18n.t('static.inventory.actualStock'),
                                        colspan: '2'
                                    },
                                    {
                                        title: '',
                                        colspan: '3',
                                    }
                                ],
                            ],
                            columnDrag: true,
                            colWidths: [80, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 200],
                            columns: [
                                { title: i18n.t('static.report.month'), type: 'text', readOnly: true },
                                { title: i18n.t('static.region.region'), type: 'dropdown', readOnly: true, source: this.state.regionList },
                                { title: i18n.t('static.inventory.dataSource'), type: 'dropdown', source: dataSourceList },
                                { title: i18n.t('static.planningunit.countrysku'), type: 'dropdown', source: countrySKUList, readOnly: readonlyCountrySKU },
                                { title: i18n.t('static.supplyPlan.conversionUnits'), type: 'text', readOnly: true },
                                { title: i18n.t('static.supplyPlan.quantity'), type: 'text' },
                                { title: i18n.t('static.supplyPlan.planningUnitQty'), type: 'text', readOnly: true },
                                { title: i18n.t('static.supplyPlan.quantity'), type: 'text' },
                                { title: i18n.t('static.supplyPlan.planningUnitQty'), type: 'text', readOnly: true },
                                { title: i18n.t('static.supplyPlan.quantity'), type: 'text' },
                                { title: i18n.t('static.supplyPlan.planningUnitQty'), type: 'text', readOnly: true },
                                { title: i18n.t('static.program.notes'), type: 'text' },
                                { title: i18n.t('static.supplyPlan.index'), type: 'hidden', readOnly: true },
                                { title: i18n.t('static.inventory.active'), type: 'checkbox' },
                                { title: i18n.t('static.inventory.inventoryDate'), type: 'hidden' },
                                { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo') }
                            ],
                            pagination: false,
                            search: true,
                            columnSorting: true,
                            tableOverflow: true,
                            wordWrap: true,
                            allowInsertColumn: false,
                            allowManualInsertColumn: false,
                            allowDeleteRow: false,
                            allowInsertRow: false,
                            allowManualInsertRow: false,
                            editable: false,
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
                                    var cell = elInstance.getCell(`H${y + 1}`)
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(`J${y + 1}`)
                                    cell.classList.add('readonly');
                                    var cell = elInstance.getCell(`F${y + 1}`)
                                    cell.classList.add('readonly');
                                }
                            },
                            contextMenu: function (obj, x, y, e) {
                                var items = [];
                                //Add consumption batch info
                                var rowData = obj.getRowData(y)
                                if (this.state.batchNoRequired == true) {
                                    items.push({
                                        title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                        onclick: function () {
                                            document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'block';
                                            this.el = jexcel(document.getElementById("inventoryBatchInfoTable"), '');
                                            this.el.destroy();
                                            var json = [];
                                            // var elInstance=this.state.plannedPsmShipmentsEl;
                                            var rowData = obj.getRowData(y)
                                            var batchInfo = rowData[15];
                                            for (var sb = 0; sb < batchInfo.length; sb++) {
                                                var data = [];
                                                var expectedBal = "";
                                                if (batchInfo[sb].adjustmentQty != "" && batchInfo[sb].actualQty != "") {
                                                    expectedBal = batchInfo[sb].actualQty - batchInfo[sb].adjustmentQty;
                                                }
                                                data[0] = batchInfo[sb].batch.batchId;
                                                data[1] = expectedBal;
                                                data[2] = batchInfo[sb].adjustmentQty;
                                                data[3] = batchInfo[sb].actualQty;
                                                data[4] = batchInfo[sb].inventoryTransBatchInfoId;
                                                data[5] = y;
                                                json.push(data);
                                            }
                                            if (batchInfo.length == 0) {
                                                var data = [];
                                                data[0] = "";
                                                data[1] = "";
                                                data[2] = "";
                                                data[3] = "";
                                                data[4] = 0;
                                                data[5] = y;
                                                json.push(data)
                                            }
                                            var options = {
                                                data: json,
                                                columnDrag: true,
                                                colWidths: [100, 150, 290, 100],
                                                columns: [
                                                    {
                                                        title: i18n.t('static.supplyPlan.batchId'),
                                                        type: 'dropdown',
                                                        source: this.state.batchInfoList
                                                    },
                                                    {
                                                        title: i18n.t('static.inventory.expectedStock'),
                                                        type: 'number',
                                                    },
                                                    {
                                                        title: i18n.t('static.inventory.manualAdjustment'),
                                                        type: 'number',
                                                    },
                                                    {
                                                        title: i18n.t('static.inventory.actualStock'),
                                                        type: 'number',
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
                                                search: true,
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
                                                            items.push({
                                                                title: i18n.t('static.supplyPlan.addNewBatchInfo'),
                                                                onclick: function () {
                                                                    var data = [];
                                                                    data[0] = "";
                                                                    data[1] = "";
                                                                    data[2] = "";
                                                                    data[3] = "";
                                                                    data[4] = 0;
                                                                    data[5] = y;
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
                                        var expectedBalPlanningUnitQty = (obj.getCell(`G${parseInt(json.length)}`)).innerHTML;
                                        var adjustedPlanningUnitQty = (obj.getCell(`I${parseInt(json.length)}`)).innerHTML;
                                        var balance = parseInt(expectedBalPlanningUnitQty) + parseInt(adjustedPlanningUnitQty);
                                        if (balance > 0) {
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
                                                    data[6] = `=E${(json.length) + 1}*F${(json.length) + 1}`;
                                                    data[7] = "";
                                                    data[8] = `=E${(json.length) + 1}*H${(json.length) + 1}`;
                                                    data[9] = "";
                                                    data[10] = `=E${(json.length) + 1}*J${(json.length) + 1}`;
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
        jExcelLoadedFunction(instance);
    }


    loadedBatchInfoInventory = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
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
        var budgetList = [];
        var dataSourceList = this.state.dataSourceList;
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
                        if (papuResult[k].planningUnit.id == planningUnitId) {
                            var papuJson = {
                                name: getLabelText(papuResult[k].procurementAgent.label, this.state.lang),
                                id: papuResult[k].procurementAgent.id
                            }
                            procurementAgentList.push(papuJson);
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
                        paResult = paRequest.result;
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
                            data[3] = `=C${j + 1}`;
                            data[4] = "";
                            data[5] = "";
                            data[6] = suggestedShipmentList[j].shipmentMode;
                            data[7] = "";
                            data[8] = orderedDate;
                            data[9] = "";
                            data[10] = isEmergencyOrder;
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
                            data[6] = "";
                            data[7] = "";
                            data[8] = orderedDate;
                            data[9] = "";
                            data[10] = isEmergencyOrder;
                            suggestedShipmentsArr[0] = data;
                        }
                        var options = {
                            data: suggestedShipmentsArr,
                            colWidths: [150, 200, 80, 80, 150, 350, 150, 150, 80, 100],
                            columns: [
                                { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.shipmentStatus') },
                                { type: 'text', readOnly: true, title: i18n.t('static.planningunit.planningunit') },
                                { type: 'numeric', readOnly: readOnlySuggestedOrderQty, title: i18n.t('static.supplyPlan.suggestedOrderQty') },
                                { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustesOrderQty') },
                                { type: 'dropdown', source: dataSourceList, title: i18n.t('static.datasource.datasource') },
                                { type: 'dropdown', source: procurementAgentList, title: i18n.t('static.procurementagent.procurementagent') },
                                { type: 'dropdown', source: ['Sea', 'Air'], title: i18n.t('static.supplyPlan.shipmentMode') },
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
                            allowInsertRow: false,
                            allowManualInsertRow: false,
                            editable: false,
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
                                                data[3] = `=C${json.length + 1}`;
                                                data[4] = "";
                                                data[5] = "";
                                                data[6] = "";
                                                data[7] = "";
                                                data[8] = orderedDate;
                                                data[9] = "";
                                                data[10] = 0;
                                                obj.insertRow(data);
                                                var cell = obj.getCell(`C${json.length + 1}`)
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
    }

    loadedSuggestedShipments = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        elInstance.hideIndex(0);
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

        let bar1 = {}
        if (this.state.jsonArrForGraph.length > 0)
            bar1 = {

                labels: [...new Set(this.state.jsonArrForGraph.map(ele => (ele.month)))],
                datasets: [
                    {
                        label: 'Planned',
                        yAxisID: 'A',
                        stack: 1,
                        backgroundColor: '#85C1E9',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.planned)),
                    }, {
                        label: 'Shipped',
                        yAxisID: 'A',
                        stack: 1,
                        backgroundColor: '#2874A6',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.shipped)),
                    },
                    {
                        label: 'Delivered',
                        yAxisID: 'A',
                        stack: 1,
                        backgroundColor: '#1B4F72',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.delivered)),
                    }, {
                        label: 'Ordered',
                        yAxisID: 'A',
                        stack: 1,
                        backgroundColor: '#3498DB',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.approved)),
                    }, {
                        label: "Stock",
                        yAxisID: 'A',
                        stack: 2,
                        type: 'line',
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
                        label: "Consumption",
                        yAxisID: 'A',
                        type: 'line',
                        stack: 3,
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
                        label: "Months Of Stock",
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
                    }
                ]
            };

        return (
            <div className="animated fadeIn">


                <div id="supplyPlanTableId" style={{ display: 'block' }}>
                    <Row className="float-right">
                        <div className="col-md-12">
                            <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => this.exportPDF()} />
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
                                <th ></th>
                                {
                                    this.state.monthsArray.map(item => (
                                        <th style={{ padding: '10px 0 !important' }}>{item.month}</th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td align="left">{i18n.t('static.supplyPlan.openingBalance')}</td>
                                {
                                    this.state.openingBalanceArray.map(item1 => (
                                        <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                    ))
                                }
                            </tr>
                            <tr className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '')}>
                                <td align="left">{i18n.t('static.dashboard.consumption')}</td>
                                {
                                    this.state.consumptionTotalData.map(item1 => (
                                        <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                    ))
                                }
                            </tr>
                            <tr>
                                <td align="left">{i18n.t('static.supplyPlan.suggestedShipments')}</td>
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
                                                return (<td align="right"></td>)
                                            } else {
                                                return (<td></td>)
                                            }
                                        }
                                    })
                                }
                            </tr>
                            <tr>
                                <td align="left">{i18n.t('static.supplyPlan.psmShipments')}</td>
                                {
                                    this.state.psmShipmentsTotalData.map(item1 => {
                                        if (item1.toString() != "") {
                                            if (item1.accountFlag == true) {
                                                if (item1.isEmergencyOrder == 1) {
                                                    return (<td align="right" bgcolor='red' className="hoverTd" onClick={() => this.toggleLarge('psmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('psmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                }
                                            } else {
                                                if (item1.isEmergencyOrder == 1) {
                                                    return (<td align="right" bgcolor='#FA8072' className="hoverTd" onClick={() => this.toggleLarge('psmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" className="hoverTd" bgcolor='#696969' onClick={() => this.toggleLarge('psmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                }
                                            }
                                        } else {
                                            return (<td align="right" >{item1}</td>)
                                        }
                                    })
                                }
                            </tr>

                            <tr>
                                <td align="left">{i18n.t('static.supplyPlan.artmisShipments')}</td>
                                {
                                    this.state.artmisShipmentsTotalData.map(item1 => {
                                        if (item1.toString() != "") {
                                            if (item1.accountFlag == true) {
                                                if (item1.isEmergencyOrder == 1) {
                                                    return (<td align="right" bgcolor='red' className="hoverTd" onClick={() => this.toggleLarge('artmisShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('artmisShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                }
                                            } else {
                                                if (item1.isEmergencyOrder == 1) {
                                                    return (<td align="right" bgcolor='#FA8072' className="hoverTd" onClick={() => this.toggleLarge('artmisShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" bgcolor='#696969' className="hoverTd" onClick={() => this.toggleLarge('artmisShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                }
                                            }
                                        } else {
                                            return (<td align="right" > {item1}</td>)
                                        }
                                    })
                                }
                            </tr>

                            <tr>
                                <td align="left">{i18n.t('static.supplyPlan.nonPsmShipments')}</td>
                                {
                                    this.state.nonPsmShipmentsTotalData.map(item1 => {
                                        if (item1.toString() != "") {
                                            if (item1.accountFlag == true) {
                                                if (item1.isEmergencyOrder == 1) {
                                                    return (<td align="right" bgcolor='red' onClick={() => this.toggleLarge('nonPsmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} className="hoverTd"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" onClick={() => this.toggleLarge('nonPsmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} className="hoverTd"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                }
                                            } else {
                                                if (item1.isEmergencyOrder == 1) {
                                                    return (<td align="right" onClick={() => this.toggleLarge('nonPsmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} bgcolor='#FA8072' className="hoverTd"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                } else {
                                                    return (<td align="right" onClick={() => this.toggleLarge('nonPsmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} bgcolor='#696969' className="hoverTd" ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                }

                                            }
                                        } else {
                                            return (<td align="right" >{item1}</td>)
                                        }
                                    })
                                }
                            </tr>

                            <tr className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '')}>
                                <td align="left">{i18n.t('static.supplyPlan.adjustments')}</td>
                                {
                                    this.state.inventoryTotalData.map(item1 => (
                                        <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                    ))
                                }
                            </tr>
                            <tr>
                                <td align="left">{i18n.t('static.supplyPlan.unmetDemandStr')}</td>
                                {
                                    this.state.unmetDemand.map(item1 => (
                                        <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                    ))
                                }
                            </tr>
                            <tr>
                                <td align="left">{i18n.t('static.supplyPlan.stockBalance')}</td>
                                {
                                    this.state.closingBalanceArray.map(item1 => (
                                        <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                    ))
                                }
                            </tr>
                            <tr>
                                <td align="left">{i18n.t('static.supplyPlan.amc')}</td>
                                {
                                    this.state.amcTotalData.map(item1 => (
                                        <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                    ))
                                }
                            </tr>
                            <tr>
                                <td align="left">{i18n.t('static.supplyPlan.monthsOfStock')}</td>
                                {
                                    this.state.monthsOfStockArray.map(item1 => (
                                        <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                    ))
                                }
                            </tr>
                            <tr>
                                <td align="left">{i18n.t('static.supplyPlan.minStock')}</td>
                                {
                                    this.state.minStockArray.map(item1 => (
                                        <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                    ))
                                }
                            </tr>
                            <tr>
                                <td align="left">{i18n.t('static.supplyPlan.maxStock')}</td>
                                {
                                    this.state.maxStockArray.map(item1 => (
                                        <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                    ))
                                }
                            </tr>
                        </tbody>
                    </Table>
                </div>

                {/* Consumption modal */}
                <Modal isOpen={this.state.consumption}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge('Consumption')} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.dashboard.consumptiondetails')}</strong>
                        <ul class="legendcommitversion">
                            <li><span class="purplelegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.forecastedConsumption')}</span></li>
                            <li><span class=" blacklegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.actualConsumption')} </span></li>

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
                        <h6 className="red">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchError}</h6>
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
                                                        var lastActualConsumptionDate = moment(this.state.lastActualConsumptionDate).format("YYYY-MM");
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
                        <h6 className="red">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchError}</h6>
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
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('SuggestedShipments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
                {/* Suggested shipments modal */}
                {/* PSM Shipments modal */}
                <Modal isOpen={this.state.psmShipments}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge('psmShipments')} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.supplyPlan.psmShipmentsDetails')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red">{this.state.shipmentDuplicateError || this.state.shipmentBatchError || this.state.shipmentBudgetError || this.state.shipmentError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentsDetailsTable" />
                        </div>
                        <h6 className="red">{this.state.noFundsBudgetError || this.state.budgetError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentBudgetTable"></div>
                        </div>

                        <div id="showButtonsDiv" style={{ display: 'none' }}>
                        </div>
                        <h6 className="red">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentBatchInfoTable"></div>
                        </div>

                        <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('psmShipments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
                {/* PSM Shipments modal */}
                {/* artmis shipments modal */}
                <Modal isOpen={this.state.artmisShipments}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge('artmisShipments')} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.supplyPlan.artmisShipmentsDetails')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red">{this.state.shipmentDuplicateError || this.state.shipmentBatchError || this.state.shipmentError || this.state.shipmentBudgetError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentsDetailsTable" />
                        </div>
                        <h6 className="red">{this.state.noFundsBudgetError || this.state.budgetError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentBudgetTable"></div>
                        </div>

                        <div id="showButtonsDiv" style={{ display: 'none' }}>
                        </div>

                        <h6 className="red">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentBatchInfoTable"></div>
                        </div>

                        <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('artmisShipments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
                {/* artmis shipments modal */}

                {/* Non PSM Shipments modal */}
                <Modal isOpen={this.state.nonPsmShipments}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge('nonPsmShipments')} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.supplyPlan.nonPsmShipmentsDetails')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red">{this.state.shipmentDuplicateError || this.state.shipmentBatchError || this.state.shipmentBudgetError || this.state.shipmentError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentsDetailsTable" />
                        </div>
                        <h6 className="red">{this.state.noFundsBudgetError || this.state.budgetError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentBudgetTable"></div>
                        </div>

                        <div id="showButtonsDiv" style={{ display: 'none' }}>
                        </div>
                        <h6 className="red">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentBatchInfoTable"></div>
                        </div>

                        <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('nonPsmShipments')}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
                {/* Non PSM Shipments modal */}
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

        )
    }

    shipmentsDetailsClicked(supplyPlanType, startDate, endDate) {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programId = document.getElementById("programId").value;
        var procurementAgentList = [];
        var procurementAgentListAll = [];
        var fundingSourceList = [];
        var budgetList = [];
        var dataSourceList = this.state.dataSourceList;
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
                var airFreightPerc = programJson.airFreightPerc;
                var seaFreightPerc = programJson.seaFreightPerc;

                var batchInfoListAll = programJson.batchInfoList;
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
                        if (papuResult[k].planningUnit.id == planningUnitId) {
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
                            if (fsResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                                var fsJson = {
                                    name: getLabelText(fsResult[k].label, this.state.lang),
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
                            procurementUnitResult = procurementUnitRequest.result;
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
                                    if (supplierResult[k].realm.id == programJson.realmCountry.realm.realmId) {
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
                                        currencyResult = currencyRequest.result;
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
                                                if (bResult[k].program.id == programJson.programId) {
                                                    var bJson = {
                                                        name: getLabelText(bResult[k].label, this.state.lang),
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
                                            if (supplyPlanType == 'psmShipments') {
                                                shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.procurementAgent.id == PSM_PROCUREMENT_AGENT_ID && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS);
                                            } else if (supplyPlanType == 'artmisShipments') {
                                                shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS);
                                            } else if (supplyPlanType == 'nonPsmShipments') {
                                                shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.procurementAgent.id != PSM_PROCUREMENT_AGENT_ID && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS);
                                            }

                                            var procurementUnitType = 'hidden';
                                            if (supplyPlanType == 'nonPsmShipments') {
                                                procurementUnitType = 'dropdown';
                                            }

                                            var tableEditableBasedOnSupplyPlan = true;
                                            if (supplyPlanType == 'artmisShipments') {
                                                tableEditableBasedOnSupplyPlan = false;
                                            }

                                            this.el = jexcel(document.getElementById("shipmentsDetailsTable"), '');
                                            this.el.destroy();

                                            this.el = jexcel(document.getElementById("shipmentBudgetTable"), '');
                                            this.el.destroy();

                                            var colArr = ['A', 'F'];
                                            var data = [];
                                            var shipmentsArr = [];
                                            for (var i = 0; i < shipmentList.length; i++) {
                                                var procurementAgentPlanningUnit = procurementAgentListAll.filter(p => p.procurementAgent.id == shipmentList[i].procurementAgent.id)[0];
                                                var moq = procurementAgentPlanningUnit.moq;
                                                var pricePerUnit = procurementAgentPlanningUnit.catalogPrice;
                                                if (shipmentList[i].procurementUnit.id != 0) {
                                                    var procurementUnit = procurementUnitListAll.filter(p => p.procurementUnit.id == shipmentList[i].procurementUnit.id && p.procurementAgent.id == shipmentList[i].procurementAgent.id)[0];
                                                    pricePerUnit = procurementUnit.vendorPrice;
                                                }
                                                var budgetAmount = 0;
                                                var totalShipmentQty = 0;
                                                var budgetJson = [];
                                                var shipmentBudgetList = shipmentList[i].shipmentBudgetList;
                                                for (var sb = 0; sb < shipmentBudgetList.length; sb++) {
                                                    budgetAmount += (shipmentBudgetList[sb].budgetAmt * shipmentBudgetList[sb].conversionRateToUsd);
                                                    budgetJson.push(shipmentBudgetList[sb]);
                                                }

                                                var shipmentBatchInfoList = shipmentList[i].batchInfoList;
                                                for (var sb = 0; sb < shipmentBatchInfoList.length; sb++) {
                                                    totalShipmentQty += parseInt(shipmentBatchInfoList[sb].shipmentQty);
                                                }
                                                var userQty = "";
                                                if (procurementAgentPlanningUnit.unitsPerPallet != 0 && procurementAgentPlanningUnit.unitsPerContainer != 0) {
                                                    userQty = shipmentList[i].shipmentQty;
                                                }
                                                budgetAmount = budgetAmount.toFixed(2);
                                                data[0] = shipmentList[i].expectedDeliveryDate; // A
                                                data[1] = shipmentList[i].shipmentStatus.id; //B
                                                data[2] = shipmentList[i].orderNo; //C
                                                data[3] = shipmentList[i].primeLineNo; //D
                                                data[4] = shipmentList[i].dataSource.id; // E
                                                data[5] = shipmentList[i].procurementAgent.id; //F
                                                data[6] = this.state.planningUnitName; //G
                                                data[7] = shipmentList[i].suggestedQty; //H
                                                data[8] = moq; //I
                                                data[9] = `=ROUND(IF(AB${i + 1}!=0,IF(H${i + 1}>I${i + 1},H${i + 1}/AB${i + 1},I${i + 1}/AB${i + 1}),0),2)`;
                                                data[10] = `=ROUND(IF(AC${i + 1}!=0,IF(H${i + 1}>I${i + 1},H${i + 1}/AC${i + 1},I${i + 1}/AC${i + 1}),0),2)`;
                                                data[11] = ""; // Order based on
                                                data[12] = ""; // Rounding option
                                                data[13] = userQty; // User Qty
                                                data[14] = `=IF(L${i + 1}==3,
   
                                    IF(M${i + 1}==1,
                                            CEILING(I${i + 1},1),
                                            FLOOR(I${i + 1},1)
                                    )
                            ,
                            IF(L${i + 1}==4,
                                    IF(NOT(ISBLANK(N${i + 1})),
                                            IF(M${i + 1}==1,
                                                    CEILING(N${i + 1}/AB${i + 1},1)*AB${i + 1},
                                                    FLOOR(N${i + 1}/AB${i + 1},1)*AB${i + 1}
                                            ),
                                            IF(M${i + 1}==1,
                                                    CEILING(J${i + 1},1)*AB${i + 1},
                                                    FLOOR(J${i + 1},1)*AB${i + 1}
                                            )
                                    ),
                                    IF(L${i + 1}==1,
                                            IF(NOT(ISBLANK(N${i + 1})),
                                                    IF(M${i + 1}==1,
                                                    CEILING(N${i + 1}/AC${i + 1},1)*AC${i + 1},
                                                    FLOOR(N${i + 1}/AC${i + 1},1)*AC${i + 1}
                                            ),
                                                    IF(M${i + 1}==1,
                                                            CEILING(K${i + 1},1)*AC${i + 1},
                                                            FLOOR(K${i + 1},1)*AC${i + 1}
                                                    )
                                            ),
                                            IF(NOT(ISBLANK(N${i + 1})),
                                                    IF(M${i + 1}==1,
                                                            CEILING(N${i + 1},1),
                                                            FLOOR(N${i + 1},1)
                                                    ),
                                                    IF(M${i + 1}==1,
                                                            CEILING(H${i + 1},1),
                                                            FLOOR(H${i + 1},1)
                                                    )
                                            )
                                    )
                            )
                     )`;
                                                data[15] = `=ROUND(IF(AB${i + 1}!=0,O${i + 1}/AB${i + 1},0),2)`;
                                                data[16] = `=ROUND(IF(AC${i + 1}!=0,O${i + 1}/AC${i + 1},0),2)`;
                                                data[17] = shipmentList[i].rate;//Manual price
                                                data[18] = shipmentList[i].procurementUnit.id;
                                                data[19] = shipmentList[i].supplier.id;
                                                data[20] = pricePerUnit;
                                                data[21] = `=ROUND(IF(AND(NOT(ISBLANK(R${i + 1})),(R${i + 1} != 0)),R${i + 1},U${i + 1})*O${i + 1},2)`; //Amount
                                                data[22] = shipmentList[i].shipmentMode;//Shipment method
                                                data[23] = shipmentList[i].freightCost;// Freight Cost
                                                data[24] = `=ROUND(IF(W${i + 1}=="Sea",(V${i + 1}*AE${i + 1})/100,(V${i + 1}*AD${i + 1})/100),2)`;// Default frieght cost
                                                data[25] = `=ROUND(V${i + 1}+IF(AND(NOT(ISBLANK(X${i + 1})),(X${i + 1}!= 0)),X${i + 1},Y${i + 1}),2)`; // Final Amount
                                                data[26] = shipmentList[i].notes;//Notes
                                                data[27] = procurementAgentPlanningUnit.unitsPerPallet;
                                                data[28] = procurementAgentPlanningUnit.unitsPerContainer;
                                                data[29] = airFreightPerc;
                                                data[30] = seaFreightPerc;
                                                data[31] = budgetAmount;
                                                data[32] = budgetJson;
                                                var index;
                                                if (shipmentList[i].shipmentId != 0) {
                                                    index = shipmentListUnFiltered.findIndex(c => c.shipmentId == shipmentList[i].shipmentId);
                                                } else {
                                                    index = shipmentListUnFiltered.findIndex(c => c.orderedDate == shipmentList[i].orderedDate && c.procurementAgent.id == shipmentList[i].procurementAgent.id && c.erpFlag == shipmentList[i].erpFlag && c.expectedDeliveryDate == shipmentList[i].expectedDeliveryDate && c.suggestedOrderQty == shipmentList[i].suggestedOrderQty && c.shipmentStatus.id == shipmentList[i].shipmentStatus.id);
                                                }
                                                data[33] = index;
                                                data[34] = ""// Procurment unit price
                                                data[35] = shipmentList[i].shipmentStatus.id;
                                                data[36] = supplyPlanType;
                                                data[37] = shipmentList[i].active;
                                                data[38] = shipmentList[i].batchInfoList;
                                                data[39] = totalShipmentQty;
                                                shipmentsArr.push(data);
                                            }
                                            var options = {
                                                data: shipmentsArr,
                                                colWidths: [100, 100, 100, 100, 120, 120, 200, 80, 80, 80, 80, 100, 100, 80, 80, 80, 80, 80, 250, 120, 80, 100, 80, 80, 80, 100],
                                                columns: [
                                                    { type: 'calendar', options: { format: 'MM-DD-YYYY', validRange: [moment(Date.now()).format("YYYY-MM-DD"), null] }, title: i18n.t('static.supplyPlan.expectedDeliveryDate') },
                                                    { type: 'dropdown', title: i18n.t('static.supplyPlan.shipmentStatus'), source: shipmentStatusList, filter: this.shipmentStatusDropdownFilter },
                                                    { type: 'text', title: i18n.t('static.supplyPlan.orderNo') },
                                                    { type: 'text', title: i18n.t('static.supplyPlan.primeLineNo') },
                                                    { type: 'dropdown', title: i18n.t('static.datasource.datasource'), source: dataSourceList },
                                                    { type: 'dropdown', title: i18n.t('static.procurementagent.procurementagent'), source: procurementAgentList },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.planningunit.planningunit') },
                                                    { type: 'number', readOnly: true, title: i18n.t('static.supplyPlan.suggestedOrderQty') },
                                                    { type: 'number', readOnly: true, title: i18n.t('static.procurementAgentPlanningUnit.moq') },
                                                    { type: 'number', readOnly: true, title: i18n.t('static.supplyPlan.noOfPallets') },
                                                    { type: 'number', readOnly: true, title: i18n.t('static.supplyPlan.noOfContainers') },
                                                    { type: 'dropdown', title: i18n.t('static.supplyPlan.orderBasedOn'), source: [{ id: 1, name: i18n.t('static.supplyPlan.container') }, { id: 2, name: i18n.t('static.supplyPlan.suggestedOrderQty') }, { id: 3, name: i18n.t('static.procurementAgentPlanningUnit.moq') }, { id: 4, name: i18n.t('static.supplyPlan.pallet') }] },
                                                    { type: 'dropdown', title: i18n.t('static.supplyPlan.roundingOption'), source: [{ id: 1, name: i18n.t('static.supplyPlan.roundUp') }, { id: 2, name: i18n.t('static.supplyPlan.roundDown') }] },
                                                    { type: 'text', title: i18n.t('static.supplyPlan.userQty') },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.adjustesOrderQty') },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.adjustedPallets') },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.adjustedContainers') },
                                                    { type: 'text', title: i18n.t("static.supplyPlan.userPrice") },
                                                    { type: procurementUnitType, title: i18n.t('static.procurementUnit.procurementUnit'), source: procurementUnitList, filter: this.procurementUnitDropdownFilter },
                                                    { type: procurementUnitType, title: i18n.t('static.procurementUnit.supplier'), source: supplierList },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.pricePerPlanningUnit') },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.amountInUSD') },
                                                    { type: 'dropdown', title: i18n.t("static.supplyPlan.shipmentMode"), source: ['Sea', 'Air'] },
                                                    { type: 'text', title: i18n.t('static.supplyPlan.userFreight') },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.defaultFreight') },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.totalAmount') },
                                                    { type: 'text', title: i18n.t('static.program.notes') },
                                                    { type: 'hidden', title: i18n.t('static.procurementAgentPlanningUnit.unitPerPallet') },
                                                    { type: 'hidden', title: i18n.t('static.procurementUnit.unitsPerContainer') },
                                                    { type: 'hidden', title: i18n.t('static.realmcountry.airFreightPercentage') },
                                                    { type: 'hidden', title: i18n.t('static.realmcountry.seaFreightPercentage') },
                                                    { type: 'hidden', title: i18n.t('static.budget.budgetamount') },
                                                    { type: 'hidden', title: i18n.t('static.supplyPlan.budgetArray') },
                                                    { type: 'hidden', title: i18n.t('static.supplyPlan.index') },
                                                    { type: 'hidden', title: i18n.t('static.supplyPlan.pricePerProcurementUnit') },
                                                    { type: 'hidden', title: i18n.t('static.supplyPlan.shipmentStatus') },
                                                    { type: 'hidden', title: i18n.t('static.supplyPlan.supplyPlanType') },
                                                    { type: 'checkbox', title: i18n.t('static.common.active') },
                                                    { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo') },
                                                    { type: 'hidden', title: i18n.t('static.supplyPlan.totalQtyBatchInfo') }
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
                                                editable: false,
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
                                                        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
                                                        'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD',
                                                        'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
                                                    var rowData = elInstance.getRowData(y);
                                                    var unitsPerPalletForUpdate = rowData[27];
                                                    var unitsPerContainerForUpdate = rowData[28];
                                                    var shipmentStatus = rowData[35];
                                                    if (shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                                                        for (var i = 0; i < colArr.length; i++) {
                                                            var cell = elInstance.getCell(`${colArr[i]}${y + 1}`)
                                                            cell.classList.add('readonly');
                                                        }
                                                    } else {
                                                        if (unitsPerPalletForUpdate == 0 || unitsPerContainerForUpdate == 0) {
                                                            var cell = elInstance.getCell(`J${y + 1}`)
                                                            cell.classList.add('readonly');
                                                            var cell = elInstance.getCell(`K${y + 1}`)
                                                            cell.classList.add('readonly');
                                                            var cell = elInstance.getCell(`L${y + 1}`)
                                                            cell.classList.add('readonly');
                                                            var cell = elInstance.getCell(`M${y + 1}`)
                                                            cell.classList.add('readonly');
                                                            var cell = elInstance.getCell(`N${y + 1}`)
                                                            cell.classList.add('readonly');
                                                        } else {
                                                            var cell = elInstance.getCell(`J${y + 1}`)
                                                            cell.classList.remove('readonly');
                                                            var cell = elInstance.getCell(`K${y + 1}`)
                                                            cell.classList.remove('readonly');
                                                            var cell = elInstance.getCell(`L${y + 1}`)
                                                            cell.classList.remove('readonly');
                                                            var cell = elInstance.getCell(`M${y + 1}`)
                                                            cell.classList.remove('readonly');
                                                            var cell = elInstance.getCell(`N${y + 1}`)
                                                            cell.classList.remove('readonly');
                                                        }
                                                    }
                                                },
                                                contextMenu: function (obj, x, y, e) {
                                                    var items = [];

                                                    // Add shipment batch info
                                                    var rowData = obj.getRowData(y);
                                                    var readOnlyBatchInfo = false;
                                                    if (rowData[36] == 'nonPsmShipments' && rowData[1] != DELIVERED_SHIPMENT_STATUS) {
                                                        readOnlyBatchInfo = true
                                                    }
                                                    if ((rowData[1] == DELIVERED_SHIPMENT_STATUS || rowData[1] == SHIPPED_SHIPMENT_STATUS || rowData[1] == ARRIVED_SHIPMENT_STATUS) && this.state.batchNoRequired == true) {
                                                        items.push({
                                                            title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                                            onclick: function () {
                                                                document.getElementById("showShipmentBatchInfoButtonsDiv").style.display = 'block';
                                                                this.el = jexcel(document.getElementById("shipmentBatchInfoTable"), '');
                                                                this.el.destroy();
                                                                var json = [];
                                                                // var elInstance=this.state.plannedPsmShipmentsEl;
                                                                var rowData = obj.getRowData(y)
                                                                var batchInfo = rowData[38];
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
                                                                    data[1] = "";
                                                                    data[2] = ""
                                                                    data[3] = 0;
                                                                    data[4] = y;
                                                                    data[5] = -1;
                                                                    json.push(data)
                                                                }
                                                                var options = {
                                                                    data: json,
                                                                    columnDrag: true,
                                                                    colWidths: [100, 150, 290, 100],
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
                                                                            type: 'number',
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
                                                                    search: true,
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
                                                                                        data[1] = "";
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


                                                    //Add Shipment Budget
                                                    items.push({
                                                        title: i18n.t('static.supplyPlan.addOrListBudget'),
                                                        onclick: function () {
                                                            document.getElementById("showButtonsDiv").style.display = 'block';
                                                            this.el = jexcel(document.getElementById("shipmentBudgetTable"), '');
                                                            this.el.destroy();
                                                            var json = [];
                                                            // var elInstance=this.state.plannedPsmShipmentsEl;
                                                            var rowData = obj.getRowData(y);
                                                            var shipmentStatus = rowData[35];
                                                            var supplyPlanType = rowData[36];
                                                            if (shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                                                                tableEditableBasedOnSupplyPlan = false;
                                                            } else if (shipmentStatus >= SUBMITTED_SHIPMENT_STATUS && supplyPlanType == 'psmShipments' && shipmentStatus != ON_HOLD_SHIPMENT_STATUS) {
                                                                tableEditableBasedOnSupplyPlan = false
                                                            }
                                                            var shipmentBudget = rowData[32];
                                                            for (var sb = 0; sb < shipmentBudget.length; sb++) {
                                                                var data = [];
                                                                data[0] = shipmentBudget[sb].shipmentBudgetId;
                                                                data[1] = shipmentBudget[sb].budget.fundingSource.id;
                                                                data[2] = shipmentBudget[sb].budget.id;
                                                                data[3] = shipmentBudget[sb].budgetAmt;
                                                                data[4] = shipmentBudget[sb].currency.currencyId;
                                                                data[5] = shipmentBudget[sb].conversionRateToUsd;
                                                                data[6] = y;
                                                                json.push(data);
                                                            }
                                                            if (shipmentBudget.length == 0) {
                                                                var data = [];
                                                                data[0] = "";
                                                                data[1] = "";
                                                                data[2] = "";
                                                                data[3] = "";
                                                                data[4] = ""
                                                                data[5] = ""
                                                                data[6] = y;
                                                                json = [data]
                                                            }
                                                            var options = {
                                                                data: json,
                                                                columnDrag: true,
                                                                colWidths: [100, 150, 290, 100, 170, 100],
                                                                columns: [
                                                                    {
                                                                        title: i18n.t('static.supplyPlan.shipmentBudgetId'),
                                                                        type: 'hidden',
                                                                    },
                                                                    {
                                                                        title: i18n.t('static.budget.fundingsource'),
                                                                        type: 'dropdown',
                                                                        source: fundingSourceList
                                                                    },
                                                                    {
                                                                        title: i18n.t('static.dashboard.budget'),
                                                                        type: 'dropdown',
                                                                        source: budgetList,
                                                                        filter: this.budgetDropdownFilter
                                                                    },
                                                                    {
                                                                        title: i18n.t('static.budget.budgetamount'),
                                                                        type: 'number',
                                                                    },
                                                                    {
                                                                        title: i18n.t('static.country.currency'),
                                                                        type: 'dropdown',
                                                                        source: currencyList
                                                                    },
                                                                    {
                                                                        title: i18n.t('static.currency.conversionrateusd'),
                                                                        type: 'number',
                                                                        readOnly: true
                                                                    },
                                                                    {
                                                                        title: i18n.t('static.supplyPlan.rowNumber'),
                                                                        type: 'hidden'
                                                                    }
                                                                ],
                                                                pagination: false,
                                                                search: true,
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
                                                                text: {
                                                                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                                    show: '',
                                                                    entries: '',
                                                                },
                                                                onload: this.loadedBudget,
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
                                                                                title: i18n.t('static.supplyPlan.addBudget'),
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
                                                            elVar = jexcel(document.getElementById("shipmentBudgetTable"), options);
                                                            this.el = elVar;
                                                            this.setState({ shipmentBudgetTableEl: elVar });
                                                        }.bind(this)
                                                        // this.setState({ shipmentBudgetTableEl: elVar });
                                                    });
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
    }

    loadedBatchInfoShipment = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    loadedShipments = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        elInstance.hideIndex(0);
    }

    loadedBudget = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        elInstance.hideIndex(0);
    }
}