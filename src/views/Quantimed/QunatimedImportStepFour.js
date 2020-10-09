import React, { Component } from 'react';
import i18n from '../../i18n';
import * as Yup from 'yup'
import {
    Button, FormFeedback, CardBody,
    Form, FormGroup, Label, Input, CardFooter, Col, Card
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import jexcel from 'jexcel';
import "../ProductCategory/style.css"
import "../../../node_modules/jexcel/dist/jexcel.css";
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow, jExcelLoadedFunctionWithoutPagination } from '../../CommonComponent/JExcelCommonFunctions.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import AuthenticationService from '../Common/AuthenticationService';
import LabelsService from '../../api/LabelService.js';
import ProgramService from '../../api/ProgramService';
import QuantimedImportService from '../../api/QuantimedImportService';
import moment from "moment";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { DATE_FORMAT_CAP_WITHOUT_DATE, INDEXED_DB_NAME, INDEXED_DB_VERSION, QUANTIMED_DATA_SOURCE_ID, SECRET_KEY } from '../../Constants';
import CryptoJS from 'crypto-js'
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';

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

        jExcelLoadedFunctionOnlyHideRow(instance);

    }

    formSubmit() {
        confirmAlert({
            message: 'Do you confim to import final quantimed data?',
            buttons: [
                {
                    label: i18n.t('static.program.yes'),
                    onClick: () => {
                        this.setState({
                            loading: true
                        })

                        console.log("Final Data", this.state.finalImportData)


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
                                    console.log("consumptionDataList", consumptionDataList)
                                    for (var i = 0; i < qunatimedData.length; i++) {
                                        var index = consumptionDataList.findIndex(c => moment(c.consumptionDate).format("YYYY-MM") == moment(qunatimedData[i].dtmPeriod).format("YYYY-MM")
                                            && c.planningUnit.id == qunatimedData[i].product.programPlanningUnitId
                                            && c.actualFlag == false && c.multiplier == 1);
                                        console.log("index==", index);
                                        if (index != -1) {
                                            consumptionDataList[index].consumptionQty = qunatimedData[i].ingConsumption;
                                            consumptionDataList[index].consumptionRcpuQty = qunatimedData[i].ingConsumption;
                                        } else {
                                            console.log("productId",qunatimedData[i].productId)
                                            console.log("DTM Period",qunatimedData[i].dtmPeriod)
                                            var consumptionJson = {
                                                consumptionId: 0,
                                                dataSource: {
                                                    id: QUANTIMED_DATA_SOURCE_ID
                                                },
                                                region: {
                                                    id: programJson.regionList.filter(c => c.label.label_en.toUpperCase() == "NATIONAL")[0].regionId
                                                },
                                                consumptionDate: moment(qunatimedData[i].dtmPeriod).startOf('month').format("YYYY-MM-DD"),
                                                consumptionRcpuQty: qunatimedData[i].ingConsumption.toString().replaceAll("\,", ""),
                                                consumptionQty: (qunatimedData[i].ingConsumption).toString().replaceAll("\,", ""),
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
                                    console.log("consumptionDataList", consumptionDataList)

                                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                                    var putRequest = programTransaction.put(programRequest.result);

                                    putRequest.onerror = function (event) {

                                        this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                                        this.props.updateState("color", "red");
                                        this.props.hideFirstComponent();
                                    }.bind(this);
                                    putRequest.onsuccess = function (event) {

                                        this.setState({
                                            loading: false
                                        })

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

        let startDate = this.props.items.program.rangeValue.from.year + '-' + this.props.items.program.rangeValue.from.month + '-01';
        let endDate = this.props.items.program.rangeValue.to.year + '-' + this.props.items.program.rangeValue.to.month + '-' + new Date(this.props.items.program.rangeValue.to.year, this.props.items.program.rangeValue.to.month, 0).getDate();

        const planningUnitFilter = json.filter(c => c.product.programPlanningUnitId != "-1");
        const dateFilter = planningUnitFilter.filter(c => moment(c.dtmPeriod).isBetween(startDate, endDate, null, '[)'))

        this.setState({
            finalImportData: dateFilter
        })

        var qatPlanningList = this.props.items.qatPlanningList;
        console.log("qatPlanningList==", qatPlanningList)
        var data_1 = [];
        var records = [];

        for (var i = 0; i < dateFilter.length; i++) {

            console.log("progarm planning unit", qatPlanningList.filter(c => c.value == parseInt(dateFilter[i].product.programPlanningUnitId))[0].label)
            data_1 = [];
            data_1[0] = dateFilter[i].productId;// A
            data_1[1] = dateFilter[i].product.productName;// B
            data_1[2] = qatPlanningList.filter(c => c.value == parseInt(dateFilter[i].product.programPlanningUnitId))[0].label;
            data_1[3] = moment(dateFilter[i].dtmPeriod).format(DATE_FORMAT_CAP_WITHOUT_DATE);// C  
            data_1[4] = dateFilter[i].ingConsumption;// D                                              
            records.push(data_1);
        }

        var options = {
            data: records,
            contextMenu: function () { return false; },
            colHeaders: [
                'Product Id',
                'Quantimed Planning Unit',
                'QAT Planning Unit',
                'DTM Period',
                'Consumption Qty'
            ],
            colWidths: [80, 80, 80, 80, 80],
            columns: [
                { type: 'text' },
                { type: 'text' },
                { type: 'text' },
                { type: 'text' },
                { type: 'numeric', mask: '#,##' }
            ],
            editable: false,
            text: {
                // showingPage: 'Showing {0} to {1} of {1}',
                showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1}`,
                show: '',
                entries: '',
            },
            pagination: false,
            search: true,
            columnSorting: false,
            tableOverflow: true,
            wordWrap: true,
            paginationOptions: [],
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            // onchange: this.changed,
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
    }

    render() {


        return (

            <div className="animated fadeIn">

                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>

                    <CardBody className="table-responsive pt-md-1 pb-md-1">

                        <Col xs="12" sm="12">

                            <div id="recordsDiv" >
                            </div>

                        </Col>
                    </CardBody>
                    <CardFooter className="pb-0 pr-0">
                        <FormGroup>
                            <Button type="type" size="md" color="success" className="float-right mr-1" onClick={this.formSubmit}><i className="fa fa-check"></i>Proceed</Button>
                            <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepThree} ><i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                            &nbsp;
                        </FormGroup>
                        &nbsp;
                </CardFooter>
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>


        );
    }

}