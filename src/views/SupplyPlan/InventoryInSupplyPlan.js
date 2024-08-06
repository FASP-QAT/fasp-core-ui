import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import moment from "moment";
import React from "react";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { checkValidtion, inValid, jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, positiveValidation } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { ADJUSTMENT_MODIFIED, DATE_FORMAT_CAP, INDEXED_DB_NAME, INDEXED_DB_VERSION, INVENTORY_DATA_SOURCE_TYPE, INVENTORY_MODIFIED, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_NEGATIVE_INTEGER_NO_REGEX_FOR_DATA_ENTRY, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, MAX_DATE_RESTRICTION_IN_DATA_ENTRY, MIN_DATE_RESTRICTION_IN_DATA_ENTRY, SECRET_KEY } from "../../Constants";
import i18n from '../../i18n';
import AuthenticationService from "../Common/AuthenticationService";
import { calculateSupplyPlan } from "./SupplyPlanCalculations";
/**
 * This component is used to display the inventory/adjustment data in the form of table for supply plan, scenario planning, supply planning comparision and supply plan version and review screen
 */
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
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.addBatchRowInJexcel = this.addBatchRowInJexcel.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onPasteForBatchInfo = this.onPasteForBatchInfo.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.batchDetailsClicked = this.batchDetailsClicked.bind(this);
        this.formulaChanged = this.formulaChanged.bind(this)
        this.onchangepage=this.onchangepage.bind(this)
        this.state = {
            inventoryEl: "",
            inventoryBatchInfoTableEl: ""
        }
    }
    /**
     * This function is used to update the data when some records are pasted in the inventory/adjustment sheet
     * @param {*} instance This is the sheet where the data is being placed
     * @param {*} data This is the data that is being pasted
     */
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var adjustmentType = this.props.items.inventoryType;
                (instance).setValueFromCoords(8, data[i].y, `=ROUND(F${parseInt(data[i].y) + 1}*S${parseInt(data[i].y) + 1},0)`, true);
                (instance).setValueFromCoords(9, data[i].y, `=ROUND(G${parseInt(data[i].y) + 1}*S${parseInt(data[i].y) + 1},0)`, true);
                (instance).setValueFromCoords(4, data[i].y, adjustmentType, true);
                var index = (instance).getValue(`O${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(12, data[i].y, "", true);
                    (instance).setValueFromCoords(13, data[i].y, "", true);
                    (instance).setValueFromCoords(14, data[i].y, -1, true);
                    (instance).setValueFromCoords(15, data[i].y, 1, true);
                    (instance).setValueFromCoords(16, data[i].y, 0, true);
                    z = data[i].y;
                }
            }
            if (data[i].x == 0 && data[i].value != "") {
                (instance).setValueFromCoords(0, data[i].y, moment(data[i].value).format("YYYY-MM-DD"), true);
            }
            if (data[i].x == 3) {
                var aruList = this.state.realmCountryPlanningUnitList.filter(c => (c.name == data[i].value || getLabelText(c.label, this.state.lang) == data[i].value) && c.active.toString() == "true");
                if (aruList.length > 0) {
                    (instance).setValueFromCoords(3, data[i].y, aruList[0].id, true);
                }
            }
            if (data[i].x == 2) {
                var dsList = this.state.dataSourceList.filter(c => (c.name == data[i].value || getLabelText(c.label, this.state.lang) == data[i].value) && c.active.toString() == "true");
                if (dsList.length > 0) {
                    (instance).setValueFromCoords(2, data[i].y, dsList[0].id, true);
                }
            }
        }
    }
    /**
     * This function is used when the editing for a particular cell is completed to format the cell
     * @param {*} instance This is the sheet where the data is being updated
     * @param {*} cell This is the value of the cell whose value is being updated
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} value This is the updated value
     */
    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance;
        var rowData = elInstance.getRowData(y);
        if (x == 5 && !isNaN(rowData[5]) && rowData[5].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(5, y, parseFloat(rowData[5]), true);
        } else if (x == 6 && !isNaN(rowData[6]) && rowData[6].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(6, y, parseFloat(rowData[6]), true);
        } else if (x == 8 && !isNaN(rowData[8]) && rowData[8].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(8, y, parseFloat(rowData[8]), true);
        } else if (x == 9 && !isNaN(rowData[9]) && rowData[9].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(9, y, parseFloat(rowData[9]), true);
        }
    }
    /**
     * This function is used to update the data when some records are pasted in the inventory/adjustment batch info sheet
     * @param {*} instance This is the sheet where the data is being placed
     * @param {*} data This is the data that is being pasted
     */
    onPasteForBatchInfo(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`F${parseInt(data[i].y) + 1}`, true);
                if (index === "" || index == null || index == undefined) {
                    var rowData = (instance).getRowData(0);
                    (instance).setValueFromCoords(2, data[i].y, rowData[2], true);
                    (instance).setValueFromCoords(5, data[i].y, 0, true);
                    (instance).setValueFromCoords(6, data[i].y, rowData[6], true);
                    (instance).setValueFromCoords(7, data[i].y, rowData[7], true);
                    z = data[i].y;
                }
            }
        }
    }
    /**
     * This function is used to build the Jexcel table with all the data based on the filters and based on all the dropdowns
     */
    showInventoryData() {
        var realmId = AuthenticationService.getRealmId();
        var planningUnitId = document.getElementById("planningUnitId").value;
        var inventoryListUnFiltered = this.props.items.inventoryListUnFiltered;
        var inventoryList = this.props.items.inventoryList;
        var programJson = this.props.items.programJson;
        var generalProgramJson = this.props.items.generalProgramJson;
        var db1;
        var dataSourceList = [];
        var realmCountryPlanningUnitList = [];
        var myVar = "";
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
            this.props.updateState("color", "#BA0C2F");
            this.props.hideFirstComponent();
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var realmTransaction = db1.transaction(['realm'], 'readwrite');
            var realmOS = realmTransaction.objectStore('realm');
            var realmRequest = realmOS.get(realmId);
            realmRequest.onsuccess = function (event) {
            var rcpuTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
            var rcpuOs = rcpuTransaction.objectStore('realmCountryPlanningUnit');
            var rcpuRequest = rcpuOs.getAll();
            rcpuRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                this.props.updateState("color", "#BA0C2F");
                this.props.hideFirstComponent();
            }.bind(this);
            rcpuRequest.onsuccess = function (event) {
                var rcpuResult = [];
                rcpuResult = rcpuRequest.result;
                for (var k = 0; k < rcpuResult.length; k++) {
                    if (rcpuResult[k].realmCountry.id == generalProgramJson.realmCountry.realmCountryId && rcpuResult[k].planningUnit.id == document.getElementById("planningUnitId").value && rcpuResult[k].realmCountryPlanningUnitId != 0) {
                        var rcpuJson = {
                            name: getLabelText(rcpuResult[k].label, this.props.items.lang),
                            id: rcpuResult[k].realmCountryPlanningUnitId,
                            multiplier: rcpuResult[k].multiplier,
                            active: rcpuResult[k].active,
                            conversionNumber:rcpuResult[k].conversionNumber,
                            conversionMethod:rcpuResult[k].conversionMethod,
                        }
                        realmCountryPlanningUnitList.push(rcpuJson);
                    }
                }
                var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                var dataSourceRequest = dataSourceOs.getAll();
                dataSourceRequest.onerror = function (event) {
                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                    this.props.updateState("color", "#BA0C2F");
                    this.props.hideFirstComponent();
                }.bind(this);
                dataSourceRequest.onsuccess = function (event) {
                    var dataSourceResult = [];
                    dataSourceResult = dataSourceRequest.result;
                    for (var k = 0; k < dataSourceResult.length; k++) {
                        if (dataSourceResult[k].program == null || dataSourceResult[k].program.id == generalProgramJson.programId || dataSourceResult[k].program.id == 0) {
                            if (dataSourceResult[k].realm.id == generalProgramJson.realmCountry.realm.realmId && dataSourceResult[k].dataSourceType.id == INVENTORY_DATA_SOURCE_TYPE) {
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
                    if (this.state.inventoryEl != "" && this.state.inventoryEl != undefined) {
                        jexcel.destroy(document.getElementById("adjustmentsTable"), true);
                    }
                    if (this.state.inventoryBatchInfoTableEl != "" && this.state.inventoryBatchInfoTableEl != undefined) {
                        jexcel.destroy(document.getElementById("inventoryBatchInfoTable"), true);
                    }
                    if (this.props.useLocalData == 0) {
                        dataSourceList = this.props.items.dataSourceList;
                    }
                    if (this.props.useLocalData == 0) {
                        realmCountryPlanningUnitList = this.props.items.realmCountryPlanningUnitList;
                    }
                    this.setState({
                        realmCountryPlanningUnitList: realmCountryPlanningUnitList,
                        dataSourceList: dataSourceList,
                        realm:realmRequest.result
                    }, () => {
                        this.props.updateState("dataSourceList", dataSourceList);
                        this.props.updateState("realmCountryPlanningUnitList", realmCountryPlanningUnitList);
                        this.props.updateState("realm", realmRequest.result);
                    })
                    var data = [];
                    var inventoryDataArr = [];
                    var adjustmentType = this.props.items.inventoryType;
                    var adjustmentColumnType = "text";
                    var adjustmentVisible = false;
                    if (adjustmentType == 2) {
                        adjustmentColumnType = "numeric"
                        adjustmentVisible = true;
                    }
                    var actualVisible = false;
                    var actualColumnType = "hidden";
                    if (adjustmentType == 1) {
                        actualColumnType = "numeric";
                        actualVisible = true;
                    }
                    var inventoryEditable = true;
                    if (this.props.inventoryPage == "supplyPlanCompare") {
                        inventoryEditable = false;
                    }
                    var roleList = AuthenticationService.getLoggedInUserRole();
                    if ((roleList.length == 1 && roleList[0].roleId == 'ROLE_GUEST_USER') || this.props.items.programQPLDetails.filter(c => c.id == this.props.items.programId)[0].readonly) {
                        inventoryEditable = false;
                    }
                    if (document.getElementById("addInventoryRowSupplyPlan") != null && this.props.inventoryPage != "supplyPlanCompare" && this.props.inventoryPage != "inventoryDataEntry" && inventoryEditable == false) {
                        document.getElementById("addInventoryRowSupplyPlan").style.display = "none";
                    } else if (document.getElementById("addInventoryRowSupplyPlan") != null && this.props.inventoryPage != "supplyPlanCompare" && this.props.inventoryPage != "inventoryDataEntry" && inventoryEditable == true) {
                        document.getElementById("addInventoryRowSupplyPlan").style.display = "block";
                    }
                    var paginationOption = false;
                    var searchOption = false;
                    var paginationArray = [];
                    var filterOption = false;
                    if (this.props.inventoryPage == "inventoryDataEntry") {
                        paginationOption = localStorage.getItem("sesRecordCount");
                        searchOption = true;
                        paginationArray = JEXCEL_PAGINATION_OPTION;
                        filterOption = true;
                    }
                    var readonlyRegionAndMonth = true;
                    if (this.props.inventoryPage == "inventoryDataEntry") {
                        readonlyRegionAndMonth = false;
                    }
                    inventoryList = inventoryList.sort(function (a, b) { return ((new Date(a.inventoryDate) - new Date(b.inventoryDate)) || (a.region.id - b.region.id) || (a.realmCountryPlanningUnit.id - b.realmCountryPlanningUnit.id)) })
                    for (var j = 0; j < inventoryList.length; j++) {
                        var rcpuForTable=realmCountryPlanningUnitList.filter(c=>c.id==inventoryList[j].realmCountryPlanningUnit.id);
                        data = [];
                        data[0] = inventoryList[j].inventoryDate; 
                        data[1] = inventoryList[j].region.id; 
                        data[2] = inventoryList[j].dataSource.id; 
                        data[3] = inventoryList[j].realmCountryPlanningUnit.id; 
                        data[4] = adjustmentType; 
                        data[5] = Math.round(inventoryList[j].adjustmentQty); 
                        data[6] = Math.round(inventoryList[j].actualQty); 
                        data[7] = (rcpuForTable[0].conversionMethod==1?"*":"/")+rcpuForTable[0].conversionNumber.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                        data[8] = `=ROUND(F${parseInt(j) + 1}*S${parseInt(j) + 1},0)`; 
                        data[9] = `=ROUND(G${parseInt(j) + 1}*S${parseInt(j) + 1},0)`; 
                        if (inventoryList[j].notes === null || ((inventoryList[j].notes) == "NULL")) {
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
                            index = inventoryList[j].index;
                        }
                        data[14] = index;
                        data[15] = 0;
                        data[16] = 0;
                        data[17] = inventoryList[j].inventoryId;
                        data[18] = inventoryList[j].multiplier; 
                        inventoryDataArr[j] = data;
                    }
                    var regionList = this.props.items.regionList;
                    if (inventoryList.length == 0 && inventoryEditable) {
                        data = [];
                        if (this.props.inventoryPage != "inventoryDataEntry") {
                            data[0] = moment(this.props.items.inventoryEndDate).endOf('month').format("YYYY-MM-DD"); 
                            data[1] = this.props.items.inventoryRegion; 
                        } else {
                            data[0] = "";
                            data[1] = regionList.length == 1 ? regionList[0].id : "";
                        }
                        data[2] = ""; 
                        data[3] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].id : ""; 
                        data[4] = adjustmentType; 
                        data[5] = ""; 
                        data[6] = ""; 
                        data[7] = realmCountryPlanningUnitList.length == 1 ? (realmCountryPlanningUnitList[0].conversionMethod==1?"*":"/")+realmCountryPlanningUnitList[0].conversionNumber.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : "";; 
                        data[8] = `=ROUND(F${parseInt(0) + 1}*S${parseInt(0) + 1},0)`; 
                        data[9] = `=ROUND(G${parseInt(0) + 1}*S${parseInt(0) + 1},0)`; 
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
                        data[17] = 0;
                        data[18] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].multiplier : ""; 
                        inventoryDataArr[0] = data;
                    }
                    this.setState({
                        inventoryAllJson: inventoryDataArr
                    })
                    var options = {
                        data: inventoryDataArr,
                        columnDrag: false,
                        columns: [
                            { title: i18n.t('static.inventory.inventoryDate'), type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker', validRange: [moment(MIN_DATE_RESTRICTION_IN_DATA_ENTRY).startOf('month').format("YYYY-MM-DD"), moment(Date.now()).add(MAX_DATE_RESTRICTION_IN_DATA_ENTRY, 'years').endOf('month').format("YYYY-MM-DD")] }, width: 80, readOnly: readonlyRegionAndMonth },
                            { title: i18n.t('static.region.region'), type: 'autocomplete', readOnly: readonlyRegionAndMonth, source: this.props.items.regionList, width: 100 },
                            { title: i18n.t('static.inventory.dataSource'), type: 'autocomplete', source: dataSourceList, width: 180, filter: this.filterDataSource },
                            { title: i18n.t('static.supplyPlan.alternatePlanningUnit'), type: 'autocomplete', source: realmCountryPlanningUnitList, filter: this.filterRealmCountryPlanningUnit, width: 180 },
                            { title: i18n.t('static.supplyPlan.inventoryType'), type: 'autocomplete', source: [{ id: 1, name: i18n.t('static.inventory.inventory') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }], readOnly: true, width: 100 },
                            { title: adjustmentVisible ? i18n.t('static.supplyPlan.quantityCountryProduct') : "", type: adjustmentColumnType, visible: adjustmentVisible, mask: '[-]#,##', textEditor: true, disabledMaskOnEdition: true, width: 120, autoCasting: false },
                            { title: actualVisible ? i18n.t('static.supplyPlan.quantityCountryProduct') : "", type: actualColumnType, visible: actualVisible, mask: '#,##', textEditor: true, disabledMaskOnEdition: true, decimal: '.', width: 120, autoCasting: false },
                            { title: i18n.t('static.unit.multiplierFromARUTOPU'), type: 'text', width: 100, readOnly: true },
                            { title: adjustmentVisible ? i18n.t('static.supplyPlan.quantityQATProduct') : "", type: adjustmentColumnType, visible: adjustmentVisible, mask: '[-]#,##.00', decimal: '.', width: 120, readOnly: true, autoCasting: false },
                            { title: actualVisible ? i18n.t('static.supplyPlan.quantityQATProduct') : "", type: actualColumnType, visible: actualVisible, mask: '#,##.00', decimal: '.', width: 120, readOnly: true, autoCasting: false },
                            { title: i18n.t('static.program.notes'), type: 'text', width: 400 },
                            { title: i18n.t('static.inventory.active'), type: 'checkbox', width: 100, readOnly: !inventoryEditable },
                            {
                                type: 'text', visible: false,
                                readOnly: true, autoCasting: false
                            },
                            {
                                type: 'text',
                                readOnly: true, visible: false, autoCasting: false
                            },
                            {
                                type: 'text',
                                readOnly: true, visible: false, autoCasting: false
                            },
                            {
                                type: 'text',
                                readOnly: true, visible: false, autoCasting: false
                            },
                            {
                                type: 'text',
                                readOnly: true, visible: false, autoCasting: false
                            },
                            {
                                type: 'text',
                                readOnly: true, visible: false, autoCasting: false
                            },
                            { type: 'text', visible: false, width: 0, readOnly: true, autoCasting: false },
                        ],
                        pagination: paginationOption,
                        paginationOptions: paginationArray,
                        search: searchOption,
                        columnSorting: true,
                        wordWrap: true,
                        allowInsertColumn: false,
                        allowManualInsertColumn: false,
                        allowDeleteRow: true,
                        allowManualInsertRow: false,
                        allowExport: false,
                        copyCompatibility: true,
                        parseFormulas: true,
                        filters: filterOption,
                        license: JEXCEL_PRO_KEY,
                        onpaste: this.onPaste,
                        oneditionend: this.oneditionend,
                        onchangepage: this.onchangepage,
                        onload: this.loadedInventory,
                        editable: inventoryEditable,
                        onformulachain: this.formulaChanged,
                        onchange: this.inventoryChanged,
                        updateTable: function (el, cell, x, y, source, value, id) {
                        }.bind(this),
                        onsearch: function (el) {
                        },
                        onfilter: function (el) {
                        },
                        contextMenu: function (obj, x, y, e) {
                            var items = [];
                            if (y == null) {
                            } else {
                                var rowData = obj.getRowData(y)
                                if (rowData[4] != "" && rowData[0] != "" && rowData[1] != "" && rowData[3] != "") {
                                    items.push({
                                        title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                        onclick: function () {
                                            this.batchDetailsClicked(obj, x, y, e, inventoryEditable)
                                        }.bind(this)
                                    });
                                }
                                if (obj.options.allowInsertRow == true) {
                                    var json = obj.getJson(null, false);
                                    if (inventoryEditable) {
                                        items.push({
                                            title: this.props.items.inventoryType == 1 ? i18n.t('static.supplyPlan.addNewInventory') : i18n.t('static.supplyPlan.addNewAdjustments'),
                                            onclick: function () {
                                                this.addRowInJexcel();
                                            }.bind(this)
                                        });
                                    }
                                    if (inventoryEditable && obj.options.allowDeleteRow == true && obj.getJson(null, false).length > 1) {
                                        if (obj.getRowData(y)[14] == -1) {
                                            items.push({
                                                title: i18n.t("static.common.deleterow"),
                                                onclick: function () {
                                                    this.props.updateState("inventoryChangedFlag", 1);
                                                    obj.deleteRow(parseInt(y));
                                                }.bind(this)
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
    }.bind(this);
    }
    /**
     * This function is used when user clicks on the show batch details for a particular inventory/adjustment record
     * @param {*} obj This is the sheet where the data is being updated
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} e This is mouse event handler
     * @param {*} inventoryEditable This is the value of the flag that indicates whether table should be editable or not
     */
    batchDetailsClicked(obj, x, y, e, inventoryEditable) {
        var rowData = obj.getRowData(y);
        this.props.updateState("loading", true);
        if (this.props.inventoryPage == "inventoryDataEntry") {
            this.props.toggleLarge();
        }
        var batchList = [];
        var date = moment(rowData[0]).startOf('month').format("YYYY-MM-DD");
        var batchInfoList = (this.props.items.batchInfoList).filter(c => c.autoGenerated.toString() == "false");
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
                    name: batchInfoList[k].batchNo + "~" + moment(batchInfoList[k].expiryDate).format("YYYY-MM-DD"),
                    id: batchInfoList[k].batchNo + "~" + moment(batchInfoList[k].expiryDate).format("YYYY-MM-DD"),
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
            jexcel.destroy(document.getElementById("inventoryBatchInfoTable"), true);
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
            inventoryQty = obj.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim()
        } else {
            inventoryQty = obj.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim();
        }
        var inventoryBatchInfoQty = 0;
        var inventoryBatchEditable = inventoryEditable;
        var lastEditableDate = "";
        lastEditableDate = moment(Date.now()).subtract(this.state.realm.inventoryMonthsInPast + 1, 'months').format("YYYY-MM-DD");
        if (moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && rowData[14] != -1 && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
            inventoryBatchEditable = false;
        }
        if (document.getElementById("showInventoryBatchInfoButtonsDiv") != null) {
            document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'block';
        }
        if (document.getElementById("inventoryBatchAddRow") != null) {
            if (this.props.inventoryPage != "supplyPlanCompare") {
                if (inventoryBatchEditable == false) {
                    document.getElementById("inventoryBatchAddRow").style.display = "none";
                } else {
                    document.getElementById("inventoryBatchAddRow").style.display = "block";
                }
            }
        }
        for (var sb = 0; sb < batchInfo.length; sb++) {
            var data = [];
            data[0] = batchInfo[sb].batch.batchNo + "~" + moment(batchInfo[sb].batch.expiryDate).format("YYYY-MM-DD"); 
            data[1] = moment(batchInfo[sb].batch.expiryDate).format(DATE_FORMAT_CAP);
            data[2] = adjustmentType; 
            data[3] = Number(batchInfo[sb].adjustmentQty); 
            data[4] = Number(batchInfo[sb].actualQty); 
            data[5] = batchInfo[sb].inventoryTransBatchInfoId; 
            data[6] = y; 
            data[7] = date;
            if (adjustmentType == 1) {
                inventoryBatchInfoQty += Number(batchInfo[sb].actualQty);
            } else {
                inventoryBatchInfoQty += Number(batchInfo[sb].adjustmentQty);
            }
            json.push(data);
        }
        if ((adjustmentType == 1 && Number(inventoryQty) > inventoryBatchInfoQty) ||
            (adjustmentType == 2 && Number(inventoryBatchInfoQty) > 0 ? Number(inventoryBatchInfoQty) < Number(inventoryQty) : Number(inventoryBatchInfoQty) > Number(inventoryQty)) || Number(inventoryBatchInfoQty) == 0) {
            var qty = Number(inventoryQty) - Number(inventoryBatchInfoQty);
            var data = [];
            data[0] = -1; 
            data[1] = "";
            data[2] = adjustmentType; 
            if (adjustmentType == 1) {
                data[3] = ""; 
                data[4] = qty; 
            } else {
                data[3] = qty; 
                data[4] = ""; 
            }
            data[5] = 0; 
            data[6] = y; 
            data[7] = date;
            json.push(data);
        }
        var options = {
            data: json,
            columnDrag: false,
            columns: [
                { title: i18n.t('static.supplyPlan.batchId'), type: 'autocomplete', source: batchList, filter: this.filterBatchInfoForExistingDataForInventory, width: 100 },
                { title: i18n.t('static.supplyPlan.expiryDate'), type: 'text', readOnly: true, width: 150 },
                { title: i18n.t('static.supplyPlan.adjustmentType'), type: 'hidden', source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }], readOnly: true },
                { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: adjustmentColumnType, mask: '[-]#,##', textEditor: true, disabledMaskOnEdition: true, width: 80 },
                { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: actualColumnType, mask: '#,##', textEditor: true, disabledMaskOnEdition: true, width: 80 },
                { title: i18n.t('static.supplyPlan.inventoryTransBatchInfoId'), type: 'hidden', width: 0 },
                { title: i18n.t('static.supplyPlan.rowNumber'), type: 'hidden', width: 0 },
                { type: 'hidden' }
            ],
            pagination: false,
            search: false,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: true,
            copyCompatibility: true,
            allowInsertRow: true,
            allowManualInsertRow: false,
            allowExport: false,
            onpaste: this.onPasteForBatchInfo,
            onchange: this.batchInfoChangedInventory,
            copyCompatibility: true,
            parseFormulas: true,
            editable: inventoryBatchEditable,
            onload: this.loadedBatchInfoInventory,
            license: JEXCEL_PRO_KEY,
            updateTable: function (el, cell, x, y, source, value, id) {
            }.bind(this),
            contextMenu: function (obj, x, y, e) {
                var items = [];
                var items = [];
                if (y == null) {
                } else {
                    var adjustmentType = this.props.items.inventoryType;
                    if (inventoryEditable) {
                        items.push({
                            title: i18n.t('static.supplyPlan.addNewBatchInfo'),
                            onclick: function () {
                                this.addBatchRowInJexcel();
                            }.bind(this)
                        });
                    }
                    if (inventoryEditable && obj.options.allowDeleteRow == true) {
                        if (obj.getRowData(y)[5] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    if (obj.getJson(null, false).length == 1) {
                                        var adjustmentType = this.props.items.inventoryType;
                                        var rowData = obj.getRowData(0);
                                        var inventoryQty = 0;
                                        if (adjustmentType == 1) {
                                            inventoryQty = (this.state.inventoryEl).getValue(`G${parseInt(rowData[6]) + 1}`, true).toString().replaceAll("\,", "").trim()
                                        } else {
                                            inventoryQty = (this.state.inventoryEl).getValue(`F${parseInt(rowData[6]) + 1}`, true).toString().replaceAll("\,", "").trim();
                                        }
                                        var rd = obj.getRowData(0);
                                        var data = [];
                                        var adjustmentType = this.props.items.inventoryType;
                                        var data = [];
                                        data[0] = -1;
                                        data[1] = "";
                                        data[2] = adjustmentType;
                                        if (adjustmentType == 1) {
                                            data[3] = ""; 
                                            data[4] = inventoryQty; 
                                        } else {
                                            data[3] = inventoryQty; 
                                            data[4] = ""; 
                                        }
                                        data[5] = 0;
                                        data[6] = rowData[6];
                                        data[7] = rowData[7];
                                        obj.insertRow(data);
                                    }
                                    this.props.updateState("inventoryBatchInfoChangedFlag", 1);
                                    obj.deleteRow(parseInt(y));
                                }.bind(this)
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
    }
    /**
     * This function is used when users click on the add row in the inventory/adjustment table
     */
    addRowInJexcel() {
        var obj = this.state.inventoryEl;
        var json = obj.getJson(null, false);
        var map = new Map(Object.entries(json[0]));
        var regionList = (this.props.items.regionList);
        var realmCountryPlanningUnitList = this.state.realmCountryPlanningUnitList;
        var data = [];
        if (this.props.inventoryPage != "inventoryDataEntry") {
            data[0] = moment(this.props.items.inventoryEndDate).format("YYYY-MM-DD"); 
            data[1] = this.props.items.inventoryRegion; 
        } else {
            data[0] = "";
            data[1] = regionList.length == 1 ? regionList[0].id : "";
        }
        data[2] = ""; 
        data[3] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].id : ""; 
        data[4] = map.get("4"); 
        data[5] = ""; 
        data[6] = ""; 
        data[7] = realmCountryPlanningUnitList.length == 1 ? (realmCountryPlanningUnitList[0].conversionMethod==1?"*":"/")+realmCountryPlanningUnitList[0].conversionNumber.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : "";; 
        data[8] = `=ROUND(F${parseInt(json.length) + 1}*S${parseInt(json.length) + 1},0)`; 
        data[9] = `=ROUND(G${parseInt(json.length) + 1}*S${parseInt(json.length) + 1},0)`;
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
        data[17] = 0;
        data[18] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].multiplier : ""; 
        obj.insertRow(data);
        if (this.props.inventoryPage == "inventoryDataEntry") {
            var showOption = (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
            if (showOption != 5000000) {
                var pageNo = parseInt(parseInt(json.length - 1) / parseInt(showOption));
                obj.page(pageNo);
            }
        }
    }
    /**
     * This function is used when users click on the add row in the inventory/adjustment batch table
     */
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
    /**
     * This function is used to filter the data source list based on active flag
     */
    filterDataSource = function (instance, cell, c, r, source) {
        return this.state.dataSourceList.filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
    }.bind(this)
    /**
     * This function is used to filter the alternate reporting unit list based on active flag
     */
    filterRealmCountryPlanningUnit = function (instance, cell, c, r, source) {
        return this.state.realmCountryPlanningUnitList.filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
    }.bind(this)
    /**
     * This function is used to format the inventory/adjustment table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedInventory = function (instance, cell) {
        if (this.props.inventoryPage != "inventoryDataEntry") {
            jExcelLoadedFunctionOnlyHideRow(instance);
        } else {
            jExcelLoadedFunction(instance);
        }
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[2].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[7].classList.add('AsteriskTheadtrTd');
        tr.children[8].classList.add('InfoTr');
        tr.children[8].title = i18n.t('static.dataentry.conversionFactorTooltip')
        if (this.props.items.inventoryType == 2) {
            tr.children[11].classList.add('AsteriskTheadtrTd');
        }
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson(null, false);
        var jsonLength;
        if (this.props.inventoryPage == "inventoryDataEntry") {
            if ((document.getElementsByClassName("jss_pagination_dropdown")[0] != undefined)) {
                jsonLength = 1 * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
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
        for (var z = 0; z < jsonLength; z++) {
            var rowData = elInstance.getRowData(z);
            var lastEditableDate = moment(Date.now()).subtract(this.state.realm.inventoryMonthsInPast + 1, 'months').format("YYYY-MM-DD");
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q']
            if (rowData[14] != -1 && rowData[14] !== "" && rowData[14] != undefined && moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
                if (rowData[17] > 0) {
                for (var c = 0; c < colArr.length; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(z) + 1))
                    cell.classList.add('readonly');
                }
                }
                if (rowData[11] == false) {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(z) + 1))
                        cell.classList.add('shipmentEntryDoNotInclude');
                    }
                } else {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(z) + 1))
                        cell.classList.remove('shipmentEntryDoNotInclude');
                    }
                }
            } else {
                if (rowData[11] == false) {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(z) + 1))
                        cell.classList.add('shipmentEntryDoNotInclude');
                    }
                } else {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(z) + 1))
                        cell.classList.remove('shipmentEntryDoNotInclude');
                    }
                }
            }
        }
    }
    /**
     * This function is called when page is changed to make some cells readonly based on multiple condition
     * @param {*} el This is the DOM Element where sheet is created
     * @param {*} pageNo This the page number which is clicked
     * @param {*} oldPageNo This is the last page number that user had selected
     */
    onchangepage(el, pageNo, oldPageNo) {
        var elInstance = el;
        var json = elInstance.getJson(null, false);
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q']
        var jsonLength = (pageNo + 1) * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        if (jsonLength == undefined) {
            jsonLength = 15
        }
        if (json.length < jsonLength) {
            jsonLength = json.length;
        }
        var start = pageNo * (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
        for (var i = start; i < jsonLength; i++) {
            var rowData = elInstance.getRowData(i);
            var lastEditableDate = moment(Date.now()).subtract(this.state.realm.inventoryMonthsInPast + 1, 'months').format("YYYY-MM-DD");
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q']
            if (rowData[14] != -1 && rowData[14] !== "" && rowData[14] != undefined && moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
                if (rowData[17] > 0) {
                for (var c = 0; c < colArr.length; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(i) + 1))
                    cell.classList.add('readonly');
                }
                }
                if (rowData[11] == false) {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(i) + 1))
                        cell.classList.add('shipmentEntryDoNotInclude');
                    }
                } else {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(i) + 1))
                        cell.classList.remove('shipmentEntryDoNotInclude');
                    }
                }
            } else {
                if (rowData[11] == false) {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(i) + 1))
                        cell.classList.add('shipmentEntryDoNotInclude');
                    }
                } else {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(i) + 1))
                        cell.classList.remove('shipmentEntryDoNotInclude');
                    }
                }
            }
        }
    }
    /**
     * This function is used when some value of the formula cell is changed
     * @param {*} instance This is the object of the DOM element
     * @param {*} executions This is object of the formula cell that is being edited
     */
    formulaChanged = function (instance, executions) {
        var executions = executions;
        for (var e = 0; e < executions.length; e++) {
            this.inventoryChanged(instance, executions[e].cell, executions[e].x, executions[e].y, executions[e].v)
        }
    }
    /**
     * This function is called when something in the inventory/adjustment table is changed to add the validations or fill some auto values for the cells
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} value This is the updated value
     */
    inventoryChanged = function (instance, cell, x, y, value) {
        var elInstance = this.state.inventoryEl;
        var rowData = elInstance.getRowData(y);
        this.props.updateState("inventoryError", "");
        this.props.updateState("inventoryDuplicateError", "");
        if (x == 0 || x == 1 || x == 2 || x == 3 || x == 5 || x == 6 || x == 10 || x == 11) {
            this.props.updateState("inventoryChangedFlag", 1);
        }
        if (x == 0 || x == 14 || x == 11) {
            var rowData = elInstance.getRowData(y);
            var lastEditableDate = moment(Date.now()).subtract(this.state.realm.inventoryMonthsInPast + 1, 'months').format("YYYY-MM-DD");
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q']
            if (rowData[14] != -1 && rowData[14] !== "" && rowData[14] != undefined && moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
                if (rowData[17] > 0) {
                for (var c = 0; c < colArr.length; c++) {
                    var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                    cell.classList.add('readonly');
                }
                }
            } else {
                if (rowData[11] == false) {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                        cell.classList.add('shipmentEntryDoNotInclude');
                    }
                } else {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                        cell.classList.remove('shipmentEntryDoNotInclude');
                    }
                }
            }
        }
        if (x != 15 && x != 16) {
            elInstance.setValueFromCoords(16, y, 0, true);
        }
        if (x != 15) {
            elInstance.setValueFromCoords(15, y, 1, true);
        }
        if (x == 0) {
            var valid = checkValidtion("dateWithInvalidDataEntry", "A", y, rowData[0], elInstance, "", "", "", 0);
            if (valid == false) {
                elInstance.setValueFromCoords(16, y, 1, true);
            } else {
                if (rowData[4] == 1) {
                    if (moment(rowData[0]).format("YYYY-MM") > moment(Date.now()).format("YYYY-MM")) {
                        inValid("A", y, i18n.t('static.inventory.notAllowedForFutureMonths'), elInstance);
                    } else {
                        positiveValidation("A", y, elInstance);
                    }
                }
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
            elInstance.setValueFromCoords(18, y, "", true);
            var valid = checkValidtion("text", "D", y, rowData[3], elInstance);
            if (valid == true) {
                var rcpuForTable = (this.state.realmCountryPlanningUnitList.filter(c => c.id == rowData[3].toString().split(";")[0])[0]);
                elInstance.setValueFromCoords(7, y, (rcpuForTable.conversionMethod==1?"*":"/")+rcpuForTable.conversionNumber.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), true);
                elInstance.setValueFromCoords(18, y, rcpuForTable.multiplier, true);
            }
            if (valid == false) {
                elInstance.setValueFromCoords(16, y, 1, true);
            }
        }
        if (x == 5) {
            if (rowData[4] == 2) {
                var valid = checkValidtion("number", "F", y, elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim(), elInstance, JEXCEL_NEGATIVE_INTEGER_NO_REGEX_FOR_DATA_ENTRY, 0, 0);
                if (valid == false) {
                    elInstance.setValueFromCoords(16, y, 1, true);
                } else {
                    if (elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim().length > 15) {
                        inValid("F", y, i18n.t('static.common.max15digittext'), elInstance);
                    } else {
                        positiveValidation("F", y, elInstance);
                        var batchDetails = rowData[13];
                        var adjustmentBatchQty = 0;
                        for (var b = 0; b < batchDetails.length; b++) {
                            adjustmentBatchQty += Number(batchDetails[b].adjustmentQty);
                        }
                        if (batchDetails.length > 0 && (Number(adjustmentBatchQty) > 0 ? Number(adjustmentBatchQty) > Number(elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim()) : Number(adjustmentBatchQty) < Number(elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim()))) {
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
                var valid = checkValidtion("number", "G", y, elInstance.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim(), elInstance, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, 1, 1);
                if (valid == false) {
                    elInstance.setValueFromCoords(16, y, 1, true);
                } else {
                    var batchDetails = rowData[13];
                    var actualBatchQty = 0;
                    for (var b = 0; b < batchDetails.length; b++) {
                        actualBatchQty += Number(batchDetails[b].actualQty);
                    }
                    if (batchDetails.length > 0 && Number(elInstance.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim()) < Number(actualBatchQty)) {
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
                    adjustmentBatchQty += Number(batchDetails[b].adjustmentQty);
                }
                if (batchDetails.length > 0 && (Number(adjustmentBatchQty) > 0 ? Number(adjustmentBatchQty) > Number(elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim()) : Number(adjustmentBatchQty) < Number(elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim()))) {
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
                    actualBatchQty += Number(batchDetails[b].actualQty);
                }
                if (batchDetails.length > 0 && Number(elInstance.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim()) < Number(actualBatchQty)) {
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
                if (valid == true) {
                    if (rowData[10].length > 600) {
                        inValid("K", y, i18n.t('static.dataentry.notesMaxLength'), elInstance);
                    } else {
                        positiveValidation("K", y, elInstance);
                    }
                }
            } else {
                if (rowData[10].length > 600) {
                    inValid("K", y, i18n.t('static.dataentry.notesMaxLength'), elInstance);
                } else {
                    positiveValidation("K", y, elInstance);
                }
            }
        }
    }
    /**
     * This function is used to filter the batch list based on expiry date and created date
     */
    filterBatchInfoForExistingDataForInventory = function (instance, cell, c, r, source) {
        var mylist = [];
        var date = (this.state.inventoryBatchInfoTableEl.getJson(null, false)[r])[7]
        mylist = this.state.batchInfoList.filter(c => c.id == 0 || c.id != -1 && (moment(c.expiryDate).format("YYYY-MM") > moment(date).format("YYYY-MM") && moment(c.createdDate).format("YYYY-MM") <= moment(date).format("YYYY-MM")));
        return mylist;
    }.bind(this)
    /**
     * This function is used to format the inventory/adjustment batch info table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedBatchInfoInventory = function (instance, cell) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[4].classList.add('AsteriskTheadtrTd');
        tr.children[5].classList.add('AsteriskTheadtrTd');
    }
    /**
     * This function is called when something in the inventory/adjustment batch info table is changed to add the validations or fill some auto values for the cells
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} value This is the updated value
     */
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
                if (value != -1) {
                    var expiryDate = this.props.items.batchInfoList.filter(c => (c.batchNo == (elInstance.getCell(`A${parseInt(y) + 1}`).innerText).split("~")[0] && moment(c.expiryDate).format("YYYY-MM") == moment((elInstance.getCell(`A${parseInt(y) + 1}`).innerText).split("~")[1]).format("YYYY-MM")))[0].expiryDate;
                    elInstance.setValueFromCoords(1, y, moment(expiryDate).format(DATE_FORMAT_CAP), true);
                } else {
                    elInstance.setValueFromCoords(1, y, "", true);
                }
            }
        }
        if (x == 3) {
            if (rowData[2] == 2) {
                var valid = checkValidtion("number", "D", y, elInstance.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim(), elInstance, JEXCEL_NEGATIVE_INTEGER_NO_REGEX_FOR_DATA_ENTRY, 0, 0);
                if (valid == true) {
                    if (elInstance.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim().length > 15) {
                        inValid("D", y, i18n.t('static.common.max15digittext'), elInstance);
                    } else {
                        positiveValidation("D", y, elInstance);
                    }
                }
            }
        }
        if (x == 4) {
            if (rowData[2] == 1) {
                checkValidtion("number", "E", y, elInstance.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim(), elInstance, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, 1, 0);
            }
        }
    }
    /**
     * This function is called before saving the inventory/adjustment batch info to check validations for all the rows that are available in the table
     * @returns This functions return true or false. It returns true if all the data is sucessfully validated. It returns false if some validation fails.
     */
    checkValidationInventoryBatchInfo() {
        var valid = true;
        var elInstance = this.state.inventoryBatchInfoTableEl;
        var json = elInstance.getJson(null, false);
        var mapArray = [];
        var rowNumber = json[0][6];
        var adjustmentType = json[0][2];
        var totalActualStock = 0;
        var totalAdjustments = 0;
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
                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    positiveValidation(colArr[c], y, elInstance);
                }
                var rowData = elInstance.getRowData(y);
                var validation = checkValidtion("text", "A", y, rowData[0], elInstance);
                if (validation == false) {
                    valid = false;
                }
                var validation = checkValidtion("text", "A", y, elInstance.getValueFromCoords(0, y, true), elInstance);
                if (validation == false) {
                    valid = false;
                }
                if (rowData[2] == 2) {
                    validation = checkValidtion("number", "D", y, elInstance.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim(), elInstance, JEXCEL_NEGATIVE_INTEGER_NO_REGEX_FOR_DATA_ENTRY, 0, 0);
                    if (validation == false) {
                        valid = false;
                    } else {
                        if (elInstance.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim().length > 15) {
                            inValid("D", y, i18n.t('static.common.max15digittext'), elInstance);
                            valid = false;
                        } else {
                            positiveValidation("D", y, elInstance);
                        }
                    }
                }
                if (rowData[2] == 1) {
                    validation = checkValidtion("number", "E", y, elInstance.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim(), elInstance, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, 1, 1);
                    if (validation == false) {
                        valid = false;
                    }
                }
                totalAdjustments += Number(elInstance.getValue(`D${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim());
                totalActualStock += Number(elInstance.getValue(`E${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim());
            }
        }
        if (valid == true) {
            var inventoryInstance = this.state.inventoryEl;
            var rowData = inventoryInstance.getRowData(parseInt(rowNumber));
            if (adjustmentType == 1 && inventoryInstance.getValue(`G${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim() != "" && totalActualStock > inventoryInstance.getValue(`G${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim()) {
                this.props.updateState("inventoryBatchInfoNoStockError", i18n.t('static.consumption.missingBatch'));
                this.props.hideThirdComponent();
                valid = false;
            } else if (adjustmentType == 2 && inventoryInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim() != "" && (totalAdjustments > 0 ? totalAdjustments > inventoryInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim() : totalAdjustments < inventoryInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim())) {
                this.props.updateState("inventoryBatchInfoNoStockError", i18n.t('static.consumption.missingBatch'));
                this.props.hideThirdComponent();
                valid = false;
            }
        }
        return valid;
    }
    /**
     * This function is called when submit button of the inventory/adjustment batch info is clicked and is used to save inventory/adjustment batch info if all the data is successfully validated.
     */
    saveInventoryBatchInfo() {
        this.props.updateState("loading", true);
        var validation = this.checkValidationInventoryBatchInfo();
        if (validation == true) {
            var elInstance = this.state.inventoryBatchInfoTableEl;
            var json = elInstance.getJson(null, false);
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
                            batchId: this.state.batchInfoList.filter(c => c.name == (elInstance.getCell(`A${parseInt(i) + 1}`).innerText))[0].batchId,
                            batchNo: (elInstance.getCell(`A${parseInt(i) + 1}`).innerText).split("~")[0],
                            autoGenerated: 0,
                            planningUnitId: parseInt(document.getElementById("planningUnitId").value),
                            expiryDate: moment(map.get("1")).format("YYYY-MM-DD"),
                            createdDate: this.state.batchInfoList.filter(c => c.name == (elInstance.getCell(`A${parseInt(i) + 1}`).innerText))[0].createdDate
                        },
                        adjustmentQty: (map.get("2") == 2) ? elInstance.getValue(`D${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() : (map.get("2") == 1) && elInstance.getValue(`D${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() != 0 ? elInstance.getValue(`D${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() : null,
                        actualQty: (map.get("2") == 1) ? elInstance.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() : (map.get("2") == 2) && elInstance.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() != null && elInstance.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() != "" && elInstance.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() != undefined && elInstance.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() != "NaN" ? elInstance.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() : null
                    }
                    batchInfoArray.push(batchInfoJson);
                }
                totalAdjustments += Number(elInstance.getValue(`D${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim());
                totalActualStock += Number(elInstance.getValue(`E${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim());
            }
            var inventoryInstance = this.state.inventoryEl;
            var allConfirm = true;
            if (allConfirm == true) {
                if (map.get("2") == 1) {
                    if (totalActualStock > inventoryInstance.getValue(`G${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim()) {
                        inventoryInstance.setValueFromCoords(6, rowNumber, totalActualStock, true);
                    }
                } else {
                    if ((totalAdjustments > 0 ? totalAdjustments > inventoryInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim() : totalAdjustments < inventoryInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim())) {
                        inventoryInstance.setValueFromCoords(5, rowNumber, totalAdjustments, true);
                    }
                }
                inventoryInstance.setValueFromCoords(13, rowNumber, batchInfoArray, true);
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
                if (document.getElementById("showInventoryBatchInfoButtonsDiv") != null) {
                    document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'none';
                }
                if (this.props.inventoryPage == "inventoryDataEntry") {
                    this.props.toggleLarge("submit");
                }
                jexcel.destroy(document.getElementById("inventoryBatchInfoTable"), true);
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
    /**
     * This function is called before saving the inventory/adjustment data to check validations for all the rows that are available in the table
     * @returns This functions return true or false. It returns true if all the data is sucessfully validated. It returns false if some validation fails.
     */
    checkValidationInventory() {
        var valid = true;
        var elInstance = this.state.inventoryEl;
        var json = elInstance.getJson(null, false);
        var inventoryDataList = this.props.items.inventoryListUnFiltered;
        var inList = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            if (parseInt(map.get("14")) != -1) {
                inventoryDataList[parseInt(map.get("14"))].inventoryDate = moment(map.get("0")).endOf('month').format("YYYY-MM-DD");
                inventoryDataList[parseInt(map.get("14"))].region.id = map.get("1");
                inventoryDataList[parseInt(map.get("14"))].realmCountryPlanningUnit.id = map.get("3");
                inventoryDataList[parseInt(map.get("14"))].adjustmentQty = (map.get("4") == 2) ? elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim() : elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim() != 0 ? elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim() : null;
                inventoryDataList[parseInt(map.get("14"))].actualQty = (map.get("4") == 1) ? elInstance.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim() : elInstance.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim() != 0 ? elInstance.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim() : null;
                inventoryDataList[parseInt(map.get("14"))].dataSource.id = map.get("2");
            } else {
                var inventoryJson = {
                    inventoryId: 0,
                    region: {
                        id: map.get("1"),
                    },
                    inventoryDate: moment(map.get("0")).endOf('month').format("YYYY-MM-DD"),
                    realmCountryPlanningUnit: {
                        id: map.get("3"),
                    },
                    adjustmentQty: (map.get("4") == 2) ? elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim() : null,
                    actualQty: (map.get("4") == 1) ? elInstance.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim() : null,
                    dataSource: {
                        id: map.get("2")
                    }
                }
                inList.push(inventoryJson);
            }
        }
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            var adjustmentType = this.props.items.inventoryType;
            var checkDuplicate = (inventoryDataList.concat(inList)).filter(c =>
                c.realmCountryPlanningUnit.id == map.get("3") &&
                moment(c.inventoryDate).format("YYYY-MM") == moment(map.get("0")).format("YYYY-MM") &&
                c.region.id == map.get("1") &&
                c.dataSource.id == map.get("2") &&
                c.actualQty != "" && c.actualQty != null && c.actualQty != undefined);
            if (adjustmentType == 1 && (checkDuplicate.length > 1)) {
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
                var rowData = elInstance.getRowData(y);
                var lastEditableDate = moment(Date.now()).subtract(this.state.realm.inventoryMonthsInPast + 1, 'months').format("YYYY-MM-DD");
                if (rowData[14] != -1 && rowData[14] !== "" && rowData[14] != undefined && moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
                } else {
                    var colArr = ['D'];
                    for (var c = 0; c < colArr.length; c++) {
                        positiveValidation(colArr[c], y, elInstance);
                    }
                    var col = ("C").concat(parseInt(y) + 1);
                    var validation = checkValidtion("dateWithInvalidDataEntry", "A", y, rowData[0], elInstance, "", "", "", 0);
                    if (validation == false) {
                        valid = false;
                        elInstance.setValueFromCoords(16, y, 1, true);
                    } else {
                        if (rowData[4] == 1) {
                            if (moment(rowData[0]).format("YYYY-MM") > moment(Date.now()).format("YYYY-MM")) {
                                inValid("A", y, i18n.t('static.inventory.notAllowedForFutureMonths'), elInstance);
                                valid = false
                            } else {
                                positiveValidation("A", y, elInstance);
                            }
                        }
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
                    var validation = checkValidtion("text", "B", y, elInstance.getValueFromCoords(1, y, true), elInstance);
                    if (validation == false) {
                        valid = false;
                        elInstance.setValueFromCoords(16, y, 1, true);
                    }
                    var validation = checkValidtion("text", "C", y, elInstance.getValueFromCoords(2, y, true), elInstance);
                    if (validation == false) {
                        valid = false;
                        elInstance.setValueFromCoords(16, y, 1, true);
                    }
                    var validation = checkValidtion("text", "D", y, elInstance.getValueFromCoords(3, y, true), elInstance);
                    if (validation == false) {
                        valid = false;
                        elInstance.setValueFromCoords(16, y, 1, true);
                    }
                    if (rowData[4] == 2) {
                        var validation = checkValidtion("number", "F", y, elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim(), elInstance, JEXCEL_NEGATIVE_INTEGER_NO_REGEX_FOR_DATA_ENTRY, 0, 0);
                        if (validation == false) {
                            valid = false;
                            elInstance.setValueFromCoords(16, y, 1, true);
                        } else {
                            if (elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim().length > 15) {
                                inValid("F", y, i18n.t('static.common.max15digittext'), elInstance);
                                valid = false;
                            } else {
                                positiveValidation("F", y, elInstance);
                            }
                        }
                        var validation = checkValidtion("text", "K", y, rowData[10], elInstance);
                        if (validation == false) {
                            valid = false;
                            elInstance.setValueFromCoords(16, y, 1, true);
                        } else {
                        }
                    } else {
                    }
                    if (rowData[4] == 1) {
                        var validation = checkValidtion("number", "G", y, elInstance.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim(), elInstance, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, 1, 1);
                        if (validation == false) {
                            valid = false;
                            elInstance.setValueFromCoords(16, y, 1, true);
                        }
                    }
                }
            }
        }
        return valid;
    }
    /**
     * This function is called when submit button of the inventory/adjustment is clicked and is used to save inventory/adjustment if all the data is successfully validated.
     */
    saveInventory() {
        this.props.updateState("inventoryError", "");
        this.props.updateState("loading", true);
        var validation = this.checkValidationInventory();
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            var elInstance = this.state.inventoryEl;
            var planningUnitId = document.getElementById("planningUnitId").value;
            var json = elInstance.getJson(null, false);
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
            openRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                this.props.updateState("color", "#BA0C2F");
                this.props.hideFirstComponent();
            }.bind(this);
            openRequest.onsuccess = function (e) {
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
                    this.props.updateState("color", "#BA0C2F");
                    this.props.hideFirstComponent();
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataJson = programRequest.result.programData;
                    var planningUnitDataList = programDataJson.planningUnitDataList;
                    var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnitId);
                    var programJson = {}
                    if (planningUnitDataIndex != -1) {
                        var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == planningUnitId))[0];
                        var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        programJson = JSON.parse(programData);
                    } else {
                        programJson = {
                            consumptionList: [],
                            inventoryList: [],
                            shipmentList: [],
                            batchInfoList: [],
                            supplyPlan: []
                        }
                    }
                    var generalProgramDataBytes = CryptoJS.AES.decrypt(programDataJson.generalData, SECRET_KEY);
                    var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                    var generalProgramJson = JSON.parse(generalProgramData);
                    var inventoryDataList = (programJson.inventoryList);
                    var actionList = generalProgramJson.actionList;
                    if (actionList == undefined) {
                        actionList = []
                    }
                    var minDate = "";
                    var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                    var curUser = AuthenticationService.getLoggedInUserId();
                    var username = AuthenticationService.getLoggedInUsername();
                    for (var i = 0; i < json.length; i++) {
                        var map = new Map(Object.entries(json[i]));
                        if (map.get("15") == 1) {
                            if (minDate == "") {
                                minDate = moment(map.get("0")).format("YYYY-MM-DD");
                            } else if (minDate != "" && moment(map.get("0")).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                minDate = moment(map.get("0")).format("YYYY-MM-DD");
                            }
                        }
                        if (parseInt(map.get("14")) != -1) {
                            inventoryDataList[parseInt(map.get("14"))].inventoryDate = moment(map.get("0")).endOf('month').format("YYYY-MM-DD");
                            inventoryDataList[parseInt(map.get("14"))].region.id = map.get("1");
                            inventoryDataList[parseInt(map.get("14"))].region.label = (this.props.items.regionList).filter(c => c.id == map.get("1"))[0].label
                            inventoryDataList[parseInt(map.get("14"))].dataSource.id = map.get("2");
                            inventoryDataList[parseInt(map.get("14"))].dataSource.label = (this.state.dataSourceList).filter(c => c.id == map.get("2"))[0].label
                            inventoryDataList[parseInt(map.get("14"))].realmCountryPlanningUnit.id = map.get("3");
                            inventoryDataList[parseInt(map.get("14"))].realmCountryPlanningUnit.label = (this.state.realmCountryPlanningUnitList).filter(c => c.id == map.get("3"))[0].label
                            inventoryDataList[parseInt(map.get("14"))].multiplier = map.get("18");
                            inventoryDataList[parseInt(map.get("14"))].adjustmentQty = (map.get("4") == 2) ? elInstance.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() : elInstance.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() != 0 ? elInstance.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() : null;
                            inventoryDataList[parseInt(map.get("14"))].actualQty = (map.get("4") == 1) ? elInstance.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() : elInstance.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() != 0 ? elInstance.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() : null;
                            inventoryDataList[parseInt(map.get("14"))].notes = map.get("10");
                            inventoryDataList[parseInt(map.get("14"))].active = map.get("11");
                            if (map.get("13") != "") {
                                inventoryDataList[parseInt(map.get("14"))].batchInfoList = map.get("13");
                            } else {
                                inventoryDataList[parseInt(map.get("14"))].batchInfoList = [];
                            }
                            if (map.get("15") == 1) {
                                inventoryDataList[parseInt(map.get("14"))].lastModifiedBy.userId = curUser;
                                inventoryDataList[parseInt(map.get("14"))].lastModifiedBy.username = username;
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
                                    id: map.get("2"),
                                    label: (this.state.dataSourceList).filter(c => c.id == map.get("2"))[0].label
                                },
                                region: {
                                    id: map.get("1"),
                                    label: (this.props.items.regionList).filter(c => c.id == map.get("1"))[0].label
                                },
                                inventoryDate: moment(map.get("0")).endOf('month').format("YYYY-MM-DD"),
                                adjustmentQty: (map.get("4") == 2) ? elInstance.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() : null,
                                actualQty: (map.get("4") == 1) ? elInstance.getValue(`G${parseInt(i) + 1}`, true).toString().replaceAll("\,", "").trim() : null,
                                active: map.get("11"),
                                realmCountryPlanningUnit: {
                                    id: map.get("3"),
                                    label: (this.state.realmCountryPlanningUnitList).filter(c => c.id == map.get("3"))[0].label
                                },
                                multiplier: map.get("18"),
                                planningUnit: {
                                    id: planningUnitId,
                                    label: (this.props.items.planningUnitListAll.filter(c => c.planningUnit.id == planningUnitId)[0]).planningUnit.label
                                },
                                notes: map.get("10"),
                                batchInfoList: batchInfoList,
                                index: inventoryDataList.length,
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
                            inventoryDataList.push(inventoryJson);
                        }
                    }
                    actionList.push({
                        planningUnitId: planningUnitId,
                        type: this.props.items.inventoryType == 1 ? INVENTORY_MODIFIED : ADJUSTMENT_MODIFIED,
                        date: moment(minDate).startOf('month').format("YYYY-MM-DD")
                    })
                    programJson.inventoryList = inventoryDataList;
                    generalProgramJson.actionList = actionList;
                    if (planningUnitDataIndex != -1) {
                        planningUnitDataList[planningUnitDataIndex].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    } else {
                        planningUnitDataList.push({ planningUnitId: planningUnitId, planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString() });
                    }
                    this.setState({
                        programJson: programJson,
                        planningUnitDataList: planningUnitDataList
                    })
                    programDataJson.planningUnitDataList = planningUnitDataList;
                    programDataJson.generalData = (CryptoJS.AES.encrypt(JSON.stringify(generalProgramJson), SECRET_KEY)).toString()
                    programRequest.result.programData = programDataJson;
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                        this.props.updateState("color", "#BA0C2F");
                        this.props.hideFirstComponent();
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        var programId = (document.getElementById("programId").value)
                        var planningUnitId = (document.getElementById("planningUnitId").value)
                        var objectStore = "";
                        if (this.props.inventoryPage == "whatIf") {
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
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (<div></div>)
    }
}