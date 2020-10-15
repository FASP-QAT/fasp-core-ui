import React, { Component } from 'react';
import i18n from '../../i18n';
import * as Yup from 'yup'
import {
    Button, FormFeedback, CardBody,
    Form, FormGroup, Label, Input, CardFooter, Col, Card, Row
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import jexcel from 'jexcel';
import "../ProductCategory/style.css"
import "../../../node_modules/jexcel/dist/jexcel.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionQuantimed, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import AuthenticationService from '../Common/AuthenticationService';
import LabelsService from '../../api/LabelService.js';
import ProgramService from '../../api/ProgramService';
import QuantimedImportService from '../../api/QuantimedImportService';
import moment from "moment";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { DATE_FORMAT_CAP_WITHOUT_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_DEFAULT_PAGINATION, JEXCEL_PAGINATION_OPTION, QUANTIMED_DATA_SOURCE_ID, SECRET_KEY } from '../../Constants';
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


export default class QunatimedImportStepFour extends Component {
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

    }

    loaded_four = function (instance, cell, x, y, value) {

        jExcelLoadedFunctionQuantimed(instance);

    }

    updateState(parameterName, value) {
        // console.log("in update state")
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
        confirmAlert({
            message: i18n.t('static.quantimed.quantimedImportFinalConfirmText'),
            buttons: [
                {
                    label: i18n.t('static.program.yes'),
                    onClick: () => {
                        this.setState({
                            loading: true
                        })

                        // console.log("Final Data", this.state.finalImportData)

                        var tableJson = this.el.getJson();

                        for (var y = 0; y < tableJson.length; y++) {
                            var map1 = new Map(Object.entries(tableJson[y]));
                            this.state.finalImportData[y].active = map1.get("6");
                        }

                        var dates = [];
                        var datesFilter = this.state.finalImportData.filter(c => c.active == true);
                        for (var i = 0; i < datesFilter.length; i++) {
                            var index = dates.findIndex(c => c == datesFilter[i].dtmPeriod)
                            if (index == -1) {
                                dates.push(datesFilter[i].dtmPeriod)
                            }
                        }

                        this.setState({
                            finalImportData: datesFilter
                        })

                        // console.log("finalImportData",this.state.finalImportData)
                        let moments = dates.map(d => moment(d));
                        var minDate = moment.min(moments).format("YYYY-MM-DD");

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
                            // console.log("in success")
                            db1 = e.target.result;
                            var transaction;
                            var programTransaction;

                            transaction = db1.transaction(['programData'], 'readwrite');
                            programTransaction = transaction.objectStore('programData');


                            var programId = this.props.items.program.programId;

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


                                    var consumptionDataList = (programJson.consumptionList);                                                                        
                                    var qunatimedData = this.state.finalImportData;
                                    
                                    for (var i = 0; i < qunatimedData.length; i++) {
                                        var index = consumptionDataList.findIndex(c => moment(c.consumptionDate).format("YYYY-MM") == moment(qunatimedData[i].dtmPeriod).format("YYYY-MM")
                                            && c.planningUnit.id == qunatimedData[i].product.programPlanningUnitId && c.region.id == this.props.items.program.regionId
                                            && c.actualFlag == false && c.multiplier == 1);
                                        // console.log("index==", index);
                                        if (index != -1) {
                                            consumptionDataList[index].consumptionQty = qunatimedData[i].ingConsumption;
                                            consumptionDataList[index].consumptionRcpuQty = qunatimedData[i].ingConsumption;
                                        } else {
                                            // console.log("productId",qunatimedData[i].productId)
                                            // console.log("DTM Period",qunatimedData[i].dtmPeriod)
                                            var consumptionJson = {
                                                consumptionId: 0,
                                                dataSource: {
                                                    id: QUANTIMED_DATA_SOURCE_ID
                                                },
                                                region: {
                                                    id: this.props.items.program.regionId
                                                },
                                                consumptionDate: moment(qunatimedData[i].dtmPeriod).startOf('month').format("YYYY-MM-DD"),
                                                consumptionRcpuQty: qunatimedData[i].ingConsumption.toString().replaceAll("\,", ""),
                                                consumptionQty: qunatimedData[i].ingConsumption.toString().replaceAll("\,", ""),
                                                dayOfStockOut: "",
                                                active: true,
                                                realmCountryPlanningUnit: {
                                                    id: rcpuResult.filter(c => c.planningUnit.id == qunatimedData[i].product.programPlanningUnitId && c.multiplier == 1)[0].realmCountryPlanningUnitId,
                                                },
                                                multiplier: 1,
                                                planningUnit: {
                                                    id: qunatimedData[i].product.programPlanningUnitId
                                                },
                                                notes: "",
                                                batchInfoList: [],
                                                actualFlag: false
                                            }
                                            consumptionDataList.push(consumptionJson);
                                        }
                                    }

                                    programJson.consumptionList = consumptionDataList;
                                    // console.log("consumptionDataList", consumptionDataList)

                                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();

                                    var transaction1;
                                    var programTransaction1;
                                    var finalImportQATData = this.state.finalImportData;

                                    transaction1 = db1.transaction(['programData'], 'readwrite');
                                    programTransaction1 = transaction1.objectStore('programData');
                                    var putRequest = programTransaction1.put(programRequest.result);

                                    putRequest.onerror = function (event) {

                                        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                                        this.props.updateState("color", "red");
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

                                        // let minDate = moment(this.props.items.program.rangeValue.from.year + '-' + this.props.items.program.rangeValue.from.month + '-01').format("YYYY-MM-DD");
                                        // console.log("finalQATPlanningList",finalQATPlanningList)
                                        // console.log("minDate",minDate)
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

    showFinalData() {

        this.setState({
            loading: true
        })

        this.el = jexcel(document.getElementById("recordsDiv"), '');
        this.el.destroy();
        var myVar = "";
        var json = this.props.items.importData.records;

        // let startDate = this.props.items.program.rangeValue.from.year + '-' + this.props.items.program.rangeValue.from.month + '-01';
        // let endDate = this.props.items.program.rangeValue.to.year + '-' + this.props.items.program.rangeValue.to.month + '-' + new Date(this.props.items.program.rangeValue.to.year, this.props.items.program.rangeValue.to.month, 0).getDate();

        const planningUnitFilter = json.filter(c => c.product.programPlanningUnitId != "-1");
        // const dateFilter = planningUnitFilter.filter(c => moment(c.dtmPeriod).isBetween(startDate, endDate, null, '[)'))


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
            // console.log("in success")
            db1 = e.target.result;
            var transaction;
            var programTransaction;

            transaction = db1.transaction(['programData'], 'readwrite');
            programTransaction = transaction.objectStore('programData');


            var programId = this.props.items.program.programId;

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
                // console.log("consumptionDataList", consumptionDataList)
                var qunatimedData = planningUnitFilter;
                var finalList = [];
                for (var i = 0; i < qunatimedData.length; i++) {
                    var index = consumptionDataList.findIndex(c => moment(c.consumptionDate).format("YYYY-MM") == moment(qunatimedData[i].dtmPeriod).format("YYYY-MM")
                        && c.planningUnit.id == qunatimedData[i].product.programPlanningUnitId && c.region.id == this.props.items.program.regionId
                        && c.actualFlag == false && c.multiplier == 1);
                    
                    if (index != -1) {
                        console.log("index==", index);
                        qunatimedData[i].existingConsumptionQty = consumptionDataList[index].consumptionQty;                        
                    } else {
                        qunatimedData[i].existingConsumptionQty = "";                        
                    }
                    finalList.push(qunatimedData[i]);
                }

                this.setState({
                    finalImportData: finalList
                })

                var qatPlanningList = this.props.items.qatPlanningList;
                // console.log("qatPlanningList==", qatPlanningList)
                var data_1 = [];
                var records = [];

                for (var i = 0; i < finalList.length; i++) {

                    // console.log("progarm planning unit", qatPlanningList.filter(c => c.value == parseInt(dateFilter[i].product.programPlanningUnitId))[0].label)
                    data_1 = [];
                    data_1[0] = finalList[i].productId;// A
                    data_1[1] = finalList[i].product.productName;// B
                    data_1[2] = qatPlanningList.filter(c => c.value == parseInt(finalList[i].product.programPlanningUnitId))[0].label;// C
                    data_1[3] = moment(finalList[i].dtmPeriod).format(DATE_FORMAT_CAP_WITHOUT_DATE).toUpperCase();// D  
                    data_1[4] = finalList[i].existingConsumptionQty;// E 
                    data_1[5] = finalList[i].ingConsumption;// E 
                    data_1[6] = true;// F                                              
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
                        i18n.t('static.quantimed.existingconsupmtionqty'),
                        i18n.t('static.quantimed.newconsupmtionqty'),
                        'Import Data'
                    ],
                    colWidths: [30, 80, 80, 30, 30, 30, 20],
                    columns: [
                        { type: 'text', readOnly: true },
                        { type: 'text', readOnly: true },
                        { type: 'text', readOnly: true },
                        { type: 'text', readOnly: true },
                        { type: 'numeric', mask: '#,##', readOnly: true },
                        { type: 'numeric', mask: '#,##', readOnly: true },
                        { type: 'checkbox' }
                    ],
                    // editable: false,
                    text: {
                        // showingPage: 'Showing {0} to {1} of {1}',
                        showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                        show: '',
                        entries: '',
                    },
                    pagination: JEXCEL_DEFAULT_PAGINATION,
                    search: true,
                    columnSorting: false,
                    tableOverflow: true,
                    wordWrap: true,
                    paginationOptions: JEXCEL_PAGINATION_OPTION,
                    allowInsertColumn: false,
                    allowManualInsertColumn: false,
                    onchange: this.changedImport,
                    // oneditionstart: this.editStart,
                    allowDeleteRow: false,
                    tableOverflow: false,
                    onload: this.loaded_four,
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


        return (

            <div className="animated fadeIn">

                <br></br>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>

                    <CardBody className="table-responsive pt-md-1 pb-md-1">

                        <Col xs="12" sm="12">

                            <div id="recordsDiv" >
                            </div>

                        </Col>
                        {/* </CardBody>
                    <CardFooter className="pb-0 pr-0"> */}
                        <br></br>
                        <FormGroup>
                            <Button type="type" size="md" color="success" className="float-right mr-1" onClick={this.formSubmit}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepThree} ><i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
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