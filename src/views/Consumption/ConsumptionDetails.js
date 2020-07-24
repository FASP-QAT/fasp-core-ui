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
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'

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
            timeout: 0
        }
        this.getProductList = this.getProductList.bind(this);
        this.saveData = this.saveData.bind(this)
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.checkValidationConsumptionBatchInfo = this.checkValidationConsumptionBatchInfo.bind(this);
        this.saveConsumptionBatchInfo = this.saveConsumptionBatchInfo.bind(this);
    }


    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        clearTimeout(this.state.timeout);
        this.state.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);

    }

    // componentWillUnmount() {
    // clearTimeout(this.timeout);
    // }

    toggleLarge() {
        this.setState({
            consumptionBatchInfoChangedFlag: 0,
            consumptionBatchInfoDuplicateError: '',
            consumptionBatchInfoNoStockError: ''
        })
        this.setState({
            consumptionBatchInfo: !this.state.consumptionBatchInfo,
        });
    }

    componentDidMount = function () {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var program = transaction.objectStore('programData');
            var getRequest = program.getAll();
            var proList = []
            getRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
            }.bind(this);
            getRequest.onsuccess = function (event) {
                var myResult = [];
                myResult = getRequest.result;
                var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
                var userId = userBytes.toString(CryptoJS.enc.Utf8);
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].userId == userId) {
                        var bytes = CryptoJS.AES.decrypt(myResult[i].programName, SECRET_KEY);
                        var programNameLabel = bytes.toString(CryptoJS.enc.Utf8);
                        var programDataBytes = CryptoJS.AES.decrypt(myResult[i].programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson1 = JSON.parse(programData);
                        var programJson = {
                            name: getLabelText(JSON.parse(programNameLabel), this.state.lang) + " - " + programJson1.programCode + "~v" + myResult[i].version,
                            id: myResult[i].id
                        }
                        proList.push(programJson)
                    }
                }
                this.setState({
                    programList: proList
                })

            }.bind(this);
        }.bind(this)
    };

    getProductList(event) {
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var productTransaction = db1.transaction(['product'], 'readwrite');
            var productOs = productTransaction.objectStore('product');
            var productRequest = productOs.getAll();
            var proList = []
            productRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
            }.bind(this);
            productRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = productRequest.result;
                console.log("myResult", myResult);
                var categoryId = document.getElementById("categoryId").value;
                console.log(categoryId)
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].productCategory.productCategoryId == categoryId && myResult[i].active == true) {
                        var productJson = {
                            name: getLabelText(myResult[i].label, this.state.lang),
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
        var db1;
        var storeOS;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            planningunitRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
            }.bind(this);
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                console.log("myResult", myResult);
                var programId = (document.getElementById("programId").value).split("_")[0];
                console.log('programId----->>>', programId)
                console.log(myResult);
                var proList = []
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].program.id == programId && myResult[i].active == true) {
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

    formSubmit() {
        var programId = document.getElementById('programId').value;
        this.setState({ programId: programId });
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);

        var dataSourceList = []
        var regionList = []
        openRequest.onerror = function (event) {
            this.setState({
                message: i18n.t('static.program.errortext'),
                color: 'red'
            })
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);
            programRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
            }.bind(this);
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                this.setState({
                    programJsonAfterConsumptionClicked: programJson
                })
                var batchList = []
                var batchInfoList = programJson.batchInfoList;
                this.setState({
                    batchInfoListAllForConsumption: batchInfoList
                })
                var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                var dataSourceRequest = dataSourceOs.getAll();
                dataSourceRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: 'red'
                    })
                }.bind(this);
                dataSourceRequest.onsuccess = function (event) {
                    var dataSourceResult = [];
                    dataSourceResult = dataSourceRequest.result;
                    dataSourceResult = dataSourceResult.filter(c => (c.dataSourceType.id == ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE || c.dataSourceType.id == FORECASTED_CONSUMPTION_DATA_SOURCE_TYPE) && c.active == true);
                    for (var k = 0; k < dataSourceResult.length; k++) {
                        if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0) {
                            if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                                var dataSourceJson = {
                                    name: getLabelText(dataSourceResult[k].label, this.state.lang),
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
                    planningUnitRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: 'red'
                        })
                    }.bind(this);
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
                    console.log("ConsumptionList", consumptionList);
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
                    document.getElementById("consumptiontableDiv").classList.add('Consumptionsearchinline');
                    this.el.destroy();
                    var json = [];
                    var data = consumptionDataArr;
                    var options = {
                        data: data,
                        columnDrag: true,
                        colWidths: [80, 120, 150, 80, 80, 180, 100, 80],
                        columns: [
                            {
                                title: i18n.t('static.report.consumptionDate'),
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
                                title: i18n.t('static.program.notes'),
                                type: 'text'
                            },
                            { type: 'dropdown', title: i18n.t('static.consumption.consumptionType'), source: [{ id: true, name: i18n.t('static.consumption.actual') }, { id: false, name: i18n.t('static.consumption.forcast') }] },
                            {
                                title: i18n.t('static.common.active'),
                                type: 'checkbox'
                            },
                            {
                                title: i18n.t('static.supplyPlan.index'),
                                type: 'hidden'
                            },
                            {
                                title: i18n.t('static.supplyPlan.batchInfo'),
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
                        allowExport: false,
                        paginationOptions: [10, 25, 50, 100],
                        position: 'top',
                        updateTable: function (el, cell, x, y, source, value, id) {
                            var elInstance = el.jexcel;
                            var rowData = elInstance.getRowData(y);
                            var batchInfo = rowData[9];
                            if (rowData[6].toString() == "true") {
                                if (batchInfo != "") {
                                    var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                                    cell.classList.add('readonly');
                                } else {
                                    var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                                    cell.classList.remove('readonly');
                                }
                            }
                        }.bind(this),
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
                                        var date = moment(rowData[0]).startOf('month').format("YYYY-MM-DD");
                                        console.log("Date", date);
                                        var batchList = [];
                                        batchInfoList = batchInfoList.filter(c => (moment(c.expiryDate).format("YYYY-MM-DD") >= date && moment(c.createdDate).format("YYYY-MM-DD") <= date));
                                        console.log("Batch info list", batchInfoList);
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
                                            batchInfoList: batchList
                                        })
                                        console.log("Date", date);
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
                                            allowExport: false,
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
                    var consumptionEl = jexcel(document.getElementById("consumptiontableDiv"), options);
                    this.el = consumptionEl;
                    this.setState({
                        consumptionEl: consumptionEl
                    })
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    loadedBatchInfoConsumption = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    filterBatchInfoForExistingData = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[3];
        console.log("Value", value);
        var d = (instance.jexcel.getJson()[r])[0];
        if (value != 0) {
            mylist = this.state.batchInfoList.filter(c => c.id != -1);
        } else {
            mylist = this.state.batchInfoList;
        }
        return mylist;
    }.bind(this)

    batchInfoChangedConsumption = function (instance, cell, x, y, value) {
        this.setState({
            consumptionBatchError: ''
        })
        var elInstance = instance.jexcel;
        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.setState({
                    consumptionBatchInfoDuplicateError: '',
                    consumptionBatchInfoNoStockError: ''
                })
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                if (value != -1) {
                    var expiryDate = this.state.batchInfoListAllForConsumption.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0].expiryDate;
                    elInstance.setValueFromCoords(1, y, expiryDate, true);
                } else {
                    elInstance.setValueFromCoords(1, y, "", true);
                }
                var col1 = ("C").concat(parseInt(y) + 1);
                var qty = elInstance.getValueFromCoords(2, y).replaceAll("\,", "");
                console.log("Qty----------->", qty);
                if (parseInt(qty) > 0) {
                    console.log("In if");
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }
            }
        }
        if (x == 2) {
            var reg = /^[0-9\b]+$/;
            var col = ("C").concat(parseInt(y) + 1);
            value = (elInstance.getRowData(y))[2];
            value = value.toString().replaceAll("\,", "");
            console.log("Value", value);
            if (value == "" || value == 0) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.setState({
                        consumptionBatchInfoNoStockError: ''
                    })
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }
        }
        this.setState({
            consumptionBatchInfoChangedFlag: 1
        })
    }.bind(this)

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
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.supplyPlan.duplicateBatchNumber'));
                }
                valid = false;
                this.setState({
                    consumptionBatchInfoDuplicateError: i18n.t('static.supplyPlan.duplicateBatchNumber')
                })
            }
            else {
                var programJson = this.state.programJsonAfterConsumptionClicked;
                var shipmentList = programJson.shipmentList;
                var shipmentBatchArray = [];
                for (var ship = 0; ship < shipmentList.length; ship++) {
                    var batchInfoList = shipmentList[ship].batchInfoList;
                    for (var bi = 0; bi < batchInfoList.length; bi++) {
                        shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
                    }
                }
                if (map.get("0") != -1) {
                    var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0];
                    var totalStockForBatchNumber = stockForBatchNumber.qty;
                    var consumptionList = (this.state.consumptionEl).getJson();
                    var consumptionBatchArray = [];
                    console.log("ConsumptionList", consumptionList);
                    for (var con = 0; con < consumptionList.length; con++) {
                        var consumptionIndex = map.get("4");
                        var consumptionMap = new Map(Object.entries(consumptionList[con]));
                        if (con != consumptionIndex) {
                            var batchInfoList = (consumptionMap.get("9"));
                            console.log("Batch info list");
                            for (var bi = 0; bi < batchInfoList.length; bi++) {
                                consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
                            }
                        }
                    }
                    var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText);
                    if (consumptionForBatchNumber == undefined) {
                        consumptionForBatchNumber = [];
                    }
                    console.log("Consumption for batch number", consumptionForBatchNumber);
                    var consumptionQty = 0;
                    for (var b = 0; b < consumptionForBatchNumber.length; b++) {
                        consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
                    }
                    console.log("Consumption qty except this row", consumptionQty);
                    consumptionQty += parseInt(map.get("2").toString().replaceAll("\,", ""));
                    console.log("parseInt(map.get(2)", parseInt(map.get("2").toString().replaceAll("\,", "")))
                    console.log("Consumption qty", consumptionQty)
                    var inventoryList = programJson.inventoryList;
                    var inventoryBatchArray = [];
                    for (var inv = 0; inv < inventoryList.length; inv++) {
                        var batchInfoList = inventoryList[inv].batchInfoList;
                        for (var bi = 0; bi < batchInfoList.length; bi++) {
                            inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
                        }
                    }
                    var inventoryForBatchNumber = [];
                    if (inventoryBatchArray.length > 0) {
                        inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText);
                    }
                    if (inventoryForBatchNumber == undefined) {
                        inventoryForBatchNumber = [];
                    }
                    var adjustmentQty = 0;
                    for (var b = 0; b < inventoryForBatchNumber.length; b++) {
                        adjustmentQty += parseFloat(inventoryForBatchNumber[b].qty);
                    }

                    var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
                    console.log("Remaining qty", remainingBatchQty);
                    console.log('parseInt(totalStockForBatchNumber)', parseInt(totalStockForBatchNumber))
                    console.log('parseInt(consumptionQty)', parseInt(consumptionQty));
                    console.log('parseFloat(adjustmentQty)', parseFloat(adjustmentQty))
                    if (remainingBatchQty < 0) {
                        var col = ("C").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.supplyPlan.noStockAvailable'));
                        valid = false;
                        this.setState({
                            consumptionBatchInfoNoStockError: i18n.t('static.supplyPlan.noStockAvailable')
                        })
                    }
                } else {
                    var colArr = ['A'];
                    for (var c = 0; c < colArr.length; c++) {
                        var col = (colArr[c]).concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                    var col = ("A").concat(parseInt(y) + 1);
                    var value = elInstance.getValueFromCoords(0, y);
                    if (value == "") {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }

                    var col = ("C").concat(parseInt(y) + 1);
                    var value = (elInstance.getRowData(y))[2];
                    value = value.toString().replaceAll("\,", "");
                    var reg = /^[0-9\b]+$/;
                    if (value === "" || isNaN(Number.parseInt(value)) || !(reg.test(value)) || value == 0) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        valid = false;
                        if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                            elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                        } else {
                            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        }
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                }
            }
        }
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
                var batchInfoJson;
                if (map.get("0") != -1) {
                    var batchNo = elInstance.getCell(`A${parseInt(i) + 1}`).innerText;
                    var filteredBatch = this.state.batchInfoListAllForConsumption.filter(c => c.batchNo == batchNo);
                    var expiryDate = filteredBatch[0].expiryDate;
                    batchInfoJson = {
                        consumptionTransBatchInfoId: map.get("3"),
                        batch: {
                            batchId: map.get("0"),
                            batchNo: elInstance.getCell(`A${parseInt(i) + 1}`).innerText,
                            expiryDate: expiryDate
                        },
                        consumptionQty: map.get("2").toString().replaceAll("\,", "")
                    }
                    batchInfoArray.push(batchInfoJson);
                }
                totalConsumption += parseInt(map.get("2").toString().replaceAll("\,", ""));
            }
            var consumptionInstance = this.state.consumptionEl;
            consumptionInstance.setValueFromCoords(3, parseInt(rowNumber), totalConsumption, true);
            consumptionInstance.setValueFromCoords(9, parseInt(rowNumber), batchInfoArray, true);
            // rowData[10] = batchInfoArray;
            // consumptionInstance.setRowData(rowNumber, rowData);
            this.setState({
                consumptionChangedFlag: 1,
                consumptionBatchInfoChangedFlag: 0,
                consumptionBatchInfoTableEl: ''
            })
            this.toggleLarge();
        } else {
            this.setState({
                consumptionBatchError: i18n.t('static.supplyPlan.validationFailed')
            })
        }
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    changed = function (instance, cell, x, y, value) {
        var elInstance = this.state.consumptionEl;
        this.setState({
            changedFlag: 1
        })

        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Date.parse(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                } else {
                    this.setState({
                        message: ''
                    })
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                    var col = ("B").concat(parseInt(y) + 1);
                    var value = elInstance.getValueFromCoords(1, y)
                    if (value == "") {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    } else {
                        this.setState({
                            message: ''
                        })
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                    var col = ("G").concat(parseInt(y) + 1);
                    var value = elInstance.getValueFromCoords(6, y)
                    if (value == "") {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    } else {
                        this.setState({
                            message: ''
                        })
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }

                }
            }
        }

        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.setState({
                    message: ''
                })
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var col = ("A").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(0, y)
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    this.setState({
                        message: ''
                    })
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                var col = ("G").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(6, y)
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    this.setState({
                        message: ''
                    })
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }

        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 3) {
            var reg = /^[0-9\b]+$/;
            var col = ("D").concat(parseInt(y) + 1);
            value = (elInstance.getRowData(y))[3];
            value = value.toString().replaceAll("\,", "");
            console.log("Value", value);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    // this.setState({
                    //     consumptionNoStockError: ''
                    // })
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }
        }

        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            var reg = /^[0-9\b]+$/;
            value = (elInstance.getRowData(y))[4];
            value = value.toString().replaceAll("\,", "");
            if (value != "") {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 6) {
            var col = ("G").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.setState({
                    message: ''
                })
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var col = ("B").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(1, y)
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    this.setState({
                        message: ''
                    })
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                var col = ("A").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(0, y)
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    this.setState({
                        message: ''
                    })
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }
    }.bind(this)

    checkValidation() {
        var valid = true;
        var elInstance = this.state.consumptionEl;
        var json = elInstance.getJson();
        var mapArray = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);
            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("6").toString() == map.get("6").toString() &&
                moment(c.get("0")).format("YYYY-MM") == moment(map.get("0")).format("YYYY-MM") &&
                c.get("1").toString() == map.get("1").toString()
            )
            console.log("checkDuplicate in mao", checkDuplicateInMap);
            if (checkDuplicateInMap.length > 1) {
                var colArr = ['A', 'B', 'G'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.supplyPlan.duplicateConsumption'));
                }
                valid = false;
                this.setState({
                    message: i18n.t('static.supplyPlan.duplicateConsumption'),
                    color: 'red'
                })
            } else {
                var colArr = ['A', 'B', 'G'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("A").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(0, y);
                if (value == "Invalid date" || value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("B").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(1, y);
                if (value == "Invalid date" || value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("C").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(2, y);
                if (value == "Invalid date" || value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("D").concat(parseInt(y) + 1);
                var value = (elInstance.getRowData(y))[3];
                value = value.toString().replaceAll("\,", "");
                var reg = /^[0-9\b]+$/;
                if (value === "" || isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var reg = /^[0-9\b]+$/;
                var col = ("E").concat(parseInt(y) + 1);
                var value = (elInstance.getRowData(y))[4];
                value = value.toString().replaceAll("\,", "");
                if (value != "") {
                    if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        valid = false;
                        if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                            elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                        } else {
                            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        }
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("G").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(6, y);
                if (value == "Invalid date" || value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }
        return valid;
    }

    saveData = function () {
        var elInstance = this.state.consumptionEl;
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({
                changedFlag: 0
            });
            var tableJson = elInstance.getJson();
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onerror = function (event) {
                this.setState({
                    message: i18n.t('static.program.errortext'),
                    color: 'red'
                })
            }.bind(this);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');
                var programId = (document.getElementById("programId").value);
                var programRequest = programTransaction.get(programId);
                programRequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: 'red'
                    })
                }.bind(this);
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
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].consumptionDate = moment(map.get("0")).startOf('month').format("YYYY-MM-DD");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].region.id = map.get("1");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].dataSource.id = map.get("2");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].consumptionQty = (map.get("3")).toString().replaceAll("\,", "");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].dayOfStockOut = (map.get("4")).toString().replaceAll("\,", "");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].notes = map.get("5");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].actualFlag = map.get("6");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].active = map.get("7");
                        consumptionDataListNotFiltered[parseInt(map.get("8"))].batchInfoList = map.get("9");
                    }
                    for (var i = consumptionDataList.length; i < tableJson.length; i++) {
                        var map = new Map(Object.entries(tableJson[i]))
                        var json = {
                            consumptionId: 0,
                            consumptionDate: moment(map.get("0")).startOf('month').format("YYYY-MM-DD"),
                            region: {
                                id: map.get("1")
                            },
                            consumptionQty: (map.get("3")).toString().replaceAll("\,", ""),
                            dayOfStockOut: (map.get("4")).toString().replaceAll("\,", ""),
                            dataSource: {
                                id: map.get("2")
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
                            batchInfoList: map.get("9")
                        }
                        consumptionDataListNotFiltered.push(json);
                    }

                    programJson.consumptionList = consumptionDataListNotFiltered;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: 'red'
                        })
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.setState({
                            message: 'static.message.consumptionSaved',
                            changedFlag: 0,
                            color: 'green'
                        })
                        this.hideFirstComponent();
                        this.props.history.push(`/consumptionDetails/` + i18n.t('static.message.consumptionSuccess'));
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            console.log("some thing get wrong...");
        }

    }.bind(this);

    cancelClicked() {
        this.props.history.push(`/ApplicationDashboard/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    actionCanceled() {
        this.toggleLarge();
    }

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
                    <CardBody>
                        <Formik
                            render={
                                ({
                                }) => (
                                        <Form name='simpleForm'>
                                            <Col md="12 pl-0">
                                                <div className="d-md-flex">
                                                    <FormGroup className="col-md-3 pl-0">
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
                        <strong>{i18n.t('static.dataEntry.batchDetails')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red">{this.state.consumptionBatchInfoDuplicateError || this.state.consumptionBatchInfoNoStockError || this.state.consumptionBatchError}</h6>
                        <div className="table-responsive">
                            <div id="consumptionBatchInfoTable"></div>
                        </div>
                        <input type="hidden" id="consumptionIndex" />
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
}
