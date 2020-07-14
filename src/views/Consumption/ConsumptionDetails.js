import React from "react";
import ReactDOM from 'react-dom';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, Modal, ModalHeader, ModalFooter, ModalBody
} from 'reactstrap';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY, FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js'

const entityname = i18n.t('static.dashboard.consumptiondetails');

export default class ConsumptionDetails extends React.Component {

    constructor(props) {
        super(props);
        this.options = props.options;
        this.state = {
            message: '',
            lang: localStorage.getItem("lang"),
            programList: [],
            categoryList: [],
            productList: [],
            consumptionDataList: [],
            changedFlag: 0,
            planningUnitList: [],
            productCategoryId: '',
        }
        this.getProductList = this.getProductList.bind(this);
        this.saveData = this.saveData.bind(this)
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
    }
    hideFirstComponent() {
        setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }

    componentDidMount = function () {
        const lan = 'en';
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
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
        }.bind(this)
    };

    toggleLarge() {
        this.setState({
            consumptionBatchInfo: !this.state.consumptionBatchInfo,
        });
    }

    filterBatchInfoForExistingData = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[3];
        console.log("Value", value);
        if (value != 0) {
            mylist = this.state.batchInfoList.filter(c => c.id != -1);
        } else {
            mylist = this.state.batchInfoList;
        }
        return mylist;
    }.bind(this)

    formSubmit() {
        var programId = document.getElementById('programId').value;
        this.setState({ programId: programId });

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);

        var dataSourceList = []
        var regionList = []
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);
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
                    if (batchInfoList[k].planningUnitId == document.getElementById("planningUnitId").value) {
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
                var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                var dataSourceRequest = dataSourceOs.getAll();
                dataSourceRequest.onsuccess = function (event) {
                    var dataSourceResult = [];
                    dataSourceResult = dataSourceRequest.result;
                    dataSourceResult = dataSourceResult.filter(c => c.dataSourceType.id == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE || c.dataSourceType.id == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE);
                    for (var k = 0; k < dataSourceResult.length; k++) {
                        if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0) {
                            if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                                var dataSourceJson = {
                                    name: dataSourceResult[k].label.label_en,
                                    id: dataSourceResult[k].dataSourceId
                                }
                                dataSourceList[k] = dataSourceJson
                            }
                        }
                    }


                    for (var i = 0; i < programJson.regionList.length; i++) {
                        var regionJson = {
                            // name: // programJson.regionList[i].regionId,
                            name: getLabelText(programJson.regionList[i].label, this.state.lang),
                            id: programJson.regionList[i].regionId
                        }
                        regionList.push(regionJson);

                    }

                    var planningUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                    var planningUnitOs = planningUnitTransaction.objectStore('planningUnit');
                    var planningUnitRequest = planningUnitOs.getAll();
                    var productCategoryId = 0;

                    var e = document.getElementById("planningUnitId");
                    var selectedPlanningUnit = e.options[e.selectedIndex].value;
                    planningUnitRequest.onsuccess = function (event) {
                        var planningUnitResult = [];
                        planningUnitResult = planningUnitRequest.result;
                        for (var k = 0; k < planningUnitResult.length; k++) {
                            if (selectedPlanningUnit == planningUnitResult[k].planningUnitId) {
                                productCategoryId = planningUnitResult[k].forecastingUnit.productCategory.id;
                                console.log("productCategoryId-----111------ ", productCategoryId);
                                this.setState({
                                    productCategoryId: productCategoryId
                                })
                            }
                        }
                    }.bind(this);

                    var plannigUnitId = document.getElementById("planningUnitId").value;
                    var consumptionList = (programJson.consumptionList);
                    this.setState({
                        consumptionList: consumptionList
                    });
                    console.log("consumption list----", consumptionList);
                    var data = [];
                    var consumptionDataArr = []
                    var count = 0;
                    for (var j = 0; j < consumptionList.length; j++) {
                        if (consumptionList[j].planningUnit.id == plannigUnitId) {
                            data = [];
                            data[0] = consumptionList[j].consumptionDate;
                            data[1] = consumptionList[j].region.id;
                            data[2] = consumptionList[j].dataSource.id;
                            data[3] = consumptionList[j].consumptionQty;
                            data[4] = consumptionList[j].dayOfStockOut;

                            if (consumptionList[j].notes === null || consumptionList[j].notes === ' NULL') {
                                data[5] = '';
                            } else {
                                data[5] = consumptionList[j].notes;
                            }
                            data[6] = consumptionList[j].actualFlag;
                            data[7] = consumptionList[j].active;
                            data[8] = j;
                            data[9] = consumptionList[j].batchInfoList;
                            consumptionDataArr[count] = data;
                            count++;
                        }
                    }
                    if (consumptionDataArr.length == 0) {
                        data = [];
                        data[6] = true;
                        data[7] = true;
                        data[9] = [];
                        consumptionDataArr[0] = data;
                    }

                    this.el = jexcel(document.getElementById("consumptiontableDiv"), '');
                    this.el.destroy();
                    var json = [];
                    var data = consumptionDataArr;
                    var options = {
                        data: data,
                        columnDrag: true,
                        colWidths: [80, 120, 150, 80, 80, 180, 100, 80],
                        columns: [
                            {
                                title: 'Consumption Date',
                                type: 'calendar',
                                options: {
                                    format: 'MM-YYYY'
                                }
                            },
                            {
                                title: i18n.t('static.inventory.region'),
                                type: 'dropdown',
                                source: regionList
                            },
                            {
                                title: i18n.t('static.inventory.dataSource'),
                                type: 'dropdown',
                                source: dataSourceList
                            },
                            {
                                title: i18n.t('static.consumption.consumptionqty'),
                                type: 'numeric', mask: '#,##'
                            },
                            {
                                title: i18n.t('static.consumption.daysofstockout'),
                                type: 'numeric', mask: '#,##'
                            },
                            {
                                title: 'Notes',
                                type: 'text'
                            },
                            { type: 'dropdown', title: i18n.t('static.consumption.consumptionType'), source: [{ id: true, name: i18n.t('static.consumption.actual') }, { id: false, name: i18n.t('static.consumption.forcast') }] },
                            {
                                title: i18n.t('static.common.active'),
                                type: 'checkbox'
                            },
                            {
                                title: 'Index',
                                type: 'hidden'
                            },
                            {
                                title: 'Batch details',
                                type: 'hidden'
                            }
                        ],
                        text: {
                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                            show: '',
                            entries: '',
                        },
                        onload: this.loaded,
                        pagination: 10,
                        search: true,
                        columnSorting: true,
                        tableOverflow: true,
                        wordWrap: true,
                        allowInsertColumn: false,
                        allowManualInsertColumn: false,
                        allowDeleteRow: false,
                        onchange: this.changed,
                        oneditionend: this.onedit,
                        copyCompatibility: true,
                        paginationOptions: [10, 25, 50, 100],
                        position: 'top',
                        contextMenu: function (obj, x, y, e) {
                            var items = [];
                            //Add consumption batch info
                            var rowData = obj.getRowData(y)
                            if (rowData[6].toString() == "true") {
                                items.push({
                                    title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                    onclick: function () {
                                        this.toggleLarge();
                                        this.el = jexcel(document.getElementById("consumptionBatchInfoTable"), '');
                                        this.el.destroy();
                                        var json = [];
                                        var rowData = obj.getRowData(y)
                                        var batchInfo = rowData[9];
                                        var consumptionQty = (rowData[3]).toString().replaceAll("\,", "");
                                        var consumptionBatchInfoQty = 0;
                                        for (var sb = 0; sb < batchInfo.length; sb++) {
                                            var data = [];
                                            data[0] = batchInfo[sb].batch.batchId;
                                            data[1] = batchInfo[sb].batch.expiryDate;
                                            data[2] = batchInfo[sb].consumptionQty;
                                            data[3] = batchInfo[sb].consumptionTransBatchInfoId;
                                            data[4] = y;
                                            consumptionBatchInfoQty += parseInt(batchInfo[sb].consumptionQty);
                                            json.push(data);
                                        }
                                        if (parseInt(consumptionQty) > consumptionBatchInfoQty && batchInfo.length > 0) {
                                            var data = [];
                                            data[0] = -1;
                                            data[1] = "";
                                            data[2] = parseInt(consumptionQty) - parseInt(consumptionBatchInfoQty);
                                            data[3] = 0;
                                            data[4] = y;
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
                                            colWidths: [100, 150, 100],
                                            columns: [
                                                {
                                                    title: i18n.t('static.supplyPlan.batchId'),
                                                    type: 'dropdown',
                                                    source: batchList,
                                                    filter: this.filterBatchInfoForExistingData
                                                },
                                                {
                                                    title: i18n.t('static.supplyPlan.expiryDate'),
                                                    type: 'calendar',
                                                    options: {
                                                        format: 'MM-DD-YYYY',
                                                        validRange: [moment(Date.now()).format("YYYY-MM-DD"), null]
                                                    },
                                                    readOnly: true
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
                                                                data[2] = "";
                                                                data[3] = 0;
                                                                data[4] = y;
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
                                    items.push({
                                        title: i18n.t('static.supplyPlan.addNewConsumption'),
                                        onclick: function () {
                                            var data = [];
                                            data[0] = "";
                                            data[1] = "";
                                            data[2] = "";
                                            data[3] = "";
                                            data[4] = "";
                                            data[5] = "";
                                            data[6] = true;
                                            data[7] = true;
                                            data[8] = -1;
                                            data[9] = [];
                                            consumptionDataArr[0] = data;
                                            obj.insertRow(data);
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
                    this.el = jexcel(document.getElementById("consumptiontableDiv"), options);
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }


    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    saveData = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState(
                {
                    changedFlag: 0
                }
            );
            var tableJson = this.el.getJson();
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');

                var programId = (document.getElementById("programId").value);

                var programRequest = programTransaction.get(programId);
                programRequest.onsuccess = function (event) {
                    let valid = true;
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var plannigUnitId = document.getElementById("planningUnitId").value;

                    var consumptionDataList = (programJson.consumptionList).filter(c => c.planningUnit.id == plannigUnitId);
                    var consumptionDataListNotFiltered = programJson.consumptionList;
                    for (var i = 0; i < consumptionDataList.length; i++) {
                        var map = new Map(Object.entries(tableJson[i]));
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].consumptionDate = moment(map.get("0")).format("YYYY-MM-DD");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].region.id = map.get("1");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].consumptionQty = map.get("2");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].dayOfStockOut = parseInt(map.get("3"));
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].dataSource.id = map.get("4");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].notes = map.get("5");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].actualFlag = map.get("6");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].active = map.get("7");
                    }

                    for (var i = consumptionDataList.length; i < tableJson.length; i++) {
                        var map = new Map(Object.entries(tableJson[i]))
                        var json = {
                            consumptionId: 0,
                            consumptionDate: moment(map.get("0")).format("YYYY-MM-DD"),
                            region: {
                                id: map.get("1")
                            },
                            consumptionQty: map.get("2"),
                            dayOfStockOut: parseInt(map.get("3")),
                            dataSource: {
                                id: map.get("4")
                            },
                            notes: map.get("5"),
                            actualFlag: map.get("6"),
                            active: map.get("7"),
                            planningUnit: {
                                id: plannigUnitId,
                                forecastingUnit: {
                                    productCategory: {
                                        id: this.state.productCategoryId
                                    }
                                }
                            },
                            batchInfoList: []
                        }
                        consumptionDataListNotFiltered.push(json);
                    }

                    let count = 0;
                    for (var i = 0; i < tableJson.length; i++) {

                        count = 0;
                        var map = new Map(Object.entries(tableJson[i]));

                        for (var j = 0; j < tableJson.length; j++) {

                            var map1 = new Map(Object.entries(tableJson[j]));

                            if (moment(map.get("0")).format("YYYY-MM") === moment(map1.get("0")).format("YYYY-MM") && parseInt(map.get("1")) === parseInt(map1.get("1")) && map.get("6") === map1.get("6")) {
                                count++;
                            }
                            if (count > 1) {
                                i = tableJson.length;
                                break;
                            }
                        }
                    }

                    if (count <= 1) {
                        programJson.consumptionList = consumptionDataListNotFiltered;
                        programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                        var putRequest = programTransaction.put(programRequest.result);

                        putRequest.onerror = function (event) {
                            // Handle errors!
                        };
                        putRequest.onsuccess = function (event) {
                            this.setState({
                                message: 'static.message.consumptionSaved',
                                changedFlag: 0,
                                color: 'green'
                            })
                            this.hideFirstComponent();
                            this.props.history.push(`/consumptionDetails/` + i18n.t('static.message.consumptionSuccess'));
                        }.bind(this)
                    } else {
                        this.setState({
                            message: 'Duplicate Consumption Details Found',
                            changedFlag: 0,
                            color: 'red'
                        })
                        this.hideFirstComponent();
                    }
                }.bind(this)
            }.bind(this)
        } else {
            console.log("some thing get wrong...");
        }

    }.bind(this);

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
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname })}</h5>
                <Card>
                    <CardBody >
                        <Formik
                            render={
                                ({
                                }) => (
                                        <Form name='simpleForm'>
                                            <Col md="12 pl-0">
                                                <div className="d-md-flex">
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.consumption.program')}</Label>
                                                        <div className="controls ">
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
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.consumption.planningunit')}</Label>
                                                        <div className="controls ">
                                                            <InputGroup>
                                                                <Input
                                                                    type="select"
                                                                    name="planningUnitId"
                                                                    id="planningUnitId"
                                                                    bsSize="sm"
                                                                    value={this.state.planningUnitId}
                                                                    onChange={this.formSubmit}
                                                                >
                                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                                    {planningUnits}
                                                                </Input>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                </div>
                                            </Col>
                                        </Form>
                                    )} />

                        <Col xs="12" sm="12" className="p-0">
                            <div className="table-responsive">
                                <div id="consumptiontableDiv">
                                </div>
                            </div>
                        </Col>
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveData()} ><i className="fa fa-check"></i>{i18n.t('static.common.saveData')}</Button>
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>

                <Modal isOpen={this.state.consumptionBatchInfo}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                        <strong>Batch Details</strong>
                    </ModalHeader>
                    <ModalBody>
                        {/* <h6 className="red">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6> */}
                        <div className="table-responsive">
                            <div id="consumptionBatchInfoTable"></div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        {this.state.consumptionBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.saveConsumptionBatchInfo}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
                {/* Consumption modal */}
            </div>
        );
    }

    getProductList(event) {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var productTransaction = db1.transaction(['product'], 'readwrite');
            var productOs = productTransaction.objectStore('product');
            var productRequest = productOs.getAll();
            var proList = []
            productRequest.onerror = function (event) {
                // Handle errors!
            };
            productRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = productRequest.result;
                console.log("myResult", myResult);
                // console.log(event.target.value);
                var categoryId = document.getElementById("categoryId").value;
                console.log(categoryId)
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].productCategory.productCategoryId == categoryId) {
                        var productJson = {
                            name: getLabelText(myResult[i].label, lan),
                            id: myResult[i].productId
                        }
                        proList[i] = productJson
                    }
                }
                this.setState({
                    productList: proList
                })
            }.bind(this);
        }.bind(this)
    }


    getPlanningUnitList(event) {
        console.log("-------------in planning list-------------")
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
                // Handle errors!
            };
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                console.log("myResult", myResult);
                var programId = (document.getElementById("programId").value).split("_")[0];
                console.log('programId----->>>', programId)
                console.log(myResult);
                var proList = []
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].program.id == programId) {
                        var productJson = {
                            name: getLabelText(myResult[i].planningUnit.label, this.state.lang),
                            id: myResult[i].planningUnit.id
                        }
                        proList[i] = productJson
                    }
                }
                console.log("proList---" + proList);
                this.setState({
                    planningUnitList: proList
                })
            }.bind(this);
        }.bind(this)
    }


    changed = function (instance, cell, x, y, value) {
        this.setState({
            changedFlag: 1
        })

        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Date.parse(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invaliddate'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        if (x == 3) {
            var reg = /^[0-9\b]+$/;
            var col = ("D").concat(parseInt(y) + 1);
            value = value.toString().replaceAll("\,", "");
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    // this.setState({
                    //     consumptionNoStockError: ''
                    // })
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
        }

        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            var reg = /^[0-9\b]+$/;
            value = value.toString().replaceAll("\,", "");
            if (value != "") {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    }
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        if (x == 6) {
            var col = ("G").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
    }.bind(this)

    checkValidation() {
        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {
            var col = ("A").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(0, y);
            if (value == "Invalid date" || value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            var col = ("B").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(1, y);
            if (value == "Invalid date" || value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            var col = ("C").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(2, y);
            if (value == "" || isNaN(Number.parseInt(value)) || value < 0) {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                valid = false;
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                }
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            var col = ("D").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(3, y);
            var reg = /^[0-9\b]+$/;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }

            var col = ("E").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(4, y);
            if (value == "Invalid date" || value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }

            var col = ("G").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(6, y);
            if (value == "Invalid date" || value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false;
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }
        return valid;
    }
    cancelClicked() {
        this.props.history.push(`/dashboard/` + 'red/' + i18n.t('static.message.cancelled'))
    }
}
