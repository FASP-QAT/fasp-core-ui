import React from "react";
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunctionOnlyHideRow, checkValidtion, inValid, positiveValidation, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { SECRET_KEY, SHIPMENT_DATA_SOURCE_TYPE, DELIVERED_SHIPMENT_STATUS, TBD_PROCUREMENT_AGENT_ID, TBD_FUNDING_SOURCE, SUBMITTED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, DECIMAL_NO_REGEX, INTEGER_NO_REGEX, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS, INDEXED_DB_VERSION, INDEXED_DB_NAME, ALPHABET_NUMBER_REGEX, JEXCEL_DATE_FORMAT } from "../../Constants";
import moment from "moment";
import { paddingZero, generateRandomAplhaNumericCode, contrast } from "../../CommonComponent/JavascriptCommonFunctions";
import CryptoJS from 'crypto-js'
import { calculateSupplyPlan } from "./SupplyPlanCalculations";


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
        this.showShipmentData = this.showShipmentData.bind(this);
        this.showOnlyErrors = this.showOnlyErrors.bind(this);
        this.shipmentEditStart = this.shipmentEditStart.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.addBatchRowInJexcel = this.addBatchRowInJexcel.bind(this);
    }

    showOnlyErrors() {
        var checkBoxValue = document.getElementById("showErrors");
        var elInstance = this.state.shipmentsEl;
        var json = elInstance.getJson();
        var showOption = (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
        if (json.length < showOption) {
            showOption = json.length;
        }
        if (checkBoxValue.checked == true) {
            console.log("in ncheck box true");
            for (var j = 0; j < parseInt(showOption); j++) {
                var rowData = elInstance.getRowData(j);
                console.log("in for loop", rowData[25]);
                var asterisk = document.getElementsByClassName("jexcel_content")[0];
                console.log("asterisk", asterisk);
                var tr = (asterisk.childNodes[0]).childNodes[2];
                if (rowData[25].toString() == 1) {
                    tr.childNodes[j].style.display = "";
                } else {
                    tr.childNodes[j].style.display = "none";
                }
            }
        } else {
            for (var j = 0; j < parseInt(showOption); j++) {
                var asterisk = document.getElementsByClassName("jexcel_content")[0];
                console.log("asterisk", asterisk);
                var tr = (asterisk.childNodes[0]).childNodes[2];
                tr.childNodes[j].style.display = "";
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
                        active: shipmentStatusResult[k].active
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
                            active: paResult[k].active
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
                                if (fsResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                                    var fsJson = {
                                        name: fsResult[k].fundingSourceCode,
                                        id: fsResult[k].fundingSourceId,
                                        active: fsResult[k].active
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
                                budgetList.push({ id: 0, name: i18n.t('static.common.select') });
                                for (var k = 0; k < bResult.length; k++) {
                                    if (bResult[k].program.id == programJson.programId) {
                                        var bJson = {
                                            name: bResult[k].budgetCode,
                                            id: bResult[k].budgetId,
                                            active: bResult[k].active
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
                                        programId: bResult[k].program.id
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
                                                    active: dataSourceResult[k].active
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
                                                active: currencyResult[k].active
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
                                            this.el = jexcel(document.getElementById("shipmentsDetailsTable"), '');
                                            this.el.destroy();
                                        }
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
                                            var orderNoAndPrimeLineNo = "";
                                            if (shipmentList[i].orderNo != "" && shipmentList[i].orderNo != null) {
                                                orderNoAndPrimeLineNo = shipmentList[i].orderNo.concat("~").concat(shipmentList[i].primeLineNo);
                                            }

                                            var totalShipmentQty = 0;
                                            var shipmentBatchInfoList = shipmentList[i].batchInfoList;
                                            console.log("Shipment batch info list", shipmentBatchInfoList);
                                            for (var sb = 0; sb < shipmentBatchInfoList.length; sb++) {
                                                totalShipmentQty += Math.round(shipmentBatchInfoList[sb].shipmentQty);
                                            }
                                            console.log("Total shipment qty", totalShipmentQty);
                                            console.log("shipmentList[i].receivedDate", shipmentList[i].receivedDate);
                                            var shipmentDatesJson = {
                                                plannedDate: shipmentList[i].plannedDate,
                                                submittedDate: shipmentList[i].submittedDate,
                                                approvedDate: shipmentList[i].approvedDate,
                                                shippedDate: shipmentList[i].shippedDate,
                                                arrivedDate: shipmentList[i].arrivedDate,
                                                expectedDeliveryDate: shipmentList[i].expectedDeliveryDate,
                                                receivedDate: shipmentList[i].receivedDate
                                            }
                                            console.log("shipmentList[i].expectedDeliveryDate", shipmentList[i].expectedDeliveryDate);

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
                                            data[23] = 0;
                                            data[24] = shipmentList[i].active;
                                            data[25] = 0;
                                            shipmentsArr.push(data);
                                        }
                                        if (shipmentList.length == 0 && this.props.shipmentPage == "shipmentDataEntry" && this.props.items.shipmentType.value == 1) {
                                            var data = [];
                                            data[0] = "";
                                            data[1] = "";
                                            data[2] = "";
                                            data[3] = "";
                                            data[4] = "";
                                            data[5] = "";
                                            data[6] = "";
                                            data[7] = "";
                                            data[8] = 0;
                                            data[9] = "";
                                            data[10] = this.props.items.catalogPrice;
                                            data[11] = `=ROUND(K${parseInt(0) + 1}*I${parseInt(0) + 1},2)`;
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
                                            data[23] = 1;
                                            data[24] = 1;
                                            data[25] = 0;
                                            shipmentsArr[0] = data;
                                        }
                                        var options = {
                                            data: shipmentsArr,
                                            columns: [
                                                { type: 'dropdown', title: i18n.t('static.supplyPlan.shipmentStatus'), source: shipmentStatusList, filter: this.filterShipmentStatus, width: 100 },
                                                { type: 'calendar', title: i18n.t('static.supplyPlan.expectedDeliveryDate'), options: { format: JEXCEL_DATE_FORMAT }, width: 100, readOnly: true },
                                                { type: 'dropdown', title: i18n.t('static.procurementagent.procurementagent'), source: procurementAgentList, filter: this.filterProcurementAgent, width: 120 },
                                                { type: 'dropdown', title: i18n.t('static.subfundingsource.fundingsource'), source: fundingSourceList, filter: this.filterFundingSource, width: 120 },
                                                { type: 'dropdown', title: i18n.t('static.dashboard.budget'), source: budgetList, filter: this.budgetDropdownFilter, width: 120 },
                                                { type: erpType, readOnly: true, title: i18n.t('static.supplyPlan.orderNoAndPrimeLineNo'), width: 150 },
                                                { type: 'dropdown', title: i18n.t('static.datasource.datasource'), source: dataSourceList, filter: this.filterDataSourceList, width: 150 },
                                                { type: 'dropdown', title: i18n.t("static.supplyPlan.shipmentMode"), source: [{ id: 1, name: i18n.t('static.supplyPlan.sea') }, { id: 2, name: i18n.t('static.supplyPlan.air') }], width: 100 },
                                                { type: 'numeric', readOnly: true, title: i18n.t("static.supplyPlan.adjustesOrderQty"), width: 100, mask: '#,##.00', decimal: '.' },
                                                { type: 'dropdown', title: i18n.t('static.dashboard.currency'), source: currencyList, filter: this.filterCurrency, width: 120 },
                                                { type: 'numeric', title: i18n.t('static.supplyPlan.pricePerPlanningUnit'), width: 80, mask: '#,##.00', decimal: '.' },
                                                { type: 'numeric', readOnly: true, title: i18n.t('static.shipment.productcost'), width: 80, mask: '#,##.00', decimal: '.' },
                                                { type: 'numeric', title: i18n.t('static.shipment.freightcost'), width: 80, mask: '#,##.00', decimal: '.' },
                                                { type: 'text', title: i18n.t('static.program.notes'), width: 200 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.erpFlag'), width: 0 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.shipmentStatus'), width: 0 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.index'), width: 0 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 200 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.totalQtyBatchInfo'), width: 0 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.emergencyOrder'), width: 0 },
                                                { type: 'checkbox', title: i18n.t('static.common.accountFlag'), width: 80 },
                                                { type: 'hidden', title: i18n.t('static.supplyPlan.shipmentDatesJson'), width: 0 },
                                                { type: 'hidden' },
                                                { type: 'hidden' },
                                                { title: i18n.t('static.inventory.active'), type: 'hidden', width: 0 },
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
                                            oneditionstart: this.shipmentEditStart,
                                            allowExport: false,
                                            text: {
                                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                                show: '',
                                                entries: '',
                                            },
                                            onload: this.loadedShipments,
                                            updateTable: function (el, cell, x, y, source, value, id) {
                                                var elInstance = el.jexcel;
                                                var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
                                                    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W']
                                                var rowData = elInstance.getRowData(y);
                                                var erpFlag = rowData[14];
                                                if (erpFlag.toString() == true) {
                                                    for (var i = 0; i < colArr.length; i++) {
                                                        var cell = elInstance.getCell(`${colArr[i]}${parseInt(y) + 1}`)
                                                        cell.classList.add('readonly');
                                                    }
                                                } else {
                                                }

                                                var procurementAgentPlanningUnit = papuResult.filter(p => p.procurementAgent.id == rowData[2] && p.planningUnit.id == planningUnitId);
                                                if (rowData[2] == "" || (procurementAgentPlanningUnit.length > 0 && ((procurementAgentPlanningUnit[0].unitsPerPalletEuro1 != 0 && procurementAgentPlanningUnit[0].unitsPerPalletEuro1 != null) || (procurementAgentPlanningUnit[0].moq != 0 && procurementAgentPlanningUnit[0].moq != null) || (procurementAgentPlanningUnit[0].unitsPerPalletEuro2 != 0 && procurementAgentPlanningUnit[0].unitsPerPalletEuro2 != null) || (procurementAgentPlanningUnit[0].unitsPerContainer != 0 && procurementAgentPlanningUnit[0].unitsPerContainer != null)))) {
                                                    var cell = elInstance.getCell(`I${parseInt(y) + 1}`)
                                                    cell.classList.add('readonly');
                                                } else {
                                                    var cell = elInstance.getCell(`I${parseInt(y) + 1}`)
                                                    cell.classList.remove('readonly');
                                                }
                                            }.bind(this),
                                            contextMenu: function (obj, x, y, e) {
                                                var items = [];
                                                items.push({
                                                    title: i18n.t('static.supplyPlan.addNewShipment'),
                                                    onclick: function () {
                                                        this.addRowInJexcel();
                                                    }.bind(this)
                                                });

                                                // Add shipment batch info
                                                var rowData = obj.getRowData(y);
                                                var expectedDeliveryDate = moment(rowData[1]).format("YYYY-MM-DD");
                                                var expiryDate = moment(expectedDeliveryDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                                                if ((rowData[0] == DELIVERED_SHIPMENT_STATUS || rowData[0] == SHIPPED_SHIPMENT_STATUS || rowData[0] == ARRIVED_SHIPMENT_STATUS)) {
                                                    items.push({
                                                        title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                                        onclick: function () {
                                                            this.props.updateState("loading", true);
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
                                                                data[6] = batchInfo[sb].batch.autoGenerated;
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
                                                                            format: JEXCEL_DATE_FORMAT,
                                                                            validRange: [moment(Date.now()).format("YYYY-MM-DD"), null]
                                                                        }
                                                                    },
                                                                    {
                                                                        title: i18n.t('static.supplyPlan.shipmentQty'),
                                                                        type: 'numeric',
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
                                                                updateTable: function (el, cell, x, y, source, value, id) {
                                                                }.bind(this),
                                                                contextMenu: function (obj, x, y, e) {
                                                                    var items = [];
                                                                    if (y == null) {
                                                                    } else {
                                                                        // Insert new row
                                                                        if (obj.options.allowInsertRow == true) {
                                                                            items.push({
                                                                                title: i18n.t('static.supplyPlan.addNewBatchInfo'),
                                                                                onclick: function () {
                                                                                    this.addBatchRowInJexcel()
                                                                                }.bind(this)
                                                                            });
                                                                        }
                                                                        if (obj.options.allowDeleteRow == true && obj.getJson().length > 1) {
                                                                            // region id
                                                                            if (obj.getRowData(y)[5] == -1) {
                                                                                items.push({
                                                                                    title: i18n.t("static.common.deleterow"),
                                                                                    onclick: function () {
                                                                                        obj.deleteRow(parseInt(y));
                                                                                    }
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
                                                console.log("RowData-------->", rowData);
                                                if (rowData[19].toString() == "true" && rowData[14].toString() == "false") {
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
                                                // if (rowData[0].toString() == PLANNED_SHIPMENT_STATUS && rowData[16] != -1) {
                                                //     items.push({
                                                //         title: i18n.t('static.common.deleterow'),
                                                //         onclick: function () {
                                                //             obj.setValueFromCoords(24, y, false, true);
                                                //         }.bind(this)
                                                //     });
                                                // }
                                                if (obj.options.allowDeleteRow == true && obj.getJson().length > 1) {
                                                    // region id
                                                    if (obj.getRowData(y)[16] == -1) {
                                                        items.push({
                                                            title: i18n.t("static.common.deleterow"),
                                                            onclick: function () {
                                                                obj.deleteRow(parseInt(y));
                                                            }
                                                        });
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
        data[8] = 0;
        data[9] = "";
        data[10] = this.props.items.catalogPrice;
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
        data[23] = 1;
        data[24] = 1;
        data[25] = 0;
        obj.insertRow(data);
        console.log("Json.length", json.length);
        obj.setValueFromCoords(14, json.length, false, true);
        obj.setValueFromCoords(16, json.length, -1, true);
        obj.setValueFromCoords(18, json.length, 0, true);
        obj.setValueFromCoords(19, json.length, false, true);
        obj.setValueFromCoords(20, json.length, true, true);
        obj.setValueFromCoords(22, json.length, 0, true);
        obj.setValueFromCoords(23, json.length, 1, true);
        obj.setValueFromCoords(24, json.length, 1, true);
        obj.setValueFromCoords(25, json.length, 0, true);
        if (this.props.shipmentPage == "shipmentDataEntry") {
            var showOption = (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
            console.log("showOption", showOption);
            if (showOption != 5000000) {
                var pageNo = parseInt(parseInt(json.length) / parseInt(showOption));
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
        var expectedDeliveryDate = moment(shipmentRowData[1]).format("YYYY-MM-DD");
        var expiryDate = moment(expectedDeliveryDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
        data[0] = "";
        data[1] = expiryDate;
        data[2] = "";
        data[3] = 0;
        data[4] = rowData[4];
        data[5] = -1;
        data[6] = "false";
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
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[7].classList.add('AsteriskTheadtrTd');
        tr.children[8].classList.add('AsteriskTheadtrTd');
        tr.children[9].classList.add('AsteriskTheadtrTd');
        tr.children[10].classList.add('AsteriskTheadtrTd');
        tr.children[11].classList.add('AsteriskTheadtrTd');
        tr.children[12].classList.add('AsteriskTheadtrTd');
        tr.children[13].classList.add('AsteriskTheadtrTd');
        var shipmentInstance = (instance).jexcel;
        shipmentInstance.orderBy(1, 0);
        var json = shipmentInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X']
        for (var i = 0; i < json.length; i++) {
            var rowData = shipmentInstance.getRowData(i);
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y']
            for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(y) + 1);
                if (rowData[20].toString() == "false") {
                    shipmentInstance.setStyle(col, "background-color", "transparent");
                    shipmentInstance.setStyle(col, "background-color", "#D3D3D3");
                } else {
                    shipmentInstance.setStyle(col, "background-color", "transparent");
                }

                if (rowData[19].toString() == "true") {
                    console.log("In if");
                    shipmentInstance.setStyle(col, "color", "#000");
                    shipmentInstance.setStyle(col, "color", "red");
                } else {
                    console.log("In else")
                    shipmentInstance.setStyle(col, "color", "#000");
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
            mylist = budgetList.filter(b => b.fundingSource.fundingSourceId == value && b.programId == this.state.programIdForBudget);
            mylist.push({ id: 0, name: i18n.t('static.common.select') })
        }
        console.log("My list", mylist);
        return mylist;
    }

    shipmentChanged = function (instance, cell, x, y, value) {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var elInstance = this.state.shipmentsEl;
        var rowData = elInstance.getRowData(y);
        this.props.updateState("shipmentError", "");
        this.props.updateState("noFundsBudgetError", "");
        console.log("X-------->", x, "Y---------->", y);
        if (x == 19 || x == 20) {
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y']
            for (var j = 0; j < colArr.length; j++) {
                var col = (colArr[j]).concat(parseInt(y) + 1);
                if (rowData[20].toString() == "false") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "#D3D3D3");
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                }

                if (rowData[19].toString() == "true") {
                    console.log("In if");
                    elInstance.setStyle(col, "color", "#000");
                    elInstance.setStyle(col, "color", "red");
                } else {
                    console.log("In else")
                    elInstance.setStyle(col, "color", "#000");
                }
            }
        }
        if (x != 23 && x != 21 && x != 25) {
            elInstance.setValueFromCoords(25, y, 0, true);

        }
        if (x != 23 && x != 21) {
            elInstance.setValueFromCoords(23, y, 1, true);
        }
        if (x == 0) {
            var valid = checkValidtion("text", "A", y, value, elInstance);
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
                if (rowData[16] == -1) {
                    this.calculateLeadTimesOnChange(y);
                }

            } else {
                elInstance.setValueFromCoords(25, y, 1, true);
            }
        }

        if (x == 4) {
            var value = rowData[0];
            if (value == SUBMITTED_SHIPMENT_STATUS || value == ARRIVED_SHIPMENT_STATUS || value == SHIPPED_SHIPMENT_STATUS || value == DELIVERED_SHIPMENT_STATUS || value == APPROVED_SHIPMENT_STATUS) {
                var budget = rowData[4];
                var valid = checkValidtion("text", "E", y, budget, elInstance);
                if (valid == false) {
                    elInstance.setValueFromCoords(25, y, 1, true);
                }
            }
        }

        if (x == 2) {
            var valid = checkValidtion("text", "C", y, rowData[2], elInstance);
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
            } else {
                elInstance.setValueFromCoords(25, y, 1, true);
            }
            if (valid == true) {
                var procurementAgentPlanningUnit = this.state.procurementAgentPlanningUnitListAll.filter(c => c.procurementAgent.id == rowData[2] && c.planningUnit.id == planningUnitId);
                // if (procurementAgentPlanningUnit.length > 0 && ((procurementAgentPlanningUnit[0].unitsPerPalletEuro1 != 0 && procurementAgentPlanningUnit[0].unitsPerPalletEuro1 != null) || (procurementAgentPlanningUnit[0].moq != 0 && procurementAgentPlanningUnit[0].moq != null) || (procurementAgentPlanningUnit[0].unitsPerPalletEuro2 != 0 && procurementAgentPlanningUnit[0].unitsPerPalletEuro2 != null) || (procurementAgentPlanningUnit[0].unitsPerContainer != 0 && procurementAgentPlanningUnit[0].unitsPerContainer != null))) {
                //     elInstance.setValueFromCoords(8, y, "", true);
                // }
                console.log("RowData------------------>", rowData)
                var pricePerUnit = rowData[10];
                if (rowData[16] == -1) {
                    console.log("Price per unit", pricePerUnit);
                    if (procurementAgentPlanningUnit.length > 0) {
                        console.log("in length greater than 0")
                        pricePerUnit = parseFloat(procurementAgentPlanningUnit[0].catalogPrice);
                    } else {
                        pricePerUnit = this.props.items.catalogPrice
                    }
                    if (rowData[9] != "") {
                        var conversionRateToUsd = parseFloat((this.state.currencyListAll.filter(c => c.currencyId == rowData[9])[0]).conversionRateToUsd);
                        pricePerUnit = parseFloat(pricePerUnit / conversionRateToUsd).toFixed(2);
                        elInstance.setValueFromCoords(10, y, pricePerUnit, true);
                    }
                }
                if (rowData[16] == -1) {
                    this.calculateLeadTimesOnChange(y);
                }
            } else {
                elInstance.setValueFromCoords(25, y, 1, true);
            }
        }

        if (x == 9) {
            var valid = checkValidtion("text", "J", y, rowData[9], elInstance);
            if (valid == true) {
                if (rowData[16] == -1 && rowData[9] != "") {
                    var procurementAgentPlanningUnit = this.state.procurementAgentPlanningUnitListAll.filter(c => c.procurementAgent.id == rowData[2] && c.planningUnit.id == planningUnitId);
                    var pricePerUnit = rowData[10];
                    // if (pricePerUnit.toString() == "") {
                    console.log("Price per unit", pricePerUnit);
                    if (procurementAgentPlanningUnit.length > 0) {
                        console.log("in length greater than 0")
                        pricePerUnit = parseFloat(procurementAgentPlanningUnit[0].catalogPrice);
                    } else {
                        pricePerUnit = this.props.items.catalogPrice;
                    }
                    var conversionRateToUsd = parseFloat((this.state.currencyListAll.filter(c => c.currencyId == rowData[9])[0]).conversionRateToUsd);
                    pricePerUnit = parseFloat(pricePerUnit / conversionRateToUsd).toFixed(2);
                    elInstance.setValueFromCoords(10, y, pricePerUnit, true);
                }
                // }
            } else {
                elInstance.setValueFromCoords(25, y, 1, true);
            }
        }

        if (x == 3) {
            var valid = checkValidtion("text", "D", y, rowData[3], elInstance);
            elInstance.setValueFromCoords(4, y, "", true);
            if (valid == true) {
                var shipmentStatus = rowData[0];
                if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                    if (rowData[3] == TBD_FUNDING_SOURCE) {
                        inValid("D", y, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'), elInstance);
                    } else {
                        positiveValidation("D", y, elInstance);
                    }
                }
            } else {
                elInstance.setValueFromCoords(25, y, 1, true);
            }
        }

        if (x == 6) {
            var valid = checkValidtion("text", "G", y, rowData[6], elInstance);
            if (valid == false) {
                elInstance.setValueFromCoords(25, y, 1, true);
            }
        }

        if (x == 7) {
            var valid = checkValidtion("text", "H", y, rowData[7], elInstance);
            if (valid == true) {
                var rate = ((elInstance.getCell(`L${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", "");
                if (rowData[16] == -1) {
                    var freightCost = 0;
                    if (rowData[7] == 1) {
                        var seaFreightPercentage = this.props.items.programJson.seaFreightPerc;
                        freightCost = parseFloat(rate) * (parseFloat(parseFloat(seaFreightPercentage) / 100));
                        elInstance.setValueFromCoords(12, y, freightCost.toFixed(2), true);
                    } else {
                        var airFreightPercentage = this.props.items.programJson.airFreightPerc;
                        freightCost = parseFloat(rate) * (parseFloat(parseFloat(airFreightPercentage) / 100));
                        elInstance.setValueFromCoords(12, y, freightCost.toFixed(2), true);
                    }
                }
                if (rowData[16] == -1) {
                    this.calculateLeadTimesOnChange(y);
                }
            } else {
                elInstance.setValueFromCoords(25, y, 1, true);
            }
        }

        if (x == 11) {
            var rate = ((elInstance.getCell(`L${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", "");
            console.log("RowData[12]", rowData[12]);
            if (rowData[16] == -1) {
                console.log("In if");
                var freightCost = 0;
                if (rowData[7] == 1) {
                    var seaFreightPercentage = this.props.items.programJson.seaFreightPerc;
                    freightCost = parseFloat(rate) * (parseFloat(parseFloat(seaFreightPercentage) / 100));
                    elInstance.setValueFromCoords(12, y, freightCost.toFixed(2), true);
                } else {
                    var airFreightPercentage = this.props.items.programJson.airFreightPerc;
                    freightCost = parseFloat(rate) * (parseFloat(parseFloat(airFreightPercentage) / 100));
                    elInstance.setValueFromCoords(12, y, freightCost.toFixed(2), true);
                }
            }
            positiveValidation("L", y, elInstance);
        }

        if (x == 8) {
            var valid = checkValidtion("number", "I", y, rowData[8], elInstance, INTEGER_NO_REGEX, 1, 0);
            if (valid = false) {
                elInstance.setValueFromCoords(25, y, 1, true);
            } else {
                var batchDetails = rowData[17];
                if (batchDetails.length == 1) {
                    if (batchDetails[0].batch.autoGenerated.toString() == "true") {
                        batchDetails[0].shipmentQty = rowData[8];
                        elInstance.setValueFromCoords(17, y, batchDetails, true);
                        elInstance.setValueFromCoords(18, y, rowData[8], true);
                    }
                }
            }
        }

        if (x == 10) {
            var valid = checkValidtion("number", "K", y, rowData[10], elInstance, DECIMAL_NO_REGEX, 1, 1);
            if (valid = false) {
                elInstance.setValueFromCoords(25, y, 1, true);
            }
        }

        if (x == 12) {
            var valid = checkValidtion("number", "M", y, rowData[12], elInstance, DECIMAL_NO_REGEX, 1, 1);
            if (valid = false) {
                elInstance.setValueFromCoords(25, y, 1, true);
            }
        }

        if (x == 18) {
            if (value != 0) {
                var adjustedQty = ((elInstance.getCell(`I${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", "");
                console.log("Adjusted Qty", adjustedQty);
                console.log("Value", value);
                if (value != adjustedQty) {
                    inValid("I", y, i18n.t('static.supplyPlan.batchNumberMissing'), elInstance);
                    this.props.updateState("shipmentBatchError", i18n.t('static.supplyPlan.batchNumberMissing'));
                    this.props.hideSecondComponent()
                } else {
                    positiveValidation("I", y, elInstance);
                    this.props.updateState("shipmentBatchError", "");
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
            checkValidtion("number", "C", y, elInstance.getRowData(0)[2], elInstance, INTEGER_NO_REGEX, 1, 0);
        }

        if (x == 4) {
            if (value == "" && (rowData[3] == 1 || rowData[3] == 3 || rowData[3] == 4)) {
                elInstance.setValueFromCoords(4, 0, 1, true);
            }
        }

        if (x == 5) {
            console.log("In x==5")
            var valid = checkValidtion("number", "F", y, ((elInstance.getCell(`F${parseInt(0) + 1}`)).innerHTML).toString().replaceAll("\,", ""), elInstance, INTEGER_NO_REGEX, 1, 0);
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
        var validation = checkValidtion("number", "F", y, ((elInstance.getCell(`F${parseInt(0) + 1}`)).innerHTML).toString().replaceAll("\,", ""), elInstance, INTEGER_NO_REGEX, 1, 0);
        if (validation == false) {
            valid = false;
        }
        validation = checkValidtion("number", "C", y, elInstance.getRowData(0)[2], elInstance, INTEGER_NO_REGEX, 1, 0);
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
            elInstance.setValueFromCoords(6, y, 0, true);
            if (value != "") {
                if (value.length > 23) {
                    inValid("A", y, i18n.t('static.common.max23digittext'), elInstance);
                } else if (!ALPHABET_NUMBER_REGEX.test(value)) {
                    inValid("A", y, i18n.t('static.message.alphabetnumerallowed'), elInstance);
                } else {
                    positiveValidation("A", y, elInstance);
                }
            } else {
                positiveValidation("A", y, elInstance);
            }
        }

        if (x == 1) {
            checkValidtion("text", "B", y, rowData[1], elInstance);
        }
        if (x == 2) {
            checkValidtion("number", "C", y, rowData[2], elInstance, INTEGER_NO_REGEX, 1, 0);
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
                this.props.hideFifthComponent()
            } else {
                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    positiveValidation(colArr[c], y, elInstance);
                }



                var rowData = elInstance.getRowData(y);
                var value = rowData[0];
                if (value != "") {
                    if (value.length > 23) {
                        inValid("A", y, i18n.t('static.common.max23digittext'), elInstance);
                        valid = false;
                    } else if (!ALPHABET_NUMBER_REGEX.test(value)) {
                        inValid("A", y, i18n.t('static.message.alphabetnumerallowed'), elInstance);
                        valid = false;
                    } else {
                        positiveValidation("A", y, elInstance);
                    }
                } else {
                    positiveValidation("A", y, elInstance);
                }
                var validation = checkValidtion("text", "B", y, rowData[1], elInstance);
                if (validation.toString() == "false") {
                    valid = false;
                }
                var validation = checkValidtion("number", "C", y, rowData[2], elInstance, INTEGER_NO_REGEX, 1, 0);
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
                var autoGenerated = false;
                if (map.get("0") != "") {
                    batchNo = map.get("0");
                } else {
                    var programId = (document.getElementById("programId").value).split("_")[0];
                    var planningUnitId = document.getElementById("planningUnitId").value;
                    programId = paddingZero(programId, 0, 6);
                    planningUnitId = paddingZero(planningUnitId, 0, 8);
                    batchNo = (programId).concat(planningUnitId).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                    autoGenerated = true
                }
                var batchInfoList = this.state.batchInfoListAll.filter(c => c.batchNo == map.get("0"));
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
        var shipmentMode = rowData[7];
        var procurementAgent = rowData[2];
        var shipmentDatesJson = rowData[21];
        var shipmentStatus = rowData[0];
        var lastShipmentStatus = rowData[15];
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
                        if (shipmentStatus == ON_HOLD_SHIPMENT_STATUS || shipmentStatus == CANCELLED_SHIPMENT_STATUS) {
                            if (lastShipmentStatus == PLANNED_SHIPMENT_STATUS) {
                                submittedDate = moment(plannedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                approvedDate = moment(submittedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                shippedDate = moment(approvedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                arrivedDate = moment(shippedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                expectedDeliveryDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                receivedDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            } else if (lastShipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                                approvedDate = moment(submittedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                shippedDate = moment(approvedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                arrivedDate = moment(shippedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                expectedDeliveryDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                receivedDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            } else if (lastShipmentStatus == APPROVED_SHIPMENT_STATUS) {
                                shippedDate = moment(approvedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                arrivedDate = moment(shippedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                expectedDeliveryDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                receivedDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            } else if (lastShipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                                arrivedDate = moment(shippedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                expectedDeliveryDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                receivedDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            } else if (lastShipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                                expectedDeliveryDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                receivedDate = moment(arrivedDate).add(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            }
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
                                expectedDeliveryDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                receivedDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
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
                        if (shipmentStatus == ON_HOLD_SHIPMENT_STATUS || shipmentStatus == CANCELLED_SHIPMENT_STATUS) {
                            if (lastShipmentStatus == PLANNED_SHIPMENT_STATUS) {
                                submittedDate = moment(plannedDate).add(parseInt(programJson.plannedToSubmittedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                approvedDate = moment(submittedDate).add(parseInt(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                shippedDate = moment(approvedDate).add(parseInt(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                arrivedDate = moment(shippedDate).add(parseInt(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                expectedDeliveryDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                receivedDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                            } else if (lastShipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                                approvedDate = moment(submittedDate).add(parseInt(submittedToApprovedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                shippedDate = moment(approvedDate).add(parseInt(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                arrivedDate = moment(shippedDate).add(parseInt(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                expectedDeliveryDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                receivedDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                            } else if (lastShipmentStatus == APPROVED_SHIPMENT_STATUS) {
                                shippedDate = moment(approvedDate).add(parseInt(approvedToShippedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                arrivedDate = moment(shippedDate).add(parseInt(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                expectedDeliveryDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                receivedDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                            } else if (lastShipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                                arrivedDate = moment(shippedDate).add(parseInt(shippedToArrivedLeadTime * 30), 'days').format("YYYY-MM-DD");
                                expectedDeliveryDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                receivedDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                            } else if (lastShipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                                expectedDeliveryDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                                receivedDate = moment(arrivedDate).add(parseInt(programJson.arrivedToDeliveredLeadTime * 30), 'days').format("YYYY-MM-DD");
                            }
                        }
                    }
                    console.log("Planned date", plannedDate);
                    console.log("Submitted date", submittedDate);
                    console.log("Approved Date", approvedDate);
                    console.log("shipped date", shippedDate);
                    console.log("Arrived date", arrivedDate);
                    console.log("ExpectedDeliveryDate", expectedDeliveryDate);

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
                    if (moment(elInstance.getValueFromCoords(1, y)).format("YYYY-MM-DD") != moment(expectedDeliveryDate).format("YYYY-MM-DD")) {
                        elInstance.setValueFromCoords(1, y, expectedDeliveryDate, true);
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
        var rowDataForDates = elInstance.getRowData(y);
        shipmentInstance = this.state.shipmentsEl;
        var rowData = shipmentInstance.getRowData(rowDataForDates[7]);
        var shipmentStatus = rowData[0];
        if (x == 1) {
            if (y == 1) {
                var valid = checkValidtion("date", "B", y, rowDataForDates[1], elInstance);
            }
        }
        if (x == 2) {
            if (y == 1 && shipmentStatus != PLANNED_SHIPMENT_STATUS) {
                var valid = checkValidtion("date", "C", y, rowDataForDates[2], elInstance);
                if (valid == true) {
                    if (moment(rowDataForDates[1]).format("YYYY-MM-DD") > moment(value).format("YYYY-MM-DD") && y != 0) {
                        inValid("C", y, i18n.t('static.message.invaliddate'), elInstance);
                    } else {
                    }
                }
            }
        }
        if (x == 3) {
            if (y == 1 && shipmentStatus != PLANNED_SHIPMENT_STATUS && shipmentStatus != SUBMITTED_SHIPMENT_STATUS) {
                var valid = checkValidtion("date", "D", y, rowDataForDates[3], elInstance);
                if (valid == true) {
                    if (moment(rowDataForDates[2]).format("YYYY-MM-DD") > moment(value).format("YYYY-MM-DD")) {
                        inValid("D", y, i18n.t('static.message.invaliddate'), elInstance);
                    } else {
                    }
                }
            }
        }
        if (x == 4) {
            if (y == 1 && shipmentStatus != PLANNED_SHIPMENT_STATUS && shipmentStatus != SUBMITTED_SHIPMENT_STATUS && shipmentStatus != APPROVED_SHIPMENT_STATUS) {
                var valid = checkValidtion("date", "E", y, rowDataForDates[4], elInstance);
                if (valid == true) {
                    if (moment(rowDataForDates[3]).format("YYYY-MM-DD") > moment(value).format("YYYY-MM-DD")) {
                        inValid("E", y, i18n.t('static.message.invaliddate'), elInstance);
                    } else {
                    }
                }
            }
        }
        if (x == 5) {
            if (shipmentStatus != PLANNED_SHIPMENT_STATUS && shipmentStatus != SUBMITTED_SHIPMENT_STATUS && shipmentStatus != APPROVED_SHIPMENT_STATUS && shipmentStatus != SHIPPED_SHIPMENT_STATUS) {
                var valid = checkValidtion("date", "F", y, rowDataForDates[5], elInstance);
                if (valid == true) {
                    if (moment(rowDataForDates[4]).format("YYYY-MM-DD") > moment(value).format("YYYY-MM-DD")) {
                        inValid("F", y, i18n.t('static.message.invaliddate'), elInstance);
                    } else {
                    }
                }
            }
        }
        if (x == 6) {
            console.log(" in x 6")
            if (y == 0) {
                var valid = checkValidtion("date", "G", y, rowDataForDates[6], elInstance);
            } else if (shipmentStatus != PLANNED_SHIPMENT_STATUS && shipmentStatus != SUBMITTED_SHIPMENT_STATUS && shipmentStatus != APPROVED_SHIPMENT_STATUS && shipmentStatus != SHIPPED_SHIPMENT_STATUS && shipmentStatus != ARRIVED_SHIPMENT_STATUS) {
                var valid = checkValidtion("date", "G", y, rowDataForDates[6], elInstance);
            }

            if (valid == true) {
                console.log("In if")
                if (y == 0) {
                    console.log("In y==0")
                    var shipmentInstance = this.state.shipmentsEl;
                    var procurementAgent = rowData[2];
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
                            var expectedDeliveryDate = value;
                            var expectedPlannedDate = "";
                            var expectedSubmittedDate = "";
                            var expectedApprovedDate = "";
                            var expectedShippedDate = "";
                            var expectedArrivedDate = "";
                            var addLeadTimes = 0;
                            if (papuResult.localProcurementAgent) {
                                addLeadTimes = this.state.programPlanningUnitList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].localProcurementLeadTime;
                                var leadTimesPerStatus = addLeadTimes / 5;
                                expectedArrivedDate = moment(expectedDeliveryDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                expectedShippedDate = moment(expectedArrivedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                expectedApprovedDate = moment(expectedShippedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                expectedSubmittedDate = moment(expectedApprovedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                                expectedPlannedDate = moment(expectedSubmittedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                            } else {
                                var shipmentMode = rowData[7];
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

                            elInstance.setValueFromCoords(2, 0, expectedSubmittedDate, true);
                            elInstance.setValueFromCoords(3, 0, expectedApprovedDate, true);
                            elInstance.setValueFromCoords(4, 0, expectedShippedDate, true);
                            elInstance.setValueFromCoords(5, 0, expectedArrivedDate, true);
                            if (moment(expectedArrivedDate).format("YYYY-MM-DD") > moment(value).format("YYYY-MM-DD")) {
                                inValid("G", y, i18n.t('static.message.invaliddate'), elInstance);
                            } else {

                            }
                        }.bind(this)
                    }.bind(this)
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
                    if (rowData[19].toString() == "false") {
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
        this.props.updateState("loading", true);
        var validation = true;
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
                expectedDeliveryDate: moment(map1.get("6")).format("YYYY-MM-DD"),
                receivedDate: moment(map.get("6")).format("YYYY-MM-DD"),
            }
            var shipmentInstance = this.state.shipmentsEl;
            shipmentInstance.setValueFromCoords(21, parseInt(rowNumber), json, true);
            shipmentInstance.setValueFromCoords(1, parseInt(rowNumber), moment(map1.get("6")).format("YYYY-MM-DD"), true);
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
        var json = elInstance.getJson();
        var checkOtherValidation = true;
        var negativeBudget = 0;
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            var rowData = elInstance.getRowData(y);
            if (checkOtherValidation) {
                var validation = checkValidtion("text", "A", y, rowData[0], elInstance);
                if (validation == true) {
                    if (rowData[0] == SUBMITTED_SHIPMENT_STATUS || rowData[0] == ARRIVED_SHIPMENT_STATUS || rowData[0] == SHIPPED_SHIPMENT_STATUS || rowData[0] == DELIVERED_SHIPMENT_STATUS || rowData[0] == APPROVED_SHIPMENT_STATUS) {
                        var budget = rowData[4];
                        checkValidtion("text", "E", y, budget, elInstance);
                        var procurementAgent = rowData[2];
                        var fundingSource = rowData[3];
                        if (procurementAgent == TBD_PROCUREMENT_AGENT_ID) {
                            inValid("C", y, i18n.t('static.supplyPlan.procurementAgentCannotBeTBD'), elInstance);
                            valid = false;
                            elInstance.setValueFromCoords(25, y, 1, true);
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
                        if (map.get("4") != "" && map.get("9") != "") {
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
                            if (enteredBudgetAmt > availableBudgetAmount || availableBudgetAmount < 0) {
                                negativeBudget = negativeBudget + 1;
                                inValid("E", y, i18n.t('static.label.noFundsAvailable'), elInstance);
                            } else {
                            }
                        } else {
                        }
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
                            elInstance.setValueFromCoords(25, y, 1, true);
                        } else {
                            positiveValidation("C", y, elInstance);
                        }
                    }
                }

                var validation = checkValidtion("text", "D", y, rowData[3], elInstance);
                if (validation == true) {
                    var shipmentStatus = rowData[0];
                    if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                        if (rowData[3] == TBD_FUNDING_SOURCE) {
                            inValid("D", y, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'), elInstance);
                            valid = false;
                            elInstance.setValueFromCoords(25, y, 1, true);
                        } else {
                            positiveValidation("D", y, elInstance);
                        }
                    }
                }

                var validation = checkValidtion("text", "G", y, rowData[6], elInstance);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(25, y, 1, true);
                }

                var validation = checkValidtion("text", "H", y, rowData[7], elInstance);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(25, y, 1, true);
                }

                var validation = checkValidtion("number", "I", y, rowData[8], elInstance, INTEGER_NO_REGEX, 1, 0);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(25, y, 1, true);
                }

                var validation = checkValidtion("text", "J", y, rowData[9], elInstance);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(25, y, 1, true);
                }

                var validation = checkValidtion("number", "K", y, rowData[10], elInstance, DECIMAL_NO_REGEX, 1, 1);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(25, y, 1, true);
                }

                var validation = checkValidtion("number", "M", y, rowData[12], elInstance, DECIMAL_NO_REGEX, 1, 1);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(25, y, 1, true);
                }

                var shipmentStatus = elInstance.getRowData(y)[0];
                if (shipmentStatus != CANCELLED_SHIPMENT_STATUS && shipmentStatus != ON_HOLD_SHIPMENT_STATUS) {
                    if (shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                        var totalShipmentQty = (rowData[18]);
                        var adjustedOrderQty = (elInstance.getCell(`I${parseInt(y) + 1}`)).innerHTML;
                        adjustedOrderQty = adjustedOrderQty.toString().replaceAll("\,", "");
                        var col = ("I").concat(parseInt(y) + 1);

                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.supplyPlan.batchNumberMissing'));
                        inValid("I", y, i18n.t('static.supplyPlan.batchNumberMissing'), elInstance);
                        console.log("TotalShipment Qty", totalShipmentQty, "Adjusted order qty", adjustedOrderQty);
                        if (totalShipmentQty != 0 && totalShipmentQty != adjustedOrderQty) {
                            valid = false;
                            elInstance.setValueFromCoords(25, y, 1, true);
                            this.props.updateState("shipmentBatchError", i18n.t('static.supplyPlan.batchNumberMissing'));
                            this.props.hideSecondComponent();
                        } else {
                            positiveValidation("I", y, elInstance);
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
            var json = elInstance.getJson();
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
                    var batchInfoList = programJson.batchInfoList;
                    var minDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
                    for (var j = 0; j < json.length; j++) {
                        var map = new Map(Object.entries(json[j]));
                        if (map.get("23") == 1) {
                            console.log("In if");
                            if (moment(map.get("1")).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                minDate = moment(map.get("1")).format("YYYY-MM-DD");
                            }
                        }
                        console.log("minDate", minDate);
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
                        var plannedDate = shipmentDatesJson.plannedDate;
                        var submittedDate = shipmentDatesJson.submittedDate;
                        var approvedDate = shipmentDatesJson.approvedDate;
                        var shippedDate = shipmentDatesJson.shippedDate;
                        var arrivedDate = shipmentDatesJson.arrivedDate;
                        var receivedDate = shipmentDatesJson.receivedDate;
                        if (shipmentStatusId == PLANNED_SHIPMENT_STATUS) {
                            if (plannedDate == "" || plannedDate == null) {
                                plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                        }
                        else if (shipmentStatusId == SUBMITTED_SHIPMENT_STATUS) {
                            if (plannedDate == "" || plannedDate == null) {
                                plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                            if (submittedDate == "" || submittedDate == null) {
                                submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                        }
                        else if (shipmentStatusId == APPROVED_SHIPMENT_STATUS) {
                            if (plannedDate == "" || plannedDate == null) {
                                plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                            if (submittedDate == "" || submittedDate == null) {
                                submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                            if (approvedDate == "" || approvedDate == null) {
                                approvedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                        } else if (shipmentStatusId == SHIPPED_SHIPMENT_STATUS) {
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
                        } else if (shipmentStatusId == ARRIVED_SHIPMENT_STATUS) {
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
                        } else if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
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
                            if (receivedDate == "" || receivedDate == undefined || receivedDate == null) {
                                receivedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                        }

                        if (map.get("16") != -1) {
                            shipmentDataList[parseInt(map.get("16"))].plannedDate = plannedDate;
                            shipmentDataList[parseInt(map.get("16"))].submittedDate = submittedDate;
                            shipmentDataList[parseInt(map.get("16"))].approvedDate = approvedDate;
                            shipmentDataList[parseInt(map.get("16"))].shippedDate = shippedDate;
                            shipmentDataList[parseInt(map.get("16"))].arrivedDate = arrivedDate;
                            shipmentDataList[parseInt(map.get("16"))].receivedDate = receivedDate;
                            shipmentDataList[parseInt(map.get("16"))].expectedDeliveryDate = moment(map.get("1")).format("YYYY-MM-DD");

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
                            shipmentDataList[parseInt(map.get("16"))].active = map.get("24");
                            shipmentDataList[parseInt(map.get("16"))].emergencyOrder = map.get("19");
                            shipmentDataList[parseInt(map.get("16"))].currency.currencyId = map.get("9");
                            shipmentDataList[parseInt(map.get("16"))].currency.conversionRateToUsd = (parseFloat((this.state.currencyListAll.filter(c => c.currencyId == map.get("9"))[0]).conversionRateToUsd));
                            if (map.get("17") != "" && map.get("17").length != 0) {
                                shipmentDataList[parseInt(map.get("16"))].batchInfoList = map.get("17");
                            }


                            // if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                            var shipmentBatchInfoList = map.get("17");
                            console.log("Shipment Batcg info list", shipmentBatchInfoList);
                            var expectedDeliveryDate = moment(map.get("1")).format("YYYY-MM-DD");
                            var createdDate = expectedDeliveryDate;
                            if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                                createdDate = moment(shipmentDatesJson.receivedDate).format("YYYY-MM-DD");
                            }
                            if (shipmentBatchInfoList == "" && shipmentBatchInfoList.length == 0) {
                                // If user is not entering anything system will create its own batch
                                console.log("In if")
                                var programId = (document.getElementById("programId").value).split("_")[0];
                                var planningUnitId = document.getElementById("planningUnitId").value;
                                var batchNo = (paddingZero(programId, 0, 6)).concat(paddingZero(planningUnitId, 0, 8)).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                                var expiryDate = moment(expectedDeliveryDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                                if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                                    expiryDate = moment(shipmentDatesJson.receivedDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                                }
                                var batchInfoJson = {
                                    shipmentTransBatchInfoId: 0,
                                    batch: {
                                        batchNo: batchNo,
                                        expiryDate: expiryDate,
                                        batchId: 0,
                                        autoGenerated: true
                                    },
                                    shipmentQty: shipmentQty.toString().replaceAll("\,", ""),
                                    createdDate: createdDate
                                }
                                var batchArr = [];
                                batchArr.push(batchInfoJson);
                                shipmentDataList[parseInt(map.get("16"))].batchInfoList = batchArr;

                                // Enter details in batch info list
                                var batchDetails = {
                                    batchId: 0,
                                    batchNo: batchNo,
                                    planningUnitId: parseInt(document.getElementById("planningUnitId").value),
                                    expiryDate: expiryDate,
                                    createdDate: createdDate,
                                    autoGenerated: true
                                }
                                batchInfoList.push(batchDetails);
                            }
                            for (var bi = 0; bi < shipmentBatchInfoList.length; bi++) {
                                // Push shipment batch details in program json batch info list
                                var index = batchInfoList.findIndex(c => c.batchNo == shipmentBatchInfoList[bi].batch.batchNo);
                                console.log("Batch info list 1st", batchInfoList);
                                console.log("Index1", index);
                                if (index == -1) {
                                    var batchDetails = {
                                        batchId: shipmentBatchInfoList[bi].batch.batchId,
                                        batchNo: shipmentBatchInfoList[bi].batch.batchNo,
                                        planningUnitId: parseInt(document.getElementById("planningUnitId").value),
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
                            console.log("In else")
                            var shipmentJson = {
                                accountFlag: true,
                                active: map.get("24"),
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
                                plannedDate: moment(plannedDate).format("YYYY-MM-DD"),
                                submittedDate: moment(submittedDate).format("YYYY-MM-DD"),
                                approvedDate: moment(approvedDate).format("YYYY-MM-DD"),
                                shippedDate: moment(shippedDate).format("YYYY-MM-DD"),
                                arrivedDate: moment(arrivedDate).format("YYYY-MM-DD"),
                                expectedDeliveryDate: moment(expectedDeliveryDate).format("YYYY-MM-DD"),
                                receivedDate: moment(receivedDate).format("YYYY-MM-DD"),
                                index: shipmentDataList.length,
                                batchInfoList: []
                            }
                            if (map.get("17") != "" && map.get("17").length != 0) {
                                shipmentJson.batchInfoList = map.get("17");
                            }

                            // if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                            var shipmentBatchInfoList = map.get("17");
                            console.log("Shipment byach info list", shipmentBatchInfoList);
                            var expectedDeliveryDate = moment(map.get("1")).format("YYYY-MM-DD");
                            var createdDate = expectedDeliveryDate;
                            if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                                createdDate = moment(shipmentDatesJson.receivedDate).format("YYYY-MM-DD");
                            }
                            if (shipmentBatchInfoList == "" && shipmentBatchInfoList.length == 0) {
                                var programId = (document.getElementById("programId").value).split("_")[0];
                                var planningUnitId = document.getElementById("planningUnitId").value;
                                var batchNo = (paddingZero(programId, 0, 6)).concat(paddingZero(planningUnitId, 0, 8)).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                                var expiryDate = moment(expectedDeliveryDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                                if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                                    expiryDate = moment(shipmentDatesJson.receivedDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                                }
                                var batchInfoJson = {
                                    shipmentTransBatchInfoId: 0,
                                    batch: {
                                        batchNo: batchNo,
                                        expiryDate: expiryDate,
                                        batchId: 0,
                                        autoGenerated: true
                                    },
                                    shipmentQty: shipmentQty.toString().replaceAll("\,", ""),
                                    createdDate: createdDate
                                }
                                var batchArr = [];
                                batchArr.push(batchInfoJson);
                                shipmentJson.batchInfoList = batchArr;


                                var batchDetails = {
                                    batchId: 0,
                                    batchNo: batchNo,
                                    planningUnitId: parseInt(document.getElementById("planningUnitId").value),
                                    expiryDate: expiryDate,
                                    createdDate: createdDate,
                                    autoGenerated: true
                                }
                                batchInfoList.push(batchDetails);
                            }
                            console.log("shipmentBatchInfoList.length", shipmentBatchInfoList.length);
                            for (var bi = 0; bi < shipmentBatchInfoList.length; bi++) {
                                var index = batchInfoList.findIndex(c => c.batchNo == shipmentBatchInfoList[bi].batch.batchNo);
                                console.log("BatchInfoList", batchInfoList);
                                console.log("Index", index);
                                if (index == -1) {
                                    var batchDetails = {
                                        batchId: shipmentBatchInfoList[bi].batch.batchId,
                                        batchNo: shipmentBatchInfoList[bi].batch.batchNo,
                                        planningUnitId: parseInt(document.getElementById("planningUnitId").value),
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
        var papuResult = this.state.procurementAgentPlanningUnitListAll;
        var elInstance = this.state.shipmentsEl;
        var rowData = elInstance.getRowData(y);
        var planningUnitId = document.getElementById("planningUnitId").value;
        var procurementAgentPlanningUnit = papuResult.filter(p => p.procurementAgent.id == rowData[2] && p.planningUnit.id == planningUnitId);
        if (x == 8 && (procurementAgentPlanningUnit.length > 0 && ((procurementAgentPlanningUnit[0].unitsPerPalletEuro1 != 0 && procurementAgentPlanningUnit[0].unitsPerPalletEuro1 != null) || (procurementAgentPlanningUnit[0].moq != 0 && procurementAgentPlanningUnit[0].moq != null) || (procurementAgentPlanningUnit[0].unitsPerPalletEuro2 != 0 && procurementAgentPlanningUnit[0].unitsPerPalletEuro2 != null) || (procurementAgentPlanningUnit[0].unitsPerContainer != 0 && procurementAgentPlanningUnit[0].unitsPerContainer != null)))) {
            this.props.updateState("loading", true);
            if (this.props.shipmentPage == "shipmentDataEntry") {
                this.props.updateState("shipmentModalTitle", i18n.t("static.supplyPlan.qtyCalculator"));
                this.props.toggleLarge();
            }
            document.getElementById("showSaveQtyButtonDiv").style.display = 'block';
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
            if (rowData[14].toString() == "true" || this.props.shipmentPage == "supplyPlanCompare") {
                tableEditable = false;
            }
            var adjustedOrderQty = [];
            if (rowData[22] != "" || rowData[22] > 0) {
                adjustedOrderQty.push({ id: 1, name: i18n.t('static.supplyPlan.suggestedOrderQty') })
            }
            adjustedOrderQty.push({ id: 2, name: i18n.t('static.supplyPlan.manualOrderQty') })
            var data = [];
            data[0] = 2;//A
            data[1] = rowData[22];//B
            data[2] = rowData[8] != "" ? rowData[8] : 0;//C
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
                    { title: i18n.t('static.supplyPlan.suggestedOrderQty'), type: 'numeric', mask: '#,##.00', decimal: '.', width: 120, readOnly: true },
                    { title: i18n.t('static.supplyPlan.manualOrderQty'), type: 'numeric', mask: '#,##.00', decimal: '.', width: 120 },
                    { type: roundingOptionType, title: i18n.t('static.supplyPlan.orderBasedOn'), source: orderBasedOn, width: 120 },
                    { type: roundingOptionType, title: i18n.t('static.supplyPlan.roundingOption'), source: [{ id: 1, name: i18n.t('static.supplyPlan.roundDown') }, { id: 2, name: i18n.t('static.supplyPlan.roundUp') }], width: 120 },
                    { title: i18n.t('static.supplyPlan.finalOrderQty'), type: 'numeric', readOnly: true, mask: '#,##.00', decimal: '.', width: 120 },
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
                contextMenu: false,
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
                data1[8] = rowData[22];//I
                data1[9] = rowData[8];//J
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
                    contextMenu: false,
                    text: {
                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                        show: '',
                        entries: '',
                    },
                    onload: this.loadedQtyCalculator1,

                }
                var elVar1 = jexcel(document.getElementById("qtyCalculatorTable1"), options1);
                this.el = elVar1;
                this.setState({ qtyCalculatorTableEl1: elVar1 });
            }
            this.props.updateState("loading", false);
        }

        if (x == 1 && rowData[2] != "" && rowData[7] != "") {
            var procurementAgent = rowData[2];
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
                    document.getElementById("showSaveShipmentsDatesButtonsDiv").style.display = 'block';
                    this.el = jexcel(document.getElementById("shipmentDatesTable"), '');
                    this.el.destroy();
                    var json = [];
                    var shipmentDates = rowData[21];
                    var shipmentStatus = rowData[0];
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
                    console.log("Shipment Dates", shipmentDates);
                    console.log("Received Date", receivedDate)
                    var addLeadTimes = 0;
                    if (papuResult.localProcurementAgent) {
                        addLeadTimes = this.state.programPlanningUnitList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value)[0].localProcurementLeadTime;
                        var leadTimesPerStatus = addLeadTimes / 5;
                        expectedArrivedDate = moment(expectedDeliveryDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                        expectedShippedDate = moment(expectedArrivedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                        expectedApprovedDate = moment(expectedShippedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                        expectedSubmittedDate = moment(expectedApprovedDate).subtract(parseInt(leadTimesPerStatus * 30), 'days').format("YYYY-MM-DD");
                    } else {
                        var shipmentMode = rowData[7];
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
                    }

                    if (shipmentStatus == PLANNED_SHIPMENT_STATUS) {
                        if (plannedDate == "" || plannedDate == null || plannedDate == undefined) {
                            plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                    } else if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS) {
                        if (plannedDate == "" || plannedDate == null || plannedDate == undefined) {
                            plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (submittedDate == "" || submittedDate == null || submittedDate == undefined) {
                            submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                    } else if (shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                        if (plannedDate == "" || plannedDate == null || plannedDate == undefined) {
                            plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (submittedDate == "" || submittedDate == null || submittedDate == undefined) {
                            submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (approvedDate == "" || approvedDate == null || approvedDate == undefined) {
                            approvedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                    } else if (shipmentStatus == SHIPPED_SHIPMENT_STATUS) {
                        if (plannedDate == "" || plannedDate == null || plannedDate == undefined) {
                            plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (submittedDate == "" || submittedDate == null || submittedDate == undefined) {
                            submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (approvedDate == "" || approvedDate == null || approvedDate == undefined) {
                            approvedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (shippedDate == "" || shippedDate == null || shippedDate == undefined) {
                            shippedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                    } else if (shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                        if (plannedDate == "" || plannedDate == null || plannedDate == undefined) {
                            plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (submittedDate == "" || submittedDate == null || submittedDate == undefined) {
                            submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (approvedDate == "" || approvedDate == null || approvedDate == undefined) {
                            approvedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (shippedDate == "" || shippedDate == null || shippedDate == undefined) {
                            shippedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (arrivedDate == "" || arrivedDate == undefined || arrivedDate == null) {
                            arrivedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                    } else if (shipmentStatus == DELIVERED_SHIPMENT_STATUS) {
                        if (plannedDate == "" || plannedDate == null || plannedDate == undefined) {
                            plannedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (submittedDate == "" || submittedDate == null || submittedDate == undefined) {
                            submittedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (approvedDate == "" || approvedDate == null || approvedDate == undefined) {
                            approvedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (shippedDate == "" || shippedDate == null || shippedDate == undefined) {
                            shippedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (arrivedDate == "" || arrivedDate == undefined || arrivedDate == null) {
                            arrivedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (receivedDate == "" || receivedDate == undefined || receivedDate == null) {
                            receivedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                    }

                    var tableEditable = true;
                    if (rowData[14].toString() == "true" || this.props.shipmentPage == "supplyPlanCompare" || shipmentStatus == ON_HOLD_SHIPMENT_STATUS || shipmentStatus == CANCELLED_SHIPMENT_STATUS) {
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
                                type: 'hidden',
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
                                    validRange: shipmentStatus == DELIVERED_SHIPMENT_STATUS ? [null, (moment(Date.now()).format("YYYY-MM-DD")).toString()] : [(moment(Date.now()).format("YYYY-MM-DD")).toString(), null]
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
                        contextMenu: false,
                        text: {
                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
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
                                cell.classList.add('readonly');
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
        }
    }
}