import React from "react";
import jexcel from 'jexcel-pro';
import "../../../node_modules/jexcel-pro/dist/jexcel.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunctionOnlyHideRow, checkValidtion, inValid, positiveValidation, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { SECRET_KEY, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, INVENTORY_DATA_SOURCE_TYPE, JEXCEL_NEGATIVE_INTEGER_NO_REGEX_FOR_DATA_ENTRY, QAT_DATA_SOURCE_ID, NOTES_FOR_QAT_ADJUSTMENTS, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP, JEXCEL_DATE_FORMAT_WITHOUT_DATE, JEXCEL_PAGINATION_OPTION, INVENTORY_MONTHS_IN_PAST, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PRO_KEY, INVENTORY_MODIFIED, ADJUSTMENT_MODIFIED } from "../../Constants";
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
        this.onPaste = this.onPaste.bind(this);
        this.onPasteForBatchInfo = this.onPasteForBatchInfo.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.batchDetailsClicked = this.batchDetailsClicked.bind(this);
        this.state = {
            inventoryEl: "",
            inventoryBatchInfoTableEl: ""
        }
    }

    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var adjustmentType = this.props.items.inventoryType;
                (instance.jexcel).setValueFromCoords(8, data[i].y, `=ROUND(F${parseInt(data[i].y) + 1}*H${parseInt(data[i].y) + 1},0)`, true);
                (instance.jexcel).setValueFromCoords(9, data[i].y, `=ROUND(G${parseInt(data[i].y) + 1}*H${parseInt(data[i].y) + 1},0)`, true);
                (instance.jexcel).setValueFromCoords(4, data[i].y, adjustmentType, true);
                var index = (instance.jexcel).getValue(`O${parseInt(data[i].y) + 1}`, true);
                if (index == "" || index == null || index == undefined) {
                    (instance.jexcel).setValueFromCoords(12, data[i].y, "", true);
                    (instance.jexcel).setValueFromCoords(13, data[i].y, "", true);
                    (instance.jexcel).setValueFromCoords(14, data[i].y, -1, true);
                    (instance.jexcel).setValueFromCoords(15, data[i].y, 1, true);
                    (instance.jexcel).setValueFromCoords(16, data[i].y, 0, true);
                    z = data[i].y;
                }
            }
            if (data[i].x == 0 && data[i].value != "") {
                (instance.jexcel).setValueFromCoords(0, data[i].y, moment(data[i].value).format("YYYY-MM-DD"), true);
            }
        }
    }

    oneditionend = function (instance, cell, x, y, value) {
        var elInstance = instance.jexcel;
        var rowData = elInstance.getRowData(y);

        if (x == 5 && !isNaN(rowData[5]) && rowData[5].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(5, y, parseFloat(rowData[5]), true);
        } else if (x == 6 && !isNaN(rowData[6]) && rowData[6].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(6, y, parseFloat(rowData[6]), true);
        } else if (x == 7 && !isNaN(rowData[7]) && rowData[7].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(7, y, parseFloat(rowData[7]), true);
        } else if (x == 8 && !isNaN(rowData[8]) && rowData[8].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(8, y, parseFloat(rowData[8]), true);
        } else if (x == 9 && !isNaN(rowData[9]) && rowData[9].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(9, y, parseFloat(rowData[9]), true);
        }

    }

    onPasteForBatchInfo(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance.jexcel).getValue(`F${parseInt(data[i].y) + 1}`, true);
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

    showOnlyErrors() {
        var checkBoxValue = document.getElementById("showErrors");
        var elInstance = this.state.inventoryEl;
        var json = elInstance.getJson(null, false);
        var showOption = (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
        if (json.length < showOption) {
            showOption = json.length;
        }
        if (checkBoxValue.checked == true) {
            for (var j = 0; j < parseInt(showOption); j++) {
                var rowData = elInstance.getRowData(j);
                var asterisk = document.getElementsByClassName("jexcel_content")[0];
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
        var generalProgramJson=this.props.items.generalProgramJson;
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
                    if (rcpuResult[k].realmCountry.id == generalProgramJson.realmCountry.realmCountryId && rcpuResult[k].planningUnit.id == document.getElementById("planningUnitId").value && rcpuResult[k].realmCountryPlanningUnitId != 0) {
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
                        if (dataSourceResult[k].program.id == generalProgramJson.programId || dataSourceResult[k].program.id == 0) {
                            if (dataSourceResult[k].realm.id == generalProgramJson.realmCountry.realm.realmId && dataSourceResult[k].dataSourceType.id == INVENTORY_DATA_SOURCE_TYPE) {
                                var dataSourceJson = {
                                    name: getLabelText(dataSourceResult[k].label, this.props.items.lang),
                                    id: dataSourceResult[k].dataSourceId,
                                    active: dataSourceResult[k].active,
                                    label:dataSourceResult[k].label
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
                    if (this.props.useLocalData == 0) {
                        dataSourceList = this.props.items.dataSourceList;
                    }
                    if (this.props.useLocalData == 0) {
                        realmCountryPlanningUnitList = this.props.items.realmCountryPlanningUnitList;
                    }
                    this.setState({
                        realmCountryPlanningUnitList: realmCountryPlanningUnitList,
                        dataSourceList: dataSourceList
                    }, () => {
                        this.props.updateState("dataSourceList", dataSourceList);
                        this.props.updateState("realmCountryPlanningUnitList", realmCountryPlanningUnitList);
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

                    var roleList = AuthenticationService.getLoggedInUserRole();
                    if (roleList.length == 1 && roleList[0].roleId == 'ROLE_GUEST_USER') {
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
                        data = [];
                        data[0] = inventoryList[j].inventoryDate; //A
                        data[1] = inventoryList[j].region.id; //B                        
                        data[2] = inventoryList[j].dataSource.id; //C
                        data[3] = inventoryList[j].realmCountryPlanningUnit.id; //D
                        data[4] = adjustmentType; //E
                        data[5] = Math.round(inventoryList[j].adjustmentQty); //F
                        data[6] = Math.round(inventoryList[j].actualQty); //G
                        data[7] = inventoryList[j].multiplier; //H
                        data[8] = `=ROUND(F${parseInt(j) + 1}*H${parseInt(j) + 1},0)`; //I
                        data[9] = `=ROUND(G${parseInt(j) + 1}*H${parseInt(j) + 1},0)`; //J
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
                            index = inventoryList[j].index;
                        }
                        data[14] = index;
                        data[15] = 0;
                        data[16] = 0;
                        inventoryDataArr[j] = data;
                    }
                    var regionList = this.props.items.regionList;
                    if (inventoryList.length == 0 && inventoryEditable) {
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
                        data[8] = `=ROUND(F${parseInt(0) + 1}*H${parseInt(0) + 1},0)`; //I
                        data[9] = `=ROUND(G${parseInt(0) + 1}*H${parseInt(0) + 1},0)`; //J
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
                            { title: i18n.t('static.inventory.inventoryDate'), type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker' }, width: 80, readOnly: readonlyRegionAndMonth },
                            { title: i18n.t('static.region.region'), type: 'dropdown', readOnly: readonlyRegionAndMonth, source: this.props.items.regionList, width: 100 },
                            { title: i18n.t('static.inventory.dataSource'), type: 'dropdown', source: dataSourceList, width: 180, filter: this.filterDataSource },
                            { title: i18n.t('static.supplyPlan.alternatePlanningUnit'), type: 'dropdown', source: realmCountryPlanningUnitList, filter: this.filterRealmCountryPlanningUnit, width: 180 },
                            { title: i18n.t('static.supplyPlan.inventoryType'), type: 'dropdown', source: [{ id: 1, name: i18n.t('static.inventory.inventory') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }], readOnly: true, width: 100 },
                            { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: adjustmentColumnType, mask: '[-]#,##', textEditor: true, disabledMaskOnEdition: true, width: 120 },
                            { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: actualColumnType, mask: '#,##.00', textEditor: true, disabledMaskOnEdition: true, decimal: '.', width: 120 },
                            { title: i18n.t('static.unit.multiplierFromARUTOPU'), type: 'numeric', mask: '#,##.000000', decimal: '.', width: 90, readOnly: true },
                            { title: i18n.t('static.supplyPlan.quantityQATProduct'), type: adjustmentColumnType, mask: '[-]#,##.00', decimal: '.', width: 120, readOnly: true },
                            { title: i18n.t('static.supplyPlan.quantityQATProduct'), type: actualColumnType, mask: '#,##.00', decimal: '.', width: 120, readOnly: true },
                            { title: i18n.t('static.program.notes'), type: 'text', width: 400 },
                            { title: i18n.t('static.inventory.active'), type: 'checkbox', width: 100, readOnly: !inventoryEditable },
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
                        parseFormulas: true,
                        filters: filterOption,
                        license: JEXCEL_PRO_KEY,
                        onpaste: this.onPaste,
                        oneditionend: this.oneditionend,
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
                            if (y != null) {
                                var elInstance = el.jexcel;
                                var json = elInstance.getJson(null, false);
                                // for (var z = 0; z < json.length; z++) {
                                var rowData = elInstance.getRowData(y);
                                var lastEditableDate = moment(Date.now()).subtract(INVENTORY_MONTHS_IN_PAST + 1, 'months').format("YYYY-MM-DD");
                                var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q']
                                if (rowData[14] != -1 && rowData[14] !== "" && rowData[14] != undefined && moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && !AuthenticationService.getLoggedInUserRoleIdArr().includes("ROLE_APPLICATION_ADMIN")) {
                                    for (var c = 0; c < colArr.length; c++) {
                                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                                        cell.classList.add('readonly');
                                    }
                                } else {

                                }
                                // }
                            }

                        }.bind(this),
                        onsearch: function (el) {
                            el.jexcel.updateTable();
                        },
                        onfilter: function (el) {
                            el.jexcel.updateTable();
                        },
                        contextMenu: function (obj, x, y, e) {
                            var items = [];
                            if (y == null) {
                            } else {
                                //Add inventory batch info
                                var rowData = obj.getRowData(y)
                                if (rowData[4] != "" && rowData[0] != "" && rowData[1] != "" && rowData[3] != "") {
                                    items.push({
                                        title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                        onclick: function () {
                                            this.batchDetailsClicked(obj, x, y, e, inventoryEditable)
                                        }.bind(this)
                                    });
                                }
                                // -------------------------------------


                                // Insert new row
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
                                        // region id
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
    }

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
            inventoryQty = obj.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim()
        } else {
            inventoryQty = obj.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim();
        }
        var inventoryBatchInfoQty = 0;
        var inventoryBatchEditable = inventoryEditable;
        var lastEditableDate = "";
        lastEditableDate = moment(Date.now()).subtract(INVENTORY_MONTHS_IN_PAST + 1, 'months').format("YYYY-MM-DD");
        if (moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && rowData[14] != -1 && !AuthenticationService.getLoggedInUserRoleIdArr().includes("ROLE_APPLICATION_ADMIN")) {
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
            data[0] = batchInfo[sb].batch.batchNo + "~" + moment(batchInfo[sb].batch.expiryDate).format("YYYY-MM-DD"); //A
            data[1] = moment(batchInfo[sb].batch.expiryDate).format(DATE_FORMAT_CAP);
            data[2] = adjustmentType; //B
            data[3] = Number(batchInfo[sb].adjustmentQty); //C
            data[4] = Number(batchInfo[sb].actualQty); //D
            data[5] = batchInfo[sb].inventoryTransBatchInfoId; //E
            data[6] = y; //F
            data[7] = date;
            if (adjustmentType == 1) {
                inventoryBatchInfoQty += Number(batchInfo[sb].actualQty);
            } else {
                inventoryBatchInfoQty += Number(batchInfo[sb].adjustmentQty);
            }
            json.push(data);
        }
        // if (parseInt(inventoryQty) != inventoryBatchInfoQty) {
        if ((adjustmentType == 1 && Number(inventoryQty) > inventoryBatchInfoQty) ||
            (adjustmentType == 2 && Number(inventoryBatchInfoQty) > 0 ? Number(inventoryBatchInfoQty) < Number(inventoryQty) : Number(inventoryBatchInfoQty) > Number(inventoryQty)) || Number(inventoryBatchInfoQty) == 0) {
            var qty = Number(inventoryQty) - Number(inventoryBatchInfoQty);
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
            // }
        }
        // if (batchInfo.length == 0) {
        //     var data = [];
        //     data[0] = "";
        //     data[1] = ""
        //     data[2] = adjustmentType;
        //     data[3] = "";
        //     data[4] = "";
        //     data[5] = 0;
        //     data[6] = y;
        //     data[7] = date;
        //     json.push(data)
        // }
        var options = {
            data: json,
            columnDrag: true,
            columns: [
                { title: i18n.t('static.supplyPlan.batchId'), type: 'dropdown', source: batchList, filter: this.filterBatchInfoForExistingDataForInventory, width: 100 },
                { title: i18n.t('static.supplyPlan.expiryDate'), type: 'text', readOnly: true, width: 150 },
                { title: i18n.t('static.supplyPlan.adjustmentType'), type: 'hidden', source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }], readOnly: true },
                { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: adjustmentColumnType, mask: '[-]#,##', textEditor: true, disabledMaskOnEdition: true, width: 80 },
                { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: actualColumnType, mask: '#,##.00', textEditor: true, decimal: '.', disabledMaskOnEdition: true, width: 80 },
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
            onpaste: this.onPasteForBatchInfo,
            onchange: this.batchInfoChangedInventory,
            copyCompatibility: true,
            parseFormulas: true,
            editable: inventoryBatchEditable,
            text: {
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                show: '',
                entries: '',
            },
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
                        // region id
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
                                            data[3] = ""; //C
                                            data[4] = inventoryQty; //D
                                        } else {
                                            data[3] = inventoryQty; //C
                                            data[4] = ""; //D
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

    addRowInJexcel() {
        var obj = this.state.inventoryEl;
        var json = obj.getJson(null, false);
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
        data[8] = `=ROUND(F${parseInt(json.length) + 1}*H${parseInt(json.length) + 1},0)`; //I
        data[9] = `=ROUND(G${parseInt(json.length) + 1}*H${parseInt(json.length) + 1},0)`; //J
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
            if (showOption != 5000000) {
                var pageNo = parseInt(parseInt(json.length - 1) / parseInt(showOption));
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
        return this.state.dataSourceList.filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
    }.bind(this)

    filterRealmCountryPlanningUnit = function (instance, cell, c, r, source) {
        return this.state.realmCountryPlanningUnitList.filter(c => c.active.toString() == "true").sort(function (a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
        });
    }.bind(this)




    loadedInventory = function (instance, cell, x, y, value) {
        if (this.props.inventoryPage != "inventoryDataEntry") {
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
        if (this.props.items.inventoryType == 2) {
            tr.children[11].classList.add('AsteriskTheadtrTd');
        }
        // (instance.jexcel).orderBy(0, 0);
        // var elInstance = instance.jexcel;
        // var json = elInstance.getJson(null, false);
        // for (var z = 0; z < json.length; z++) {
        //     var rowData = elInstance.getRowData(z);
        //     var lastEditableDate = moment(Date.now()).subtract(INVENTORY_MONTHS_IN_PAST + 1, 'months').format("YYYY-MM-DD");
        //     var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q']
        //     if (moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD")) {
        //         for (var c = 0; c < colArr.length; c++) {
        //             var cell = elInstance.getCell((colArr[c]).concat(parseInt(z) + 1))
        //             cell.classList.add('readonly');
        //         }
        //     } else {

        //     }
        // }
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
            var valid = checkValidtion("dateWithInvalid", "A", y, rowData[0], elInstance, "", "", "", 0);
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
                        // if (rowData[4] != "" && rowData[0] != "" && rowData[1] != "" && rowData[3] != "" && Number(elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim()) != 0) {
                        //     this.batchDetailsClicked(elInstance, x, y, "", true)
                        // }
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
                    // if (rowData[4] != "" && rowData[0] != "" && rowData[1] != "" && rowData[3] != "" && Number(elInstance.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim()) != 0) {
                    //     this.batchDetailsClicked(elInstance, x, y, "", true)
                    // }
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

        // if (x == 10) {
        //     if (rowData[4] == 2) {
        //         var valid = checkValidtion("text", "K", y, rowData[10], elInstance);
        //         if (valid == true) {
        //             if (rowData[10].length > 600) {
        //                 inValid("K", y, i18n.t('static.dataentry.notesMaxLength'), elInstance);
        //             } else {
        //                 positiveValidation("K", y, elInstance);
        //             }
        //         }
        //     } else {
        //         if (rowData[10].length > 600) {
        //             inValid("K", y, i18n.t('static.dataentry.notesMaxLength'), elInstance);
        //         } else {
        //             positiveValidation("K", y, elInstance);
        //         }
        //     }
        // }

        // this.showOnlyErrors();
    }

    filterBatchInfoForExistingDataForInventory = function (instance, cell, c, r, source) {
        var mylist = [];
        var json = instance.jexcel.getJson(null, false);
        var value = (json[r])[5];
        var date = json[0][7];
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
                //     for (var i = 0; createdDate < expiryDate; i++) {
                //         createdDate = moment(calculationStartDate).add(i, 'month').format("YYYY-MM-DD");
                //         var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
                //         var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
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
                //         var adjustmentQty = 0;
                //         for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                //             if (inventoryForBatchNumber[b].actualQty == "" || inventoryForBatchNumber[b].actualQty == 0 || inventoryForBatchNumber[b].actualQty == null) {
                //                 remainingBatchQty += parseInt(inventoryForBatchNumber[b].qty);
                //             } else {
                //                 remainingBatchQty = parseInt(inventoryForBatchNumber[b].actualQty);
                //             }
                //         }
                //         if (this.props.items.inventoryType == 1) {
                //             remainingBatchQty = parseInt(map.get("6").toString().replaceAll("\,", "").trim());
                //         } else {
                //             remainingBatchQty += parseInt(map.get("5").toString().replaceAll("\,", "").trim());
                //         }
                //         adjustmentQty += parseInt(map.get("3").toString().replaceAll("\,", "").trim());
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
        // }
        return valid;
    }

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
            var rowData = inventoryInstance.getRowData(parseInt(rowNumber));
            var allConfirm = true;
            // if (countForNonFefo == 0) {
            //     var cf = window.confirm(i18n.t("static.batchDetails.warningFefo"));
            //     if (cf == true) {
            //         if (map.get("2") == 1 && inventoryInstance.getValue(`G${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim() != "" && totalActualStock > inventoryInstance.getValue(`G${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim()) {
            //             var cf1 = window.confirm(i18n.t("static.batchDetails.warningQunatity"))
            //             if (cf1 == true) {
            //             } else {
            //                 allConfirm = false;
            //             }
            //         } else if (map.get("2") == 2 && inventoryInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim() != "" && (totalAdjustments > 0 ? totalAdjustments > inventoryInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim() : totalAdjustments < inventoryInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim())) {
            //             var cf1 = window.confirm(i18n.t("static.batchDetails.warningQunatity"))
            //             if (cf1 == true) {
            //             } else {
            //                 allConfirm = false;
            //             }
            //         }
            //     } else {
            //         allConfirm = false;
            //     }
            // } else {
            //     if (map.get("2") == 1 && inventoryInstance.getValue(`G${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim() != "" && totalActualStock > inventoryInstance.getValue(`G${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim()) {
            //         var cf1 = window.confirm(i18n.t("static.batchDetails.warningQunatity"))
            //         if (cf1 == true) {
            //         } else {
            //             allConfirm = false;
            //         }
            //     } else if (map.get("2") == 2 && inventoryInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim() != "" && (totalAdjustments > 0 ? totalAdjustments > inventoryInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim() : totalAdjustments < inventoryInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim())) {
            //         var cf1 = window.confirm(i18n.t("static.batchDetails.warningQunatity"))
            //         if (cf1 == true) {
            //         } else {
            //             allConfirm = false;
            //         }
            //     }
            // }

            if (allConfirm == true) {
                if (map.get("2") == 1) {
                    // inventoryInstance.setValueFromCoords(5, rowNumber, "", true);
                    if (totalActualStock > inventoryInstance.getValue(`G${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim()) {
                        inventoryInstance.setValueFromCoords(6, rowNumber, totalActualStock, true);
                    }
                    // if (batchInfoArray.length > 0) {
                    //     var cell = inventoryInstance.getCell(`G${parseInt(rowNumber) + 1}`)
                    //     cell.classList.add('readonly');
                    // }
                } else {
                    if ((totalAdjustments > 0 ? totalAdjustments > inventoryInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim() : totalAdjustments < inventoryInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "").trim())) {
                        inventoryInstance.setValueFromCoords(5, rowNumber, totalAdjustments, true);
                    }
                    // inventoryInstance.setValueFromCoords(6, rowNumber, "", true);
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
                if (document.getElementById("showInventoryBatchInfoButtonsDiv") != null) {
                    document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'none';
                }
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
        var json = elInstance.getJson(null, false);
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
            var index = 0;

            if (checkDuplicateOverAll.length > 0) {
                if (checkDuplicateOverAll[0].inventoryId > 0) {
                    index = inventoryListUnFiltered.findIndex(c => c.inventoryId == checkDuplicateOverAll[0].inventoryId);
                } else {
                    index = checkDuplicateOverAll[0].index;
                }
            }
            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("3") == map.get("3") &&
                moment(c.get("0")).format("YYYY-MM") == moment(map.get("0")).format("YYYY-MM") &&
                c.get("1") == map.get("1")
            )
            if (adjustmentType == 1 && (checkDuplicateInMap.length > 1 || (checkDuplicateOverAll.length > 0 && index != map.get("14")))) {
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
                var rowData = elInstance.getRowData(y);
                var lastEditableDate = moment(Date.now()).subtract(INVENTORY_MONTHS_IN_PAST + 1, 'months').format("YYYY-MM-DD");
                if (rowData[14] != -1 && rowData[14] !== "" && rowData[14] != undefined && moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && !AuthenticationService.getLoggedInUserRoleIdArr().includes("ROLE_APPLICATION_ADMIN")) {
                } else {
                    // var colArr = ['D'];
                    // for (var c = 0; c < colArr.length; c++) {
                    //     positiveValidation(colArr[c], y, elInstance);
                    // }
                    // var col = ("C").concat(parseInt(y) + 1);

                    // var validation = checkValidtion("date", "A", y, rowData[0], elInstance);
                    // if (validation == false) {
                    //     valid = false;
                    //     elInstance.setValueFromCoords(16, y, 1, true);
                    // } else {
                    //     if (rowData[4] == 1) {
                    //         if (moment(rowData[0]).format("YYYY-MM") > moment(Date.now()).format("YYYY-MM")) {
                    //             inValid("A", y, i18n.t('static.inventory.notAllowedForFutureMonths'), elInstance);
                    //             valid = false
                    //         } else {
                    //             positiveValidation("A", y, elInstance);
                    //         }
                    //     }
                    // }

                    // var validation = checkValidtion("text", "B", y, rowData[1], elInstance);
                    // if (validation == false) {
                    //     valid = false;
                    //     elInstance.setValueFromCoords(16, y, 1, true);
                    // }

                    // var validation = checkValidtion("text", "C", y, rowData[2], elInstance);
                    // if (validation == false) {
                    //     valid = false;
                    //     elInstance.setValueFromCoords(16, y, 1, true);
                    // }


                    // var validation = checkValidtion("text", "D", y, rowData[3], elInstance);
                    // if (validation == false) {
                    //     valid = false;
                    //     elInstance.setValueFromCoords(16, y, 1, true);
                    // }

                    // if (rowData[4] == 2) {
                    //     var validation = checkValidtion("number", "F", y, elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim(), elInstance, JEXCEL_NEGATIVE_INTEGER_NO_REGEX, 0, 0);
                    //     if (validation == false) {
                    //         valid = false;
                    //         elInstance.setValueFromCoords(16, y, 1, true);
                    //     } else {
                    //         if (elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim().length > 10) {
                    //             inValid("F", y, i18n.t('static.common.max10digittext'), elInstance);
                    //             valid = false;
                    //         } else {
                    //             positiveValidation("F", y, elInstance);
                    //         }
                    //     }
                    //     var validation = checkValidtion("text", "K", y, rowData[10], elInstance);
                    //     if (validation == false) {
                    //         valid = false;
                    //         elInstance.setValueFromCoords(16, y, 1, true);
                    //     } else {
                    //         if (rowData[10].length > 600) {
                    //             inValid("K", y, i18n.t('static.dataentry.notesMaxLength'), elInstance);
                    //             valid = false;
                    //         } else {
                    //             positiveValidation("K", y, elInstance);
                    //         }
                    //     }
                    // } else {
                    //     if (rowData[10].length > 600) {
                    //         inValid("K", y, i18n.t('static.dataentry.notesMaxLength'), elInstance);
                    //         valid = false;
                    //     } else {
                    //         positiveValidation("K", y, elInstance);
                    //     }
                    // }


                    // if (rowData[4] == 1) {
                    //     var validation = checkValidtion("number", "G", y, elInstance.getValue(`G${parseInt(y) + 1}`, true).toString().replaceAll("\,", "").trim(), elInstance, JEXCEL_INTEGER_REGEX, 1, 1);
                    //     if (validation == false) {
                    //         valid = false;
                    //         elInstance.setValueFromCoords(16, y, 1, true);
                    //     }
                    // }
                    var colArr = ['D'];
                    for (var c = 0; c < colArr.length; c++) {
                        positiveValidation(colArr[c], y, elInstance);
                    }
                    var col = ("C").concat(parseInt(y) + 1);
                    var validation = checkValidtion("dateWithInvalid", "A", y, rowData[0], elInstance, "", "", "", 0);
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
                            // if (rowData[10].length > 600) {
                            //     inValid("K", y, i18n.t('static.dataentry.notesMaxLength'), elInstance);
                            //     valid = false;
                            // } else {
                            //     positiveValidation("K", y, elInstance);
                            // }
                        }
                    } else {
                        // if (rowData[10].length > 600) {
                        //     inValid("K", y, i18n.t('static.dataentry.notesMaxLength'), elInstance);
                        //     valid = false;
                        // } else {
                        //     positiveValidation("K", y, elInstance);
                        // }
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

    // Save adjustments
    saveInventory() {
        // this.showOnlyErrors();
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
                    var programDataJson = programRequest.result.programData;
                    var planningUnitDataList = programDataJson.planningUnitDataList;
                    var planningUnitDataIndex=(planningUnitDataList).findIndex(c=>c.planningUnitId==planningUnitId);
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
                            problemReportList: [],
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
                            inventoryDataList[parseInt(map.get("14"))].multiplier = map.get("7");
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
                                multiplier: map.get("7"),
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
                    this.setState({
                        programJson: programJson
                    })
                    if (planningUnitDataIndex != -1) {
                        planningUnitDataList[planningUnitDataIndex].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    } else {
                        planningUnitDataList.push({ planningUnitId: planningUnitId, planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString() });
                    }
                    programDataJson.planningUnitDataList=planningUnitDataList;
                    programRequest.result.programData = programDataJson;
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

    render() { return (<div></div>) }
}