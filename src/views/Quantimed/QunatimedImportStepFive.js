import CryptoJS from 'crypto-js';
import jexcel from 'jspreadsheet';
import moment from "moment";
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {
    Button,
    CardBody,
    Col,
    FormGroup,
    Row
} from 'reactstrap';
import * as Yup from 'yup';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import { jExcelLoadedFunctionQuantimed } from '../../CommonComponent/JExcelCommonFunctions.js';
import { DATE_FORMAT_CAP_WITHOUT_DATE, FORECASTED_CONSUMPTION_MODIFIED, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY, QUANTIMED_DATA_SOURCE_ID, SECRET_KEY } from '../../Constants';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService';
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations';
/**
 * Component for Qunatimed Import step five for showing final consumption details for the import
 */
export default class QunatimedImportStepFive extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            finalImportData: '',
            importEl: ''
        }
        this.loaded_four = this.loaded_four.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.updateState = this.updateState.bind(this);
        this.redirectToDashbaord = this.redirectToDashbaord.bind(this);
        this.changedImport = this.changedImport.bind(this);
        this.changeColor = this.changeColor.bind(this);
    }
    /**
     * This function is used to format the table like add asterisk or info to the table headers
     * @param {*} instance This is the DOM Element where sheet is created
     * @param {*} cell This is the object of the DOM element
     */
    loaded_four = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionQuantimed(instance, 1);
        var asterisk = document.getElementsByClassName("jss")[1].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[7].title = `${i18n.t('static.quantimed.conversionFactor')} = 1 / ${i18n.t('static.unit.multiplier')}`
        tr.children[8].title = `${i18n.t('static.quantimed.quantimedForecastConsumptionQty')} * ${i18n.t('static.quantimed.importpercentage')} * ${i18n.t('static.quantimed.conversionFactor')} = ${i18n.t('static.quantimed.newconsupmtionqty')}`
    }
    /**
     * Updates the component state with the provided parameter name and value.
     * @param {string} parameterName - The name of the parameter to update in the component state.
     * @param {*} value - The new value to set for the parameter.
     */
    updateState(parameterName, value) {
        this.setState({
            [parameterName]: value
        })
    }
    /**
     * Redirects to the dashboard page.
     */
    redirectToDashbaord() {
        this.props.redirectToDashboard();
    }
    /**
     * Function to handle changes in jexcel cells.
     * @param {Object} instance - The jexcel instance.
     * @param {Object} cell - The cell object that changed.
     * @param {number} x - The x-coordinate of the changed cell.
     * @param {number} y - The y-coordinate of the changed cell.
     * @param {any} value - The new value of the changed cell.
     */
    changedImport = function (instance, cell, x, y, value) {
    }
    /**
     * Calculates the difference in months between two dates.
     * @param {Date} dateFrom - The start date.
     * @param {Date} dateTo - The end date.
     * @returns {number} - The difference in months between the two dates.
     */
    monthDiff(dateFrom, dateTo) {
        return dateTo.getMonth() - dateFrom.getMonth() +
            (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
    }
    /**
     * Function to save the consumption data
     */
    formSubmit() {
        var tableJson = this.el.getJson(null, false);
        var count = 0;
        for (var y = 0; y < tableJson.length; y++) {
            var map1 = new Map(Object.entries(tableJson[y]));
            if (map1.get("9") == true) {
                count++;
            }
        }
        if (count == 0) {
            alert(i18n.t('static.quantimed.importatleastonerow'));
        } else {
            confirmAlert({
                title: i18n.t('static.program.confirmsubmit'),
                message: i18n.t('static.quantimed.quantimedImportFinalConfirmText'),
                buttons: [
                    {
                        label: i18n.t('static.program.yes'),
                        onClick: () => {
                            this.setState({
                                loading: true
                            })
                            var curDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss')));
                            var curUser = AuthenticationService.getLoggedInUserId();
                            for (var y = 0; y < tableJson.length; y++) {
                                var map1 = new Map(Object.entries(tableJson[y]));
                                this.state.finalImportData[y].active = map1.get("9");
                            }
                            var dates = [];
                            var activeFilter = this.state.finalImportData.filter(c => c.active == true);
                            for (var i = 0; i < activeFilter.length; i++) {
                                var index = dates.findIndex(c => c == activeFilter[i].dtmPeriod)
                                if (index == -1) {
                                    dates.push(activeFilter[i].dtmPeriod)
                                }
                            }
                            this.setState({
                                finalImportData: activeFilter
                            })
                            let moments = dates.map(d => moment(d));
                            var minDate = moment.min(moments).format("YYYY-MM-DD");
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
                                transaction = db1.transaction(['programData'], 'readwrite');
                                programTransaction = transaction.objectStore('programData');
                                var programId = this.props.items.program.programId;
                                var programRequest = programTransaction.get(programId);
                                programRequest.onerror = function (event) {
                                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                                    this.props.updateState("color", "#BA0C2F");
                                    this.props.hideFirstComponent();
                                }.bind(this);
                                programRequest.onsuccess = function (event) {
                                    var programDataJson = programRequest.result.programData;
                                    var planningUnitDataList = programDataJson.planningUnitDataList;
                                    var generalProgramDataBytes = CryptoJS.AES.decrypt(programDataJson.generalData, SECRET_KEY);
                                    var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                                    var generalProgramJson = JSON.parse(generalProgramData);
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
                                        var actionList = (generalProgramJson.actionList);
                                        if (actionList == undefined) {
                                            actionList = []
                                        }
                                        var qunatimedData = this.state.finalImportData;
                                        var finalImportQATData = this.state.finalImportData;
                                        var finalPuList = []
                                        for (var i = 0; i < finalImportQATData.length; i++) {
                                            var index = finalPuList.findIndex(c => c == finalImportQATData[i].product.programPlanningUnitId)
                                            if (index == -1) {
                                                finalPuList.push(parseInt(finalImportQATData[i].product.programPlanningUnitId))
                                                actionList.push({
                                                    planningUnitId: parseInt(finalImportQATData[i].product.programPlanningUnitId),
                                                    type: FORECASTED_CONSUMPTION_MODIFIED,
                                                    date: moment(minDate).startOf('month').format("YYYY-MM-DD")
                                                })
                                            }
                                        }
                                        for (var pu = 0; pu < finalPuList.length; pu++) {
                                            var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == finalPuList[pu]);
                                            var programJson = {}
                                            if (planningUnitDataIndex != -1) {
                                                var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == finalPuList[pu]))[0];
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
                                            var consumptionDataList = (programJson.consumptionList);
                                            var qunatimedDataFiltered = qunatimedData.filter(c => c.product.programPlanningUnitId == finalPuList[pu]);
                                            for (var i = 0; i < qunatimedDataFiltered.length; i++) {
                                                var index = consumptionDataList.findIndex(c => moment(c.consumptionDate).format("YYYY-MM") == moment(qunatimedDataFiltered[i].dtmPeriod).format("YYYY-MM")
                                                    && c.planningUnit.id == qunatimedDataFiltered[i].product.programPlanningUnitId && c.region.id == this.props.items.program.regionId
                                                    && c.actualFlag == false && c.multiplier == 1);
                                                if (index != -1) {
                                                    consumptionDataList[index].consumptionQty = qunatimedDataFiltered[i].updateConsumptionQuantity;
                                                    consumptionDataList[index].consumptionRcpuQty = qunatimedDataFiltered[i].updateConsumptionQuantity;
                                                    consumptionDataList[index].dataSource.id = QUANTIMED_DATA_SOURCE_ID;
                                                    consumptionDataList[index].lastModifiedBy.userId = curUser;
                                                    consumptionDataList[index].lastModifiedDate = curDate;
                                                } else {
                                                    var consumptionJson = {
                                                        consumptionId: 0,
                                                        dataSource: {
                                                            id: QUANTIMED_DATA_SOURCE_ID
                                                        },
                                                        region: {
                                                            id: this.props.items.program.regionId
                                                        },
                                                        consumptionDate: moment(qunatimedDataFiltered[i].dtmPeriod).startOf('month').format("YYYY-MM-DD"),
                                                        consumptionRcpuQty: qunatimedDataFiltered[i].updateConsumptionQuantity.toString().replaceAll("\,", ""),
                                                        consumptionQty: qunatimedDataFiltered[i].updateConsumptionQuantity.toString().replaceAll("\,", ""),
                                                        dayOfStockOut: "",
                                                        active: true,
                                                        realmCountryPlanningUnit: {
                                                            id: rcpuResult.filter(c => c.planningUnit.id == qunatimedDataFiltered[i].product.programPlanningUnitId && c.multiplier == 1)[0].realmCountryPlanningUnitId,
                                                        },
                                                        multiplier: 1,
                                                        planningUnit: {
                                                            id: qunatimedDataFiltered[i].product.programPlanningUnitId
                                                        },
                                                        notes: "",
                                                        batchInfoList: [],
                                                        actualFlag: false,
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
                                            programJson.consumptionList = consumptionDataList;
                                            generalProgramJson.actionList = actionList;
                                            if (planningUnitDataIndex != -1) {
                                                planningUnitDataList[planningUnitDataIndex].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                                            } else {
                                                planningUnitDataList.push({ planningUnitId: finalPuList[pu], planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString() });
                                            }
                                        }
                                        programDataJson.planningUnitDataList = planningUnitDataList;
                                        programDataJson.generalData = (CryptoJS.AES.encrypt(JSON.stringify(generalProgramJson), SECRET_KEY)).toString()
                                        programRequest.result.programData = programDataJson;
                                        var transaction1;
                                        var programTransaction1;
                                        var finalImportQATData = this.state.finalImportData;
                                        transaction1 = db1.transaction(['programData'], 'readwrite');
                                        programTransaction1 = transaction1.objectStore('programData');
                                        var putRequest = programTransaction1.put(programRequest.result);
                                        putRequest.onerror = function (event) {
                                            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                                            this.props.updateState("color", "#BA0C2F");
                                            this.props.hideFirstComponent();
                                        }.bind(this);
                                        putRequest.onsuccess = function (event) {
                                            var finalQATPlanningList = [];
                                            for (var i = 0; i < finalImportQATData.length; i++) {
                                                var index = finalQATPlanningList.findIndex(c => c == finalImportQATData[i].product.programPlanningUnitId)
                                                if (index == -1) {
                                                    finalQATPlanningList.push(parseInt(finalImportQATData[i].product.programPlanningUnitId))
                                                }
                                            }
                                            calculateSupplyPlan(this.props.items.program.programId, 0, 'programData', 'quantimedImport', this, finalQATPlanningList, minDate);
                                        }.bind(this);
                                    }.bind(this);
                                }.bind(this);
                            }.bind(this);
                        }
                    },
                    {
                        label: i18n.t('static.program.no')
                    }
                ]
            });
        }
    }
    /**
     * Changes the color of cells based on certain conditions.
     */
    changeColor() {
        var elInstance = this.state.importEl;
        var json = elInstance.getJson();
        var colArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
        for (var j = 0; j < json.length; j++) {
            var rowData = elInstance.getRowData(j);
            var isOldDate = rowData[9];
            if (!isOldDate) {
                for (var i = 0; i < colArr.length; i++) {
                    var cell1 = elInstance.getCell(`${colArr[i]}${parseInt(j) + 1}`)
                    cell1.classList.add('readonly');
                    elInstance.setStyle(`${colArr[i]}${parseInt(j) + 1}`, 'background-color', 'transparent');
                }
            }
        }
    }
    /**
     * Function to build a jexcel table.
     * Constructs and initializes a jexcel table using the provided data and options.
     */
    showFinalData() {
        this.setState({
            loading: true
        })
        jexcel.destroy(document.getElementById("recordsDiv"), true);
        var json = this.props.items.importData.records;
        let startDate = this.props.items.program.rangeValue.from.year + '-' + this.props.items.program.rangeValue.from.month + '-01';
        let endDate = this.props.items.program.rangeValue.to.year + '-' + this.props.items.program.rangeValue.to.month + '-' + new Date(this.props.items.program.rangeValue.to.year, this.props.items.program.rangeValue.to.month, 0).getDate();
        var planningUnitFilter = json.filter(c => c.product.programPlanningUnitId != "-1");
        var dateFilter = planningUnitFilter.filter(c => moment(c.dtmPeriod).isBetween(startDate, endDate, null, '[)'))
        var realmId = AuthenticationService.getRealmId();
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
            var realmTransaction = db1.transaction(['realm'], 'readwrite');
            var realmOS = realmTransaction.objectStore('realm');
            var realmRequest = realmOS.get(realmId);
            realmRequest.onsuccess = function (event) {
                var realm = realmRequest.result;
                var transaction;
                var programTransaction;
                transaction = db1.transaction(['programData'], 'readwrite');
                programTransaction = transaction.objectStore('programData');
                var programId = this.props.items.program.programId;
                var programRequest = programTransaction.get(programId);
                programRequest.onerror = function (event) {
                    this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                    this.props.updateState("color", "#BA0C2F");
                    this.props.hideFirstComponent();
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var finalImportQATData = dateFilter;
                    var finalQATPlanningList = [];
                    for (var i = 0; i < finalImportQATData.length; i++) {
                        var index = finalQATPlanningList.findIndex(c => c == finalImportQATData[i].product.programPlanningUnitId)
                        if (index == -1) {
                            finalQATPlanningList.push(parseInt(finalImportQATData[i].product.programPlanningUnitId))
                        }
                    }
                    var planningUnitDataList = (programRequest.result).programData.planningUnitDataList;
                    var finalList = [];
                    for (var fqpl = 0; fqpl < finalQATPlanningList.length; fqpl++) {
                        var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == finalQATPlanningList[fqpl]);
                        var programJson = {}
                        if (planningUnitDataIndex != -1) {
                            var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == finalQATPlanningList[fqpl]))[0];
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
                        var consumptionDataList = (programJson.consumptionList);
                        var qunatimedData = dateFilter.filter(c => c.product.programPlanningUnitId == finalQATPlanningList[fqpl]);
                        for (var i = 0; i < qunatimedData.length; i++) {
                            var index = consumptionDataList.findIndex(c => moment(c.consumptionDate).format("YYYY-MM") == moment(qunatimedData[i].dtmPeriod).format("YYYY-MM")
                                && c.planningUnit.id == qunatimedData[i].product.programPlanningUnitId && c.region.id == this.props.items.program.regionId
                                && c.actualFlag == false && c.multiplier == 1);
                            if (index != -1) {
                                qunatimedData[i].existingConsumptionQty = consumptionDataList[index].consumptionQty;
                            } else {
                                qunatimedData[i].existingConsumptionQty = "";
                            }
                            qunatimedData[i].updateConsumptionQuantity = Math.round(qunatimedData[i].ingConsumption * qunatimedData[i].product.multiplier * this.props.items.program.regionConversionFactor);
                            finalList.push(qunatimedData[i]);
                        }
                    }
                    this.setState({
                        finalImportData: finalList
                    })
                    var qatPlanningList = this.props.items.qatPlanningList;
                    var data_1 = [];
                    var records = [];
                    for (var i = 0; i < finalList.length; i++) {
                        var diff = this.monthDiff(new Date(finalList[i].dtmPeriod), new Date());
                        var isOldDate = diff < (realm.forecastConsumptionMonthsInPast + 1);
                        data_1 = [];
                        data_1[0] = finalList[i].productId;
                        data_1[1] = finalList[i].product.productName;
                        data_1[2] = qatPlanningList.filter(c => c.value == parseInt(finalList[i].product.programPlanningUnitId))[0].label;
                        data_1[3] = moment(finalList[i].dtmPeriod).format(DATE_FORMAT_CAP_WITHOUT_DATE).toUpperCase();
                        data_1[4] = finalList[i].ingConsumption;
                        data_1[5] = this.props.items.program.regionConversionFactor;
                        data_1[6] = finalList[i].product.multiplier;
                        data_1[7] = finalList[i].updateConsumptionQuantity;
                        data_1[8] = finalList[i].existingConsumptionQty;
                        data_1[9] = isOldDate ? true : false;
                        records.push(data_1);
                    }
                    var options = {
                        data: records,
                        contextMenu: function () { return false; },
                        colWidths: [35, 80, 80, 30, 30, 28, 28, 30, 30, 20],
                        columns: [
                            { type: 'text', title: i18n.t('static.quantimed.quantimedProductIdLabel'), readOnly: true },
                            { type: 'text', title: i18n.t('static.quantimed.quantimedPlanningUnitLabel'), readOnly: true },
                            { type: 'text', title: i18n.t('static.supplyPlan.qatProduct'), readOnly: true },
                            { type: 'text', title: i18n.t('static.quantimed.consumptionDate'), readOnly: true },
                            { type: 'numeric', title: i18n.t('static.quantimed.quantimedForecastConsumptionQty'), mask: '#,##', readOnly: true },
                            { type: 'numeric', title: i18n.t('static.quantimed.importpercentage'), mask: '#,##.00', decimal: '.', readOnly: true },
                            { type: 'numeric', title: i18n.t('static.quantimed.conversionFactor'), mask: '#,##.00', decimal: '.', readOnly: true },
                            { type: 'numeric', title: i18n.t('static.quantimed.newconsupmtionqty'), mask: '#,##', readOnly: true },
                            { type: 'numeric', title: i18n.t('static.quantimed.existingconsupmtionqty'), mask: '#,##', readOnly: true },
                            { type: 'checkbox', title: i18n.t('static.quantimed.importData') }
                        ],
                        editable: true,
                        pagination: localStorage.getItem("sesRecordCount"),
                        search: true,
                        columnSorting: true,
                        wordWrap: true,
                        paginationOptions: JEXCEL_PAGINATION_OPTION,
                        allowInsertColumn: false,
                        allowManualInsertColumn: false,
                        onchange: this.changedImport,
                        allowDeleteRow: false,
                        onload: this.loaded_four,
                        license: JEXCEL_PRO_KEY,
                        filters: true
                    };
                    var myVar = jexcel(document.getElementById("recordsDiv"), options);
                    this.el = myVar;
                    this.setState({
                        importEl: myVar,
                        programId: this.props.items.program.programId,
                        loading: false
                    }, () => {
                        this.changeColor();
                    })
                }.bind(this);
            }.bind(this);
        }.bind(this);
    }
    /**
     * Renders the quantimed import step five screen.
     * @returns {JSX.Element} - Quantimed import step five screen.
     */
    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });
        return (
            <div className="animated fadeIn">
                <br></br>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <CardBody className="pt-md-1 pb-md-1">
                        <Col xs="12" sm="12">
                            <h6>
                                {i18n.t('static.quantimed.quantimedForecastConsumptionQty')} * {i18n.t('static.quantimed.importpercentage')} * {i18n.t('static.quantimed.conversionFactor')} = {i18n.t('static.quantimed.newconsupmtionqty')}
                            </h6>
                        </Col>
                        <Col xs="12" sm="12">
                            <div className='consumptionDataEntryTable'>
                                <div id="recordsDiv" >
                                </div>
                            </div>
                        </Col>
                        <br></br>
                        <FormGroup>
                            <Button type="type" size="md" color="success" className="float-right mr-1" onClick={this.formSubmit}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepFour} ><i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                            &nbsp;
                        </FormGroup>
                        &nbsp;
                    </CardBody>
                </Row>
                <Row style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status">
                            </div>
                        </div>
                    </div>
                </Row>
            </div>
        );
    }
}