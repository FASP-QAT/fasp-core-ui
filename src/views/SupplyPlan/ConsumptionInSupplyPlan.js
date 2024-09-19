import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import moment from "moment";
import React from "react";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { checkValidtion, inValid, jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, positiveValidation } from '../../CommonComponent/JExcelCommonFunctions.js';
import getLabelText from '../../CommonComponent/getLabelText';
import { ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, ACTUAL_CONSUMPTION_MODIFIED, ACTUAL_CONSUMPTION_TYPE, DATE_FORMAT_CAP, FORCASTED_CONSUMPTION_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_MODIFIED, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, JEXCEL_MONTH_PICKER_FORMAT, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, MAX_DATE_RESTRICTION_IN_DATA_ENTRY, MIN_DATE_RESTRICTION_IN_DATA_ENTRY, SECRET_KEY } from "../../Constants";
import i18n from '../../i18n';
import AuthenticationService from "../Common/AuthenticationService";
import { calculateSupplyPlan } from "./SupplyPlanCalculations";
/**
 * This component is used to display the consumption data in the form of table for supply plan, scenario planning, supply planning comparision and supply plan version and review screen
 */
export default class ConsumptionInSupplyPlanComponent extends React.Component {
    constructor(props) {
        super(props);
        this.showConsumptionData = this.showConsumptionData.bind(this);
        this.loadedConsumption = this.loadedConsumption.bind(this);
        this.consumptionChanged = this.consumptionChanged.bind(this);
        this.filterBatchInfoForExistingDataForConsumption = this.filterBatchInfoForExistingDataForConsumption.bind(this);
        this.loadedBatchInfoConsumption = this.loadedBatchInfoConsumption.bind(this);
        this.batchInfoChangedConsumption = this.batchInfoChangedConsumption.bind(this);
        this.checkValidationConsumptionBatchInfo = this.checkValidationConsumptionBatchInfo.bind(this);
        this.saveConsumptionBatchInfo = this.saveConsumptionBatchInfo.bind(this);
        this.checkValidationConsumption = this.checkValidationConsumption.bind(this);
        this.saveConsumption = this.saveConsumption.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.addBatchRowInJexcel = this.addBatchRowInJexcel.bind(this)
        this.onPaste = this.onPaste.bind(this);
        this.onPasteForBatchInfo = this.onPasteForBatchInfo.bind(this);
        this.oneditionend = this.oneditionend.bind(this);
        this.batchDetailsClicked = this.batchDetailsClicked.bind(this);
        this.formulaChanged = this.formulaChanged.bind(this)
        this.onchangepage=this.onchangepage.bind(this)
        this.state = {
            consumptionEl: "",
            consumptionBatchInfoTableEl: ""
        }
    }
    /**
     * This function is used to update the data when some records are pasted in the consumption sheet
     * @param {*} instance This is the sheet where the data is being placed
     * @param {*} data This is the data that is being pasted
     */
    onPaste(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                (instance).setValueFromCoords(7, data[i].y, `=ROUND(F${parseInt(data[i].y) + 1}*Q${parseInt(data[i].y) + 1},0)`, true);
                var index = (instance).getValue(`M${parseInt(data[i].y) + 1}`, true);
                if (index == "" || index == null || index == undefined) {
                    (instance).setValueFromCoords(11, data[i].y, "", true);
                    (instance).setValueFromCoords(12, data[i].y, -1, true);
                    (instance).setValueFromCoords(13, data[i].y, 1, true);
                    (instance).setValueFromCoords(14, data[i].y, 0, true);
                    z = data[i].y;
                }
            }
            if (data[i].x == 0 && data[i].value != "") {
                var minDate=this.props.items.generalProgramJson.cutOffDate!=undefined && this.props.items.generalProgramJson.cutOffDate!=null && this.props.items.generalProgramJson.cutOffDate!=""?moment(this.props.items.generalProgramJson.cutOffDate).startOf('month').format("YYYY-MM-DD"):moment(MIN_DATE_RESTRICTION_IN_DATA_ENTRY).startOf('month').format("YYYY-MM-DD");
                if(moment(data[i].value).format("YYYY-MM")>=moment(minDate).format("YYYY-MM")){
                    (instance).setValueFromCoords(0, data[i].y, moment(data[i].value).format("YYYY-MM-DD"), true);
                }else{
                    (instance).setValueFromCoords(0, data[i].y, "", true);
                }
            }
            if (data[i].x == 4) {
                var aruList = this.state.realmCountryPlanningUnitList.filter(c => (c.name == data[i].value || getLabelText(c.label, this.state.lang) == data[i].value) && c.active.toString() == "true");
                if (aruList.length > 0) {
                    (instance).setValueFromCoords(4, data[i].y, aruList[0].id, true);
                }
            }
            if (data[i].x == 3) {
                var dsList = this.state.dataSourceList.filter(c => (c.name == data[i].value || getLabelText(c.label, this.state.lang) == data[i].value) && c.active.toString() == "true");
                if (dsList.length > 0) {
                    (instance).setValueFromCoords(3, data[i].y, dsList[0].id, true);
                }
            }
        }
    }
    /**
     * This function is used to update the data when some records are pasted in the consumption batch info sheet
     * @param {*} instance This is the sheet where the data is being placed
     * @param {*} data This is the data that is being pasted
     */
    onPasteForBatchInfo(instance, data) {
        var z = -1;
        for (var i = 0; i < data.length; i++) {
            if (z != data[i].y) {
                var index = (instance).getValue(`D${parseInt(data[i].y) + 1}`, true);
                if (index == "" || index == null || index == undefined) {
                    var rowData = (instance).getRowData(0);
                    (instance).setValueFromCoords(3, data[i].y, 0, true);
                    (instance).setValueFromCoords(4, data[i].y, rowData[4], true);
                    (instance).setValueFromCoords(5, data[i].y, rowData[5], true);
                    z = data[i].y;
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
        } else if (x == 8 && !isNaN(rowData[8]) && rowData[8].toString().indexOf('.') != -1) {
            elInstance.setValueFromCoords(8, y, parseFloat(rowData[8]), true);
        }
    }
    /**
     * This function is used to build the Jexcel table with all the data based on the filters and based on all the dropdowns
     */
    showConsumptionData() {
        var realmId = AuthenticationService.getRealmId();
        var planningUnitId = document.getElementById("planningUnitId").value;
        var consumptionListUnFiltered = this.props.items.consumptionListUnFiltered;
        var consumptionList = this.props.items.consumptionList;
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
                            label: rcpuResult[k].label,
                            conversionNumber:rcpuResult[k].conversionNumber,
                            conversionMethod:rcpuResult[k].conversionMethod,
                        }
                        realmCountryPlanningUnitList.push(rcpuJson);
                    }
                }
                if (this.props.useLocalData == 0) {
                    realmCountryPlanningUnitList = this.props.items.realmCountryPlanningUnitList;
                }
                this.setState({
                    realmCountryPlanningUnitList: realmCountryPlanningUnitList,
                    realm:realmRequest.result
                }, () => {
                    this.props.updateState("realmCountryPlanningUnitList", realmCountryPlanningUnitList);
                    this.props.updateState("realm", realmRequest.result);
                })
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
                        if (dataSourceResult[k].realm.id == generalProgramJson.realmCountry.realm.realmId && (dataSourceResult[k].dataSourceType.id == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE || dataSourceResult[k].dataSourceType.id == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE)) {
                            var dataSourceJson = {
                                name: getLabelText(dataSourceResult[k].label, this.props.items.lang),
                                id: dataSourceResult[k].dataSourceId,
                                dataSourceTypeId: dataSourceResult[k].dataSourceType.id,
                                active: dataSourceResult[k].active,
                                label: dataSourceResult[k].label
                            }
                            dataSourceList.push(dataSourceJson);
                        }
                    }
                    if (this.props.useLocalData == 0) {
                        dataSourceList = this.props.items.dataSourceList;
                    }
                    this.setState({
                        dataSourceList: dataSourceList
                    }, () => {
                        this.props.updateState("dataSourceList", dataSourceList);
                    })
                    if (this.state.consumptionEl != "" && this.state.consumptionEl != undefined) {
                        jexcel.destroy(document.getElementById("consumptionTable"), true);
                    }
                    if (this.state.consumptionBatchInfoTableEl != "" && this.state.consumptionBatchInfoTableEl != undefined) {
                        jexcel.destroy(document.getElementById("consumptionBatchInfoTable"), true);
                    }
                    var data = [];
                    var consumptionDataArr = [];
                    var consumptionEditable = true;
                    if (this.props.consumptionPage == "supplyPlanCompare") {
                        consumptionEditable = false;
                    }
                    var roleList = AuthenticationService.getLoggedInUserRole();
                    if ((roleList.length == 1 && roleList[0].roleId == 'ROLE_GUEST_USER') || this.props.items.programQPLDetails.filter(c => c.id == this.props.items.programId)[0].readonly) {
                        consumptionEditable = false;
                    }
                    if (document.getElementById("addConsumptionRowSupplyPlan") != null) {
                        if (this.props.consumptionPage != "supplyPlanCompare" && this.props.consumptionPage != "consumptionDataEntry" && consumptionEditable == false) {
                            document.getElementById("addConsumptionRowSupplyPlan").style.display = "none";
                        } else if (this.props.consumptionPage != "supplyPlanCompare" && this.props.consumptionPage != "consumptionDataEntry" && consumptionEditable == true) {
                            document.getElementById("addConsumptionRowSupplyPlan").style.display = "block";
                        }
                    }
                    var paginationOption = false;
                    var searchOption = false;
                    var filterOption = false;
                    var paginationArray = []
                    if (this.props.consumptionPage == "consumptionDataEntry") {
                        paginationOption = localStorage.getItem("sesRecordCount");
                        searchOption = true;
                        paginationArray = JEXCEL_PAGINATION_OPTION;
                        filterOption = true;
                    }
                    var readonlyRegionAndMonth = true;
                    if (this.props.consumptionPage == "consumptionDataEntry") {
                        readonlyRegionAndMonth = false;
                    }
                    var regionList = (this.props.items.regionList);
                    consumptionList = consumptionList.sort(function (a, b) { return ((new Date(a.consumptionDate) - new Date(b.consumptionDate)) || (a.region.id - b.region.id) || (a.realmCountryPlanningUnit.id - b.realmCountryPlanningUnit.id)) })
                    for (var j = 0; j < consumptionList.length; j++) {
                        var rcpuForTable=realmCountryPlanningUnitList.filter(c=>c.id==consumptionList[j].realmCountryPlanningUnit.id);
                        data = [];
                        var consumptionFlag = 1;
                        if (consumptionList[j].actualFlag == false) {
                            consumptionFlag = 2;
                        }
                        data[0] = consumptionList[j].consumptionDate; 
                        data[1] = consumptionList[j].region.id; 
                        data[2] = consumptionFlag;
                        data[3] = consumptionList[j].dataSource.id; 
                        data[4] = consumptionList[j].realmCountryPlanningUnit.id; 
                        data[5] = Math.round(consumptionList[j].consumptionRcpuQty); 
                        data[6] = (rcpuForTable[0].conversionMethod==1?"*":"/")+rcpuForTable[0].conversionNumber.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
                        data[7] = `=ROUND(F${parseInt(j) + 1}*Q${parseInt(j) + 1},0)`; 
                        data[8] = consumptionList[j].dayOfStockOut;
                        if (consumptionList[j].notes === null || ((consumptionList[j].notes) == "NULL")) {
                            data[9] = "";
                        } else {
                            data[9] = consumptionList[j].notes;
                        }
                        data[10] = consumptionList[j].active;
                        data[11] = consumptionList[j].batchInfoList;
                        var index;
                        if (consumptionList[j].consumptionId != 0) {
                            index = consumptionListUnFiltered.findIndex(c => c.consumptionId == consumptionList[j].consumptionId);
                        } else {
                            index = consumptionListUnFiltered.findIndex(c => c.planningUnit.id == planningUnitId && c.region.id == consumptionList[j].region.id && moment(c.consumptionDate).format("MMM YY") == moment(consumptionList[j].consumptionDate).format("MMM YY") && c.realmCountryPlanningUnit.id == consumptionList[j].realmCountryPlanningUnit.id && c.actualFlag.toString() == consumptionList[j].actualFlag.toString());
                        }
                        data[12] = index;
                        data[13] = 0;
                        data[14] = 0;
                        data[15] = consumptionList[j].consumptionId;
                        data[16] = consumptionList[j].multiplier; 
                        consumptionDataArr[j] = data;
                    }
                    if (consumptionList.length == 0 && consumptionEditable) {
                        data = [];
                        if (this.props.consumptionPage != "consumptionDataEntry") {
                            data[0] = moment(this.props.items.consumptionStartDate).startOf('month').format("YYYY-MM-DD"); 
                            data[1] = this.props.items.consumptionRegion; 
                        } else {
                            data[0] = "";
                            data[1] = regionList.length == 1 ? regionList[0].id : "";
                        }
                        data[2] = "";
                        data[3] = ""; 
                        data[4] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].id : ""; 
                        data[5] = ""; 
                        data[6] = realmCountryPlanningUnitList.length == 1 ? (realmCountryPlanningUnitList[0].conversionMethod==1?"*":"/")+realmCountryPlanningUnitList[0].conversionNumber.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : "";; 
                        data[7] = `=ROUND(F${parseInt(0) + 1}*Q${parseInt(0) + 1},0)`; 
                        data[8] = "";
                        data[9] = "";
                        data[10] = true;
                        data[11] = "";
                        data[12] = -1;
                        data[13] = 1;
                        data[14] = 0;
                        data[15] = 0;
                        data[16] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].multiplier : "";
                        consumptionDataArr[0] = data;
                    }
                    var options = {
                        data: consumptionDataArr,
                        columnDrag: false,
                        columns: [
                            { title: i18n.t('static.pipeline.consumptionDate'), type: 'calendar', options: { format: JEXCEL_MONTH_PICKER_FORMAT, type: 'year-month-picker', validRange: [this.props.items.generalProgramJson.cutOffDate!=undefined && this.props.items.generalProgramJson.cutOffDate!=null && this.props.items.generalProgramJson.cutOffDate!=""?moment(this.props.items.generalProgramJson.cutOffDate).startOf('month').format("YYYY-MM-DD"):moment(MIN_DATE_RESTRICTION_IN_DATA_ENTRY).startOf('month').format("YYYY-MM-DD"), moment(Date.now()).add(MAX_DATE_RESTRICTION_IN_DATA_ENTRY, 'years').endOf('month').format("YYYY-MM-DD")] }, width: 100, readOnly: readonlyRegionAndMonth },
                            { title: i18n.t('static.region.region'), type: 'autocomplete', readOnly: readonlyRegionAndMonth, source: this.props.items.regionList, width: 100 },
                            { type: 'autocomplete', title: i18n.t('static.consumption.consumptionType'), source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.consumption.forcast') }], width: 100 },
                            { title: i18n.t('static.inventory.dataSource'), type: 'autocomplete', source: dataSourceList, width: 120, filter: this.filterDataSourceBasedOnConsumptionType },
                            { title: i18n.t('static.supplyPlan.alternatePlanningUnit'), type: 'autocomplete', source: realmCountryPlanningUnitList, filter: this.filterRealmCountryPlanningUnit, width: 150 },
                            { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: 'numeric', textEditor: true, mask: '#,##', decimal: '.', textEditor: true, disabledMaskOnEdition: true, width: 120, },
                            { title: i18n.t('static.unit.multiplierFromARUTOPU'), type: 'text', width: 90, readOnly: true },
                            { title: i18n.t('static.supplyPlan.quantityPU'), type: 'numeric', mask: '#,##.00', decimal: '.', width: 120, readOnly: true },
                            { title: i18n.t('static.consumption.daysofstockout'), type: 'numeric', mask: '#,##', decimal: '.', disabledMaskOnEdition: true, textEditor: true, width: 80 },
                            { title: i18n.t('static.program.notes'), type: 'text', width: 400 },
                            { title: i18n.t('static.inventory.active'), type: 'checkbox', width: 100, readOnly: !consumptionEditable },
                            {
                                type: 'text', visible: false,
                                width: 0, readOnly: true, autoCasting: false
                            },
                            {
                                type: 'text', visible: false,
                                width: 0, readOnly: true, autoCasting: false
                            },
                            {
                                type: 'text', visible: false,
                                width: 0, readOnly: true, autoCasting: false
                            },
                            { type: 'text', visible: false, width: 0, readOnly: true, autoCasting: false },
                            { type: 'text', visible: false, width: 0, readOnly: true, autoCasting: false },
                            { type: 'text', visible: false, width: 0, readOnly: true, autoCasting: false },
                        ],
                        pagination: paginationOption,
                        onformulachain: this.formulaChanged,
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
                        onload: this.loadedConsumption,
                        editable: consumptionEditable,
                        onchange: this.consumptionChanged,
                        updateTable: function (el, cell, x, y, source, value, id) {
                        }.bind(this),
                        onsearch: function (el) {
                        },
                        onfilter: function (el) {
                            var elInstance = el;
                var json = elInstance.getJson();
                var jsonLength;
                jsonLength = json.length;
                for (var j = 0; j < jsonLength; j++) {
                    try {
                        var rowData = elInstance.getRowData(j);
                        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']
            if (rowData[12] != -1 && rowData[12] !== "" && rowData[12] != undefined) {
                var lastEditableDate = "";
                if (rowData[2] == 1) {
                    lastEditableDate = moment(Date.now()).subtract(this.state.realm.actualConsumptionMonthsInPast + 1, 'months').format("YYYY-MM-DD");
                } else {
                    lastEditableDate = moment(Date.now()).subtract(this.state.realm.forecastConsumptionMonthsInPast + 1, 'months').format("YYYY-MM-DD");
                }
                if (rowData[12] != -1 && moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
                    if (rowData[15] > 0) {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                        cell.classList.add('readonly');
                    }
                }else{
                    if (rowData[2] == 2) {
                        var cell = elInstance.getCell(("I").concat(parseInt(j) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("I").concat(parseInt(j) + 1))
                        cell.classList.remove('readonly');
                    }
                    if (rowData[15] > 0) {
                        var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                        cell.classList.remove('readonly');
                    }
                }
                } else {
                    if (rowData[2] == 2) {
                        var cell = elInstance.getCell(("I").concat(parseInt(j) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("I").concat(parseInt(j) + 1))
                        cell.classList.remove('readonly');
                    }
                    if (rowData[15] > 0) {
                        var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                        cell.classList.remove('readonly');
                    }
                    if (rowData[10] == false) {
                        for (var c = 0; c < colArr.length; c++) {
                            var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                            cell.classList.add('shipmentEntryDoNotInclude');
                        }
                    } else {
                        for (var c = 0; c < colArr.length; c++) {
                            var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                            cell.classList.remove('shipmentEntryDoNotInclude');
                        }
                    }
                }
            } else {
                if (rowData[2] == 2) {
                    var cell = elInstance.getCell(("I").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                } else {
                    var cell = elInstance.getCell(("I").concat(parseInt(j) + 1))
                    cell.classList.remove('readonly');
                }
                if (rowData[15] > 0) {
                    var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                    cell.classList.add('readonly');
                } else {
                    var cell = elInstance.getCell(("C").concat(parseInt(j) + 1))
                    cell.classList.remove('readonly');
                }
                if (rowData[10] == false) {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                        cell.classList.add('shipmentEntryDoNotInclude');
                    }
                } else {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(j) + 1))
                        cell.classList.remove('shipmentEntryDoNotInclude');
                    }
                }
            }
                    } catch (err) {
                    }
                }
                        }.bind(this),
                        contextMenu: function (obj, x, y, e) {
                            var items = [];
                            if (y != null) {
                                var rowData = obj.getRowData(y);
                                if (rowData[2] != 2 && rowData[0] != "" && rowData[1] != "" && rowData[4] != "") {
                                    items.push({
                                        title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                        onclick: function () {
                                            this.batchDetailsClicked(obj, x, y, e, consumptionEditable);
                                        }.bind(this)
                                    });
                                }
                            }
                            if (y == null) {
                            } else {
                                if (consumptionEditable && obj.options.allowInsertRow == true) {
                                    var json = obj.getJson(null, false);
                                    if (consumptionEditable) {
                                        items.push({
                                            title: i18n.t('static.supplyPlan.addNewConsumption'),
                                            onclick: function () {
                                                this.addRowInJexcel()
                                            }.bind(this)
                                        });
                                    }
                                }
                                if (consumptionEditable && obj.options.allowDeleteRow == true && obj.getJson(null, false).length > 1) {
                                    if (obj.getRowData(y)[12] == -1) {
                                        items.push({
                                            title: i18n.t("static.common.deleterow"),
                                            onclick: function () {
                                                this.props.updateState("consumptionChangedFlag", 1);
                                                obj.deleteRow(parseInt(y));
                                            }.bind(this)
                                        });
                                    }
                                }
                            }
                            return items;
                        }.bind(this)
                    }
                    myVar = jexcel(document.getElementById("consumptionTable"), options);
                    this.el = myVar;
                    this.setState({
                        consumptionEl: myVar
                    })
                    this.props.updateState("loading", false);
                }.bind(this)
            }.bind(this)
        }.bind(this);
    }.bind(this);
    }
    /**
     * This function is used when user clicks on the show batch details for a particular consumption record
     * @param {*} obj This is the sheet where the data is being updated
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} e This is mouse event handler
     * @param {*} consumptionEditable This is the value of the flag that indicates whether table should be editable or not
     */
    batchDetailsClicked(obj, x, y, e, consumptionEditable) {
        this.props.updateState("loading", true);
        var rowData = obj.getRowData(y);
        if (this.props.consumptionPage == "consumptionDataEntry") {
            this.props.toggleLarge();
        }
        var batchList = [];
        var date = moment(rowData[0]).startOf('month').format("YYYY-MM-DD");
        var batchInfoList = (this.props.items.batchInfoList.filter(c => c.autoGenerated.toString() == "false"));
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
                    batchId: batchInfoList[k].batchId,
                }
                batchList.push(batchJson);
            }
        }
        this.setState({
            batchInfoList: batchList
        })
        if (this.state.consumptionBatchInfoTableEl != "" && this.state.consumptionBatchInfoTableEl != undefined) {
            jexcel.destroy(document.getElementById("consumptionBatchInfoTable"), true);
        }
        var json = [];
        var consumptionQty = 0;
        var batchInfo = rowData[11];
        consumptionQty = (obj.getValue(`F${parseInt(y) + 1}`, true)).toString().replaceAll("\,", "");
        var consumptionBatchInfoQty = 0;
        var consumptionBatchEditable = consumptionEditable;
        var lastEditableDate = "";
        lastEditableDate = moment(Date.now()).subtract(this.state.realm.actualConsumptionMonthsInPast + 1, 'months').format("YYYY-MM-DD");
        if (moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && rowData[12] != -1 && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
            consumptionBatchEditable = false;
        }
        if (document.getElementById("showConsumptionBatchInfoButtonsDiv") != null) {
            document.getElementById("showConsumptionBatchInfoButtonsDiv").style.display = 'block';
        }
        if (document.getElementById("consumptionBatchAddRow") != null) {
            if (this.props.consumptionPage != "supplyPlanCompare") {
                if (consumptionBatchEditable == false) {
                    document.getElementById("consumptionBatchAddRow").style.display = "none";
                } else {
                    document.getElementById("consumptionBatchAddRow").style.display = "block";
                }
            }
        }
        for (var sb = 0; sb < batchInfo.length; sb++) {
            var data = [];
            data[0] = batchInfo[sb].batch.batchNo + "~" + moment(batchInfo[sb].batch.expiryDate).format("YYYY-MM-DD"); 
            data[1] = moment(batchInfo[sb].batch.expiryDate).format(DATE_FORMAT_CAP);
            data[2] = batchInfo[sb].consumptionQty; 
            data[3] = batchInfo[sb].consumptionTransBatchInfoId; 
            data[4] = y; 
            data[5] = date;
            consumptionBatchInfoQty += Number(batchInfo[sb].consumptionQty);
            json.push(data);
        }
        if (Number(consumptionQty) > consumptionBatchInfoQty) {
            var qty = Number(consumptionQty) - Number(consumptionBatchInfoQty);
            var data = [];
            data[0] = -1; 
            data[1] = "";
            data[2] = qty; 
            data[3] = 0; 
            data[4] = y; 
            data[5] = date;
            json.push(data);
        }
        var options = {
            data: json,
            columnDrag: false,
            columns: [
                { title: i18n.t('static.supplyPlan.batchId'), type: 'autocomplete', source: batchList, filter: this.filterBatchInfoForExistingDataForConsumption, width: 100 },
                { title: i18n.t('static.supplyPlan.expiryDate'), type: 'text', readOnly: true, width: 150 },
                { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: 'numeric', mask: '#,##', disabledMaskOnEdition: true, textEditor: true, width: 80 },
                { title: i18n.t('static.supplyPlan.consumptionTransBatchInfoId'), type: 'hidden', width: 0 },
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
            onchange: this.batchInfoChangedConsumption,
            editable: consumptionBatchEditable,
            license: JEXCEL_PRO_KEY,
            onpaste: this.onPasteForBatchInfo,
            onload: this.loadedBatchInfoConsumption,
            updateTable: function (el, cell, x, y, source, value, id) {
            }.bind(this),
            contextMenu: function (obj, x, y, e) {
                var items = [];
                var items = [];
                if (y == null) {
                } else {
                    if (consumptionBatchEditable) {
                        items.push({
                            title: i18n.t('static.supplyPlan.addNewBatchInfo'),
                            onclick: function () {
                                this.addBatchRowInJexcel()
                            }.bind(this)
                        });
                    }
                    if (consumptionBatchEditable && obj.options.allowDeleteRow == true) {
                        if (obj.getRowData(y)[3] == 0) {
                            items.push({
                                title: i18n.t("static.common.deleterow"),
                                onclick: function () {
                                    if (obj.getJson(null, false).length == 1) {
                                        var rd = obj.getRowData(0);
                                        var rd1 = ((this.state.consumptionEl).getValue(`F${parseInt(rd[4]) + 1}`, true)).toString().replaceAll("\,", "");
                                        var data = [];
                                        data[0] = -1; 
                                        data[1] = "";
                                        data[2] = rd1; 
                                        data[3] = 0; 
                                        data[4] = rd[4]; 
                                        data[5] = rd[5];
                                        obj.insertRow(data);
                                    }
                                    this.props.updateState("consumptionBatchInfoChangedFlag", 1);
                                    obj.deleteRow(parseInt(y));
                                }.bind(this)
                            });
                        }
                    }
                }
                return items;
            }.bind(this)
        };
        var elVar = jexcel(document.getElementById("consumptionBatchInfoTable"), options);
        this.el = elVar;
        this.setState({ consumptionBatchInfoTableEl: elVar });
        this.props.updateState("loading", false);
    }
    /**
     * This function is used when users click on the add row in the consumption table
     */
    addRowInJexcel() {
        var obj = this.state.consumptionEl;
        var json = obj.getJson(null, false);
        var regionList = (this.props.items.regionList);
        var realmCountryPlanningUnitList = this.state.realmCountryPlanningUnitList;
        var data = [];
        if (this.props.consumptionPage != "consumptionDataEntry") {
            data[0] = moment(this.props.items.consumptionStartDate).startOf('month').format("YYYY-MM-DD"); 
            data[1] = this.props.items.consumptionRegion; 
        } else {
            data[0] = "";
            data[1] = regionList.length == 1 ? regionList[0].id : "";
        }
        data[2] = "";
        data[3] = ""; 
        data[4] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].id : ""; 
        data[5] = ""; 
        data[6] = realmCountryPlanningUnitList.length == 1 ? (realmCountryPlanningUnitList[0].conversionMethod==1?"*":"/")+realmCountryPlanningUnitList[0].conversionNumber.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : "";; 
        data[7] = `=ROUND(F${parseInt(json.length) + 1}*Q${parseInt(json.length) + 1},0)`; 
        data[8] = "";
        data[9] = "";
        data[10] = true;
        data[11] = "";
        data[12] = -1;
        data[13] = 1;
        data[14] = 0;
        data[15] = 0;
        data[16] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].multiplier : "";
        obj.insertRow(data);
        if (this.props.consumptionPage == "consumptionDataEntry") {
            var showOption = (document.getElementsByClassName("jss_pagination_dropdown")[0]).value;
            if (showOption != 5000000) {
                var pageNo = parseInt(parseInt(json.length - 1) / parseInt(showOption));
                obj.page(pageNo);
            }
        }
    }
    /**
     * This function is used when users click on the add row in the consumption batch table
     */
    addBatchRowInJexcel() {
        var obj = this.state.consumptionBatchInfoTableEl;
        var rowData = obj.getRowData(0);
        var data = [];
        data[0] = "";
        data[1] = ""
        data[2] = "";
        data[3] = 0;
        data[4] = rowData[4];
        data[5] = rowData[5];
        obj.insertRow(data);
    }
    /**
     * This function is used to format the consumption table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedConsumption = function (instance, cell) {
        if (this.props.consumptionPage != "consumptionDataEntry") {
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
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        tr.children[7].classList.add('InfoTr');
        tr.children[7].title = i18n.t('static.dataentry.conversionFactorTooltip')
        var elInstance = instance.worksheets[0];
        var json = elInstance.getJson(null, false);
        var jsonLength;
        if (this.props.consumptionPage == "consumptionDataEntry") {
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
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']
        for (var y = 0; y < jsonLength; y++) {
            var rowData = elInstance.getRowData(y);
            if (rowData[12] != -1 && rowData[12] !== "" && rowData[12] != undefined) {
                var lastEditableDate = "";
                if (rowData[2] == 1) {
                    lastEditableDate = moment(Date.now()).subtract(this.state.realm.actualConsumptionMonthsInPast + 1, 'months').format("YYYY-MM-DD");
                } else {
                    lastEditableDate = moment(Date.now()).subtract(this.state.realm.forecastConsumptionMonthsInPast + 1, 'months').format("YYYY-MM-DD");
                }
                if (rowData[12] != -1 && moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
                    if (rowData[15] > 0) {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    }
                }else{
                    if (rowData[2] == 2) {
                        var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                    if (rowData[15] > 0) {
                        var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                }
                } else {
                    if (rowData[2] == 2) {
                        var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                    if (rowData[15] > 0) {
                        var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                    if (rowData[10] == false) {
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
            } else {
                if (rowData[2] == 2) {
                    var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                    cell.classList.add('readonly');
                } else {
                    var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                    cell.classList.remove('readonly');
                }
                if (rowData[15] > 0) {
                    var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                    cell.classList.add('readonly');
                } else {
                    var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                    cell.classList.remove('readonly');
                }
                if (rowData[10] == false) {
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
        for (var y = start; y < jsonLength; y++) {
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']
            var rowData = elInstance.getRowData(y);
            if (rowData[12] != -1 && rowData[12] !== "" && rowData[12] != undefined) {
                var lastEditableDate = "";
                if (rowData[2] == 1) {
                    lastEditableDate = moment(Date.now()).subtract(this.state.realm.actualConsumptionMonthsInPast + 1, 'months').format("YYYY-MM-DD");
                } else {
                    lastEditableDate = moment(Date.now()).subtract(this.state.realm.forecastConsumptionMonthsInPast + 1, 'months').format("YYYY-MM-DD");
                }
                if (rowData[12] != -1 && moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
                    if (rowData[15] > 0) {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    }
                    }else{
                        if (rowData[2] == 2) {
                            var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                            cell.classList.add('readonly');
                        } else {
                            var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                            cell.classList.remove('readonly');
                        }
                        if (rowData[15] > 0) {
                            var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                            cell.classList.add('readonly');
                        } else {
                            var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                            cell.classList.remove('readonly');
                        }
                    }
                } else {
                    if (rowData[2] == 2) {
                        var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                    if (rowData[15] > 0) {
                        var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                    if (rowData[10] == false) {
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
            } else {
                if (rowData[2] == 2) {
                    var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                    cell.classList.add('readonly');
                } else {
                    var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                    cell.classList.remove('readonly');
                }
                if (rowData[15] > 0) {
                    var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                    cell.classList.add('readonly');
                } else {
                    var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                    cell.classList.remove('readonly');
                }
                if (rowData[10] == false) {
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
    }
    /**
     * This function is used to filter the data source list based on consumption type and active flag
     */
    filterDataSourceBasedOnConsumptionType = function (instance, cell, c, r, source, conf) {
        var mylist = [];
        var value = (this.state.consumptionEl.getJson(null, false)[r])[2];
        if (value == 1) {
            mylist = this.state.dataSourceList.filter(c => c.dataSourceTypeId == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE && c.active.toString() == "true");
        } else {
            mylist = this.state.dataSourceList.filter(c => c.dataSourceTypeId == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE && c.active.toString() == "true");
        }
        return mylist.sort(function (a, b) {
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
    }.bind(this);
    /**
     * This function is used when some value of the formula cell is changed
     * @param {*} instance This is the object of the DOM element
     * @param {*} executions This is object of the formula cell that is being edited
     */
    formulaChanged = function (instance, executions) {
        var executions = executions;
        for (var e = 0; e < executions.length; e++) {
            this.consumptionChanged(instance, executions[e].cell, executions[e].x, executions[e].y, executions[e].v)
        }
    }
    /**
     * This function is called when something in the consumption table is changed to add the validations or fill some auto values for the cells
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} value This is the updated value
     */
    consumptionChanged = function (instance, cell, x, y, value) {
        var elInstance = this.state.consumptionEl;
        var rowData = elInstance.getRowData(y);
        this.props.updateState("consumptionError", "");
        this.props.updateState("consumptionDuplicateError", "");
        if (x == 0 || x == 1 || x == 2 || x == 3 || x == 4 || x == 5 || x == 8 || x == 9 || x == 10) {
            this.props.updateState("consumptionChangedFlag", 1);
        }
        if (x == 12 || x == 0 || x == 2 || x == 15 || x == 10) {
            var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']
            var rowData = elInstance.getRowData(y);
            if (rowData[12] != -1 && rowData[12] !== "" && rowData[12] != undefined) {
                var lastEditableDate = "";
                if (rowData[2] == 1) {
                    lastEditableDate = moment(Date.now()).subtract(this.state.realm.actualConsumptionMonthsInPast + 1, 'months').format("YYYY-MM-DD");
                } else {
                    lastEditableDate = moment(Date.now()).subtract(this.state.realm.forecastConsumptionMonthsInPast + 1, 'months').format("YYYY-MM-DD");
                }
                if (rowData[12] != -1 && moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
                    if (rowData[15] > 0) {
                    for (var c = 0; c < colArr.length; c++) {
                        var cell = elInstance.getCell((colArr[c]).concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    }
                }else{
                    if (rowData[2] == 2) {
                        var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                    if (rowData[15] > 0) {
                        var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                }
                } else {
                    if (rowData[2] == 2) {
                        var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                    if (rowData[15] > 0) {
                        var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                        cell.classList.add('readonly');
                    } else {
                        var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                        cell.classList.remove('readonly');
                    }
                    if (rowData[10] == false) {
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
            } else {
                if (rowData[2] == 2) {
                    var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                    cell.classList.add('readonly');
                } else {
                    var cell = elInstance.getCell(("I").concat(parseInt(y) + 1))
                    cell.classList.remove('readonly');
                }
                if (rowData[15] > 0) {
                    var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                    cell.classList.add('readonly');
                } else {
                    var cell = elInstance.getCell(("C").concat(parseInt(y) + 1))
                    cell.classList.remove('readonly');
                }
                if (rowData[10] == false) {
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
        if (x != 13 && rowData[13] != 1) {
            elInstance.setValueFromCoords(13, y, 1, true);
        }
        if (x == 0 || x == 10) {
            var valid = checkValidtion("dateWithInvalidDataEntry", "A", y, rowData[0], elInstance, "", "", "", 0);
            if (valid == true) {
                if (rowData[2] != "" && rowData[2] != undefined && rowData[2] == ACTUAL_CONSUMPTION_TYPE && rowData[10].toString() == "true" && moment(rowData[0]).format("YYYY-MM") > moment(Date.now()).format("YYYY-MM")) {
                    inValid("C", y, i18n.t('static.supplyPlan.noActualConsumptionForFuture'), elInstance);
                } else {
                    positiveValidation("C", y, elInstance);
                }
            }
            var valid = checkValidtion("text", "E", y, rowData[4], elInstance);
        }
        if (x == 1) {
            var valid = checkValidtion("text", "B", y, rowData[1], elInstance);
            var valid = checkValidtion("text", "E", y, rowData[4], elInstance);
        }
        if (x == 3) {
            var valid = checkValidtion("text", "D", y, rowData[3], elInstance);
        }
        if (x == 4) {
            elInstance.setValueFromCoords(6, y, "", true);
            elInstance.setValueFromCoords(16, y, "", true);
            var valid = checkValidtion("text", "E", y, rowData[4], elInstance);
            if (valid == true) {
                var rcpuForTable = (this.state.realmCountryPlanningUnitList.filter(c => c.id == rowData[4].toString().split(";")[0])[0]);
                elInstance.setValueFromCoords(6, y, (rcpuForTable.conversionMethod==1?"*":"/")+rcpuForTable.conversionNumber.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","), true);
                elInstance.setValueFromCoords(16, y, rcpuForTable.multiplier, true);
            }
        }
        if (x == 5) {
            var valid = checkValidtion("number", "F", y, elInstance.getValue(`F${parseInt(y) + 1}`, true), elInstance, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, 1, 1);
            if (valid == true) {
                var batchDetails = rowData[11];
                var consumptionBatchQty = 0;
                for (var b = 0; b < batchDetails.length; b++) {
                    consumptionBatchQty += Number(batchDetails[b].consumptionQty);
                }
                if (batchDetails.length > 0 && Number(elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "")) < Number(consumptionBatchQty)) {
                    inValid("F", y, i18n.t('static.consumption.missingBatch'), elInstance);
                    valid = false;
                } else {
                    positiveValidation("F", y, elInstance)
                }
            }
        }
        if (x == 11) {
            var batchDetails = rowData[11];
            var consumptionBatchQty = 0;
            for (var b = 0; b < batchDetails.length; b++) {
                consumptionBatchQty += batchDetails[b].consumptionQty;
            }
            if (batchDetails.length > 0 && Number(elInstance.getValue(`F${parseInt(y) + 1}`, true).replaceAll(",", "")) < Number(consumptionBatchQty)) {
                inValid("F", y, i18n.t('static.consumption.missingBatch'), elInstance);
                valid = false;
            } else {
                positiveValidation("F", y, elInstance)
            }
        }
        if (x == 8) {
            var valid = checkValidtion("numberNotRequired", "I", y, elInstance.getValue(`I${parseInt(y) + 1}`, true), elInstance, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, 1, 1);
            if (valid == true) {
                if (Number(elInstance.getValue(`I${parseInt(y) + 1}`, true)) > 31) {
                    inValid("I", y, i18n.t('static.supplyPlan.daysOfStockMaxValue'), elInstance);
                } else {
                    positiveValidation("I", y, elInstance);
                }
            }
        }
        if (x == 9) {
        }
        if (x == 2) {
            var valid = checkValidtion("text", "E", y, rowData[4], elInstance);
            var dataSource = rowData[3];
            var dataSourceType = "";
            if (dataSource != undefined && dataSource != "") {
                dataSourceType = this.state.dataSourceList.filter(c => c.id == dataSource)[0].dataSourceTypeId;
            }
            if (dataSourceType != "" && dataSourceType != undefined && (dataSourceType == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE && rowData[2] == 2) || (dataSourceType == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE && rowData[2] == 1)) {
            } else {
                elInstance.setValueFromCoords(3, y, "", true);
            }
            elInstance.setValueFromCoords(11, y, "", true);
            var valid = checkValidtion("text", "C", y, rowData[2], elInstance);
            if (valid == true) {
                if (rowData[2] != "" && rowData[2] != undefined && rowData[2] == ACTUAL_CONSUMPTION_TYPE && moment(rowData[0]).format("YYYY-MM") > moment(Date.now()).format("YYYY-MM") && rowData[10].toString() == "true") {
                    inValid("C", y, i18n.t('static.supplyPlan.noActualConsumptionForFuture'), elInstance);
                } else {
                    positiveValidation("C", y, elInstance);
                }
            }
            if (rowData[2] == 2) {
                elInstance.setValueFromCoords(8, y, "", true);
            }
        }
    }
    /**
     * This function is used to filter the batch list based on expiry date and created date
     */
    filterBatchInfoForExistingDataForConsumption = function (instance, cell, c, r, source) {
        var mylist = [];
        var json = this.state.consumptionBatchInfoTableEl.getJson(null, false)
        var date = (json[r])[5];
        mylist = this.state.batchInfoList.filter(c => c.id == 0 || c.id != -1 && (moment(c.expiryDate).format("YYYY-MM") > moment(date).format("YYYY-MM") && moment(c.createdDate).format("YYYY-MM") <= moment(date).format("YYYY-MM")));
        return mylist;
    }.bind(this)
    /**
     * This function is used to format the consumption batch info table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loadedBatchInfoConsumption = function (instance, cell) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("jss")[1].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
    }
    /**
     * This function is called when something in the consumption batch info table is changed to add the validations or fill some auto values for the cells
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     * @param {*} x This is the value of the column number that is being updated
     * @param {*} y This is the value of the row number that is being updated
     * @param {*} value This is the updated value
     */
    batchInfoChangedConsumption = function (instance, cell, x, y, value) {
        var elInstance = this.state.consumptionBatchInfoTableEl;
        var rowData = elInstance.getRowData(y);
        this.props.updateState("consumptionBatchError", "");
        this.props.updateState("consumptionBatchInfoDuplicateError", "");
        this.props.updateState("consumptionBatchInfoNoStockError", "");
        this.props.updateState("consumptionBatchInfoChangedFlag", 1);
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
        if (x == 2) {
            checkValidtion("number", "C", y, elInstance.getValue(`C${parseInt(y) + 1}`, true), elInstance, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, 1, 1);
        }
    }
    /**
     * This function is called before saving the consumption batch info to check validations for all the rows that are available in the table
     * @returns This functions return true or false. It returns true if all the data is sucessfully validated. It returns false if some validation fails.
     */
    checkValidationConsumptionBatchInfo() {
        var valid = true;
        var elInstance = this.state.consumptionBatchInfoTableEl;
        var json = elInstance.getJson(null, false);
        var mapArray = [];
        var totalConsumptionBatchQty = 0;
        var rowNumber = json[0][4];
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
                this.props.updateState("consumptionBatchInfoDuplicateError", i18n.t('static.supplyPlan.duplicateBatchNumber'));
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
                validation = checkValidtion("text", "A", y, elInstance.getValueFromCoords(0, y, true), elInstance);
                if (validation == false) {
                    valid = false;
                }
                validation = checkValidtion("number", "C", y, elInstance.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", ""), elInstance, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, 1, 1);
                if (validation == false) {
                    valid = false;
                }
                // var batchDetails=this.props.items.batchInfoList.filter(c => (c.batchNo == (elInstance.getCell(`A${parseInt(y) + 1}`).innerText).split("~")[0] && moment(c.expiryDate).format("YYYY-MM") == moment((elInstance.getCell(`A${parseInt(y) + 1}`).innerText).split("~")[1]).format("YYYY-MM")));
                // if(batchDetails.length>0){
                //     if(batchDetails[0].qtyAvailable<Number(elInstance.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", ""))){
                //         inValid("C", y, i18n.t('static.supplyPlan.qtyNotAvailable'), elInstance);
                //         valid=false;
                //     }
                // }
                totalConsumptionBatchQty += Number(elInstance.getValue(`C${parseInt(y) + 1}`, true).toString().replaceAll(",", ""));
            }
        }
        if (valid == true) {
            var consumptionInstance = this.state.consumptionEl;
            var consumptionQty = consumptionInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "");
            if (Number(consumptionQty) < Number(totalConsumptionBatchQty)) {
                this.props.updateState("consumptionBatchInfoNoStockError", i18n.t('static.consumption.missingBatch'));
                this.props.hideThirdComponent();
                valid = false;
            }
        }
        return valid;
    }
    /**
     * This function is called when submit button of the consumption batch info is clicked and is used to save consumption batch info if all the data is successfully validated.
     */
    saveConsumptionBatchInfo() {
        this.props.updateState("loading", true);
        var validation = this.checkValidationConsumptionBatchInfo();
        if (validation == true) {
            var elInstance = this.state.consumptionBatchInfoTableEl;
            var json = elInstance.getJson(null, false);
            var batchInfoArray = [];
            var rowNumber = 0;
            var totalConsumption = 0;
            var countForNonFefo = 0;
            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                if (i == 0) {
                    rowNumber = map.get("4");
                }
                if (map.get("0") != -1) {
                    countForNonFefo += 1;
                    var batchInfoJson = {
                        consumptionTransBatchInfoId: map.get("3"),
                        batch: {
                            batchId: this.state.batchInfoList.filter(c => c.name == (elInstance.getCell(`A${parseInt(i) + 1}`).innerText))[0].batchId,
                            batchNo: (elInstance.getCell(`A${parseInt(i) + 1}`).innerText).split("~")[0],
                            autoGenerated: 0,
                            planningUnitId: parseInt(document.getElementById("planningUnitId").value),
                            expiryDate: moment(map.get("1")).format("YYYY-MM-DD"),
                            createdDate: this.state.batchInfoList.filter(c => c.name == (elInstance.getCell(`A${parseInt(i) + 1}`).innerText))[0].createdDate
                        },
                        consumptionQty: Number(elInstance.getValue(`C${parseInt(i) + 1}`, true).toString().replaceAll("\,", "")),
                    }
                    batchInfoArray.push(batchInfoJson);
                }
                totalConsumption += Number(elInstance.getValue(`C${parseInt(i) + 1}`, true).toString().replaceAll("\,", ""));
            }
            var allConfirm = true;
            var consumptionInstance = this.state.consumptionEl;
            var consumptionQty = consumptionInstance.getValue(`F${parseInt(rowNumber) + 1}`, true).toString().replaceAll("\,", "");
            if (allConfirm == true) {
                if (consumptionQty < totalConsumption) {
                    consumptionInstance.setValueFromCoords(5, rowNumber, totalConsumption, true);
                }
                consumptionInstance.setValueFromCoords(11, rowNumber, batchInfoArray, true);
                this.setState({
                    consumptionChangedFlag: 1,
                    consumptionBatchInfoChangedFlag: 0,
                    consumptionBatchInfoTableEl: ''
                })
                this.props.updateState("consumptionChangedFlag", 1);
                this.props.updateState("consumptionBatchInfoChangedFlag", 0);
                this.props.updateState("consumptionBatchInfoTableEl", "");
                this.setState({
                    consumptionBatchInfoTableEl: ""
                })
                if (document.getElementById("showConsumptionBatchInfoButtonsDiv") != null) {
                    document.getElementById("showConsumptionBatchInfoButtonsDiv").style.display = 'none';
                }
                if (this.props.consumptionPage == "consumptionDataEntry") {
                    this.props.toggleLarge("submit");
                }
                jexcel.destroy(document.getElementById("consumptionTable"), true);
            }
            this.props.updateState("loading", false);
        } else {
            this.props.updateState("consumptionBatchError", i18n.t('static.supplyPlan.validationFailed'));
            this.props.updateState("loading", false);
            this.props.hideThirdComponent();
        }
    }
    /**
     * This function is called before saving the consumption data to check validations for all the rows that are available in the table
     * @returns This functions return true or false. It returns true if all the data is sucessfully validated. It returns false if some validation fails.
     */
    checkValidationConsumption() {
        var valid = true;
        var elInstance = this.state.consumptionEl;
        var json = elInstance.getJson(null, false);
        var consumptionDataList = this.props.items.consumptionListUnFiltered;
        var coList = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            var actualFlag = true;
            if (map.get("2") == 2) {
                actualFlag = false;
            }
            if (parseInt(map.get("12")) != -1) {
                consumptionDataList[parseInt(map.get("12"))].consumptionDate = moment(map.get("0")).startOf('month').format("YYYY-MM-DD");
                consumptionDataList[parseInt(map.get("12"))].region.id = map.get("1");
                consumptionDataList[parseInt(map.get("12"))].realmCountryPlanningUnit.id = map.get("4");
                consumptionDataList[parseInt(map.get("12"))].actualFlag = actualFlag;
            } else {
                var consumptionJson = {
                    consumptionId: 0,
                    region: {
                        id: map.get("1"),
                    },
                    consumptionDate: moment(map.get("0")).startOf('month').format("YYYY-MM-DD"),
                    realmCountryPlanningUnit: {
                        id: map.get("4")
                    },
                    actualFlag: actualFlag,
                }
                coList.push(consumptionJson);
            }
        }
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            var checkDuplicate = (consumptionDataList.concat(coList)).filter(c =>
                c.realmCountryPlanningUnit.id == map.get("4") &&
                moment(c.consumptionDate).format("YYYY-MM") == moment(map.get("0")).format("YYYY-MM") &&
                c.region.id == map.get("1") &&
                (c.actualFlag.toString() == "true" ? ACTUAL_CONSUMPTION_TYPE : FORCASTED_CONSUMPTION_TYPE) == map.get("2"));
            if (checkDuplicate.length > 1) {
                var colArr = ['E'];
                for (var c = 0; c < colArr.length; c++) {
                    inValid(colArr[c], y, i18n.t('static.supplyPlan.duplicateConsumption'), elInstance);
                }
                valid = false;
                elInstance.setValueFromCoords(14, y, 1, true);
                this.props.updateState("consumptionDuplicateError", i18n.t('static.supplyPlan.duplicateConsumption'));
                this.props.hideSecondComponent();
            } else {
                var rowData = elInstance.getRowData(y);
                if (rowData[12] !== "" && rowData[12] != undefined) {
                    var lastEditableDate = "";
                    if (rowData[2] == 1) {
                        lastEditableDate = moment(Date.now()).subtract(this.state.realm.actualConsumptionMonthsInPast + 1, 'months').format("YYYY-MM-DD");
                    } else {
                        lastEditableDate = moment(Date.now()).subtract(this.state.realm.forecastConsumptionMonthsInPast + 1, 'months').format("YYYY-MM-DD");
                    }
                    if (rowData[12] != -1 && moment(rowData[0]).format("YYYY-MM") < moment(lastEditableDate).format("YYYY-MM-DD") && !AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes("ROLE_BF_READONLY_ACCESS_REALM_ADMIN")) {
                    } else {
                        var colArr = ['E'];
                        for (var c = 0; c < colArr.length; c++) {
                            positiveValidation(colArr[c], y, elInstance);
                        }
                        var rowData = elInstance.getRowData(y);
                        var validation = checkValidtion("dateWithInvalidDataEntry", "A", y, rowData[0], elInstance, "", "", "", 0);
                        if (validation == false) {
                            valid = false;
                            elInstance.setValueFromCoords(14, y, 1, true);
                        } else {
                            if (rowData[2] != "" && rowData[2] != undefined && rowData[2] == ACTUAL_CONSUMPTION_TYPE && moment(rowData[0]).format("YYYY-MM") > moment(Date.now()).format("YYYY-MM") && rowData[10].toString() == "true") {
                                inValid("C", y, i18n.t('static.supplyPlan.noActualConsumptionForFuture'), elInstance);
                                valid = false;
                            } else {
                                positiveValidation("C", y, elInstance);
                            }
                        }
                        validation = checkValidtion("text", "B", y, rowData[1], elInstance);
                        if (validation == false) {
                            valid = false;
                            elInstance.setValueFromCoords(14, y, 1, true);
                        }
                        validation = checkValidtion("text", "B", y, elInstance.getValueFromCoords(1, y, true), elInstance);
                        if (validation == false) {
                            valid = false;
                            elInstance.setValueFromCoords(14, y, 1, true);
                        }
                        validation = checkValidtion("text", "D", y, rowData[3], elInstance);
                        if (validation == false) {
                            valid = false;
                            elInstance.setValueFromCoords(14, y, 1, true);
                        }
                        validation = checkValidtion("text", "E", y, rowData[4], elInstance);
                        if (validation == false) {
                            valid = false;
                            elInstance.setValueFromCoords(14, y, 1, true);
                        }
                        validation = checkValidtion("text", "D", y, elInstance.getValueFromCoords(3, y, true), elInstance);
                        if (validation == false) {
                            valid = false;
                            elInstance.setValueFromCoords(14, y, 1, true);
                        }
                        validation = checkValidtion("text", "E", y, elInstance.getValueFromCoords(4, y, true), elInstance);
                        if (validation == false) {
                            valid = false;
                            elInstance.setValueFromCoords(14, y, 1, true);
                        }
                        validation = checkValidtion("number", "F", y, elInstance.getValue(`F${parseInt(y) + 1}`, true), elInstance, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, 1, 1);
                        if (validation == false) {
                            valid = false;
                            elInstance.setValueFromCoords(14, y, 1, true);
                        } else {
                            var batchDetails = rowData[11];
                            var consumptionBatchQty = 0;
                            for (var b = 0; b < batchDetails.length; b++) {
                                consumptionBatchQty += batchDetails[b].consumptionQty;
                            }
                            if (batchDetails.length > 0 && Number(elInstance.getValue(`F${parseInt(y) + 1}`, true).toString().replaceAll("\,", "")) < Number(consumptionBatchQty)) {
                                inValid("F", y, i18n.t('static.consumption.missingBatch'), elInstance);
                                valid = false;
                            } else {
                                positiveValidation("F", y, elInstance)
                            }
                        }
                        validation = checkValidtion("numberNotRequired", "I", y, elInstance.getValue(`I${parseInt(y) + 1}`, true), elInstance, JEXCEL_INTEGER_REGEX_FOR_DATA_ENTRY, 1, 1);
                        if (validation == false) {
                            valid = false;
                            elInstance.setValueFromCoords(14, y, 1, true);
                        } else {
                            if (Number(elInstance.getValue(`I${parseInt(y) + 1}`, true)) > 31) {
                                inValid("I", y, i18n.t('static.supplyPlan.daysOfStockMaxValue'), elInstance);
                                valid = false;
                            } else {
                                positiveValidation("I", y, elInstance);
                            }
                        }
                        validation = checkValidtion("text", "C", y, rowData[2], elInstance);
                        if (validation == false) {
                            valid = false;
                            elInstance.setValueFromCoords(14, y, 1, true);
                        } else {
                            if (rowData[2] != "" && rowData[2] != undefined && rowData[2] == ACTUAL_CONSUMPTION_TYPE && moment(rowData[0]).format("YYYY-MM") > moment(Date.now()).format("YYYY-MM") && rowData[10].toString() == "true") {
                                inValid("C", y, i18n.t('static.supplyPlan.noActualConsumptionForFuture'), elInstance);
                                valid = false;
                            } else {
                                positiveValidation("C", y, elInstance);
                            }
                        }
                    }
                }
            }
        }
        return valid;
    }
    /**
     * This function is called when submit button of the consumption is clicked and is used to save consumption if all the data is successfully validated.
     */
    saveConsumption() {
        this.props.updateState("consumptionError", "");
        this.props.updateState("loading", true);
        var validation = this.checkValidationConsumption();
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            var elInstance = this.state.consumptionEl;
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
                if (this.props.consumptionPage == "whatIf") {
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
                    var consumptionDataList = (programJson.consumptionList);
                    var actionList = generalProgramJson.actionList;
                    if (actionList == undefined) {
                        actionList = []
                    }
                    var minDate = "";
                    var minDateActualConsumption = "";
                    var minDateForcastedConsumption = "";
                    var actualConsumptionModified = 0;
                    var forecastedConsumptionModified = 0;
                    var curDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                    var curUser = AuthenticationService.getLoggedInUserId();
                    for (var i = 0; i < json.length; i++) {
                        var map = new Map(Object.entries(json[i]));
                        if (map.get("13") == 1) {
                            if (minDate == "") {
                                minDate = moment(map.get("0")).format("YYYY-MM-DD");
                            } else if (minDate != "" && moment(map.get("0")).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                minDate = moment(map.get("0")).format("YYYY-MM-DD");
                            }
                            if (map.get("2") == 2) {
                                forecastedConsumptionModified = 1;
                                if (minDateForcastedConsumption == "") {
                                    minDateForcastedConsumption = moment(map.get("0")).format("YYYY-MM-DD");
                                } else if (minDateForcastedConsumption != "" && moment(map.get("0")).format("YYYY-MM") < moment(minDateForcastedConsumption).format("YYYY-MM")) {
                                    minDateForcastedConsumption = moment(map.get("0")).format("YYYY-MM-DD");
                                }
                            } else {
                                actualConsumptionModified = 1;
                                if (minDateActualConsumption == "") {
                                    minDateActualConsumption = moment(map.get("0")).format("YYYY-MM-DD");
                                } else if (minDateActualConsumption != "" && moment(map.get("0")).format("YYYY-MM") < moment(minDateActualConsumption).format("YYYY-MM")) {
                                    minDateActualConsumption = moment(map.get("0")).format("YYYY-MM-DD");
                                }
                            }
                        }
                        var actualFlag = true;
                        if (map.get("2") == 2) {
                            actualFlag = false;
                        }
                        let dataSourceId = '';
                        let dataSourceLabel = '';
                        if (map.get("3") == "14;15") {
                            if (map.get("2") == 1) { 
                                dataSourceId = 14;
                                dataSourceLabel = (this.state.dataSourceList).filter(c => c.id == 14)[0].label
                            } else { 
                                dataSourceId = 15;
                                dataSourceLabel = (this.state.dataSourceList).filter(c => c.id == 15)[0].label
                            }
                        } else {
                            dataSourceId = map.get("3");
                            dataSourceLabel = (this.state.dataSourceList).filter(c => c.id == map.get("3"))[0].label
                        }
                        if (parseInt(map.get("12")) != -1) {
                            consumptionDataList[parseInt(map.get("12"))].consumptionDate = moment(map.get("0")).startOf('month').format("YYYY-MM-DD");
                            consumptionDataList[parseInt(map.get("12"))].region.id = map.get("1");
                            consumptionDataList[parseInt(map.get("12"))].region.label = (this.props.items.regionList).filter(c => c.id == map.get("1"))[0].label;
                            consumptionDataList[parseInt(map.get("12"))].dataSource.id = dataSourceId;
                            consumptionDataList[parseInt(map.get("12"))].dataSource.label = dataSourceLabel;
                            consumptionDataList[parseInt(map.get("12"))].realmCountryPlanningUnit.id = map.get("4");
                            consumptionDataList[parseInt(map.get("12"))].realmCountryPlanningUnit.label = (this.state.realmCountryPlanningUnitList).filter(c => c.id == map.get("4"))[0].label;
                            consumptionDataList[parseInt(map.get("12"))].multiplier = map.get("16");
                            consumptionDataList[parseInt(map.get("12"))].consumptionRcpuQty = (elInstance.getValue(`F${parseInt(i) + 1}`, true)).toString().replaceAll("\,", "");
                            consumptionDataList[parseInt(map.get("12"))].consumptionQty = (elInstance.getValue(`H${parseInt(i) + 1}`, true)).toString().replaceAll("\,", "");
                            consumptionDataList[parseInt(map.get("12"))].dayOfStockOut = (elInstance.getValue(`I${parseInt(i) + 1}`, true)).toString().replaceAll("\,", "");
                            consumptionDataList[parseInt(map.get("12"))].notes = map.get("9");
                            consumptionDataList[parseInt(map.get("12"))].actualFlag = actualFlag;
                            consumptionDataList[parseInt(map.get("12"))].active = map.get("10");
                            if (map.get("13") == 1) {
                                consumptionDataList[parseInt(map.get("12"))].lastModifiedBy.userId = curUser;
                                consumptionDataList[parseInt(map.get("12"))].lastModifiedDate = curDate;
                            }
                            if (map.get("11") != "") {
                                consumptionDataList[parseInt(map.get("12"))].batchInfoList = map.get("11");
                            } else {
                                consumptionDataList[parseInt(map.get("12"))].batchInfoList = [];
                            }
                        } else {
                            var batchInfoList = [];
                            if (map.get("11") != "") {
                                batchInfoList = map.get("11");
                            }
                            var consumptionJson = {
                                consumptionId: 0,
                                dataSource: {
                                    id: dataSourceId,
                                    label: dataSourceLabel
                                },
                                region: {
                                    id: map.get("1"),
                                    label: (this.props.items.regionList).filter(c => c.id == map.get("1"))[0].label
                                },
                                consumptionDate: moment(map.get("0")).startOf('month').format("YYYY-MM-DD"),
                                consumptionRcpuQty: elInstance.getValue(`F${parseInt(i) + 1}`, true).toString().replaceAll("\,", ""),
                                consumptionQty: (elInstance.getValue(`H${parseInt(i) + 1}`, true)).toString().replaceAll("\,", ""),
                                dayOfStockOut: elInstance.getValue(`I${parseInt(i) + 1}`, true).toString().replaceAll("\,", ""),
                                active: map.get("10"),
                                realmCountryPlanningUnit: {
                                    id: map.get("4"),
                                    label: (this.state.realmCountryPlanningUnitList).filter(c => c.id == map.get("4"))[0].label
                                },
                                multiplier: map.get("16"),
                                planningUnit: {
                                    id: planningUnitId,
                                    label: (this.props.items.planningUnitListAll.filter(c => c.planningUnit.id == planningUnitId)[0]).planningUnit.label
                                },
                                notes: map.get("9"),
                                batchInfoList: batchInfoList,
                                actualFlag: actualFlag,
                                createdBy: {
                                    userId: curUser
                                },
                                createdDate: curDate,
                                lastModifiedBy: {
                                    userId: curUser
                                },
                                lastModifiedDate: curDate
                            }
                            consumptionDataList.push(consumptionJson);
                        }
                    }
                    if (actualConsumptionModified == 1) {
                        actionList.push({
                            planningUnitId: planningUnitId,
                            type: ACTUAL_CONSUMPTION_MODIFIED,
                            date: moment(minDateActualConsumption).startOf('month').format("YYYY-MM-DD")
                        })
                    }
                    if (forecastedConsumptionModified) {
                        actionList.push({
                            planningUnitId: planningUnitId,
                            type: FORECASTED_CONSUMPTION_MODIFIED,
                            date: moment(minDateForcastedConsumption).startOf('month').format("YYYY-MM-DD")
                        })
                    }
                    programJson.consumptionList = consumptionDataList;
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
                        if (this.props.consumptionPage == "whatIf") {
                            objectStore = 'whatIfProgramData';
                        } else {
                            objectStore = 'programData';
                        }
                        calculateSupplyPlan(programId, planningUnitId, objectStore, "consumption", this.props, [], moment(minDate).startOf('month').format("YYYY-MM-DD"));
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.props.updateState("consumptionError", i18n.t('static.supplyPlan.validationFailed'));
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