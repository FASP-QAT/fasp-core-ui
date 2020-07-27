import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import jexcel from 'jexcel';
import React, { Component } from 'react';
import {
    Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormGroup, Input,
    InputGroup, InputGroupAddon, Label, Modal, ModalBody, ModalFooter, ModalHeader
} from 'reactstrap';
import "../../../node_modules/jexcel/dist/jexcel.css";
import getLabelText from '../../CommonComponent/getLabelText';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { SECRET_KEY, INVENTORY_DATA_SOURCE_TYPE } from '../../Constants.js';
import i18n from '../../i18n';
import moment from "moment";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'

const entityname = i18n.t('static.inventory.inventorydetils')
export default class AddInventory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            programList: [],
            programId: '',
            changedFlag: 0,
            countrySKUList: [],
            message: '',
            lang: localStorage.getItem('lang'),
            timeout: 0

        }
        this.options = props.options;
        this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.getCountrySKUList = this.getCountrySKUList.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.checkValidationInventoryBatchInfo = this.checkValidationInventoryBatchInfo.bind(this);
        this.saveInventoryBatchInfo = this.saveInventoryBatchInfo.bind(this);

    }

    toggleLarge() {
        this.setState({
            inventoryBatchInfoChangedFlag: 0,
            inventoryBatchInfoDuplicateError: '',
            inventoryBatchInfoNoStockError: ''
        })
        this.setState({
            inventoryBatchInfo: !this.state.inventoryBatchInfo,
        });
    }
    hideFirstComponent() {
        document.getElementById('div1').style.display = 'block';
        this.timeout = setTimeout(function () {
            document.getElementById('div1').style.display = 'none';
        }, 8000);
    }
    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    // hideFirstComponent() {
    //     document.getElementById('div1').style.display = 'block';
    //     clearTimeout(this.state.timeout);
    //     this.state.timeout = setTimeout(function () {
    //         document.getElementById('div1').style.display = 'none';
    //     }, 8000);

    // }

    componentDidMount() {
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
                        proList[i] = programJson
                    }
                }
                this.setState({
                    programList: proList
                })

            }.bind(this);
        }.bind(this);

    }

    getCountrySKUList() {
        var programId = document.getElementById('programId').value;
        this.setState({ programId: programId });
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        var countrySKUList = []
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

                var countrySKUTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                var countrySKUOs = countrySKUTransaction.objectStore('realmCountryPlanningUnit');
                var countrySKURequest = countrySKUOs.getAll();
                countrySKURequest.onerror = function (event) {
                    this.setState({
                        message: i18n.t('static.program.errortext'),
                        color: 'red'
                    })
                }.bind(this);
                countrySKURequest.onsuccess = function (event) {
                    var countrySKUResult = [];
                    countrySKUResult = (countrySKURequest.result).filter(c => c.active == true);
                    for (var k = 0; k < countrySKUResult.length; k++) {
                        if (countrySKUResult[k].realmCountry.id == programJson.realmCountry.realmCountryId) {
                            var countrySKUJson = {
                                name: getLabelText(countrySKUResult[k].label, this.state.lang),
                                id: countrySKUResult[k].realmCountryPlanningUnitId
                            }
                            countrySKUList.push(countrySKUJson);
                        }
                    }
                    console.log("countryasdas", countrySKUList);
                    this.setState({ countrySKUList: countrySKUList });
                }.bind(this);
            }.bind(this);
        }.bind(this);
    }

    filterBatchInfoForExistingData = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[5];
        console.log("Value", value);
        var d = (instance.jexcel.getJson()[r])[0];
        if (value != 0) {
            mylist = this.state.batchInfoList.filter(c => c.id != -1);
        } else {
            mylist = this.state.batchInfoList;
        }
        return mylist;
    }.bind(this)

    formSubmit() {
        if (this.state.changedFlag == 1) {

        } else {
            this.el = jexcel(document.getElementById("inventorytableDiv"), '');
            document.getElementById("inventorytableDiv").classList.add('AddInventorysearchinline');
            this.el.destroy();

            this.setState({
                inventoryEl: "",
                changedFlag: 0
            })
            var programId = document.getElementById('programId').value;
            this.setState({ programId: programId });
            var db1;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            var dataSourceList = []
            var regionList = []
            var countrySKUList = []
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
                        programJsonAfterAdjustmentClicked: programJson
                    })
                    var batchList = []
                    var batchInfoList = programJson.batchInfoList;
                    this.setState({
                        batchInfoListAllForInventory: batchInfoList
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
                        dataSourceResult = (dataSourceRequest.result).filter(c => c.active == true && c.dataSourceType.id == INVENTORY_DATA_SOURCE_TYPE);
                        for (var k = 0; k < dataSourceResult.length; k++) {
                            if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0) {
                                if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                                    var dataSourceJson = {
                                        name: getLabelText(dataSourceResult[k].label, this.state.lang),
                                        id: dataSourceResult[k].dataSourceId
                                    }
                                    dataSourceList.push(dataSourceJson);
                                }
                            }
                        }


                        var regionTransaction = db1.transaction(['region'], 'readwrite');
                        var regionOs = regionTransaction.objectStore('region');
                        var regionRequest = regionOs.getAll();
                        regionRequest.onerror = function (event) {
                            this.setState({
                                message: i18n.t('static.program.errortext'),
                                color: 'red'
                            })
                        }.bind(this);
                        regionRequest.onsuccess = function (event) {
                            var regionResult = [];
                            regionResult = (regionRequest.result).filter(c => c.active == true);
                            for (var k = 0; k < regionResult.length; k++) {
                                if (regionResult[k].realmCountry.realmCountryId == programJson.realmCountry.realmCountryId) {
                                    var regionJson = {
                                        name: getLabelText(regionResult[k].label, this.state.lang),
                                        id: regionResult[k].regionId
                                    }
                                    regionList.push(regionJson);
                                }
                            }
                            var countrySKUId = document.getElementById('countrySKU').value;
                            console.log("countrySKU---", countrySKUId);
                            // var inventoryList = (programJson.inventoryList).filter(i => i.realmCountryPlanningUnit.id == countrySKUId);
                            var inventoryList = (programJson.inventoryList);
                            this.setState({
                                inventoryList: inventoryList
                            });
                            console.log("inventoryList----------------->>", inventoryList);
                            var data = [];
                            var inventoryDataArr = []
                            // if (inventoryList.length == 0) {
                            //     data = [];
                            //     inventoryDataArr[0] = data;
                            // }
                            var count = 0;
                            if (inventoryList.length != 0) {
                                for (var j = 0; j < inventoryList.length; j++) {
                                    if (inventoryList[j].realmCountryPlanningUnit.id == countrySKUId) {
                                        var adjustmentType = "1";
                                        if (inventoryList[j].actualQty == "" || inventoryList[j].actualQty == 0) {
                                            adjustmentType = "2"
                                        }

                                        var readonlyAdjustmentType = "";
                                        if (inventoryList[j].batchInfoList.length != 0) {
                                            readonlyAdjustmentType = true
                                        } else {
                                            readonlyAdjustmentType = false
                                        }
                                        data = [];
                                        data[0] = inventoryList[j].inventoryDate;
                                        data[1] = inventoryList[j].region.id;
                                        data[2] = inventoryList[j].dataSource.id;
                                        data[3] = adjustmentType;
                                        data[4] = inventoryList[j].adjustmentQty;
                                        data[5] = inventoryList[j].actualQty;
                                        data[6] = inventoryList[j].notes;
                                        data[7] = inventoryList[j].active;
                                        data[8] = j;
                                        data[9] = inventoryList[j].batchInfoList;
                                        inventoryDataArr[count] = data;
                                        count++;
                                    }
                                }
                            }

                            console.log("inventory Data Array-->", inventoryDataArr);
                            if (inventoryDataArr.length == 0) {
                                data = [];
                                data[7] = true;
                                inventoryDataArr[0] = data;
                            }
                            this.el = jexcel(document.getElementById("inventorytableDiv"), '');
                            this.el.destroy();
                            var json = [];
                            var data = inventoryDataArr;
                            // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                            // json[0] = data;
                            var options = {
                                data: data,
                                columnDrag: true,
                                colWidths: [100, 100, 150, 120, 100, 100, 230, 80],
                                columns: [
                                    {
                                        title: i18n.t('static.inventory.inventoryDate'),
                                        type: 'calendar',
                                        options: { format: 'MM-YYYY' }

                                    },
                                    {
                                        title: i18n.t('static.inventory.region'),
                                        type: 'dropdown',
                                        source: regionList
                                        // readOnly: true
                                    },
                                    {
                                        title: i18n.t('static.inventory.dataSource'),
                                        type: 'dropdown',
                                        source: dataSourceList
                                    },
                                    { title: i18n.t('static.supplyPlan.inventoryType'), type: 'dropdown', source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }], readOnly: readonlyAdjustmentType },
                                    {
                                        title: i18n.t('static.inventory.manualAdjustment'),
                                        type: 'numeric', mask: '[-]#,##'
                                    },
                                    {
                                        title: i18n.t('static.inventory.actualStock'),
                                        type: 'numeric', mask: '#,##'
                                    },
                                    { title: i18n.t('static.program.notes'), type: 'text' },
                                    {
                                        title: i18n.t('static.inventory.active'),
                                        type: 'checkbox'
                                    },
                                    {
                                        title: 'Index',
                                        type: 'hidden'
                                    },
                                    { type: 'hidden', title: i18n.t('static.supplyPlan.batchInfo') }
                                ],
                                pagination: 10,
                                search: true,
                                columnSorting: true,
                                tableOverflow: true,
                                wordWrap: true,
                                paginationOptions: [10, 25, 50, 100],
                                position: 'top',
                                allowInsertColumn: false,
                                allowManualInsertColumn: false,
                                allowDeleteRow: false,
                                onchange: this.changed,
                                oneditionend: this.onedit,
                                copyCompatibility: true,
                                allowExport: false,
                                text: {
                                    showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                    show: '',
                                    entries: '',
                                },
                                onload: this.loaded,
                                updateTable: function (el, cell, x, y, source, value, id) {
                                    var elInstance = el.jexcel;
                                    var rowData = elInstance.getRowData(y);
                                    var batchInfo = rowData[9];
                                    if (batchInfo != "") {
                                        // 7 and 9
                                        var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                                        cell.classList.add('readonly');
                                        var cell = elInstance.getCell(`F${parseInt(y) + 1}`)
                                        cell.classList.add('readonly');
                                    } else {
                                        var adjustmentType = rowData[3];
                                        if (adjustmentType == 1) {
                                            var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                                            cell.classList.add('readonly');
                                            var cell = elInstance.getCell(`F${parseInt(y) + 1}`)
                                            cell.classList.remove('readonly');
                                        } else {
                                            var cell = elInstance.getCell(`F${parseInt(y) + 1}`)
                                            cell.classList.add('readonly');
                                            var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                                            cell.classList.remove('readonly');
                                        }
                                    }
                                }.bind(this),
                                contextMenu: function (obj, x, y, e) {
                                    var items = [];
                                    //Add consumption batch info
                                    var rowData = obj.getRowData(y)
                                    if (rowData[3] == 1 || rowData[3] == 2) {
                                        items.push({
                                            title: i18n.t('static.supplyPlan.addOrListBatchInfo'),
                                            onclick: function () {
                                                this.toggleLarge();
                                                this.el = jexcel(document.getElementById("inventoryBatchInfoTable"), '');
                                                this.el.destroy();
                                                var json = [];
                                                var batchList = [];
                                                var rowData = obj.getRowData(y);
                                                var countrySKUId = document.getElementById('countrySKU').value;
                                                var inventoryList = this.state.inventoryList.filter(c => c.realmCountryPlanningUnit.id == countrySKUId)[0];
                                                var date = moment(rowData[0]).startOf('month').format("YYYY-MM-DD");
                                                batchInfoList = batchInfoList.filter(c => (moment(c.expiryDate).format("YYYY-MM-DD") >= date && moment(c.createdDate).format("YYYY-MM-DD") <= date));
                                                console.log("Batch info list", batchInfoList);
                                                batchList.push({
                                                    name: i18n.t('static.supplyPlan.fefo'),
                                                    id: -1
                                                })
                                                for (var k = 0; k < batchInfoList.length; k++) {
                                                    if (batchInfoList[k].planningUnitId == inventoryList.planningUnit.id) {
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
                                                // var elInstance=this.state.plannedPsmShipmentsEl;
                                                var rowData = obj.getRowData(y);
                                                var batchInfo = rowData[9];
                                                var adjustmentType = rowData[3];
                                                var columnTypeForActualStock = "";
                                                var columnTypeForAdjustedQty = "";
                                                console.log('Adjustment type', adjustmentType);
                                                if (adjustmentType == 1) {
                                                    columnTypeForActualStock = "numeric";
                                                    columnTypeForAdjustedQty = "hidden";
                                                } else {
                                                    columnTypeForActualStock = "hidden";
                                                    columnTypeForAdjustedQty = "numeric";
                                                }
                                                var inventoryQty = 0;
                                                if (adjustmentType == 1) {
                                                    inventoryQty = (rowData[5]).toString().replaceAll("\,", "");
                                                } else {
                                                    inventoryQty = (rowData[4]).toString().replaceAll("\,", "");
                                                }
                                                var inventoryBatchInfoQty = 0;
                                                for (var sb = 0; sb < batchInfo.length; sb++) {
                                                    var data = [];
                                                    data[0] = batchInfo[sb].batch.batchId; //A
                                                    data[1] = batchInfo[sb].batch.expiryDate;
                                                    data[2] = adjustmentType; //B
                                                    data[3] = batchInfo[sb].adjustmentQty; //C
                                                    data[4] = batchInfo[sb].actualQty; //D
                                                    data[5] = batchInfo[sb].inventoryTransBatchInfoId; //E
                                                    data[6] = y; //F
                                                    if (adjustmentType == 1) {
                                                        inventoryBatchInfoQty += parseInt(batchInfo[sb].actualQty);
                                                    } else {
                                                        inventoryBatchInfoQty += parseInt(batchInfo[sb].adjustmentQty);
                                                    }
                                                    json.push(data);
                                                }
                                                if (parseInt(inventoryQty) != inventoryBatchInfoQty && batchInfo.length > 0) {
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
                                                    json.push(data);
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
                                                    json.push(data)
                                                }
                                                var options = {
                                                    data: json,
                                                    columnDrag: true,
                                                    colWidths: [100, 150, 290, 100, 100],
                                                    columns: [
                                                        {
                                                            title: i18n.t('static.supplyPlan.batchId'),
                                                            type: 'dropdown',
                                                            source: this.state.batchInfoList,
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
                                                            title: i18n.t('static.supplyPlan.adjustmentType'),
                                                            type: 'hidden',
                                                            source: [{ id: 1, name: i18n.t('static.consumption.actual') }, { id: 2, name: i18n.t('static.inventoryType.adjustment') }],
                                                            readOnly: true
                                                        },
                                                        {
                                                            title: i18n.t('static.inventory.manualAdjustment'),
                                                            type: columnTypeForAdjustedQty,
                                                            mask: '[-]#,##'
                                                        },
                                                        {
                                                            title: i18n.t('static.inventory.actualStock'),
                                                            type: columnTypeForActualStock,
                                                            mask: '#,##'
                                                        },
                                                        {
                                                            title: i18n.t('static.supplyPlan.inventoryTransBatchInfoId'),
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
                                                    onchange: this.batchInfoChangedInventory,
                                                    text: {
                                                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                        show: '',
                                                        entries: '',
                                                    },
                                                    onload: this.loadedBatchInfoInventory,
                                                    updateTable: function (el, cell, x, y, source, value, id) {
                                                        var elInstance = el.jexcel;
                                                        var rowData = elInstance.getRowData(y);
                                                        var adjustmentType = rowData[2];
                                                        if (adjustmentType == 1) {
                                                            var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                                                            cell.classList.add('readonly');
                                                            var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                                                            cell.classList.remove('readonly');
                                                        } else {
                                                            var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                                                            cell.classList.remove('readonly');
                                                            var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                                                            cell.classList.add('readonly');
                                                        }
                                                    }.bind(this),
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
                                                                var rowData = obj.getRowData(y);
                                                                var adjustmentType = rowData[2];
                                                                console.log("Adjustment type", adjustmentType)
                                                                items.push({
                                                                    title: i18n.t('static.supplyPlan.addNewBatchInfo'),
                                                                    onclick: function () {
                                                                        var data = [];
                                                                        data[0] = "";
                                                                        data[1] = "";
                                                                        data[2] = adjustmentType;
                                                                        data[3] = "";
                                                                        data[4] = "";
                                                                        data[5] = 0;
                                                                        data[6] = y;
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
                                                var elVar = jexcel(document.getElementById("inventoryBatchInfoTable"), options);
                                                this.el = elVar;
                                                this.setState({ inventoryBatchInfoTableEl: elVar });
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
                                            var json = obj.getJson();
                                            items.push({
                                                title: i18n.t('static.supplyPlan.addNewAdjustments'),
                                                onclick: function () {
                                                    // Add new adjustments
                                                    var data = [];
                                                    data[7] = true;
                                                    data[8] = -1;
                                                    data[9] = [];
                                                    obj.insertRow(data);
                                                }.bind(this)
                                            });
                                            // }
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
                            var inventoryEl = jexcel(document.getElementById("inventorytableDiv"), options);
                            this.el = inventoryEl;
                            this.setState({
                                inventoryEl: inventoryEl
                            });
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }
    }

    loadedBatchInfoInventory = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    batchInfoChangedInventory = function (instance, cell, x, y, value) {
        this.setState({
            inventoryBatchError: ''
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
                    inventoryBatchInfoDuplicateError: '',
                    inventoryBatchInfoNoStockError: ''
                })
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");

                if (value != -1) {
                    var expiryDate = this.state.batchInfoListAllForInventory.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText)[0].expiryDate;
                    elInstance.setValueFromCoords(1, y, expiryDate, true);
                } else {
                    elInstance.setValueFromCoords(1, y, "", true);
                }
                var col1 = ("D").concat(parseInt(y) + 1);
                elInstance.setStyle(col1, "background-color", "transparent");
                elInstance.setComments(col1, "");
            }
        }

        if (x == 3) {
            if (elInstance.getValueFromCoords(3, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(3, y).toString().replaceAll("\,", "") != 0) {
                var reg = /-?\d+/
                // var reg = /^[0-9\b]+$/;
                value = (elInstance.getRowData(y))[3];
                value = value.toString().replaceAll("\,", "");
                var col = ("D").concat(parseInt(y) + 1);
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.setState({
                        inventoryBatchInfoNoStockError: ''
                    })
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else if (elInstance.getValueFromCoords(2, y) == 2) {
                var col = ("D").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                var col = ("D").concat(parseInt(y) + 1);
                this.setState({
                    inventoryBatchInfoNoStockError: ''
                })
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 4) {
            if (elInstance.getValueFromCoords(4, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(4, y).toString().replaceAll("\,", "") != 0) {
                // var reg = /-?\d+/
                var reg = /^[0-9\b]+$/;
                var col = ("E").concat(parseInt(y) + 1);
                value = (elInstance.getRowData(y))[4];
                value = value.toString().replaceAll("\,", "")
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else if (elInstance.getValueFromCoords(2, y) == 1) {
                var col = ("E").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                var col = ("E").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
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
                if (value == 1) {
                    var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                    cell.classList.remove('readonly');
                    elInstance.setValueFromCoords(3, y, "", true);
                } else {
                    var cell = elInstance.getCell(`D${parseInt(y) + 1}`)
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                    cell.classList.remove('readonly');
                    elInstance.setValueFromCoords(4, y, "", true);
                }
            }
        }

        this.setState({
            inventoryBatchInfoChangedFlag: 1
        })
    }.bind(this)

    checkValidationInventoryBatchInfo() {
        var valid = true;
        var elInstance = this.state.inventoryBatchInfoTableEl;
        console.log("elInstnace", elInstance);
        var json = elInstance.getJson();
        console.log("Json", json)
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
                    inventoryBatchInfoDuplicateError: i18n.t('static.supplyPlan.duplicateBatchNumber')
                })
                console.log("In errror")
            } else {
                var programJson = this.state.programJsonAfterAdjustmentClicked;
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

                    var consumptionList = programJson.consumptionList;
                    var consumptionBatchArray = [];

                    for (var con = 0; con < consumptionList.length; con++) {
                        var batchInfoList = consumptionList[con].batchInfoList;
                        for (var bi = 0; bi < batchInfoList.length; bi++) {
                            consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
                        }
                    }
                    var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == elInstance.getCell(`A${parseInt(y) + 1}`).innerText);
                    if (consumptionForBatchNumber == undefined) {
                        consumptionForBatchNumber = [];
                    }
                    var consumptionQty = 0;
                    for (var b = 0; b < consumptionForBatchNumber.length; b++) {
                        consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
                    }

                    var inventoryList = programJson.inventoryList;
                    var inventoryBatchArray = [];
                    for (var inv = 0; inv < inventoryList.length; inv++) {
                        var invIndex = (this.state.inventoryEl).getRowData(parseInt(map.get("6")))[8];
                        if (inv != invIndex) {
                            var batchInfoList = inventoryList[inv].batchInfoList;
                            for (var bi = 0; bi < batchInfoList.length; bi++) {
                                inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
                            }
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
                    adjustmentQty += parseInt(map.get("3").toString().replaceAll("\,", ""));
                    var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
                    if (remainingBatchQty < 0) {
                        var col = ("D").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.supplyPlan.noStockAvailable'));

                        valid = false;
                        this.setState({
                            inventoryBatchInfoNoStockError: i18n.t('static.supplyPlan.noStockAvailable')
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

                    var col = ("D").concat(parseInt(y) + 1);
                    var value = value = ((elInstance.getRowData(y))[3]).toString().replaceAll("\,", "");
                    var reg = /-?\d+/;
                    // var reg = /^[0-9\b]+$/;
                    if (value != "" && value != 0) {
                        var reg = /-?\d+/
                        // var reg = /^[0-9\b]+$/;
                        var col = ("D").concat(parseInt(y) + 1);
                        if (isNaN(parseInt(value)) || !(reg.test(value))) {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", "yellow");
                            elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                            valid = false;
                        } else {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setComments(col, "");
                        }
                    } else if (elInstance.getValueFromCoords(2, y) == 2) {
                        var col = ("D").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        var col = ("D").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }

                    var value = ((elInstance.getRowData(y))[4]).toString().replaceAll("\,", "");
                    if (value != "" && value != 0) {
                        // var reg = /-?\d+/
                        var reg = /^[0-9\b]+$/;
                        var col = ("E").concat(parseInt(y) + 1);
                        if (isNaN(parseInt(value)) || !(reg.test(value))) {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", "yellow");
                            elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                            valid = false;
                        } else {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setComments(col, "");
                        }
                    } else if (elInstance.getValueFromCoords(2, y) == 1) {
                        var col = ("E").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        var col = ("E").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }

                    var value = elInstance.getValueFromCoords(2, y);
                    var col = ("C").concat(parseInt(y) + 1);
                    if (value == "") {
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
        }
        return valid;
    }

    saveInventoryBatchInfo() {
        var validation = this.checkValidationInventoryBatchInfo();
        if (validation == true) {
            var elInstance = this.state.inventoryBatchInfoTableEl;
            var json = elInstance.getJson();
            var batchInfoArray = [];
            var rowNumber = 0;
            var totalAdjustments = 0;
            var totalActualStock = 0;

            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                if (i == 0) {
                    rowNumber = map.get("6");
                }
                if (map.get("0") != -1) {
                    var batchInfoJson = {
                        inventoryTransBatchInfoId: map.get("5"),
                        batch: {
                            batchId: map.get("0"),
                            batchNo: elInstance.getCell(`A${parseInt(i) + 1}`).innerText,
                            expiryDate: map.get("1")
                        },
                        adjustmentQty: map.get("3").toString().replaceAll("\,", ""),
                        actualQty: map.get("4").toString().replaceAll("\,", "")
                    }
                    batchInfoArray.push(batchInfoJson);
                }
                totalAdjustments += parseInt(map.get("3").toString().replaceAll("\,", ""));
                totalActualStock += parseInt(map.get("4").toString().replaceAll("\,", ""));
            }
            console.log("Total actual stock", totalActualStock);
            var inventoryInstance = this.state.inventoryEl;
            console.log("map.get(1)", map.get("1"));
            if (map.get("2") == 1) {
                console.log("In if")
                inventoryInstance.setValueFromCoords(4, rowNumber, "", true);
                inventoryInstance.setValueFromCoords(5, rowNumber, totalActualStock, true);
            } else {
                inventoryInstance.setValueFromCoords(4, rowNumber, totalAdjustments, true);
                inventoryInstance.setValueFromCoords(5, rowNumber, "", true);
            }
            // rowData[15] = batchInfoArray;
            inventoryInstance.setValueFromCoords(9, rowNumber, batchInfoArray, "");
            this.setState({
                inventoryChangedFlag: 1,
                inventoryBatchInfoChangedFlag: 0,
                inventoryBatchInfoTableEl: ''
            })
            this.toggleLarge();
            document.getElementById("showInventoryBatchInfoButtonsDiv").style.display = 'none';
            elInstance.destroy();
        } else {
            this.setState({
                inventoryBatchError: i18n.t('static.supplyPlan.validationFailed')
            })
        }
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {
        this.setState({
            changedFlag: 1
        })
        var elInstance = this.state.inventoryEl;
        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // if (isNaN(Date.parse(value))) {
                //     elInstance.setStyle(col, "background-color", "transparent");
                //     elInstance.setStyle(col, "background-color", "yellow");
                //     elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                // } else {
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
            }
            // }
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

        if (x == 4) {
            if (elInstance.getValueFromCoords(4, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(4, y).toString().replaceAll("\,", "") != 0) {
                var reg = /-?\d+/
                value = (elInstance.getRowData(y))[4];
                value = value.toString().replaceAll("\,", "");
                var col = ("E").concat(parseInt(y) + 1);
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else if ((elInstance.getRowData(y))[3] == 2) {
                var col = ("E").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                var col = ("E").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 5) {
            if (elInstance.getValueFromCoords(5, y).toString().replaceAll("\,", "") != "" && elInstance.getValueFromCoords(5, y).toString().replaceAll("\,", "") != 0) {
                // var reg = /-?\d+/
                var reg = /^[0-9\b]+$/;
                var col = ("F").concat(parseInt(y) + 1);
                value = (elInstance.getRowData(y))[5];
                value = value.toString().replaceAll("\,", "")
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else if ((elInstance.getRowData(y))[3] == 1) {
                var col = ("F").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                var col = ("F").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                if (value == 1) {
                    var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(`F${parseInt(y) + 1}`)
                    cell.classList.remove('readonly');
                    elInstance.setValueFromCoords(4, y, "", true);
                } else {
                    var cell = elInstance.getCell(`F${parseInt(y) + 1}`)
                    cell.classList.add('readonly');
                    var cell = elInstance.getCell(`E${parseInt(y) + 1}`)
                    cell.classList.remove('readonly');
                    elInstance.setValueFromCoords(5, y, "", true);
                }
            }
        }

        if (x == 6) {
            var adjustmentType = (elInstance.getRowData(y))[3];
            var col = ("G").concat(parseInt(y) + 1);
            console.log("Adjustment type", adjustmentType);
            if (adjustmentType == 2) {
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
    }.bind(this);


    checkValidation() {
        var valid = true;
        var elInstance = this.state.inventoryEl;
        var json = elInstance.getJson();
        var mapArray = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var checkDuplicateInMap = mapArray.filter(c =>
                moment(c.get("0")).format("YYYY-MM") == moment(map.get("0")).format("YYYY-MM") &&
                c.get("1").toString() == map.get("1").toString()
            )
            if (checkDuplicateInMap.length > 1) {
                var colArr = ['A', 'B'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.supplyPlan.duplicateAdjustments'));
                }
                valid = false;
                this.setState({
                    message: i18n.t('static.supplyPlan.duplicateAdjustments'),
                    color: 'red'
                })
            } else {
                var colArr = ['A', 'B'];
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
                    // if (isNaN(Date.parse(value))) {
                    //     elInstance.setStyle(col, "background-color", "transparent");
                    //     elInstance.setStyle(col, "background-color", "yellow");
                    //     elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                    //     valid = false;
                    // } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                    // }
                }


                var col = ("B").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(1, y);
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
                var value = elInstance.getValueFromCoords(2, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }


                var col = ("E").concat(parseInt(y) + 1);
                var value = ((elInstance.getRowData(y))[4]).toString().replaceAll("\,", "");
                var reg = /-?\d+/;
                // var reg = /^[0-9\b]+$/;
                if (value != "" && value != 0) {
                    var reg = /-?\d+/
                    // var reg = /^[0-9\b]+$/;
                    var col = ("E").concat(parseInt(y) + 1);
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                } else if ((elInstance.getRowData(y))[3] == 2) {
                    var col = ("E").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ("E").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var value = ((elInstance.getRowData(y))[5]).toString().replaceAll("\,", "");
                if (value != "" && value != 0) {
                    // var reg = /-?\d+/
                    var reg = /^[0-9\b]+$/;
                    var col = ("F").concat(parseInt(y) + 1);
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                } else if ((elInstance.getRowData(y))[3] == 1) {
                    var col = ("F").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var col = ("F").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var value = elInstance.getValueFromCoords(3, y);
                var col = ("D").concat(parseInt(y) + 1);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var value = elInstance.getValueFromCoords(6, y);
                var col = ("G").concat(parseInt(y) + 1);
                if ((elInstance.getRowData(y))[3] == 2) {
                    if (value == "") {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }
        return valid;
    }

    saveData = function () {
        var validation = this.checkValidation();
        if (validation == true) {
            this.setState({
                changedFlag: 0
            });
            var elInstance = this.state.inventoryEl;
            var tableJson = elInstance.getJson();
            console.log("tableJson------------------->", tableJson);
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
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var regionListFiltered = programJson.regionList;
                    var countrySKU = document.getElementById("countrySKU").value;
                    var inventoryDataList = (programJson.inventoryList).filter(c => c.realmCountryPlanningUnit.id == countrySKU);
                    var inventoryDataListNotFiltered = programJson.inventoryList;
                    var planningUnitId = inventoryDataList[0].planningUnit.id;
                    for (var i = 0; i < inventoryDataList.length; i++) {
                        var map = new Map(Object.entries(tableJson[i]));
                        inventoryDataListNotFiltered[parseInt(map.get("8"))].inventoryDate = moment(map.get("0")).endOf('month').format("YYYY-MM-DD");
                        inventoryDataListNotFiltered[parseInt(map.get("8"))].region.id = map.get("1");
                        inventoryDataListNotFiltered[parseInt(map.get("8"))].dataSource.id = map.get("2");
                        if (map.get("3") == 1) {
                            inventoryDataListNotFiltered[parseInt(map.get("8"))].adjustmentQty = "";
                            inventoryDataListNotFiltered[parseInt(map.get("8"))].actualQty = parseInt(map.get("5"));
                        } else {
                            inventoryDataListNotFiltered[parseInt(map.get("8"))].adjustmentQty = parseInt(map.get("4"));
                            inventoryDataListNotFiltered[parseInt(map.get("8"))].actualQty = "";
                        }
                        inventoryDataListNotFiltered[parseInt(map.get("8"))].notes = map.get("6");
                        inventoryDataListNotFiltered[parseInt(map.get("8"))].active = map.get("7");
                        inventoryDataListNotFiltered[parseInt(map.get("8"))].batchInfoList = map.get("9")
                    }


                    for (var i = inventoryDataList.length; i < tableJson.length; i++) {
                        var map = new Map(Object.entries(tableJson[i]));
                        var json = {
                            inventoryId: 0,
                            inventoryDate: moment(map.get("0")).endOf('month').format("YYYY-MM-DD"),
                            region: {
                                id: map.get("1")
                            },
                            dataSource: {
                                id: map.get("2")
                            },
                            adjustmentQty: map.get("4"),
                            actualQty: map.get("5"),
                            notes: map.get("6"),
                            active: map.get("7"),
                            realmCountryPlanningUnit: {
                                id: countrySKU,
                            },
                            multiplier: inventoryDataList[0].multiplier,
                            planningUnit: {
                                id: planningUnitId
                            },
                            batchInfoList: map.get("9")
                        }
                        inventoryDataList.push(json);
                        inventoryDataListNotFiltered.push(json);
                    }
                    console.log("inventoryDataListNotFiltered------->", inventoryDataListNotFiltered);

                    var invList = inventoryDataListNotFiltered.filter(c => moment(c.inventoryDate).format("YYYY-MM") == moment(map.get("0")).format("YYYY-MM") && c.region != null);
                    var actualQty = 0;
                    var adjustmentQty = 0;
                    var actualQtyCount = 0;
                    var regionWiseInventoryCount = 0;
                    for (var i = 0; i < invList.length; i++) {
                        regionWiseInventoryCount += 1;
                        if (invList[i].actualQty != "" && invList[i].actualQty != null) {
                            actualQty += parseFloat(invList[i].actualQty) * parseFloat(invList[i].multiplier);
                            actualQtyCount += 1;
                        }
                        if (invList[i].adjustmentQty != "" && invList[i].adjustmentQty != null) {
                            adjustmentQty += parseFloat(invList[i].adjustmentQty);
                        }
                    }
                    if (actualQty > 0 && adjustmentQty == 0 && regionWiseInventoryCount == regionListFiltered.length) {
                        // var endDate = moment(map.get("0")).format("YYYY-MM-DD");
                        // var closingBalance = parseInt(this.state.openingBalanceArray[index]) + parseInt(this.state.shipmentsTotalData[index]) - parseInt(this.state.consumptionTotalData[index]);
                        // var nationalAdjustment = parseFloat(actualQty) - parseInt(closingBalance);
                        // nationalAdjustment = Math.round(parseFloat(nationalAdjustment) / parseFloat(map.get("4")));
                        // if (nationalAdjustment != 0) {
                        //     var nationAdjustmentIndex = inventoryDataList.findIndex(c => c.region == null && c.realmCountryPlanningUnit.id == map.get("3"));
                        //     if (nationAdjustmentIndex == -1) {
                        //         var inventoryJson = {
                        //             inventoryId: 0,
                        //             dataSource: {
                        //                 id: QAT_DATA_SOURCE_ID
                        //             },
                        //             region: null,
                        //             inventoryDate: map.get("14"),
                        //             adjustmentQty: nationalAdjustment,
                        //             actualQty: "",
                        //             active: true,
                        //             realmCountryPlanningUnit: {
                        //                 id: map.get("3"),
                        //             },
                        //             multiplier: map.get("4"),
                        //             planningUnit: {
                        //                 id: planningUnitId
                        //             },
                        //             notes: NOTES_FOR_QAT_ADJUSTMENTS,
                        //             batchInfoList: []
                        //         }
                        //         inventoryDataList.push(inventoryJson);
                        //     } else {
                        //         inventoryDataList[parseInt(nationAdjustmentIndex)].adjustmentQty = nationalAdjustment;
                        //     }
                        // }

                        // }
                    }

                    programJson.inventoryList = inventoryDataListNotFiltered;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);
                    putRequest.onerror = function (event) {
                        this.setState({
                            message: i18n.t('static.program.errortext'),
                            color: 'red'
                        })
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        // $("#saveButtonDiv").hide();

                        this.setState({
                            message: 'static.message.inventorysuccess',
                            changedFlag: 0,
                            color: 'green'
                        },
                            () => {
                                this.hideFirstComponent();
                            });


                        // this.props.history.push(`/inventory/addInventory/` + i18n.t('static.message.addSuccess', { entityname }))
                    }.bind(this)
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
                    //             // {this.getText(dataSource.label,lan)}
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        const { countrySKUList } = this.state;
        let countrySKUs = countrySKUList.length > 0
            && countrySKUList.map((item, i) => {
                return (
                    //             // {this.getText(dataSource.label,lan)}
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);

        return (

            <div className="animated fadeIn">
                {/* <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} /> */}
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5 className={this.state.color} id="div1">{i18n.t(this.state.message, { entityname })}</h5>

                <Card>

                    {/* <CardHeader>
                        <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                    </CardHeader> */}
                    <CardBody>
                        <Formik
                            render={
                                ({
                                }) => (
                                        <Form name='simpleForm'>

                                            <Col md="12 pl-0">
                                                <div className="d-md-flex">
                                                    <FormGroup className="col-md-3 pl-0">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.program')}</Label>
                                                        <div className="controls ">
                                                            <InputGroup>
                                                                <Input type="select"
                                                                    bsSize="sm"
                                                                    // value={this.state.programId}
                                                                    name="programId" id="programId"
                                                                    onChange={this.getCountrySKUList}
                                                                >
                                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                                    {programs}
                                                                </Input>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="col-md-3">
                                                        <Label htmlFor="appendedInputButton">{i18n.t('static.inventory.countrySKU')}</Label>
                                                        <div className="controls ">
                                                            <InputGroup>
                                                                <Input
                                                                    type="select"
                                                                    name="countrySKU"
                                                                    id="countrySKU"
                                                                    bsSize="sm"
                                                                    onChange={this.formSubmit}
                                                                >
                                                                    <option value="0">{i18n.t('static.common.select')}</option>
                                                                    {countrySKUs}
                                                                </Input>
                                                                {/* <InputGroupAddon addonType="append">
                                                                        <Button color="secondary Gobtn btn-sm" onClick={this.formSubmit}>{i18n.t('static.common.go')}</Button>
                                                                    </InputGroupAddon> */}
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                </div>
                                            </Col>
                                        </Form>
                                    )} />

                        <Col xs="12" sm="12" className="p-0">
                            <div className="table-responsive">
                                <div id="inventorytableDiv" >
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

                <Modal isOpen={this.state.inventoryBatchInfo}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                        <strong>{i18n.t('static.dataEntry.batchDetails')}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red">{this.state.inventoryBatchInfoDuplicateError || this.state.inventoryBatchInfoNoStockError || this.state.inventoryBatchError}</h6>
                        <div className="table-responsive">
                            <div id="inventoryBatchInfoTable"></div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        {this.state.inventoryBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.saveInventoryBatchInfo}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}{' '}
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
            </div >
        );
    }

    cancelClicked() {
        this.props.history.push(`/ApplicationDashboard/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    actionCanceled() {
        this.toggleLarge();
    }
}

