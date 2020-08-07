import React from "react";
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunctionOnlyHideRow, checkValidtion, inValid, positiveValidation, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { SECRET_KEY, SHIPMENT_DATA_SOURCE_TYPE, DELIVERED_SHIPMENT_STATUS, TBD_PROCUREMENT_AGENT_ID, TBD_FUNDING_SOURCE, SUBMITTED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, DECIMAL_NO_REGEX, INTEGER_NO_REGEX, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS } from "../../Constants";
import moment from "moment";
import { paddingZero, generateRandomAplhaNumericCode } from "../../CommonComponent/JavascriptCommonFunctions";
import CryptoJS from 'crypto-js'

export default class ShipmentsInSupplyPlanComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            budgetListAll: [],
            shipmentQtyChangedFlag: 0
        }
        this.loadedShipments = this.loadedShipments.bind(this)
        this.loadedQtyCalculator = this.loadedQtyCalculator.bind(this)
        this.loadedQtyCalculator1 = this.loadedQtyCalculator1.bind(this)
        this.budgetDropdownFilter = this.budgetDropdownFilter.bind(this)
        this.shipmentChanged = this.shipmentChanged.bind(this)
        this.shipmentQtyChanged = this.shipmentQtyChanged.bind(this)
        this.saveShipmentQty = this.saveShipmentQty.bind(this)
        this.checkValidationForShipmentQty = this.checkValidationForShipmentQty.bind(this)
        this.loadedBatchInfoShipment = this.loadedBatchInfoShipment.bind(this)
        this.batchInfoChangedShipment = this.batchInfoChangedShipment.bind(this)
        this.checkValidationShipmentBatchInfo = this.checkValidationShipmentBatchInfo.bind(this)
        this.saveShipmentBatchInfo = this.saveShipmentBatchInfo.bind(this)
        this.loadedShipmentDates = this.loadedShipmentDates.bind(this)
        this.calculateLeadTimesOnChange = this.calculateLeadTimesOnChange.bind(this)
        this.shipmentDatesChanged = this.shipmentDatesChanged.bind(this)
        this.calculateFutureDates = this.calculateFutureDates.bind(this)
        this.checkValidationForShipmentDates = this.checkValidationForShipmentDates.bind(this)
        this.saveShipmentsDate = this.saveShipmentsDate.bind(this);
        this.saveShipments = this.saveShipments.bind(this);
        this.checkValidationForShipments = this.checkValidationForShipments.bind(this);
    }

    componentDidMount() {
        console.log("shipment List", this.props.items);
        var planningUnitId = document.getElementById("planningUnitId").value;
        var shipmentListUnFiltered = this.props.items.shipmentListUnFiltered;
        var shipmentList = this.props.items.shipmentList;
        var programJson = this.props.items.programJson;
        var db1;
        var shipmentStatusList = [];
        var procurementAgentList = [];
        var fundingSourceList = [];
        var budgetList = [];
        var dataSourceList = [];
        var currencyList = [];
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
            var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
            var shipmentStatusRequest = shipmentStatusOs.getAll();
            shipmentStatusRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
            }.bind(this);
            shipmentStatusRequest.onsuccess = function (event) {
                var shipmentStatusResult = [];
                shipmentStatusResult = shipmentStatusRequest.result.filter(c => c.active == true);
                for (var k = 0; k < shipmentStatusResult.length; k++) {
                    var shipmentStatusJson = {
                        name: getLabelText(shipmentStatusResult[k].label, this.state.lang),
                        id: shipmentStatusResult[k].shipmentStatusId
                    }
                    shipmentStatusList.push(shipmentStatusJson);
                }
                var papuTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                var papuOs = papuTransaction.objectStore('procurementAgentPlanningUnit');
                var papuRequest = papuOs.getAll();
                papuRequest.onerror = function (event) {
                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                }.bind(this);
                papuRequest.onsuccess = function (event) {
                    var papuResult = [];
                    papuResult = papuRequest.result;
                    for (var k = 0; k < papuResult.length; k++) {
                        if (papuResult[k].planningUnit.id == planningUnitId && papuResult[k].active == true) {
                            var papuJson = {
                                name: papuResult[k].procurementAgent.code,
                                id: papuResult[k].procurementAgent.id
                            }
                            procurementAgentList.push(papuJson);
                        }
                    }
                    this.setState({
                        procurementAgentPlanningUnitListAll: papuResult
                    })

                    var fsTransaction = db1.transaction(['fundingSource'], 'readwrite');
                    var fsOs = fsTransaction.objectStore('fundingSource');
                    var fsRequest = fsOs.getAll();
                    fsRequest.onerror = function (event) {
                        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                    }.bind(this);
                    fsRequest.onsuccess = function (event) {
                        var fsResult = [];
                        fsResult = fsRequest.result;
                        for (var k = 0; k < fsResult.length; k++) {
                            if (fsResult[k].realm.id == programJson.realmCountry.realm.realmId && fsResult[k].active == true) {
                                var fsJson = {
                                    name: fsResult[k].fundingSourceCode,
                                    id: fsResult[k].fundingSourceId
                                }
                                fundingSourceList.push(fsJson);
                            }
                        }

                        var bTransaction = db1.transaction(['budget'], 'readwrite');
                        var bOs = bTransaction.objectStore('budget');
                        var bRequest = bOs.getAll();
                        var budgetListAll = []
                        bRequest.onerror = function (event) {
                            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                        }.bind(this);
                        bRequest.onsuccess = function (event) {
                            var bResult = [];
                            bResult = bRequest.result;
                            for (var k = 0; k < bResult.length; k++) {
                                if (bResult[k].program.id == programJson.programId && bResult[k].active == true) {
                                    var bJson = {
                                        name: bResult[k].budgetCode,
                                        id: bResult[k].budgetId
                                    }
                                    budgetList.push(bJson);
                                    budgetListAll.push({
                                        name: bResult[k].budgetCode,
                                        id: bResult[k].budgetId,
                                        fundingSource: bResult[k].fundingSource,
                                        currency: bResult[k].currency,
                                        budgetAmt: bResult[k].budgetAmt
                                    })
                                }

                            }

                            this.setState({
                                budgetListAll: budgetListAll
                            })

                            var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                            var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                            var dataSourceRequest = dataSourceOs.getAll();
                            dataSourceRequest.onerror = function (event) {
                                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                            }.bind(this);
                            dataSourceRequest.onsuccess = function (event) {
                                var dataSourceResult = [];
                                dataSourceResult = dataSourceRequest.result;
                                for (var k = 0; k < dataSourceResult.length; k++) {
                                    if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0 && dataSourceResult[k].active == true) {
                                        if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId && dataSourceResult[k].dataSourceType.id == SHIPMENT_DATA_SOURCE_TYPE) {
                                            var dataSourceJson = {
                                                name: getLabelText(dataSourceResult[k].label, this.state.lang),
                                                id: dataSourceResult[k].dataSourceId
                                            }
                                            dataSourceList.push(dataSourceJson);
                                        }
                                    }
                                }

                                var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                                var currencyOs = currencyTransaction.objectStore('currency');
                                var currencyRequest = currencyOs.getAll();
                                currencyRequest.onerror = function (event) {
                                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
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
                                    }
                                    this.setState({
                                        currencyListAll: currencyResult
                                    })
                                    console.log("Data source list", dataSourceList);
                                    this.el = jexcel(document.getElementById("shipmentsDetailsTable"), '');
                                    this.el.destroy();
                                    var data = [];
                                    var shipmentsArr = [];
                                    var shipmentEditable = true;
                                    if (this.props.shipmentPage == "supplyPlanCompare") {
                                        shipmentEditable = false;
                                    }
                                    var paginationOption = false;
                                    var searchOption = false;
                                    var paginationArray = []
                                    if (this.props.shipmentPage == "shipmentDataEntry") {
                                        paginationOption = 10;
                                        searchOption = true;
                                        paginationArray = [10, 25, 50];
                                    }
                                    for (var i = 0; i < shipmentList.length; i++) {
                                        var shipmentMode = 1;
                                        if (shipmentList[i].shipmentMode == "Air") {
                                            shipmentMode = 2;
                                        }
                                        var erpType = "hidden";
                                        if (shipmentList[i].erpFlag.toString() == "true") {
                                            erpType = "text";
                                        }
                                        var orderNoAndPrimeLineNo = "";
                                        if (shipmentList[i].orderNo != "" && shipmentList[i].orderNo != null) {
                                            orderNoAndPrimeLineNo = shipmentList[i].orderNo.concat("~").concat(shipmentList[i].primeLineNo);
                                        }

                                        var totalShipmentQty = 0;
                                        var shipmentBatchInfoList = shipmentList[i].batchInfoList;
                                        for (var sb = 0; sb < shipmentBatchInfoList.length; sb++) {
                                            totalShipmentQty += parseInt(shipmentBatchInfoList[sb].shipmentQty);
                                        }

                                        var shipmentDatesJson = {
                                            plannedDate: shipmentList[i].plannedDate,
                                            submittedDate: shipmentList[i].submittedDate,
                                            approvedDate: shipmentList[i].approvedDate,
                                            shippedDate: shipmentList[i].shippedDate,
                                            arrivedDate: shipmentList[i].arrivedDate,
                                            expectedDeliveryDate: shipmentList[i].expectedDeliveryDate,
                                            receivedDate: shipmentList[i].receivedDate
                                        }

                                        data = [];
                                        data[0] = shipmentList[i].shipmentStatus.id; //A
                                        data[1] = shipmentList[i].expectedDeliveryDate;//B
                                        data[2] = shipmentList[i].procurementAgent.id;//C
                                        data[3] = shipmentList[i].fundingSource.id;//D
                                        data[4] = shipmentList[i].budget.id;//E
                                        data[5] = orderNoAndPrimeLineNo;
                                        data[6] = shipmentList[i].dataSource.id;//G
                                        data[7] = shipmentMode;//H
                                        data[8] = shipmentList[i].shipmentQty;//I
                                        data[9] = shipmentList[i].currency.currencyId;//J
                                        data[10] = shipmentList[i].rate;//K
                                        data[11] = `=ROUND(K${parseInt(i) + 1}*I${parseInt(i) + 1},2)`;//L
                                        data[12] = shipmentList[i].freightCost;//M
                                        data[13] = shipmentList[i].notes;//N
                                        data[14] = shipmentList[i].erpFlag;//O
                                        data[15] = shipmentList[i].shipmentStatus.id;//P
                                        var index;
                                        if (shipmentList[i].shipmentId != 0) {
                                            index = shipmentListUnFiltered.findIndex(c => c.shipmentId == shipmentList[i].shipmentId);
                                        } else {
                                            index = shipmentList[i].index;
                                        }
                                        data[16] = index; // Q
                                        data[17] = shipmentList[i].batchInfoList; //R
                                        data[18] = totalShipmentQty; //S
                                        data[19] = shipmentList[i].emergencyOrder;
                                        data[20] = shipmentList[i].accountFlag;
                                        data[21] = shipmentDatesJson;
                                        data[22] = shipmentList[i].suggestedQty;
                                        shipmentsArr.push(data);
                                    }
                                    var options = {
                                        data: shipmentsArr,
                                        columns: [
                                            { type: 'dropdown', title: i18n.t('static.supplyPlan.shipmentStatus'), source: shipmentStatusList, width: 100 },
                                            { type: 'calendar', title: i18n.t('static.supplyPlan.expectedDeliveryDate'), options: { format: 'MM-DD-YYYY' }, width: 100, readOnly: true },
                                            { type: 'dropdown', title: i18n.t('static.procurementagent.procurementagent'), source: procurementAgentList, width: 120 },
                                            { type: 'dropdown', title: i18n.t('static.subfundingsource.fundingsource'), source: fundingSourceList, width: 120 },
                                            { type: 'dropdown', title: i18n.t('static.dashboard.budget'), source: budgetList, filter: this.budgetDropdownFilter, width: 120 },
                                            { type: erpType, readOnly: true, title: i18n.t('static.supplyPlan.orderNoAndPrimeLineNo'), width: 150 },
                                            { type: 'dropdown', title: i18n.t('static.datasource.datasource'), source: dataSourceList, width: 150 },
                                            { type: 'dropdown', title: i18n.t("static.supplyPlan.shipmentMode"), source: [{ id: 1, name: i18n.t('static.supplyPlan.sea') }, { id: 2, name: i18n.t('static.supplyPlan.air') }], width: 100 },
                                            { type: 'numeric', readOnly: true, title: i18n.t("static.supplyPlan.adjustesOrderQty"), width: 100, mask: '#,##' },
                                            { type: 'dropdown', title: i18n.t('static.dashboard.currency'), source: currencyList, width: 120 },
                                            { type: 'numeric', title: i18n.t('static.supplyPlan.pricePerPlanningUnit'), width: 80, mask: '#,##.00', decimal: '.' },
                                            { type: 'numeric', readOnly: true, title: i18n.t('static.shipment.productcost'), width: 80, mask: '#,##.00', decimal: '.' },
                                            { type: 'numeric', title: i18n.t('static.shipment.freightcost'), width: 80, mask: '#,##.00', decimal: '.' },
                                            { type: 'text', title: i18n.t('static.program.notes'), width: 200 },
                                            { type: 'hidden', title: i18n.t('static.supplyPlan.erpFlag'), width: 0 },
                                            { type: 'hidden', title: i18n.t('static.supplyPlan.shipmentStatus'), width: 0 },
                                            { type: 'hidden', title: i18n.t('static.supplyPlan.index'), width: 0 },
                                            { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 0 },
                                            { type: 'hidden', title: i18n.t('static.supplyPlan.totalQtyBatchInfo'), width: 0 },
                                            { type: 'hidden', title: i18n.t('static.supplyPlan.emergencyOrder'), width: 0 },
                                            { type: 'hidden', title: i18n.t('static.common.accountFlag'), width: 0 },
                                            { type: 'hidden', title: i18n.t('static.supplyPlan.shipmentDatesJson'), width: 0 },
                                            { type: 'hidden' }
                                        ],
                                        pagination: paginationOption,
                                        paginationOptions: paginationArray,
                                        search: searchOption,
                                        columnSorting: true,
                                        tableOverflow: true,
                                        wordWrap: true,
                                        allowInsertColumn: false,
                                        allowManualInsertColumn: false,
                                        allowDeleteRow: false,
                                        allowInsertRow: true,
                                        allowManualInsertRow: false,
                                        copyCompatibility: true,
                                        editable: shipmentEditable,
                                        onchange: this.shipmentChanged,
                                        allowExport: false,
                                        text: {
                                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                            show: '',
                                            entries: '',
                                        },
                                        onload: this.loadedShipments,
                                        updateTable: function (el, cell, x, y, source, value, id) {
                                            var elInstance = el.jexcel;
                                            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
                                                'K', 'L', 'M', 'N', 'O']
                                            var rowData = elInstance.getRowData(y);
                                            var erpFlag = rowData[14];
                                            if (erpFlag == true) {
                                                for (var i = 0; i < colArr.length; i++) {
                                                    var cell = elInstance.getCell(`${colArr[i]}${parseInt(y) + 1}`)
                                                    cell.classList.add('readonly');
                                                }
                                            } else {
                                            }
                                        }.bind(this),
                                        contextMenu: function (obj, x, y, e) {
                                            var items = [];
                                            items.push({
                                                title: i18n.t('static.supplyPlan.addNewShipment'),
                                                onclick: function () {
                                                    console.log("In on click");
                                                    var json = obj.getJson();
                                                    var data = [];
                                                    data[0] = "";
                                                    data[1] = "";
                                                    data[2] = "";
                                                    data[3] = "";
                                                    data[4] = "";
                                                    data[5] = "";
                                                    data[6] = "";
                                                    data[7] = "";
                                                    data[8] = "";
                                                    data[9] = "";
                                                    data[10] = "";
                                                    data[11] = `=ROUND(K${parseInt(json.length) + 1}*I${parseInt(json.length) + 1},2)`;
                                                    data[12] = "";
                                                    data[13] = "";
                                                    data[14] = false;
                                                    data[15] = ""
                                                    data[16] = -1;
                                                    data[17] = "";
                                                    data[18] = 0;
                                                    data[19] = false;
                                                    data[20] = true;
                                                    data[21] = "";
                                                    data[22] = 0;
                                                    obj.insertRow(data);
                                                }.bind(this)
                                            });
                                            var rowData = obj.getRowData(y);
                                            items.push({
                                                title: i18n.t('static.supplyPlan.qtyCalculator'),
                                                onclick: function () {
                                                    if (this.props.shipmentPage == "shipmentDataEntry") {
                                                        this.props.updateState("shipmentModalTitle", i18n.t("static.supplyPlan.qtyCalculator"));
                                                        this.props.toggleLarge();
                                                    }
                                                    document.getElementById("showSaveQtyButtonDiv").style.display = 'block';
                                                    this.el = jexcel(document.getElementById("qtyCalculatorTable"), '');
                                                    this.el.destroy();
                                                    var json = [];
                                                    var procurementAgentPlanningUnit = papuResult.filter(p => p.procurementAgent.id == rowData[2] && p.planningUnit.id == planningUnitId)[0];
                                                    var moq = procurementAgentPlanningUnit.moq;
                                                    var unitsPerPalletEuro1 = procurementAgentPlanningUnit.unitsPerPalletEuro1;
                                                    var unitsPerPalletEuro2 = procurementAgentPlanningUnit.unitsPerPalletEuro2;
                                                    var unitsPerContainer = procurementAgentPlanningUnit.unitsPerContainer;
                                                    var roundingOptionType = "hidden";
                                                    if (unitsPerPalletEuro1 != 0 && unitsPerPalletEuro1 != null) {
                                                        roundingOptionType = "dropdown";
                                                    }
                                                    var orderBasedOn = [];
                                                    orderBasedOn.push({ id: 5, name: i18n.t('static.supplyPlan.none') });
                                                    if (moq != 0 && moq != null) {
                                                        orderBasedOn.push({ id: 2, name: i18n.t('static.procurementAgentPlanningUnit.moq') });
                                                    }
                                                    if (unitsPerContainer != 0 && unitsPerContainer != null) {
                                                        orderBasedOn.push({ id: 1, name: i18n.t('static.supplyPlan.container') })
                                                    }
                                                    if (unitsPerPalletEuro1 != 0 && unitsPerPalletEuro1 != null) {
                                                        orderBasedOn.push({ id: 3, name: i18n.t('static.supplyPlan.palletEuro1') })
                                                    }
                                                    if (unitsPerPalletEuro2 != 0 && unitsPerPalletEuro2 != null) {
                                                        orderBasedOn.push({ id: 4, name: i18n.t('static.supplyPlan.palletEuro2') })
                                                    }
                                                    var tableEditable = true;
                                                    if (rowData[14].toString() == "true" || this.props.shipmentPage == "supplyPlanCompare") {
                                                        tableEditable = false;
                                                    }
                                                    var data = [];
                                                    data[0] = 2;//A
                                                    data[1] = rowData[22];//B
                                                    data[2] = rowData[8];//C
                                                    data[3] = 5;//D
                                                    data[4] = "";//E
                                                    data[5] = `=IF(
                                                        D${parseInt(0) + 1}==5,
                                                        IF(A${parseInt(0) + 1}==1,B${parseInt(0) + 1},C${parseInt(0) + 1}),
                                                        IF(
                                                                D${parseInt(0) + 1}==2,
                                                                MAX(H${parseInt(0) + 1},IF(A${parseInt(0) + 1}==1,B${parseInt(0) + 1},C${parseInt(0) + 1})),
                                                                IF(
                                                                        AND(D${parseInt(0) + 1}==1,E${parseInt(0) + 1}==1),
                                                                        FLOOR(IF(A1==1,B1,C1)/K1,1)*K${parseInt(0) + 1},
                                                                        IF(
                                                                                AND(D${parseInt(0) + 1}==1,E${parseInt(0) + 1}==2), 
                                                                                CEILING(IF(A1==1,B1,C1)/K1,1)*K${parseInt(0) + 1},
                                                                                IF(
                                                                                        AND(D${parseInt(0) + 1}==3,E${parseInt(0) + 1}==1),
                                                                                        FLOOR(IF(A1==1,B1,C1)/I1,1)*I${parseInt(0) + 1},
                                                                                        IF(
                                                                                                AND(D${parseInt(0) + 1}==3, E${parseInt(0) + 1}==2),
                                                                                                CEILING(IF(A1==1,B1,C1)/I1,1)*I${parseInt(0) + 1},
                                                                                                IF(
                                                                                                        AND(D${parseInt(0) + 1}==4, E${parseInt(0) + 1}==1),
                                                                                                        FLOOR(IF(A1==1,B1,C1)/J1,1)*J${parseInt(0) + 1},
                                                                                                        CEILING(IF(A1==1,B1,C1)/J1,1)*J${parseInt(0) + 1}
                                                                                                )
                                                                                        )
                                                                                )
                                                                        )
                                                                )
                                                        )
                                                )`;//F
                                                    data[6] = y;//G
                                                    data[7] = moq;//H
                                                    data[8] = unitsPerPalletEuro1;//I
                                                    data[9] = unitsPerPalletEuro2;//J
                                                    data[10] = unitsPerContainer;//K
                                                    data[11] = `=ROUND(IF(A1==1,B1,C1)/I1,2)`;//L
                                                    data[12] = `=ROUND(IF(A1==1,B1,C1)/J1,2)`;//M
                                                    data[13] = `=ROUND(IF(A1==1,B1,C1)/K1,2)`;//N
                                                    json.push(data)
                                                    var options = {
                                                        data: json,
                                                        columnDrag: true,
                                                        columns: [
                                                            { title: i18n.t('static.supplyPlan.adjustesOrderQty'), type: 'dropdown', source: [{ id: 1, name: i18n.t('static.supplyPlan.suggestedOrderQty') }, { id: 2, name: i18n.t('static.supplyPlan.manualOrderQty') }], width: 120 },
                                                            { title: i18n.t('static.supplyPlan.suggestedOrderQty'), type: 'numeric', mask: '#,##', width: 120, readOnly: true },
                                                            { title: i18n.t('static.supplyPlan.manualOrderQty'), type: 'numeric', mask: '#,##', width: 120 },
                                                            { type: 'dropdown', title: i18n.t('static.supplyPlan.orderBasedOn'), source: orderBasedOn, width: 120 },
                                                            { type: roundingOptionType, title: i18n.t('static.supplyPlan.roundingOption'), source: [{ id: 1, name: i18n.t('static.supplyPlan.roundDown') }, { id: 2, name: i18n.t('static.supplyPlan.roundUp') }], width: 120 },
                                                            { title: i18n.t('static.supplyPlan.finalOrderQty'), type: 'numeric', readOnly: true, mask: '#,##', width: 120 },
                                                            { title: i18n.t('static.supplyPlan.rowNumber'), type: 'hidden', width: 0 },
                                                            { type: 'hidden', readOnly: true, title: i18n.t('static.procurementAgentPlanningUnit.moq'), width: 0 },
                                                            { type: 'hidden', title: i18n.t('static.procurementAgentPlanningUnit.unitPerPalletEuro1'), width: 0 },
                                                            { type: 'hidden', title: i18n.t('static.procurementAgentPlanningUnit.unitPerPalletEuro2'), width: 0 },
                                                            { type: 'hidden', title: i18n.t('static.procurementUnit.unitsPerContainer'), width: 0 },
                                                            { type: 'hidden', title: i18n.t('static.procurementUnit.noOfPalletEuro1'), width: 0 },
                                                            { type: 'hidden', title: i18n.t('static.procurementUnit.noOfPalletEuro2'), width: 0 },
                                                            { type: 'hidden', title: i18n.t('static.procurementUnit.noOfContainers'), width: 0 },
                                                        ],
                                                        pagination: false,
                                                        search: false,
                                                        columnSorting: true,
                                                        tableOverflow: true,
                                                        wordWrap: true,
                                                        allowInsertColumn: false,
                                                        allowManualInsertColumn: false,
                                                        allowDeleteRow: false,
                                                        copyCompatibility: true,
                                                        allowInsertRow: false,
                                                        allowManualInsertRow: false,
                                                        allowExport: false,
                                                        editable: tableEditable,
                                                        onchange: this.shipmentQtyChanged,
                                                        text: {
                                                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                            show: '',
                                                            entries: '',
                                                        },
                                                        onload: this.loadedQtyCalculator,
                                                        updateTable: function (el, cell, x, y, source, value, id) {
                                                            var elInstance = el.jexcel;
                                                            var orderBasedOn = elInstance.getRowData(y)[3];
                                                            if (orderBasedOn == 1 || orderBasedOn == 3 || orderBasedOn == 4) {
                                                                var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                                                                cell.classList.remove('readonly');
                                                            } else {
                                                                var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                                                                cell.classList.add('readonly');
                                                            }
                                                        }

                                                    }
                                                    var elVar = jexcel(document.getElementById("qtyCalculatorTable"), options);
                                                    this.el = elVar;
                                                    this.setState({ qtyCalculatorTableEl: elVar });
                                                    if (unitsPerPalletEuro1 != 0 && unitsPerPalletEuro1 != null) {
                                                        var data1 = [];
                                                        var json1 = []
                                                        data1[0] = moq;//A
                                                        data1[1] = unitsPerPalletEuro1;//B
                                                        data1[2] = unitsPerPalletEuro2;//C
                                                        data1[3] = unitsPerContainer;//D
                                                        data1[4] = `=ROUND(IF(H1==1,I1,J1)/B1,2)`;//E
                                                        data1[5] = `=ROUND(IF(H1==1,I1,J1)/C1,2)`;//F
                                                        data1[6] = `=ROUND(IF(H1==1,I1,J1)/D1,2)`;//G
                                                        data1[7] = 2;//H
                                                        data1[8] = rowData[22];//I
                                                        data1[9] = rowData[8];//J
                                                        json1.push(data1)
                                                        var options1 = {
                                                            data: json1,
                                                            columnDrag: true,
                                                            columns: [
                                                                { type: 'numeric', readOnly: true, title: i18n.t('static.procurementAgentPlanningUnit.moq'), mask: '#,##', width: 120 },
                                                                { type: 'numeric', readOnly: true, title: i18n.t('static.procurementAgentPlanningUnit.unitPerPalletEuro1'), mask: '#,##', width: 120 },
                                                                { type: 'numeric', readOnly: true, title: i18n.t('static.procurementAgentPlanningUnit.unitPerPalletEuro2'), mask: '#,##', width: 120 },
                                                                { type: 'numeric', readOnly: true, title: i18n.t('static.procurementUnit.unitsPerContainer'), mask: '#,##', width: 120 },
                                                                { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfPalletsEuro1'), mask: '#,##.00', decimal: '.', width: 120 },
                                                                { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfPalletsEuro2'), mask: '#,##.00', decimal: '.', width: 120 },
                                                                { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfContainers'), mask: '#,##.00', decimal: '.', width: 120 },
                                                                { type: 'hidden' },
                                                                { type: 'hidden' },
                                                                { type: 'hidden' }
                                                            ],
                                                            pagination: false,
                                                            search: false,
                                                            columnSorting: true,
                                                            tableOverflow: true,
                                                            wordWrap: true,
                                                            allowInsertColumn: false,
                                                            allowManualInsertColumn: false,
                                                            allowDeleteRow: false,
                                                            copyCompatibility: true,
                                                            allowInsertRow: false,
                                                            allowManualInsertRow: false,
                                                            allowExport: false,
                                                            editable: false,
                                                            text: {
                                                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                                show: '',
                                                                entries: '',
                                                            },
                                                            onload: this.loadedQtyCalculator1,

                                                        }
                                                        var elVar1 = jexcel(document.getElementById("qtyCalculatorTable1"), options1);
                                                        this.el = elVar1;
                                                        this.setState({ qtyCalculatorTableEl1: elVar1 });
                                                    }
                                                }.bind(this)
                                            });

                                            if (rowData[2] != "" && rowData[7] != "") {
                                                items.push({
                                                    title: i18n.t('static.supplyPlan.showShipmentDates'),
                                                    onclick: function () {
                                                        if (this.props.shipmentPage == "shipmentDataEntry") {
                                                            this.props.updateState("shipmentModalTitle", i18n.t("static.shipment.shipmentDates"));
                                                            this.props.toggleLarge();
                                                        }
                                                        document.getElementById("showSaveShipmentsDatesButtonsDiv").style.display = 'block';
                                                        this.el = jexcel(document.getElementById("shipmentDatesTable"), '');
                                                        this.el.destroy();
                                                        var json = [];
                                                        var shipmentDates = rowData[21];
                                                        var emergencyOrder = rowData[19];
                                                        var shipmentStatus = rowData[0];
                                                        var lastShipmentStatus = rowData[15];
                                                        var editable = true;
                                                        if (shipmentStatus == lastShipmentStatus) {
                                                            editable = false;
                                                        }

                                                        var plannedDate = "";
                                                        var expectedPlannedDate = "";
                                                        var submittedDate = "";
                                                        var expectedSubmittedDate = "";
                                                        var approvedDate = "";
                                                        var expectedApprovedDate = "";
                                                        var shippedDate = "";
                                                        var expectedShippedDate = "";
                                                        var arrivedDate = "";
                                                        var expectedArrivedDate = "";
                                                        var receivedDate = "";
                                                        var expectedDeliveryDate = "";
                                                        var plannedDateEditable = false;
                                                        var submittedDateEditable = false;
                                                        var approvedDateEditable = false;
                                                        var shippedDateEditable = false;
                                                        var arrivedDateEditable = false;
                                                        var receivedDateEditable = false;
                                                        expectedPlannedDate = shipmentDates.plannedDate;
                                                        expectedSubmittedDate = shipmentDates.submittedDate;
                                                        expectedApprovedDate = shipmentDates.approvedDate;
                                                        expectedShippedDate = shipmentDates.shippedDate;
                                                        expectedArrivedDate = shipmentDates.arrivedDate;
                                                        expectedDeliveryDate = shipmentDates.expectedDeliveryDate;

                                                        if (shipmentStatus == PLANNED_SHIPMENT_STATUS) {
                                                            plannedDate = shipmentDates.plannedDate;
                                                            if (shipmentStatus != lastShipmentStatus) {
                                                                plannedDateEditable = true;
                                                            }
                                                        } else if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                                                            plannedDate = shipmentDates.plannedDate;
                                                            submittedDate = shipmentDates.submittedDate;
                                                            if (shipmentStatus != lastShipmentStatus) {
                                                                submittedDateEditable = true;
                                                            }
                                                        } else if (shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                                                            plannedDate = shipmentDates.plannedDate;
                                                            submittedDate = shipmentDates.submittedDate;
                                                            approvedDate = shipmentDates.approvedDate;
                                                            if (shipmentStatus != lastShipmentStatus) {
                                                                approvedDateEditable = true;
                                                            }
                                                        } else if (shipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                                                            plannedDate = shipmentDates.plannedDate;
                                                            submittedDate = shipmentDates.submittedDate;
                                                            approvedDate = shipmentDates.approvedDate;
                                                            shippedDate = shipmentDates.shippedDate;
                                                            if (shipmentStatus != lastShipmentStatus) {
                                                                shippedDateEditable = true;
                                                            }
                                                        } else if (shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                                                            plannedDate = shipmentDates.plannedDate;
                                                            submittedDate = shipmentDates.submittedDate;
                                                            approvedDate = shipmentDates.approvedDate;
                                                            shippedDate = shipmentDates.shippedDate;
                                                            arrivedDate = shipmentDates.arrivedDate;
                                                            if (shipmentStatus != lastShipmentStatus) {
                                                                arrivedDateEditable = true;
                                                            }
                                                        } else if (shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                                                            plannedDate = shipmentDates.plannedDate;
                                                            submittedDate = shipmentDates.submittedDate;
                                                            approvedDate = shipmentDates.approvedDate;
                                                            shippedDate = shipmentDates.shippedDate;
                                                            arrivedDate = shipmentDates.arrivedDate;
                                                            receivedDate = shipmentDates.receivedDate;
                                                            if (shipmentStatus != lastShipmentStatus) {
                                                                receivedDateEditable = true;
                                                            }
                                                        }

                                                        var tableEditable = true;
                                                        if (rowData[14].toString() == "true" || this.props.shipmentPage == "supplyPlanCompare") {
                                                            tableEditable = false;
                                                        }

                                                        var data = [];
                                                        data[0] = i18n.t("static.consumption.actual")
                                                        data[1] = plannedDate;
                                                        data[2] = submittedDate;
                                                        data[3] = approvedDate;
                                                        data[4] = shippedDate;
                                                        data[5] = arrivedDate;
                                                        data[6] = receivedDate;
                                                        data[7] = y;
                                                        json.push(data);
                                                        data = [];
                                                        data[0] = i18n.t("static.supplyPlan.estimated")
                                                        data[1] = expectedPlannedDate;
                                                        data[2] = expectedSubmittedDate;
                                                        data[3] = expectedApprovedDate;
                                                        data[4] = expectedShippedDate;
                                                        data[5] = expectedArrivedDate;
                                                        data[6] = expectedDeliveryDate;
                                                        data[7] = y;
                                                        json.push(data);
                                                        var options = {
                                                            data: json,
                                                            columnDrag: true,
                                                            colWidths: [80, 100, 100, 100, 100, 100, 100],
                                                            columns: [
                                                                {
                                                                    title: i18n.t('static.supplyPlan.type'),
                                                                    type: 'text',
                                                                    readOnly: true
                                                                },
                                                                {
                                                                    title: i18n.t('static.supplyPlan.plannedDate'),
                                                                    type: 'calendar',
                                                                    options: {
                                                                        format: 'MM-DD-YYYY',
                                                                        validRange: [moment(Date.now()).subtract(1, 'months').format("YYYY-MM-DD"), moment(Date.now()).format("YYYY-MM-DD")]
                                                                    }
                                                                },
                                                                {
                                                                    title: i18n.t('static.supplyPlan.submittedDate'),
                                                                    type: 'calendar',
                                                                    options: {
                                                                        format: 'MM-DD-YYYY',
                                                                        validRange: [moment(Date.now()).subtract(1, 'months').format("YYYY-MM-DD"), moment(Date.now()).format("YYYY-MM-DD")]
                                                                    }
                                                                },
                                                                {
                                                                    title: i18n.t('static.supplyPlan.approvedDate'),
                                                                    type: 'calendar',
                                                                    options: {
                                                                        format: 'MM-DD-YYYY',
                                                                        validRange: [moment(Date.now()).subtract(1, 'months').format("YYYY-MM-DD"), moment(Date.now()).format("YYYY-MM-DD")]
                                                                    }
                                                                },
                                                                {
                                                                    title: i18n.t('static.supplyPlan.shippedDate'),
                                                                    type: 'calendar',
                                                                    options: {
                                                                        format: 'MM-DD-YYYY',
                                                                        validRange: [moment(Date.now()).subtract(1, 'months').format("YYYY-MM-DD"), moment(Date.now()).format("YYYY-MM-DD")]
                                                                    }
                                                                },
                                                                {
                                                                    title: i18n.t('static.supplyPlan.arrivedDate'),
                                                                    type: 'calendar',
                                                                    options: {
                                                                        format: 'MM-DD-YYYY',
                                                                        validRange: [moment(Date.now()).subtract(1, 'months').format("YYYY-MM-DD"), moment(Date.now()).format("YYYY-MM-DD")]
                                                                    }
                                                                },
                                                                {
                                                                    title: i18n.t('static.shipment.receiveddate'),
                                                                    type: 'calendar',
                                                                    options: {
                                                                        format: 'MM-DD-YYYY',
                                                                        validRange: [moment(Date.now()).subtract(1, 'months').format("YYYY-MM-DD"), moment(Date.now()).format("YYYY-MM-DD")]
                                                                    }
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
                                                            copyCompatibility: true,
                                                            allowInsertRow: false,
                                                            allowManualInsertRow: false,
                                                            allowExport: false,
                                                            onchange: this.shipmentDatesChanged,
                                                            editable: tableEditable,
                                                            text: {
                                                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                                show: '',
                                                                entries: '',
                                                            },
                                                            onload: this.loadedShipmentDates,
                                                            updateTable: function (el, cell, x, y, source, value, id) {
                                                                var elInstance = el.jexcel;
                                                                var rowNumber = elInstance.getRowData(y)[7];
                                                                var shipmentInstance = this.state.shipmentsEl;
                                                                var shipmentRowData = shipmentInstance.getRowData(rowNumber);
                                                                var emergencyOrder = shipmentRowData[19];
                                                                var shipmentStatus = shipmentRowData[0];
                                                                var lastShipmentStatus = shipmentRowData[15];
                                                                if (emergencyOrder.toString() == "true") {
                                                                    var cell = elInstance.getCell(`B${parseInt(1) + 1}`)
                                                                    cell.classList.remove('readonly');
                                                                    var cell = elInstance.getCell(`C${parseInt(1) + 1}`)
                                                                    cell.classList.remove('readonly');
                                                                    var cell = elInstance.getCell(`D${parseInt(1) + 1}`)
                                                                    cell.classList.remove('readonly');
                                                                    var cell = elInstance.getCell(`E${parseInt(1) + 1}`)
                                                                    cell.classList.remove('readonly');
                                                                    var cell = elInstance.getCell(`F${parseInt(1) + 1}`)
                                                                    cell.classList.remove('readonly');
                                                                    var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                    cell.classList.remove('readonly');
                                                                    if (shipmentStatus == PLANNED_SHIPMENT_STATUS) {
                                                                        if (shipmentStatus != lastShipmentStatus) {
                                                                            var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                            cell.classList.remove('readonly');
                                                                        } else {
                                                                            var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                            cell.classList.add('readonly');
                                                                        }
                                                                        var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`C${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                    } else if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                                                                        if (shipmentStatus != lastShipmentStatus) {
                                                                            var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                            cell.classList.remove('readonly');
                                                                        } else {
                                                                            var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                            cell.classList.add('readonly');
                                                                        }
                                                                        var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`C${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                    } else if (shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                                                                        if (shipmentStatus != lastShipmentStatus) {
                                                                            var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                            cell.classList.remove('readonly');
                                                                        } else {
                                                                            var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                            cell.classList.add('readonly');
                                                                        }
                                                                        var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`C${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                    } else if (shipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                                                                        if (shipmentStatus != lastShipmentStatus) {
                                                                            var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                            cell.classList.remove('readonly');
                                                                        } else {
                                                                            var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                            cell.classList.add('readonly');
                                                                        }
                                                                        var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`C${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                    } else if (shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                                                                        if (shipmentStatus != lastShipmentStatus) {
                                                                            var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                            cell.classList.remove('readonly');
                                                                        } else {
                                                                            var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                            cell.classList.add('readonly');
                                                                        }
                                                                        var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`C${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                        cell.classList.remove('readonly');
                                                                    } else if (shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                                                                        if (shipmentStatus != lastShipmentStatus) {
                                                                            var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                            cell.classList.remove('readonly');
                                                                        } else {
                                                                            var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                            cell.classList.add('readonly');
                                                                        }
                                                                        var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`C${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                    }
                                                                } else {
                                                                    var cell = elInstance.getCell(`B${parseInt(1) + 1}`)
                                                                    cell.classList.add('readonly');
                                                                    var cell = elInstance.getCell(`C${parseInt(1) + 1}`)
                                                                    cell.classList.add('readonly');
                                                                    var cell = elInstance.getCell(`D${parseInt(1) + 1}`)
                                                                    cell.classList.add('readonly');
                                                                    var cell = elInstance.getCell(`E${parseInt(1) + 1}`)
                                                                    cell.classList.add('readonly');
                                                                    var cell = elInstance.getCell(`F${parseInt(1) + 1}`)
                                                                    cell.classList.add('readonly');
                                                                    var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                    cell.classList.add('readonly');
                                                                    if (shipmentStatus == PLANNED_SHIPMENT_STATUS) {
                                                                        if (shipmentStatus != lastShipmentStatus) {
                                                                            var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                            cell.classList.remove('readonly');
                                                                        } else {
                                                                            var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                            cell.classList.add('readonly');
                                                                        }
                                                                        var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                    } else if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                                                                        if (shipmentStatus != lastShipmentStatus) {
                                                                            var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                            cell.classList.remove('readonly');
                                                                        } else {
                                                                            var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                            cell.classList.add('readonly');
                                                                        }
                                                                        var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`C${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                    } else if (shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                                                                        if (shipmentStatus != lastShipmentStatus) {
                                                                            var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                            cell.classList.remove('readonly');
                                                                        } else {
                                                                            var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                            cell.classList.add('readonly');
                                                                        }
                                                                        var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                    } else if (shipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                                                                        if (shipmentStatus != lastShipmentStatus) {
                                                                            var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                            cell.classList.remove('readonly');
                                                                        } else {
                                                                            var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                            cell.classList.add('readonly');
                                                                        }
                                                                        var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                    } else if (shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                                                                        if (shipmentStatus != lastShipmentStatus) {
                                                                            var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                            cell.classList.remove('readonly');
                                                                        } else {
                                                                            var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                            cell.classList.add('readonly');
                                                                        }
                                                                        var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                    } else if (shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                                                                        if (shipmentStatus != lastShipmentStatus) {
                                                                            var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                            cell.classList.remove('readonly');
                                                                        } else {
                                                                            var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                            cell.classList.add('readonly');
                                                                        }
                                                                        var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                        var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                        cell.classList.add('readonly');
                                                                    }
                                                                }
                                                            }.bind(this)
                                                        };
                                                        var elVar = jexcel(document.getElementById("shipmentDatesTable"), options);
                                                        this.el = elVar;
                                                        this.setState({ shipmentDatesTableEl: elVar });
                                                    }.bind(this)
                                                });
                                            }

                                            // Add shipment batch info
                                            var rowData = obj.getRowData(y);
                                            var expectedDeliveryDate = moment(rowData[1]).format("YYYY-MM-DD");
                                            var expiryDate = moment(expectedDeliveryDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                                            if ((rowData[0] == DELIVERED_SHIPMENT_STATUS || rowData[0] == SHIPPED_SHIPMENT_STATUS || rowData[0] == ARRIVED_SHIPMENT_STATUS)) {
                                                items.push({
                                                    title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                                    onclick: function () {
                                                        if (this.props.shipmentPage == "shipmentDataEntry") {
                                                            this.props.updateState("shipmentModalTitle", i18n.t("static.dataEntry.batchDetails"));
                                                            this.props.toggleLarge();
                                                        }
                                                        var batchInfoListAll = this.props.items.programJson.batchInfoList.filter(c => c.planningUnitId == document.getElementById("planningUnitId").value);
                                                        this.setState({
                                                            batchInfoListAll: batchInfoListAll
                                                        })
                                                        document.getElementById("showShipmentBatchInfoButtonsDiv").style.display = 'block';
                                                        this.el = jexcel(document.getElementById("shipmentBatchInfoTable"), '');
                                                        this.el.destroy();
                                                        var json = [];
                                                        // var elInstance=this.state.plannedPsmShipmentsEl;
                                                        var rowData = obj.getRowData(y)
                                                        var batchInfo = rowData[17];
                                                        var tableEditable = true;
                                                        if (rowData[14].toString() == "true" || this.props.shipmentPage == "supplyPlanCompare") {
                                                            tableEditable = false;
                                                        }
                                                        for (var sb = 0; sb < batchInfo.length; sb++) {
                                                            var data = [];
                                                            data[0] = batchInfo[sb].batch.batchNo;
                                                            data[1] = batchInfo[sb].batch.expiryDate;
                                                            data[2] = batchInfo[sb].shipmentQty;
                                                            data[3] = batchInfo[sb].shipmentTransBatchInfoId;
                                                            data[4] = y;
                                                            data[5] = batchInfoListAll.findIndex(c => c.batchNo == batchInfo[sb].batch.batchNo)
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
                                                            allowInsertRow: true,
                                                            allowManualInsertRow: false,
                                                            editable: tableEditable,
                                                            onchange: this.batchInfoChangedShipment,
                                                            allowExport: false,
                                                            text: {
                                                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                                show: '',
                                                                entries: '',
                                                            },
                                                            onload: this.loadedBatchInfoShipment,
                                                            contextMenu: function (obj, x, y, e) {
                                                                var items = [];
                                                                if (y == null) {
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
                                                                }
                                                                return items;
                                                            }.bind(this)
                                                        };
                                                        var elVar = jexcel(document.getElementById("shipmentBatchInfoTable"), options);
                                                        this.el = elVar;
                                                        this.setState({ shipmentBatchInfoTableEl: elVar });
                                                    }.bind(this)
                                                });
                                            }
                                            if (rowData[19].toString() == "true") {
                                                items.push({
                                                    title: i18n.t('static.supplyPlan.doNotConsideAsEmergencyOrder'),
                                                    onclick: function () {
                                                        obj.setValueFromCoords(19, y, false, true);
                                                    }.bind(this)
                                                });
                                            }
                                            if (rowData[19].toString() == "false" && rowData[14].toString() == "false") {
                                                items.push({
                                                    title: i18n.t('static.supplyPlan.consideAsEmergencyOrder'),
                                                    onclick: function () {
                                                        obj.setValueFromCoords(19, y, true, true);
                                                    }.bind(this)
                                                });
                                            }

                                            if (rowData[20].toString() == "true" && rowData[14].toString() == "false") {
                                                items.push({
                                                    title: i18n.t('static.supplyPlan.doNotIncludeInProjectedShipment'),
                                                    onclick: function () {
                                                        obj.setValueFromCoords(20, y, false, true);
                                                    }.bind(this)
                                                });
                                            }
                                            if (rowData[20].toString() == "false" && rowData[14].toString() == "false") {
                                                items.push({
                                                    title: i18n.t('static.supplyPlan.includeInProjectedShipment'),
                                                    onclick: function () {
                                                        obj.setValueFromCoords(20, y, true, true);
                                                    }.bind(this)
                                                });
                                            }
                                            return items;
                                        }.bind(this)
                                    }

                                    var myVar = jexcel(document.getElementById("shipmentsDetailsTable"), options);
                                    this.el = myVar;
                                    this.setState({
                                        shipmentsEl: myVar,
                                    })
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this);
    }

    loadedShipments = function (instance, cell, x, y, value) {
        if (this.props.shipmentPage != "shipmentDataEntry") {
            jExcelLoadedFunctionOnlyHideRow(instance);
        } else {
            jExcelLoadedFunction(instance);
        }
    }

    loadedQtyCalculator = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    loadedQtyCalculator1 = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    budgetDropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[3];
        console.log("Value", value);
        if (value != "") {
            var budgetList = this.state.budgetListAll;
            console.log("budgetList", this.state.budgetListAll);
            mylist = budgetList.filter(b => b.fundingSource.fundingSourceId == value);
        }
        console.log("mylist", mylist);
        return mylist;
    }

    shipmentChanged = function (instance, cell, x, y, value) {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var elInstance = this.state.shipmentsEl;
        var rowData = elInstance.getRowData(y);
        this.props.updateState("shipmentError", "");
        this.props.updateState("noFundsBudgetError", "");
        if (x == 0) {
            var valid = checkValidtion("text", "A", y, value, elInstance);
            console.log("Valid", valid);
            if (valid == true) {
                if (value == SUBMITTED_SHIPMENT_STATUS || value == ARRIVED_SHIPMENT_STATUS || value == SHIPPED_SHIPMENT_STATUS || value == DELIVERED_SHIPMENT_STATUS || value == APPROVED_SHIPMENT_STATUS) {
                    var budget = rowData[4];
                    var valid = checkValidtion("text", "E", y, budget, elInstance);
                    var procurementAgent = rowData[2];
                    var fundingSource = rowData[3];
                    if (procurementAgent == TBD_PROCUREMENT_AGENT_ID) {
                        inValid("C", y, i18n.t('static.supplyPlan.procurementAgentCannotBeTBD'), elInstance);
                    } else {
                        positiveValidation("C", y, elInstance);
                    }

                    if (fundingSource == TBD_FUNDING_SOURCE) {
                        inValid("D", y, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'), elInstance);
                    } else {
                        positiveValidation("D", y, elInstance);
                    }
                } else {
                    positiveValidation("E", y, elInstance);
                    positiveValidation("C", y, elInstance);
                    positiveValidation("D", y, elInstance);
                }
                this.calculateLeadTimesOnChange(y);

            }
        }

        if (x == 4) {
            var value = rowData[0];
            if (value == SUBMITTED_SHIPMENT_STATUS || value == ARRIVED_SHIPMENT_STATUS || value == SHIPPED_SHIPMENT_STATUS || value == DELIVERED_SHIPMENT_STATUS || value == APPROVED_SHIPMENT_STATUS) {
                var budget = rowData[4];
                var valid = checkValidtion("text", "E", y, budget, elInstance);
            }
        }

        if (x == 2) {
            var valid = checkValidtion("text", "C", y, rowData[2], elInstance);
            elInstance.setValueFromCoords(10, y, "", true);
            if (valid == true) {
                var shipmentStatus = rowData[0];
                if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                    if (rowData[2] == TBD_PROCUREMENT_AGENT_ID) {
                        inValid("C", y, i18n.t('static.supplyPlan.procurementAgentCannotBeTBD'), elInstance);
                    } else {
                        positiveValidation("C", y, elInstance);
                        valid = true;
                    }
                }
            }
            if (valid == true) {
                var procurementAgentPlanningUnit = this.state.procurementAgentPlanningUnitListAll.filter(c => c.procurementAgent.id == rowData[2] && c.planningUnit.id == planningUnitId)[0];
                var pricePerUnit = parseFloat(procurementAgentPlanningUnit.catalogPrice);
                if (rowData[9] != "") {
                    var conversionRateToUsd = parseFloat((this.state.currencyListAll.filter(c => c.currencyId == rowData[9])[0]).conversionRateToUsd);
                    pricePerUnit = parseFloat(pricePerUnit / conversionRateToUsd).toFixed(2);
                    elInstance.setValueFromCoords(10, y, pricePerUnit, true);
                }
                this.calculateLeadTimesOnChange(y)
            }
        }

        if (x == 9) {
            var valid = checkValidtion("text", "J", y, rowData[9], elInstance);
            if (valid == true) {
                if (rowData[2] != "") {
                    var procurementAgentPlanningUnit = this.state.procurementAgentPlanningUnitListAll.filter(c => c.procurementAgent.id == rowData[2] && c.planningUnit.id == planningUnitId)[0];
                    var pricePerUnit = parseFloat(procurementAgentPlanningUnit.catalogPrice);
                    var conversionRateToUsd = parseFloat((this.state.currencyListAll.filter(c => c.currencyId == rowData[9])[0]).conversionRateToUsd);
                    pricePerUnit = parseFloat(pricePerUnit / conversionRateToUsd).toFixed(2);
                    elInstance.setValueFromCoords(10, y, pricePerUnit, true);
                }
            }
        }

        if (x == 3) {
            var valid = checkValidtion("text", "D", y, rowData[3], elInstance);
            elInstance.setValueFromCoords(4, y, "", true);
            if (valid == true) {
                console.log("in valid")
                var shipmentStatus = rowData[0];
                if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                    if (rowData[3] == TBD_FUNDING_SOURCE) {
                        inValid("D", y, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'), elInstance);
                    } else {
                        positiveValidation("D", y, elInstance);
                    }
                }
            }
        }

        if (x == 6) {
            checkValidtion("text", "G", y, rowData[6], elInstance);
        }

        if (x == 7) {
            var valid = checkValidtion("text", "H", y, rowData[7], elInstance);
            if (valid == true) {
                var rate = ((elInstance.getCell(`L${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", "");
                var freightCost = 0;
                if (rowData[7] == 1) {
                    var seaFreightPercentage = this.props.items.programJson.seaFreightPerc;
                    freightCost = parseFloat(rate) * (parseFloat(parseFloat(seaFreightPercentage) / 100));
                    elInstance.setValueFromCoords(12, y, freightCost, true);
                } else {
                    var airFreightPercentage = this.props.items.programJson.airFreightPerc;
                    freightCost = parseFloat(rate) * (parseFloat(parseFloat(airFreightPercentage) / 100));
                    elInstance.setValueFromCoords(12, y, freightCost, true);
                }
                this.calculateLeadTimesOnChange(y);
            }
        }

        if (x == 11) {
            var rate = ((elInstance.getCell(`L${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", "");
            var freightCost = 0;
            if (rowData[7] == 1) {
                var seaFreightPercentage = this.props.items.programJson.seaFreightPerc;
                freightCost = parseFloat(rate) * (parseFloat(parseFloat(seaFreightPercentage) / 100));
                elInstance.setValueFromCoords(12, y, freightCost, true);
            } else {
                var airFreightPercentage = this.props.items.programJson.airFreightPerc;
                freightCost = parseFloat(rate) * (parseFloat(parseFloat(airFreightPercentage) / 100));
                elInstance.setValueFromCoords(12, y, freightCost, true);
            }
        }

        if (x == 8) {
            checkValidtion("number", "I", y, rowData[8], elInstance, INTEGER_NO_REGEX, 1);
        }

        if (x == 10) {
            checkValidtion("number", "K", y, rowData[10], elInstance, DECIMAL_NO_REGEX, 1);
        }

        if (x == 12) {
            checkValidtion("number", "M", y, rowData[12], elInstance, DECIMAL_NO_REGEX, 1);
        }

        if (x == 18) {
            if (value != 0) {
                var adjustedQty = ((elInstance.getCell(`I${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", "");
                if (value != adjustedQty) {
                    inValid("I", y, i18n.t('static.supplyPlan.batchNumberMissing'), elInstance);
                    this.props.updateState("shipmentBatchError", i18n.t('static.supplyPlan.batchNumberMissing'));
                } else {
                    positiveValidation("I", y, elInstance);
                    this.props.updateState("shipmentBatchError", "");
                }
            }
        }
        this.props.updateState("shipmentChangedFlag", 1);
    }

    shipmentQtyChanged = function (instance, cell, x, y, value) {
        this.props.updateState("qtyCalculatorValidationError", "");
        this.props.updateState("shipmentQtyChangedFlag", 1);
        var elInstance = this.state.qtyCalculatorTableEl;
        var elInstance1 = this.state.qtyCalculatorTableEl1;
        var rowData = elInstance.getRowData(y);
        if (x == 0) {
            elInstance1.setValueFromCoords(7, 0, value, true);
        }

        if (x == 1) {
            elInstance1.setValueFromCoords(8, 0, value, true);
        }

        if (x == 2) {
            elInstance1.setValueFromCoords(9, 0, value, true);
        }

        if (x == 4) {
            if (value == "" && (rowData[3] == 1 || rowData[3] == 3 || rowData[3] == 4)) {
                console.log("in if")
                elInstance.setValueFromCoords(4, 0, 1, true);
            }
        }

        if (x == 5) {
            checkValidtion("number", "F", y, ((elInstance.getCell(`F${parseInt(0) + 1}`)).innerHTML).toString().replaceAll("\,", ""), elInstance, INTEGER_NO_REGEX, 1);
        }

        if (x == 3) {
            if (value == 1 || value == 3 || value == 4) {
                elInstance.setValueFromCoords(4, y, 1, true);
            } else {
                elInstance.setValueFromCoords(4, y, "", true);
            }
        }
    }

    saveShipmentQty() {
        var validation = this.checkValidationForShipmentQty();
        if (validation == true) {
            var elInstance = this.state.qtyCalculatorTableEl;
            var elInstance1 = this.state.qtyCalculatorTableEl1;
            var rowData = elInstance.getRowData(0);
            var shipmentQty = ((elInstance.getCell(`F${parseInt(0) + 1}`)).innerHTML).toString().replaceAll("\,", "");
            console.log("shipmentQTy", shipmentQty);
            var rowNumber = rowData[6];
            console.log("rowNumber", rowNumber);
            var shipmentInstance = this.state.shipmentsEl;
            shipmentInstance.setValueFromCoords(8, rowNumber, shipmentQty, true);
            this.props.updateState("shipmentQtyChangedFlag", 0);
            this.props.updateState("shipmentChangedFlag", 1);
            this.props.updateState("qtyCalculatorTableEl", "");
            this.props.updateState("qtyCalculatorTableEl", "");
            this.setState({
                qtyCalculatorTableEl: "",
                qtyCalculatorTableEl1: ""
            })
            document.getElementById("showSaveQtyButtonDiv").style.display = 'none';
            this.props.updateState("qtyCalculatorValidationError", "");
            if (this.props.shipmentPage == "shipmentDataEntry") {
                this.props.toggleLarge();
            }
            elInstance.destroy();
            elInstance1.destroy();
        } else {
            this.props.updateState("qtyCalculatorValidationError", i18n.t('static.supplyPlan.validationFailed'));
        }
    }

    checkValidationForShipmentQty() {
        var elInstance = this.state.qtyCalculatorTableEl;
        var y = 0;
        var valid = checkValidtion("number", "F", y, ((elInstance.getCell(`F${parseInt(0) + 1}`)).innerHTML).toString().replaceAll("\,", ""), elInstance, INTEGER_NO_REGEX, 1);
        return valid;
    }

    loadedBatchInfoShipment = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    batchInfoChangedShipment = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);
        this.props.updateState("shipmentValidationBatchError", "");
        if (x == 0) {
            this.props.updateState("shipmentBatchInfoDuplicateError", "");
            positiveValidation("A", y, elInstance);
        }

        if (x == 1) {
            checkValidtion("text", "B", y, rowData[1], elInstance);
        }
        if (x == 2) {
            checkValidtion("number", "C", y, rowData[2], elInstance, INTEGER_NO_REGEX, 1);
        }
        this.props.updateState("shipmentBatchInfoChangedFlag", 1);
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
                    inValid(colArr[c], y, i18n.t('static.supplyPlan.duplicateBatchNumber'), elInstance);
                }
                valid = false;
                this.props.updateState("shipmentBatchInfoDuplicateError", i18n.t('static.supplyPlan.duplicateBatchNumber'));
            } else {
                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    positiveValidation(colArr[c], y, elInstance);
                }

                var rowData = elInstance.getRowData(y);
                var validation = checkValidtion("text", "B", y, rowData[1], elInstance);
                if (validation.toString() == "false") {
                    valid = false;
                }
                var validation = checkValidtion("number", "C", y, rowData[2], elInstance, INTEGER_NO_REGEX, 1);
                if (validation.toString() == "false") {
                    valid = false;
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
                    var programId = (document.getElementById("programId").value).split("_")[0];
                    var planningUnitId = document.getElementById("planningUnitId").value;
                    programId = paddingZero(programId, 0, 6);
                    planningUnitId = paddingZero(planningUnitId, 0, 8);
                    batchNo = (programId).concat(planningUnitId).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                    console.log("BatchNo", batchNo);
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
            shipmentInstance.setValueFromCoords(17, rowNumber, batchInfoArray, true);
            shipmentInstance.setValueFromCoords(18, rowNumber, totalShipmentQty, true);
            this.props.updateState("shipmentChangedFlag", 1);
            this.props.updateState("shipmentBatchInfoChangedFlag", 0);
            this.props.updateState("shipmentBatchInfoTableEl", "");
            this.setState({
                shipmentBatchInfoTableEl: ""
            })
            document.getElementById("showShipmentBatchInfoButtonsDiv").style.display = 'none';
            if (this.props.shipmentPage == "shipmentDataEntry") {
                this.props.toggleLarge();
            }
            elInstance.destroy();
        } else {
            this.props.updateState("shipmentValidationBatchError", i18n.t('static.supplyPlan.validationFailed'));
        }
    }

    loadedShipmentDates = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    calculateLeadTimesOnChange(y) {
        console.log("In calculate method")
        // Logic for dates
        console.log("In valid")
        var elInstance = this.state.shipmentsEl;
        var rowData = elInstance.getRowData(y);
        var shipmentMode = rowData[7];
        var procurementAgent = rowData[2];
        var shipmentDatesJson = rowData[21];
        var shipmentStatus = rowData[0];
        var lastShipmentStatus = rowData[15];
        console.log("shipmentStatus", shipmentStatus);
        console.log("lastShipmentStatus", lastShipmentStatus);
        var addLeadTimes = 0;
        if (shipmentMode != "" && procurementAgent != "" && shipmentStatus != "") {
            console.log("In if");
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var programJson = this.props.items.programJson;
                var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                var papuOs = papuTransaction.objectStore('procurementAgent');
                var papuRequest = papuOs.get(parseInt(procurementAgent));
                papuRequest.onerror = function (event) {
                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                }.bind(this);
                papuRequest.onsuccess = function (event) {
                    var papuResult = [];
                    papuResult = papuRequest.result;

                    var plannedDate = shipmentDatesJson.plannedDate;
                    var submittedDate = shipmentDatesJson.submittedDate;
                    var approvedDate = shipmentDatesJson.approvedDate;
                    var shippedDate = shipmentDatesJson.shippedDate;
                    var arrivedDate = shipmentDatesJson.arrivedDate;
                    var receivedDate = shipmentDatesJson.receivedDate;
                    var expectedDeliveryDate = shipmentDatesJson.expectedDeliveryDate;
                    console.log("submittedDate", submittedDate);
                    if (papuResult.localProcurementAgent) {
                        addLeadTimes = this.state.programPlanningUnitList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].localProcurementLeadTime;
                        var leadTimesPerStatus = addLeadTimes / 5;
                        if (shipmentStatus == PLANNED_SHIPMENT_STATUS) {
                            if (shipmentStatus != lastShipmentStatus && shipmentStatus == PLANNED_SHIPMENT_STATUS) {
                                plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                            if (rowData[19].toString() == "false" || submittedDate == "" || submittedDate == null) {
                                submittedDate = moment(plannedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            }
                        }
                        if (shipmentStatus == PLANNED_SHIPMENT_STATUS || shipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                            if (shipmentStatus != lastShipmentStatus && shipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                                if (plannedDate == "" || plannedDate == null) {
                                    plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                            if (rowData[19].toString() == "false" || approvedDate == "" || approvedDate == null) {
                                approvedDate = moment(submittedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            }
                        }
                        if (shipmentStatus == PLANNED_SHIPMENT_STATUS || shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                            if (shipmentStatus != lastShipmentStatus && shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                                if (plannedDate == "" || plannedDate == null) {
                                    plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (submittedDate == "" || submittedDate == null) {
                                    submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                approvedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                            if (rowData[19].toString() == "false" || shippedDate == null || shippedDate == "") {
                                shippedDate = moment(approvedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            }
                        }
                        if (shipmentStatus == PLANNED_SHIPMENT_STATUS || shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                            if (shipmentStatus != lastShipmentStatus && shipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                                if (plannedDate == "" || plannedDate == null) {
                                    plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (submittedDate == "" || submittedDate == null) {
                                    submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (approvedDate == "" || approvedDate == null) {
                                    approvedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                shippedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                            if (rowData[19].toString() == "false" || arrivedDate == null || arrivedDate == "") {
                                arrivedDate = moment(shippedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            }
                        }
                        if (shipmentStatus == PLANNED_SHIPMENT_STATUS || shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                            if (shipmentStatus != lastShipmentStatus && shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                                if (plannedDate == "" || plannedDate == null) {
                                    plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (submittedDate == "" || submittedDate == null) {
                                    submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (approvedDate == "" || approvedDate == null) {
                                    approvedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (shippedDate == "" || shippedDate == null) {
                                    shippedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                arrivedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                            if (rowData[19].toString() == "false" || expectedDeliveryDate == null || expectedDeliveryDate == "" || receivedDate == null || receivedDate == "") {
                                expectedDeliveryDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                receivedDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            }
                        }
                        if (shipmentStatus == PLANNED_SHIPMENT_STATUS || shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                            if (shipmentStatus != lastShipmentStatus && shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                                if (plannedDate == "" || plannedDate == null) {
                                    plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (submittedDate == "" || submittedDate == null) {
                                    submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (approvedDate == "" || approvedDate == null) {
                                    approvedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (shippedDate == "" || shippedDate == null) {
                                    shippedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (arrivedDate == "" || arrivedDate == null) {
                                    arrivedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                receivedDate = moment(Date.now()).format("YYYY-MM-DD");
                                expectedDeliveryDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                        }
                    } else {
                        console.log("in eklse");
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
                        if (shipmentMode == 2) {
                            shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedByAirLeadTime);
                        } else {
                            shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                        }
                        console.log("After lead times")
                        if (shipmentStatus == PLANNED_SHIPMENT_STATUS) {
                            if (shipmentStatus != lastShipmentStatus) {
                                plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                            if (rowData[19].toString() == "false" || submittedDate == null || submittedDate == "") {
                                submittedDate = moment(plannedDate).add(parseInt(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            }
                        }
                        if (shipmentStatus == PLANNED_SHIPMENT_STATUS || shipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                            if (shipmentStatus != lastShipmentStatus && shipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                                if (plannedDate == "" || plannedDate == null) {
                                    plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                            if (rowData[19].toString() == "false" || approvedDate == "" || approvedDate == null) {
                                approvedDate = moment(submittedDate).add(parseInt(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            }
                        }
                        if (shipmentStatus == PLANNED_SHIPMENT_STATUS || shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                            if (shipmentStatus != lastShipmentStatus && shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                                if (plannedDate == "" || plannedDate == null) {
                                    plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (submittedDate == "" || submittedDate == null) {
                                    submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                approvedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                            if (rowData[19].toString() == "false" || shippedDate == null || shippedDate == "") {
                                shippedDate = moment(approvedDate).add(parseInt(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            }
                        }
                        if (shipmentStatus == PLANNED_SHIPMENT_STATUS || shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                            console.log("shippedToArrivedLeadTime", shippedToArrivedLeadTime);
                            if (shipmentStatus != lastShipmentStatus && shipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                                shippedDate = moment(Date.now()).format("YYYY-MM-DD");
                                if (plannedDate == "" || plannedDate == null) {
                                    plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (submittedDate == "" || submittedDate == null) {
                                    submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (approvedDate == "" || approvedDate == null) {
                                    approvedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                            }
                            if (rowData[19].toString() == "false" || arrivedDate == null || arrivedDate == "") {
                                arrivedDate = moment(shippedDate).add(parseInt(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            }
                        }
                        if (shipmentStatus == PLANNED_SHIPMENT_STATUS || shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                            console.log("in second if");
                            console.log("shipment status", shipmentStatus);
                            console.log("lastShipmentStatus", lastShipmentStatus);
                            if (shipmentStatus != lastShipmentStatus && shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                                console.log("In shipment status if");
                                if (plannedDate == "" || plannedDate == null) {
                                    plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (submittedDate == "" || submittedDate == null) {
                                    submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (approvedDate == "" || approvedDate == null) {
                                    approvedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (shippedDate == "" || shippedDate == null) {
                                    shippedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                arrivedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                            if (rowData[19].toString() == "false" || expectedDeliveryDate == null || expectedDeliveryDate == "" || receivedDate == null || receivedDate == "") {
                                expectedDeliveryDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                receivedDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            }
                        }
                        if (shipmentStatus == PLANNED_SHIPMENT_STATUS || shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                            if (shipmentStatus != lastShipmentStatus && shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                                if (plannedDate == "" || plannedDate == null) {
                                    plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (submittedDate == "" || submittedDate == null) {
                                    submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (approvedDate == "" || approvedDate == null) {
                                    approvedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (shippedDate == "" || shippedDate == null) {
                                    shippedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                if (arrivedDate == "" || arrivedDate == null) {
                                    arrivedDate = moment(Date.now()).format("YYYY-MM-DD");
                                }
                                receivedDate = moment(Date.now()).format("YYYY-MM-DD");
                                expectedDeliveryDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                        }
                    }
                    var json = {
                        plannedDate: plannedDate,
                        submittedDate: submittedDate,
                        approvedDate: approvedDate,
                        shippedDate: shippedDate,
                        arrivedDate: arrivedDate,
                        expectedDeliveryDate: expectedDeliveryDate,
                        receivedDate: receivedDate
                    }
                    elInstance.setValueFromCoords(21, y, json, true);
                    elInstance.setValueFromCoords(1, y, expectedDeliveryDate, true);
                }.bind(this)
            }.bind(this)
        }
    }

    shipmentDatesChanged = function (instance, cell, x, y, value) {
        console.log("x------>", x, "y------------->", y);
        this.props.updateState("shipmentDatesError", "");
        this.props.updateState("shipmentDatesChangedFlag", 1);
        var elInstance = this.state.shipmentDatesTableEl;
        var shipmentInstance = "";
        var rowDataForDates = elInstance.getRowData(y);
        shipmentInstance = this.state.shipmentsEl;
        var rowData = shipmentInstance.getRowData(rowDataForDates[7]);
        if (x == 1) {
            var valid = checkValidtion("date", "B", y, rowDataForDates[1], elInstance);
            if (valid == true) {
                if (y == 0) {
                    elInstance.setValueFromCoords(1, 1, value, true);
                } else {
                    this.calculateFutureDates(x, y);
                }

            }
        }
        if (x == 2) {
            var valid = checkValidtion("date", "C", y, rowDataForDates[2], elInstance);
            if (valid == true) {
                if (moment(rowDataForDates[1]).format("YYYY-MM-DD") > moment(value).format("YYYY-MM-DD")) {
                    inValid("C", y, i18n.t('static.message.invaliddate'), elInstance);
                } else {
                    if (y == 0) {
                        elInstance.setValueFromCoords(2, 1, value, true);
                    } else {
                        this.calculateFutureDates(x, y);
                    }
                }
            }
        }
        if (x == 3) {
            var valid = checkValidtion("date", "D", y, rowDataForDates[3], elInstance);
            if (valid == true) {
                if (moment(rowDataForDates[2]).format("YYYY-MM-DD") > moment(value).format("YYYY-MM-DD")) {
                    inValid("D", y, i18n.t('static.message.invaliddate'), elInstance);
                } else {
                    if (y == 0) {
                        elInstance.setValueFromCoords(3, 1, value, true);
                    } else {
                        this.calculateFutureDates(x, y);
                    }
                }
            }
        }
        if (x == 4) {
            var valid = checkValidtion("date", "E", y, rowDataForDates[4], elInstance);
            if (valid == true) {
                if (moment(rowDataForDates[3]).format("YYYY-MM-DD") > moment(value).format("YYYY-MM-DD")) {
                    inValid("E", y, i18n.t('static.message.invaliddate'), elInstance);
                } else {
                    if (y == 0) {
                        elInstance.setValueFromCoords(4, 1, value, true);
                    } else {
                        this.calculateFutureDates(x, y);
                    }
                }
            }
        }
        if (x == 5) {
            console.log("rowDataForDates[5]", rowDataForDates[5]);
            console.log("elInstance", elInstance);
            var valid = checkValidtion("date", "F", y, rowDataForDates[5], elInstance);
            console.log("valuid", valid)
            if (valid == true) {
                console.log("in valid")
                if (moment(rowDataForDates[4]).format("YYYY-MM-DD") > moment(value).format("YYYY-MM-DD")) {
                    console.log("in if")
                    inValid("F", y, i18n.t('static.message.invaliddate'), elInstance);
                } else {
                    console.log("in else", y)
                    if (y == 0) {
                        elInstance.setValueFromCoords(5, 1, value, true);
                    } else {
                        this.calculateFutureDates(x, y);
                    }
                }
            }
        }
        if (x == 6) {
            var valid = checkValidtion("date", "G", y, rowDataForDates[6], elInstance);
            if (valid == true) {
                if (moment(rowDataForDates[5]).format("YYYY-MM-DD") > moment(value).format("YYYY-MM-DD")) {
                    inValid("G", y, i18n.t('static.message.invaliddate'), elInstance);
                } else {
                    if (y == 0) {
                        elInstance.setValueFromCoords(6, 1, value, true);
                    }
                }
            }
        }
    }

    calculateFutureDates(x, y) {
        // Logic for dates
        var elInstance = this.state.shipmentDatesTableEl;
        var shipmentInstance = "";
        var rowDataForDates = elInstance.getRowData(y);
        shipmentInstance = this.state.shipmentsEl;
        var rowData = shipmentInstance.getRowData(rowDataForDates[7]);
        var shipmentMode = rowData[7];
        var procurementAgent = rowData[2];
        var addLeadTimes = 0;
        if (shipmentMode != "" && procurementAgent != "") {
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;

                var programJson = this.props.items.programJson;
                var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                var papuOs = papuTransaction.objectStore('procurementAgent');
                var papuRequest = papuOs.get(parseInt(procurementAgent));
                papuRequest.onerror = function (event) {
                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                }.bind(this);
                papuRequest.onsuccess = function (event) {
                    var papuResult = [];
                    papuResult = papuRequest.result;
                    var plannedDate = "";
                    var submittedDate = "";
                    var approvedDate = "";
                    var shippedDate = "";
                    var arrivedDate = "";
                    var expectedDeliveryDate = "";
                    if (x == 1) {
                        plannedDate = rowDataForDates[1];
                    } else if (x == 2) {
                        plannedDate = rowDataForDates[1];
                        submittedDate = rowDataForDates[2];
                    } else if (x == 3) {
                        plannedDate = rowDataForDates[1];
                        submittedDate = rowDataForDates[2];
                        approvedDate = rowDataForDates[3];
                    } else if (x == 4) {
                        plannedDate = rowDataForDates[1];
                        submittedDate = rowDataForDates[2];
                        approvedDate = rowDataForDates[3];
                        shippedDate = rowDataForDates[4];
                    } else if (x == 5) {
                        plannedDate = rowDataForDates[1];
                        submittedDate = rowDataForDates[2];
                        approvedDate = rowDataForDates[3];
                        shippedDate = rowDataForDates[4];
                        arrivedDate = rowDataForDates[5];
                    }

                    if (papuResult.localProcurementAgent) {
                        addLeadTimes = this.state.programPlanningUnitList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].localProcurementLeadTime;
                        var leadTimesPerStatus = addLeadTimes / 5;
                        if (x == 1) {
                            submittedDate = moment(plannedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            approvedDate = moment(submittedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            shippedDate = moment(approvedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            arrivedDate = moment(shippedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            expectedDeliveryDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                        } else if (x == 2) {
                            approvedDate = moment(submittedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            shippedDate = moment(approvedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            arrivedDate = moment(shippedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            expectedDeliveryDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                        } else if (x == 3) {
                            shippedDate = moment(approvedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            arrivedDate = moment(shippedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            expectedDeliveryDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                        } else if (x == 4) {
                            arrivedDate = moment(shippedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            expectedDeliveryDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                        } else if (x == 5) {
                            expectedDeliveryDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                        }
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
                        if (shipmentMode == 2) {
                            shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedByAirLeadTime);
                        } else {
                            shippedToArrivedLeadTime = parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                        }
                        if (x == 1) {
                            submittedDate = moment(plannedDate).add(parseInt(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            approvedDate = moment(submittedDate).add(parseInt(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            shippedDate = moment(approvedDate).add(parseInt(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            arrivedDate = moment(shippedDate).add(parseInt(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            expectedDeliveryDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                        } else if (x == 2) {
                            approvedDate = moment(submittedDate).add(parseInt(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            shippedDate = moment(approvedDate).add(parseInt(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            arrivedDate = moment(shippedDate).add(parseInt(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            expectedDeliveryDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                        } else if (x == 3) {
                            shippedDate = moment(approvedDate).add(parseInt(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            arrivedDate = moment(shippedDate).add(parseInt(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            expectedDeliveryDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                        } else if (x == 4) {
                            arrivedDate = moment(shippedDate).add(parseInt(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            expectedDeliveryDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                        } else if (x == 5) {
                            expectedDeliveryDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                        }
                    }
                    console.log("After calculating dates")
                    console.log("In else");
                    if (rowData[19].toString() == "false") {
                        console.log("in if");
                        if (x == 1) {
                            elInstance.setValueFromCoords(2, 1, submittedDate, true);
                            elInstance.setValueFromCoords(3, 1, approvedDate, true);
                            elInstance.setValueFromCoords(4, 1, shippedDate, true);
                            elInstance.setValueFromCoords(5, 1, arrivedDate, true);
                            elInstance.setValueFromCoords(6, 1, expectedDeliveryDate, true);
                        } else if (x == 2) {
                            elInstance.setValueFromCoords(3, 1, approvedDate, true);
                            elInstance.setValueFromCoords(4, 1, shippedDate, true);
                            elInstance.setValueFromCoords(5, 1, arrivedDate, true);
                            elInstance.setValueFromCoords(6, 1, expectedDeliveryDate, true);
                        } else if (x == 3) {
                            elInstance.setValueFromCoords(4, 1, shippedDate, true);
                            elInstance.setValueFromCoords(5, 1, arrivedDate, true);
                            elInstance.setValueFromCoords(6, 1, expectedDeliveryDate, true);
                        } else if (x == 4) {
                            elInstance.setValueFromCoords(5, 1, arrivedDate, true);
                            elInstance.setValueFromCoords(6, 1, expectedDeliveryDate, true);
                        } else if (x == 5) {
                            elInstance.setValueFromCoords(6, 1, expectedDeliveryDate, true);
                        }
                    }
                }.bind(this)
            }.bind(this)
        }
    }

    checkValidationForShipmentDates() {
        var valid = true;
        var elInstance = this.state.shipmentDatesTableEl;
        var y = 1;
        var rowData = elInstance.getRowData(y);

        var validation = checkValidtion("date", "B", y, rowData[1], elInstance);
        if (validation == false) {
            valid = false;
        }

        var validation = checkValidtion("date", "C", y, rowData[2], elInstance);
        if (validation == false) {
            valid = false;
        } else {
            if (moment(rowData[1]).format("YYYY-MM-DD") > moment(rowData[2]).format("YYYY-MM-DD")) {
                inValid("C", y, i18n.t('static.message.invaliddate'), elInstance);
                valid = false;
            }
        }

        var validation = checkValidtion("date", "D", y, rowData[3], elInstance);
        if (validation == false) {
            valid = false;
        } else {
            if (moment(rowData[2]).format("YYYY-MM-DD") > moment(rowData[2]).format("YYYY-MM-DD")) {
                inValid("D", y, i18n.t('static.message.invaliddate'), elInstance);
                valid = false;
            }
        }
        var validation = checkValidtion("date", "E", y, rowData[4], elInstance);
        if (validation == false) {
            valid = false;
        } else {
            if (moment(rowData[3]).format("YYYY-MM-DD") > moment(rowData[4]).format("YYYY-MM-DD")) {
                inValid("E", y, i18n.t('static.message.invaliddate'), elInstance);
                valid = false;
            }
        }
        var validation = checkValidtion("date", "F", y, rowData[5], elInstance);
        if (validation == false) {
            valid = false;
        } else {
            if (moment(rowData[4]).format("YYYY-MM-DD") > moment(rowData[5]).format("YYYY-MM-DD")) {
                inValid("F", y, i18n.t('static.message.invaliddate'), elInstance);
                valid = false;
            }
        }
        var validation = checkValidtion("date", "G", y, rowData[6], elInstance);
        if (validation == false) {
            valid = false;
        } else {
            if (moment(rowData[5]).format("YYYY-MM-DD") > moment(rowData[6]).format("YYYY-MM-DD")) {
                inValid("G", y, i18n.t('static.message.invaliddate'), elInstance);
                valid = false;
            }
        }
        var shipmentInstance = this.state.shipmentsEl;
        var rowDataForShipments = shipmentInstance.getRowData(rowData[7]);
        var shipmentStatus = rowDataForShipments[0];
        y = 0;
        rowData = elInstance.getRowData(y);
        if (shipmentStatus == PLANNED_SHIPMENT_STATUS || shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == ON_HOLD_SHIPMENT_STATUS) {
            var validation = checkValidtion("date", "B", y, rowData[1], elInstance);
            if (validation == false) {
                valid = false;
            }
        }
        if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
            var validation = checkValidtion("date", "C", y, rowData[2], elInstance);
            if (validation == false) {
                valid = false;
            } else {
                if (moment(rowData[1]).format("YYYY-MM-DD") > moment(rowData[2]).format("YYYY-MM-DD")) {
                    inValid("C", y, i18n.t('static.message.invaliddate'), elInstance);
                    valid = false;
                }
            }
        }

        if (shipmentStatus == APPROVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
            var validation = checkValidtion("date", "D", y, rowData[3], elInstance);
            if (validation == false) {
                valid = false;
            } else {
                if (moment(rowData[2]).format("YYYY-MM-DD") > moment(rowData[3]).format("YYYY-MM-DD")) {
                    inValid("D", y, i18n.t('static.message.invaliddate'), elInstance);
                    valid = false;
                }
            }
        }

        if (shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
            var validation = checkValidtion("date", "E", y, rowData[4], elInstance);
            if (validation == false) {
                valid = false;
            } else {
                if (moment(rowData[3]).format("YYYY-MM-DD") > moment(rowData[4]).format("YYYY-MM-DD")) {
                    inValid("E", y, i18n.t('static.message.invaliddate'), elInstance);
                    valid = false;
                }
            }
        }
        if (shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
            var validation = checkValidtion("date", "F", y, rowData[5], elInstance);
            if (validation == false) {
                valid = false;
            } else {
                if (moment(rowData[4]).format("YYYY-MM-DD") > moment(rowData[5]).format("YYYY-MM-DD")) {
                    inValid("F", y, i18n.t('static.message.invaliddate'), elInstance);
                    valid = false;
                }
            }
        }

        if (shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
            var validation = checkValidtion("date", "G", y, rowData[6], elInstance);
            if (validation == false) {
                valid = false;
            } else {
                if (moment(rowData[5]).format("YYYY-MM-DD") > moment(rowData[6]).format("YYYY-MM-DD")) {
                    inValid("G", y, i18n.t('static.message.invaliddate'), elInstance);
                    valid = false;
                }
            }
        }

        return valid;
    }

    saveShipmentsDate() {
        var validation = this.checkValidationForShipmentDates();
        if (validation == true) {
            var elInstance = this.state.shipmentDatesTableEl;
            var json = elInstance.getJson();
            var rowNumber = 0;
            var map = new Map(Object.entries(json[1]));
            var map1 = new Map(Object.entries(json[0]));
            rowNumber = map.get("7")
            var json = {
                plannedDate: moment(map.get("1")).format("YYYY-MM-DD"),
                submittedDate: moment(map.get("2")).format("YYYY-MM-DD"),
                approvedDate: moment(map.get("3")).format("YYYY-MM-DD"),
                shippedDate: moment(map.get("4")).format("YYYY-MM-DD"),
                arrivedDate: moment(map.get("5")).format("YYYY-MM-DD"),
                expectedDeliveryDate: moment(map.get("6")).format("YYYY-MM-DD"),
                receivedDate: moment(map1.get("6")).format("YYYY-MM-DD"),
            }
            var shipmentInstance = this.state.shipmentsEl;
            shipmentInstance.setValueFromCoords(21, parseInt(rowNumber), json, true);
            shipmentInstance.setValueFromCoords(1, parseInt(rowNumber), moment(map.get("6")).format("YYYY-MM-DD"), true);
            this.props.updateState("shipmentChangedFlag", 1);
            this.props.updateState("shipmentDatesChangedFlag", 0);
            this.setState({
                shipmentDatesTableEl: ""
            })
            document.getElementById("showSaveShipmentsDatesButtonsDiv").style.display = 'none';
            this.props.updateState("shipmentDatesError", "");
            if (this.props.shipmentPage == "shipmentDataEntry") {
                this.props.toggleLarge();
            }
            elInstance.destroy();
        } else {
            this.props.updateState("shipmentDatesError", i18n.t('static.supplyPlan.validationFailed'));
        }
    }

    checkValidationForShipments() {
        var valid = true;
        var elInstance = this.state.shipmentsEl;
        var json = elInstance.getJson();
        var checkOtherValidation = false;
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            var rowData = elInstance.getRowData(y);
            if (map.get("4") != "") {
                var budget = this.state.budgetListAll.filter(c => c.id == map.get("4"))[0]
                var totalBudget = budget.budgetAmt * budget.currency.conversionRateToUsd;
                var shipmentList = this.props.items.shipmentListUnFiltered.filter(c => c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.active == true && c.budget.id == map.get("4"));
                var usedBudgetTotalAmount = 0;
                for (var s = 0; s < shipmentList.length; s++) {
                    var index = "";
                    if (shipmentList[s].shipmentId != 0) {
                        index = shipmentList.findIndex(c => c.shipmentId == shipmentList[s].shipmentId);
                    } else {
                        index = shipmentList[s].index;
                    }
                    if (map.get("16") != index) {
                        usedBudgetTotalAmount += parseFloat((parseFloat(shipmentList[s].productCost) + parseFloat(shipmentList[s].freightCost)) * parseFloat(shipmentList[s].currency.conversionRateToUsd));
                    }
                }
                var totalCost = parseFloat(((elInstance.getCell(`L${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", "")) + parseFloat(((elInstance.getCell(`M${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", ""));
                var enteredBudgetAmt = (totalCost * (parseFloat((this.state.currencyListAll.filter(c => c.currencyId == rowData[9])[0]).conversionRateToUsd)));
                usedBudgetTotalAmount = usedBudgetTotalAmount.toFixed(2);
                enteredBudgetAmt = enteredBudgetAmt.toFixed(2);

                var availableBudgetAmount = totalBudget - usedBudgetTotalAmount;
                console.log("total budget", totalBudget)
                console.log("used budget ", usedBudgetTotalAmount);
                console.log("available budget amount", availableBudgetAmount);
                console.log("entyered budget amount", enteredBudgetAmt);
                if (enteredBudgetAmt > availableBudgetAmount || availableBudgetAmount < 0) {
                    valid = false;
                    inValid("E", y, i18n.t('static.label.noFundsAvailable'), elInstance);
                    inValid("L", y, i18n.t('static.label.noFundsAvailable'), elInstance);
                    this.props.updateState("noFundsBudgetError", i18n.t('static.label.noFundsAvailable'));
                } else {
                    checkOtherValidation = true;
                }
            } else {
                checkOtherValidation = true;
            }
            if (checkOtherValidation) {
                var validation = checkValidtion("text", "A", y, rowData[0], elInstance);
                console.log("Valid", valid);
                if (validation == true) {
                    if (rowData[0] == SUBMITTED_SHIPMENT_STATUS || rowData[0] == ARRIVED_SHIPMENT_STATUS || rowData[0] == SHIPPED_SHIPMENT_STATUS || rowData[0] == DELIVERED_SHIPMENT_STATUS || rowData[0] == APPROVED_SHIPMENT_STATUS) {
                        var budget = rowData[4];
                        checkValidtion("text", "E", y, budget, elInstance);
                        var procurementAgent = rowData[2];
                        var fundingSource = rowData[3];
                        if (procurementAgent == TBD_PROCUREMENT_AGENT_ID) {
                            inValid("C", y, i18n.t('static.supplyPlan.procurementAgentCannotBeTBD'), elInstance);
                            valid = false;
                        } else {
                            positiveValidation("C", y, elInstance);
                        }

                        if (fundingSource == TBD_FUNDING_SOURCE) {
                            inValid("D", y, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'), elInstance);
                            valid = false
                        } else {
                            positiveValidation("D", y, elInstance);
                        }
                    } else {
                        positiveValidation("E", y, elInstance);
                        positiveValidation("C", y, elInstance);
                        positiveValidation("D", y, elInstance);
                    }

                }

                var validation = checkValidtion("text", "C", y, rowData[2], elInstance);
                if (validation == true) {
                    var shipmentStatus = rowData[0];
                    if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                        if (rowData[2] == TBD_PROCUREMENT_AGENT_ID) {
                            inValid("C", y, i18n.t('static.supplyPlan.procurementAgentCannotBeTBD'), elInstance);
                            valid = false;
                        } else {
                            positiveValidation("C", y, elInstance);
                        }
                    }
                }

                var validation = checkValidtion("text", "D", y, rowData[3], elInstance);
                if (validation == true) {
                    console.log("in valid")
                    var shipmentStatus = rowData[0];
                    if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                        if (rowData[3] == TBD_FUNDING_SOURCE) {
                            inValid("D", y, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'), elInstance);
                            valid = false;
                        } else {
                            positiveValidation("D", y, elInstance);
                        }
                    }
                }

                var validation = checkValidtion("text", "G", y, rowData[6], elInstance);
                if (validation == false) {
                    valid = false;
                }

                var validation = checkValidtion("text", "H", y, rowData[7], elInstance);
                if (validation == false) {
                    valid = false;
                }

                var validation = checkValidtion("number", "I", y, rowData[8], elInstance, INTEGER_NO_REGEX, 1);
                if (validation == false) {
                    valid = false;
                }

                var validation = checkValidtion("text", "J", y, rowData[9], elInstance);
                if (validation == false) {
                    valid = false;
                }

                var validation = checkValidtion("number", "K", y, rowData[10], elInstance, DECIMAL_NO_REGEX, 1);
                if (validation == false) {
                    valid = false;
                }

                var validation = checkValidtion("number", "M", y, rowData[12], elInstance, DECIMAL_NO_REGEX, 1);
                if (validation == false) {
                    valid = false;
                }

                var shipmentStatus = elInstance.getRowData(y)[0];
                console.log("Shipment status", shipmentStatus);
                if (shipmentStatus != CANCELLED_SHIPMENT_STATUS && shipmentStatus != ON_HOLD_SHIPMENT_STATUS) {
                    if (shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                        console.log("In if");
                        var totalShipmentQty = (rowData[18]);
                        var adjustedOrderQty = (elInstance.getCell(`I${parseInt(y) + 1}`)).innerHTML;
                        adjustedOrderQty = adjustedOrderQty.toString().replaceAll("\,", "");
                        var col = ("I").concat(parseInt(y) + 1);

                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.supplyPlan.batchNumberMissing'));
                        inValid("I", y, i18n.t('static.supplyPlan.batchNumberMissing'), elInstance);
                        if (totalShipmentQty != 0 && totalShipmentQty != adjustedOrderQty) {
                            valid = false;
                            this.props.updateState("shipmentBatchError", i18n.t('static.supplyPlan.batchNumberMissing'));
                        } else {
                            positiveValidation("I", y, elInstance);
                        }
                    }
                }
            }
        }
        return valid;
    }

    saveShipments() {
        var validation = this.checkValidationForShipments();
        console.log("Validation---------------->", validation);
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            this.props.updateState("shipmentError", "");
            this.props.updateState("shipmentBatchError", "");
            this.props.updateState("noFundsBudgetError", "");
            var elInstance = this.state.shipmentsEl;
            var json = elInstance.getJson();
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction;
                var programTransaction;
                if (this.props.shipmentPage == "whatIf") {
                    transaction = db1.transaction(['whatIfProgramData'], 'readwrite');
                    programTransaction = transaction.objectStore('whatIfProgramData');
                } else {
                    transaction = db1.transaction(['programData'], 'readwrite');
                    programTransaction = transaction.objectStore('programData');
                }
                var programId = (document.getElementById("programId").value);
                var programRequest = programTransaction.get(programId);
                programRequest.onerror = function (event) {
                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var shipmentDataList = (programJson.shipmentList);
                    var batchInfoList = programJson.batchInfoList;
                    for (var j = 0; j < json.length; j++) {
                        var map = new Map(Object.entries(json[j]));

                        var selectedShipmentStatus = map.get("0");
                        var shipmentStatusId = selectedShipmentStatus;
                        var shipmentQty = (elInstance.getCell(`I${parseInt(j) + 1}`)).innerHTML;
                        var productCost = (elInstance.getCell(`L${parseInt(j) + 1}`)).innerHTML;
                        var rate = (elInstance.getCell(`K${parseInt(j) + 1}`)).innerHTML;
                        var freightCost = (elInstance.getCell(`M${parseInt(j) + 1}`)).innerHTML;
                        var shipmentMode = "Sea";
                        if (map.get("7") == 2) {
                            shipmentMode = "Air";
                        }
                        var shipmentDatesJson = map.get("21");
                        if (map.get("16") != -1) {
                            shipmentDataList[parseInt(map.get("16"))].plannedDate = shipmentDatesJson.plannedDate;
                            shipmentDataList[parseInt(map.get("16"))].submittedDate = shipmentDatesJson.submittedDate;
                            shipmentDataList[parseInt(map.get("16"))].approvedDate = shipmentDatesJson.approvedDate;
                            shipmentDataList[parseInt(map.get("16"))].shippedDate = shipmentDatesJson.shippedDate;
                            shipmentDataList[parseInt(map.get("16"))].arrivedDate = shipmentDatesJson.arrivedDate;
                            shipmentDataList[parseInt(map.get("16"))].expectedDeliveryDate = shipmentDatesJson.expectedDeliveryDate;
                            shipmentDataList[parseInt(map.get("16"))].receivedDate = shipmentDatesJson.deliveryDate;

                            shipmentDataList[parseInt(map.get("16"))].shipmentStatus.id = shipmentStatusId;
                            shipmentDataList[parseInt(map.get("16"))].dataSource.id = map.get("6");
                            shipmentDataList[parseInt(map.get("16"))].procurementAgent.id = map.get("2");
                            shipmentDataList[parseInt(map.get("16"))].fundingSource.id = map.get("3");
                            shipmentDataList[parseInt(map.get("16"))].budget.id = map.get("4");
                            shipmentDataList[parseInt(map.get("16"))].shipmentQty = shipmentQty.toString().replaceAll("\,", "");
                            shipmentDataList[parseInt(map.get("16"))].rate = rate.toString().replaceAll("\,", "");
                            shipmentDataList[parseInt(map.get("16"))].shipmentMode = shipmentMode;
                            shipmentDataList[parseInt(map.get("16"))].productCost = productCost.toString().replaceAll("\,", "");
                            shipmentDataList[parseInt(map.get("16"))].freightCost = parseFloat(freightCost.toString().replaceAll("\,", "")).toFixed(2);
                            shipmentDataList[parseInt(map.get("16"))].notes = map.get("13");
                            shipmentDataList[parseInt(map.get("16"))].accountFlag = map.get("20");
                            shipmentDataList[parseInt(map.get("16"))].emergencyOrder = map.get("19");
                            shipmentDataList[parseInt(map.get("16"))].currency.currencyId = map.get("9");
                            shipmentDataList[parseInt(map.get("16"))].currency.conversionRateToUsd = (parseFloat((this.state.currencyListAll.filter(c => c.currencyId == map.get("9"))[0]).conversionRateToUsd));
                            if (map.get("17").length != 0) {
                                shipmentDataList[parseInt(map.get("16"))].batchInfoList = map.get("17");
                            }


                            if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                                var shipmentBatchInfoList = map.get("17");
                                if (shipmentBatchInfoList.length == 0) {
                                    var programId = (document.getElementById("programId").value).split("_")[0];
                                    var planningUnitId = document.getElementById("planningUnitId").value;
                                    var batchNo = (paddingZero(programId, 0, 6)).concat(paddingZero(planningUnitId, 0, 8)).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                                    var expectedDeliveryDate = moment(map.get("1")).format("YYYY-MM-DD");
                                    var expiryDate = moment(expectedDeliveryDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
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
                                    shipmentDataList[parseInt(map.get("16"))].batchInfoList = batchArr;
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
                        } else {
                            console.log("in else");
                            var shipmentJson = {
                                accountFlag: true,
                                active: true,
                                dataSource: {
                                    id: map.get("6")
                                },
                                erpFlag: false,
                                freightCost: parseFloat(freightCost.toString().replaceAll("\,", "")).toFixed(2),
                                notes: map.get("13"),
                                planningUnit: {
                                    id: document.getElementById("planningUnitId").value
                                },
                                procurementAgent: {
                                    id: map.get("2")
                                },
                                productCost: productCost.toString().replaceAll("\,", ""),
                                shipmentQty: shipmentQty.toString().replaceAll("\,", ""),
                                rate: rate.toString().replaceAll("\,", ""),
                                shipmentId: 0,
                                shipmentMode: shipmentMode,
                                shipmentStatus: {
                                    id: map.get("0")
                                },
                                suggestedQty: map.get("22"),
                                budget: {
                                    id: map.get("4")
                                },
                                emergencyOrder: map.get("19"),
                                currency: {
                                    currencyId: map.get("9"),
                                    conversionRateToUsd: parseFloat((this.state.currencyListAll.filter(c => c.currencyId == map.get("9"))[0]).conversionRateToUsd)
                                },
                                fundingSource: {
                                    id: map.get("3")
                                },
                                plannedDate: moment(shipmentDatesJson.plannedDate).format("YYYY-MM-DD"),
                                submittedDate: moment(shipmentDatesJson.submittedDate).format("YYYY-MM-DD"),
                                approvedDate: moment(shipmentDatesJson.approvedDate).format("YYYY-MM-DD"),
                                shippedDate: moment(shipmentDatesJson.shippedDate).format("YYYY-MM-DD"),
                                arrivedDate: moment(shipmentDatesJson.arrivedDate).format("YYYY-MM-DD"),
                                expectedDeliveryDate: moment(shipmentDatesJson.expectedDeliveryDate).format("YYYY-MM-DD"),
                                receivedDate: moment(shipmentDatesJson.receivedDate).format("YYYY-MM-DD"),
                                index: shipmentDataList.length,
                                batchInfoList: []
                            }
                            console.log("shipmentJson", shipmentJson);
                            if (map.get("17").length != 0) {
                                shipmentJson.batchInfoList = map.get("17");
                            }

                            if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                                var shipmentBatchInfoList = map.get("17");
                                if (shipmentBatchInfoList.length == 0) {
                                    var programId = (document.getElementById("programId").value).split("_")[0];
                                    var planningUnitId = document.getElementById("planningUnitId").value;
                                    var batchNo = (paddingZero(programId, 0, 6)).concat(paddingZero(planningUnitId, 0, 8)).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                                    var expectedDeliveryDate = moment(map.get("1")).format("YYYY-MM-DD");
                                    var expiryDate = moment(expectedDeliveryDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
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
                                    shipmentJson.batchInfoList = batchArr;
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
                                console.log("shipmentJson", shipmentJson);
                                programJson.batchInfoList = batchInfoList;
                            }
                            console.log("shipmentJson", shipmentJson);
                            shipmentDataList.push(shipmentJson);
                        }
                    }

                    programJson.shipmentList = shipmentDataList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        if (this.props.shipmentPage != "shipmentDataEntry") {
                            this.props.toggleLarge('shipments');
                        }
                        this.props.updateState("message", i18n.t('static.message.shipmentsSaved'));
                        this.props.updateState("color", 'green');
                        this.props.updateState("shipmentChangedFlag", 0);
                        this.props.updateState("budgetChangedFlag", 0);
                        this.props.updateState("shipmentsEl", "");
                        this.setState({
                            shipmentsEl: ""
                        })
                        if (this.props.shipmentPage != "shipmentDataEntry") {
                            this.props.formSubmit(this.props.items.monthCount);
                        }
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.props.updateState("shipmentError", i18n.t('static.supplyPlan.validationFailed'));
        }
    }

    render() { return (<div></div>) }
}