import React from "react";
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunctionOnlyHideRow, checkValidtion, inValid, positiveValidation, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { SECRET_KEY, JEXCEL_INTEGER_REGEX, INVENTORY_DATA_SOURCE_TYPE, JEXCEL_NEGATIVE_INTEGER_NO_REGEX, QAT_DATA_SOURCE_ID, NOTES_FOR_QAT_ADJUSTMENTS, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP, JEXCEL_DATE_FORMAT_WITHOUT_DATE, JEXCEL_DEFAULT_PAGINATION, JEXCEL_PAGINATION_OPTION, INVENTORY_MONTHS_IN_PAST } from "../../Constants";
import moment from "moment";
import CryptoJS from 'crypto-js'
import { calculateSupplyPlan } from "./SupplyPlanCalculations";
import AuthenticationService from "../Common/AuthenticationService";


export default class InventoryInSupplyPlanComponent extends React.Component {

    constructor(props) {
        super(props);
        this.showInventoryData = this.showInventoryData.bind(this);
        this.loadedInventory = this.loadedInventory.bind(this);
        this.inventoryChanged = this.inventoryChanged.bind(this);
        this.filterBatchInfoForExistingDataForInventory = this.filterBatchInfoForExistingDataForInventory.bind(this);
        this.loadedBatchInfoInventory = this.loadedBatchInfoInventory.bind(this);
        this.batchInfoChangedInventory = this.batchInfoChangedInventory.bind(this);
        this.checkValidationInventoryBatchInfo = this.checkValidationInventoryBatchInfo.bind(this);
        this.saveInventoryBatchInfo = this.saveInventoryBatchInfo.bind(this);
        this.checkValidationInventory = this.checkValidationInventory.bind(this);
        this.saveInventory = this.saveInventory.bind(this);
        this.showOnlyErrors = this.showOnlyErrors.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.addBatchRowInJexcel = this.addBatchRowInJexcel.bind(this);
        this.state = {
            inventoryEl: "",
            inventoryBatchInfoTableEl: ""
        }
    }

    showOnlyErrors() {
        var checkBoxValue = document.getElementById("showErrors");
        var elInstance = this.state.inventoryEl;
        var json = elInstance.getJson();
        var showOption = (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
        if (json.length < showOption) {
            showOption = json.length;
        }
        if (checkBoxValue.checked == true) {
            console.log("in ncheck box true");
            for (var j = 0; j < parseInt(showOption); j++) {
                var rowData = elInstance.getRowData(j);
                console.log("in for loop", rowData[16]);
                var asterisk = document.getElementsByClassName("jexcel_content")[0];
                console.log("asterisk", asterisk);
                var tr = (asterisk.childNodes[0]).childNodes[2];
                if (rowData[16].toString() == 1) {
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

    showInventoryData() {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var inventoryListUnFiltered = this.props.items.inventoryListUnFiltered;
        var inventoryList = this.props.items.inventoryList;
        var programJson = this.props.items.programJson;
        var db1;
        var dataSourceList = [];
        var realmCountryPlanningUnitList = [];
        var myVar = "";
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
            this.props.updateState("color", "red");
            this.props.hideFirstComponent();
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var rcpuTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
            var rcpuOs = rcpuTransaction.objectStore('realmCountryPlanningUnit');
            var rcpuRequest = rcpuOs.getAll();
            rcpuRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                this.props.updateState("color", "red");
                this.props.hideFirstComponent();
            }.bind(this);
            rcpuRequest.onsuccess = function (event) {
                var rcpuResult = [];
                rcpuResult = rcpuRequest.result;
                for (var k = 0; k < rcpuResult.length; k++) {
                    if (rcpuResult[k].realmCountry.id == programJson.realmCountry.realmCountryId && rcpuResult[k].planningUnit.id == document.getElementById("planningUnitId").value) {
                        var rcpuJson = {
                            name: getLabelText(rcpuResult[k].label, this.props.items.lang),
                            id: rcpuResult[k].realmCountryPlanningUnitId,
                            multiplier: rcpuResult[k].multiplier,
                            active: rcpuResult[k].active
                        }
                        realmCountryPlanningUnitList.push(rcpuJson);
                    }
                }

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
                    for (var k = 0; k < dataSourceResult.length; k++) {
                        if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0) {
                            if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId && dataSourceResult[k].dataSourceType.id == INVENTORY_DATA_SOURCE_TYPE) {
                                var dataSourceJson = {
                                    name: getLabelText(dataSourceResult[k].label, this.props.items.lang),
                                    id: dataSourceResult[k].dataSourceId,
                                    active: dataSourceResult[k].active
                                }
                                dataSourceList.push(dataSourceJson);
                            }
                        }
                    }
                    if (this.state.inventoryEl != "" && this.state.inventoryEl != undefined) {
                        this.state.inventoryEl.destroy();
                    }
                    if (this.state.inventoryBatchInfoTableEl != "" && this.state.inventoryBatchInfoTableEl != undefined) {
                        this.state.inventoryBatchInfoTableEl.destroy();
                    }
                    this.setState({
                        realmCountryPlanningUnitList: realmCountryPlanningUnitList,
                        dataSourceList: dataSourceList
                    })
                    var data = [];
                    var inventoryDataArr = [];
                    var adjustmentType = this.props.items.inventoryType;
                    var adjustmentColumnType = "hidden";
                    if (adjustmentType == 2) {
                        adjustmentColumnType = "numeric"
                    }
                    var actualColumnType = "hidden";
                    if (adjustmentType == 1) {
                        actualColumnType = "numeric";
                    }
                    var inventoryEditable = true;
                    if (this.props.inventoryPage == "supplyPlanCompare") {
                        inventoryEditable = false;
                    }
                    var paginationOption = false;
                    var searchOption = false;
                    var paginationArray = []
                    if (this.props.inventoryPage == "inventoryDataEntry") {
                        paginationOption = JEXCEL_DEFAULT_PAGINATION;
                        searchOption = true;
                        paginationArray = JEXCEL_PAGINATION_OPTION;
                    }

                    var readonlyRegionAndMonth = true;
                    if (this.props.inventoryPage == "inventoryDataEntry") {
                        readonlyRegionAndMonth = false;
                    }

                    console.log("Inventory list", inventoryList);
                    inventoryList = inventoryList.sort(function (a, b) { return ((new Date(a.inventoryDate) - new Date(b.inventoryDate)) || (a.region.id - b.region.id) || (a.realmCountryPlanningUnit.id - b.realmCountryPlanningUnit.id)) })
                    for (var j = 0; j < inventoryList.length; j++) {
                        data = [];
                        data[0] = inventoryList[j].inventoryDate; //A
                        data[1] = inventoryList[j].region.id; //B                        
                        data[2] = inventoryList[j].dataSource.id; //C
                        data[3] = inventoryList[j].realmCountryPlanningUnit.id; //D
                        data[4] = adjustmentType; //E
                        data[5] = Math.round(inventoryList[j].adjustmentQty); //F
                        data[6] = Math.round(inventoryList[j].actualQty); //G
                        data[7] = inventoryList[j].multiplier; //H
                        data[8] = `=F${parseInt(j) + 1}*H${parseInt(j) + 1}`; //I
                        data[9] = `=G${parseInt(j) + 1}*H${parseInt(j) + 1}`; //J
                        if (inventoryList[j].notes === null || ((inventoryList[j].notes).trim() == "NULL")) {
                            data[10] = "";
                        } else {
                            data[10] = inventoryList[j].notes;
                        }
                        data[11] = inventoryList[j].active;
                        data[12] = inventoryList[j].inventoryDate;
                        data[13] = inventoryList[j].batchInfoList;

                        var index;
                        if (inventoryList[j].inventoryId != 0) {
                            index = inventoryListUnFiltered.findIndex(c => c.inventoryId == inventoryList[j].inventoryId);
                        } else {
                            console.log("inventoryListUnFiltered", inventoryListUnFiltered);
                            console.log("Adjustment Type", adjustmentType);
                            console.log("planningUnitId", planningUnitId)
                            index = inventoryListUnFiltered[j].index;
                        }
                        data[14] = index;
                        data[15] = 0;
                        data[16] = 0;
                        inventoryDataArr[j] = data;
                    }
                    var regionList = this.props.items.regionList;
                    if (inventoryList.length == 0) {
                        data = [];
                        if (this.props.inventoryPage != "inventoryDataEntry") {
                            data[0] = moment(this.props.items.inventoryEndDate).endOf('month').format("YYYY-MM-DD"); //A
                            data[1] = this.props.items.inventoryRegion; //B                        
                        } else {
                            data[0] = "";
                            data[1] = regionList.length == 1 ? regionList[0].id : "";
                        }
                        data[2] = ""; //C
                        data[3] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].id : ""; //D
                        data[4] = adjustmentType; //E
                        data[5] = ""; //F
                        data[6] = ""; //G
                        data[7] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].multiplier : "";; //H
                        data[8] = `=F${parseInt(0) + 1}*H${parseInt(0) + 1}`; //I
                        data[9] = `=G${parseInt(0) + 1}*H${parseInt(0) + 1}`; //J
                        data[10] = "";
                        data[11] = true;
                        if (this.props.inventoryPage != "inventoryDataEntry") {
                            data[12] = this.props.items.inventoryEndDate;
                        } else {
                            data[12] = "";
                        }
                        data[13] = "";
                        data[14] = -1;
                        data[15] = 1;
                        data[16] = 0;
                        inventoryDataArr[0] = data;
                    }
                    this.setState({
                        inventoryAllJson: inventoryDataArr
                    })
                    var options = {
                        data: inventoryDataArr,
                        columnDrag: true,
                        columns: [
                            { title: i18n.t('static.inventory.inventoryDate'), type: 'calendar', options: { format: JEXCEL_DATE_FORMAT_WITHOUT_DATE, validRange: [null, adjustmentType == 1 ? moment(Date.now()).endOf('month').format("YYYY-MM-DD") : null] }, width: 80, readOnly: readonlyRegionAndMonth },
                            { title: i18n.t('static.region.region'), type: 'dropdown', readOnly: readonlyRegionAndMonth, source: this.props.items.regionList, width: 100 },
                            { title: i18n.t('static.inventory.dataSource'), type: 'dropdown', source: dataSourceList, width: 180, filter: this.filterDataSource },
                            { title: i18n.t('static.supplyPlan.alternatePlanningUnit'), type: 'dropdown', source: realmCountryPlanningUnitList, filter: this.filterRealmCountryPlanningUnit, width: 180 },
                            { title: i18n.t('static.supplyPlan.inventoryType'), type: 'dropdown', source: [{ id: 1, name: i18n.t('static.inventory.inventory') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }], readOnly: true, width: 100 },
                            { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: adjustmentColumnType, mask: '[-]#,##', width: 80 },
                            { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: actualColumnType, mask: '#,##.00', decimal: '.', width: 80 },
                            { title: i18n.t('static.unit.multiplier'), type: 'numeric', mask: '#,##.00', decimal: '.', width: 80, readOnly: true },
                            { title: i18n.t('static.supplyPlan.quantityQATProduct'), type: adjustmentColumnType, mask: '[-]#,##.00', decimal: '.', width: 80, readOnly: true },
                            { title: i18n.t('static.supplyPlan.quantityQATProduct'), type: actualColumnType, mask: '#,##.00', decimal: '.', width: 80, readOnly: true },
                            { title: i18n.t('static.program.notes'), type: 'text', width: 200 },
                            { title: i18n.t('static.inventory.active'), type: 'checkbox', width: 100 },
                            { title: i18n.t('static.inventory.inventoryDate'), type: 'hidden', width: 0 },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 0 },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.index'), width: 50 },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.isChanged'), width: 0 },
                            { type: 'hidden', width: 0 },
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
                        allowManualInsertRow: false,
                        allowExport: false,
                        copyCompatibility: true,
                        text: {
                            // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                            show: '',
                            entries: '',
                        },
                        onload: this.loadedInventory,
                        editable: inventoryEditable,
                        onchange: this.inventoryChanged,
                        updateTable: function (el, cell, x, y, source, value, id) {
                            var elInstance = el.jexcel;
                            var rowData = elInstance.getRowData(y);
                            var lastEditableDate = moment(Date.now()).subtract(INVENTORY_MONTHS_IN_PAST + 1, 'months').format("YYYY-MM-DD");
                            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q']
                            if (moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD")) {
                                for (var c = 0; c < colArr.length; c++) {
                                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                                    cell.classList.add('readonly');
                                }
                            } else {
                                for (var c = 0; c < colArr.length; c++) {
                                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                                    cell.classList.remove('readonly');
                                }
                            }
                        }.bind(this),
                        contextMenu: function (obj, x, y, e) {
                            var items = [];
                            //Add inventory batch info
                            var rowData = obj.getRowData(y)
                            if (rowData[4] != "" && rowData[0] != "" && rowData[1] != "" && rowData[3] != "") {
                                items.push({
                                    title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                    onclick: function () {
                                        this.props.updateState("loading", true);
                                        if (this.props.inventoryPage == "inventoryDataEntry") {
                                            this.props.toggleLarge();
                                        }
                                        var batchList = [];
                                        var date = moment(rowData[0]).startOf('month').format("YYYY-MM-DD");
                                        console.log("this.props.items.batchInfoList", this.props.items.batchInfoList);
                                        var batchInfoList = (this.props.items.batchInfoList).filter(c => c.autoGenerated.toString() == "false");
                                        console.log("Batch info list", batchInfoList);
                                        batchList.push({
                                            name: i18n.t('static.supplyPlan.fefo'),
                                            id: -1
                                        })
                                        batchList.push({
                                            name: i18n.t('static.common.select'),
                                            id: 0
                                        })
                                        var planningUnitId = document.getElementById("planningUnitId").value;
                                        for (var k = 0; k < batchInfoList.length; k++) {
                                            if (batchInfoList[k].planningUnitId == planningUnitId) {
                                                var batchJson = {
                                                    name: batchInfoList[k].batchNo,
                                                    id: batchInfoList[k].batchNo,
                                                    createdDate: batchInfoList[k].createdDate,
                                                    expiryDate: batchInfoList[k].expiryDate,
                                                    batchId: batchInfoList[k].batchId
                                                }
                                                batchList.push(batchJson);
                                            }
                                        }
                                        this.setState({
                                            batchInfoList: batchList
                                        })
                                        if (this.state.inventoryBatchInfoTableEl != "" && this.state.inventoryBatchInfoTableEl != undefined) {
                                            this.state.inventoryBatchInfoTableEl.destroy();
                                        }
                                        var json = [];
                                        var inventoryQty = 0;
                                        var adjustmentType = this.props.items.inventoryType;
                                        var adjustmentColumnType = "hidden";
                                        if (adjustmentType == 2) {
                                            adjustmentColumnType = "numeric"
                                        }
                                        var actualColumnType = "hidden";
                                        if (adjustmentType == 1) {
                                            actualColumnType = "numeric";
                                        }
                                        var batchInfo = rowData[13];
                                        var inventoryQty = 0;
                                        if (adjustmentType == 1) {
                                            inventoryQty = (rowData[6]).toString().replaceAll("\,", "");
                                        } else {
                                            inventoryQty = (rowData[5]).toString().replaceAll("\,", "");
                                        }
                                        var inventoryBatchInfoQty = 0;
                                        var inventoryBatchEditable = inventoryEditable;
                                        var lastEditableDate = "";
                                        lastEditableDate = moment(Date.now()).subtract(INVENTORY_MONTHS_IN_PAST + 1, 'months').format("YYYY-MM-DD");
                                        if (moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD")) {
                                            inventoryBatchEditable = false;
                                        }
                                        document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'block';
                                        if (this.props.consumptionPage != "supplyPlanCompare") {
                                            if (inventoryBatchEditable == false) {
                                                document.getElementById("inventoryBatchAddRow").style.display = "none";
                                            } else {
                                                document.getElementById("inventoryBatchAddRow").style.display = "block";
                                            }
                                        }
                                        for (var sb = 0; sb < batchInfo.length; sb++) {
                                            var data = [];
                                            data[0] = batchInfo[sb].batch.batchNo; //A
                                            data[1] = moment(batchInfo[sb].batch.expiryDate).format(DATE_FORMAT_CAP);
                                            data[2] = adjustmentType; //B
                                            data[3] = parseInt(batchInfo[sb].adjustmentQty); //C
                                            data[4] = parseInt(batchInfo[sb].actualQty); //D
                                            data[5] = batchInfo[sb].inventoryTransBatchInfoId; //E
                                            data[6] = y; //F
                                            data[7] = date;
                                            if (adjustmentType == 1) {
                                                inventoryBatchInfoQty += parseInt(batchInfo[sb].actualQty);
                                            } else {
                                                inventoryBatchInfoQty += parseInt(batchInfo[sb].adjustmentQty);
                                            }
                                            json.push(data);
                                        }
                                        if (parseInt(inventoryQty) != inventoryBatchInfoQty && batchInfo.length > 0) {
                                            if ((adjustmentType == 1 && parseInt(inventoryQty) > inventoryBatchInfoQty) || (adjustmentType == 2 && parseInt(inventoryBatchInfoQty) > 0 ? parseInt(inventoryBatchInfoQty) < parseInt(inventoryQty) : parseInt(inventoryBatchInfoQty) > parseInt(inventoryQty))) {
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
                                                data[7] = date;
                                                json.push(data);
                                            }
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
                                            data[7] = date;
                                            json.push(data)
                                        }
                                        var options = {
                                            data: json,
                                            columnDrag: true,
                                            columns: [
                                                { title: i18n.t('static.supplyPlan.batchId'), type: 'dropdown', source: batchList, filter: this.filterBatchInfoForExistingDataForInventory, width: 100 },
                                                { title: i18n.t('static.supplyPlan.expiryDate'), type: 'text', readOnly: true, width: 150 },
                                                { title: i18n.t('static.supplyPlan.adjustmentType'), type: 'hidden', source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }], readOnly: true },
                                                { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: adjustmentColumnType, mask: '[-]#,##', width: 80 },
                                                { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: actualColumnType, mask: '#,##.00', decimal: '.', width: 80 },
                                                { title: i18n.t('static.supplyPlan.inventoryTransBatchInfoId'), type: 'hidden', width: 0 },
                                                { title: i18n.t('static.supplyPlan.rowNumber'), type: 'hidden', width: 0 },
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
                                            copyCompatibility: true,
                                            allowInsertRow: true,
                                            allowManualInsertRow: false,
                                            allowExport: false,
                                            onchange: this.batchInfoChangedInventory,
                                            copyCompatibility: true,
                                            editable: inventoryBatchEditable,
                                            text: {
                                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                                show: '',
                                                entries: '',
                                            },
                                            onload: this.loadedBatchInfoInventory,
                                            updateTable: function (el, cell, x, y, source, value, id) {
                                            }.bind(this),
                                            contextMenu: function (obj, x, y, e) {
                                                var items = [];
                                                var items = [];
                                                if (y == null) {
                                                } else {
                                                    var adjustmentType = this.props.items.inventoryType;
                                                    console.log("Adjustment type", adjustmentType)
                                                    if (inventoryEditable) {
                                                        items.push({
                                                            title: i18n.t('static.supplyPlan.addNewBatchInfo'),
                                                            onclick: function () {
                                                                this.addBatchRowInJexcel();
                                                            }.bind(this)
                                                        });
                                                    }

                                                    if (inventoryEditable && obj.options.allowDeleteRow == true && obj.getJson().length > 1) {
                                                        // region id
                                                        if (obj.getRowData(y)[5] == 0) {
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
                                        var elVar = jexcel(document.getElementById("inventoryBatchInfoTable"), options);
                                        this.el = elVar;
                                        this.setState({ inventoryBatchInfoTableEl: elVar });
                                        this.props.updateState("loading", false);
                                    }.bind(this)
                                });
                            }
                            // -------------------------------------

                            if (y == null) {
                            } else {
                                // Insert new row
                                if (obj.options.allowInsertRow == true) {
                                    var json = obj.getJson();
                                    if (inventoryEditable) {
                                        items.push({
                                            title: this.props.items.inventoryType == 1 ? i18n.t('static.supplyPlan.addNewInventory') : i18n.t('static.supplyPlan.addNewAdjustments'),
                                            onclick: function () {
                                                this.addRowInJexcel();
                                            }.bind(this)
                                        });
                                    }

                                    if (inventoryEditable && obj.options.allowDeleteRow == true && obj.getJson().length > 1) {
                                        // region id
                                        if (obj.getRowData(y)[14] == -1) {
                                            items.push({
                                                title: i18n.t("static.common.deleterow"),
                                                onclick: function () {
                                                    obj.deleteRow(parseInt(y));
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                            return items;
                        }.bind(this)
                    }
                    myVar = jexcel(document.getElementById("adjustmentsTable"), options);
                    this.el = myVar;
                    this.setState({
                        inventoryEl: myVar
                    })
                    this.props.updateState("loading", false);
                }.bind(this)
            }.bind(this)
        }.bind(this);
    }

    addRowInJexcel() {
        var obj = this.state.inventoryEl;
        var json = obj.getJson();
        var map = new Map(Object.entries(json[0]));
        var regionList = (this.props.items.regionList);
        var realmCountryPlanningUnitList = this.state.realmCountryPlanningUnitList;
        var data = [];
        if (this.props.inventoryPage != "inventoryDataEntry") {
            data[0] = moment(this.props.items.inventoryEndDate).format("YYYY-MM-DD"); //A
            data[1] = this.props.items.inventoryRegion; //B        
        } else {
            data[0] = "";
            data[1] = regionList.length == 1 ? regionList[0].id : "";
        }
        data[2] = ""; //C
        data[3] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].id : ""; //D
        data[4] = map.get("4"); //E
        data[5] = ""; //F
        data[6] = ""; //G
        data[7] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].multiplier : ""; //H
        data[8] = `=F${parseInt(json.length) + 1}*H${parseInt(json.length) + 1}`; //I
        data[9] = `=G${parseInt(json.length) + 1}*H${parseInt(json.length) + 1}`; //J
        data[10] = "";
        data[11] = true;
        if (this.props.inventoryPage != "inventoryDataEntry") {
            data[12] = this.props.items.inventoryEndDate;
        } else {
            data[12] = "";
        }
        data[13] = "";
        data[14] = -1;
        data[15] = 1;
        data[16] = 0;
        obj.insertRow(data);
        if (this.props.inventoryPage == "inventoryDataEntry") {
            var showOption = (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
            console.log("showOption", showOption);
            if (showOption != 5000000) {
                var pageNo = parseInt(parseInt(json.length) / parseInt(showOption));
                obj.page(pageNo);
            }
        }
    }

    addBatchRowInJexcel() {
        var obj = this.state.inventoryBatchInfoTableEl;
        var adjustmentType = this.props.items.inventoryType;
        var rowData = obj.getRowData(0);
        var data = [];
        data[0] = "";
        data[1] = "";
        data[2] = adjustmentType;
        data[3] = "";
        data[4] = "";
        data[5] = 0;
        data[6] = rowData[6];
        data[7] = rowData[7];
        obj.insertRow(data);

    }

    filterDataSource = function (instance, cell, c, r, source) {
        return this.state.dataSourceList.filter(c => c.active.toString() == "true");
    }.bind(this)

    filterRealmCountryPlanningUnit = function (instance, cell, c, r, source) {
        return this.state.realmCountryPlanningUnitList.filter(c => c.active.toString() == "true");
    }.bind(this)




    loadedInventory = function (instance, cell, x, y, value) {
        if (this.props.inventoryPage != "inventoryDataEntry") {
            jExcelLoadedFunctionOnlyHideRow(instance);
        } else {
            jExcelLoadedFunction(instance);
        }
        var asterisk = document.getElementsByClassName("resizable")[0];
        console.log("astrrisk", asterisk);
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[7].classList.add('AsteriskTheadtrTd');
        if (this.props.items.inventoryType == 2) {
            tr.children[11].classList.add('AsteriskTheadtrTd');
        }
        (instance.jexcel).orderBy(0, 0);
    }

    inventoryChanged = function (instance, cell, x, y, value) {
        var elInstance = this.state.inventoryEl;
        var rowData = elInstance.getRowData(y);
        this.props.updateState("inventoryError", "");
        this.props.updateState("inventoryDuplicateError", "");
        this.props.updateState("inventoryChangedFlag", 1);
        if (x != 15 && x != 16) {
            elInstance.setValueFromCoords(16, y, 0, true);

        }
        if (x != 15) {
            elInstance.setValueFromCoords(15, y, 1, true);
        }
        if (x == 0) {
            var valid = checkValidtion("date", "A", y, rowData[0], elInstance);
            if (valid == false) {
                elInstance.setValueFromCoords(16, y, 1, true);
            }
        }
        if (x == 1) {
            var valid = checkValidtion("text", "B", y, rowData[1], elInstance);
            if (valid == false) {
                elInstance.setValueFromCoords(16, y, 1, true);
            }
        }
        if (x == 2) {
            var valid = checkValidtion("text", "C", y, rowData[2], elInstance);
            if (valid == false) {
                elInstance.setValueFromCoords(16, y, 1, true);
            }
        }
        if (x == 3) {
            elInstance.setValueFromCoords(7, y, "", true);
            var valid = checkValidtion("text", "D", y, rowData[3], elInstance);
            if (valid == true) {
                var multiplier = (this.state.realmCountryPlanningUnitList.filter(c => c.id == rowData[3])[0]).multiplier;
                elInstance.setValueFromCoords(7, y, multiplier, true);
            }
            if (valid == false) {
                elInstance.setValueFromCoords(16, y, 1, true);
            }
        }
        if (x == 5) {
            if (rowData[4] == 2) {
                var valid = checkValidtion("number", "F", y, rowData[5], elInstance, JEXCEL_NEGATIVE_INTEGER_NO_REGEX, 0, 0);
                if (valid == false) {
                    elInstance.setValueFromCoords(16, y, 1, true);
                } else {
                    if (rowData[5].length > 10) {
                        inValid("F", y, i18n.t('static.common.max10digittext'), elInstance);
                    } else {
                        positiveValidation("F", y, elInstance);
                        var batchDetails = rowData[13];
                        var adjustmentBatchQty = 0;
                        for (var b = 0; b < batchDetails.length; b++) {
                            adjustmentBatchQty += parseInt(batchDetails[b].adjustmentQty);
                        }
                        console.log("Adjutsment batch qty", adjustmentBatchQty);
                        console.log("RowData5", rowData[5]);
                        console.log("(parseInt(rowData[5])) > 0", (parseInt(rowData[5])) > 0);
                        if (parseInt(adjustmentBatchQty) > 0 ? parseInt(adjustmentBatchQty) > parseInt(rowData[5]) : parseInt(adjustmentBatchQty) < parseInt(rowData[5])) {
                            inValid("F", y, i18n.t('static.consumption.missingBatch'), elInstance);
                            valid = false;
                        } else {
                            positiveValidation("F", y, elInstance)
                        }
                    }
                }
            }
        }

        if (x == 6) {
            if (rowData[4] == 1) {
                var valid = checkValidtion("number", "G", y, rowData[6], elInstance, JEXCEL_INTEGER_REGEX, 1, 1);
                if (valid == false) {
                    elInstance.setValueFromCoords(16, y, 1, true);
                } else {
                    var batchDetails = rowData[13];
                    var actualBatchQty = 0;
                    for (var b = 0; b < batchDetails.length; b++) {
                        actualBatchQty += batchDetails[b].actualQty;
                    }
                    if (parseInt(rowData[6]) < parseInt(actualBatchQty)) {
                        inValid("G", y, i18n.t('static.consumption.missingBatch'), elInstance);
                        valid = false;
                    } else {
                        positiveValidation("G", y, elInstance)
                    }
                }
            } else {
                var batchDetails = rowData[13];
                var adjustmentBatchQty = 0;
                for (var b = 0; b < batchDetails.length; b++) {
                    adjustmentBatchQty += parseInt(batchDetails[b].adjustmentQty);
                }
                console.log("Adjutsment batch qty", adjustmentBatchQty);
                console.log("RowData5", rowData[5]);
                console.log("(parseInt(rowData[5])) > 0", (parseInt(rowData[5])) > 0);
                if (parseInt(adjustmentBatchQty) > 0 ? parseInt(adjustmentBatchQty) > parseInt(rowData[5]) : parseInt(adjustmentBatchQty) < parseInt(rowData[5])) {
                    inValid("F", y, i18n.t('static.consumption.missingBatch'), elInstance);
                    valid = false;
                } else {
                    positiveValidation("F", y, elInstance)
                }
            }
        }

        if (x == 13) {
            if (rowData[4] == 1) {
                var batchDetails = rowData[13];
                var actualBatchQty = 0;
                for (var b = 0; b < batchDetails.length; b++) {
                    actualBatchQty += batchDetails[b].actualQty;
                }
                if (parseInt(rowData[6]) < parseInt(actualBatchQty)) {
                    inValid("G", y, i18n.t('static.consumption.missingBatch'), elInstance);
                    valid = false;
                } else {
                    positiveValidation("G", y, elInstance)
                }
            }
        }

        if (x == 10) {
            if (rowData[4] == 2) {
                var valid = checkValidtion("text", "K", y, rowData[10], elInstance);
            }
        }
        // this.showOnlyErrors();
    }

    filterBatchInfoForExistingDataForInventory = function (instance, cell, c, r, source) {
        var mylist = [];
        var json = instance.jexcel.getJson();
        var value = (json[r])[5];
        var date = json[0][7];
        console.log("Date---------->", date);
        console.log("this.state.batchInfoList", this.state.batchInfoList);
        console.log("Value", value);
        // if (value != 0) {
        //     mylist = this.state.batchInfoList.filter(c => c.id != -1 && (moment(c.expiryDate).format("YYYY-MM-DD") > moment(date).format("YYYY-MM-DD") && moment(c.createdDate).format("YYYY-MM-DD") <= moment(date).format("YYYY-MM-DD")));
        // } else {
        //     mylist = this.state.batchInfoList.filter(c => (c.id == -1) || (moment(c.expiryDate).format("YYYY-MM-DD") > moment(date).format("YYYY-MM-DD") && moment(c.createdDate).format("YYYY-MM-DD") <= moment(date).format("YYYY-MM-DD")));
        // }
        mylist = this.state.batchInfoList.filter(c => c.id == 0 || c.id != -1 && (moment(c.expiryDate).format("YYYY-MM") > moment(date).format("YYYY-MM") && moment(c.createdDate).format("YYYY-MM") <= moment(date).format("YYYY-MM")));
        return mylist;
    }.bind(this)

    loadedBatchInfoInventory = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("resizable")[1];
        console.log("astrrisk", asterisk);
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
    }

    batchInfoChangedInventory = function (instance, cell, x, y, value) {
        var elInstance = this.state.inventoryBatchInfoTableEl;
        var rowData = elInstance.getRowData(y);
        this.props.updateState("inventoryBatchError", "");
        this.props.updateState("inventoryBatchInfoDuplicateError", "");
        this.props.updateState("inventoryBatchInfoNoStockError", "");
        this.props.updateState("inventoryBatchInfoChangedFlag", 1);
        if (x == 0) {
            var valid = checkValidtion("text", "A", y, rowData[0], elInstance);
            if (valid == true) {
                console.log("elInstance.getCell(`A${parseInt(y) + 1}`).innerText", elInstance.getCell(`A${parseInt(y) + 1}`).innerText)
                if (value != -1) {
                    var expiryDate = this.props.items.batchInfoList.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0].expiryDate;
                    elInstance.setValueFromCoords(1, y, moment(expiryDate).format(DATE_FORMAT_CAP), true);
                } else {
                    elInstance.setValueFromCoords(1, y, "", true);
                }
            }
        }
        if (x == 3) {
            if (rowData[2] == 2) {
                var valid = checkValidtion("number", "D", y, rowData[3], elInstance, JEXCEL_NEGATIVE_INTEGER_NO_REGEX, 0, 0);
                if (valid == true) {
                    if (rowData[3].length > 10) {
                        inValid("D", y, i18n.t('static.common.max10digittext'), elInstance);
                    } else {
                        positiveValidation("D", y, elInstance);
                    }
                }
            }
        }

        if (x == 4) {
            if (rowData[2] == 1) {
                checkValidtion("number", "E", y, rowData[4], elInstance, JEXCEL_INTEGER_REGEX, 1, 0);
            }
        }

    }

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
                    inValid((colArr[c]), y, i18n.t('static.supplyPlan.duplicateBatchNumber'), elInstance);
                }
                valid = false;
                this.props.updateState("inventoryBatchInfoDuplicateError", i18n.t('static.supplyPlan.duplicateBatchNumber'));
                this.props.hideThirdComponent();
            } else {
                // var programJson = this.props.items.programJsonAfterAdjustmentClicked;
                // var shipmentList = programJson.shipmentList;
                // var shipmentBatchArray = [];
                // for (var ship = 0; ship < shipmentList.length; ship++) {
                //     var batchInfoList = shipmentList[ship].batchInfoList;
                //     for (var bi = 0; bi < batchInfoList.length; bi++) {
                //         shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
                //     }
                // }
                // if (map.get("0") != -1) {
                //     var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0];
                //     var totalStockForBatchNumber = 0;
                //     if (stockForBatchNumber.length > 0) {
                //         totalStockForBatchNumber = stockForBatchNumber.qty;
                //     }
                //     var batchDetails = this.props.items.batchInfoList(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0]
                //     var createdDate = moment(batchDetails.createdDate).startOf('month').format("YYYY-MM-DD");
                //     var expiryDate = moment(batchDetails.expiryDate).startOf('month').format("YYYY-MM-DD");
                //     var remainingBatchQty = parseInt(totalStockForBatchNumber);
                //     var calculationStartDate = moment(batchDetails.createdDate).startOf('month').format("YYYY-MM-DD");
                //     // console.log("Batch Number", myArray[ma].batchNo);
                //     console.log("Received Qty", remainingBatchQty);
                //     for (var i = 0; createdDate < expiryDate; i++) {
                //         createdDate = moment(calculationStartDate).add(i, 'month').format("YYYY-MM-DD");
                //         var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                //         var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
                //         console.log("STart date", startDate);
                //         var inventoryList = (programJson.inventoryList).filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate));
                //         var inventoryBatchArray = [];
                //         for (var inv = 0; inv < inventoryList.length; inv++) {
                //             var rowData = (this.state.inventoryEl).getRowData(parseInt(map.get("6")));
                //             var invIndex = rowData[14];
                //             var index = inventoryList.findIndex(c => c => c.planningUnit.id == document.getElementById("planningUnitId").value && c.region.id == rowData[1] && moment(c.inventoryDate).format("MMM YY") == moment(rowData[0]).format("MMM YY") && c.realmCountryPlanningUnit.id == rowData[3])
                //             if (index != invIndex) {
                //                 var batchInfoList = inventoryList[inv].batchInfoList;
                //                 for (var bi = 0; bi < batchInfoList.length; bi++) {
                //                     inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier, actualQty: batchInfoList[bi].actualQty * inventoryList[inv].multiplier })
                //                 }
                //             }
                //         }
                //         var inventoryForBatchNumber = [];
                //         if (inventoryBatchArray.length > 0) {
                //             inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
                //         }
                //         if (inventoryForBatchNumber == undefined) {
                //             inventoryForBatchNumber = [];
                //         }
                //         console.log("InventoryBatchArray", inventoryForBatchNumber);
                //         var adjustmentQty = 0;
                //         for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                //             if (inventoryForBatchNumber[b].actualQty == "" || inventoryForBatchNumber[b].actualQty == 0 || inventoryForBatchNumber[b].actualQty == null) {
                //                 remainingBatchQty += parseInt(inventoryForBatchNumber[b].qty);
                //             } else {
                //                 remainingBatchQty = parseInt(inventoryForBatchNumber[b].actualQty);
                //             }
                //         }
                //         if (this.props.items.inventoryType == 1) {
                //             remainingBatchQty = parseInt(map.get("6").toString().replaceAll("\,", ""));
                //         } else {
                //             remainingBatchQty += parseInt(map.get("5").toString().replaceAll("\,", ""));
                //         }
                //         adjustmentQty += parseInt(map.get("3").toString().replaceAll("\,", ""));
                //         console.log("Remaining batch Qty after adjustment", remainingBatchQty);
                //         var consumptionList = (programJson.consumptionList).filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate));
                //         var consumptionBatchArray = [];

                //         for (var con = 0; con < consumptionList.length; con++) {
                //             var batchInfoList = consumptionList[con].batchInfoList;
                //             for (var bi = 0; bi < batchInfoList.length; bi++) {
                //                 consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
                //             }
                //         }
                //         var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
                //         if (consumptionForBatchNumber == undefined) {
                //             consumptionForBatchNumber = [];
                //         }
                //         var consumptionQty = 0;
                //         for (var b = 0; b < consumptionForBatchNumber.length; b++) {
                //             consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
                //         }
                //         remainingBatchQty -= parseInt(consumptionQty);
                //         console.log("Remaining batch qty after consumption", remainingBatchQty)
                //     }
                //     if (remainingBatchQty < 0) {
                //         inValid("D", y, i18n.t('static.supplyPlan.noStockAvailable'), elInstance);
                //         valid = false;
                //         this.props.updateState("inventoryBatchInfoNoStockError", i18n.t('static.supplyPlan.noStockAvailable'))
                //     }
                // } else {
                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    positiveValidation(colArr[c], y, elInstance);
                }
                var rowData = elInstance.getRowData(y);

                var validation = checkValidtion("text", "A", y, rowData[0], elInstance);
                if (validation == false) {
                    valid = false;
                }

                if (rowData[2] == 2) {
                    validation = checkValidtion("number", "D", y, rowData[3], elInstance, JEXCEL_NEGATIVE_INTEGER_NO_REGEX, 0, 0);
                    if (validation == false) {
                        valid = false;
                    } else {
                        if (rowData[3].length > 10) {
                            inValid("D", y, i18n.t('static.common.max10digittext'), elInstance);
                            valid = false;
                        } else {
                            positiveValidation("D", y, elInstance);
                        }
                    }
                }

                if (rowData[2] == 1) {
                    validation = checkValidtion("number", "E", y, rowData[4], elInstance, JEXCEL_INTEGER_REGEX, 1, 1);
                    if (validation == false) {
                        valid = false;
                    }
                }

            }
        }
        // }
        return valid;
    }

    saveInventoryBatchInfo() {
        this.props.updateState("loading", true);
        var validation = this.checkValidationInventoryBatchInfo();
        if (validation == true) {
            var elInstance = this.state.inventoryBatchInfoTableEl;
            var json = elInstance.getJson();
            var batchInfoArray = [];
            var rowNumber = 0;
            var totalAdjustments = 0;
            var totalActualStock = 0;
            var countForNonFefo = 0;
            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                if (i == 0) {
                    rowNumber = map.get("6");
                }
                if (map.get("0") != -1) {
                    countForNonFefo += 1;
                    var batchInfoJson = {
                        inventoryTransBatchInfoId: map.get("5"),
                        batch: {
                            batchId: this.state.batchInfoList.filter(c => c.name == elInstance.getCell(`A${parseInt(i) + 1}`).innerText)[0].batchId,
                            batchNo: elInstance.getCell(`A${parseInt(i) + 1}`).innerText,
                            expiryDate: moment(map.get("1")).format("YYYY-MM-DD")
                        },
                        adjustmentQty: (map.get("2") == 1) ? (map.get("3")).toString().replaceAll("\,", "") : (map.get("3")).toString().replaceAll("\,", "") != 0 ? (map.get("3")).toString().replaceAll("\,", "") : null,
                        actualQty: (map.get("2") == 1) ? (map.get("4")).toString().replaceAll("\,", "") : (map.get("3")).toString().replaceAll("\,", "") != 0 ? (map.get("3")).toString().replaceAll("\,", "") : null
                    }
                    batchInfoArray.push(batchInfoJson);
                }
                totalAdjustments += parseInt(map.get("3").toString().replaceAll("\,", ""));
                totalActualStock += parseInt(map.get("4").toString().replaceAll("\,", ""));
            }
            var inventoryInstance = this.state.inventoryEl;
            var rowData = inventoryInstance.getRowData(parseInt(rowNumber));
            var allConfirm = true;
            if (countForNonFefo == 0) {
                var cf = window.confirm(i18n.t("static.batchDetails.warningFefo"));
                if (cf == true) {
                    if (map.get("2") == 1 && rowData[6] != "" && totalActualStock > rowData[6]) {
                        var cf1 = window.confirm(i18n.t("static.batchDetails.warningQunatity"))
                        if (cf1 == true) {
                        } else {
                            allConfirm = false;
                        }
                    } else if (map.get("2") == 2 && rowData[5] != "" && (totalAdjustments > 0 ? totalAdjustments > rowData[5] : totalAdjustments < rowData[5])) {
                        var cf1 = window.confirm(i18n.t("static.batchDetails.warningQunatity"))
                        if (cf1 == true) {
                        } else {
                            allConfirm = false;
                        }
                    }
                } else {
                    allConfirm = false;
                }
            } else {
                if (map.get("2") == 1 && rowData[6] != "" && totalActualStock > rowData[6]) {
                    var cf1 = window.confirm(i18n.t("static.batchDetails.warningQunatity"))
                    if (cf1 == true) {
                    } else {
                        allConfirm = false;
                    }
                } else if (map.get("2") == 2 && rowData[5] != "" && (totalAdjustments > 0 ? totalAdjustments > rowData[5] : totalAdjustments < rowData[5])) {
                    var cf1 = window.confirm(i18n.t("static.batchDetails.warningQunatity"))
                    if (cf1 == true) {
                    } else {
                        allConfirm = false;
                    }
                }
            }

            if (allConfirm == true) {
                if (map.get("2") == 1) {
                    inventoryInstance.setValueFromCoords(5, rowNumber, "", true);
                    if (totalActualStock > rowData[6]) {
                        inventoryInstance.setValueFromCoords(6, rowNumber, totalActualStock, true);
                    }
                    // if (batchInfoArray.length > 0) {
                    //     var cell = inventoryInstance.getCell(`G${parseInt(rowNumber) + 1}`)
                    //     cell.classList.add('readonly');
                    // }
                } else {
                    if ((totalAdjustments > 0 ? totalAdjustments > rowData[5] : totalAdjustments < rowData[5])) {
                        inventoryInstance.setValueFromCoords(5, rowNumber, totalAdjustments, true);
                    }
                    inventoryInstance.setValueFromCoords(6, rowNumber, "", true);
                    // var cell = inventoryInstance.getCell(`F${parseInt(rowNumber) + 1}`)
                    // cell.classList.add('readonly');
                }
                // rowData[15] = batchInfoArray;
                inventoryInstance.setValueFromCoords(13, rowNumber, batchInfoArray, "");
                this.setState({
                    inventoryChangedFlag: 1,
                    inventoryBatchInfoChangedFlag: 0,
                    inventoryBatchInfoTableEl: ''
                })
                this.props.updateState("inventoryChangedFlag", 1);
                this.props.updateState("inventoryBatchInfoChangedFlag", 0);
                this.props.updateState("inventoryBatchInfoTableEl", "");
                this.setState({
                    inventoryBatchInfoTableEl: ""
                })
                document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'none';
                if (this.props.inventoryPage == "inventoryDataEntry") {
                    this.props.toggleLarge("submit");
                }
                elInstance.destroy();
            }
            this.props.updateState("loading", false);

        } else {
            this.setState({
                inventoryBatchError: i18n.t('static.supplyPlan.validationFailed')
            })
            this.props.updateState("inventoryBatchError", i18n.t('static.supplyPlan.validationFailed'));
            this.props.updateState("loading", false);
            this.props.hideThirdComponent();
        }
    }

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

            var inventoryListUnFiltered = this.props.items.inventoryListUnFiltered;
            var iList = [];
            var adjustmentType = this.props.items.inventoryType;
            if (adjustmentType == 2) {
                iList = inventoryListUnFiltered.filter(c => c.adjustmentQty != "" && c.adjustmentQty != null && c.adjustmentQty != undefined);
            } else {
                iList = inventoryListUnFiltered.filter(c => c.actualQty != "" && c.actualQty != null && c.actualQty != undefined);
            }
            var checkDuplicateOverAll = iList.filter(c =>
                c.realmCountryPlanningUnit.id == map.get("3") &&
                moment(c.inventoryDate).format("YYYY-MM") == moment(map.get("0")).format("YYYY-MM") &&
                c.region.id == map.get("1"));
            console.log("Check Duplicate overall", checkDuplicateOverAll);
            var index = 0;

            if (checkDuplicateOverAll.length > 0) {
                console.log("In if");
                if (checkDuplicateOverAll[0].inventoryId > 0) {
                    console.log("In if consumption id is greater than 0");
                    index = inventoryListUnFiltered.findIndex(c => c.inventoryId == checkDuplicateOverAll[0].inventoryId);
                    console.log("Index", index);
                } else {
                    console.log("In ekse where consumption id is 0");
                    index = checkDuplicateOverAll[0].index;
                    console.log("Index", index);
                }
            }
            console.log("Map.get(14)", map.get("14"));
            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("3") == map.get("3") &&
                moment(c.get("0")).format("YYYY-MM") == moment(map.get("0")).format("YYYY-MM") &&
                c.get("1") == map.get("1")
            )
            console.log("Check duplicate in map", checkDuplicateInMap);
            console.log("Condition", checkDuplicateInMap.length > 1 || (checkDuplicateOverAll > 0 && index != map.get("12")));
            console.log("checkDuplicateInMap.length > 1", checkDuplicateInMap.length > 1);
            console.log("adjustmentType", adjustmentType);
            if (adjustmentType == 1 && (checkDuplicateInMap.length > 1 || (checkDuplicateOverAll.length > 0 && index != map.get("14")))) {
                console.log("In if");
                var colArr = ['D'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    if (adjustmentType == 2) {
                        inValid(colArr[c], y, i18n.t('static.supplyPlan.duplicateAdjustments'), elInstance);
                    } else {
                        inValid(colArr[c], y, i18n.t('static.supplyPlan.duplicateInventory'), elInstance);
                    }
                }
                valid = false;
                elInstance.setValueFromCoords(16, y, 1, true);
                if (adjustmentType == 2) {
                    this.props.updateState("inventoryDuplicateError", i18n.t('static.supplyPlan.duplicateAdjustments'));
                } else {
                    this.props.updateState("inventoryDuplicateError", i18n.t('static.supplyPlan.duplicateInventory'));
                }
                this.props.hideSecondComponent()
            } else {
                // openingBalance = (this.state.openingBalanceRegionWise.filter(c => c.month.month == map.get("0") && c.region.id == map.get("1"))[0]).balance;
                // consumptionQty = (this.state.consumptionFilteredArray.filter(c => c.month.month == map.get("0") && c.region.id == map.get("1"))[0]).consumptionQty;
                // adjustmentsQty += (map.get("7") * map.get("4"))
                var colArr = ['D'];
                for (var c = 0; c < colArr.length; c++) {
                    positiveValidation(colArr[c], y, elInstance);
                }
                var col = ("C").concat(parseInt(y) + 1);
                var rowData = elInstance.getRowData(y);
                var validation = checkValidtion("date", "A", y, rowData[0], elInstance);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(16, y, 1, true);
                }

                var validation = checkValidtion("text", "B", y, rowData[1], elInstance);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(16, y, 1, true);
                }

                var validation = checkValidtion("text", "C", y, rowData[2], elInstance);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(16, y, 1, true);
                }


                var validation = checkValidtion("text", "D", y, rowData[3], elInstance);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(16, y, 1, true);
                }

                if (rowData[4] == 2) {
                    var validation = checkValidtion("number", "F", y, rowData[5], elInstance, JEXCEL_NEGATIVE_INTEGER_NO_REGEX, 0, 0);
                    if (validation == false) {
                        valid = false;
                        elInstance.setValueFromCoords(16, y, 1, true);
                    } else {
                        if (rowData[5].length > 10) {
                            inValid("F", y, i18n.t('static.common.max10digittext'), elInstance);
                            valid = false;
                        } else {
                            positiveValidation("F", y, elInstance);
                        }
                    }
                    var validation = checkValidtion("text", "K", y, rowData[10], elInstance);
                    if (validation == false) {
                        valid = false;
                        elInstance.setValueFromCoords(16, y, 1, true);
                    }
                }

                if (rowData[4] == 1) {
                    var validation = checkValidtion("number", "G", y, rowData[6], elInstance, JEXCEL_INTEGER_REGEX, 1, 1);
                    if (validation == false) {
                        valid = false;
                        elInstance.setValueFromCoords(16, y, 1, true);
                    }
                }
            }
        }
        return valid;
    }

    // Save adjustments
    saveInventory() {
        // this.showOnlyErrors();
        this.props.updateState("inventoryError", "");
        this.props.updateState("loading", true);
        var validation = this.checkValidationInventory();
        console.log("Validation", validation);
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
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                this.props.updateState("color", "red");
                this.props.hideFirstComponent();
            }.bind(this);
            openRequest.onsuccess = function (e) {
                console.log("in success")
                db1 = e.target.result;
                var transaction;
                var programTransaction;
                if (this.props.inventoryPage == "whatIf") {
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
                    var inventoryDataList = (programJson.inventoryList);
                    console.log("Json.length", json.length);
                    var minDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
                    var curDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss')));
                    var curUser = AuthenticationService.getLoggedInUserId();
                    for (var i = 0; i < json.length; i++) {
                        var map = new Map(Object.entries(json[i]));
                        if (map.get("15") == 1) {
                            if (moment(map.get("0")).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                minDate = moment(map.get("0")).format("YYYY-MM-DD");
                            }
                        }
                        console.log("parseInt(map.get(14))", parseInt(map.get("14")));
                        if (parseInt(map.get("14")) != -1) {
                            console.log("Inventory darte", moment(map.get("0")).endOf('month').format("YYYY-MM-DD"));
                            console.log("Mao 5 value", (map.get("5")).toString().replaceAll("\,", ""));
                            console.log("Adjustment qty", (map.get("4") == 2) ? (map.get("5")).toString().replaceAll("\,", "") : (map.get("5")).toString().replaceAll("\,", "") > 0 ? (map.get("5")).toString().replaceAll("\,", "") : null);
                            inventoryDataList[parseInt(map.get("14"))].inventoryDate = moment(map.get("0")).endOf('month').format("YYYY-MM-DD");
                            inventoryDataList[parseInt(map.get("14"))].region.id = map.get("1");
                            inventoryDataList[parseInt(map.get("14"))].dataSource.id = map.get("2");
                            inventoryDataList[parseInt(map.get("14"))].realmCountryPlanningUnit.id = map.get("3");
                            inventoryDataList[parseInt(map.get("14"))].multiplier = map.get("7");
                            inventoryDataList[parseInt(map.get("14"))].adjustmentQty = (map.get("4") == 2) ? (map.get("5")).toString().replaceAll("\,", "") : (map.get("5")).toString().replaceAll("\,", "") != 0 ? (map.get("5")).toString().replaceAll("\,", "") : null;
                            inventoryDataList[parseInt(map.get("14"))].actualQty = (map.get("4") == 1) ? (map.get("6")).toString().replaceAll("\,", "") : (map.get("6")).toString().replaceAll("\,", "") != 0 ? (map.get("6")).toString().replaceAll("\,", "") : null;
                            inventoryDataList[parseInt(map.get("14"))].notes = map.get("10");
                            inventoryDataList[parseInt(map.get("14"))].active = map.get("11");
                            if (map.get("13") != "") {
                                inventoryDataList[parseInt(map.get("14"))].batchInfoList = map.get("13");
                            } else {
                                inventoryDataList[parseInt(map.get("14"))].batchInfoList = [];
                            }
                            if (map.get("15") == 1) {
                                inventoryDataList[parseInt(map.get("14"))].lastModifiedBy.userId = curUser;
                                inventoryDataList[parseInt(map.get("14"))].lastModifiedDate = curDate;
                            }
                        } else {
                            var batchInfoList = [];
                            if (map.get("13") != "") {
                                batchInfoList = map.get("13");
                            }
                            var inventoryJson = {
                                inventoryId: 0,
                                dataSource: {
                                    id: map.get("2")
                                },
                                region: {
                                    id: map.get("1")
                                },
                                inventoryDate: moment(map.get("0")).endOf('month').format("YYYY-MM-DD"),
                                adjustmentQty: (map.get("4") == 2) ? (map.get("5")).toString().replaceAll("\,", "") : null,
                                actualQty: (map.get("4") == 1) ? (map.get("6")).toString().replaceAll("\,", "") : null,
                                active: map.get("11"),
                                realmCountryPlanningUnit: {
                                    id: map.get("3"),
                                },
                                multiplier: map.get("7"),
                                planningUnit: {
                                    id: planningUnitId
                                },
                                notes: map.get("10"),
                                batchInfoList: batchInfoList,
                                index: inventoryDataList.length,
                                createdBy: {
                                    userId: curUser
                                },
                                createdDate: curDate,
                                lastModifiedBy: {
                                    userId: curUser
                                },
                                lastModifiedDate: curDate
                            }
                            console.log("inventioryJson", inventoryJson);
                            inventoryDataList.push(inventoryJson);
                        }
                    }
                    programJson.inventoryList = inventoryDataList;
                    this.setState({
                        programJson: programJson
                    })
                    console.log("InventoryData List", inventoryDataList);
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
                        calculateSupplyPlan(programId, planningUnitId, objectStore, "inventory", this.props, [], moment(minDate).startOf('month').format("YYYY-MM-DD"));
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.props.updateState("inventoryError", i18n.t('static.supplyPlan.validationFailed'));
            this.props.updateState("loading", false);
            this.props.hideSecondComponent();
        }
    }

    render() { return (<div></div>) }
}