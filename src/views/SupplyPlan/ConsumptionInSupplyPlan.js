import React from "react";
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { jExcelLoadedFunctionOnlyHideRow, checkValidtion, inValid, positiveValidation, jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';
import { SECRET_KEY, INTEGER_NO_REGEX, INDEXED_DB_VERSION, INDEXED_DB_NAME, DATE_FORMAT_CAP, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE } from "../../Constants";
import moment from "moment";
import CryptoJS from 'crypto-js'


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
        this.state = {
            consumptionEl: "",
            consumptionBatchInfoTableEl: ""
        }
    }

    componentDidMount() {
    }

    showConsumptionData() {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var consumptionListUnFiltered = this.props.items.consumptionListUnFiltered;
        var consumptionList = this.props.items.consumptionList;
        var programJson = this.props.items.programJson;
        var db1;
        var dataSourceList = [];
        var realmCountryPlanningUnitList = [];
        var myVar = "";
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var rcpuTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
            var rcpuOs = rcpuTransaction.objectStore('realmCountryPlanningUnit');
            var rcpuRequest = rcpuOs.getAll();
            rcpuRequest.onerror = function (event) {
                this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
            }.bind(this);
            rcpuRequest.onsuccess = function (event) {
                var rcpuResult = [];
                rcpuResult = rcpuRequest.result.filter(c => (c.active).toString() == "true");
                for (var k = 0; k < rcpuResult.length; k++) {
                    if (rcpuResult[k].realmCountry.id == programJson.realmCountry.realmCountryId && rcpuResult[k].planningUnit.id == document.getElementById("planningUnitId").value) {
                        var rcpuJson = {
                            name: getLabelText(rcpuResult[k].label, this.props.items.lang),
                            id: rcpuResult[k].realmCountryPlanningUnitId,
                            multiplier: rcpuResult[k].multiplier
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
                }.bind(this);
                dataSourceRequest.onsuccess = function (event) {
                    var dataSourceResult = [];
                    dataSourceResult = dataSourceRequest.result;
                    for (var k = 0; k < dataSourceResult.length; k++) {
                        if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0 && (dataSourceResult[k].active).toString() == "true") {
                            if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId && (dataSourceResult[k].dataSourceType.id == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE || dataSourceResult[k].dataSourceType.id == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE)) {
                                var dataSourceJson = {
                                    name: getLabelText(dataSourceResult[k].label, this.props.items.lang),
                                    id: dataSourceResult[k].dataSourceId,
                                    dataSourceTypeId: dataSourceResult[k].dataSourceType.id
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


                    for (var j = 0; j < consumptionList.length; j++) {
                        data = [];
                        var consumptionFlag = 1;
                        if (consumptionList[j].actualFlag == false) {
                            consumptionFlag = 2;
                        }
                        data[0] = consumptionList[j].consumptionDate; //A
                        data[1] = consumptionList[j].region.id; //B                        
                        data[2] = consumptionList[j].dataSource.id; //C
                        data[3] = consumptionList[j].realmCountryPlanningUnit.id; //D
                        data[4] = consumptionList[j].consumptionRcpuQty; //E
                        data[5] = consumptionList[j].multiplier; //F
                        data[6] = `=E${parseInt(j) + 1}*F${parseInt(j) + 1}`; //I
                        data[7] = consumptionList[j].dayOfStockOut;
                        if (consumptionList[j].notes === null || ((consumptionList[j].notes).trim() == "NULL")) {
                            data[8] = "";
                        } else {
                            data[8] = consumptionList[j].notes;
                        }
                        data[9] = consumptionFlag;
                        data[10] = consumptionList[j].active;
                        data[11] = consumptionList[j].batchInfoList;
                        var index;
                        if (consumptionList[j].consumptionId != 0) {
                            index = consumptionListUnFiltered.findIndex(c => c.consumptionId == consumptionList[j].consumptionId);
                        } else {
                            index = consumptionListUnFiltered.findIndex(c => c.planningUnit.id == planningUnitId && c.region.id == consumptionList[j].region.id && moment(c.consumptionDate).format("MMM YY") == moment(consumptionList[j].consumptionDate).format("MMM YY") && c.realmCountryPlanningUnit.id == consumptionList[j].realmCountryPlanningUnit.id);
                        }
                        data[12] = index;
                        consumptionDataArr[j] = data;
                    }
                    if (consumptionList.length == 0) {
                        data = [];
                        if (this.props.consumptionPage != "consumptionDataEntry") {
                            data[0] = moment(this.props.items.consumptionStartDate).endOf('month').format("YYYY-MM-DD"); //A
                            data[1] = this.props.items.consumptionRegion; //B                        
                        } else {
                            data[0] = "";
                            data[1] = "";
                        }
                        data[2] = ""; //C
                        data[3] = ""; //D
                        data[4] = ""; //E
                        data[5] = ""; //F
                        data[6] = `=E${parseInt(0) + 1}*F${parseInt(0) + 1}`; //I
                        data[7] = "";
                        data[8] = "";
                        data[9] = "";
                        data[10] = true;
                        data[11] = "";
                        data[12] = -1;
                        consumptionDataArr[0] = data;
                    }
                    var options = {
                        data: consumptionDataArr,
                        columnDrag: true,
                        columns: [
                            { title: i18n.t('static.pipeline.consumptionDate'), type: 'calendar', options: { format: 'MM-YYYY' }, width: 85, readOnly: readonlyRegionAndMonth },
                            { title: i18n.t('static.region.region'), type: 'dropdown', readOnly: readonlyRegionAndMonth, source: this.props.items.regionList, width: 100 },
                            { title: i18n.t('static.inventory.dataSource'), type: 'dropdown', source: dataSourceList, width: 100, filter: this.filterDataSourceBasedOnConsumptionType },
                            { title: i18n.t('static.supplyPlan.alternatePlanningUnit'), type: 'dropdown', source: realmCountryPlanningUnitList, width: 150 },
                            { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: 'numeric', mask: '#,##', width: 80 },
                            { title: i18n.t('static.unit.multiplier'), type: 'numeric', mask: '#,##', width: 80, readOnly: true },
                            { title: i18n.t('static.supplyPlan.quantityQATProduct'), type: 'numeric', mask: '#,##', width: 80, readOnly: true },
                            { title: i18n.t('static.consumption.daysofstockout'), type: 'numeric', mask: '#,##', width: 80 },
                            { title: i18n.t('static.program.notes'), type: 'text', width: 200 },
                            { type: 'dropdown', title: i18n.t('static.consumption.consumptionType'), source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.consumption.forcast') }], width: 100 },
                            { title: i18n.t('static.inventory.active'), type: 'checkbox', width: 50 },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo'), width: 0 },
                            { type: 'hidden', title: i18n.t('static.supplyPlan.index'), width: 0 }
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
                        allowManualInsertRow: false,
                        allowExport: false,
                        copyCompatibility: true,
                        text: {
                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
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
                                var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                                cell.classList.remove('readonly');
                            } else {
                                var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                                cell.classList.add('readonly');
                            }
                        }.bind(this),
                        contextMenu: function (obj, x, y, e) {
                            var items = [];
                            //Add consumption batch info
                            var rowData = obj.getRowData(y);
                            console.log("rowData[9", rowData[9]);
                            console.log("rowData[0", rowData[0]);
                            console.log("rowData[1", rowData[1]);
                            console.log("rowData[3", rowData[3]);
                            console.log("Consition", rowData[9] != 2 && rowData[0] != "" && rowData[1] != "" && rowData[3] != "")
                            if (rowData[9] != 2 && rowData[0] != "" && rowData[1] != "" && rowData[3] != "") {
                                items.push({
                                    title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                    onclick: function () {
                                        if (this.props.consumptionPage == "consumptionDataEntry") {
                                            this.props.toggleLarge();
                                        }
                                        var batchList = [];
                                        var date = moment(rowData[0]).startOf('month').format("YYYY-MM-DD");
                                        var batchInfoList = this.props.items.batchInfoList.filter(c => (moment(c.expiryDate).format("YYYY-MM-DD") > date && moment(c.createdDate).format("YYYY-MM-DD") <= date));
                                        batchList.push({
                                            name: i18n.t('static.supplyPlan.fefo'),
                                            id: -1
                                        })
                                        var planningUnitId = document.getElementById("planningUnitId").value;
                                        for (var k = 0; k < batchInfoList.length; k++) {
                                            if (batchInfoList[k].planningUnitId == planningUnitId) {
                                                var batchJson = {
                                                    name: batchInfoList[k].batchNo,
                                                    id: batchInfoList[k].batchId
                                                }
                                                batchList.push(batchJson);
                                            }
                                        }
                                        this.setState({
                                            batchInfoList: batchList
                                        })
                                        document.getElementById("showConsumptionBatchInfoButtonsDiv").style.display = 'block';
                                        console.log("this.state.consumptionBatchInfoTableEl", this.state.consumptionBatchInfoTableEl)
                                        if (this.state.consumptionBatchInfoTableEl != "" && this.state.consumptionBatchInfoTableEl != undefined) {
                                            this.state.consumptionBatchInfoTableEl.destroy();
                                        }
                                        var json = [];
                                        var consumptionQty = 0;
                                        var batchInfo = rowData[11];
                                        consumptionQty = (rowData[4]).toString().replaceAll("\,", "");
                                        var consumptionBatchInfoQty = 0;
                                        for (var sb = 0; sb < batchInfo.length; sb++) {
                                            var data = [];
                                            data[0] = batchInfo[sb].batch.batchId; //A
                                            data[1] = moment(batchInfo[sb].batch.expiryDate).format(DATE_FORMAT_CAP);
                                            data[2] = batchInfo[sb].consumptionQty; //C
                                            data[3] = batchInfo[sb].consumptionTransBatchInfoId; //E
                                            data[4] = y; //F
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
                                            json.push(data);
                                        }
                                        if (batchInfo.length == 0) {
                                            var data = [];
                                            data[0] = "";
                                            data[1] = ""
                                            data[2] = "";
                                            data[3] = 0;
                                            data[4] = y;
                                            json.push(data)
                                        }
                                        var options = {
                                            data: json,
                                            columnDrag: true,
                                            columns: [
                                                { title: i18n.t('static.supplyPlan.batchId'), type: 'dropdown', source: batchList, filter: this.filterBatchInfoForExistingDataForConsumption, width: 100 },
                                                { title: i18n.t('static.supplyPlan.expiryDate'), type: 'text', readOnly: true, width: 150 },
                                                { title: i18n.t('static.supplyPlan.quantityCountryProduct'), type: 'numeric', mask: '#,##', width: 80 },
                                                { title: i18n.t('static.supplyPlan.consumptionTransBatchInfoId'), type: 'hidden', width: 0 },
                                                { title: i18n.t('static.supplyPlan.rowNumber'), type: 'hidden', width: 0 }
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
                                            allowInsertRow: true,
                                            allowManualInsertRow: false,
                                            allowExport: false,
                                            onchange: this.batchInfoChangedConsumption,
                                            copyCompatibility: true,
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
                                                                var data = [];
                                                                data[0] = "";
                                                                data[1] = ""
                                                                data[2] = "";
                                                                data[3] = 0;
                                                                data[4] = y;
                                                                obj.insertRow(data);
                                                            }
                                                        });
                                                    }
                                                }
                                                return items;
                                            }.bind(this)

                                        };
                                        var elVar = jexcel(document.getElementById("consumptionBatchInfoTable"), options);
                                        this.el = elVar;
                                        this.setState({ consumptionBatchInfoTableEl: elVar });
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
                                                var json = obj.getJson();
                                                var map = new Map(Object.entries(json[0]));
                                                var data = [];
                                                if (this.props.consumptionPage != "consumptionDataEntry") {
                                                    data[0] = moment(this.props.items.consumptionStartDate).endOf('month').format("YYYY-MM-DD"); //A
                                                    data[1] = this.props.items.consumptionRegion; //B                        
                                                } else {
                                                    data[0] = "";
                                                    data[1] = "";
                                                }
                                                data[2] = ""; //C
                                                data[3] = ""; //D
                                                data[4] = ""; //E
                                                data[5] = ""; //F
                                                data[6] = `=E${parseInt(json.length) + 1}*F${parseInt(json.length) + 1}`; //I
                                                data[7] = "";
                                                data[8] = "";
                                                data[9] = "";
                                                data[10] = true;
                                                data[11] = "";
                                                data[12] = -1;
                                                obj.insertRow(data);
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

                }.bind(this)
            }.bind(this)
        }.bind(this);
    }

    loadedConsumption = function (instance, cell, x, y, value) {
        if (this.props.consumptionPage != "consumptionDataEntry") {
            jExcelLoadedFunctionOnlyHideRow(instance);
        } else {
            jExcelLoadedFunction(instance);
        }
    }

    filterDataSourceBasedOnConsumptionType = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[9];
        if (value == 1) {
            mylist = this.state.dataSourceList.filter(c => c.dataSourceTypeId == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE);
        } else {
            mylist = this.state.dataSourceList.filter(c => c.dataSourceTypeId == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE);
        }
        return mylist;
    }.bind(this)

    consumptionChanged = function (instance, cell, x, y, value) {
        var elInstance = this.state.consumptionEl;
        var rowData = elInstance.getRowData(y);
        this.props.updateState("consumptionError", "");
        this.props.updateState("consumptionDuplicateError", "");
        this.props.updateState("consumptionChangedFlag", 1);
        if (x == 0) {
            checkValidtion("date", "A", y, rowData[0], elInstance);
        }
        if (x == 1) {
            checkValidtion("text", "B", y, rowData[1], elInstance);
        }
        if (x == 2) {
            checkValidtion("text", "C", y, rowData[2], elInstance);
        }
        if (x == 3) {
            elInstance.setValueFromCoords(5, y, "", true);
            var valid = checkValidtion("text", "D", y, rowData[3], elInstance);
            if (valid == true) {
                var multiplier = (this.state.realmCountryPlanningUnitList.filter(c => c.id == rowData[3])[0]).multiplier;
                elInstance.setValueFromCoords(5, y, multiplier, true);
            }
        }
        if (x == 4) {
            checkValidtion("number", "E", y, rowData[4], elInstance, INTEGER_NO_REGEX, 0, 1);
        }

        if (x == 7) {
            checkValidtion("numberNotRequired", "H", y, rowData[7], elInstance, INTEGER_NO_REGEX, 1, 1);
        }
        if (x == 9) {
            var dataSource = rowData[2];
            var dataSourceType = this.state.dataSourceList.filter(c => c.id == dataSource)[0].dataSourceTypeId;
            if ((dataSourceType == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE && rowData[9] == 2) || (dataSourceType == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE && rowData[9] == 1)) {
            } else {
                elInstance.setValueFromCoords(2, y, "", true);
            }
            elInstance.setValueFromCoords(11, y, "", true);
            checkValidtion("text", "J", y, rowData[9], elInstance);
        }
    }

    filterBatchInfoForExistingDataForConsumption = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[3];
        if (value != 0) {
            mylist = this.state.batchInfoList.filter(c => c.id != -1);
        } else {
            mylist = this.state.batchInfoList;
        }
        return mylist;
    }.bind(this)

    loadedBatchInfoConsumption = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
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
                console.log("elInstance.getCell(`A${parseInt(y) + 1}`).innerText", elInstance.getCell(`A${parseInt(y) + 1}`).innerText)
                console.log("this.props.items.batchInfoList", this.props.items.batchInfoList);
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
                    rowNumber = map.get("4");
                }
                if (map.get("0") != -1) {
                    var batchInfoJson = {
                        consumptionTransBatchInfoId: map.get("3"),
                        batch: {
                            batchId: map.get("0"),
                            batchNo: elInstance.getCell(`A${parseInt(i) + 1}`).innerText,
                            expiryDate: moment(map.get("1")).format("YYYY-MM-DD")
                        },
                        consumptionQty: map.get("2").toString().replaceAll("\,", ""),
                    }
                    batchInfoArray.push(batchInfoJson);
                }
                totalConsumption += parseInt(map.get("2").toString().replaceAll("\,", ""));
            }
            var consumptionInstance = this.state.consumptionEl;
            consumptionInstance.setValueFromCoords(4, rowNumber, totalConsumption, true);
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
        } else {
            this.props.updateState("consumptionBatchError", i18n.t('static.supplyPlan.validationFailed'));
        }
    }

    checkValidationConsumption() {
        var valid = true;
        var elInstance = this.state.consumptionEl;
        var json = elInstance.getJson();
        var mapArray = [];
        // var adjustmentsQty = 0;
        // var openingBalance = 0;
        // var consumptionQty = 0;
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("3") == map.get("3") &&
                moment(c.get("0")).format("YYYY-MM") == moment(map.get("0")).format("YYYY-MM") &&
                c.get("1") == map.get("1") &&
                c.get("9") == map.get("9")
            )
            console.log("Check duplicate in map", checkDuplicateInMap);
            if (checkDuplicateInMap.length > 1) {
                var colArr = ['D'];
                for (var c = 0; c < colArr.length; c++) {
                    inValid(colArr[c], y, i18n.t('static.supplyPlan.duplicateConsumption'), elInstance);
                }
                valid = false;
                this.props.updateState("consumptionDuplicateError", i18n.t('static.supplyPlan.duplicateConsumption'));
            } else {
                var colArr = ['D'];
                for (var c = 0; c < colArr.length; c++) {
                    positiveValidation(colArr[c], y, elInstance);
                }

                var rowData = elInstance.getRowData(y);
                var validation = checkValidtion("date", "A", y, rowData[0], elInstance);
                if (validation == false) {
                    valid = false;
                }

                validation = checkValidtion("text", "B", y, rowData[1], elInstance);
                if (validation == false) {
                    valid = false;
                }

                validation = checkValidtion("text", "C", y, rowData[2], elInstance);
                if (validation == false) {
                    valid = false;
                }


                validation = checkValidtion("text", "D", y, rowData[3], elInstance);
                if (validation == false) {
                    valid = false;
                }

                validation = checkValidtion("number", "E", y, rowData[4], elInstance, INTEGER_NO_REGEX, 0, 1);
                if (validation == false) {
                    valid = false;
                }

                validation = checkValidtion("numberNotRequired", "H", y, rowData[7], elInstance, INTEGER_NO_REGEX, 1, 1);
                if (validation == false) {
                    valid = false;
                }

                validation = checkValidtion("text", "J", y, rowData[9], elInstance);
                if (validation == false) {
                    valid = false;
                }
            }
        }
        return valid;
    }

    // Save consumptions
    saveConsumption() {
        this.props.updateState("consumptionError", "");
        var validation = this.checkValidationConsumption();
        console.log("Validation", validation);
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
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
                })
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
                    this.setState({
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var consumptionDataList = (programJson.consumptionList);
                    console.log("Json.length", json.length);
                    for (var i = 0; i < json.length; i++) {
                        var map = new Map(Object.entries(json[i]));
                        var actualFlag = true;
                        if (map.get("9") == 2) {
                            actualFlag = false;
                        }
                        if (parseInt(map.get("12")) != -1) {
                            consumptionDataList[parseInt(map.get("12"))].consumptionDate = moment(map.get("0")).startOf('month').format("YYYY-MM-DD");
                            consumptionDataList[parseInt(map.get("12"))].region.id = map.get("1");
                            consumptionDataList[parseInt(map.get("12"))].dataSource.id = map.get("2");
                            consumptionDataList[parseInt(map.get("12"))].realmCountryPlanningUnit.id = map.get("3");
                            consumptionDataList[parseInt(map.get("12"))].multiplier = map.get("5");
                            consumptionDataList[parseInt(map.get("12"))].consumptionRcpuQty = (map.get("4")).toString().replaceAll("\,", "");
                            consumptionDataList[parseInt(map.get("12"))].consumptionQty = (elInstance.getCell(`G${parseInt(i) + 1}`).innerText).toString().replaceAll("\,", "");
                            consumptionDataList[parseInt(map.get("12"))].dayOfStockOut = (map.get("7")).toString().replaceAll("\,", "");
                            consumptionDataList[parseInt(map.get("12"))].notes = map.get("8");
                            consumptionDataList[parseInt(map.get("12"))].actualFlag = actualFlag;
                            consumptionDataList[parseInt(map.get("12"))].active = map.get("10");
                            consumptionDataList[parseInt(map.get("12"))].batchInfoList = map.get("11");
                        } else {
                            var consumptionJson = {
                                consumptionId: 0,
                                dataSource: {
                                    id: map.get("2")
                                },
                                region: {
                                    id: map.get("1")
                                },
                                consumptionDate: moment(map.get("0")).startOf('month').format("YYYY-MM-DD"),
                                consumptionRcpuQty: map.get("4").toString().replaceAll("\,", ""),
                                consumptionQty: (elInstance.getCell(`G${parseInt(i) + 1}`).innerText).toString().replaceAll("\,", ""),
                                dayOfStockOut: map.get("7").toString().replaceAll("\,", ""),
                                active: map.get("10"),
                                realmCountryPlanningUnit: {
                                    id: map.get("3"),
                                },
                                multiplier: map.get("5"),
                                planningUnit: {
                                    id: planningUnitId
                                },
                                notes: map.get("8"),
                                batchInfoList: map.get("11"),
                                actualFlag: actualFlag
                            }
                            console.log("consumptionJson", consumptionJson);
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
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        console.log("After save")
                        this.props.updateState("message", i18n.t('static.message.consumptionSaved'));
                        this.props.updateState("color", 'green');
                        this.props.updateState("consumptionChangedFlag", 0);
                        console.log("after update state")
                        if (this.props.consumptionPage != "consumptionDataEntry") {
                            this.props.toggleLarge('Consumption');
                        }
                        if (this.props.consumptionPage != "consumptionDataEntry") {
                            if (this.props.consumptionPage != "supplyPlanCompare") {
                                this.props.formSubmit(this.props.items.planningUnit, this.props.items.monthCount);
                            } else {
                                this.props.formSubmit(this.props.items.monthCount);
                            }
                        }
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.props.updateState("consumptionError", i18n.t('static.supplyPlan.validationFailed'));
        }
    }

    render() { return (<div></div>) }
}