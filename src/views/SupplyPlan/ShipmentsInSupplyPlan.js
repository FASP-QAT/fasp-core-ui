import React from "react";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunctionOnlyHideRow, checkValidtion, inValid, positiveValidation, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { SECRET_KEY, SHIPMENT_DATA_SOURCE_TYPE, DELIVERED_SHIPMENT_STATUS, TBD_PROCUREMENT_AGENT_ID, TBD_FUNDING_SOURCE, SUBMITTED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, JEXCEL_DECIMAL_NO_REGEX, JEXCEL_INTEGER_REGEX, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS, INDEXED_DB_VERSION, INDEXED_DB_NAME, ALPHABET_NUMBER_REGEX, JEXCEL_DATE_FORMAT, BATCH_PREFIX, NONE_SELECTED_DATA_SOURCE_ID, LABEL_WITH_SPECIAL_SYMBOL_REGEX, BATCH_NO_REGEX, JEXCEL_PAGINATION_OPTION, USD_CURRENCY_ID, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PRO_KEY } from "../../Constants";
import moment, { invalid } from "moment";
import { paddingZero, generateRandomAplhaNumericCode, contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import CryptoJS from 'crypto-js'
import { calculateSupplyPlan } from "./SupplyPlanCalculations";
import AuthenticationService from "../Common/AuthenticationService";


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
        this.checkValidationForShipmentDates = this.checkValidationForShipmentDates.bind(this)
        this.saveShipmentsDate = this.saveShipmentsDate.bind(this);
        this.saveShipments = this.saveShipments.bind(this);
        this.checkValidationForShipments = this.checkValidationForShipments.bind(this);
        this.showShipmentData = this.showShipmentData.bind(this);
        this.shipmentEditStart = this.shipmentEditStart.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.addBatchRowInJexcel = this.addBatchRowInJexcel.bind(this);
        this.calculateEmergencyOrder = this.calculateEmergencyOrder.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onPasteForBatchInfo = this.onPasteForBatchInfo.bind(this);
    }

    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.jexcel).getValue(`X${parseInt(data[i].y) + 1}`, true)
                console.log("D---------------->", index);
                (instance.jexcel).setValueFromCoords(2, data[i].y, document.getElementById("planningUnitId").value, true);
                (instance.jexcel).setValueFromCoords(20, data[i].y, moment(Date.now()).format("YYYY-MM-DD"), true);
                (instance.jexcel).setValueFromCoords(16, data[i].y, `=ROUND(P${parseInt(data[i].y) + 1}*K${parseInt(data[i].y) + 1},2)`, true);
                if (index == "" || index == null || index == undefined) {
                    (instance.jexcel).setValueFromCoords(21, data[i].y, false, true);
                    (instance.jexcel).setValueFromCoords(22, data[i].y, "", true);
                    (instance.jexcel).setValueFromCoords(23, data[i].y, -1, true);
                    (instance.jexcel).setValueFromCoords(24, data[i].y, "", true);
                    (instance.jexcel).setValueFromCoords(25, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(26, data[i].y, "", true);
                    (instance.jexcel).setValueFromCoords(27, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(28, data[i].y, 1, true);
                    (instance.jexcel).setValueFromCoords(29, data[i].y, true, true);
                    (instance.jexcel).setValueFromCoords(30, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(31, data[i].y, 1, true);
                    z = data[i].y;
                }
            }
        }
    }

    onPasteForBatchInfo(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.jexcel).getValue(`F${parseInt(data[i].y) + 1}`, true)
                if (index == "" || index == null || index == undefined) {
                    var rowData = (instance.jexcel).getRowData(0);
                    (instance.jexcel).setValueFromCoords(2, data[i].y, rowData[2], true);
                    (instance.jexcel).setValueFromCoords(5, data[i].y, 0, true);
                    (instance.jexcel).setValueFromCoords(6, data[i].y, rowData[6], true);
                    (instance.jexcel).setValueFromCoords(7, data[i].y, rowData[7], true);
                    z = data[i].y;
                }
            }
        }
    }


    componentDidMount() {

    }

    showShipmentData() {
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
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
            this.props.updateState("color", "red");
            this.props.hideFirstComponent();
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
            var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
            var shipmentStatusRequest = shipmentStatusOs.getAll();
            shipmentStatusRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                this.props.updateState("color", "red");
                this.props.hideFirstComponent();
            }.bind(this);
            shipmentStatusRequest.onsuccess = function (event) {
                var shipmentStatusResult = [];
                shipmentStatusResult = shipmentStatusRequest.result;
                for (var k = 0; k < shipmentStatusResult.length; k++) {
                    var shipmentStatusJson = {
                        name: getLabelText(shipmentStatusResult[k].label, this.props.items.lang),
                        id: shipmentStatusResult[k].shipmentStatusId,
                        active: shipmentStatusResult[k].active,
                        label: shipmentStatusResult[k].label
                    }
                    shipmentStatusList.push(shipmentStatusJson);
                }
                var paTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                var paOs = paTransaction.objectStore('procurementAgent');
                var paRequest = paOs.getAll();
                paRequest.onerror = function (event) {
                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                    this.props.updateState("color", "red");
                    this.props.hideFirstComponent();
                }.bind(this);
                paRequest.onsuccess = function (event) {
                    var paResult = [];
                    paResult = paRequest.result;

                    for (var k = 0; k < paResult.length; k++) {
                        var paJson = {
                            name: paResult[k].procurementAgentCode,
                            id: paResult[k].procurementAgentId,
                            active: paResult[k].active,
                            label: paResult[k].label
                        }
                        procurementAgentList.push(paJson);
                    }
                    var papuTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                    var papuOs = papuTransaction.objectStore('procurementAgentPlanningUnit');
                    var papuRequest = papuOs.getAll();
                    papuRequest.onerror = function (event) {
                        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                        this.props.updateState("color", "red");
                        this.props.hideFirstComponent();
                    }.bind(this);
                    papuRequest.onsuccess = function (event) {
                        var papuResult = [];
                        papuResult = papuRequest.result;
                        this.setState({
                            procurementAgentPlanningUnitListAll: papuResult
                        })

                        var fsTransaction = db1.transaction(['fundingSource'], 'readwrite');
                        var fsOs = fsTransaction.objectStore('fundingSource');
                        var fsRequest = fsOs.getAll();
                        fsRequest.onerror = function (event) {
                            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                            this.props.updateState("color", "red");
                            this.props.hideFirstComponent();
                        }.bind(this);
                        fsRequest.onsuccess = function (event) {
                            var fsResult = [];
                            fsResult = fsRequest.result;
                            for (var k = 0; k < fsResult.length; k++) {
                                console.log(programJson)
                                if (fsResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                                    var fsJson = {
                                        name: fsResult[k].fundingSourceCode,
                                        id: fsResult[k].fundingSourceId,
                                        active: fsResult[k].active,
                                        label: fsResult[k].label
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
                                this.props.updateState("color", "red");
                                this.props.hideFirstComponent();
                            }.bind(this);
                            bRequest.onsuccess = function (event) {
                                var bResult = [];
                                bResult = bRequest.result;
                                budgetList.push({ id: '', name: i18n.t('static.common.select') });
                                for (var k = 0; k < bResult.length; k++) {
                                    if (bResult[k].program.id == programJson.programId) {
                                        var bJson = {
                                            name: bResult[k].budgetCode,
                                            id: bResult[k].budgetId,
                                            active: bResult[k].active,
                                            label: bResult[k].label
                                        }
                                        budgetList.push(bJson);
                                    }
                                    budgetListAll.push({
                                        name: bResult[k].budgetCode,
                                        id: bResult[k].budgetId,
                                        fundingSource: bResult[k].fundingSource,
                                        currency: bResult[k].currency,
                                        budgetAmt: bResult[k].budgetAmt,
                                        active: bResult[k].active,
                                        programId: bResult[k].program.id,
                                        label: bResult[k].label,
                                        startDate: bResult[k].startDate,
                                        stopDate: bResult[k].stopDate
                                    })
                                }
                                console.log("Budhet list", budgetList);
                                this.setState({
                                    budgetListAll: budgetListAll,
                                    programIdForBudget: programJson.programId
                                })

                                var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                                var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                                var dataSourceRequest = dataSourceOs.getAll();
                                dataSourceRequest.onerror = function (event) {
                                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                                    this.props.updateState("color", "red");
                                    this.props.hideFirstComponent();
                                }.bind(this);
                                dataSourceRequest.onsuccess = function (event) {
                                    var dataSourceResult = [];
                                    dataSourceResult = dataSourceRequest.result;
                                    console.log("Data source result", dataSourceResult);
                                    console.log("programJson.realmCountry.realm.realmId", programJson.realmCountry.realm.realmId);

                                    for (var k = 0; k < dataSourceResult.length; k++) {
                                        if ((dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0)) {
                                            console.log("Data source result", dataSourceResult[k]);
                                            if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId && dataSourceResult[k].dataSourceType.id == SHIPMENT_DATA_SOURCE_TYPE) {
                                                var dataSourceJson = {
                                                    name: getLabelText(dataSourceResult[k].label, this.props.items.lang),
                                                    id: dataSourceResult[k].dataSourceId,
                                                    active: dataSourceResult[k].active,
                                                    label: dataSourceResult[k].label
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
                                        this.props.updateState("color", "red");
                                        this.props.hideFirstComponent();
                                    }.bind(this);
                                    currencyRequest.onsuccess = function (event) {
                                        var currencyResult = [];
                                        currencyResult = (currencyRequest.result);
                                        for (var k = 0; k < currencyResult.length; k++) {

                                            var currencyJson = {
                                                name: getLabelText(currencyResult[k].label, this.props.items.lang),
                                                id: currencyResult[k].currencyId,
                                                active: currencyResult[k].active,
                                                label: currencyResult[k].label
                                            }
                                            currencyList.push(currencyJson);
                                        }
                                        this.setState({
                                            currencyListAll: currencyResult,
                                            currencyList: currencyList,
                                            dataSourceList: dataSourceList,
                                            fundingSourceList: fundingSourceList,
                                            procurementAgentList: procurementAgentList,
                                            budgetList: budgetList,
                                            shipmentStatusList: shipmentStatusList
                                        })
                                        if (this.state.shipmentsEl != "" && this.state.shipmentsEl != undefined) {
                                            // this.el = jexcel(document.getElementById("shipmentsDetailsTable"), '');
                                            this.state.shipmentsEl.destroy();
                                        }
                                        var data = [];
                                        var shipmentsArr = [];
                                        var shipmentEditable = true;
                                        if (this.props.shipmentPage == "supplyPlanCompare") {
                                            shipmentEditable = false;
                                        }
                                        if (this.props.shipmentPage == "shipmentDataEntry" && (this.props.items.shipmentType).value == 2) {
                                            shipmentEditable = false;
                                        }

                                        var roleList = AuthenticationService.getLoggedInUserRole();
                                        if (roleList.length == 1 && roleList[0].roleId == 'ROLE_GUEST_USER') {
                                            shipmentEditable = false;
                                        }
                                        var paginationOption = false;
                                        var searchOption = false;
                                        var filterOption = false;
                                        var paginationArray = []
                                        if (this.props.shipmentPage == "shipmentDataEntry") {
                                            paginationOption = localStorage.getItem("sesRecordCount");
                                            searchOption = true;
                                            paginationArray = JEXCEL_PAGINATION_OPTION;
                                            filterOption = true;
                                        }
                                        console.log("Shipment list------------------------------->", shipmentList);
                                        var erpType = "hidden";
                                        for (var i = 0; i < shipmentList.length; i++) {
                                            var shipmentMode = 1;
                                            if (shipmentList[i].shipmentMode == "Air") {
                                                shipmentMode = 2;
                                            }
                                            if (shipmentList[i].erpFlag.toString() == "true" && this.props.shipmentPage != "shipmentDataEntry") {
                                                erpType = "text";
                                            }
                                            if (this.props.shipmentPage == "shipmentDataEntry" && (this.props.items.shipmentType).value == 2) {
                                                erpType = "text";
                                            }

                                            if (this.props.shipmentPage != "shipmentDataEntry" && shipmentList[i].erpFlag.toString() == "true") {
                                                shipmentEditable = false;
                                            }

                                            var totalShipmentQty = 0;
                                            var shipmentBatchInfoList = shipmentList[i].batchInfoList;
                                            console.log("Shipment batch info list", shipmentBatchInfoList);
                                            for (var sb = 0; sb < shipmentBatchInfoList.length; sb++) {
                                                totalShipmentQty += Math.round(shipmentBatchInfoList[sb].shipmentQty);
                                            }
                                            console.log("Total shipment qty", totalShipmentQty);
                                            console.log("shipmentList[i].receivedDate", shipmentList[i].receivedDate);
                                            console.log("D--------------->", shipmentList[i].shippedDate);
                                            var shipmentDatesJson = {
                                                plannedDate: shipmentList[i].plannedDate,
                                                submittedDate: shipmentList[i].submittedDate,
                                                approvedDate: shipmentList[i].approvedDate,
                                                shippedDate: shipmentList[i].shippedDate,
                                                arrivedDate: shipmentList[i].arrivedDate,
                                                expectedDeliveryDate: shipmentList[i].expectedDeliveryDate,
                                                receivedDate: shipmentList[i].receivedDate == "Invalid date" ? "" : shipmentList[i].receivedDate
                                            }
                                            console.log("shipmentList[i].expectedDeliveryDate", shipmentList[i].expectedDeliveryDate);
                                            console.log("show Shipment dates", shipmentDatesJson);
                                            var isEmergencyOrder = shipmentList[i].emergencyOrder;
                                            if (shipmentList[i].shipmentStatus.id == "" && shipmentList[i].expectedDeliveryDate != "") {
                                                var expectedArrivedDate = moment(shipmentList[i].expectedDeliveryDate).subtract(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                var expectedShippedDate = moment(expectedArrivedDate).subtract(parseInt(programJson.shippedToArrivedBySeaLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                var expectedApprovedDate = moment(expectedShippedDate).subtract(parseInt(programJson.approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                var expectedSubmittedDate = moment(expectedApprovedDate).subtract(parseInt(programJson.submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                var expectedPlannedDate = moment(expectedSubmittedDate).subtract(parseInt(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                if (moment(expectedPlannedDate).format("YYYY-MM-DD") < moment(Date.now()).format("YYYY-MM-DD")) {
                                                    isEmergencyOrder = true;
                                                } else {
                                                    isEmergencyOrder = false;
                                                }
                                            }

                                            console.log("shipmentList[i].receivedDate", shipmentList[i].receivedDate);
                                            data = [];
                                            data[0] = shipmentList[i].accountFlag;//A
                                            data[1] = shipmentList[i].shipmentId;//B
                                            data[2] = shipmentList[i].planningUnit.id;//C
                                            data[3] = shipmentList[i].shipmentStatus.id;//D
                                            data[4] = shipmentList[i].receivedDate != "" && shipmentList[i].receivedDate != null && shipmentList[i].receivedDate != undefined && shipmentList[i].receivedDate != "Invalid date" ? shipmentList[i].receivedDate : shipmentList[i].expectedDeliveryDate;//E
                                            data[5] = shipmentMode;//F
                                            data[6] = shipmentList[i].procurementAgent.id;//G
                                            data[7] = shipmentList[i].localProcurement;//H
                                            data[8] = shipmentList[i].orderNo;//I
                                            data[9] = shipmentList[i].primeLineNo;//J
                                            data[10] = shipmentList[i].shipmentQty;//K
                                            data[11] = isEmergencyOrder;//L
                                            data[12] = shipmentList[i].fundingSource.id;//M
                                            data[13] = shipmentList[i].budget.id;//N
                                            data[14] = shipmentList[i].currency.currencyId;//O
                                            data[15] = parseFloat(shipmentList[i].rate).toFixed(2);//P
                                            data[16] = `=ROUND(K${parseInt(i) + 1}*P${parseInt(i) + 1},2)`;//Q
                                            data[17] = parseFloat(shipmentList[i].freightCost).toFixed(2);//R
                                            data[18] = shipmentList[i].dataSource.id;//S
                                            data[19] = shipmentList[i].notes;//T
                                            data[20] = shipmentList[i].createdDate;//U
                                            data[21] = shipmentList[i].erpFlag;//V
                                            data[22] = shipmentList[i].shipmentStatus.id;//W
                                            var index;
                                            if (shipmentList[i].shipmentId != 0) {
                                                index = shipmentListUnFiltered.findIndex(c => c.shipmentId == shipmentList[i].shipmentId);
                                            } else {
                                                index = shipmentList[i].index;
                                            }
                                            data[23] = index; // X
                                            data[24] = shipmentList[i].batchInfoList; //Y
                                            data[25] = totalShipmentQty; //Z
                                            data[26] = shipmentDatesJson;//AA
                                            data[27] = shipmentList[i].suggestedQty;//AB
                                            data[28] = 0;//AC
                                            data[29] = shipmentList[i].active;//AD
                                            data[30] = 0;//AE
                                            data[31] = shipmentList[i].currency.conversionRateToUsd;//Conversionratetousdenterhere
                                            shipmentsArr.push(data);
                                        }
                                        if (shipmentList.length == 0 && this.props.shipmentPage == "shipmentDataEntry" && this.props.items.shipmentType.value == 1) {
                                            var data = [];
                                            data[0] = true;
                                            data[1] = 0;
                                            data[2] = document.getElementById("planningUnitId").value;
                                            data[3] = "";
                                            data[4] = "";
                                            data[5] = "";
                                            data[6] = "";
                                            data[7] = false;
                                            data[8] = "";
                                            data[9] = "";
                                            data[10] = 0;
                                            data[11] = false;
                                            data[12] = "";
                                            data[13] = "";
                                            data[14] = USD_CURRENCY_ID;
                                            data[15] = this.props.items.catalogPrice;
                                            data[16] = `=ROUND(P${parseInt(0) + 1}*K${parseInt(0) + 1},2)`;
                                            data[17] = "";
                                            data[18] = NONE_SELECTED_DATA_SOURCE_ID;
                                            data[19] = "";
                                            data[20] = moment(Date.now()).format("YYYY-MM-DD");
                                            data[21] = false;
                                            data[22] = ""
                                            data[23] = -1;
                                            data[24] = "";
                                            data[25] = 0;
                                            data[26] = "";
                                            data[27] = 0;
                                            data[28] = 1;
                                            data[29] = true;
                                            data[30] = 0;
                                            data[31] = 1;
                                            shipmentsArr[0] = data;
                                        }
                                        var options = {
                                            data: shipmentsArr,
                                            columns: [
                                                { type: 'checkbox', title: i18n.t('static.common.active'), width: 80 },
                                                { type: 'text', title: i18n.t('static.report.id'), width: 80, readOnly: true },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.qatProduct'), width: 150 },
                                                { type: 'dropdown', title: i18n.t('static.shipmentDataEntry.shipmentStatus'), source: shipmentStatusList, filter: this.filterShipmentStatus, width: 100 },
                                                { type: 'calendar', title: i18n.t('static.common.receivedate'), options: { format: JEXCEL_DATE_FORMAT }, width: 150 },
                                                { type: 'dropdown', title: i18n.t("static.supplyPlan.shipmentMode"), source: [{ id: 1, name: i18n.t('static.supplyPlan.sea') }, { id: 2, name: i18n.t('static.supplyPlan.air') }], width: 100 },
                                                { type: 'dropdown', title: i18n.t('static.procurementagent.procurementagent'), source: procurementAgentList, filter: this.filterProcurementAgent, width: 120 },
                                                { type: 'checkbox', title: i18n.t('static.shipmentDataEntry.localProcurement'), width: 80 },
                                                { type: 'text', title: i18n.t('static.shipmentDataentry.procurementAgentOrderNo'), width: 100 },
                                                { type: erpType, title: i18n.t('static.shipmentDataentry.procurementAgentPrimeLineNo'), width: 100 },
                                                { type: 'numeric', title: i18n.t("static.supplyPlan.adjustesOrderQty"), width: 100, mask: '#,##.00', decimal: '.', textEditor: true, disabledMaskOnEdition: true },
                                                { type: 'checkbox', title: i18n.t('static.supplyPlan.emergencyOrder'), width: 100 },
                                                { type: 'dropdown', title: i18n.t('static.subfundingsource.fundingsource'), source: fundingSourceList, filter: this.filterFundingSource, width: 120 },
                                                { type: 'dropdown', title: i18n.t('static.dashboard.budget'), source: budgetList, filter: this.budgetDropdownFilter, width: 120 },
                                                { type: 'dropdown', title: i18n.t('static.dashboard.currency'), source: currencyList, filter: this.filterCurrency, width: 120 },
                                                { type: 'numeric', title: i18n.t('static.supplyPlan.pricePerPlanningUnit'), width: 80, mask: '#,##.00', decimal: '.', textEditor: true, disabledMaskOnEdition: true },
                                                { type: 'numeric', readOnly: true, title: i18n.t('static.shipment.productcost'), width: 120, mask: '#,##.00', textEditor: true, decimal: '.' },
                                                { type: 'numeric', title: i18n.t('static.shipment.freightcost'), width: 80, mask: '#,##.00', decimal: '.', textEditor: true, disabledMaskOnEdition: true },
                                                { type: 'dropdown', title: i18n.t('static.datasource.datasource'), source: dataSourceList, filter: this.filterDataSourceList, width: 150 },
                                                { type: 'text', title: i18n.t('static.program.notes'), width: 200 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.createdDate'), width: 0 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.erpFlag'), width: 0 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.lastshipmentStatus'), width: 0 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.index'), width: 0 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 200 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.totalQtyBatchInfo'), width: 0 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.shipmentDatesJson'), width: 0 },
                                                { type: 'hidden', title: "Suggested order Qty" },
                                                { type: 'hidden', title: "Is changed" },
                                                { title: i18n.t('static.inventory.active'), type: 'hidden', width: 0 },
                                                { type: 'hidden' },
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
                                            allowDeleteRow: true,
                                            allowInsertRow: true,
                                            allowManualInsertRow: false,
                                            copyCompatibility: true,
                                            editable: shipmentEditable,
                                            onchange: this.shipmentChanged,
                                            // oneditionstart: this.shipmentEditStart,
                                            allowExport: false,
                                            parseFormulas: true,
                                            filters: filterOption,
                                            license: JEXCEL_PRO_KEY,
                                            onchangepage: this.onchangepage,
                                            oncreateeditor: function (a, b, c, d, e) {
                                                if (c == 10) {
                                                    this.shipmentEditStart(a, b, c, d, e)
                                                }
                                                // if (e.value) {
                                                //     e.selectionStart = e.value.length;
                                                //     e.selectionEnd = e.value.length;
                                                // }
                                            }.bind(this),
                                            onpaste: this.onPaste,
                                            text: {
                                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')} `,
                                                show: '',
                                                entries: '',
                                            },
                                            onload: this.loadedShipments,
                                            updateTable: function (el, cell, x, y, source, value, id) {
                                                console.log("In update table", y);
                                                if (y != null) {
                                                    var elInstance = el.jexcel;
                                                    // var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
                                                    //     'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
                                                    //     'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE']
                                                    var rowData = elInstance.getRowData(y);
                                                    // var erpFlag = rowData[21];
                                                    // if (erpFlag.toString() == true) {
                                                    //     for (var i = 0; i < colArr.length; i++) {
                                                    //         var cell = elInstance.getCell(`${colArr[i]}${parseInt(y) + 1}`)
                                                    //         cell.classList.add('readonly');
                                                    //     }
                                                    // } else {
                                                    // }
                                                    // if (x == 6 || x == 2) {
                                                    //     var procurementAgentPlanningUnit = papuResult.filter(p => p.procurementAgent.id == rowData[6] && p.planningUnit.id == rowData[2]);
                                                    //     if (rowData[6] == "" || (procurementAgentPlanningUnit.length > 0 && ((procurementAgentPlanningUnit[0].unitsPerPalletEuro1 != 0 && procurementAgentPlanningUnit[0].unitsPerPalletEuro1 != null) || (procurementAgentPlanningUnit[0].moq != 0 && procurementAgentPlanningUnit[0].moq != null) || (procurementAgentPlanningUnit[0].unitsPerPalletEuro2 != 0 && procurementAgentPlanningUnit[0].unitsPerPalletEuro2 != null) || (procurementAgentPlanningUnit[0].unitsPerContainer != 0 && procurementAgentPlanningUnit[0].unitsPerContainer != null)))) {
                                                    //         console.log("In if")
                                                    //         var cell = elInstance.getCell(`K${parseInt(y) + 1}`)
                                                    //         console.log("Cell=------------------>",cell)
                                                    //         cell.classList.add('readonly');
                                                    //     } else {
                                                    //         console.log("In else")
                                                    //         var cell = elInstance.getCell(`K${parseInt(y) + 1}`)
                                                    //         console.log("Cell=------------------>",cell)
                                                    //         cell.classList.remove('readonly');
                                                    //     }
                                                    // }
                                                }
                                            }.bind(this),
                                            contextMenu: function (obj, x, y, e) {
                                                var items = [];
                                                if (y != null) {
                                                    if (shipmentEditable) {
                                                        items.push({
                                                            title: i18n.t('static.supplyPlan.addNewShipment'),
                                                            onclick: function () {
                                                                this.addRowInJexcel();
                                                            }.bind(this)
                                                        });
                                                    }

                                                    // Add shipment batch info
                                                    var rowData = obj.getRowData(y);
                                                    var expectedDeliveryDate = moment(rowData[4]).format("YYYY-MM-DD");
                                                    var expiryDate = moment(expectedDeliveryDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                                                    if ((rowData[3] == DELIVERED_SHIPMENT_STATUS || rowData[3] == SHIPPED_SHIPMENT_STATUS || rowData[3] == ARRIVED_SHIPMENT_STATUS)) {
                                                        items.push({
                                                            title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                                            onclick: function () {
                                                                this.props.updateState("loading", true);
                                                                if (this.props.shipmentPage == "shipmentDataEntry") {
                                                                    this.props.updateState("shipmentModalTitle", i18n.t("static.dataEntry.batchDetails"));
                                                                    this.props.toggleLarge();
                                                                }
                                                                var rowData = obj.getRowData(y)
                                                                var batchInfoListAll = this.props.items.programJson.batchInfoList;
                                                                this.setState({
                                                                    batchInfoListAll: batchInfoListAll
                                                                })
                                                                if (document.getElementById("showShipmentBatchInfoButtonsDiv") != null) {
                                                                    document.getElementById("showShipmentBatchInfoButtonsDiv").style.display = 'block';
                                                                }
                                                                this.el = jexcel(document.getElementById("shipmentBatchInfoTable"), '');
                                                                this.el.destroy();
                                                                var json = [];
                                                                // var elInstance=this.state.plannedPsmShipmentsEl;

                                                                var batchInfo = rowData[24];
                                                                var tableEditable = shipmentEditable;
                                                                if (rowData[21].toString() == "true" || this.props.shipmentPage == "supplyPlanCompare") {
                                                                    tableEditable = false;
                                                                }
                                                                if (this.props.shipmentPage != "shipmentDataEntry" && document.getElementById("addRowBatchId") != null) {
                                                                    console.log("in if");
                                                                    if (rowData[21].toString() == "false" && tableEditable == true) {
                                                                        document.getElementById("addRowBatchId").style.display = "block";
                                                                    } else {
                                                                        console.log("In else")
                                                                        document.getElementById("addRowBatchId").style.display = "none";
                                                                    }
                                                                }

                                                                if (this.props.shipmentPage == "shipmentDataEntry" && document.getElementById("addShipmentBatchRowId") != null) {
                                                                    if (tableEditable == false) {
                                                                        console.log("In false")
                                                                        document.getElementById("addShipmentBatchRowId").style.display = "none";
                                                                    } else {
                                                                        document.getElementById("addShipmentBatchRowId").style.display = "block";
                                                                    }
                                                                }
                                                                for (var sb = 0; sb < batchInfo.length; sb++) {
                                                                    var data = [];
                                                                    data[0] = batchInfo[sb].batch.batchNo;
                                                                    data[1] = batchInfo[sb].batch.expiryDate;
                                                                    data[2] = batchInfo[sb].shipmentQty;
                                                                    data[3] = batchInfo[sb].shipmentTransBatchInfoId;
                                                                    data[4] = y;
                                                                    data[5] = batchInfoListAll.findIndex(c => c.batchNo == batchInfo[sb].batch.batchNo && moment(c.expiryDate).format("YYYY-MM-DD") == moment(batchInfo[sb].batch.expiryDate).format("YYYY-MM-DD"))
                                                                    data[6] = batchInfo[sb].batch.autoGenerated;
                                                                    data[7] = batchInfo[sb].batch.batchNo;
                                                                    data[8] = batchInfo[sb].batch.expiryDate;
                                                                    data[9] = batchInfo[sb].batch.autoGenerated;
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
                                                                    data[6] = false;
                                                                    data[7] = "";
                                                                    data[8] = "";
                                                                    data[9] = "";
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
                                                                                format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker',
                                                                                validRange: [moment(expectedDeliveryDate).format("YYYY-MM-DD"), null]
                                                                            }
                                                                        },
                                                                        {
                                                                            title: i18n.t('static.supplyPlan.shipmentQty'),
                                                                            type: 'numeric',
                                                                            textEditor: true,
                                                                            mask: '#,##.00', decimal: '.'
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
                                                                        },
                                                                        { type: 'checkbox', title: i18n.t('static.report.autogenerated'), readOnly: true },
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
                                                                    allowDeleteRow: true,
                                                                    oneditionend: this.onedit,
                                                                    copyCompatibility: true,
                                                                    allowInsertRow: true,
                                                                    allowManualInsertRow: false,
                                                                    editable: tableEditable,
                                                                    onchange: this.batchInfoChangedShipment,
                                                                    allowExport: false,
                                                                    text: {
                                                                        // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                                                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                                                                        show: '',
                                                                        entries: '',
                                                                    },
                                                                    onload: this.loadedBatchInfoShipment,
                                                                    license: JEXCEL_PRO_KEY,
                                                                    updateTable: function (el, cell, x, y, source, value, id) {
                                                                    }.bind(this),
                                                                    contextMenu: function (obj, x, y, e) {
                                                                        var items = [];
                                                                        if (y == null) {
                                                                        } else {
                                                                            // Insert new row
                                                                            if (shipmentEditable && obj.options.allowInsertRow == true) {
                                                                                items.push({
                                                                                    title: i18n.t('static.supplyPlan.addNewBatchInfo'),
                                                                                    onclick: function () {
                                                                                        this.addBatchRowInJexcel()
                                                                                    }.bind(this)
                                                                                });
                                                                            }
                                                                            if (shipmentEditable && obj.options.allowDeleteRow == true && obj.getJson(null, false).length > 1) {
                                                                                // region id
                                                                                if (obj.getRowData(y)[5] == -1) {
                                                                                    items.push({
                                                                                        title: i18n.t("static.common.deleterow"),
                                                                                        onclick: function () {
                                                                                            this.props.updateState("shipmentBatchInfoChangedFlag", 1);
                                                                                            obj.deleteRow(parseInt(y));
                                                                                        }.bind(this)
                                                                                    });
                                                                                }
                                                                            }
                                                                        }
                                                                        return items;
                                                                    }.bind(this)
                                                                };
                                                                var elVar = jexcel(document.getElementById("shipmentBatchInfoTable"), options);
                                                                this.el = elVar;
                                                                this.setState({ shipmentBatchInfoTableEl: elVar });
                                                                this.props.updateState("loading", false);
                                                            }.bind(this)
                                                        });
                                                    }

                                                    if (rowData[6] != "" && rowData[5] != "" && rowData[2] != "") {
                                                        items.push({
                                                            title: i18n.t('static.supplyPlan.showShipmentDates'),
                                                            onclick: function () {
                                                                var procurementAgent = rowData[6];
                                                                var db1;
                                                                var storeOS;
                                                                getDatabase();
                                                                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                                                                openRequest.onerror = function (event) {
                                                                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                                                                    this.props.updateState("color", "red");
                                                                    this.props.hideFirstComponent();
                                                                }.bind(this);
                                                                openRequest.onsuccess = function (e) {
                                                                    db1 = e.target.result;
                                                                    var programJson = this.props.items.programJson;
                                                                    var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                                                                    var papuOs = papuTransaction.objectStore('procurementAgent');
                                                                    var papuRequest = papuOs.get(parseInt(procurementAgent));
                                                                    papuRequest.onerror = function (event) {
                                                                        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                                                                        this.props.updateState("color", "red");
                                                                        this.props.hideFirstComponent();
                                                                    }.bind(this);
                                                                    papuRequest.onsuccess = function (event) {
                                                                        var papuResult = [];
                                                                        papuResult = papuRequest.result;

                                                                        this.props.updateState("loading", true);
                                                                        if (this.props.shipmentPage == "shipmentDataEntry") {
                                                                            this.props.updateState("shipmentModalTitle", i18n.t("static.shipment.shipmentDates"));
                                                                            this.props.toggleLarge();
                                                                        }
                                                                        if (document.getElementById("showSaveShipmentsDatesButtonsDiv") != null) {
                                                                            document.getElementById("showSaveShipmentsDatesButtonsDiv").style.display = 'block';
                                                                        }
                                                                        this.el = jexcel(document.getElementById("shipmentDatesTable"), '');
                                                                        this.el.destroy();
                                                                        var json = [];
                                                                        var shipmentDates = rowData[26];
                                                                        var shipmentStatus = rowData[3];
                                                                        var emergencyOrder = rowData[11];
                                                                        var expectedDeliveryDate = shipmentDates.expectedDeliveryDate;
                                                                        var expectedPlannedDate = "";
                                                                        var expectedSubmittedDate = "";
                                                                        var expectedApprovedDate = "";
                                                                        var expectedShippedDate = "";
                                                                        var expectedArrivedDate = "";
                                                                        var plannedDate = shipmentDates.plannedDate;
                                                                        var submittedDate = shipmentDates.submittedDate;
                                                                        var approvedDate = shipmentDates.approvedDate;
                                                                        var shippedDate = shipmentDates.shippedDate;
                                                                        var arrivedDate = shipmentDates.arrivedDate;
                                                                        var receivedDate = shipmentDates.receivedDate;
                                                                        if (shipmentStatus != DELIVERED_SHIPMENT_STATUS) {
                                                                            receivedDate = null;
                                                                        }
                                                                        if (shipmentStatus != ARRIVED_SHIPMENT_STATUS && shipmentStatus != DELIVERED_SHIPMENT_STATUS) {
                                                                            arrivedDate = null;
                                                                        }
                                                                        if (shipmentStatus != SHIPPED_SHIPMENT_STATUS && shipmentStatus != ARRIVED_SHIPMENT_STATUS && shipmentStatus != DELIVERED_SHIPMENT_STATUS) {
                                                                            shippedDate = null;
                                                                        }
                                                                        if (shipmentStatus != APPROVED_SHIPMENT_STATUS && shipmentStatus != SHIPPED_SHIPMENT_STATUS && shipmentStatus != ARRIVED_SHIPMENT_STATUS && shipmentStatus != DELIVERED_SHIPMENT_STATUS) {
                                                                            approvedDate = null;
                                                                        }
                                                                        if (shipmentStatus != SUBMITTED_SHIPMENT_STATUS && shipmentStatus != APPROVED_SHIPMENT_STATUS && shipmentStatus != SHIPPED_SHIPMENT_STATUS && shipmentStatus != ARRIVED_SHIPMENT_STATUS && shipmentStatus != DELIVERED_SHIPMENT_STATUS) {
                                                                            submittedDate = null;
                                                                        }
                                                                        console.log("Shipment Dates", shipmentDates);
                                                                        console.log("Received Date", receivedDate)
                                                                        var addLeadTimes = 0;
                                                                        if (rowData[7].toString() == "true") {
                                                                            addLeadTimes = this.props.items.planningUnitListAll.filter(c => c.planningUnit.id == rowData[2])[0].localProcurementLeadTime;
                                                                            var leadTimesPerStatus = addLeadTimes / 5;
                                                                            expectedArrivedDate = moment(expectedDeliveryDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                            expectedShippedDate = moment(expectedArrivedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                            expectedApprovedDate = moment(expectedShippedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                            expectedSubmittedDate = moment(expectedApprovedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                            expectedPlannedDate = moment(expectedSubmittedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                                                        } else {
                                                                            var shipmentMode = rowData[5];
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
                                                                            expectedArrivedDate = moment(expectedDeliveryDate).subtract(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                            expectedShippedDate = moment(expectedArrivedDate).subtract(parseInt(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                            expectedApprovedDate = moment(expectedShippedDate).subtract(parseInt(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                            expectedSubmittedDate = moment(expectedApprovedDate).subtract(parseInt(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                            expectedPlannedDate = moment(expectedSubmittedDate).subtract(parseInt(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                                                        }

                                                                        var tableEditable = shipmentEditable;
                                                                        if (rowData[21].toString() == "true" || this.props.shipmentPage == "supplyPlanCompare" || shipmentStatus == ON_HOLD_SHIPMENT_STATUS || shipmentStatus == CANCELLED_SHIPMENT_STATUS) {
                                                                            tableEditable = false;
                                                                        }

                                                                        data = [];
                                                                        data[0] = i18n.t("static.supplyPlan.estimated")
                                                                        data[1] = expectedPlannedDate;
                                                                        data[2] = expectedSubmittedDate;
                                                                        data[3] = expectedApprovedDate;
                                                                        data[4] = expectedShippedDate;
                                                                        data[5] = expectedArrivedDate;
                                                                        data[6] = expectedDeliveryDate;
                                                                        data[7] = y;
                                                                        data[8] = i18n.t("static.supplyPlan.estimated")
                                                                        json.push(data);
                                                                        var data = [];
                                                                        data[0] = i18n.t("static.consumption.actual")
                                                                        data[1] = plannedDate;
                                                                        data[2] = submittedDate;
                                                                        data[3] = approvedDate;
                                                                        data[4] = shippedDate;
                                                                        data[5] = arrivedDate;
                                                                        data[6] = receivedDate;
                                                                        data[7] = y;
                                                                        data[8] = i18n.t("static.consumption.actual")
                                                                        json.push(data);
                                                                        var options = {
                                                                            data: json,
                                                                            columnDrag: true,
                                                                            colWidths: [80, 100, 100, 100, 100, 100, 100, 0, 80],
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
                                                                                        format: JEXCEL_DATE_FORMAT,
                                                                                        validRange: [null, (moment(Date.now()).format("YYYY-MM-DD")).toString()]
                                                                                    }
                                                                                },
                                                                                {
                                                                                    title: i18n.t('static.supplyPlan.submittedDate'),
                                                                                    type: 'calendar',
                                                                                    options: {
                                                                                        format: JEXCEL_DATE_FORMAT,
                                                                                        validRange: [null, (moment(Date.now()).format("YYYY-MM-DD")).toString()]
                                                                                    }
                                                                                },
                                                                                {
                                                                                    title: i18n.t('static.supplyPlan.approvedDate'),
                                                                                    type: 'calendar',
                                                                                    options: {
                                                                                        format: JEXCEL_DATE_FORMAT,
                                                                                        validRange: [null, (moment(Date.now()).format("YYYY-MM-DD")).toString()]
                                                                                    }
                                                                                },
                                                                                {
                                                                                    title: i18n.t('static.supplyPlan.shippedDate'),
                                                                                    type: 'calendar',
                                                                                    options: {
                                                                                        format: JEXCEL_DATE_FORMAT,
                                                                                        validRange: [null, (moment(Date.now()).format("YYYY-MM-DD")).toString()]
                                                                                    }
                                                                                },
                                                                                {
                                                                                    title: i18n.t('static.supplyPlan.arrivedDate'),
                                                                                    type: 'calendar',
                                                                                    options: {
                                                                                        format: JEXCEL_DATE_FORMAT,
                                                                                        validRange: [null, (moment(Date.now()).format("YYYY-MM-DD")).toString()]
                                                                                    }
                                                                                },
                                                                                {
                                                                                    title: i18n.t('static.shipment.receiveddate'),
                                                                                    type: 'calendar',
                                                                                    options: {
                                                                                        format: JEXCEL_DATE_FORMAT,
                                                                                        validRange: shipmentStatus == DELIVERED_SHIPMENT_STATUS ? [null, (moment(Date.now()).format("YYYY-MM-DD")).toString()] : [null, null]
                                                                                    }
                                                                                },
                                                                                {
                                                                                    title: i18n.t('static.supplyPlan.rowNumber'),
                                                                                    type: 'hidden',
                                                                                },
                                                                                {
                                                                                    title: i18n.t('static.supplyPlan.type'),
                                                                                    type: 'text',
                                                                                    readOnly: true
                                                                                },
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
                                                                            contextMenu: function (obj, x, y, e) {
                                                                                var items = [];
                                                                                return items;
                                                                            },
                                                                            license: JEXCEL_PRO_KEY,
                                                                            text: {
                                                                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} `,
                                                                                show: '',
                                                                                entries: '',
                                                                            },
                                                                            onload: this.loadedShipmentDates,
                                                                            updateTable: function (el, cell, x, y, source, value, id) {
                                                                                var elInstance = el.jexcel;
                                                                                var cell = elInstance.getCell(`B${parseInt(0) + 1}`)
                                                                                cell.classList.add('readonly');
                                                                                var cell = elInstance.getCell(`C${parseInt(0) + 1}`)
                                                                                cell.classList.add('readonly');
                                                                                var cell = elInstance.getCell(`D${parseInt(0) + 1}`)
                                                                                cell.classList.add('readonly');
                                                                                var cell = elInstance.getCell(`E${parseInt(0) + 1}`)
                                                                                cell.classList.add('readonly');
                                                                                var cell = elInstance.getCell(`F${parseInt(0) + 1}`)
                                                                                cell.classList.add('readonly');
                                                                                if (shipmentStatus == PLANNED_SHIPMENT_STATUS) {
                                                                                    var cell = elInstance.getCell(`B${parseInt(1) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`C${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                    var cell = elInstance.getCell(`D${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                    var cell = elInstance.getCell(`E${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                    var cell = elInstance.getCell(`F${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                    var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                } else if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                                                                                    var cell = elInstance.getCell(`B${parseInt(1) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`C${parseInt(1) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`D${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                    var cell = elInstance.getCell(`E${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                    var cell = elInstance.getCell(`F${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                    var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                } else if (shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                                                                                    var cell = elInstance.getCell(`B${parseInt(1) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`C${parseInt(1) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`D${parseInt(1) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`E${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                    var cell = elInstance.getCell(`F${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                    var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                } else if (shipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                                                                                    var cell = elInstance.getCell(`B${parseInt(1) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`C${parseInt(1) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`D${parseInt(1) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`E${parseInt(1) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`F${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                    var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                } else if (shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
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
                                                                                    var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                } else if (shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
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
                                                                                    var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                                    cell.classList.remove('readonly');
                                                                                    var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                                    cell.classList.remove('readonly');
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
                                                                                    var cell = elInstance.getCell(`G${parseInt(0) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                    var cell = elInstance.getCell(`G${parseInt(1) + 1}`)
                                                                                    cell.classList.add('readonly');
                                                                                }

                                                                            }.bind(this)
                                                                        };
                                                                        var elVar = jexcel(document.getElementById("shipmentDatesTable"), options);
                                                                        this.el = elVar;
                                                                        this.setState({ shipmentDatesTableEl: elVar });
                                                                        this.props.updateState("loading", false);
                                                                    }.bind(this)
                                                                }.bind(this)
                                                            }.bind(this)
                                                        })
                                                    }
                                                    if (shipmentEditable && rowData[3].toString() == PLANNED_SHIPMENT_STATUS && rowData[23] != -1) {
                                                        items.push({
                                                            title: i18n.t('static.common.deleterow'),
                                                            onclick: function () {
                                                                obj.setValueFromCoords(29, y, false, true);
                                                            }.bind(this)
                                                        });
                                                    }
                                                    if (shipmentEditable && obj.options.allowDeleteRow == true && obj.getJson(null, false).length > 1) {
                                                        // region id
                                                        if (obj.getRowData(y)[23] == -1) {
                                                            items.push({
                                                                title: i18n.t("static.common.deleterow"),
                                                                onclick: function () {
                                                                    this.props.updateState("shipmentChangedFlag", 1);
                                                                    obj.deleteRow(parseInt(y));
                                                                }.bind(this)
                                                            });
                                                        }
                                                    }
                                                }
                                                return items;
                                            }.bind(this)
                                        }

                                        var myVar = jexcel(document.getElementById("shipmentsDetailsTable"), options);
                                        this.el = myVar;
                                        this.setState({
                                            shipmentsEl: myVar,
                                        })
                                        this.props.updateState("loading", false);
                                    }.bind(this)
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this);
    }

    addRowInJexcel() {
        var obj = this.state.shipmentsEl;
        console.log("this.props.items.catalogPrice", this.props.items.catalogPrice)
        var json = obj.getJson(null, false);
        var data = [];
        data[0] = true;
        data[1] = 0;
        data[2] = document.getElementById("planningUnitId").value;
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = false;
        data[8] = "";
        data[9] = "";
        data[10] = 0;
        data[11] = false;
        data[12] = "";
        data[13] = "";
        data[14] = USD_CURRENCY_ID;
        data[15] = this.props.items.catalogPrice;
        data[16] = `=ROUND(P${parseInt(json.length) + 1}*K${parseInt(json.length) + 1},2)`;
        data[17] = "";
        data[18] = NONE_SELECTED_DATA_SOURCE_ID;
        data[19] = "";
        data[20] = moment(Date.now()).format("YYYY-MM-DD");
        data[21] = false;
        data[22] = ""
        data[23] = -1;
        data[24] = "";
        data[25] = 0;
        data[26] = "";
        data[27] = 0;
        data[28] = 1;
        data[29] = true;
        data[30] = 0;
        data[31] = 1;
        obj.insertRow(data);
        obj.setValueFromCoords(1, json.length, 0, true);
        obj.setValueFromCoords(10, json.length, 0, true);
        obj.setValueFromCoords(15, json.length, this.props.items.catalogPrice, true);
        obj.setValueFromCoords(21, json.length, false, true);
        obj.setValueFromCoords(25, json.length, 0, true);
        obj.setValueFromCoords(27, json.length, 0, true);
        obj.setValueFromCoords(30, json.length, 0, true);
        // obj.setValueFromCoords(2, json.length, document.getElementById("planningUnitId").value, true);
        // obj.setValueFromCoords(7, json.length, false, true);
        // obj.setValueFromCoords(20, json.length, moment(Date.now()).format("YYYY-MM-DD"), true);

        // obj.setValueFromCoords(18, json.length, NONE_SELECTED_DATA_SOURCE_ID, true);
        // obj.setValueFromCoords(21, json.length, false, true);
        // obj.setValueFromCoords(23, json.length, -1, true);
        // obj.setValueFromCoords(25, json.length, 0, true);
        // obj.setValueFromCoords(11, json.length, false, true);
        // obj.setValueFromCoords(0, json.length, true, true);
        // obj.setValueFromCoords(27, json.length, 0, true);
        // obj.setValueFromCoords(28, json.length, 1, true);
        // obj.setValueFromCoords(29, json.length, true, true);
        // obj.setValueFromCoords(30, json.length, 0, true);
        if (this.props.shipmentPage == "shipmentDataEntry") {
            var showOption = (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
            console.log("showOption", showOption);
            if (showOption != 5000000) {
                var pageNo = parseInt(parseInt(json.length - 1) / parseInt(showOption));
                obj.page(pageNo);
            }
        }
    }

    addBatchRowInJexcel() {
        var data = [];
        var obj = this.state.shipmentBatchInfoTableEl;
        var rowData = obj.getRowData(0);
        var shipmentInstance = this.state.shipmentsEl;
        var shipmentRowData = shipmentInstance.getRowData(rowData[4]);
        var expectedDeliveryDate = moment(shipmentRowData[4]).format("YYYY-MM-DD");
        var expiryDate = moment(expectedDeliveryDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
        data[0] = "";
        data[1] = expiryDate;
        data[2] = "";
        data[3] = 0;
        data[4] = rowData[4];
        data[5] = -1;
        data[6] = "false";
        data[7] = "";
        data[8] = "";
        data[9] = "";
        obj.insertRow(data);
    }

    filterCurrency = function (instance, cell, c, r, source) {
        return this.state.currencyList.filter(c => c.active.toString() == "true");
    }.bind(this)

    filterDataSourceList = function (instance, cell, c, r, source) {
        return this.state.dataSourceList.filter(c => c.active.toString() == "true");
    }.bind(this)

    filterFundingSource = function (instance, cell, c, r, source) {
        return this.state.fundingSourceList.filter(c => c.active.toString() == "true");
    }.bind(this)

    filterProcurementAgent = function (instance, cell, c, r, source) {
        return this.state.procurementAgentList.filter(c => c.active.toString() == "true");
    }.bind(this)

    filterShipmentStatus = function (instance, cell, c, r, source) {
        return this.state.shipmentStatusList.filter(c => c.active.toString() == "true");
    }.bind(this)

    loadedShipments = function (instance, cell, x, y, value) {
        if (this.props.shipmentPage != "shipmentDataEntry") {
            jExcelLoadedFunctionOnlyHideRow(instance);
        } else {
            jExcelLoadedFunction(instance);
        }
        var asterisk = document.getElementsByClassName("resizable")[0];
        var tr = asterisk.firstChild;
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[7].classList.add('AsteriskTheadtrTd');
        tr.children[13].classList.add('AsteriskTheadtrTd');
        tr.children[18].classList.add('AsteriskTheadtrTd');
        tr.children[11].classList.add('AsteriskTheadtrTd');
        // tr.children[14].classList.add('AsteriskTheadtrTd');
        tr.children[15].classList.add('AsteriskTheadtrTd');
        tr.children[16].classList.add('AsteriskTheadtrTd');
        // tr.children[17].classList.add('AsteriskTheadtrTd');
        tr.children[19].classList.add('AsteriskTheadtrTd');
        var shipmentInstance = (instance).jexcel;
        shipmentInstance.orderBy(4, 0);
        var json = shipmentInstance.getJson(null, false);
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE']
        var jsonLength;
        if (this.props.shipmentPage == "shipmentDataEntry") {
            if ((document.getElementsByClassName("jexcel_pagination_dropdown")[0] != undefined)) {
                jsonLength = 1 * (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
            }
        } else {
            jsonLength = json.length;
        }
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        console.log("JsonLength----------->", jsonLength);
        console.log("shipmentInstance----------->", shipmentInstance)
        for (var i = 0; i < jsonLength; i++) {
            console.log("i------------>", i)
            var rowData = shipmentInstance.getRowData(i);
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE']
            for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(i) + 1);
                if (rowData[0].toString() == "false" || rowData[3] == CANCELLED_SHIPMENT_STATUS) {
                    shipmentInstance.setStyle(col, "background-color", "transparent");
                    shipmentInstance.setStyle(col, "background-color", "#D3D3D3");
                    var cell = shipmentInstance.getCell(`Q${parseInt(i) + 1}`)
                    cell.classList.add('shipmentEntryDoNotInclude');
                    var cell = shipmentInstance.getCell(`K${parseInt(i) + 1}`)
                    cell.classList.add('shipmentEntryDoNotInclude');
                    var cell = shipmentInstance.getCell(`B${parseInt(i) + 1}`)
                    cell.classList.add('shipmentEntryDoNotInclude');
                    var element = document.getElementById("shipmentsDetailsTable");
                    element.classList.remove("jexcelremoveReadonlybackground");
                } else {
                    shipmentInstance.setStyle(col, "background-color", "transparent");
                    var cell = shipmentInstance.getCell(`Q${parseInt(i) + 1}`)
                    cell.classList.remove('shipmentEntryDoNotInclude');
                    // cell.classList.add('readonly');
                    var cell = shipmentInstance.getCell(`K${parseInt(i) + 1}`)
                    cell.classList.remove('shipmentEntryDoNotInclude');
                    var cell = shipmentInstance.getCell(`B${parseInt(i) + 1}`)
                    cell.classList.remove('shipmentEntryDoNotInclude');
                    // cell.classList.add('readonly');
                    var element = document.getElementById("shipmentsDetailsTable");
                    element.classList.remove("jexcelremoveReadonlybackground");
                }

                if (rowData[11].toString() == "true") {
                    console.log("In if");
                    shipmentInstance.setStyle(col, "color", "#000");
                    shipmentInstance.setStyle(col, "color", "red");
                    var cell = shipmentInstance.getCell(`Q${parseInt(i) + 1}`)
                    cell.classList.add('shipmentEntryEmergency');
                    var cell = shipmentInstance.getCell(`K${parseInt(i) + 1}`)
                    cell.classList.add('shipmentEntryEmergency');
                    var cell = shipmentInstance.getCell(`B${parseInt(i) + 1}`)
                    cell.classList.add('shipmentEntryEmergency');
                } else {
                    console.log("In else")
                    shipmentInstance.setStyle(col, "color", "#000");
                    var cell = shipmentInstance.getCell(`Q${parseInt(i) + 1}`)
                    cell.classList.remove('shipmentEntryEmergency');
                    var cell = shipmentInstance.getCell(`K${parseInt(i) + 1}`)
                    cell.classList.remove('shipmentEntryEmergency');
                    var cell = shipmentInstance.getCell(`B${parseInt(i) + 1}`)
                    cell.classList.remove('shipmentEntryEmergency');
                }
            }
        }
    }

    onchangepage(el, pageNo, oldPageNo) {
        var shipmentInstance = el.jexcel;
        var json = shipmentInstance.getJson(null, false);
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE']
        var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var start = pageNo * (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
        console.log("JsonLength------------>", jsonLength, "pageNo", pageNo)
        for (var i = start; i < jsonLength; i++) {
            console.log("D--------------->", i, "JsonLength", jsonLength);
            var rowData = shipmentInstance.getRowData(i);
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE']
            for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(i) + 1);
                if (rowData[0].toString() == "false" || rowData[3] == CANCELLED_SHIPMENT_STATUS) {
                    shipmentInstance.setStyle(col, "background-color", "transparent");
                    shipmentInstance.setStyle(col, "background-color", "#D3D3D3");
                    var cell = shipmentInstance.getCell(`Q${parseInt(i) + 1}`)
                    cell.classList.add('shipmentEntryDoNotInclude');
                    var cell = shipmentInstance.getCell(`K${parseInt(i) + 1}`)
                    cell.classList.add('shipmentEntryDoNotInclude');
                    var cell = shipmentInstance.getCell(`B${parseInt(i) + 1}`)
                    cell.classList.add('shipmentEntryDoNotInclude');
                    var element = document.getElementById("shipmentsDetailsTable");
                    element.classList.remove("jexcelremoveReadonlybackground");
                } else {
                    shipmentInstance.setStyle(col, "background-color", "transparent");
                    var cell = shipmentInstance.getCell(`Q${parseInt(i) + 1}`)
                    cell.classList.remove('shipmentEntryDoNotInclude');
                    // cell.classList.add('readonly');
                    var cell = shipmentInstance.getCell(`K${parseInt(i) + 1}`)
                    cell.classList.remove('shipmentEntryDoNotInclude');
                    var cell = shipmentInstance.getCell(`B${parseInt(i) + 1}`)
                    cell.classList.remove('shipmentEntryDoNotInclude');
                    // cell.classList.add('readonly');
                    var element = document.getElementById("shipmentsDetailsTable");
                    element.classList.remove("jexcelremoveReadonlybackground");
                }
                if (rowData[11].toString() == "true") {
                    console.log("In if");
                    shipmentInstance.setStyle(col, "color", "#000");
                    shipmentInstance.setStyle(col, "color", "red");
                    var cell = shipmentInstance.getCell(`Q${parseInt(i) + 1}`)
                    cell.classList.add('shipmentEntryEmergency');
                    var cell = shipmentInstance.getCell(`K${parseInt(i) + 1}`)
                    cell.classList.add('shipmentEntryEmergency');
                    var cell = shipmentInstance.getCell(`B${parseInt(i) + 1}`)
                    cell.classList.add('shipmentEntryEmergency');
                } else {
                    console.log("In else")
                    shipmentInstance.setStyle(col, "color", "#000");
                    var cell = shipmentInstance.getCell(`Q${parseInt(i) + 1}`)
                    cell.classList.remove('shipmentEntryEmergency');
                    var cell = shipmentInstance.getCell(`K${parseInt(i) + 1}`)
                    cell.classList.remove('shipmentEntryEmergency');
                    var cell = shipmentInstance.getCell(`B${parseInt(i) + 1}`)
                    cell.classList.remove('shipmentEntryEmergency');
                }
            }
        }
    }

    loadedQtyCalculator = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("resizable")[1];
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        var elInstance = instance.jexcel;
        console.log("Y", y, "x", x)
        var y = 0;
        var validation = checkValidtion("number", "F", y, ((elInstance.getCell(`F${parseInt(0) + 1}`)).innerHTML).toString().replaceAll("\,", ""), elInstance, JEXCEL_INTEGER_REGEX, 1, 0);
        console.log("Validation", validation);
        validation = checkValidtion("number", "C", y, elInstance.getRowData(0)[2], elInstance, JEXCEL_INTEGER_REGEX, 1, 0);

    }

    loadedQtyCalculator1 = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    budgetDropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson(null, false)[r])[12];
        var receiveDate = (instance.jexcel.getJson(null, false)[r])[4];
        console.log("Value", value);
        if (value != "") {
            var budgetList = this.state.budgetListAll;
            mylist = budgetList.filter(b => b.fundingSource.fundingSourceId == value && b.programId == this.state.programIdForBudget && b.active.toString() == "true" && moment(b.startDate).format("YYYY-MM-DD") <= moment(receiveDate).format("YYYY-MM-DD") && moment(b.stopDate).format("YYYY-MM-DD") >= moment(receiveDate).format("YYYY-MM-DD"));
            mylist.push({ id: '', name: i18n.t('static.common.select') })
        }
        console.log("My list", mylist);
        return mylist;
    }

    calculateEmergencyOrder(y) {
        var shipmentInstance = this.state.shipmentsEl;
        var rowData = shipmentInstance.getRowData(y);
        var procurementAgent = rowData[6];
        var shipmentStatus = rowData[3];
        var expectedPlannedDate = "";
        var expectedSubmittedDate = "";
        var expectedApprovedDate = "";
        var expectedShippedDate = "";
        var expectedArrivedDate = "";
        var expectedDeliveryDate = rowData[4];
        var shipmentMode = rowData[5];
        var programJson = this.props.items.programJson;
        if (expectedDeliveryDate != "") {
            if (procurementAgent != "") {
                var db1;
                var storeOS;
                getDatabase();
                var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                openRequest.onerror = function (event) {
                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                    this.props.updateState("color", "red");
                    this.props.hideFirstComponent();
                }.bind(this);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                    var papuOs = papuTransaction.objectStore('procurementAgent');
                    var papuRequest = papuOs.get(parseInt(procurementAgent));
                    papuRequest.onerror = function (event) {
                        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                        this.props.updateState("color", "red");
                        this.props.hideFirstComponent();
                    }.bind(this);
                    papuRequest.onsuccess = function (event) {
                        var papuResult = [];
                        papuResult = papuRequest.result;
                        var addLeadTimes = 0;
                        console.log("Expected delivery date", expectedDeliveryDate);
                        if (rowData[7].toString() == "true") {
                            console.log("In if");
                            addLeadTimes = this.props.items.planningUnitListAll.filter(c => c.planningUnit.id == rowData[2])[0].localProcurementLeadTime;
                            var leadTimesPerStatus = addLeadTimes / 5;
                            expectedArrivedDate = moment(expectedDeliveryDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            expectedShippedDate = moment(expectedArrivedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            expectedApprovedDate = moment(expectedShippedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            expectedSubmittedDate = moment(expectedApprovedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            expectedPlannedDate = moment(expectedSubmittedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                        } else {
                            console.log("In else");
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
                            expectedArrivedDate = moment(expectedDeliveryDate).subtract(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                            expectedShippedDate = moment(expectedArrivedDate).subtract(parseInt(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            expectedApprovedDate = moment(expectedShippedDate).subtract(parseInt(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            expectedSubmittedDate = moment(expectedApprovedDate).subtract(parseInt(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            expectedPlannedDate = moment(expectedSubmittedDate).subtract(parseInt(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                        }
                        var expectedDate = expectedPlannedDate;
                        if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                            expectedDate = expectedSubmittedDate;
                        } else if (shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                            expectedDate = expectedApprovedDate;
                        } else if (shipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                            expectedDate = expectedShippedDate;
                        } else if (shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                            expectedDate = expectedArrivedDate
                        } else if (shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                            expectedDate = expectedDeliveryDate;
                        }
                        if (moment(expectedDate).format("YYYY-MM-DD") < moment(Date.now()).format("YYYY-MM-DD")) {
                            shipmentInstance.setValueFromCoords(11, y, true, true);
                        } else {
                            shipmentInstance.setValueFromCoords(11, y, false, true);
                        }
                    }.bind(this)
                }.bind(this)
            } else {
                expectedArrivedDate = moment(expectedDeliveryDate).subtract(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                if (shipmentMode == 2) {
                    expectedShippedDate = moment(expectedArrivedDate).subtract(parseInt(programJson.shippedToArrivedByAirLeadTime * 30), 'days').format("YYYY-MM-DD");
                } else {
                    expectedShippedDate = moment(expectedArrivedDate).subtract(parseInt(programJson.shippedToArrivedBySeaLeadTime * 30), 'days').format("YYYY-MM-DD");
                }
                expectedApprovedDate = moment(expectedShippedDate).subtract(parseInt(programJson.approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                expectedSubmittedDate = moment(expectedApprovedDate).subtract(parseInt(programJson.submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                expectedPlannedDate = moment(expectedSubmittedDate).subtract(parseInt(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                var expectedDate = expectedPlannedDate;
                if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                    expectedDate = expectedSubmittedDate;
                } else if (shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                    expectedDate = expectedApprovedDate;
                } else if (shipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                    expectedDate = expectedShippedDate;
                } else if (shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                    expectedDate = expectedArrivedDate
                } else if (shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                    expectedDate = expectedDeliveryDate;
                }
                if (moment(expectedDate).format("YYYY-MM-DD") < moment(Date.now()).format("YYYY-MM-DD")) {
                    shipmentInstance.setValueFromCoords(11, y, true, true);
                } else {
                    shipmentInstance.setValueFromCoords(11, y, false, true);
                }
            }
        }
    }

    shipmentChanged = function (instance, cell, x, y, value) {
        console.log("Y--------------->", y, "x", x, "Value", value);
        var elInstance = instance.jexcel;
        console.log("El instance------------>", elInstance)
        var rowData = elInstance.getRowData(y);
        var planningUnitId = rowData[2];
        this.props.updateState("shipmentError", "");
        this.props.updateState("noFundsBudgetError", "");
        console.log("X-------->", x, "Y---------->", y);
        if ((x == 4 || x == 6 || x == 5 || x == 7) && rowData[22] == "") {
            this.calculateEmergencyOrder(y);
        }
        if (x == 26) {
            console.log("Changed", value.expectedDeliveryDate);
        }
        if (x == 4) {
            console.log("In 4")
            var validation = checkValidtion("date", "E", y, rowData[4], elInstance);
            if (validation == false) {
            } else {
                if (rowData[3] == DELIVERED_SHIPMENT_STATUS) {
                    var curDate = moment(Date.now()).format("YYYY-MM-DD");
                    var selectedDate = moment(rowData[4]).format("YYYY-MM-DD");
                    if (selectedDate > curDate) {
                        inValid("E", y, i18n.t('static.supplyPlan.dateustBeLessThanCurDate'), elInstance);
                    } else {
                        positiveValidation("E", y, elInstance);
                    }
                } else {
                    positiveValidation("E", y, elInstance);
                }
            }
        }
        if (x == 4) {
            console.log("Changed 1 =>", value);
            var shipmentDatesJson = rowData[26];
            var shipmentStatus = rowData[3];
            console.log("shipmentDatesJson", shipmentDatesJson);
            if (shipmentDatesJson != "") {
            } else {
                shipmentDatesJson = {
                    receivedDate: "",
                    expectedDeliveryDate: ""
                }
            }
            if (shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                if (value != "" && value != null && value != "Invalid date") {
                    shipmentDatesJson.receivedDate = moment(value).format("YYYY-MM-DD");
                    var lastShipmentStatus = rowData[22];
                    if (shipmentDatesJson.expectedDeliveryDate == "" || shipmentDatesJson.expectedDeliveryDate == null || shipmentDatesJson.expectedDeliveryDate == "Invalid date" || lastShipmentStatus == "") {
                        shipmentDatesJson.expectedDeliveryDate = moment(value).format("YYYY-MM-DD");
                    }
                } else {
                    shipmentDatesJson.receivedDate = "";
                }
                console.log("In if");
                if (shipmentDatesJson != "") {
                    elInstance.setValueFromCoords(26, y, shipmentDatesJson, true);
                }
            } else {
                shipmentDatesJson.expectedDeliveryDate = moment(value).format("YYYY-MM-DD");
                elInstance.setValueFromCoords(26, y, shipmentDatesJson, true);
                console.log("In else", shipmentDatesJson.expectedDeliveryDate);
            }
        }

        if (x != 28 && x != 26 && x != 30) {
            elInstance.setValueFromCoords(30, y, 0, true);

        }
        if (x != 28 && x != 26) {
            elInstance.setValueFromCoords(28, y, 1, true);
        }
        if (x == 3) {
            var valid = checkValidtion("text", "D", y, value, elInstance);
            if (valid == true) {
                var shipmentDates = rowData[26];
                if (value == DELIVERED_SHIPMENT_STATUS) {
                } else {
                    if (shipmentDates.expectedDeliveryDate != "" && shipmentDates.expectedDeliveryDate != null && shipmentDates.expectedDeliveryDate != "Invalid date") {
                        elInstance.setValueFromCoords(4, y, shipmentDates.expectedDeliveryDate, true);
                    } else {
                    }
                }
                if (value == SUBMITTED_SHIPMENT_STATUS || value == ARRIVED_SHIPMENT_STATUS || value == SHIPPED_SHIPMENT_STATUS || value == DELIVERED_SHIPMENT_STATUS || value == APPROVED_SHIPMENT_STATUS) {
                    var budget = rowData[13];
                    var valid = checkValidtion("text", "N", y, budget, elInstance);
                    var procurementAgent = rowData[6];
                    var fundingSource = rowData[12];
                    if (procurementAgent == TBD_PROCUREMENT_AGENT_ID) {
                        inValid("G", y, i18n.t('static.supplyPlan.procurementAgentCannotBeTBD'), elInstance);
                    } else {
                        positiveValidation("G", y, elInstance);
                    }

                    if (fundingSource == TBD_FUNDING_SOURCE) {
                        inValid("M", y, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'), elInstance);
                    } else {
                        positiveValidation("M", y, elInstance);
                    }
                } else {
                    positiveValidation("N", y, elInstance);
                    positiveValidation("G", y, elInstance);
                    positiveValidation("M", y, elInstance);
                }
                console.log("rowData[21] for lead time", rowData[26].expectedDeliveryDate)
                if (rowData[23] == -1 && (rowData[26].expectedDeliveryDate == "" || rowData[26].expectedDeliveryDate == null || rowData[26].expectedDeliveryDate == "Invalid date")) {
                    this.calculateLeadTimesOnChange(y);
                }

            } else {
                elInstance.setValueFromCoords(30, y, 1, true);
            }

            var validation = checkValidtion("date", "E", y, rowData[4], elInstance);
            if (validation == false) {
            } else {
                if (rowData[3] == DELIVERED_SHIPMENT_STATUS) {
                    var curDate = moment(Date.now()).format("YYYY-MM-DD");
                    var selectedDate = moment(rowData[4]).format("YYYY-MM-DD");
                    if (selectedDate > curDate) {
                        inValid("E", y, i18n.t('static.supplyPlan.dateustBeLessThanCurDate'), elInstance);
                    } else {
                        positiveValidation("E", y, elInstance);
                    }
                } else {
                    positiveValidation("E", y, elInstance);
                }
            }
        }

        if (x == 13) {
            var value = rowData[3];
            if (value == SUBMITTED_SHIPMENT_STATUS || value == ARRIVED_SHIPMENT_STATUS || value == SHIPPED_SHIPMENT_STATUS || value == DELIVERED_SHIPMENT_STATUS || value == APPROVED_SHIPMENT_STATUS) {
                var budget = rowData[13];
                console.log("D------------->Value", budget)
                var valid = checkValidtion("text", "N", y, budget, elInstance);
                if (valid == false) {
                    elInstance.setValueFromCoords(30, y, 1, true);
                }
            }
        }

        if (x == 6) {
            var valid = checkValidtion("text", "G", y, rowData[6], elInstance);
            if (valid == true) {
                var shipmentStatus = rowData[3];
                if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                    if (rowData[6] == TBD_PROCUREMENT_AGENT_ID) {
                        inValid("G", y, i18n.t('static.supplyPlan.procurementAgentCannotBeTBD'), elInstance);
                    } else {
                        positiveValidation("G", y, elInstance);
                        valid = true;
                    }
                }
            } else {
                elInstance.setValueFromCoords(30, y, 1, true);
            }
            if (valid == true) {
                var procurementAgentPlanningUnit = this.state.procurementAgentPlanningUnitListAll.filter(c => c.procurementAgent.id == rowData[6] && c.planningUnit.id == planningUnitId);
                // if (procurementAgentPlanningUnit.length > 0 && ((procurementAgentPlanningUnit[0].unitsPerPalletEuro1 != 0 && procurementAgentPlanningUnit[0].unitsPerPalletEuro1 != null) || (procurementAgentPlanningUnit[0].moq != 0 && procurementAgentPlanningUnit[0].moq != null) || (procurementAgentPlanningUnit[0].unitsPerPalletEuro2 != 0 && procurementAgentPlanningUnit[0].unitsPerPalletEuro2 != null) || (procurementAgentPlanningUnit[0].unitsPerContainer != 0 && procurementAgentPlanningUnit[0].unitsPerContainer != null))) {
                //     elInstance.setValueFromCoords(8, y, "", true);
                // }
                console.log("RowData------------------>", rowData)
                var pricePerUnit = elInstance.getValue(`P${parseInt(y) + 1}`, true).toString().replaceAll("\,", "");
                if (rowData[23] == -1) {
                    console.log("Price per unit", pricePerUnit);
                    if (procurementAgentPlanningUnit.length > 0) {
                        console.log("in length greater than 0")
                        pricePerUnit = parseFloat(procurementAgentPlanningUnit[0].catalogPrice);
                    } else {
                        pricePerUnit = this.props.items.catalogPrice
                    }
                    if (rowData[14] != "") {
                        var conversionRateToUsd = parseFloat((this.state.currencyListAll.filter(c => c.currencyId == rowData[14])[0]).conversionRateToUsd);
                        pricePerUnit = parseFloat(pricePerUnit / conversionRateToUsd).toFixed(2);
                        elInstance.setValueFromCoords(15, y, pricePerUnit, true);
                    }
                }
                console.log("rowData[21] for lead time", rowData[26].expectedDeliveryDate)
                if (rowData[23] == -1 && (rowData[26].expectedDeliveryDate == "" || rowData[26].expectedDeliveryDate == null || rowData[26].expectedDeliveryDate == "Invalid date")) {
                    this.calculateLeadTimesOnChange(y);
                }
            } else {
                elInstance.setValueFromCoords(30, y, 1, true);
            }
        }

        if (x == 14) {
            var valid = checkValidtion("text", "O", y, rowData[14], elInstance);
            if (valid == true) {
                var pricePerUnit = elInstance.getValue(`P${parseInt(y) + 1}`, true).toString().replaceAll("\,", "");
                var freightCost = elInstance.getValue(`R${parseInt(y) + 1}`, true).toString().replaceAll("\,", "");
                var lastConversionRate = rowData[31];
                var conversionRateToUsd = parseFloat((this.state.currencyListAll.filter(c => c.currencyId == rowData[14])[0]).conversionRateToUsd);
                pricePerUnit = parseFloat((pricePerUnit * lastConversionRate) / conversionRateToUsd).toFixed(2);
                elInstance.setValueFromCoords(15, y, pricePerUnit, true);
                elInstance.setValueFromCoords(31, y, conversionRateToUsd, true);
                // if (rowData[23] == -1 && rowData[14] != "") {
                //     var procurementAgentPlanningUnit = this.state.procurementAgentPlanningUnitListAll.filter(c => c.procurementAgent.id == rowData[6] && c.planningUnit.id == planningUnitId);

                //     // if (pricePerUnit.toString() == "") {
                //     console.log("Price per unit", pricePerUnit);
                //     if (procurementAgentPlanningUnit.length > 0) {
                //         console.log("in length greater than 0")
                //         pricePerUnit = parseFloat(procurementAgentPlanningUnit[0].catalogPrice);
                //     } else {
                //         pricePerUnit = this.props.items.catalogPrice;
                //     }

                // }
                // }
            } else {
                elInstance.setValueFromCoords(30, y, 1, true);
            }
        }

        if (x == 12) {
            var valid = checkValidtion("text", "M", y, rowData[12], elInstance);
            elInstance.setValueFromCoords(13, y, "", true);
            if (valid == true) {
                var budgetList = this.state.budgetListAll;
                var receiveDate = rowData[4]
                var mylist = budgetList.filter(b => b.fundingSource.fundingSourceId == value && b.programId == this.state.programIdForBudget && b.active.toString() == "true" && moment(b.startDate).format("YYYY-MM-DD") <= moment(receiveDate).format("YYYY-MM-DD") && moment(b.stopDate).format("YYYY-MM-DD") >= moment(receiveDate).format("YYYY-MM-DD"));
                console.log("MyList---------->", mylist);
                if (mylist.length == 1) {
                    elInstance.setValueFromCoords(13, y, mylist[0].id, true);
                } else if (mylist.length == 0) {
                    elInstance.setValueFromCoords(13, y, '', true);
                }
                var shipmentStatus = rowData[3];
                if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                    if (rowData[12] == TBD_FUNDING_SOURCE) {
                        inValid("M", y, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'), elInstance);
                    } else {
                        positiveValidation("M", y, elInstance);
                    }
                }
            } else {
                elInstance.setValueFromCoords(30, y, 1, true);
            }
        }

        if (x == 18) {
            var valid = checkValidtion("text", "S", y, rowData[18], elInstance);
            if (valid == false) {
                elInstance.setValueFromCoords(30, y, 1, true);
            }
        }

        if (x == 19) {
            if (rowData[19].length > 600) {
                inValid("T", y, i18n.t('static.dataentry.notesMaxLength'), elInstance);
            } else {
                positiveValidation("T", y, elInstance);
            }
        }

        if (x == 5) {
            var valid = checkValidtion("text", "F", y, rowData[5], elInstance);
            if (valid == true) {
                var rate = elInstance.getValue(`Q${parseInt(y) + 1}`, true).toString().replaceAll("\,", "");
                if (rowData[23] == -1) {
                    var freightCost = 0;
                    if (rowData[5] == 1) {
                        var seaFreightPercentage = this.props.items.programJson.seaFreightPerc;
                        freightCost = parseFloat(rate) * (parseFloat(parseFloat(seaFreightPercentage) / 100));
                        elInstance.setValueFromCoords(17, y, freightCost.toFixed(2), true);
                    } else {
                        var airFreightPercentage = this.props.items.programJson.airFreightPerc;
                        freightCost = parseFloat(rate) * (parseFloat(parseFloat(airFreightPercentage) / 100));
                        elInstance.setValueFromCoords(17, y, freightCost.toFixed(2), true);
                    }
                }
                console.log("rowData[21] for lead time", rowData[26].expectedDeliveryDate)
                if (rowData[23] == -1 && (rowData[26].expectedDeliveryDate == "" || rowData[26].expectedDeliveryDate == null || rowData[26].expectedDeliveryDate == "Invalid date")) {
                    this.calculateLeadTimesOnChange(y);
                }
            } else {
                elInstance.setValueFromCoords(30, y, 1, true);
            }
        }

        if (x == 16) {
            var rate = elInstance.getValue(`Q${parseInt(y) + 1}`, true).toString().replaceAll("\,", "")
            if (rowData[23] == -1) {
                console.log("In if");
                var freightCost = 0;
                if (rowData[5] == 1) {
                    var seaFreightPercentage = this.props.items.programJson.seaFreightPerc;
                    freightCost = parseFloat(rate) * (parseFloat(parseFloat(seaFreightPercentage) / 100));
                    elInstance.setValueFromCoords(17, y, freightCost.toFixed(2), true);
                } else {
                    var airFreightPercentage = this.props.items.programJson.airFreightPerc;
                    freightCost = parseFloat(rate) * (parseFloat(parseFloat(airFreightPercentage) / 100));
                    elInstance.setValueFromCoords(17, y, freightCost.toFixed(2), true);
                }
            }
            positiveValidation("Q", y, elInstance);
        }

        if (x == 4) {
            var batchDetails = rowData[24];
            if (batchDetails.length > 0) {
                var findAutoGenerated = batchDetails.findIndex(c => c.batch.autoGenerated.toString() == "true");
                if (findAutoGenerated != -1) {
                    batchDetails[findAutoGenerated].batch.expiryDate = moment(value).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD")
                    elInstance.setValueFromCoords(24, y, batchDetails, true);
                }
            }
            // console.log("D------------------>In x==4")
            // var budgetList = this.state.budgetListAll;
            // var receiveDate = rowData[4]
            // var fundingSourceId = rowData[12];
            // var mylist = budgetList.filter(b => b.fundingSource.fundingSourceId == fundingSourceId && b.programId == this.state.programIdForBudget && b.active.toString() == "true" && moment(b.startDate).format("YYYY-MM-DD") <= moment(receiveDate).format("YYYY-MM-DD") && moment(b.stopDate).format("YYYY-MM-DD") >= moment(receiveDate).format("YYYY-MM-DD"));
            // console.log("MyList---------->", mylist);
            // if (mylist.length == 1) {
            //     // elInstance.setValueFromCoords(13, y, mylist[0].id, true);
            // } else if (mylist.length == 0) {
            //     // elInstance.setValueFromCoords(13, y, '', true);
            // }
        }

        if (x == 10) {
            var valid = checkValidtion("number", "K", y, elInstance.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll("\,", ""), elInstance, JEXCEL_INTEGER_REGEX, 1, 0);
            console.log("Valida", valid);
            if (valid == false) {
                elInstance.setValueFromCoords(30, y, 1, true);
            } else {
                var batchDetails = rowData[24];
                if (batchDetails.length == 1) {
                    if (batchDetails[0].batch.autoGenerated.toString() == "true") {
                        batchDetails[0].shipmentQty = elInstance.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll("\,", "");
                        elInstance.setValueFromCoords(24, y, batchDetails, true);
                        elInstance.setValueFromCoords(25, y, elInstance.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll("\,", ""), true);
                    }
                }
            }
        }

        if (x == 15) {
            var valid = checkValidtion("number", "P", y, elInstance.getValue(`P${parseInt(y) + 1}`, true).toString().replaceAll("\,", ""), elInstance, JEXCEL_DECIMAL_NO_REGEX, 1, 1);
            if (valid == false) {
                elInstance.setValueFromCoords(30, y, 1, true);
            }
        }

        if (x == 17) {
            var valid = checkValidtion("number", "R", y, elInstance.getValue(`R${parseInt(y) + 1}`, true).toString().replaceAll("\,", ""), elInstance, JEXCEL_DECIMAL_NO_REGEX, 1, 1);
            if (valid == false) {
                elInstance.setValueFromCoords(30, y, 1, true);
            }
        }

        if (x == 25) {
            if (value != 0) {
                var adjustedQty = elInstance.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll("\,", "")
                console.log("Adjusted Qty", adjustedQty);
                console.log("Value", value);
                if (value > adjustedQty) {
                    inValid("K", y, i18n.t('static.supplyPlan.batchNumberMissing'), elInstance);
                    this.props.updateState("shipmentBatchError", i18n.t('static.supplyPlan.batchNumberMissing'));
                    this.props.hideSecondComponent()
                } else {
                    console.log("In eklse");
                    positiveValidation("K", y, elInstance);
                    this.props.updateState("shipmentBatchError", "");
                }
            }
        }

        if (x == 11 || x == 0 || x == 29 || x == 3) {
            console.log("In 19", rowData[3]);
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE']
            for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(y) + 1);
                if (rowData[0].toString() == "false" || rowData[3] == CANCELLED_SHIPMENT_STATUS) {
                    console.log("D---------------> in if");
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "#D3D3D3");
                    var cell = elInstance.getCell(`Q${parseInt(y) + 1}`)
                    cell.classList.add('shipmentEntryDoNotInclude');
                    var cell = elInstance.getCell(`K${parseInt(y) + 1}`)
                    cell.classList.add('shipmentEntryDoNotInclude');
                    var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                    cell.classList.add('shipmentEntryDoNotInclude');
                    var element = document.getElementById("shipmentsDetailsTable");
                    element.classList.remove("jexcelremoveReadonlybackground");
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    var cell = elInstance.getCell(`Q${parseInt(y) + 1}`)
                    cell.classList.remove('shipmentEntryDoNotInclude');
                    var cell = elInstance.getCell(`K${parseInt(y) + 1}`)
                    cell.classList.remove('shipmentEntryDoNotInclude');
                    var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                    cell.classList.remove('shipmentEntryDoNotInclude');
                    var element = document.getElementById("shipmentsDetailsTable");
                    element.classList.remove("jexcelremoveReadonlybackground");
                }

                if (rowData[11].toString() == "true") {
                    console.log("In if");
                    elInstance.setStyle(col, "color", "#000");
                    elInstance.setStyle(col, "color", "red");
                    var cell = elInstance.getCell(`Q${parseInt(y) + 1}`)
                    cell.classList.add('shipmentEntryEmergency');
                    var cell = elInstance.getCell(`K${parseInt(y) + 1}`)
                    cell.classList.add('shipmentEntryEmergency');
                    var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                    cell.classList.add('shipmentEntryEmergency');
                } else {
                    console.log("In else")
                    elInstance.setStyle(col, "color", "#000");
                    var cell = elInstance.getCell(`Q${parseInt(y) + 1}`)
                    cell.classList.remove('shipmentEntryEmergency');
                    var cell = elInstance.getCell(`K${parseInt(y) + 1}`)
                    cell.classList.remove('shipmentEntryEmergency');
                    var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                    cell.classList.remove('shipmentEntryEmergency');
                }

                if (rowData[29].toString() == "false") {
                    elInstance.setStyle(col, "color", "#000");
                    elInstance.setStyle(col, "color", "#808080");
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "#808080");
                    var element = document.getElementById("shipmentsDetailsTable");
                    element.classList.remove("jexcelremoveReadonlybackground");
                    var cell = elInstance.getCell(`Q${parseInt(y) + 1}`)
                    cell.classList.add('shipmentEntryDelete');
                    var cell = elInstance.getCell(`K${parseInt(y) + 1}`)
                    cell.classList.add('shipmentEntryDelete');
                    var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                    cell.classList.add('shipmentEntryDelete');
                } else {
                    if (rowData[0].toString() == "false" || rowData[3] == CANCELLED_SHIPMENT_STATUS) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "#D3D3D3");
                        var cell = elInstance.getCell(`Q${parseInt(y) + 1}`)
                        cell.classList.add('shipmentEntryDoNotInclude');
                        var cell = elInstance.getCell(`K${parseInt(y) + 1}`)
                        cell.classList.add('shipmentEntryDoNotInclude');
                        var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell.classList.add('shipmentEntryDoNotInclude');
                        var element = document.getElementById("shipmentsDetailsTable");
                        element.classList.remove("jexcelremoveReadonlybackground");
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        var cell = elInstance.getCell(`Q${parseInt(y) + 1}`)
                        cell.classList.remove('shipmentEntryDoNotInclude');
                        var cell = elInstance.getCell(`K${parseInt(y) + 1}`)
                        cell.classList.remove('shipmentEntryDoNotInclude');
                        var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell.classList.remove('shipmentEntryDoNotInclude');
                        var element = document.getElementById("shipmentsDetailsTable");
                        element.classList.remove("jexcelremoveReadonlybackground");
                    }
                    if (rowData[11].toString() == "true") {
                        console.log("In if");
                        elInstance.setStyle(col, "color", "#000");
                        elInstance.setStyle(col, "color", "red");
                        var cell = elInstance.getCell(`Q${parseInt(y) + 1}`)
                        cell.classList.add('shipmentEntryEmergency');
                        var cell = elInstance.getCell(`K${parseInt(y) + 1}`)
                        cell.classList.add('shipmentEntryEmergency');
                        var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell.classList.add('shipmentEntryEmergency');
                    } else {
                        console.log("In else")
                        elInstance.setStyle(col, "color", "#000");
                        var cell = elInstance.getCell(`Q${parseInt(y) + 1}`)
                        cell.classList.remove('shipmentEntryEmergency');
                        var cell = elInstance.getCell(`K${parseInt(y) + 1}`)
                        cell.classList.remove('shipmentEntryEmergency');
                        var cell = elInstance.getCell(`B${parseInt(y) + 1}`)
                        cell.classList.remove('shipmentEntryEmergency');
                    }
                }
            }
        }
        this.props.updateState("shipmentChangedFlag", 1);
        // this.showOnlyErrors();
    }

    shipmentQtyChanged = function (instance, cell, x, y, value) {
        this.props.updateState("qtyCalculatorValidationError", "");
        this.props.updateState("shipmentQtyChangedFlag", 1);
        var elInstance = this.state.qtyCalculatorTableEl;
        var elInstance1 = this.state.qtyCalculatorTableEl1;
        var rowData = elInstance.getRowData(y);
        if (x == 0) {
            if (elInstance1 != undefined && elInstance1 != "") {
                elInstance1.setValueFromCoords(7, 0, value, true);
            }
        }

        if (x == 1) {
            if (elInstance1 != undefined && elInstance1 != "") {
                elInstance1.setValueFromCoords(8, 0, value, true);
            }
        }

        if (x == 2) {
            if (elInstance1 != undefined && elInstance1 != "") {
                elInstance1.setValueFromCoords(9, 0, value, true);
            }
            checkValidtion("number", "C", y, elInstance.getRowData(0)[2], elInstance, JEXCEL_INTEGER_REGEX, 1, 0);
        }

        if (x == 4) {
            if (value == "" && (rowData[3] == 1 || rowData[3] == 3 || rowData[3] == 4)) {
                elInstance.setValueFromCoords(4, 0, 1, true);
            }
        }

        if (x == 5) {
            console.log("In x==5")
            var valid = checkValidtion("number", "F", y, ((elInstance.getCell(`F${parseInt(0) + 1}`)).innerHTML).toString().replaceAll("\,", ""), elInstance, JEXCEL_INTEGER_REGEX, 1, 0);
            if (valid == true) {
                if (elInstance1 != undefined && elInstance1 != "") {
                    console.log("In instance is not defined");
                    elInstance1.setValueFromCoords(10, 0, ((elInstance.getCell(`F${parseInt(0) + 1}`)).innerHTML).toString().replaceAll("\,", ""), true);
                }
            }
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
        this.props.updateState("loading", true);
        var validation = this.checkValidationForShipmentQty();
        if (validation == true) {
            var elInstance = this.state.qtyCalculatorTableEl;
            var elInstance1 = this.state.qtyCalculatorTableEl1;
            var rowData = elInstance.getRowData(0);
            var shipmentQty = ((elInstance.getCell(`F${parseInt(0) + 1}`)).innerHTML).toString().replaceAll("\,", "");
            var rowNumber = rowData[6];
            var shipmentInstance = this.state.shipmentsEl;
            shipmentInstance.setValueFromCoords(10, rowNumber, shipmentQty, true);
            this.props.updateState("shipmentQtyChangedFlag", 0);
            this.props.updateState("shipmentChangedFlag", 1);
            this.props.updateState("qtyCalculatorTableEl", "");
            this.props.updateState("qtyCalculatorTableEl", "");
            this.setState({
                qtyCalculatorTableEl: "",
                qtyCalculatorTableEl1: ""
            })
            if (document.getElementById("showSaveQtyButtonDiv") != null) {
                document.getElementById("showSaveQtyButtonDiv").style.display = 'none';
            }
            this.props.updateState("qtyCalculatorValidationError", "");
            if (this.props.shipmentPage == "shipmentDataEntry") {
                this.props.toggleLarge("submit");
            }
            this.props.updateState("loading", false);
            if (elInstance != undefined && elInstance != "") {
                elInstance.destroy();
            }
            if (elInstance1 != undefined && elInstance1 != undefined) {
                elInstance1.destroy();
            }

        } else {
            this.props.updateState("qtyCalculatorValidationError", i18n.t('static.supplyPlan.validationFailed'));
            this.props.updateState("loading", false);
            this.props.hideThirdComponent()
        }
    }

    checkValidationForShipmentQty() {
        var elInstance = this.state.qtyCalculatorTableEl;
        var y = 0;
        var valid = true;
        var validation = checkValidtion("number", "F", y, ((elInstance.getCell(`F${parseInt(0) + 1}`)).innerHTML).toString().replaceAll("\,", ""), elInstance, JEXCEL_INTEGER_REGEX, 1, 0);
        if (validation == false) {
            valid = false;
        }
        validation = checkValidtion("number", "C", y, elInstance.getRowData(0)[2], elInstance, JEXCEL_INTEGER_REGEX, 1, 0);
        if (validation == false) {
            valid = false;
        }
        return valid;
    }

    loadedBatchInfoShipment = function (instance, cell, x, y, value) {
        console.log("resizeable", document.getElementsByClassName("resizable"));
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("resizable")[1];
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
    }

    batchInfoChangedShipment = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);
        this.props.updateState("shipmentValidationBatchError", "");
        if (x == 0) {
            this.props.updateState("shipmentBatchInfoDuplicateError", "");
            positiveValidation("A", y, elInstance);
            if (rowData[9].toString() == "true") {
                if (rowData[0] != rowData[7] || rowData[1] != rowData[8]) {
                    elInstance.setValueFromCoords(6, y, 0, true);
                } else if (rowData[0] == rowData[7] && rowData[1] == rowData[8] && rowData[6]) {
                    elInstance.setValueFromCoords(6, y, 1, true);
                }
            }
            if (value != "") {
                if (value.length > 26) {
                    inValid("A", y, i18n.t('static.common.max26digittext'), elInstance);
                } else if (!BATCH_NO_REGEX.test(value)) {
                    inValid("A", y, i18n.t('static.message.alphabetnumerallowed'), elInstance);
                } else {
                    positiveValidation("A", y, elInstance);
                }
            } else {
                inValid("A", y, i18n.t('static.label.fieldRequired'), elInstance);
            }
        }

        if (x == 1) {
            this.props.updateState("shipmentBatchInfoDuplicateError", "");
            positiveValidation("A", y, elInstance);
            if (rowData[9].toString() == "true") {
                if (rowData[0] != rowData[7] || rowData[1] != rowData[8]) {
                    elInstance.setValueFromCoords(6, y, 0, true);
                } else if (rowData[0] == rowData[7] && rowData[1] == rowData[8] && rowData[6]) {
                    elInstance.setValueFromCoords(6, y, 1, true);
                }
            }
            checkValidtion("text", "B", y, rowData[1], elInstance);
        }
        if (x == 2) {
            checkValidtion("number", "C", y, rowData[2], elInstance, JEXCEL_INTEGER_REGEX, 1, 1);
        }
        this.props.updateState("shipmentBatchInfoChangedFlag", 1);
    }.bind(this)

    checkValidationShipmentBatchInfo() {
        var valid = true;
        var elInstance = this.state.shipmentBatchInfoTableEl;
        var json = elInstance.getJson(null, false);
        var mapArray = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var batchInfoList = this.state.batchInfoListAll;
            var checkDuplicate = batchInfoList.filter(c =>
                c.batchNo == map.get("0") &&
                moment(c.expiryDate).format("YYYY-MM") == moment(map.get("1")).startOf('month').format("YYYY-MM")
            )
            var index = batchInfoList.findIndex(c =>
                c.batchNo == map.get("0") &&
                moment(c.expiryDate).format("YYYY-MM") == moment(map.get("1")).startOf('month').format("YYYY-MM")
            );

            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("0") == map.get("0") &&
                moment(c.get("1")).startOf('month').format("YYYY-MM") == moment(map.get("1")).startOf('month').format("YYYY-MM")
            )

            if (checkDuplicateInMap.length > 1) {
                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    inValid(colArr[c], y, i18n.t('static.supplyPlan.duplicateBatchNumber'), elInstance);
                }
                valid = false;
                this.props.updateState("shipmentBatchInfoDuplicateError", i18n.t('static.supplyPlan.duplicateBatchNumber'));
                this.props.hideFifthComponent()
            } else {
                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    positiveValidation(colArr[c], y, elInstance);
                }



                var rowData = elInstance.getRowData(y);
                var value = rowData[0];
                if (value != "") {
                    if (value.length > 26) {
                        inValid("A", y, i18n.t('static.common.max26digittext'), elInstance);
                        valid = false;
                    } else if (!BATCH_NO_REGEX.test(value)) {
                        inValid("A", y, i18n.t('static.message.alphabetnumerallowed'), elInstance);
                        valid = false;
                    } else {
                        positiveValidation("A", y, elInstance);
                    }
                } else {
                    inValid("A", y, i18n.t('static.label.fieldRequired'), elInstance);
                    valid = false;
                }
                var validation = checkValidtion("text", "B", y, rowData[1], elInstance);
                if (validation.toString() == "false") {
                    valid = false;
                }
                var validation = checkValidtion("number", "C", y, rowData[2], elInstance, JEXCEL_INTEGER_REGEX, 1, 1);
                if (validation.toString() == "false") {
                    valid = false;
                }
            }
        }
        return valid;
    }

    saveShipmentBatchInfo() {
        this.props.updateState("loading", true);
        var validation = this.checkValidationShipmentBatchInfo();
        if (validation == true) {
            var elInstance = this.state.shipmentBatchInfoTableEl;
            var json = elInstance.getJson(null, false);
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
                var autoGenerated = map.get("6");
                if (map.get("0") != "") {
                    batchNo = map.get("0");
                } else {
                    var programId = (document.getElementById("programId").value).split("_")[0];
                    var planningUnitId = document.getElementById("planningUnitId").value;
                    programId = paddingZero(programId, 0, 6);
                    planningUnitId = paddingZero(planningUnitId, 0, 8);
                    batchNo = (BATCH_PREFIX).concat(programId).concat(planningUnitId).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                    autoGenerated = true
                }
                var batchInfoList = this.state.batchInfoListAll.filter(c => c.batchNo == map.get("0") && moment(c.expiryDate).format("YYYY-MM") == moment(map.get("1")).startOf('month').format("YYYY-MM"));
                var batchId = 0;
                if (batchInfoList.length > 0) {
                    batchId = batchInfoList[0].batchId;
                }
                var batchInfoJson = {
                    shipmentTransBatchInfoId: map.get("3"),
                    batch: {
                        batchNo: batchNo,
                        expiryDate: moment(map.get("1")).startOf('month').format("YYYY-MM-DD"),
                        batchId: batchId,
                        autoGenerated: autoGenerated
                    },
                    shipmentQty: map.get("2").toString().replaceAll("\,", ""),
                }
                batchInfoArray.push(batchInfoJson);
                totalShipmentQty += parseInt(map.get("2").toString().replaceAll("\,", ""))
            }
            shipmentInstance.setValueFromCoords(24, rowNumber, batchInfoArray, true);
            shipmentInstance.setValueFromCoords(25, rowNumber, totalShipmentQty, true);
            this.props.updateState("shipmentChangedFlag", 1);
            this.props.updateState("shipmentBatchInfoChangedFlag", 0);
            this.props.updateState("shipmentBatchInfoTableEl", "");
            this.setState({
                shipmentBatchInfoTableEl: ""
            })
            if (document.getElementById("showShipmentBatchInfoButtonsDiv") != null) {
                document.getElementById("showShipmentBatchInfoButtonsDiv").style.display = 'none';
            }
            if (this.props.shipmentPage == "shipmentDataEntry") {
                this.props.toggleLarge("submit");
            }
            this.props.updateState("loading", false);
            elInstance.destroy();
        } else {
            this.props.updateState("shipmentValidationBatchError", i18n.t('static.supplyPlan.validationFailed'));
            this.props.updateState("loading", false);
            this.props.hideFifthComponent()
        }
    }

    loadedShipmentDates = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("resizable")[1];
        var tr = asterisk.firstChild;
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[7].classList.add('AsteriskTheadtrTd');
    }

    calculateLeadTimesOnChange(y) {
        // Logic for dates
        var elInstance = this.state.shipmentsEl;
        console.log("In calculate lead times")
        var rowData = elInstance.getRowData(y);
        var shipmentMode = rowData[5];
        var procurementAgent = rowData[6];
        var shipmentDatesJson = rowData[26];
        var shipmentStatus = rowData[3];
        var lastShipmentStatus = rowData[22];
        var addLeadTimes = 0;
        if (shipmentMode != "" && procurementAgent != "" && shipmentStatus != "") {
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                this.props.updateState("color", "red");
                this.props.hideFirstComponent();
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var programJson = this.props.items.programJson;
                var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                var papuOs = papuTransaction.objectStore('procurementAgent');
                var papuRequest = papuOs.get(parseInt(procurementAgent));
                papuRequest.onerror = function (event) {
                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                    this.props.updateState("color", "red");
                    this.props.hideFirstComponent();
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
                    if (rowData[7].toString() == "true") {
                        addLeadTimes = this.props.items.planningUnitListAll.filter(c => c.planningUnit.id == rowData[2])[0].localProcurementLeadTime;
                        expectedDeliveryDate = moment(Date.now()).add((addLeadTimes * 30), 'days').format("YYYY-MM-DD");
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

                        plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                        submittedDate = moment(plannedDate).add(parseInt(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                        approvedDate = moment(submittedDate).add(parseInt(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                        shippedDate = moment(approvedDate).add(parseInt(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                        arrivedDate = moment(shippedDate).add(parseInt(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                        expectedDeliveryDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                    }
                    if (moment(elInstance.getValueFromCoords(4, y)).format("YYYY-MM-DD") != moment(expectedDeliveryDate).format("YYYY-MM-DD") && shipmentStatus != DELIVERED_SHIPMENT_STATUS) {
                        console.log("In if for calculate lead times", expectedDeliveryDate);
                        elInstance.setValueFromCoords(4, y, expectedDeliveryDate, true);
                    } else {
                        shipmentDatesJson.expectedDeliveryDate = expectedDeliveryDate;
                        elInstance.setValueFromCoords(26, y, shipmentDatesJson, true);
                        console.log("In else for calculate lead times", expectedDeliveryDate);
                        if (shipmentStatus != DELIVERED_SHIPMENT_STATUS) {
                            console.log("In else if for calculate lead times", expectedDeliveryDate);
                            elInstance.setValueFromCoords(4, y, expectedDeliveryDate, true);
                        }
                    }
                }.bind(this)
            }.bind(this)
        }
    }

    shipmentDatesChanged = function (instance, cell, x, y, value) {
        this.props.updateState("shipmentDatesError", "");
        this.props.updateState("shipmentDatesChangedFlag", 1);
        console.log("In change")
        var elInstance = this.state.shipmentDatesTableEl;
        var shipmentInstance = "";
        var rowDataForDates = elInstance.getRowData(0);
        var rowDataForDates1 = elInstance.getRowData(1);
        shipmentInstance = this.state.shipmentsEl;
        var rowData = shipmentInstance.getRowData(rowDataForDates[7]);
        var shipmentStatus = rowData[3];
        var lastShipmentStatus = rowData[22];
        positiveValidation("G", 0, elInstance);
        positiveValidation("C", 1, elInstance);
        positiveValidation("D", 1, elInstance);
        positiveValidation("E", 1, elInstance);
        positiveValidation("F", 1, elInstance);
        positiveValidation("G", 1, elInstance);

        if (x == 6 && y == 0) {
            var valid = checkValidtion("date", "G", 0, rowDataForDates[6], elInstance);
            if (valid == true) {
                console.log("In if")
                if (y == 0) {
                    console.log("In y==0")
                    var shipmentInstance = this.state.shipmentsEl;
                    var procurementAgent = rowData[6];
                    var shipmentStatus = rowData[3];
                    var db1;
                    var storeOS;
                    getDatabase();
                    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
                    openRequest.onerror = function (event) {
                        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                        this.props.updateState("color", "red");
                        this.props.hideFirstComponent();
                    }.bind(this);
                    openRequest.onsuccess = function (e) {
                        db1 = e.target.result;
                        var programJson = this.props.items.programJson;
                        var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                        var papuOs = papuTransaction.objectStore('procurementAgent');
                        var papuRequest = papuOs.get(parseInt(procurementAgent));
                        papuRequest.onerror = function (event) {
                            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                            this.props.updateState("color", "red");
                            this.props.hideFirstComponent();
                        }.bind(this);
                        papuRequest.onsuccess = function (event) {
                            var papuResult = [];
                            papuResult = papuRequest.result;
                            var expectedDeliveryDate = rowDataForDates[6];
                            var expectedPlannedDate = "";
                            var expectedSubmittedDate = "";
                            var expectedApprovedDate = "";
                            var expectedShippedDate = "";
                            var expectedArrivedDate = "";
                            var addLeadTimes = 0;
                            console.log("Expected delivery date", expectedDeliveryDate);
                            if (rowData[7].toString() == "true") {
                                console.log("In if");
                                addLeadTimes = this.props.items.planningUnitListAll.filter(c => c.planningUnit.id == rowData[2])[0].localProcurementLeadTime;
                                var leadTimesPerStatus = addLeadTimes / 5;
                                expectedArrivedDate = moment(expectedDeliveryDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                expectedShippedDate = moment(expectedArrivedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                expectedApprovedDate = moment(expectedShippedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                expectedSubmittedDate = moment(expectedApprovedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                expectedPlannedDate = moment(expectedSubmittedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            } else {
                                console.log("In else");
                                var shipmentMode = rowData[5];
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
                                expectedArrivedDate = moment(expectedDeliveryDate).subtract(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                expectedShippedDate = moment(expectedArrivedDate).subtract(parseInt(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                expectedApprovedDate = moment(expectedShippedDate).subtract(parseInt(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                expectedSubmittedDate = moment(expectedApprovedDate).subtract(parseInt(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                expectedPlannedDate = moment(expectedSubmittedDate).subtract(parseInt(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                            }
                            var expectedDate = expectedPlannedDate;
                            if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                                expectedDate = expectedSubmittedDate;
                            } else if (shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                                expectedDate = expectedApprovedDate;
                            } else if (shipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                                expectedDate = expectedShippedDate;
                            } else if (shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                                expectedDate = expectedArrivedDate
                            } else if (shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                                expectedDate = expectedDeliveryDate;
                            }
                            if (lastShipmentStatus == "") {
                                if (lastShipmentStatus == "" && moment(expectedDate).format("YYYY-MM-DD") < moment(Date.now()).format("YYYY-MM-DD")) {
                                    shipmentInstance.setValueFromCoords(11, rowDataForDates[7], true, true);
                                } else {
                                    shipmentInstance.setValueFromCoords(11, rowDataForDates[7], false, true);
                                }
                            }
                            console.log("dates", expectedArrivedDate);
                            console.log("dates", expectedShippedDate);
                            console.log("dates", expectedApprovedDate);
                            console.log("dates", expectedSubmittedDate);
                            console.log("dates", expectedPlannedDate);

                            elInstance.setValueFromCoords(1, 0, expectedPlannedDate, true);
                            elInstance.setValueFromCoords(2, 0, expectedSubmittedDate, true);
                            elInstance.setValueFromCoords(3, 0, expectedApprovedDate, true);
                            elInstance.setValueFromCoords(4, 0, expectedShippedDate, true);
                            elInstance.setValueFromCoords(5, 0, expectedArrivedDate, true);
                        }.bind(this)
                    }.bind(this)
                }
            }
        }

        if (x == 2 && y == 1) {
            if (rowDataForDates1[1] != "" && rowDataForDates1[1] != null && rowDataForDates1[1] != "Invalid date" && rowDataForDates1[2] != "" && rowDataForDates1[2] != null && rowDataForDates1[2] != "Invalid date" && moment(rowDataForDates1[2]).format("YYYY-MM-DD") < moment(rowDataForDates1[1]).format("YYYY-MM-DD")) {
                inValid("C", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
        }

        if (x == 3 && y == 1) {
            if (rowDataForDates1[2] != "" && rowDataForDates1[2] != null && rowDataForDates1[2] != "Invalid date" && rowDataForDates1[3] != "" && rowDataForDates1[3] != null && rowDataForDates1[3] != "Invalid date" && moment(rowDataForDates1[3]).format("YYYY-MM-DD") < moment(rowDataForDates1[2]).format("YYYY-MM-DD")) {
                inValid("D", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
            if (rowDataForDates1[1] != "" && rowDataForDates1[1] != null && rowDataForDates1[1] != "Invalid date" && rowDataForDates1[3] != "" && rowDataForDates1[3] != null && rowDataForDates1[3] != "Invalid date" && moment(rowDataForDates1[3]).format("YYYY-MM-DD") < moment(rowDataForDates1[1]).format("YYYY-MM-DD")) {
                inValid("D", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
        }

        if (x == 4 && y == 1) {
            if (rowDataForDates1[3] != "" && rowDataForDates1[3] != null && rowDataForDates1[3] != "Invalid date" && rowDataForDates1[4] != "" && rowDataForDates1[4] != null && rowDataForDates1[4] != "Invalid date" && moment(rowDataForDates1[4]).format("YYYY-MM-DD") < moment(rowDataForDates1[3]).format("YYYY-MM-DD")) {
                inValid("E", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
            if (rowDataForDates1[2] != "" && rowDataForDates1[2] != null && rowDataForDates1[2] != "Invalid date" && rowDataForDates1[4] != "" && moment(rowDataForDates1[4]).format("YYYY-MM-DD") < moment(rowDataForDates1[2]).format("YYYY-MM-DD")) {
                inValid("E", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
            if (rowDataForDates1[1] != "" && rowDataForDates1[1] != null && rowDataForDates1[1] != "Invalid date" && rowDataForDates1[4] != "" && rowDataForDates1[4] != null && rowDataForDates1[4] != "Invalid date" && moment(rowDataForDates1[4]).format("YYYY-MM-DD") < moment(rowDataForDates1[1]).format("YYYY-MM-DD")) {
                inValid("E", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
        }

        if (x == 5 && y == 1) {
            if (rowDataForDates1[4] != "" && rowDataForDates1[4] != null && rowDataForDates1[4] != "Invalid date" && rowDataForDates1[5] != "" && rowDataForDates1[5] != null && rowDataForDates1[5] != "Invalid date" && moment(rowDataForDates1[5]).format("YYYY-MM-DD") < moment(rowDataForDates1[4]).format("YYYY-MM-DD")) {
                inValid("F", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
            if (rowDataForDates1[3] != "" && rowDataForDates1[3] != null && rowDataForDates1[3] != "Invalid date" && rowDataForDates1[5] != "" && rowDataForDates1[5] != null && rowDataForDates1[5] != "Invalid date" && moment(rowDataForDates1[5]).format("YYYY-MM-DD") < moment(rowDataForDates1[3]).format("YYYY-MM-DD")) {
                inValid("F", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
            if (rowDataForDates1[2] != "" && rowDataForDates1[2] != null && rowDataForDates1[2] != "Invalid date" && rowDataForDates1[5] != "" && rowDataForDates1[5] != null && rowDataForDates1[5] != "Invalid date" && moment(rowDataForDates1[5]).format("YYYY-MM-DD") < moment(rowDataForDates1[2]).format("YYYY-MM-DD")) {
                inValid("F", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
            if (rowDataForDates1[1] != "" && rowDataForDates1[1] != null && rowDataForDates1[1] != "Invalid date" && rowDataForDates1[5] != "" && rowDataForDates1[5] != null && rowDataForDates1[5] != "Invalid date" && moment(rowDataForDates1[5]).format("YYYY-MM-DD") < moment(rowDataForDates1[1]).format("YYYY-MM-DD")) {
                inValid("F", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
        }

        if (x == 6 && y == 1) {
            if (rowDataForDates1[5] != "" && rowDataForDates1[5] != null && rowDataForDates1[5] != "Invalid date" && rowDataForDates1[6] != "" && rowDataForDates1[6] != null && rowDataForDates1[6] != "Invalid date" && moment(rowDataForDates1[6]).format("YYYY-MM-DD") < moment(rowDataForDates1[5]).format("YYYY-MM-DD")) {
                inValid("G", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
            if (rowDataForDates1[4] != "" && rowDataForDates1[4] != null && rowDataForDates1[4] != "Invalid date" && rowDataForDates1[6] != "" && rowDataForDates1[6] != null && rowDataForDates1[6] != "Invalid date" && moment(rowDataForDates1[6]).format("YYYY-MM-DD") < moment(rowDataForDates1[4]).format("YYYY-MM-DD")) {
                inValid("G", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
            if (rowDataForDates1[3] != "" && rowDataForDates1[3] != null && rowDataForDates1[3] != "Invalid date" && rowDataForDates1[6] != "" && rowDataForDates1[6] != null && rowDataForDates1[6] != "Invalid date" && moment(rowDataForDates1[6]).format("YYYY-MM-DD") < moment(rowDataForDates1[3]).format("YYYY-MM-DD")) {
                inValid("G", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
            if (rowDataForDates1[2] != "" && rowDataForDates1[2] != null && rowDataForDates1[2] != "Invalid date" && rowDataForDates1[6] != "" && rowDataForDates1[6] != null && rowDataForDates1[6] != "Invalid date" && moment(rowDataForDates1[6]).format("YYYY-MM-DD") < moment(rowDataForDates1[2]).format("YYYY-MM-DD")) {
                inValid("G", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
            if (rowDataForDates1[1] != "" && rowDataForDates1[1] != null && rowDataForDates1[1] != "Invalid date" && rowDataForDates1[6] != "" && rowDataForDates1[6] != null && rowDataForDates1[6] != "Invalid date" && moment(rowDataForDates1[6]).format("YYYY-MM-DD") < moment(rowDataForDates1[1]).format("YYYY-MM-DD")) {
                inValid("G", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            }
        }
    }

    checkValidationForShipmentDates() {
        var valid = true;
        var elInstance = this.state.shipmentDatesTableEl;
        // var shipmentInstance = "";
        var rowDataForDates = elInstance.getRowData(0);
        var rowDataForDates1 = elInstance.getRowData(1);
        // shipmentInstance = this.state.shipmentsEl;
        // var rowData = shipmentInstance.getRowData(rowDataForDates[7]);
        // var shipmentStatus = rowData[3];
        var validation = checkValidtion("date", "G", 0, rowDataForDates[6], elInstance);
        if (validation == false) {
            valid = false;
        }

        if (rowDataForDates1[1] != "" && rowDataForDates1[1] != null && rowDataForDates1[1] != "Invalid date" && rowDataForDates1[2] != "" && rowDataForDates1[2] != null && rowDataForDates1[2] != "Invalid date" && moment(rowDataForDates1[2]).format("YYYY-MM-DD") < moment(rowDataForDates1[1]).format("YYYY-MM-DD")) {
            inValid("C", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }

        if (rowDataForDates1[2] != "" && rowDataForDates1[2] != null && rowDataForDates1[2] != "Invalid date" && rowDataForDates1[3] != "" && rowDataForDates1[3] != null && rowDataForDates1[3] != "Invalid date" && moment(rowDataForDates1[3]).format("YYYY-MM-DD") < moment(rowDataForDates1[2]).format("YYYY-MM-DD")) {
            inValid("D", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }
        if (rowDataForDates1[1] != "" && rowDataForDates1[1] != null && rowDataForDates1[1] != "Invalid date" && rowDataForDates1[3] != "" && rowDataForDates1[3] != null && rowDataForDates1[3] != "Invalid date" && moment(rowDataForDates1[3]).format("YYYY-MM-DD") < moment(rowDataForDates1[1]).format("YYYY-MM-DD")) {
            inValid("D", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }

        if (rowDataForDates1[3] != "" && rowDataForDates1[3] != null && rowDataForDates1[3] != "Invalid date" && rowDataForDates1[4] != "" && rowDataForDates1[4] != null && rowDataForDates1[4] != "Invalid date" && moment(rowDataForDates1[4]).format("YYYY-MM-DD") < moment(rowDataForDates1[3]).format("YYYY-MM-DD")) {
            inValid("E", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }
        if (rowDataForDates1[2] != "" && rowDataForDates1[2] != null && rowDataForDates1[2] != "Invalid date" && rowDataForDates1[4] != "" && rowDataForDates1[4] != null && rowDataForDates1[4] != "Invalid date" && moment(rowDataForDates1[4]).format("YYYY-MM-DD") < moment(rowDataForDates1[2]).format("YYYY-MM-DD")) {
            inValid("E", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }
        if (rowDataForDates1[1] != "" && rowDataForDates1[1] != null && rowDataForDates1[1] != "Invalid date" && rowDataForDates1[4] != "" && rowDataForDates1[4] != null && rowDataForDates1[4] != "Invalid date" && moment(rowDataForDates1[4]).format("YYYY-MM-DD") < moment(rowDataForDates1[1]).format("YYYY-MM-DD")) {
            inValid("E", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }

        if (rowDataForDates1[4] != "" && rowDataForDates1[4] != null && rowDataForDates1[4] != "Invalid date" && rowDataForDates1[5] != "" && rowDataForDates1[5] != null && rowDataForDates1[5] != "Invalid date" && moment(rowDataForDates1[5]).format("YYYY-MM-DD") < moment(rowDataForDates1[4]).format("YYYY-MM-DD")) {
            inValid("F", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }
        if (rowDataForDates1[3] != "" && rowDataForDates1[3] != null && rowDataForDates1[3] != "Invalid date" && rowDataForDates1[5] != "" && rowDataForDates1[5] != null && rowDataForDates1[5] != "Invalid date" && moment(rowDataForDates1[5]).format("YYYY-MM-DD") < moment(rowDataForDates1[3]).format("YYYY-MM-DD")) {
            inValid("F", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }
        if (rowDataForDates1[2] != "" && rowDataForDates1[2] != null && rowDataForDates1[2] != "Invalid date" && rowDataForDates1[5] != "" && rowDataForDates1[5] != null && rowDataForDates1[5] != "Invalid date" && moment(rowDataForDates1[5]).format("YYYY-MM-DD") < moment(rowDataForDates1[2]).format("YYYY-MM-DD")) {
            inValid("F", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }
        if (rowDataForDates1[1] != "" && rowDataForDates1[1] != null && rowDataForDates1[1] != "Invalid date" && rowDataForDates1[5] != "" && rowDataForDates1[5] != null && rowDataForDates1[5] != "Invalid date" && moment(rowDataForDates1[5]).format("YYYY-MM-DD") < moment(rowDataForDates1[1]).format("YYYY-MM-DD")) {
            inValid("F", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }

        if (rowDataForDates1[5] != "" && rowDataForDates1[5] != null && rowDataForDates1[5] != "Invalid date" && rowDataForDates1[6] != "" && rowDataForDates1[6] != null && rowDataForDates1[6] != "Invalid date" && moment(rowDataForDates1[6]).format("YYYY-MM-DD") < moment(rowDataForDates1[5]).format("YYYY-MM-DD")) {
            inValid("G", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }
        if (rowDataForDates1[4] != "" && rowDataForDates1[4] != null && rowDataForDates1[4] != "Invalid date" && rowDataForDates1[6] != "" && rowDataForDates1[6] != null && rowDataForDates1[6] != "Invalid date" && moment(rowDataForDates1[6]).format("YYYY-MM-DD") < moment(rowDataForDates1[4]).format("YYYY-MM-DD")) {
            inValid("G", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }
        if (rowDataForDates1[3] != "" && rowDataForDates1[3] != null && rowDataForDates1[3] != "Invalid date" && rowDataForDates1[6] != "" && rowDataForDates1[6] != null && rowDataForDates1[6] != "Invalid date" && moment(rowDataForDates1[6]).format("YYYY-MM-DD") < moment(rowDataForDates1[3]).format("YYYY-MM-DD")) {
            inValid("G", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }
        if (rowDataForDates1[2] != "" && rowDataForDates1[2] != null && rowDataForDates1[2] != "Invalid date" && rowDataForDates1[6] != "" && rowDataForDates1[6] != null && rowDataForDates1[6] != "Invalid date" && moment(rowDataForDates1[6]).format("YYYY-MM-DD") < moment(rowDataForDates1[2]).format("YYYY-MM-DD")) {
            inValid("G", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }
        if (rowDataForDates1[1] != "" && rowDataForDates1[1] != null && rowDataForDates1[1] != "Invalid date" && rowDataForDates1[6] != "" && rowDataForDates1[6] != null && rowDataForDates1[6] != "Invalid date" && moment(rowDataForDates1[6]).format("YYYY-MM-DD") < moment(rowDataForDates1[1]).format("YYYY-MM-DD")) {
            inValid("G", 1, i18n.t('static.shipment.dateIsLesserThanPrevDate'), elInstance);
            valid = false;
        }
        return valid;
    }

    saveShipmentsDate() {
        this.props.updateState("loading", true);
        var validation = this.checkValidationForShipmentDates();
        console.log("Validation====>", validation);
        if (validation == true) {
            var elInstance = this.state.shipmentDatesTableEl;
            var json = elInstance.getJson(null, false);
            var rowNumber = 0;
            var map = new Map(Object.entries(json[1]));
            var map1 = new Map(Object.entries(json[0]));
            console.log("Map", map);
            console.log("Map1", map1);
            rowNumber = map.get("7")
            var json = {
                plannedDate: moment(map.get("1")).format("YYYY-MM-DD"),
                submittedDate: moment(map.get("2")).format("YYYY-MM-DD"),
                approvedDate: moment(map.get("3")).format("YYYY-MM-DD"),
                shippedDate: moment(map.get("4")).format("YYYY-MM-DD"),
                arrivedDate: moment(map.get("5")).format("YYYY-MM-DD"),
                expectedDeliveryDate: moment(map1.get("6")).format("YYYY-MM-DD"),
                receivedDate: moment(map.get("6")).format("YYYY-MM-DD"),
            }
            console.log("map1", moment(map1.get("6")).format("YYYY-MM-DD"));
            console.log("Json", json.expectedDeliveryDate);
            var shipmentInstance = this.state.shipmentsEl;
            shipmentInstance.setValueFromCoords(26, parseInt(rowNumber), json, true);
            shipmentInstance.setValueFromCoords(4, parseInt(rowNumber), map.get("6") != "" && map.get("6") != null && map.get("6") != undefined ? moment(map.get("6")).format("YYYY-MM-DD") : moment(map1.get("6")).format("YYYY-MM-DD"), true);
            this.props.updateState("shipmentChangedFlag", 1);
            this.props.updateState("shipmentDatesChangedFlag", 0);
            this.setState({
                shipmentDatesTableEl: ""
            })
            if (document.getElementById("showSaveShipmentsDatesButtonsDiv") != null) {
                document.getElementById("showSaveShipmentsDatesButtonsDiv").style.display = 'none';
            }
            this.props.updateState("shipmentDatesError", "");
            if (this.props.shipmentPage == "shipmentDataEntry") {
                this.props.toggleLarge("submit");
            }
            this.props.updateState("loading", false);
            elInstance.destroy();
        } else {
            this.props.updateState("shipmentDatesError", i18n.t('static.supplyPlan.validationFailed'));
            this.props.updateState("loading", false);
            this.props.hideFourthComponent()
        }
    }

    checkValidationForShipments() {
        var valid = true;
        var elInstance = this.state.shipmentsEl;
        var json = elInstance.getJson(null, false);
        var checkOtherValidation = true;
        var negativeBudget = 0;
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            var rowData = elInstance.getRowData(y);
            if (checkOtherValidation) {
                var validation = checkValidtion("text", "D", y, rowData[3], elInstance);
                if (validation == true) {
                    if (rowData[3] == SUBMITTED_SHIPMENT_STATUS || rowData[3] == ARRIVED_SHIPMENT_STATUS || rowData[3] == SHIPPED_SHIPMENT_STATUS || rowData[3] == DELIVERED_SHIPMENT_STATUS || rowData[3] == APPROVED_SHIPMENT_STATUS) {
                        var budget = rowData[13];
                        var v = checkValidtion("text", "N", y, budget, elInstance);
                        if (v == false) {
                            valid = false;
                        }
                        var procurementAgent = rowData[6];
                        var fundingSource = rowData[12];
                        console.log("fundingSource", fundingSource);
                        if (procurementAgent == TBD_PROCUREMENT_AGENT_ID) {
                            inValid("G", y, i18n.t('static.supplyPlan.procurementAgentCannotBeTBD'), elInstance);
                            valid = false;
                            elInstance.setValueFromCoords(30, y, 1, true);
                        } else {
                            positiveValidation("G", y, elInstance);
                        }

                        if (fundingSource == TBD_FUNDING_SOURCE) {
                            inValid("M", y, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'), elInstance);
                            valid = false
                        } else {
                            positiveValidation("M", y, elInstance);
                        }
                    } else {
                        positiveValidation("N", y, elInstance);
                        if (map.get("13") != "" && map.get("14") != "") {
                            var budget = this.state.budgetListAll.filter(c => c.id == map.get("13"))[0]
                            var totalBudget = budget.budgetAmt * budget.currency.conversionRateToUsd;
                            var shipmentList = this.props.items.shipmentListUnFiltered.filter(c => c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.active == true && c.budget.id == map.get("13"));
                            var usedBudgetTotalAmount = 0;
                            for (var s = 0; s < shipmentList.length; s++) {
                                var index = "";
                                if (shipmentList[s].shipmentId != 0) {
                                    index = shipmentList.findIndex(c => c.shipmentId == shipmentList[s].shipmentId);
                                } else {
                                    index = shipmentList[s].index;
                                }
                                if (map.get("23") != index) {
                                    usedBudgetTotalAmount += parseFloat((parseFloat(shipmentList[s].productCost) + parseFloat(shipmentList[s].freightCost)) * parseFloat(shipmentList[s].currency.conversionRateToUsd));
                                }
                            }
                            var totalCost = parseFloat(elInstance.getValue(`Q${parseInt(y) + 1}`, true).toString().replaceAll("\,", "")) + parseFloat(elInstance.getValue(`R${parseInt(y) + 1}`, true).toString().replaceAll("\,", ""));
                            var enteredBudgetAmt = (totalCost * (parseFloat((this.state.currencyListAll.filter(c => c.currencyId == rowData[14])[0]).conversionRateToUsd)));
                            usedBudgetTotalAmount = usedBudgetTotalAmount.toFixed(2);
                            enteredBudgetAmt = enteredBudgetAmt.toFixed(2);
                            var availableBudgetAmount = totalBudget - usedBudgetTotalAmount;
                            if (enteredBudgetAmt > availableBudgetAmount || availableBudgetAmount < 0) {
                                negativeBudget = negativeBudget + 1;
                                inValid("N", y, i18n.t('static.label.noFundsAvailable'), elInstance);
                            } else {
                            }
                        } else {
                        }
                        positiveValidation("G", y, elInstance);
                        positiveValidation("M", y, elInstance);
                    }

                } else {
                    valid = false;
                }

                var validation = checkValidtion("text", "G", y, rowData[6], elInstance);
                if (validation == true) {
                    var shipmentStatus = rowData[3];
                    if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                        if (rowData[6] == TBD_PROCUREMENT_AGENT_ID) {
                            inValid("G", y, i18n.t('static.supplyPlan.procurementAgentCannotBeTBD'), elInstance);
                            valid = false;
                            elInstance.setValueFromCoords(30, y, 1, true);
                        } else {
                            positiveValidation("G", y, elInstance);
                        }
                    }
                }

                var validation = checkValidtion("text", "M", y, rowData[12], elInstance);
                if (validation == true) {
                    var shipmentStatus = rowData[3];
                    if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                        if (rowData[12] == TBD_FUNDING_SOURCE) {
                            inValid("M", y, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'), elInstance);
                            valid = false;
                            elInstance.setValueFromCoords(30, y, 1, true);
                        } else {
                            positiveValidation("M", y, elInstance);
                        }
                    }
                } else {
                    valid = false;
                }

                var validation = checkValidtion("date", "E", y, rowData[4], elInstance);
                if (validation == false) {
                    valid = false;
                } else {
                    if (rowData[3] == DELIVERED_SHIPMENT_STATUS) {
                        var curDate = moment(Date.now()).format("YYYY-MM-DD");
                        var selectedDate = moment(rowData[4]).format("YYYY-MM-DD");
                        if (selectedDate > curDate) {
                            inValid("E", y, i18n.t('static.supplyPlan.dateustBeLessThanCurDate'), elInstance);
                            valid = false;
                        } else {
                            positiveValidation("E", y, elInstance);
                        }
                    } else {
                        positiveValidation("E", y, elInstance);
                    }
                }

                var validation = checkValidtion("text", "S", y, rowData[18], elInstance);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(30, y, 1, true);
                }

                if (rowData[19].length > 600) {
                    inValid("T", y, i18n.t('static.dataentry.notesMaxLength'), elInstance);
                    valid = false;
                } else {
                    positiveValidation("T", y, elInstance);
                }

                var validation = checkValidtion("text", "F", y, rowData[5], elInstance);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(30, y, 1, true);
                }

                var value = rowData[3];
                if (value == SUBMITTED_SHIPMENT_STATUS || value == ARRIVED_SHIPMENT_STATUS || value == SHIPPED_SHIPMENT_STATUS || value == DELIVERED_SHIPMENT_STATUS || value == APPROVED_SHIPMENT_STATUS) {
                    var budget = rowData[13];
                    console.log("D------------->Value1", budget)
                    var validation = checkValidtion("text", "N", y, budget, elInstance);
                    if (validation == false) {
                        valid = false;
                        elInstance.setValueFromCoords(30, y, 1, true);
                    }
                }

                var validation = checkValidtion("number", "K", y, elInstance.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll("\,", ""), elInstance, JEXCEL_INTEGER_REGEX, 1, 0);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(30, y, 1, true);
                }

                var validation = checkValidtion("text", "O", y, rowData[14], elInstance);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(30, y, 1, true);
                }

                var validation = checkValidtion("number", "P", y, elInstance.getValue(`P${parseInt(y) + 1}`, true).toString().replaceAll("\,", ""), elInstance, JEXCEL_DECIMAL_NO_REGEX, 1, 1);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(30, y, 1, true);
                }

                var validation = checkValidtion("number", "R", y, elInstance.getValue(`R${parseInt(y) + 1}`, true).toString().replaceAll("\,", ""), elInstance, JEXCEL_DECIMAL_NO_REGEX, 1, 1);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(30, y, 1, true);
                }

                var shipmentStatus = elInstance.getRowData(y)[3];
                if (shipmentStatus != CANCELLED_SHIPMENT_STATUS && shipmentStatus != ON_HOLD_SHIPMENT_STATUS) {
                    if (shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                        var totalShipmentQty = (rowData[25]);
                        var adjustedOrderQty = elInstance.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll("\,", "");
                        adjustedOrderQty = adjustedOrderQty.toString().replaceAll("\,", "");
                        var col = ("K").concat(parseInt(y) + 1);

                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.supplyPlan.batchNumberMissing'));
                        inValid("K", y, i18n.t('static.supplyPlan.batchNumberMissing'), elInstance);
                        console.log("TotalShipment Qty", totalShipmentQty, "Adjusted order qty", adjustedOrderQty);
                        if (totalShipmentQty != 0 && totalShipmentQty > adjustedOrderQty) {
                            valid = false;
                            elInstance.setValueFromCoords(30, y, 1, true);
                            this.props.updateState("shipmentBatchError", i18n.t('static.supplyPlan.batchNumberMissing'));
                            this.props.hideSecondComponent();
                        } else {
                            positiveValidation("K", y, elInstance);
                        }
                    }
                }
            }
        }
        console.log("Negative budget", negativeBudget, "Valid", valid);
        if (negativeBudget > 0) {
            var cf = window.confirm(i18n.t("static.shipmentDetails.warningBudget"));
            if (cf == true) {
                return valid;
            } else {

            }
        } else if (negativeBudget == 0) {
            return valid;
        }
    }

    saveShipments() {
        // this.showOnlyErrors();
        this.props.updateState("loading", true);
        var validation = this.checkValidationForShipments();
        console.log("Validation", validation);
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            this.props.updateState("shipmentError", "");
            this.props.updateState("shipmentBatchError", "");
            this.props.updateState("noFundsBudgetError", "");
            var elInstance = this.state.shipmentsEl;
            var json = elInstance.getJson(null, false);
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                this.props.updateState("color", "red");
                this.props.hideFirstComponent();
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
                    this.props.updateState("color", "red");
                    this.props.hideFirstComponent();
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var shipmentDataList = (programJson.shipmentList);
                    var batchInfoList = (programJson.batchInfoList);
                    var minDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
                    var curDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss')));
                    var curUser = AuthenticationService.getLoggedInUserId();
                    var username = AuthenticationService.getLoggedInUsername();
                    for (var j = 0; j < json.length; j++) {
                        var map = new Map(Object.entries(json[j]));
                        if (map.get("28") == 1) {
                            console.log("In if");
                            if (moment(map.get("4")).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                minDate = moment(map.get("4")).format("YYYY-MM-DD");
                            }
                        }
                        console.log("minDate", minDate);
                        var selectedShipmentStatus = map.get("3");
                        var shipmentStatusId = selectedShipmentStatus;
                        var shipmentQty = elInstance.getValue(`K${parseInt(j) + 1}`, true).toString().replaceAll("\,", "");
                        var productCost = elInstance.getValue(`Q${parseInt(j) + 1}`, true).toString().replaceAll("\,", "");
                        var rate = elInstance.getValue(`P${parseInt(j) + 1}`, true).toString().replaceAll("\,", "");
                        var freightCost = elInstance.getValue(`R${parseInt(j) + 1}`, true).toString().replaceAll("\,", "");
                        var shipmentMode = "Sea";
                        if (map.get("5") == 2) {
                            shipmentMode = "Air";
                        }
                        var shipmentDatesJson = map.get("26");
                        var plannedDate = shipmentDatesJson.plannedDate != "" && shipmentDatesJson.plannedDate != "Invalid date" ? shipmentDatesJson.plannedDate : null;
                        var submittedDate = shipmentDatesJson.submittedDate != "" && shipmentDatesJson.submittedDate != "Invalid date" ? shipmentDatesJson.submittedDate : null;
                        var approvedDate = shipmentDatesJson.approvedDate != "" && shipmentDatesJson.approvedDate != "Invalid date" ? shipmentDatesJson.approvedDate : null;
                        var shippedDate = shipmentDatesJson.shippedDate != "" && shipmentDatesJson.shippedDate != "Invalid date" ? shipmentDatesJson.shippedDate : null;
                        var arrivedDate = shipmentDatesJson.arrivedDate != "" && shipmentDatesJson.arrivedDate != "Invalid date" ? shipmentDatesJson.arrivedDate : null;
                        var receivedDate = shipmentDatesJson.receivedDate != "" && shipmentDatesJson.receivedDate != "Invalid date" ? shipmentDatesJson.receivedDate : null;
                        var expectedDeliveryDate = shipmentDatesJson.expectedDeliveryDate != "" && shipmentDatesJson.expectedDeliveryDate != "Invalid date" ? shipmentDatesJson.expectedDeliveryDate : null;
                        if (shipmentStatusId != DELIVERED_SHIPMENT_STATUS) {
                            receivedDate = null;
                        }
                        if (shipmentStatusId != ARRIVED_SHIPMENT_STATUS || shipmentStatusId != DELIVERED_SHIPMENT_STATUS) {
                            arrivedDate = null;
                        }
                        if (shipmentStatusId != SHIPPED_SHIPMENT_STATUS || shipmentStatusId != ARRIVED_SHIPMENT_STATUS || shipmentStatusId != DELIVERED_SHIPMENT_STATUS) {
                            shippedDate = null;
                        }
                        if (shipmentStatusId != APPROVED_SHIPMENT_STATUS || shipmentStatusId != SHIPPED_SHIPMENT_STATUS || shipmentStatusId != ARRIVED_SHIPMENT_STATUS || shipmentStatusId != DELIVERED_SHIPMENT_STATUS) {
                            approvedDate = null;
                        }
                        if (shipmentStatusId != SUBMITTED_SHIPMENT_STATUS || shipmentStatusId != APPROVED_SHIPMENT_STATUS || shipmentStatusId != SHIPPED_SHIPMENT_STATUS || shipmentStatusId != ARRIVED_SHIPMENT_STATUS || shipmentStatusId != DELIVERED_SHIPMENT_STATUS) {
                            submittedDate = null;
                        }
                        console.log("shipmentDatesJson", shipmentDatesJson);
                        console.log("Received date", receivedDate);
                        console.log("Shipment Received date", shipmentDatesJson.receivedDate);

                        var expiryDate = moment(receivedDate != "" && receivedDate != null && receivedDate != "Invalid date" ? receivedDate : expectedDeliveryDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                        console.log("expected received dare", expectedDeliveryDate);
                        console.log("Shipment dates", shipmentDatesJson);
                        if (map.get("23") != -1) {
                            console.log("shipmentDataList[parseInt(map.get", shipmentDataList[parseInt(map.get("23"))]);
                            shipmentDataList[parseInt(map.get("23"))].plannedDate = plannedDate;
                            shipmentDataList[parseInt(map.get("23"))].submittedDate = submittedDate;
                            shipmentDataList[parseInt(map.get("23"))].approvedDate = approvedDate;
                            shipmentDataList[parseInt(map.get("23"))].shippedDate = shippedDate;
                            shipmentDataList[parseInt(map.get("23"))].arrivedDate = arrivedDate;
                            shipmentDataList[parseInt(map.get("23"))].receivedDate = receivedDate;
                            shipmentDataList[parseInt(map.get("23"))].expectedDeliveryDate = moment(shipmentDatesJson.expectedDeliveryDate).format("YYYY-MM-DD");

                            shipmentDataList[parseInt(map.get("23"))].shipmentStatus.id = shipmentStatusId;
                            shipmentDataList[parseInt(map.get("23"))].shipmentStatus.label = (this.state.shipmentStatusList).filter(c => c.id == shipmentStatusId)[0].label;
                            shipmentDataList[parseInt(map.get("23"))].dataSource.id = map.get("18");
                            shipmentDataList[parseInt(map.get("23"))].dataSource.label = (this.state.dataSourceList).filter(c => c.id == map.get("18"))[0].label;
                            shipmentDataList[parseInt(map.get("23"))].procurementAgent.id = map.get("6");

                            var pa = this.state.procurementAgentList.filter(c => c.id == map.get("6"))[0];
                            shipmentDataList[parseInt(map.get("23"))].procurementAgent.code = pa.name;
                            shipmentDataList[parseInt(map.get("23"))].procurementAgent.label = pa.label;

                            var fs = this.state.fundingSourceList.filter(c => c.id == map.get("12"))[0];
                            shipmentDataList[parseInt(map.get("23"))].fundingSource.id = map.get("12");
                            shipmentDataList[parseInt(map.get("23"))].fundingSource.code = fs.name;
                            shipmentDataList[parseInt(map.get("23"))].fundingSource.label = fs.label;

                            var b = this.state.budgetList.filter(c => c.id == map.get("13"))[0];
                            shipmentDataList[parseInt(map.get("23"))].budget.id = map.get("13");
                            shipmentDataList[parseInt(map.get("23"))].budget.code = b.name;
                            shipmentDataList[parseInt(map.get("23"))].budget.label = b.label;

                            shipmentDataList[parseInt(map.get("23"))].shipmentQty = shipmentQty.toString().replaceAll("\,", "");
                            shipmentDataList[parseInt(map.get("23"))].rate = rate.toString().replaceAll("\,", "");
                            shipmentDataList[parseInt(map.get("23"))].shipmentMode = shipmentMode;
                            shipmentDataList[parseInt(map.get("23"))].productCost = productCost.toString().replaceAll("\,", "");
                            shipmentDataList[parseInt(map.get("23"))].freightCost = parseFloat(freightCost.toString().replaceAll("\,", "")).toFixed(2);
                            shipmentDataList[parseInt(map.get("23"))].notes = map.get("19");
                            shipmentDataList[parseInt(map.get("23"))].accountFlag = map.get("0");
                            shipmentDataList[parseInt(map.get("23"))].localProcurement = map.get("7");
                            shipmentDataList[parseInt(map.get("23"))].active = map.get("29");

                            shipmentDataList[parseInt(map.get("23"))].orderNo = map.get("8");

                            shipmentDataList[parseInt(map.get("23"))].emergencyOrder = map.get("11");
                            var c = (this.state.currencyListAll.filter(c => c.currencyId == map.get("14"))[0])
                            shipmentDataList[parseInt(map.get("23"))].currency = c;
                            if (map.get("28") == 1) {
                                if (shipmentDataList[parseInt(map.get("23"))].lastModifiedBy != null) {
                                    shipmentDataList[parseInt(map.get("23"))].lastModifiedBy.userId = curUser;
                                    shipmentDataList[parseInt(map.get("23"))].lastModifiedBy.username = username;
                                } else {
                                    shipmentDataList[parseInt(map.get("23"))].lastModifiedBy = { userId: curUser, username: username };
                                }
                                shipmentDataList[parseInt(map.get("23"))].lastModifiedDate = curDate;
                            }

                            if (map.get("24") != "" && map.get("24").length != 0) {
                                var totalShipmentQty = (map.get("25"));
                                var adjustedOrderQty = elInstance.getValue(`K${parseInt(j) + 1}`, true).toString().replaceAll("\,", "");
                                var eBatchInfoList = map.get("24")
                                for (var a = 0; a < eBatchInfoList.length; a++) {
                                    console.log("batchInfoList 1", eBatchInfoList[a])
                                }
                                console.log("Adjutsed order QTy", adjustedOrderQty);
                                console.log("TotalSHipment qty", totalShipmentQty);
                                var remainingBatchQty = parseInt(adjustedOrderQty) - parseInt(totalShipmentQty);
                                console.log("Remaining qty", remainingBatchQty);
                                if (totalShipmentQty < adjustedOrderQty) {
                                    var indexBatchNo = eBatchInfoList.findIndex(c => c.batch.autoGenerated.toString() == "true");
                                    if (indexBatchNo != -1) {
                                        eBatchInfoList[indexBatchNo].shipmentQty = parseInt(eBatchInfoList[indexBatchNo].shipmentQty) + parseInt(remainingBatchQty);
                                    } else {
                                        console.log("In if")
                                        var programId = (document.getElementById("programId").value).split("_")[0];
                                        var planningUnitId = map.get("2");
                                        programId = paddingZero(programId, 0, 6);
                                        planningUnitId = paddingZero(planningUnitId, 0, 8);
                                        var batchNo = (BATCH_PREFIX).concat(programId).concat(planningUnitId).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                                        console.log("BatchNo", batchNo)
                                        var json1 = {
                                            shipmentTransBatchInfoId: 0,
                                            batch: {
                                                batchNo: batchNo,
                                                expiryDate: expiryDate,
                                                batchId: 0,
                                                autoGenerated: true
                                            },
                                            shipmentQty: remainingBatchQty,
                                        }
                                        eBatchInfoList.push(json1);
                                    }
                                    console.log("Json1 ", json1);
                                }
                                shipmentDataList[parseInt(map.get("23"))].batchInfoList = eBatchInfoList;
                                map.set("24", eBatchInfoList);
                                for (var a = 0; a < eBatchInfoList.length; a++) {
                                    console.log("eBatchInfoList 2", eBatchInfoList[a])
                                }
                            }


                            // if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                            var shipmentBatchInfoList = map.get("24");
                            console.log("Shipment Batcg info list", shipmentBatchInfoList);
                            var expectedDeliveryDate = moment(map.get("4")).format("YYYY-MM-DD");
                            var createdDate = expectedDeliveryDate;
                            // if (shipmentDatesJson.receivedDate != "" && shipmentDatesJson.receivedDate != null && shipmentDatesJson.receivedDate != undefined && shipmentDatesJson.receivedDate != "Invalid date") {
                            //     createdDate = moment(shipmentDatesJson.receivedDate).format("YYYY-MM-DD");
                            // }
                            if (shipmentBatchInfoList == "" && shipmentBatchInfoList.length == 0) {
                                // If user is not entering anything system will create its own batch
                                console.log("In if")
                                var programId = (document.getElementById("programId").value).split("_")[0];
                                var planningUnitId = map.get("2");
                                var batchNo = (BATCH_PREFIX).concat(paddingZero(programId, 0, 6)).concat(paddingZero(planningUnitId, 0, 8)).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                                // if (shipmentDatesJson.receivedDate != "" && shipmentDatesJson.receivedDate != null && shipmentDatesJson.receivedDate != undefined && shipmentDatesJson.receivedDate != "Invalid date") {
                                //     expiryDate = moment(shipmentDatesJson.receivedDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                                // }
                                var batchInfoJson = {
                                    shipmentTransBatchInfoId: 0,
                                    batch: {
                                        batchNo: batchNo,
                                        expiryDate: expiryDate,
                                        batchId: 0,
                                        autoGenerated: true,
                                        createdDate: createdDate
                                    },
                                    shipmentQty: shipmentQty.toString().replaceAll("\,", "")
                                }
                                var batchArr = [];
                                batchArr.push(batchInfoJson);
                                shipmentDataList[parseInt(map.get("23"))].batchInfoList = batchArr;

                                // Enter details in batch info list
                                var batchDetails = {
                                    batchId: 0,
                                    batchNo: batchNo,
                                    planningUnitId: parseInt(map.get("2")),
                                    expiryDate: expiryDate,
                                    createdDate: createdDate,
                                    autoGenerated: true
                                }
                                batchInfoList.push(batchDetails);
                            }
                            for (var bi = 0; bi < shipmentBatchInfoList.length; bi++) {
                                console.log("shipmentBatchInfoList[bi]", shipmentBatchInfoList[bi]);
                                // Push shipment batch details in program json batch info list
                                var index = batchInfoList.findIndex(c => c.batchNo == shipmentBatchInfoList[bi].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(shipmentBatchInfoList[bi].batch.expiryDate).format("YYYY-MM") && c.planningUnitId == document.getElementById("planningUnitId").value);
                                console.log("Batch info list 1st", batchInfoList);
                                console.log("Index1", index);
                                if (index == -1) {
                                    var batchDetails = {
                                        batchId: shipmentBatchInfoList[bi].batch.batchId,
                                        batchNo: shipmentBatchInfoList[bi].batch.batchNo,
                                        planningUnitId: parseInt(map.get("2")),
                                        expiryDate: shipmentBatchInfoList[bi].batch.expiryDate,
                                        createdDate: createdDate,
                                        autoGenerated: shipmentBatchInfoList[bi].batch.autoGenerated
                                    }
                                    batchInfoList.push(batchDetails);
                                } else {
                                    batchInfoList[index].expiryDate = shipmentBatchInfoList[bi].batch.expiryDate;
                                    batchInfoList[index].createdDate = createdDate;
                                    batchInfoList[index].autoGenerated = shipmentBatchInfoList[bi].batch.autoGenerated;
                                }
                            }
                            console.log("Batch info list", batchInfoList);
                            programJson.batchInfoList = batchInfoList;
                            // }
                        } else {
                            console.log("In else---------->", expectedDeliveryDate);
                            console.log("In else---------->", receivedDate);
                            var pa = this.state.procurementAgentList.filter(c => c.id == map.get("6"))[0];
                            var b = this.state.budgetList.filter(c => c.id == map.get("13"))[0];
                            var c = (this.state.currencyListAll.filter(c => c.currencyId == map.get("14"))[0]);
                            var fs = this.state.fundingSourceList.filter(c => c.id == map.get("12"))[0];
                            var shipmentJson = {
                                accountFlag: map.get("0"),
                                active: map.get("29"),
                                dataSource: {
                                    id: map.get("18"),
                                    label: (this.state.dataSourceList).filter(c => c.id == map.get("18"))[0].label
                                },
                                erpFlag: false,
                                localProcurement: map.get("7"),
                                freightCost: parseFloat(freightCost.toString().replaceAll("\,", "")).toFixed(2),
                                notes: map.get("19"),
                                planningUnit: {
                                    id: map.get("2"),
                                    label: (this.props.items.planningUnitListAll.filter(c => c.planningUnit.id == map.get("2"))[0]).planningUnit.label
                                },

                                procurementAgent: {
                                    id: map.get("6"),
                                    code: pa.name,
                                    label: pa.label
                                },
                                productCost: productCost.toString().replaceAll("\,", ""),
                                shipmentQty: shipmentQty.toString().replaceAll("\,", ""),
                                rate: rate.toString().replaceAll("\,", ""),
                                shipmentId: 0,
                                shipmentMode: shipmentMode,
                                shipmentStatus: {
                                    id: map.get("3"),
                                    label: (this.state.shipmentStatusList).filter(c => c.id == map.get("3"))[0].label
                                },
                                suggestedQty: map.get("27"),
                                budget: {
                                    id: map.get("13"),
                                    code: b.name,
                                    label: b.label,
                                },
                                emergencyOrder: map.get("11"),
                                currency: c,
                                fundingSource: {
                                    id: map.get("12"),
                                    code: fs.name,
                                    label: fs.label
                                },
                                plannedDate: plannedDate,
                                submittedDate: submittedDate,
                                approvedDate: approvedDate,
                                shippedDate: shippedDate,
                                arrivedDate: arrivedDate,
                                expectedDeliveryDate: expectedDeliveryDate,
                                receivedDate: receivedDate,
                                index: shipmentDataList.length,
                                batchInfoList: [],
                                orderNo: map.get("8"),
                                createdBy: {
                                    userId: curUser,
                                    username: username
                                },
                                createdDate: curDate,
                                lastModifiedBy: {
                                    userId: curUser,
                                    username: username
                                },
                                lastModifiedDate: curDate
                            }
                            console.log("Shipment json", shipmentJson);
                            if (map.get("24") != "" && map.get("24").length != 0) {
                                var totalShipmentQty = (map.get("25"));
                                var adjustedOrderQty = elInstance.getValue(`K${parseInt(j) + 1}`, true).toString().replaceAll("\,", "");
                                var eBatchInfoList = map.get("24")
                                var remainingBatchQty = parseInt(adjustedOrderQty) - parseInt(totalShipmentQty);
                                if (totalShipmentQty < adjustedOrderQty) {
                                    var indexBatchNo = eBatchInfoList.findIndex(c => c.batch.autoGenerated.toString() == "true");
                                    if (indexBatchNo != -1) {
                                        eBatchInfoList[indexBatchNo].shipmentQty = eBatchInfoList[indexBatchNo].shipmentQty + remainingBatchQty;
                                    } else {
                                        console.log("In if")
                                        var programId = (document.getElementById("programId").value).split("_")[0];
                                        var planningUnitId = map.get("2");
                                        programId = paddingZero(programId, 0, 6);
                                        planningUnitId = paddingZero(planningUnitId, 0, 8);
                                        var batchNo = (BATCH_PREFIX).concat(programId).concat(planningUnitId).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                                        console.log("BatchNo", batchNo)
                                        var json1 = {
                                            shipmentTransBatchInfoId: 0,
                                            batch: {
                                                batchNo: batchNo,
                                                expiryDate: expiryDate,
                                                batchId: 0,
                                                autoGenerated: true
                                            },
                                            shipmentQty: remainingBatchQty,
                                        }
                                        eBatchInfoList.push(json1);
                                    }
                                    console.log("Json1 ", json1);
                                }
                                map.set("24", eBatchInfoList);
                                shipmentJson.batchInfoList = map.get("24");
                            }

                            // if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                            var shipmentBatchInfoList = map.get("24");
                            console.log("Shipment byach info list", shipmentBatchInfoList);
                            var expectedDeliveryDate = moment(map.get("4")).format("YYYY-MM-DD");
                            var createdDate = expectedDeliveryDate;
                            // if (shipmentDatesJson.receivedDate != "" && shipmentDatesJson.receivedDate != null && shipmentDatesJson.receivedDate != undefined && shipmentDatesJson.receivedDate != "Invalid date") {
                            //     createdDate = moment(shipmentDatesJson.receivedDate).format("YYYY-MM-DD");
                            // }
                            if (shipmentBatchInfoList == "" && shipmentBatchInfoList.length == 0) {
                                var programId = (document.getElementById("programId").value).split("_")[0];
                                var planningUnitId = map.get("2");
                                var batchNo = (BATCH_PREFIX).concat(paddingZero(programId, 0, 6)).concat(paddingZero(planningUnitId, 0, 8)).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                                var expiryDate = moment(receivedDate != "" && receivedDate != null && receivedDate != "Invalid date" ? receivedDate : expectedDeliveryDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                                // if (shipmentDatesJson.receivedDate != "" && shipmentDatesJson.receivedDate != null && shipmentDatesJson.receivedDate != undefined && shipmentDatesJson.receivedDate != "Invalid date") {
                                //     expiryDate = moment(shipmentDatesJson.receivedDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                                // }
                                var batchInfoJson = {
                                    shipmentTransBatchInfoId: 0,
                                    batch: {
                                        batchNo: batchNo,
                                        expiryDate: expiryDate,
                                        batchId: 0,
                                        autoGenerated: true,
                                        createdDate: createdDate
                                    },
                                    shipmentQty: shipmentQty.toString().replaceAll("\,", "")
                                }
                                var batchArr = [];
                                batchArr.push(batchInfoJson);
                                shipmentJson.batchInfoList = batchArr;


                                var batchDetails = {
                                    batchId: 0,
                                    batchNo: batchNo,
                                    planningUnitId: map.get("2"),
                                    expiryDate: expiryDate,
                                    createdDate: createdDate,
                                    autoGenerated: true
                                }
                                batchInfoList.push(batchDetails);
                            }
                            console.log("shipmentBatchInfoList.length", shipmentBatchInfoList.length);
                            for (var bi = 0; bi < shipmentBatchInfoList.length; bi++) {
                                var index = batchInfoList.findIndex(c => c.batchNo == shipmentBatchInfoList[bi].batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(shipmentBatchInfoList[bi].batch.expiryDate).format("YYYY-MM") && c.planningUnitId == document.getElementById("planningUnitId").value);
                                console.log("BatchInfoList", batchInfoList);
                                console.log("Index", index);
                                if (index == -1) {
                                    var batchDetails = {
                                        batchId: shipmentBatchInfoList[bi].batch.batchId,
                                        batchNo: shipmentBatchInfoList[bi].batch.batchNo,
                                        planningUnitId: map.get("2"),
                                        expiryDate: shipmentBatchInfoList[bi].batch.expiryDate,
                                        createdDate: createdDate,
                                        autoGenerated: shipmentBatchInfoList[bi].batch.autoGenerated
                                    }
                                    batchInfoList.push(batchDetails);
                                } else {
                                    batchInfoList[index].expiryDate = shipmentBatchInfoList[bi].batch.expiryDate;
                                    batchInfoList[index].createdDate = createdDate;
                                    batchInfoList[index].autoGenerated = shipmentBatchInfoList[bi].batch.autoGenerated;
                                }
                            }
                            console.log("Batch info list", batchInfoList);
                            programJson.batchInfoList = batchInfoList;
                            // }
                            shipmentDataList.push(shipmentJson);
                        }
                    }

                    programJson.shipmentList = shipmentDataList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                        this.props.updateState("color", "red");
                        this.props.hideFirstComponent();
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        var programId = (document.getElementById("programId").value)
                        var planningUnitId = (document.getElementById("planningUnitId").value)
                        var objectStore = "";
                        if (this.props.consumptionPage == "whatIf") {
                            objectStore = 'whatIfProgramData';
                        } else {
                            objectStore = 'programData';
                        }
                        calculateSupplyPlan(programId, planningUnitId, objectStore, "shipment", this.props, [], moment(minDate).startOf('month').format("YYYY-MM-DD"));
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else if (validation == false) {
            this.props.updateState("shipmentError", i18n.t('static.supplyPlan.validationFailed'));
            this.props.updateState("loading", false);
            this.props.hideSecondComponent()
        } else {
            this.props.updateState("loading", false);
            this.props.hideSecondComponent()
        }
    }

    render() { return (<div></div>) }

    shipmentEditStart = function (instance, cell, x, y, value) {
        console.log("In edit start");
        var papuResult = this.state.procurementAgentPlanningUnitListAll;
        var elInstance = this.state.shipmentsEl;
        var rowData = elInstance.getRowData(y);
        var planningUnitId = rowData[2];
        var procurementAgentPlanningUnit = papuResult.filter(p => p.procurementAgent.id == rowData[6] && p.planningUnit.id == planningUnitId);
        if (x == 10 && (procurementAgentPlanningUnit.length > 0 && ((procurementAgentPlanningUnit[0].unitsPerPalletEuro1 != 0 && procurementAgentPlanningUnit[0].unitsPerPalletEuro1 != null) || (procurementAgentPlanningUnit[0].moq != 0 && procurementAgentPlanningUnit[0].moq != null) || (procurementAgentPlanningUnit[0].unitsPerPalletEuro2 != 0 && procurementAgentPlanningUnit[0].unitsPerPalletEuro2 != null) || (procurementAgentPlanningUnit[0].unitsPerContainer != 0 && procurementAgentPlanningUnit[0].unitsPerContainer != null)))) {
            this.props.updateState("loading", true);
            if (this.props.shipmentPage == "shipmentDataEntry") {
                this.props.updateState("shipmentModalTitle", i18n.t("static.supplyPlan.qtyCalculator"));
                this.props.toggleLarge();
            }
            if (document.getElementById("showSaveQtyButtonDiv") != null) {
                document.getElementById("showSaveQtyButtonDiv").style.display = 'block';
            }
            this.el = jexcel(document.getElementById("qtyCalculatorTable"), '');
            this.el.destroy();
            var json = [];
            var moq = 0;
            var unitsPerPalletEuro1 = 0;
            var unitsPerPalletEuro2 = 0;
            var unitsPerContainer = 0;
            if (procurementAgentPlanningUnit.length > 0) {
                moq = procurementAgentPlanningUnit[0].moq;
                unitsPerPalletEuro1 = procurementAgentPlanningUnit[0].unitsPerPalletEuro1;
                unitsPerPalletEuro2 = procurementAgentPlanningUnit[0].unitsPerPalletEuro2;
                unitsPerContainer = procurementAgentPlanningUnit[0].unitsPerContainer;
            }
            var roundingOptionType = "hidden";
            if ((unitsPerPalletEuro1 != 0 && unitsPerPalletEuro1 != null) || (moq != 0 && moq != null) || (unitsPerPalletEuro2 != 0 && unitsPerPalletEuro2 != null) || (unitsPerContainer != 0 && unitsPerContainer != null)) {
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
            if (this.props.shipmentPage == "supplyPlanCompare") {
                tableEditable = false;
            }
            if (this.props.shipmentPage == "shipmentDataEntry" && (this.props.items.shipmentType).value == 2) {
                tableEditable = false;
            }

            if (rowData[21].toString() == "true" || this.props.shipmentPage == "supplyPlanCompare") {
                tableEditable = false;
            }
            var adjustedOrderQty = [];
            if (rowData[27] != "" || rowData[27] > 0) {
                adjustedOrderQty.push({ id: 1, name: i18n.t('static.supplyPlan.suggestedOrderQty') })
            }
            adjustedOrderQty.push({ id: 2, name: i18n.t('static.supplyPlan.manualOrderQty') })
            var data = [];
            data[0] = 2;//A
            data[1] = rowData[27];//B
            data[2] = elInstance.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll("\,", "") != "" ? elInstance.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll("\,", "") : 0;//C
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
                    { title: i18n.t('static.supplyPlan.adjustesOrderQty'), type: 'dropdown', source: adjustedOrderQty, width: 120 },
                    { title: i18n.t('static.supplyPlan.suggestedOrderQty'), type: 'numeric', textEditor: true, mask: '#,##.00', decimal: '.', width: 120, readOnly: true },
                    { title: i18n.t('static.supplyPlan.manualOrderQty'), type: 'numeric', textEditor: true, mask: '#,##.00', decimal: '.', width: 120 },
                    { type: roundingOptionType, title: i18n.t('static.supplyPlan.orderBasedOn'), source: orderBasedOn, width: 120 },
                    { type: roundingOptionType, title: i18n.t('static.supplyPlan.roundingOption'), source: [{ id: 1, name: i18n.t('static.supplyPlan.roundDown') }, { id: 2, name: i18n.t('static.supplyPlan.roundUp') }], width: 120 },
                    { title: i18n.t('static.supplyPlan.finalOrderQty'), type: 'numeric', textEditor: true, readOnly: true, mask: '#,##.00', decimal: '.', width: 120 },
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
                license: JEXCEL_PRO_KEY,
                contextMenu: function (obj, x, y, e) {
                    var items = [];
                    return items;
                },
                onchange: this.shipmentQtyChanged,
                text: {
                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
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
            if (unitsPerPalletEuro1 != 0 && unitsPerPalletEuro1 != null || unitsPerPalletEuro2 != 0 && unitsPerPalletEuro2 != null || moq != 0 && moq != null || unitsPerContainer != 0 && unitsPerContainer != null) {
                var data1 = [];
                var json1 = []
                data1[0] = moq;//A
                data1[1] = unitsPerPalletEuro1;//B
                data1[2] = unitsPerPalletEuro2;//C
                data1[3] = unitsPerContainer;//D
                data1[4] = `=ROUND((K1/B1),2)`;//E
                data1[5] = `=ROUND((K1/C1),2)`;//F
                data1[6] = `=ROUND((K1/D1),2)`;//G
                data1[7] = 2;//H
                data1[8] = rowData[27];//I
                data1[9] = elInstance.getValue(`K${parseInt(y) + 1}`, true).toString().replaceAll("\,", "");//J
                data1[10] = ((elVar.getCell(`F${parseInt(0) + 1}`)).innerHTML).toString().replaceAll("\,", "");//K
                json1.push(data1)
                var options1 = {
                    data: json1,
                    columnDrag: true,
                    columns: [
                        { type: 'numeric', readOnly: true, title: i18n.t('static.procurementAgentPlanningUnit.moq'), mask: '#,##.00', decimal: '.', width: 120 },
                        { type: 'numeric', readOnly: true, title: i18n.t('static.procurementAgentPlanningUnit.unitPerPalletEuro1'), mask: '#,##.00', decimal: '.', width: 120 },
                        { type: 'numeric', readOnly: true, title: i18n.t('static.procurementAgentPlanningUnit.unitPerPalletEuro2'), mask: '#,##.00', decimal: '.', width: 120 },
                        { type: 'numeric', readOnly: true, title: i18n.t('static.procurementUnit.unitsPerContainer'), mask: '#,##.00', decimal: '.', width: 120 },
                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfPalletsEuro1'), mask: '#,##.00', decimal: '.', width: 120 },
                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfPalletsEuro2'), mask: '#,##.00', decimal: '.', width: 120 },
                        { type: 'numeric', readOnly: true, title: i18n.t('static.supplyPlan.noOfContainers'), mask: '#,##.00', decimal: '.', width: 120 },
                        { type: 'hidden' },
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
                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                        show: '',
                        entries: '',
                    },
                    onload: this.loadedQtyCalculator1,
                    license: JEXCEL_PRO_KEY,
                    contextMenu: function (obj, x, y, e) {
                        var items = [];
                        return items;
                    },

                }
                var elVar1 = jexcel(document.getElementById("qtyCalculatorTable1"), options1);
                this.el = elVar1;
                this.setState({ qtyCalculatorTableEl1: elVar1 });
            }
            this.props.updateState("loading", false);
        }
    }
}