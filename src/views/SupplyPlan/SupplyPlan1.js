import React from "react";

import {
    Card, CardBody, CardHeader,
    Col, Table, Modal, ModalBody, ModalFooter, ModalHeader, Button,
    Input, InputGroup, Label, FormGroup, Form, Row, Nav, NavItem, NavLink, TabPane, TabContent
} from 'reactstrap';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';
import { Menu, Item } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';
import { contextMenu } from 'react-contexify';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN, PLUS_MINUS_MONTHS_FOR_AMC_IN_SUPPLY_PLAN, MONTHS_IN_PAST_FOR_AMC, MONTHS_IN_FUTURE_FOR_AMC, DEFAULT_MIN_MONTHS_OF_STOCK, CANCELLED_SHIPMENT_STATUS, PSM_PROCUREMENT_AGENT_ID, PLANNED_SHIPMENT_STATUS, DRAFT_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, NO_OF_MONTHS_ON_LEFT_CLICKED, ON_HOLD_SHIPMENT_STATUS, NO_OF_MONTHS_ON_RIGHT_CLICKED, DEFAULT_MAX_MONTHS_OF_STOCK, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, INVENTORY_DATA_SOURCE_TYPE, SHIPMENT_DATA_SOURCE_TYPE, INDEXED_DB_VERSION, INDEXED_DB_NAME } from '../../Constants.js'
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
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'
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
                fontColor: 'black'
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
            expiredStock: [],
            versionId: ""

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


        this.budgetChanged = this.budgetChanged.bind(this);
        this.checkBudgetValidation = this.checkBudgetValidation.bind(this);
        this.shipmentStatusDropdownFilter = this.shipmentStatusDropdownFilter.bind(this);
        this.procurementUnitDropdownFilter = this.procurementUnitDropdownFilter.bind(this);
        this.shipmentsDetailsClicked = this.shipmentsDetailsClicked.bind(this);
        this.shipmentChanged = this.shipmentChanged.bind(this);
        this.saveShipments = this.saveShipments.bind(this);
        this.checkValidationForShipments = this.checkValidationForShipments.bind(this);

        this.budgetDropdownFilter = this.budgetDropdownFilter.bind(this);
    }


    toggle = (tabPane, tab) => {
        const newArray = this.state.activeTab.slice()
        newArray[tabPane] = tab
        this.setState({
            activeTab: newArray,
        });
    }
    tabPane = () => {
        const MyMenu = (props) => (
            <Menu id='menu_id'>
                <Item disabled>Account for Shipment</Item>
                <Item onClick={this.onClick}>Do not account this Shipment</Item>
            </Menu>
        );

        const NoSkip = () => (
            <Menu id='no_skip'>
                <Item onClick={this.onClick}>Account for Shipment</Item>
                <Item disabled>Do not account this Shipment</Item>
            </Menu>
        );
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
                margin: { top: 80  ,bottom:50},
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

        let bar = {}
        if (this.state.jsonArrForGraph.length > 0)
            bar = {

                labels: [...new Set(this.state.jsonArrForGraph.map(ele => (ele.month)))],
                datasets: [
                    {
                        label: 'Planned',
                        stack: 1,
                        yAxisID: 'A',
                        backgroundColor: '#85C1E9',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.planned)),
                    }, {
                        label: 'Shipped',
                        stack: 1,
                        yAxisID: 'A',
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
                        stack: 1,
                        yAxisID: 'A',
                        backgroundColor: '#1B4F72',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.delivered)),
                    }, {
                        label: 'Ordered',
                        stack: 1,
                        yAxisID: 'A',
                        backgroundColor: '#3498DB',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: this.state.jsonArrForGraph.map((item, index) => (item.approved)),
                    }, {
                        label: "Stock",
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
                        label: "Consumption",
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
            <>
                <TabPane tabId="1">

                    <div id="supplyPlanTableId" style={{ display: this.state.display }}>
                        <Row className="float-right">
                            <div className="col-md-12">
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={pdfIcon} title="Export PDF" onClick={() => exportPDF()} />
                                <img style={{ height: '25px', width: '25px', cursor: 'pointer' }} src={csvicon} title={i18n.t('static.report.exportCsv')} onClick={() => exportCSV()} />

                            </div>
                        </Row>
                        <Row>
                            <div className="col-md-12">
                                <span className="supplyplan-larrow" onClick={this.leftClicked}> <i className="cui-arrow-left icons " > </i> Scroll to left </span>
                                <span className="supplyplan-rarrow" onClick={this.rightClicked}> Scroll to right <i className="cui-arrow-right icons" ></i> </span>
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
                                <MyMenu props />
                                <NoSkip props />
                                <tr>
                                    <td align="left"><b>{i18n.t('static.supplyPlan.openingBalance')}</b></td>
                                    {
                                        this.state.openingBalanceArray.map(item1 => (
                                            <td align="right"><b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></b></td>
                                        ))
                                    }
                                </tr>
                                <tr className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '')}>
                                    <td align="left">- {i18n.t('static.dashboard.consumption')}</td>
                                    {
                                        this.state.consumptionTotalData.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                                <tr>
                                    <td align="left"><b>+ {i18n.t('static.dashboard.shipments')}</b></td>
                                    {
                                        this.state.shipmentsTotalData.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                                <tr>
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
                                <tr>
                                    <td align="left">&emsp;&emsp;{i18n.t('static.supplyPlan.manualEntryShipments')}</td>
                                    {
                                        this.state.manualShipmentsTotalData.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                                <tr>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.delivered')}</td>
                                    {
                                        this.state.deliveredShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }
                                </tr>

                                <tr>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.shipped')}</td>
                                    {
                                        this.state.shippedShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }
                                </tr>

                                <tr>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.ordered')}</td>
                                    {
                                        this.state.orderedShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }
                                </tr>
                                <tr>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.planned')}</td>
                                    {
                                        this.state.plannedShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }
                                </tr>
                                <tr>
                                    <td align="left">&emsp;&emsp;{i18n.t('static.supplyPlan.erpShipments')}</td>
                                    {
                                        this.state.erpShipmentsTotalData.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                                <tr>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.delivered')}</td>
                                    {
                                        this.state.deliveredErpShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'deliveredErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }
                                </tr>

                                <tr>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.shipped')}</td>
                                    {
                                        this.state.shippedErpShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'shippedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }
                                </tr>

                                <tr>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.ordered')}</td>
                                    {
                                        this.state.orderedErpShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'orderedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                            } else {
                                                return (<td align="right" >{item1}</td>)
                                            }
                                        })
                                    }
                                </tr>
                                <tr>
                                    <td align="left">&emsp;&emsp;&emsp;&emsp;{i18n.t('static.supplyPlan.planned')}</td>
                                    {
                                        this.state.plannedErpShipmentsTotalData.map(item1 => {
                                            if (item1.toString() != "") {
                                                return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('shipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`, ``, 'plannedErpShipments')} ><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
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
                                    <td align="left"><b>{i18n.t('static.supplyPlan.endingBalance')}</b></td>
                                    {
                                        this.state.closingBalanceArray.map(item1 => (
                                            <td align="right"><b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></b></td>
                                        ))
                                    }
                                </tr>
                                <tr>
                                    <td align="left"><b>{i18n.t('static.supplyPlan.monthsOfStock')}</b></td>
                                    {
                                        this.state.monthsOfStockArray.map(item1 => (
                                            <td align="right"><b><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></b></td>
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
                                    <td align="left">{i18n.t('static.supplyPlan.minStockMos')}</td>
                                    {
                                        this.state.minStockMoS.map(item1 => (
                                            <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                        ))
                                    }
                                </tr>
                                <tr>
                                    <td align="left">{i18n.t('static.supplyPlan.maxStockMos')}</td>
                                    {
                                        this.state.maxStockMoS.map(item1 => (
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
                            <h6 className="red">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchError}</h6>
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
                            <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={() => this.saveShipments('shipments')}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>
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
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var programJson = {
                            name: getLabelText(JSON.parse(programNameLabel), this.state.lang) + "~v" + myResult[i].version,
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
        document.getElementById("planningUnitId").value = 0;
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
        var unallocatedConsumption = [];
        var unallocatedAdjustments = [];
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
                var monthsInPastForAMC = programJson.monthsInPastForAmc;
                var monthsInFutureForAMC = programJson.monthsInFutureForAmc;
                var shelfLife = this.state.programPlanningUnitListAll.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].shelfLife;
                this.setState({
                    shelfLife: shelfLife,
                    versionId: programJson.currentVersion.versionId
                })
                console.log("Program Json consumption List", programJson.consumptionList);
                var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                console.log("Consumption List------------->", consumptionList);
                console.log("planningUnitId", planningUnitId);
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

                console.log("Consumption total data", consumptionTotalData);

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
                            if (amcArrayForMonth.length == monthsInPastForAMC) {
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
                            if (amcArrayForMonth.length == monthsInFutureForAMC) {
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
                        var c = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate) && c.region.id == regionListFiltered[reg].id);
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

                    var erpShipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.erpFlag == true);
                    var erpTotalQty = 0;

                    var deliveredErpShipmentsQty = 0;
                    var shippedErpShipmentsQty = 0;
                    var orderedErpShipmentsQty = 0;
                    var plannedErpShipmentsQty = 0;

                    for (var j = 0; j < shipmentArr.length; j++) {
                        shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                    }
                    shipmentsTotalData.push(shipmentTotalQty);

                    for (var j = 0; j < manualShipmentArr.length; j++) {
                        manualTotalQty += parseInt((manualShipmentArr[j].shipmentQty));
                        if (manualShipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                            deliveredShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                        } else if (manualShipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                            shippedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                        } else if (manualShipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                            orderedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                        } else if (manualShipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == DRAFT_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                            plannedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                        }
                    }

                    manualShipmentsTotalData.push(manualTotalQty);

                    if ((manualShipmentArr.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                        deliveredShipmentsTotalData.push({ qty: deliveredShipmentsQty, month: m[i] })
                    } else {
                        deliveredShipmentsTotalData.push("");
                    }

                    if ((manualShipmentArr.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                        shippedShipmentsTotalData.push({ qty: shippedShipmentsQty, month: m[i] })
                    } else {
                        shippedShipmentsTotalData.push("");
                    }

                    if ((manualShipmentArr.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                        orderedShipmentsTotalData.push({ qty: orderedShipmentsQty, month: m[i] })
                    } else {
                        orderedShipmentsTotalData.push("");
                    }

                    if ((manualShipmentArr.filter(c => c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS || c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)).length > 0) {
                        plannedShipmentsTotalData.push({ qty: plannedShipmentsQty, month: m[i] })
                    } else {
                        plannedShipmentsTotalData.push("");
                    }

                    for (var j = 0; j < erpShipmentArr.length; j++) {
                        erpTotalQty += parseInt((erpShipmentArr[j].shipmentQty));
                        if (erpShipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                            deliveredErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                        } else if (erpShipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                            shippedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                        } else if (erpShipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                            orderedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                        } else if (erpShipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == DRAFT_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                            plannedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                        }
                    }

                    erpShipmentsTotalData.push(erpTotalQty);

                    if ((erpShipmentArr.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                        deliveredErpShipmentsTotalData.push({ qty: deliveredErpShipmentsQty, month: m[i] })
                    } else {
                        deliveredErpShipmentsTotalData.push("");
                    }

                    if ((erpShipmentArr.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                        shippedErpShipmentsTotalData.push({ qty: shippedErpShipmentsQty, month: m[i] })
                    } else {
                        shippedErpShipmentsTotalData.push("");
                    }

                    if ((erpShipmentArr.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                        orderedErpShipmentsTotalData.push({ qty: orderedErpShipmentsQty, month: m[i] })
                    } else {
                        orderedErpShipmentsTotalData.push("");
                    }

                    if ((erpShipmentArr.filter(c => c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS || c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS)).length > 0) {
                        plannedErpShipmentsTotalData.push({ qty: plannedErpShipmentsQty, month: m[i] })
                    } else {
                        plannedErpShipmentsTotalData.push("");
                    }
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
                    var shipmentsQtyForCB = 0;
                    if (shipmentsTotalData[i - 1] != "") {
                        shipmentsQtyForCB = shipmentsTotalData[i - 1];
                    }

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
                    var closingBalance = openingBalanceArray[i - 1] - consumptionQtyForCB + inventoryQtyForCB + shipmentsQtyForCB;
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

                // // Logic for expired stock count
                // for (var es = 0; es < TOTAL_MONTHS_TO_DISPLAY_IN_SUPPLY_PLAN; es++) {
                //     var expiredBatchNumbers = programJson.batchInfoList.filter(c => c.expiryDate <= m[es].endDate && c.expiryDate >= m[es].startDate && c.planningUnitId == document.getElementById("planningUnitId").value);
                //     var expiredStock = 0;
                //     for (var ebn = 0; ebn < expiredBatchNumbers.length; ebn++) {
                //         var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value && c.active == true);
                //         var shipmentBatchArray = [];
                //         for (var ship = 0; ship < shipmentList.length; ship++) {
                //             var batchInfoList = shipmentList[ship].batchInfoList.filter(c => c.planningUnitId == document.getElementById("planningUnitId").value);
                //             for (var bi = 0; bi < batchInfoList.length; bi++) {
                //                 shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
                //             }
                //         }
                //         var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == expiredBatchNumbers[ebn].batchNo)[0];
                //         var totalStockForBatchNumber = stockForBatchNumber.qty;
                //         console.log("Total stock batch number", totalStockForBatchNumber, "Batch number", expiredBatchNumbers[ebn].batchNo);

                //         var consumptionList = programJson.consumptionList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value && c.active == true);
                //         var consumptionBatchArray = [];
                //         for (var con = 0; con < consumptionList.length; con++) {
                //             var batchInfoList = consumptionList[con].batchInfoList;
                //             for (var bi = 0; bi < batchInfoList.length; bi++) {
                //                 consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
                //             }
                //         }
                //         var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == expiredBatchNumbers[ebn].batchNo && c.planningUnitId == document.getElementById("planningUnitId").value);
                //         var consumptionQty = 0;
                //         for (var b = 0; b < consumptionForBatchNumber.length; b++) {
                //             consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
                //         }
                //         console.log("Total consumptions batch number", consumptionQty, "Batch number", expiredBatchNumbers[ebn].batchNo);
                //         var inventoryList = programJson.inventoryList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value && c.active == true);;
                //         var inventoryBatchArray = [];
                //         for (var inv = 0; inv < inventoryList.length; inv++) {
                //             var batchInfoList = inventoryList[inv].batchInfoList.filter(c => c.planningUnitId == document.getElementById("planningUnitId").value);
                //             for (var bi = 0; bi < batchInfoList.length; bi++) {
                //                 inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
                //             }
                //         }
                //         var inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == expiredBatchNumbers[ebn].batchNo && c.planningUnitId == document.getElementById("planningUnitId").value);
                //         var adjustmentQty = 0;
                //         for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                //             adjustmentQty += parseFloat(inventoryForBatchNumber[b].qty);
                //         }

                //         console.log("Total adjustments batch number", adjustmentQty, "Batch number", expiredBatchNumbers[ebn].batchNo);
                //         var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
                //         expiredStock += parseInt(remainingBatchQty);
                //         console.log("Expired stock", expiredStock, "Batch number", expiredBatchNumbers[ebn].batchNo)
                //     }
                //     console.log("Expired stock qty", expiredStock, "Month---->", m[es].month);
                //     console.log("unallocatedConsumption", unallocatedConsumption)
                //     if (expiredStock > 0) {
                //         for (var unAlloCon = 0; unAlloCon < es; unAlloCon++) {
                //             var remainingUnAllocated = unallocatedConsumption[unAlloCon] - expiredStock;
                //             var remainingExpiredStock = expiredStock - unallocatedConsumption[unAlloCon];

                //             if (remainingExpiredStock > 0) {
                //                 expiredStock = expiredStock - unallocatedConsumption[unAlloCon];
                //             } else {
                //                 expiredStock = 0;
                //             }
                //             if (remainingUnAllocated > 0) {
                //                 unallocatedConsumption[unAlloCon] = remainingUnAllocated;
                //             }
                //         }

                //     }
                //     console.log("final Expired stock qty", expiredStock, "Month---->", m[es].month);
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
                    shipmentsTotalData: shipmentsTotalData,
                    manualShipmentsTotalData: manualShipmentsTotalData,
                    deliveredShipmentsTotalData: deliveredShipmentsTotalData,
                    shippedShipmentsTotalData:shippedShipmentsTotalData,
                    orderedShipmentsTotalData:orderedShipmentsTotalData,
                    plannedShipmentsTotalData:plannedShipmentsTotalData,

                    erpShipmentsTotalData: erpShipmentsTotalData,
                    deliveredErpShipmentsTotalData: deliveredErpShipmentsTotalData,
                    shippedErpShipmentsTotalData:shippedErpShipmentsTotalData,
                    orderedErpShipmentsTotalData:orderedErpShipmentsTotalData,
                    plannedErpShipmentsTotalData:plannedErpShipmentsTotalData,
                    consumptionFilteredArray: filteredArray,
                    consumptionTotalMonthWise: consumptionTotalMonthWise,
                    amcTotalData: amcTotalData,
                    minStockArray: minStockArray,
                    maxStockArray: maxStockArray,
                    minStockMoS: minStockMoS,
                    maxStockMoS: maxStockMoS,
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
        } else if (supplyPlanType == 'shipments') {
            this.setState({
                shipments: !this.state.shipments
            });
            this.shipmentsDetailsClicked(shipmentType, startDate, endDate);
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
                        colWidths: [80, 150, 200, 80, 80, 350, 20, 20, 100],
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
                            console.log("BatchInfo-=----------------->", batchInfo);
                            if (rowData[8] == true) {
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
                            if (rowData[8] == true) {
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
                                        console.log("Consumption QTy", consumptionQty);
                                        var consumptionBatchInfoQty = 0;
                                        for (var sb = 0; sb < batchInfo.length; sb++) {
                                            var data = [];
                                            data[0] = batchInfo[sb].batch.batchId;
                                            data[1] = batchInfo[sb].consumptionQty;
                                            data[2] = batchInfo[sb].consumptionTransBatchInfoId;
                                            data[3] = y;
                                            consumptionBatchInfoQty += parseInt(batchInfo[sb].consumptionQty);
                                            json.push(data);
                                        }
                                        if (parseInt(consumptionQty) > consumptionBatchInfoQty && batchInfo.length > 0) {
                                            var data = [];
                                            data[0] = -1;
                                            data[1] = parseInt(consumptionQty) - parseInt(consumptionBatchInfoQty);
                                            data[2] = 0;
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
                                                    source: this.state.batchInfoList,
                                                    filter: this.filterBatchInfoForExistingData
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
                                            search: true,
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
        // jExcelLoadedFunction(instance);
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
            }
        }
        if (x == 1) {
            var reg = /^[0-9\b]+$/;
            var col = ("B").concat(parseInt(y) + 1);
            value = value.toString().replaceAll("\,", "");
            if (value == "" || x == 0) {
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

                var col = ("B").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(1, y);
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
                    rowNumber = map.get("3");
                }
                var batchInfoJson;
                if (map.get("0") != -1) {
                    var batchNo = elInstance.getCell(`A${i + 1}`).innerText;
                    var filteredBatch = this.state.batchInfoListAllForConsumption.filter(c => c.batchNo == batchNo);
                    var expiryDate = filteredBatch[0].expiryDate;
                    batchInfoJson = {
                        consumptionTransBatchInfoId: map.get("2"),
                        batch: {
                            batchId: map.get("0"),
                            batchNo: elInstance.getCell(`A${i + 1}`).innerText,
                            expiryDate: expiryDate
                        },
                        consumptionQty: map.get("1").toString().replaceAll("\,", "")
                    }
                    batchInfoArray.push(batchInfoJson);
                }
                totalConsumption += parseInt(map.get("1").toString().replaceAll("\,", ""));
            }
            var consumptionInstance = this.state.consumptionEl;
            var rowData = consumptionInstance.getRowData(parseInt(rowNumber));
            consumptionInstance.setValueFromCoords(3, rowNumber, totalConsumption, true);
            rowData[10] = batchInfoArray;
            consumptionInstance.setRowData(rowNumber, rowData);
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
                c.get("8") == map.get("8")
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
                        if (map.get("6") != -1) {
                            consumptionDataList[parseInt(map.get("6"))].dataSource.id = map.get("2");
                            consumptionDataList[parseInt(map.get("6"))].consumptionQty = (map.get("3")).toString().replaceAll("\,", "");
                            consumptionDataList[parseInt(map.get("6"))].dayOfStockOut = (map.get("4")).toString().replaceAll("\,", "");
                            consumptionDataList[parseInt(map.get("6"))].notes = map.get("5");
                            consumptionDataList[parseInt(map.get("6"))].actualFlag = map.get("8");
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
                                actualFlag: map.get("8"),
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
                            var adjustmentType = "Actual";
                            if (inventoryList[j].actualQty == "" || inventoryList[j].actualQty == 0) {
                                adjustmentType = "Adjusted"
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
                            data[8] = `=E${j + 1}*H${j + 1}`; //I
                            data[9] = inventoryList[j].actualQty; //J
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
                            colWidths: [80, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 200],
                            columns: [
                                { title: i18n.t('static.report.month'), type: 'text', readOnly: true },
                                { title: i18n.t('static.region.region'), type: 'dropdown', readOnly: true, source: this.state.regionList },
                                { title: i18n.t('static.inventory.dataSource'), type: 'dropdown', source: dataSourceList },
                                { title: i18n.t('static.planningunit.countrysku'), type: 'dropdown', source: countrySKUList, readOnly: readonlyCountrySKU },
                                { title: i18n.t('static.supplyPlan.conversionUnits'), type: 'hidden', readOnly: true },
                                { title: i18n.t('static.supplyPlan.inventoryType'), type: 'dropdown', source: ['Actual', 'Adjusted'], readOnly: readonlyAdjustmentType },
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
                            search: true,
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
                                if (adjustmentType == "Actual") {
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
                                if (rowData[5] == 'Actual' || rowData[5] == 'Adjusted') {
                                    items.push({
                                        title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                        onclick: function () {
                                            document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'block';
                                            this.el = jexcel(document.getElementById("inventoryBatchInfoTable"), '');
                                            this.el.destroy();
                                            var json = [];
                                            // var elInstance=this.state.plannedPsmShipmentsEl;
                                            console.log("Y----------", y);
                                            var cell = obj.getCell(`F${parseInt(y) + 1}`)
                                            cell.classList.add('readonly');
                                            var rowData = obj.getRowData(y);
                                            var batchInfo = rowData[15];
                                            var adjustmentType = rowData[5];
                                            var columnTypeForActualStock = "";
                                            var columnTypeForAdjustedQty = "";
                                            if (adjustmentType == "Actual") {
                                                columnTypeForActualStock = "numeric";
                                                columnTypeForAdjustedQty = "hidden";
                                            } else {
                                                columnTypeForActualStock = "hidden";
                                                columnTypeForAdjustedQty = "numeric";
                                            }
                                            var inventoryQty = 0;
                                            if (adjustmentType == "Actual") {
                                                inventoryQty = (rowData[9]).toString().replaceAll("\,", "");
                                            } else {
                                                inventoryQty = (rowData[7]).toString().replaceAll("\,", "");
                                            }
                                            var inventoryBatchInfoQty = 0;
                                            for (var sb = 0; sb < batchInfo.length; sb++) {
                                                var data = [];
                                                data[0] = batchInfo[sb].batch.batchId; //A
                                                data[1] = adjustmentType; //B
                                                data[2] = batchInfo[sb].adjustmentQty; //C
                                                data[3] = batchInfo[sb].actualQty; //D
                                                data[4] = batchInfo[sb].inventoryTransBatchInfoId; //E
                                                data[5] = y; //F
                                                if (adjustmentType == "Actual") {
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
                                                data[1] = adjustmentType; //B
                                                if (adjustmentType == "Actual") {
                                                    data[2] = ""; //C
                                                    data[3] = qty; //D
                                                } else {
                                                    data[2] = qty; //C
                                                    data[3] = ""; //D
                                                }
                                                data[4] = 0; //E
                                                data[5] = y; //F
                                                json.push(data);
                                            }
                                            if (batchInfo.length == 0) {
                                                var data = [];
                                                data[0] = "";
                                                data[1] = adjustmentType;
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
                                                        source: this.state.batchInfoList,
                                                        filter: this.filterBatchInfoForExistingDataForInventory
                                                    },
                                                    {
                                                        title: i18n.t('static.supplyPlan.adjustmentType'),
                                                        type: 'hidden',
                                                        source: ['Actual', 'Adjusted'],
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
                                                search: true,
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
                                                    var adjustmentType = rowData[1];
                                                    console.log("Adjustment Type", adjustmentType);
                                                    if (adjustmentType == "Actual") {
                                                        var cell = elInstance.getCell(`C${parseInt(y) + 1}`)
                                                        cell.classList.add('readonly');
                                                        var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                                                        cell.classList.remove('readonly');
                                                    } else {
                                                        var cell = elInstance.getCell(`C${parseInt(y) + 1}`)
                                                        cell.classList.remove('readonly');
                                                        var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
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
                                                            console.log("Row Data", rowData);
                                                            var adjustmentType = rowData[1];
                                                            console.log("Adjustment Type", adjustmentType);
                                                            items.push({
                                                                title: i18n.t('static.supplyPlan.addNewBatchInfo'),
                                                                onclick: function () {
                                                                    var data = [];
                                                                    data[0] = "";
                                                                    data[1] = adjustmentType;
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
        jExcelLoadedFunction(instance);
    }


    loadedBatchInfoInventory = function (instance, cell, x, y, value) {
        // jExcelLoadedFunction(instance);
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
            }
        }

        if (x == 2) {
            if (elInstance.getValueFromCoords(2, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(2, y).toString().replaceAll("\,", "") != 0) {
                var reg = /-?\d+/
                // var reg = /^[0-9\b]+$/;
                value = value.toString().replaceAll("\,", "");
                var col = ("C").concat(parseInt(y) + 1);
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else if (elInstance.getValueFromCoords(1, y) == 'Adjusted') {
                var col = ("C").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                var col = ("C").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 3) {
            if (elInstance.getValueFromCoords(3, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(3, y).toString().replaceAll("\,", "") != 0) {
                // var reg = /-?\d+/
                var reg = /^[0-9\b]+$/;
                var col = ("D").concat(parseInt(y) + 1);
                value = value.toString().replaceAll("\,", "")
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else if (elInstance.getValueFromCoords(1, y) == 'Actual') {
                var col = ("D").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                var col = ("D").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
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
                if (value == 'Actual') {
                    var cell = elInstance.getCell(`C${parseInt(y) + 1}`)
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                    cell.classList.remove('readonly');
                    elInstance.setValueFromCoords(2, y, "", true);
                } else {
                    var cell = elInstance.getCell(`C${parseInt(y) + 1}`)
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                    cell.classList.remove('readonly');
                    elInstance.setValueFromCoords(3, y, "", true);
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
                var value = elInstance.getValueFromCoords(2, y).toString().replaceAll("\,", "");
                var reg = /-?\d+/;
                // var reg = /^[0-9\b]+$/;
                if (elInstance.getValueFromCoords(2, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(2, y).toString().replaceAll("\,", "") != 0) {
                    var reg = /-?\d+/
                    // var reg = /^[0-9\b]+$/;
                    var col = ("C").concat(parseInt(y) + 1);
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                } else if (elInstance.getValueFromCoords(1, y) == 'Adjusted') {
                    var col = ("C").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ("C").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var value = elInstance.getValueFromCoords(3, y).toString().replaceAll("\,", "");
                if (elInstance.getValueFromCoords(3, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(3, y).toString().replaceAll("\,", "") != 0) {
                    // var reg = /-?\d+/
                    var reg = /^[0-9\b]+$/;
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
                } else if (elInstance.getValueFromCoords(1, y) == 'Actual') {
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

                var value = elInstance.getValueFromCoords(1, y);
                var col = ("B").concat(parseInt(y) + 1);
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
                    rowNumber = map.get("5");
                }
                if (map.get("0") != -1) {
                    var expiryDate = this.state.batchInfoListAllForInventory.filter(c => c.batchNo == elInstance.getCell(`A${i + 1}`).innerText)[0].expiryDate;
                    var batchInfoJson = {
                        consumptionTransBatchInfoId: map.get("4"),
                        batch: {
                            batchId: map.get("0"),
                            batchNo: elInstance.getCell(`A${i + 1}`).innerText,
                            expiryDate: expiryDate
                        },
                        adjustmentQty: map.get("2").toString().replaceAll("\,", ""),
                        actualQty: map.get("3").toString().replaceAll("\,", "")
                    }
                    batchInfoArray.push(batchInfoJson);
                }
                totalAdjustments += parseInt(map.get("2").toString().replaceAll("\,", ""));
                totalActualStock += parseInt(map.get("3").toString().replaceAll("\,", ""));
            }
            var inventoryInstance = this.state.inventoryEl;
            var rowData = inventoryInstance.getRowData(parseInt(rowNumber));

            if (map.get(1) == "Actual") {
                inventoryInstance.setValueFromCoords(7, rowNumber, "", true);
                inventoryInstance.setValueFromCoords(9, rowNumber, totalActualStock, true);
            } else {
                inventoryInstance.setValueFromCoords(7, rowNumber, totalAdjustments, true);
                inventoryInstance.setValueFromCoords(9, rowNumber, "", true);
            }
            rowData[15] = batchInfoArray;
            inventoryInstance.setRowData(rowNumber, rowData);
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
            } else if (elInstance.getValueFromCoords(5, y) == 'Adjusted') {
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
            } else if (elInstance.getValueFromCoords(5, y) == 'Actual') {
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
                if (value == 'Actual') {
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
                } else if (elInstance.getValueFromCoords(5, y) == 'Adjusted') {
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
                } else if (elInstance.getValueFromCoords(5, y) == 'Actual') {
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
                                        name: getLabelText(fsResult[k].label, this.state.lang),
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
                                    data[3] = `=C${j + 1}`;
                                    data[4] = "";
                                    data[5] = "";
                                    data[6] = "";//Currency
                                    data[7] = "";//ConversionRateToUSD
                                    data[8] = "";//Funding Source
                                    data[9] = suggestedShipmentList[j].shipmentMode;
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
                                    colWidths: [150, 200, 80, 80, 150, 250, 150, 80, 150, 100, 350, 10, 100],
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
                                                        data[3] = `=C${json.length + 1}`;
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
            }.bind(this)
        }.bind(this)
    }

    loadedSuggestedShipements = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        elInstance.hideIndex(0);
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
                                    addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime) +
                                        parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime);

                                    if (valueOfG == "Sea") {
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

                                    addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime) +
                                        parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime);

                                    if (value == "Sea") {
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
                            addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime) +
                                parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime);

                            if (map.get("9") == "Sea") {
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
                            shipmentMode: map.get("9"),
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

    filterBatchInfoForExistingData = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[2];
        console.log("this.state.batchInfoList", this.state.batchInfoList);
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
        console.log("this.state.batchInfoList", this.state.batchInfoList);
        if (value != 0) {
            mylist = this.state.batchInfoList.filter(c => c.id != -1);
        } else {
            mylist = this.state.batchInfoList;
        }
        return mylist;
    }.bind(this)

    //Shipment budget
    //Budget changed
    budgetChanged = function (instance, cell, x, y, value) {
        this.setState({
            budgetChangedFlag: 1,
        })
        var elInstance = instance.jexcel;
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
            elInstance.setValueFromCoords(parseInt(x) + 1, y, '', true);
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
            }
        }
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.setState({
                        budgetError: '',
                        noFundsBudgetError: ''
                    })
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }
        }

        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var currency = (this.state.currencyListAll).filter(c => c.currencyId == value)[0];
                elInstance.setValueFromCoords(5, y, currency.conversionRateToUsd, true)
            }
        }
    }

    //Final validations for Budget
    checkBudgetValidation() {
        var valid = true;
        var elInstance = this.state.shipmentBudgetTableEl;
        var json = elInstance.getJson();
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            var budget = this.state.budgetListAll.filter(c => c.budgetId == map.get("2"))[0]
            var totalBudget = budget.budgetAmt * budget.currency.conversionRateToUsd;
            var shipmentList = this.state.shipmentListUnFiltered.filter(c => c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS);
            var usedBudgetTotalAmount = 0;
            for (var s = 0; s < shipmentList.length; s++) {
                var shipmentBudgetList = (shipmentList[s].shipmentBudgetList).filter(c => c.budget.id == map.get("2"));
                for (var sb = 0; sb < shipmentBudgetList.length; sb++) {
                    usedBudgetTotalAmount += shipmentBudgetList[sb].budgetAmt * shipmentBudgetList[sb].conversionRateToUsd;
                }

            }
            var enteredBudgetAmt = (map.get('3') * map.get("5")).toFixed(2);
            usedBudgetTotalAmount = usedBudgetTotalAmount.toFixed(2);
            var availableBudgetAmount = totalBudget - usedBudgetTotalAmount;
            if (enteredBudgetAmt > availableBudgetAmount) {
                valid = false;
                var col = ("D").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.noFundsAvailable'));
                this.setState({
                    noFundsBudgetError: i18n.t('static.label.noFundsAvailable')
                })
            } else {
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
                    if (isNaN(Number.parseInt(value)) || value < 0) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
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
                    valid = false
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }
        return valid;
    }

    //Budget Save
    saveBudget() {
        var validation = this.checkBudgetValidation()
        if (validation == true) {
            var elInstance = this.state.shipmentBudgetTableEl;
            var json = elInstance.getJson();
            var budgetArray = [];
            var rowNumber = 0;
            var totalBudget = 0;
            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                var budgetJson = {
                    shipmentBudgetId: map.get("0"),
                    budget: {
                        id: map.get("2"),
                        fundingSource: {
                            id: map.get("1")
                        }
                    },
                    active: true,
                    budgetAmt: map.get('3'),
                    conversionRateToUsd: map.get("5"),
                    currency: {
                        currencyId: map.get("4")
                    }
                }
                budgetArray.push(budgetJson);
                totalBudget += map.get('3') * map.get("5");
                if (i == 0) {
                    rowNumber = map.get("6");
                }
            }
            var shipmentInstance = this.state.shipmentsEl;
            var rowData = shipmentInstance.getRowData(rowNumber);
            rowData[31] = totalBudget;
            rowData[32] = budgetArray;
            shipmentInstance.setRowData(rowNumber, rowData);
            // shipmentInstance.setValueFromCoords(31, rowNumber, totalBudget, true)
            // shipmentInstance.setValueFromCoords(32, rowNumber, budgetArray, true)
            this.setState({
                shipmentChangedFlag: 1,
                budgetChangedFlag: 0,
                shipmentBudgetTableEl: ''
            })
            document.getElementById("showButtonsDiv").style.display = 'none';
            elInstance.destroy();
        } else {
            this.setState({
                budgetError: i18n.t('static.supplyPlan.validationFailed')
            })
        }
    }

    shipmentStatusDropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[35];
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

    // To be accounted funtionality for shipments
    handleEvent(e, toBeAccounted, startDate, endDate, type) {
        e.preventDefault();
        if (toBeAccounted == true) {
            contextMenu.show({
                id: 'menu_id',
                event: e,
                props: {
                    type: type,
                    startDate: startDate,
                    endDate: endDate
                }
            });
        } else {
            contextMenu.show({
                id: 'no_skip',
                event: e,
                props: {
                    type: type,
                    startDate: startDate,
                    endDate: endDate
                }
            });
        }
    }

    // On click of context menu
    onClick = ({ event, props }) => {
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
                for (var i = 0; i < shipmentDataList.length; i++) {
                    if (props.type == 'psm' && shipmentDataList[i].expectedDeliveryDate >= props.startDate && shipmentDataList[i].expectedDeliveryDate <= props.endDate && shipmentDataList[i].erpFlag == false && shipmentDataList[i].procurementAgent.id == PSM_PROCUREMENT_AGENT_ID && shipmentDataList[i].planningUnit.id == document.getElementById("planningUnitId").value) {
                        shipmentDataList[i].accountFlag = !shipmentDataList[i].accountFlag;
                    } else if (props.type == 'nonPsm' && shipmentDataList[i].expectedDeliveryDate >= props.startDate && shipmentDataList[i].expectedDeliveryDate <= props.endDate && shipmentDataList[i].procurementAgent.id != PSM_PROCUREMENT_AGENT_ID && shipmentDataList[i].planningUnit.id == document.getElementById("planningUnitId").value) {
                        shipmentDataList[i].accountFlag = !shipmentDataList[i].accountFlag;
                    } else if (props.type == 'artmis' && shipmentDataList[i].expectedDeliveryDate >= props.startDate && shipmentDataList[i].expectedDeliveryDate <= props.endDate && shipmentDataList[i].erpFlag == true && shipmentDataList[i].planningUnit.id == document.getElementById("planningUnitId").value) {
                        shipmentDataList[i].accountFlag = !shipmentDataList[i].accountFlag;
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
                    this.setState({
                        message: i18n.t('static.message.accountFlagChanged')
                    })
                    this.formSubmit(this.state.monthCount);
                }.bind(this)
            }.bind(this)
        }.bind(this)
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
                                                        <li><span className="skipedShipmentslegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.skippedShipments')}</span></li>
                                                        <li><span className=" redlegend legendcolor"></span> <span className="legendcommitversionText">{i18n.t('static.supplyPlan.emergencyShipments')} </span></li>
                                                        <li><span className="skipedShipmentsEmegencylegend legendcolor"></span > <span className="legendcommitversionText">{i18n.t('static.supplyPlan.skippedEmergencyShipments')} </span></li>

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
                                            var tableEditableBasedOnSupplyPlan = true;
                                            if (supplyPlanType == 'deliveredShipments') {
                                                shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                                            } else if (supplyPlanType == 'shippedShipments') {
                                                shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                                            }else if(supplyPlanType=='orderedShipments'){
                                                shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                                            }else if(supplyPlanType=='plannedShipments'){
                                                shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == false && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS || c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id==ON_HOLD_SHIPMENT_STATUS));
                                            }else if (supplyPlanType == 'deliveredErpShipments') {
                                                shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS));
                                                tableEditableBasedOnSupplyPlan = false;
                                            } else if (supplyPlanType == 'shippedErpShipments') {
                                                shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS));
                                                tableEditableBasedOnSupplyPlan = false;
                                            }else if(supplyPlanType=='orderedErpShipments'){
                                                shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS));
                                                tableEditableBasedOnSupplyPlan = false;
                                            }else if(supplyPlanType=='plannedErpShipments'){
                                                shipmentList = shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.planningUnit.id == document.getElementById("planningUnitId").value && (c.shipmentStatus.id == DRAFT_SHIPMENT_STATUS || c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id==ON_HOLD_SHIPMENT_STATUS));
                                                tableEditableBasedOnSupplyPlan = false;
                                            }

                                            this.el = jexcel(document.getElementById("shipmentsDetailsTable"), '');
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
                                                // var shipmentBudgetList = shipmentList[i].shipmentBudgetList;
                                                // for (var sb = 0; sb < shipmentBudgetList.length; sb++) {
                                                //     budgetAmount += (shipmentBudgetList[sb].budgetAmt * shipmentBudgetList[sb].conversionRateToUsd);
                                                //     budgetJson.push(shipmentBudgetList[sb]);
                                                // }

                                                var shipmentBatchInfoList = shipmentList[i].batchInfoList;
                                                for (var sb = 0; sb < shipmentBatchInfoList.length; sb++) {
                                                    totalShipmentQty += parseInt(shipmentBatchInfoList[sb].shipmentQty);
                                                }
                                                var userQty = "";
                                                if (procurementAgentPlanningUnit.unitsPerPallet != 0 && procurementAgentPlanningUnit.unitsPerContainer != 0) {
                                                    userQty = shipmentList[i].shipmentQty;
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
                                                data[12] = procurementAgentPlanningUnit.unitsPerPallet;//M
                                                data[13] = procurementAgentPlanningUnit.unitsPerContainer;//N
                                                data[14] = `=ROUND(IF(M${i + 1}!=0,IF(K${i + 1}>L${i + 1},K${i + 1}/M${i + 1},L${i + 1}/M${i + 1}),0),2)`;//O
                                                data[15] = `=ROUND(IF(N${i + 1}!=0,IF(K${i + 1}>L${i + 1},K${i + 1}/N${i + 1},L${i + 1}/N${i + 1}),0),2)`;//P
                                                data[16] = ""; // Order based on Q
                                                data[17] = ""; // Rounding option R
                                                data[18] = userQty; // User Qty S
                                                data[19] = `=IF(Q${i + 1}==3,

                                                                IF(R${i + 1}==1,
                                                                        CEILING(L${i + 1},1),
                                                                        FLOOR(L${i + 1},1)
                                                                )
                                                        ,
                                                        IF(Q${i + 1}==4,
                                                                IF(NOT(ISBLANK(S${i + 1})),
                                                                        IF(R${i + 1}==1,
                                                                                CEILING(S${i + 1}/M${i + 1},1)*M${i + 1},
                                                                                FLOOR(S${i + 1}/M${i + 1},1)*M${i + 1}
                                                                        ),
                                                                        IF(R${i + 1}==1,
                                                                                CEILING(ROUND(IF(M${i + 1}!=0,IF(K${i + 1}>L${i + 1},K${i + 1}/M${i + 1},L${i + 1}/M${i + 1}),0),2),1)*M${i + 1},
                                                                                FLOOR(ROUND(IF(M${i + 1}!=0,IF(K${i + 1}>L${i + 1},K${i + 1}/M${i + 1},L${i + 1}/M${i + 1}),0),2),1)*M${i + 1}
                                                                        )
                                                                ),
                                                                IF(Q${i + 1}==1,
                                                                        IF(NOT(ISBLANK(S${i + 1})),
                                                                                IF(R${i + 1}==1,
                                                                                CEILING(S${i + 1}/N${i + 1},1)*N${i + 1},
                                                                                FLOOR(S${i + 1}/N${i + 1},1)*N${i + 1}
                                                                        ),
                                                                                IF(R${i + 1}==1,
                                                                                        CEILING(ROUND(IF(N${i + 1}!=0,IF(K${i + 1}>L${i + 1},K${i + 1}/N${i + 1},L${i + 1}/N${i + 1}),0),2),1)*N${i + 1},
                                                                                        FLOOR(ROUND(IF(N${i + 1}!=0,IF(K${i + 1}>L${i + 1},K${i + 1}/N${i + 1},L${i + 1}/N${i + 1}),0),2),1)*N${i + 1}
                                                                                )
                                                                        ),
                                                                        IF(NOT(ISBLANK(S${i + 1})),
                                                                                IF(R${i + 1}==1,
                                                                                        CEILING(S${i + 1},1),
                                                                                        FLOOR(S${i + 1},1)
                                                                                ),
                                                                                IF(R${i + 1}==1,
                                                                                        CEILING(K${i + 1},1),
                                                                                        FLOOR(K${i + 1},1)
                                                                                )
                                                                        )
                                                                )
                                                        )
                                                 )`;  // T
                                                data[20] = `=ROUND(IF(M${i + 1}!=0,(T${i + 1}/M${i + 1}),0),2)`; //U
                                                data[21] = `=ROUND(IF(N${i + 1}!=0,(T${i + 1}/N${i + 1}),0),2)`; //V
                                                data[22] = shipmentList[i].rate;//Manual price W
                                                data[23] = shipmentList[i].procurementUnit.id; //X
                                                data[24] = shipmentList[i].supplier.id; //Y
                                                data[25] = `=ROUND(${pricePerUnit}/G${i + 1},2)`; //Z
                                                data[26] = `=ROUND(IF(AND(NOT(ISBLANK(W${i + 1})),(W${i + 1} != 0)),W${i + 1},Z${i + 1})*T${i + 1},2)`; //Amount AA
                                                data[27] = shipmentList[i].shipmentMode;//Shipment method AB
                                                data[28] = shipmentList[i].freightCost;// Freight Cost AC
                                                data[29] = `=ROUND(IF(AB${i + 1}=="Sea",(AA${i + 1}*AH${i + 1})/100,(AA${i + 1}*AG${i + 1})/100),2)`;// Default frieght cost AD
                                                data[30] = `=ROUND(AA${i + 1}+IF(AND(NOT(ISBLANK(AC${i + 1})),(AC${i + 1}!= 0)),AC${i + 1},AD${i + 1}),2)`; // Final Amount AE
                                                data[31] = shipmentList[i].notes;//Notes AF
                                                data[32] = airFreightPerc; //AG
                                                data[33] = seaFreightPerc; //AH
                                                var index;
                                                if (shipmentList[i].shipmentId != 0) {
                                                    index = shipmentListUnFiltered.findIndex(c => c.shipmentId == shipmentList[i].shipmentId);
                                                } else {
                                                    index = shipmentList[i].index;
                                                }
                                                data[34] = index; // AI
                                                data[35] = shipmentList[i].shipmentStatus.id; //AJ
                                                data[36] = supplyPlanType; //AK
                                                data[37] = shipmentList[i].accountFlag; //AL
                                                data[38] = shipmentList[i].emergencyOrder; //AM
                                                data[39] = shipmentList[i].active; //AN
                                                data[40] = shipmentList[i].batchInfoList; //AO
                                                data[41] = totalShipmentQty; //AP
                                                data[42] = shipmentList[i].erpFlag; //AQ
                                                shipmentsArr.push(data);
                                            }
                                            var options = {
                                                data: shipmentsArr,
                                                columns: [
                                                    { type: 'calendar', options: { format: 'MM-DD-YYYY', validRange: [moment(Date.now()).format("YYYY-MM-DD"), null] }, title: i18n.t('static.supplyPlan.expectedDeliveryDate'), width: 100 },
                                                    { type: 'dropdown', title: i18n.t('static.supplyPlan.shipmentStatus'), source: shipmentStatusList, filter: this.shipmentStatusDropdownFilter, width: 100 },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.supplyPlan.orderNoAndPrimeLineNo'), width: 120 },
                                                    { type: 'dropdown', title: i18n.t('static.datasource.datasource'), source: dataSourceList, width: 120 },
                                                    { type: 'dropdown', title: i18n.t('static.procurementagent.procurementagent'), source: procurementAgentList, width: 120 },
                                                    { type: 'dropdown', readOnly: true, title: i18n.t('static.dashboard.currency'), source: currencyList, width: 120 },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.currency.conversionrateusd'), width: 80 },
                                                    { type: 'dropdown', title: i18n.t('static.subfundingsource.fundingsource'), source: fundingSourceList, width: 120 },
                                                    { type: 'dropdown', title: i18n.t('static.dashboard.budget'), source: budgetList, filter: this.budgetDropdownFilter, width: 120 },
                                                    { type: 'text', readOnly: true, title: i18n.t('static.planningunit.planningunit'), width: 150 },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.suggestedOrderQty'), mask: '#,##', width: 80 },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.procurementAgentPlanningUnit.moq'), mask: '#,##', width: 80 },
                                                    { type: 'hidden', title: i18n.t('static.procurementAgentPlanningUnit.unitPerPallet'), width: 0 },
                                                    { type: 'hidden', title: i18n.t('static.procurementUnit.unitsPerContainer'), width: 0 },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfPallets'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfContainers'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'dropdown', title: i18n.t('static.supplyPlan.orderBasedOn'), source: [{ id: 1, name: i18n.t('static.supplyPlan.container') }, { id: 2, name: i18n.t('static.supplyPlan.suggestedOrderQty') }, { id: 3, name: i18n.t('static.procurementAgentPlanningUnit.moq') }, { id: 4, name: i18n.t('static.supplyPlan.pallet') }], width: 120 },
                                                    { type: 'dropdown', title: i18n.t('static.supplyPlan.roundingOption'), source: [{ id: 1, name: i18n.t('static.supplyPlan.roundUp') }, { id: 2, name: i18n.t('static.supplyPlan.roundDown') }], width: 120 },
                                                    { type: 'numeric', title: i18n.t('static.supplyPlan.userQty'), width: 80, mask: '#,##' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustesOrderQty'), width: 80, mask: '#,##' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustedPallets'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.adjustedContainers'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'numeric', title: i18n.t("static.supplyPlan.userPrice"), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'dropdown', title: i18n.t('static.procurementUnit.procurementUnit'), source: procurementUnitList, filter: this.procurementUnitDropdownFilter, width: 120 },
                                                    { type: 'dropdown', title: i18n.t('static.procurementUnit.supplier'), source: supplierList, width: 120 },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.pricePerPlanningUnit'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.amountInUSD'), width: 80, mask: '#,##.00', decimal: '.' },
                                                    { type: 'dropdown', title: i18n.t("static.supplyPlan.shipmentMode"), source: ['Sea', 'Air'], width: 100 },
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
                                                        'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
                                                        'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD',
                                                        'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN']
                                                    var rowData = elInstance.getRowData(y);
                                                    var unitsPerPalletForUpdate = rowData[12];
                                                    var unitsPerContainerForUpdate = rowData[13];
                                                    var shipmentStatus = rowData[35];
                                                    var erpFlag = rowData[42];
                                                    if (shipmentStatus == DELIVERED_SHIPMENT_STATUS || erpFlag == true) {
                                                        for (var i = 0; i < colArr.length; i++) {
                                                            var cell = elInstance.getCell(`${colArr[i]}${parseInt(y) + 1}`)
                                                            cell.classList.add('readonly');
                                                        }
                                                    } else {
                                                        if (unitsPerPalletForUpdate == 0 || unitsPerContainerForUpdate == 0) {
                                                            var cell = elInstance.getCell(`Q${parseInt(y) + 1}`)
                                                            cell.classList.add('readonly');
                                                            var cell = elInstance.getCell(`R${parseInt(y) + 1}`)
                                                            cell.classList.add('readonly');
                                                            var cell = elInstance.getCell(`S${parseInt(y) + 1}`)
                                                            cell.classList.add('readonly');
                                                        } else {
                                                            var cell = elInstance.getCell(`Q${parseInt(y) + 1}`)
                                                            cell.classList.remove('readonly');
                                                            var cell = elInstance.getCell(`R${parseInt(y) + 1}`)
                                                            cell.classList.remove('readonly');
                                                            var cell = elInstance.getCell(`S${parseInt(y) + 1}`)
                                                            cell.classList.remove('readonly');
                                                        }
                                                    }
                                                }.bind(this),
                                                contextMenu: function (obj, x, y, e) {
                                                    var items = [];

                                                    // Add shipment batch info
                                                    var rowData = obj.getRowData(y);
                                                    var expectedDeliveryDate = moment(rowData[0]).format("YYYY-MM-DD");
                                                    console.log("ExpectedDeliveryDate", expectedDeliveryDate);
                                                    console.log("Shelf Life", this.state.shelfLife);
                                                    var expiryDate = moment(expectedDeliveryDate).add(this.state.shelfLife, 'months').format("YYYY-MM-DD");
                                                    console.log("ExpiryDate", expiryDate);
                                                    var readOnlyBatchInfo = false;
                                                    if (rowData[1] != DELIVERED_SHIPMENT_STATUS) {
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
                                                                var batchInfo = rowData[40];
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
                                                                    search: true,
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
    }

    loadedBatchInfoShipment = function (instance, cell, x, y, value) {
        // jExcelLoadedFunction(instance);
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
                console.log("rowData[34]", rowData[34]);
                console.log("VersiionId", this.state.versionId);
                if (map.get("0") != "") {
                    batchNo = map.get("0");
                } else {
                    batchNo = "QAT".concat(rowData[34]).concat(this.state.versionId).concat(AuthenticationService.getLoggedInUserId());
                }
                console.log("BatchNo", batchNo);
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

            rowData[40] = batchInfoArray;
            rowData[41] = totalShipmentQty;
            console.log("TotalShipmentQty------>", totalShipmentQty);
            shipmentInstance.setRowData(rowNumber, rowData);
            this.setState({
                shipmentChangedFlag: 1,
                shipmentBatchInfoChangedFlag: 0,
                shipmentBatchInfoTableEl: ''
            })
            var cell = shipmentInstance.getCell(`A${rowNumber + 1}`)
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
        var elInstance = instance.jexcel;
        elInstance.hideIndex(0);
    }

    loadedBudget = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        elInstance.hideIndex(0);
    }

    shipmentChanged = function (instance, cell, x, y, value) {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var elInstance = this.state.shipmentsEl;
        this.setState({
            shipmentError: '',
            shipmentDuplicateError: '',
        })
        console.log("In shipment Changed ", x, "Y------------->", y);
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
            var col1 = ("X").concat(parseInt(y) + 1);
            var col2 = ("Y").concat(parseInt(y) + 1);
            var col3 = ("I").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (value == DELIVERED_SHIPMENT_STATUS || value == SHIPPED_SHIPMENT_STATUS || value == ARRIVED_SHIPMENT_STATUS) {
                    var procurementUnit = elInstance.getValueFromCoords(23, y);
                    var supplier = elInstance.getValueFromCoords(24, y);
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
            console.log("In procurement agent changed ")
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                elInstance.setValueFromCoords(23, y, "", true);
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var procurementAgentPlanningUnit = this.state.procurementAgentListAll.filter(c => c.procurementAgent.id == value && c.planningUnit.id == planningUnitId)[0];
                var procurementUnitValue = elInstance.getRowData(y)[23];
                var pricePerUnit = procurementAgentPlanningUnit.catalogPrice;
                if (procurementUnitValue != "") {
                    var procurementUnit = this.state.procurementUnitListAll.filter(p => p.procurementUnit.id == procurementUnitValue && p.procurementAgent.id == value)[0];
                    pricePerUnit = procurementUnit.vendorPrice;
                }
                var conversionRateToUsd = elInstance.getValueFromCoords(6, y);
                pricePerUnit = (pricePerUnit / conversionRateToUsd).toFixed(2);
                elInstance.setValueFromCoords(11, y, procurementAgentPlanningUnit.moq, true);
                elInstance.setValueFromCoords(25, y, pricePerUnit, true);
                elInstance.setValueFromCoords(12, y, procurementAgentPlanningUnit.unitsPerPallet, true);
                elInstance.setValueFromCoords(13, y, procurementAgentPlanningUnit.unitsPerContainer, true);
                if (procurementAgentPlanningUnit.unitsPerPallet == 0 || procurementAgentPlanningUnit.unitsPerPallet == 0) {
                    elInstance.setValueFromCoords(16, y, "", true);
                    elInstance.setValueFromCoords(17, y, "", true);
                    elInstance.setValueFromCoords(18, y, "", true);
                }
            }
            elInstance.setValueFromCoords(23, y, "", true);
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

        if (x == 18) {
            var col = ("S").concat(parseInt(y) + 1);
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

        if (x == 22) {
            var col = ("W").concat(parseInt(y) + 1);
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

        if (x == 23) {
            if (value != "") {
                // Logic for Procurement Unit on change
                var valueOfF = elInstance.getRowData(y)[4];
                if (valueOfF != "") {
                    var procurementUnit = this.state.procurementUnitListAll.filter(p => p.procurementUnit.id == value && p.procurementAgent.id == valueOfF)[0];
                    pricePerUnit = procurementUnit.vendorPrice;
                    var conversionRateToUsd = elInstance.getValueFromCoords(6, y);
                    pricePerUnit = (pricePerUnit / conversionRateToUsd).toFixed(2);
                    elInstance.setValueFromCoords(25, y, pricePerUnit, true);
                }
            }

            var shipmentStatus = elInstance.getRowData(y)[1];
            var col1 = ("X").concat(parseInt(y) + 1);
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

        if (x == 24) {
            var shipmentStatus = elInstance.getRowData(y)[1];
            console.log("SHipment status", shipmentStatus);
            var col1 = ("Y").concat(parseInt(y) + 1);
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

        if (x == 27) {
            var col = ("AB").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 28) {
            var col = ("AC").concat(parseInt(y) + 1);
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

        if (x == 41) {
            if (value != 0) {
                var adjustedQty = ((elInstance.getCell(`T${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", "");
                console.log("AdjustmentQTy", adjustedQty);
                console.log("Value", value);
                if (value != adjustedQty) {
                    var col = ("T").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.supplyPlan.batchNumberMissing'));
                    this.setState({
                        shipmentBatchError: i18n.t('static.supplyPlan.batchNumberMissing'),
                    })
                } else {
                    var col = ("T").concat(parseInt(y) + 1);
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
        var planningUnitId = document.getElementById("planningUnitId").value;
        var valid = true;
        var elInstance = this.state.shipmentsEl;
        var json = elInstance.getJson();
        var mapArray = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
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
            var col1 = ("X").concat(parseInt(y) + 1);
            var col2 = ("Y").concat(parseInt(y) + 1);
            var col3 = ("I").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                if (value == DELIVERED_SHIPMENT_STATUS || value == SHIPPED_SHIPMENT_STATUS || value == ARRIVED_SHIPMENT_STATUS) {
                    var procurementUnit = elInstance.getValueFromCoords(23, y);
                    var supplier = elInstance.getValueFromCoords(24, y);
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

            var col = ("AB").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(27, y);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }

            var col = ("S").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(18, y);
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

            var col = ("W").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(22, y);
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

            var col = ("AC").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(28, y);
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
                var shipmentStatus = elInstance.getRowData(y)[1];
                console.log("elInstance.getValueFromCoords(40, y).length", elInstance.getValueFromCoords(40, y).length);
                if (shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                    var totalShipmentQty = (elInstance.getValueFromCoords(41, y));
                    console.log("TotalShipmentQty", totalShipmentQty);
                    var adjustedOrderQty = (elInstance.getCell(`T${parseInt(y) + 1}`)).innerHTML;
                    adjustedOrderQty = adjustedOrderQty.toString().replaceAll("\,", "");
                    console.log("adjusted Order qty", adjustedOrderQty)
                    var col = ("T").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.supplyPlan.batchNumberMissing'));
                    if (totalShipmentQty != 0 && totalShipmentQty != adjustedOrderQty) {
                        this.setState({
                            shipmentBatchError: i18n.t('static.supplyPlan.batchNumberMissing')
                        })
                        valid = false;
                    } else {
                        var col = ("T").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                }
            }
            // }
            // }
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
                shipmentBatchError: ''
            })
            var elInstance = this.state.shipmentsEl;
            var json = elInstance.getJson();
            var planningUnitId = document.getElementById("planningUnitId").value;
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


                        var shipmentQty = (elInstance.getCell(`T${j}`)).innerHTML;
                        var productCost = (elInstance.getCell(`AA${j}`)).innerHTML;
                        var rate = 0;
                        if ((elInstance.getCell(`W${j}`)).innerHTML != "" || (elInstance.getCell(`W${j}`)).innerHTML != 0) {
                            rate = (elInstance.getCell(`W${j}`)).innerHTML;
                        } else {
                            rate = (elInstance.getCell(`Z${j}`)).innerHTML;
                        }

                        var freightCost = 0;
                        if ((elInstance.getCell(`AC${j}`)).innerHTML != "" || (elInstance.getCell(`AC${j}`)).innerHTML != 0) {
                            freightCost = (elInstance.getCell(`AC${j}`)).innerHTML;
                        } else {
                            freightCost = (elInstance.getCell(`AD${j}`)).innerHTML;
                        }
                        shipmentDataList[parseInt(map.get("34"))].expectedDeliveryDate = moment(map.get("0")).format("YYYY-MM-DD");
                        shipmentDataList[parseInt(map.get("34"))].shipmentStatus.id = shipmentStatusId;
                        shipmentDataList[parseInt(map.get("34"))].dataSource.id = map.get("3");
                        shipmentDataList[parseInt(map.get("34"))].procurementAgent.id = map.get("4");
                        shipmentDataList[parseInt(map.get("34"))].fundingSource.id = map.get("7");
                        shipmentDataList[parseInt(map.get("34"))].budget.id = map.get("8");
                        shipmentDataList[parseInt(map.get("34"))].shipmentQty = shipmentQty.toString().replaceAll("\,", "");
                        shipmentDataList[parseInt(map.get("34"))].rate = rate.toString().replaceAll("\,", "");
                        shipmentDataList[parseInt(map.get("34"))].procurementUnit.id = map.get("23");
                        shipmentDataList[parseInt(map.get("34"))].supplier.id = map.get("24");
                        shipmentDataList[parseInt(map.get("34"))].shipmentMode = map.get("27");
                        shipmentDataList[parseInt(map.get("34"))].productCost = productCost.toString().replaceAll("\,", "");
                        shipmentDataList[parseInt(map.get("34"))].freightCost = parseFloat(freightCost.toString().replaceAll("\,", "")).toFixed(2);
                        shipmentDataList[parseInt(map.get("34"))].notes = map.get("31");
                        shipmentDataList[parseInt(map.get("34"))].active = map.get("39");
                        shipmentDataList[parseInt(map.get("34"))].accountFlag = map.get("37");
                        shipmentDataList[parseInt(map.get("34"))].emergencyOrder = map.get("38");
                        shipmentDataList[parseInt(map.get("34"))].batchInfoList = map.get("40");
                        if (shipmentStatusId == SHIPPED_SHIPMENT_STATUS) {
                            shipmentDataList[parseInt(map.get("34"))].shippedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                            shipmentDataList[parseInt(map.get("34"))].deliveredDate = moment(Date.now()).format("YYYY-MM-DD");
                            var shipmentBatchInfoList = map.get("40");
                            for (var bi = 0; bi < shipmentBatchInfoList.length; bi++) {
                                shipmentBatchInfoList[bi].createdDate = moment(Date.now()).format("YYYY-MM-DD");
                                batchInfoList.push(shipmentBatchInfoList[bi]);
                            }
                            programJson.batchInfoList = batchInfoList;
                        }

                    }

                    programJson.shipmentList = shipmentDataList;
                    console.log("Shipment DAta list", shipmentDataList);
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
