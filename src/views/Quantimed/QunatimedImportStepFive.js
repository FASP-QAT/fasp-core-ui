import React, { Component } from 'react';
import i18n from '../../i18n';
import * as Yup from 'yup'
import {
    Button, FormFeedback, CardBody,
    Form, FormGroup, Label, Input, CardFooter, Col, Card, Row
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import jexcel from 'jspreadsheet';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import "../ProductCategory/style.css"
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionQuantimed, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import AuthenticationService from '../Common/AuthenticationService';
import LabelsService from '../../api/LabelService.js';
import ProgramService from '../../api/ProgramService';
import QuantimedImportService from '../../api/QuantimedImportService';
import moment from "moment";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { DATE_FORMAT_CAP_WITHOUT_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_DEFAULT_PAGINATION, JEXCEL_PAGINATION_OPTION, QUANTIMED_DATA_SOURCE_ID, SECRET_KEY, JEXCEL_PRO_KEY, FORECASTED_CONSUMPTION_MODIFIED } from '../../Constants';
import CryptoJS from 'crypto-js'
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations';

const initialValuesThree = {

}

const validationSchemaThree = function (values) {
    return Yup.object().shape({

    })
}

const validateThree = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationErrorThree(error)
        }
    }
}

const getErrorsFromValidationErrorThree = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}


export default class QunatimedImportStepFive extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            finalImportData: ''
        }
        this.loaded_four = this.loaded_four.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.updateState = this.updateState.bind(this);
        this.redirectToDashbaord = this.redirectToDashbaord.bind(this);
        this.changedImport = this.changedImport.bind(this);
    }

    touchAllThree(setTouched, errors) {
        setTouched({

        }
        )
        this.validateFormThree(errors)
    }
    validateFormThree(errors) {
        this.findFirstErrorThree('healthAreaForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstErrorThree(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    componentDidMount() {
        // this.showFinalData();
    }

    loaded_four = function (instance, cell, x, y, value) {

        jExcelLoadedFunctionQuantimed(instance);

        var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
        var tr = asterisk.firstChild;
        tr.children[7].title = `${i18n.t('static.quantimed.conversionFactor')} = 1 / ${i18n.t('static.unit.multiplier')}`
        tr.children[8].title = `${i18n.t('static.quantimed.quantimedForecastConsumptionQty')} * ${i18n.t('static.quantimed.importpercentage')} * ${i18n.t('static.quantimed.conversionFactor')} = ${i18n.t('static.quantimed.newconsupmtionqty')}`
    }

    updateState(parameterName, value) {

        this.setState({
            [parameterName]: value
        })
    }

    redirectToDashbaord() {
        this.props.redirectToDashboard();
    }

    changedImport = function (instance, cell, x, y, value) {


    }

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
                            var storeOS;
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
                                    // var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                                    // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                    // var programJson = JSON.parse(programData);

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

    showFinalData() {

        this.setState({
            loading: true
        })

        this.el = jexcel(document.getElementById("recordsDiv"), '');
        // this.el.destroy();
        jexcel.destroy(document.getElementById("recordsDiv"), true);

        var myVar = "";
        var json = this.props.items.importData.records;
        console.log("Json+++", json);
        console.log("Json+++", this.props.items);

        let startDate = this.props.items.program.rangeValue.from.year + '-' + this.props.items.program.rangeValue.from.month + '-01';
        let endDate = this.props.items.program.rangeValue.to.year + '-' + this.props.items.program.rangeValue.to.month + '-' + new Date(this.props.items.program.rangeValue.to.year, this.props.items.program.rangeValue.to.month, 0).getDate();

        var planningUnitFilter = json.filter(c => c.product.programPlanningUnitId != "-1");
        var dateFilter = planningUnitFilter.filter(c => moment(c.dtmPeriod).isBetween(startDate, endDate, null, '[)'))


        var db1;
        var storeOS;
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

                var finalImportQATData = dateFilter;
                var finalQATPlanningList = [];
                for (var i = 0; i < finalImportQATData.length; i++) {
                    var index = finalQATPlanningList.findIndex(c => c == finalImportQATData[i].product.programPlanningUnitId)
                    if (index == -1) {
                        finalQATPlanningList.push(parseInt(finalImportQATData[i].product.programPlanningUnitId))
                    }
                }
                console.log("FinalQatPlanningUnitList+++", finalQATPlanningList);
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
                    // var programDataBytes = CryptoJS.AES.decrypt(planningUnitData, SECRET_KEY);
                    // var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    // var programJson = JSON.parse(programData);
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


                    data_1 = [];
                    data_1[0] = finalList[i].productId;// A
                    data_1[1] = finalList[i].product.productName;// B
                    data_1[2] = qatPlanningList.filter(c => c.value == parseInt(finalList[i].product.programPlanningUnitId))[0].label;// C
                    data_1[3] = moment(finalList[i].dtmPeriod).format(DATE_FORMAT_CAP_WITHOUT_DATE).toUpperCase();// D  
                    data_1[4] = finalList[i].ingConsumption;// E 
                    data_1[5] = this.props.items.program.regionConversionFactor;// F 
                    data_1[6] = finalList[i].product.multiplier;// G 
                    data_1[7] = finalList[i].updateConsumptionQuantity;// H 
                    data_1[8] = finalList[i].existingConsumptionQty;// I                     
                    data_1[9] = true;// J                                              
                    records.push(data_1);
                }

                var options = {
                    data: records,
                    contextMenu: function () { return false; },
                    colHeaders: [
                        i18n.t('static.quantimed.quantimedProductIdLabel'),
                        i18n.t('static.quantimed.quantimedPlanningUnitLabel'),
                        i18n.t('static.supplyPlan.qatProduct'),
                        i18n.t('static.quantimed.consumptionDate'),
                        i18n.t('static.quantimed.quantimedForecastConsumptionQty'),
                        i18n.t('static.quantimed.importpercentage'),
                        i18n.t('static.quantimed.conversionFactor'),
                        i18n.t('static.quantimed.newconsupmtionqty'),
                        i18n.t('static.quantimed.existingconsupmtionqty'),
                        i18n.t('static.quantimed.importData')
                    ],
                    colWidths: [35, 80, 80, 30, 30, 28, 28, 30, 30, 20],
                    columns: [
                        { type: 'text', readOnly: true },
                        { type: 'text', readOnly: true },
                        { type: 'text', readOnly: true },
                        { type: 'text', readOnly: true },
                        { type: 'numeric', mask: '#,##', readOnly: true },
                        { type: 'numeric', mask: '#,##.00', decimal: '.', readOnly: true },
                        { type: 'numeric', mask: '#,##.00', decimal: '.', readOnly: true },
                        { type: 'numeric', mask: '#,##', readOnly: true },
                        { type: 'numeric', mask: '#,##', readOnly: true },
                        { type: 'checkbox' }
                    ],
                    editable: true,
                    // text: {
                    //     // showingPage: 'Showing {0} to {1} of {1}',
                    //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                    //     show: '',
                    //     entries: '',
                    // },
                    pagination: localStorage.getItem("sesRecordCount"),
                    search: true,
                    columnSorting: true,
                    // tableOverflow: true,
                    wordWrap: true,
                    paginationOptions: JEXCEL_PAGINATION_OPTION,
                    allowInsertColumn: false,
                    allowManualInsertColumn: false,
                    onchange: this.changedImport,
                    // oneditionstart: this.editStart,
                    allowDeleteRow: false,
                    tableOverflow: false,
                    onload: this.loaded_four,
                    license: JEXCEL_PRO_KEY,
                    filters: true
                    // tableHeight: '500px',
                };


                myVar = jexcel(document.getElementById("recordsDiv"), options);
                this.el = myVar;
                this.setState({
                    programId: this.props.items.program.programId
                })

                this.setState({
                    loading: false
                })


            }.bind(this);
        }.bind(this);
    }

    render() {
        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

        return (

            <div className="animated fadeIn">

                <br></br>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>


                    <CardBody className="table-responsive pt-md-1 pb-md-1">

                        <Col xs="12" sm="12">
                            <h6>
                                {i18n.t('static.quantimed.quantimedForecastConsumptionQty')} * {i18n.t('static.quantimed.importpercentage')} * {i18n.t('static.quantimed.conversionFactor')} = {i18n.t('static.quantimed.newconsupmtionqty')}
                            </h6>
                        </Col>

                        <Col xs="12" sm="12">

                            <div id="recordsDiv" >
                            </div>

                        </Col>
                        {/* </CardBody>
                    <CardFooter className="pb-0 pr-0"> */}
                        <br></br>
                        <FormGroup>
                            <Button type="type" size="md" color="success" className="float-right mr-1" onClick={this.formSubmit}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepFour} ><i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                            &nbsp;
                        </FormGroup>
                        &nbsp;
                        {/* </CardFooter> */}
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