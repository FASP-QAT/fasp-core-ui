import React from "react";
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
// import jexcel from 'jexcel-pro';
// import "../../../node_modules/jexcel-pro/dist/jexcel.css";
// import "../../../node_modules/jsuites/dist/jsuites.css";
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunctionOnlyHideRow, checkValidtion, inValid, positiveValidation, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { SECRET_KEY, INTEGER_NO_REGEX, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, JEXCEL_DATE_FORMAT_WITHOUT_DATE, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE } from "../../Constants";
import moment from "moment";
import CryptoJS from 'crypto-js'
import { calculateSupplyPlan } from "./SupplyPlanCalculations";


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
        this.showOnlyErrors = this.showOnlyErrors.bind(this);
        this.addRowInJexcel = this.addRowInJexcel.bind(this);
        this.addBatchRowInJexcel = this.addBatchRowInJexcel.bind(this)
        this.state = {
            consumptionEl: "",
            consumptionBatchInfoTableEl: ""
        }
    }

    showOnlyErrors() {
        var checkBoxValue = document.getElementById("showErrors");
        var elInstance = this.state.consumptionEl;
        var json = elInstance.getJson();
        var showOption = (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
        if (json.length < showOption) {
            showOption = json.length;
        }
        if (checkBoxValue.checked == true) {
            console.log("in ncheck box true");
            for (var j = 0; j < parseInt(showOption); j++) {
                var rowData = elInstance.getRowData(j);
                console.log("in for loop", rowData[14], "j--->", j);
                var asterisk = document.getElementsByClassName("jexcel_content")[0];
                console.log("asterisk", asterisk);
                var tr = (asterisk.childNodes[0]).childNodes[2];
                if (rowData[14].toString() == 1) {
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
        console.log("In cvompionent")
    }

    showConsumptionData() {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var consumptionListUnFiltered = this.props.items.consumptionListUnFiltered;
        var consumptionList = this.props.items.consumptionList;
        var programJson = this.props.items.programJson;
        console.log("Program Json", this.props.items);
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
                this.setState({
                    realmCountryPlanningUnitList: realmCountryPlanningUnitList
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
                    for (var k = 0; k < dataSourceResult.length; k++) {
                        if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0) {
                            if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId && (dataSourceResult[k].dataSourceType.id == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE || dataSourceResult[k].dataSourceType.id == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE)) {
                                var dataSourceJson = {
                                    name: getLabelText(dataSourceResult[k].label, this.props.items.lang),
                                    id: dataSourceResult[k].dataSourceId,
                                    dataSourceTypeId: dataSourceResult[k].dataSourceType.id,
                                    active: dataSourceResult[k].active
                                }
                                dataSourceList.push(dataSourceJson);
                            }
                        }
                    }

                    this.setState({
                        dataSourceList: dataSourceList
                    })
                    if (this.state.consumptionEl != "" && this.state.consumptionEl != undefined) {
                        this.state.consumptionEl.destroy();
                    }
                    if (this.state.consumptionBatchInfoTableEl != "" && this.state.consumptionBatchInfoTableEl != undefined) {
                        this.state.consumptionBatchInfoTableEl.destroy();
                    }
                    var data = [];
                    var consumptionDataArr = [];
                    var consumptionEditable = true;
                    if (this.props.consumptionPage == "supplyPlanCompare") {
                        consumptionEditable = false;
                    }
                    var paginationOption = false;
                    var searchOption = false;
                    var paginationArray = []
                    if (this.props.consumptionPage == "consumptionDataEntry") {
                        paginationOption = 10;
                        searchOption = true;
                        paginationArray = [10, 25, 50];
                    }

                    var readonlyRegionAndMonth = true;
                    if (this.props.consumptionPage == "consumptionDataEntry") {
                        readonlyRegionAndMonth = false;
                    }
                    var regionList = (this.props.items.regionList);
                    for (var j = 0; j < consumptionList.length; j++) {
                        data = [];
                        var consumptionFlag = 1;
                        if (consumptionList[j].actualFlag == false) {
                            consumptionFlag = 2;
                        }
                        data[0] = consumptionList[j].consumptionDate; //A
                        data[1] = consumptionList[j].region.id; //B                        
                        data[2] = consumptionFlag;
                        data[3] = consumptionList[j].dataSource.id; //D
                        data[4] = consumptionList[j].realmCountryPlanningUnit.id; //E
                        data[5] = Math.round(consumptionList[j].consumptionRcpuQty); //F
                        data[6] = consumptionList[j].multiplier; //G
                        data[7] = `=F${parseInt(j) + 1}*G${parseInt(j) + 1}`; //H
                        data[8] = consumptionList[j].dayOfStockOut;
                        if (consumptionList[j].notes === null || ((consumptionList[j].notes).trim() == "NULL")) {
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
                        consumptionDataArr[j] = data;
                    }
                    if (consumptionList.length == 0) {
                        data = [];
                        if (this.props.consumptionPage != "consumptionDataEntry") {
                            data[0] = moment(this.props.items.consumptionStartDate).startOf('month').format("YYYY-MM-DD"); //A
                            data[1] = this.props.items.consumptionRegion; //B                        
                        } else {
                            data[0] = "";
                            data[1] = regionList.length == 1 ? regionList[0].id : "";
                        }
                        data[2] = "";
                        data[3] = ""; //C
                        data[4] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].id : ""; //D
                        data[5] = ""; //E
                        data[6] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].multiplier : "";; //F
                        data[7] = `=F${parseInt(0) + 1}*G${parseInt(0) + 1}`; //I
                        data[8] = "";
                        data[9] = "";
                        data[10] = true;
                        data[11] = "";
                        data[12] = -1;
                        data[13] = 1;
                        data[14] = 0;
                        consumptionDataArr[0] = data;
                    }
                    var options = {
                        data: consumptionDataArr,
                        columnDrag: true,
                        columns: [
                            { title: i18n.t('static.pipeline.consumptionDate'), type: 'calendar', options: { format: JEXCEL_DATE_FORMAT_WITHOUT_DATE }, width: 85, readOnly: readonlyRegionAndMonth },
                            { title: i18n.t('static.region.region'), type: 'dropdown', readOnly: readonlyRegionAndMonth, source: this.props.items.regionList, width: 100 },
                            { type: 'dropdown', title: i18n.t('static.consumption.consumptionType'), source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.consumption.forcast') }], width: 100 },
                            { title: i18n.t('static.inventory.dataSource'), type: 'dropdown', source: dataSourceList, width: 100, filter: this.filterDataSourceBasedOnConsumptionType },
                            { title: i18n.t('static.supplyPlan.alternatePlanningUnit'), type: 'dropdown', source: realmCountryPlanningUnitList, filter: this.filterRealmCountryPlanningUnit, width: 150 },
                            { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: 'numeric', mask: '#,##.00', decimal: '.', width: 80 },
                            { title: i18n.t('static.unit.multiplier'), type: 'numeric', mask: '#,##.00', decimal: '.', width: 80, readOnly: true },
                            { title: i18n.t('static.supplyPlan.quantityQATProduct'), type: 'numeric', mask: '#,##.00', decimal: '.', width: 80, readOnly: true },
                            { title: i18n.t('static.consumption.daysofstockout'), type: 'numeric', mask: '#,##.00', decimal: '.', width: 80 },
                            { title: i18n.t('static.program.notes'), type: 'text', width: 200 },
                            { title: i18n.t('static.inventory.active'), type: 'checkbox', width: 100 },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 0 },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.index'), width: 0 },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.isChanged'), width: 0 },
                            { type: 'hidden', width: 0 }
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
                        // filters: true,
                        // license: 'NjBkYTU0YmJhMDI5MzUzODc3ZmY0OTg2NjFiYjQ4ZmQ4YTgxZjlmMGIxOTI5M2RiZTI5NGIyYzJkMDhmNDYwN2Y0NzFmNmFjYzEyNzZmNGJhN2ZiZjVjOTk0ZjFiMzc2ZTEyZjU5YTY2MzUwZGI1MjNiMDVjNThkNGIyNzY5NzgsZXlKdVlXMWxJam9pUVd0cGJDQk5ZV2hwYlhkaGJHRWlMQ0prWVhSbElqb3hOakF6TkRBM05qQXdMQ0prYjIxaGFXNGlPbHNpYkc5allXeG9iM04wSWl3aWJHOWpZV3hvYjNOMElsMHNJbkJzWVc0aU9qQjk=',
                        text: {
                            // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                            show: '',
                            entries: '',
                        },
                        onload: this.loadedConsumption,
                        editable: consumptionEditable,
                        onchange: this.consumptionChanged,
                        updateTable: function (el, cell, x, y, source, value, id) {
                            var elInstance = el.jexcel;
                            var rowData = elInstance.getRowData(y);
                            var batchDetails = rowData[11];
                            if (batchDetails.length == 0) {
                                var cell = elInstance.getCell(`F${parseInt(y) + 1}`)
                                cell.classList.remove('readonly');
                            } else {
                                var cell = elInstance.getCell(`F${parseInt(y) + 1}`)
                                cell.classList.add('readonly');
                            }
                        }.bind(this),
                        contextMenu: function (obj, x, y, e) {
                            var items = [];
                            //Add consumption batch info
                            var rowData = obj.getRowData(y);
                            if (rowData[2] != 2 && rowData[0] != "" && rowData[1] != "" && rowData[4] != "") {
                                items.push({
                                    title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                    onclick: function () {
                                        this.props.updateState("loading", true);

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
                                        var planningUnitId = document.getElementById("planningUnitId").value;
                                        for (var k = 0; k < batchInfoList.length; k++) {
                                            if (batchInfoList[k].planningUnitId == planningUnitId) {
                                                var batchJson = {
                                                    name: batchInfoList[k].batchNo,
                                                    id: batchInfoList[k].batchId.toString(),
                                                    createdDate: batchInfoList[k].createdDate,
                                                    expiryDate: batchInfoList[k].expiryDate
                                                }
                                                batchList.push(batchJson);
                                            }
                                        }
                                        this.setState({
                                            batchInfoList: batchList
                                        })
                                        document.getElementById("showConsumptionBatchInfoButtonsDiv").style.display = 'block';
                                        if (this.state.consumptionBatchInfoTableEl != "" && this.state.consumptionBatchInfoTableEl != undefined) {
                                            this.state.consumptionBatchInfoTableEl.destroy();
                                        }
                                        var json = [];
                                        var consumptionQty = 0;
                                        var batchInfo = rowData[11];
                                        consumptionQty = (rowData[5]).toString().replaceAll("\,", "");
                                        var consumptionBatchInfoQty = 0;
                                        for (var sb = 0; sb < batchInfo.length; sb++) {
                                            var data = [];
                                            data[0] = batchInfo[sb].batch.batchId; //A
                                            data[1] = moment(batchInfo[sb].batch.expiryDate).format(DATE_FORMAT_CAP);
                                            data[2] = batchInfo[sb].consumptionQty; //C
                                            data[3] = batchInfo[sb].consumptionTransBatchInfoId; //E
                                            data[4] = y; //F
                                            data[5] = date;
                                            consumptionBatchInfoQty += parseInt(batchInfo[sb].consumptionQty);
                                            json.push(data);
                                        }
                                        if (parseInt(consumptionQty) != consumptionBatchInfoQty && batchInfo.length > 0) {
                                            var qty = parseInt(consumptionQty) - parseInt(consumptionBatchInfoQty);
                                            var data = [];
                                            data[0] = -1; //A
                                            data[1] = "";
                                            data[2] = qty; //C
                                            data[3] = 0; //E
                                            data[4] = y; //F
                                            data[5] = date;
                                            json.push(data);
                                        }
                                        if (batchInfo.length == 0) {
                                            var data = [];
                                            data[0] = "";
                                            data[1] = ""
                                            data[2] = "";
                                            data[3] = 0;
                                            data[4] = y;
                                            data[5] = date;
                                            json.push(data)
                                        }
                                        var options = {
                                            data: json,
                                            columnDrag: true,
                                            columns: [
                                                { title: i18n.t('static.supplyPlan.batchId'), type: 'dropdown', source: batchList, filter: this.filterBatchInfoForExistingDataForConsumption, width: 100 },
                                                { title: i18n.t('static.supplyPlan.expiryDate'), type: 'text', readOnly: true, width: 150 },
                                                { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: 'numeric', mask: '#,##.00', decimal: '.', width: 80 },
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
                                            editable: consumptionEditable,
                                            text: {
                                                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                                                show: '',
                                                entries: '',
                                            },
                                            onload: this.loadedBatchInfoConsumption,
                                            updateTable: function (el, cell, x, y, source, value, id) {
                                            }.bind(this),
                                            contextMenu: function (obj, x, y, e) {
                                                var items = [];
                                                var items = [];
                                                if (y == null) {
                                                } else {
                                                    if (consumptionEditable) {
                                                        items.push({
                                                            title: i18n.t('static.supplyPlan.addNewBatchInfo'),
                                                            onclick: function () {
                                                                this.addBatchRowInJexcel()
                                                            }.bind(this)
                                                        });
                                                    }
                                                    if (obj.options.allowDeleteRow == true && obj.getJson().length > 1) {
                                                        // region id
                                                        if (obj.getRowData(y)[3] == 0) {
                                                            items.push({
                                                                title: i18n.t("static.common.deleterow"),
                                                                onclick: function () {
                                                                    console.log("y---------->", y);
                                                                    obj.deleteRow(parseInt(y));
                                                                }
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
                                    }.bind(this)
                                });
                            }
                            // -------------------------------------

                            if (y == null) {
                            } else {
                                // Insert new row
                                if (obj.options.allowInsertRow == true) {
                                    var json = obj.getJson();
                                    if (consumptionEditable) {
                                        items.push({
                                            title: i18n.t('static.supplyPlan.addNewConsumption'),
                                            onclick: function () {
                                                this.addRowInJexcel()
                                            }.bind(this)
                                        });
                                    }
                                }

                                if (obj.options.allowDeleteRow == true && obj.getJson().length > 1) {
                                    // region id
                                    if (obj.getRowData(y)[12] == -1) {
                                        items.push({
                                            title: i18n.t("static.common.deleterow"),
                                            onclick: function () {
                                                console.log("y---------->", y);
                                                obj.deleteRow(parseInt(y));
                                            }
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
    }

    addRowInJexcel() {
        var obj = this.state.consumptionEl;
        var json = obj.getJson();
        var regionList = (this.props.items.regionList);
        var realmCountryPlanningUnitList = this.state.realmCountryPlanningUnitList;
        var data = [];
        if (this.props.consumptionPage != "consumptionDataEntry") {
            data[0] = moment(this.props.items.consumptionStartDate).startOf('month').format("YYYY-MM-DD"); //A
            data[1] = this.props.items.consumptionRegion; //B                        
        } else {
            data[0] = "";
            data[1] = regionList.length == 1 ? regionList[0].id : "";
        }
        data[2] = "";
        data[3] = ""; //C
        data[4] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].id : ""; //D
        data[5] = ""; //E
        data[6] = realmCountryPlanningUnitList.length == 1 ? realmCountryPlanningUnitList[0].multiplier : "";; //F
        data[7] = `=F${parseInt(json.length) + 1}*G${parseInt(json.length) + 1}`; //I
        data[8] = "";
        data[9] = "";
        data[10] = true;
        data[11] = "";
        data[12] = -1;
        data[13] = 1;
        data[14] = 0;
        obj.insertRow(data);
        if (this.props.consumptionPage == "consumptionDataEntry") {
            var showOption = (document.getElementsByClassName("jexcel_pagination_dropdown")[0]).value;
            console.log("showOption", showOption);
            if (showOption != 5000000) {
                var pageNo = parseInt(parseInt(json.length) / parseInt(showOption));
                obj.page(pageNo);
            }
        }
    }

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

    loadedConsumption = function (instance, cell, x, y, value) {
        if (this.props.consumptionPage != "consumptionDataEntry") {
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
        tr.children[5].classList.add('AsteriskTheadtrTd');
        tr.children[6].classList.add('AsteriskTheadtrTd');
        (instance.jexcel).orderBy(0, 0);
    }

    filterDataSourceBasedOnConsumptionType = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[2];
        if (value == 1) {
            mylist = this.state.dataSourceList.filter(c => c.dataSourceTypeId == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE && c.active.toString() == "true");
        } else {
            mylist = this.state.dataSourceList.filter(c => c.dataSourceTypeId == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE && c.active.toString() == "true");
        }
        return mylist;
    }.bind(this)

    filterRealmCountryPlanningUnit = function (instance, cell, c, r, source) {
        return this.state.realmCountryPlanningUnitList.filter(c => c.active.toString() == "true");
    }.bind(this);

    consumptionChanged = function (instance, cell, x, y, value) {
        var elInstance = this.state.consumptionEl;
        var rowData = elInstance.getRowData(y);
        this.props.updateState("consumptionError", "");
        this.props.updateState("consumptionDuplicateError", "");
        this.props.updateState("consumptionChangedFlag", 1);
        if (x != 13 && rowData[13] != 1) {
            elInstance.setValueFromCoords(13, y, 1, true);
        }
        if (x == 0) {
            var valid = checkValidtion("date", "A", y, rowData[0], elInstance);
        }
        if (x == 1) {
            var valid = checkValidtion("text", "B", y, rowData[1], elInstance);
        }
        if (x == 3) {
            var valid = checkValidtion("text", "D", y, rowData[3], elInstance);
        }
        if (x == 4) {
            elInstance.setValueFromCoords(6, y, "", true);
            var valid = checkValidtion("text", "E", y, rowData[4], elInstance);
            if (valid == true) {
                var multiplier = (this.state.realmCountryPlanningUnitList.filter(c => c.id == rowData[4])[0]).multiplier;
                elInstance.setValueFromCoords(6, y, multiplier, true);
            }
        }
        if (x == 5) {
            var valid = checkValidtion("number", "F", y, rowData[5], elInstance, INTEGER_NO_REGEX, 1, 1);
        }

        if (x == 8) {
            var valid = checkValidtion("numberNotRequired", "I", y, rowData[8], elInstance, INTEGER_NO_REGEX, 1, 1);
        }
        if (x == 2) {
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
        }
        // this.showOnlyErrors();
    }

    filterBatchInfoForExistingDataForConsumption = function (instance, cell, c, r, source) {
        var mylist = [];
        var json = instance.jexcel.getJson()
        var value = (json[r])[3];
        var date = (json[r])[5];
        if (value != 0) {
            mylist = this.state.batchInfoList.filter(c => c.id != -1 && (moment(c.expiryDate).format("YYYY-MM-DD") > moment(date).format("YYYY-MM-DD") && moment(c.createdDate).format("YYYY-MM-DD") <= moment(date).format("YYYY-MM-DD")));
        } else {
            mylist = this.state.batchInfoList.filter(c => (c.id == -1) || (moment(c.expiryDate).format("YYYY-MM-DD") > moment(date).format("YYYY-MM-DD") && moment(c.createdDate).format("YYYY-MM-DD") <= moment(date).format("YYYY-MM-DD")));
        }
        return mylist;
    }.bind(this)

    loadedBatchInfoConsumption = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
        var asterisk = document.getElementsByClassName("resizable")[1];
        var tr = asterisk.firstChild;
        tr.children[1].classList.add('AsteriskTheadtrTd');
        tr.children[3].classList.add('AsteriskTheadtrTd');
    }

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
                    var expiryDate = this.props.items.batchInfoList.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0].expiryDate;
                    elInstance.setValueFromCoords(1, y, moment(expiryDate).format(DATE_FORMAT_CAP), true);
                } else {
                    elInstance.setValueFromCoords(1, y, "", true);
                }
            }
        }

        if (x == 2) {
            checkValidtion("number", "C", y, rowData[2], elInstance, INTEGER_NO_REGEX, 1, 0);
        }
    }

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
                    inValid((colArr[c]), y, i18n.t('static.supplyPlan.duplicateBatchNumber'), elInstance);
                }
                valid = false;
                this.props.updateState("consumptionBatchInfoDuplicateError", i18n.t('static.supplyPlan.duplicateBatchNumber'));
                this.props.hideThirdComponent();
            } else {
                // var programJson = this.state.programJsonAfterConsumptionClicked;
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
                //     var totalStockForBatchNumber = stockForBatchNumber.qty;
                //     var consumptionList = programJson.consumptionList;
                //     var consumptionBatchArray = [];

                //     for (var con = 0; con < consumptionList.length; con++) {
                //         var consumptionIndex = (this.state.consumptionEl).getRowData(parseInt(map.get("4")))[6];
                //         if (con != consumptionIndex) {
                //             var batchInfoList = consumptionList[con].batchInfoList;
                //             for (var bi = 0; bi < batchInfoList.length; bi++) {
                //                 consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
                //             }
                //         }
                //     }
                //     var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText);
                //     if (consumptionForBatchNumber == undefined) {
                //         consumptionForBatchNumber = [];
                //     }
                //     var consumptionQty = 0;
                //     for (var b = 0; b < consumptionForBatchNumber.length; b++) {
                //         consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
                //     }
                //     consumptionQty += parseInt(map.get("2").toString().replaceAll("\,", ""));
                //     var inventoryList = programJson.inventoryList;
                //     var inventoryBatchArray = [];
                //     for (var inv = 0; inv < inventoryList.length; inv++) {
                //         var batchInfoList = inventoryList[inv].batchInfoList;
                //         for (var bi = 0; bi < batchInfoList.length; bi++) {
                //             inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
                //         }
                //     }
                //     var inventoryForBatchNumber = [];
                //     if (inventoryBatchArray.length > 0) {
                //         inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText);
                //     }
                //     if (inventoryForBatchNumber == undefined) {
                //         inventoryForBatchNumber = [];
                //     }
                //     var adjustmentQty = 0;
                //     for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                //         adjustmentQty += parseFloat(inventoryForBatchNumber[b].qty);
                //     }

                //     var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
                //     if (remainingBatchQty < 0) {
                //         var col = ("C").concat(parseInt(y) + 1);
                //         elInstance.setStyle(col, "background-color", "transparent");
                //         elInstance.setStyle(col, "background-color", "yellow");
                //         elInstance.setComments(col, i18n.t('static.supplyPlan.noStockAvailable'));

                //         valid = false;
                //         this.setState({
                //             consumptionBatchInfoNoStockError: i18n.t('static.supplyPlan.noStockAvailable')
                //         })
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

                validation = checkValidtion("number", "C", y, rowData[2], elInstance, INTEGER_NO_REGEX, 1, 0);
                if (validation == false) {
                    valid = false;
                }
            }
        }
        // }
        return valid;
    }

    saveConsumptionBatchInfo() {
        this.props.updateState("loading", true);
        var validation = this.checkValidationConsumptionBatchInfo();
        if (validation == true) {
            var elInstance = this.state.consumptionBatchInfoTableEl;
            var json = elInstance.getJson();
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
                            batchId: map.get("0"),
                            batchNo: elInstance.getCell(`A${parseInt(i) + 1}`).innerText,
                            autoGenerated: 0,
                            planningUnitId: parseInt(document.getElementById("planningUnitId").value),
                            expiryDate: moment(map.get("1")).format("YYYY-MM-DD"),
                            createdDate: null
                        },
                        consumptionQty: parseInt(map.get("2").toString().replaceAll("\,", "")),
                    }
                    batchInfoArray.push(batchInfoJson);
                }
                totalConsumption += parseInt(map.get("2").toString().replaceAll("\,", ""));
            }
            var allConfirm = true;
            if (countForNonFefo == 0) {
                var cf = window.confirm(i18n.t("static.batchDetails.warningFefo"));
                if (cf == true) {
                    var consumptionInstance = this.state.consumptionEl;
                    var consumptionQty = consumptionInstance.getRowData(rowNumber)[5];
                    if (consumptionQty != "" && consumptionQty != totalConsumption) {
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
                var consumptionInstance = this.state.consumptionEl;
                var consumptionQty = consumptionInstance.getRowData(rowNumber)[5];
                if (consumptionQty != "" && consumptionQty != totalConsumption) {
                    var cf1 = window.confirm(i18n.t("static.batchDetails.warningQunatity"))
                    if (cf1 == true) {
                    } else {
                        allConfirm = false;
                    }
                }
            }
            if (allConfirm == true) {
                consumptionInstance.setValueFromCoords(5, rowNumber, totalConsumption, true);
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
                document.getElementById("showConsumptionBatchInfoButtonsDiv").style.display = 'none';
                if (this.props.consumptionPage == "consumptionDataEntry") {
                    this.props.toggleLarge();
                }
                elInstance.destroy();
            }
            this.props.updateState("loading", false);
        } else {
            this.props.updateState("consumptionBatchError", i18n.t('static.supplyPlan.validationFailed'));
            this.props.updateState("loading", false);
            this.props.hideThirdComponent();
        }
    }

    checkValidationConsumption() {
        console.log("in check validations")
        var valid = true;
        var elInstance = this.state.consumptionEl;
        var json = elInstance.getJson();
        var mapArray = [];
        // var adjustmentsQty = 0;
        // var openingBalance = 0;
        // var consumptionQty = 0;
        for (var y = 0; y < json.length; y++) {
            console.log("y---->", y);
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("4") == map.get("4") &&
                moment(c.get("0")).format("YYYY-MM") == moment(map.get("0")).format("YYYY-MM") &&
                c.get("1") == map.get("1") &&
                c.get("2") == map.get("2")
            )
            if (checkDuplicateInMap.length > 1) {
                var colArr = ['E'];
                for (var c = 0; c < colArr.length; c++) {
                    inValid(colArr[c], y, i18n.t('static.supplyPlan.duplicateConsumption'), elInstance);
                }
                valid = false;
                elInstance.setValueFromCoords(14, y, 1, true);
                this.props.updateState("consumptionDuplicateError", i18n.t('static.supplyPlan.duplicateConsumption'));
                this.props.hideSecondComponent();
            } else {
                var colArr = ['E'];
                for (var c = 0; c < colArr.length; c++) {
                    positiveValidation(colArr[c], y, elInstance);
                }

                var rowData = elInstance.getRowData(y);
                var validation = checkValidtion("date", "A", y, rowData[0], elInstance);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(14, y, 1, true);
                }

                validation = checkValidtion("text", "B", y, rowData[1], elInstance);
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

                validation = checkValidtion("number", "F", y, rowData[5], elInstance, INTEGER_NO_REGEX, 1, 1);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(14, y, 1, true);
                }

                validation = checkValidtion("numberNotRequired", "I", y, rowData[8], elInstance, INTEGER_NO_REGEX, 1, 1);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(14, y, 1, true);
                }

                validation = checkValidtion("text", "C", y, rowData[2], elInstance);
                if (validation == false) {
                    valid = false;
                    elInstance.setValueFromCoords(14, y, 1, true);
                }
            }
        }

        console.log("Valid", valid);
        return valid;
    }

    // Save consumptions
    saveConsumption() {
        // this.showOnlyErrors();
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
                    this.props.updateState("color", "red");
                    this.props.hideFirstComponent();
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var consumptionDataList = (programJson.consumptionList);
                    var minDate = moment(Date.now()).startOf('month').format("YYYY-MM-DD");
                    for (var i = 0; i < json.length; i++) {
                        var map = new Map(Object.entries(json[i]));
                        if (map.get("13") == 1) {
                            if (moment(map.get("0")).format("YYYY-MM") < moment(minDate).format("YYYY-MM")) {
                                minDate = moment(map.get("0")).format("YYYY-MM-DD");
                            }
                        }
                        var actualFlag = true;
                        if (map.get("2") == 2) {
                            actualFlag = false;
                        }
                        if (parseInt(map.get("12")) != -1) {
                            consumptionDataList[parseInt(map.get("12"))].consumptionDate = moment(map.get("0")).startOf('month').format("YYYY-MM-DD");
                            consumptionDataList[parseInt(map.get("12"))].region.id = map.get("1");
                            consumptionDataList[parseInt(map.get("12"))].dataSource.id = map.get("3");
                            consumptionDataList[parseInt(map.get("12"))].realmCountryPlanningUnit.id = map.get("4");
                            consumptionDataList[parseInt(map.get("12"))].multiplier = map.get("6");
                            consumptionDataList[parseInt(map.get("12"))].consumptionRcpuQty = (map.get("5")).toString().replaceAll("\,", "");
                            consumptionDataList[parseInt(map.get("12"))].consumptionQty = (elInstance.getCell(`H${parseInt(i) + 1}`).innerText).toString().replaceAll("\,", "");
                            consumptionDataList[parseInt(map.get("12"))].dayOfStockOut = (map.get("8")).toString().replaceAll("\,", "");
                            consumptionDataList[parseInt(map.get("12"))].notes = map.get("9");
                            consumptionDataList[parseInt(map.get("12"))].actualFlag = actualFlag;
                            consumptionDataList[parseInt(map.get("12"))].active = map.get("10");
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
                                    id: map.get("3")
                                },
                                region: {
                                    id: map.get("1")
                                },
                                consumptionDate: moment(map.get("0")).startOf('month').format("YYYY-MM-DD"),
                                consumptionRcpuQty: map.get("5").toString().replaceAll("\,", ""),
                                consumptionQty: (elInstance.getCell(`H${parseInt(i) + 1}`).innerText).toString().replaceAll("\,", ""),
                                dayOfStockOut: map.get("8").toString().replaceAll("\,", ""),
                                active: map.get("10"),
                                realmCountryPlanningUnit: {
                                    id: map.get("4"),
                                },
                                multiplier: map.get("6"),
                                planningUnit: {
                                    id: planningUnitId
                                },
                                notes: map.get("9"),
                                batchInfoList: batchInfoList,
                                actualFlag: actualFlag
                            }
                            consumptionDataList.push(consumptionJson);
                        }
                    }
                    programJson.consumptionList = consumptionDataList;
                    this.setState({
                        programJson: programJson
                    })
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

    render() { return (<div></div>) }
}