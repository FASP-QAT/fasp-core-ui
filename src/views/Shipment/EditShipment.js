import React from "react";
import ReactDOM from 'react-dom';
import jexcel from 'jexcel';
// import "./style.css";
import "../../../node_modules/jexcel/dist/jexcel.css";
import * as JsStoreFunctions from "../../CommonComponent/JsStoreFunctions.js";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form, InputGroup, InputGroupAddon
    , FormFeedback, Row
} from 'reactstrap';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';

export default class ConsumptionDetails extends React.Component {

    constructor(props) {
        super(props);
        this.options = props.options;
        this.state = {
            programList: [],
            categoryList: [],
            productList: [],
            consumptionDataList: [],
            changedFlag: 0,
            planningUnitList: [],
            shipmentStatusList: [],
            procurementUnitList: [],
            supplierList: [],
            allowShipmentStatusList: [],
            message: '',
        }

        // this.getConsumptionData = this.getConsumptionData.bind(this);
        this.saveData = this.saveData.bind(this)
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        // this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.temp = this.temp.bind(this)
    }

    componentDidMount = function () {
        document.getElementById("addButton").style.display = "none";
        let programId = this.props.match.params.programId;
        let shipmentId = this.props.match.params.shipmentId;
        let planningUnitId = this.props.match.params.planningUnitId;
        let filterBy = this.props.match.params.filterBy;
        let startDate = this.props.match.params.startDate;
        let endDate = this.props.match.params.endDate;
        let rowIndex = this.props.match.params.rowIndex;
        this.setState({ programId: programId });

        if (shipmentId == 0 || typeof shipmentId == "undefined") {

        } else {
            //start else
            var procurementAgentPlanningList = [];

            var db1;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;

                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');
                var programRequest = programTransaction.get(programId);

                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);

                    var shipmentList = (programJson.shipmentList).filter(c => c.shipmentId == shipmentId);

                    this.setState({
                        shipmentList: shipmentList
                    },
                        () => {
                            // console.log("shipmentList11111--> ", shipmentList);
                        });

                    var procurementAgentPlanningUnitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                    var procurementAgentPlanningUnitOs = procurementAgentPlanningUnitTransaction.objectStore('procurementAgentPlanningUnit');
                    var procurementAgentPlanningUnitRequest = procurementAgentPlanningUnitOs.getAll();

                    procurementAgentPlanningUnitRequest.onsuccess = function (event) {

                        var procurementAgentPlanningUnitResult = [];
                        procurementAgentPlanningUnitResult = procurementAgentPlanningUnitRequest.result;
                        for (var k = 0; k < procurementAgentPlanningUnitResult.length; k++) {
                            if (procurementAgentPlanningUnitResult[k].planningUnit.id == planningUnitId) {
                                var procurementAgentJson = {
                                    id: procurementAgentPlanningUnitResult[k].procurementAgentPlanningUnitId,
                                    catalogPrice: procurementAgentPlanningUnitResult[k].catalogPrice,
                                    moq: procurementAgentPlanningUnitResult[k].moq,
                                    unitsPerPallet: procurementAgentPlanningUnitResult[k].unitsPerPallet,
                                    unitsPerContainer: procurementAgentPlanningUnitResult[k].unitsPerContainer
                                }
                                procurementAgentPlanningList[0] = procurementAgentJson
                                // console.log("JSON--- ", procurementAgentJson);
                                // console.log("procurementAgentPlanningList111 ", procurementAgentPlanningList[0]);
                            }
                        }



                        // console.log("procurementAgentPlanningList222222222--> ", procurementAgentPlanningList[0]);
                        if (shipmentList[0].shipmentStatus.id == 2) { //planned

                            document.getElementById("addButton").style.display = "block";
                            var procurementAgentList = [];
                            var fundingSourceList = [];
                            var budgetList = [];

                            var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                            var procurementAgentOs = procurementAgentTransaction.objectStore('procurementAgent');
                            var procurementAgentRequest = procurementAgentOs.getAll();

                            procurementAgentRequest.onsuccess = function (event) {
                                var procurementAgentResult = [];
                                procurementAgentResult = procurementAgentRequest.result;
                                for (var k = 0; k < procurementAgentResult.length; k++) {
                                    var procurementAgentJson = {
                                        name: procurementAgentResult[k].label.label_en,
                                        id: procurementAgentResult[k].procurementAgentId
                                    }
                                    procurementAgentList[k] = procurementAgentJson
                                }


                                var fundingSourceTransaction = db1.transaction(['fundingSource'], 'readwrite');
                                var fundingSourceOs = fundingSourceTransaction.objectStore('fundingSource');
                                var fundingSourceRequest = fundingSourceOs.getAll();

                                fundingSourceRequest.onsuccess = function (event) {
                                    var fundingSourceResult = [];
                                    fundingSourceResult = fundingSourceRequest.result;
                                    for (var k = 0; k < fundingSourceResult.length; k++) {
                                        var fundingSourceJson = {
                                            name: fundingSourceResult[k].label.label_en,
                                            id: fundingSourceResult[k].fundingSourceId
                                        }
                                        fundingSourceList[k] = fundingSourceJson
                                    }


                                    var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                                    var budgetOs = budgetTransaction.objectStore('budget');
                                    var budgetRequest = budgetOs.getAll();

                                    budgetRequest.onsuccess = function (event) {
                                        var budgetResult = [];
                                        budgetResult = budgetRequest.result;
                                        for (var k = 0; k < budgetResult.length; k++) {
                                            var budgetJson = {
                                                name: budgetResult[k].label.label_en,
                                                id: budgetResult[k].budgetId
                                            }
                                            budgetList[k] = budgetJson
                                        }

                                        var data = [];
                                        var shipmentDataArr = [];

                                        data[0] = shipmentList[0].shipmentId;
                                        data[1] = shipmentList[0].expectedDeliveryDate;
                                        data[2] = shipmentList[0].shipmentStatus.label.label_en;
                                        data[3] = shipmentList[0].procurementAgent.label.label_en;
                                        data[4] = '';//funding source
                                        data[5] = '';//budget
                                        data[6] = shipmentList[0].planningUnit.label.label_en;
                                        data[7] = shipmentList[0].suggestedQty;
                                        data[8] = procurementAgentPlanningList[0].moq;
                                        data[9] = ((procurementAgentPlanningList[0].moq / procurementAgentPlanningList[0].unitsPerPallet).toFixed(1) == "NaN") ? '0' : (procurementAgentPlanningList[0].moq / procurementAgentPlanningList[0].unitsPerPallet).toFixed(1);
                                        data[10] = ((procurementAgentPlanningList[0].moq / procurementAgentPlanningList[0].unitsPerContainer).toFixed(1) == "NaN") ? '0' : (procurementAgentPlanningList[0].moq / procurementAgentPlanningList[0].unitsPerContainer).toFixed(1);
                                        data[11] = '';
                                        data[12] = '';
                                        data[13] = '';
                                        data[14] = '';
                                        data[15] = '';
                                        data[16] = '';
                                        data[17] = '';
                                        data[18] = procurementAgentPlanningList[0].catalogPrice;
                                        data[19] = '';
                                        data[20] = '';
                                        data[21] = shipmentList[0].notes;
                                        data[22] = '';
                                        data[23] = procurementAgentPlanningList[0].unitsPerPallet;
                                        data[24] = procurementAgentPlanningList[0].unitsPerContainer;
                                        data[25] = 0;

                                        shipmentDataArr[0] = data;

                                        this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                                        this.el.destroy();
                                        var json = [];
                                        var data = shipmentDataArr;
                                        // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                                        // json[0] = data;
                                        var options = {
                                            data: data,
                                            columnDrag: true,
                                            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                            columns: [
                                                // { title: 'Month', type: 'text', readOnly: true },
                                                {
                                                    title: 'Shipment Id',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Expected Delivery date',
                                                    // type: 'calendar',
                                                    type: 'text',
                                                    readOnly: true

                                                },
                                                {
                                                    title: 'Shipment Status',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Procurement Agent',
                                                    type: 'dropdown',
                                                    source: procurementAgentList,
                                                },
                                                {
                                                    title: 'Funding Source',
                                                    type: 'dropdown',
                                                    source: fundingSourceList,
                                                },
                                                {
                                                    title: 'Budget',
                                                    type: 'dropdown',
                                                    source: budgetList,
                                                },
                                                {
                                                    title: 'Planning Unit',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Suggested Order Qty',
                                                    type: 'numeric',
                                                    // readOnly: true
                                                },
                                                {
                                                    title: 'MoQ',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'No of Pallets',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'No of Containers',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Order based on',
                                                    type: 'dropdown',
                                                    source: [{ id: 1, name: 'Container' }, { id: 2, name: 'Suggested Order Qty' }, { id: 3, name: 'MoQ' }, { id: 4, name: 'Pallet' }]

                                                },
                                                {
                                                    title: 'Rounding option',
                                                    type: 'dropdown',
                                                    source: [{ id: 1, name: 'Round Up' }, { id: 2, name: 'Round Down' }]
                                                },
                                                {
                                                    title: 'User Qty',
                                                    type: 'text',
                                                },
                                                {
                                                    title: 'Adjusted Order Qty',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Adjusted Pallets',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Adjusted Containers',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Manual Price per Planning Unit',
                                                    type: 'text',
                                                },
                                                {
                                                    title: 'Price per Planning Unit',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Amt',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'RO Number',
                                                    type: 'text'
                                                },
                                                {
                                                    title: 'Notes',
                                                    type: 'text'
                                                },
                                                {
                                                    title: 'Cancelled Order',
                                                    type: 'checkbox'
                                                },
                                                {
                                                    title: 'Unit/Pallet',
                                                    type: 'hidden'
                                                },
                                                {
                                                    title: 'Unit/Container',
                                                    type: 'hidden'
                                                },
                                                {
                                                    title: 'Index',
                                                    type: 'hidden'
                                                }

                                            ],
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
                                            position: 'top'
                                        };

                                        this.el = jexcel(document.getElementById("shipmenttableDiv"), options);


                                    }.bind(this);
                                }.bind(this);
                            }.bind(this);
                        } else if (shipmentList[0].shipmentStatus.id == 3 || shipmentList[0].shipmentStatus.id == 4 || shipmentList[0].shipmentStatus.id == 5 || shipmentList[0].shipmentStatus.id == 6) { //submitted

                            document.getElementById("addButton").style.display = "none";

                            var paList = [];
                            var supList = [];
                            var allowShipStatusList = [];
                            var currentShipmentId = shipmentList[0].shipmentStatus.id;
                            var nextShipmentAllowedList = [];

                            var procurementUnitTransaction = db1.transaction(['procurementUnit'], 'readwrite');
                            var procurementUnitOs = procurementUnitTransaction.objectStore('procurementUnit');
                            var procurementUnitRequest = procurementUnitOs.getAll();
                            procurementUnitRequest.onsuccess = function (event) {

                                var supplierTransaction = db1.transaction(['supplier'], 'readwrite');
                                var supplierOs = supplierTransaction.objectStore('supplier');
                                var supplierRequest = supplierOs.getAll();
                                supplierRequest.onsuccess = function (event) {

                                    var procurementUnitResult = [];
                                    procurementUnitResult = procurementUnitRequest.result;
                                    for (var k = 0; k < procurementUnitResult.length; k++) {
                                        var paJson = {
                                            name: procurementUnitResult[k].label.label_en,
                                            id: procurementUnitResult[k].procurementUnitId
                                        }
                                        paList[k] = paJson;
                                    }

                                    this.setState({
                                        procurementAgentList: paList
                                    });

                                    var supplierResult = [];
                                    supplierResult = supplierRequest.result;
                                    for (var k = 0; k < supplierResult.length; k++) {
                                        var supplierJson = {
                                            name: supplierResult[k].label.label_en,
                                            id: supplierResult[k].supplierId
                                        }
                                        supList[k] = supplierJson;
                                    }

                                    this.setState({
                                        supplierList: supList
                                    });

                                    var allowShipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                                    var allowShipmentStatusOs = allowShipmentStatusTransaction.objectStore('shipmentStatus');
                                    var allowShipmentStatusRequest = allowShipmentStatusOs.getAll();
                                    allowShipmentStatusRequest.onsuccess = function (event) {

                                        var allowShipmentStatusResult = [];
                                        allowShipmentStatusResult = allowShipmentStatusRequest.result;
                                        for (var k = 0; k < allowShipmentStatusResult.length; k++) {
                                            if (currentShipmentId == allowShipmentStatusResult[k].shipmentStatusId) {
                                                nextShipmentAllowedList = allowShipmentStatusResult[k].nextShipmentStatusAllowedList;
                                            }
                                        }

                                        var count = 0;
                                        for (var k = 0; k < allowShipmentStatusResult.length; k++) {
                                            if (nextShipmentAllowedList[count] == allowShipmentStatusResult[k].shipmentStatusId) {
                                                var allowShipStatusJson = {
                                                    name: allowShipmentStatusResult[k].label.label_en,
                                                    id: allowShipmentStatusResult[k].shipmentStatusId
                                                }
                                                allowShipStatusList[count] = allowShipStatusJson;
                                                count++;
                                            }
                                        }

                                        this.setState({
                                            allowShipmentStatusList: allowShipStatusList
                                        });


                                        var data = [];
                                        var shipmentDataArr = [];

                                        data[0] = shipmentList[0].shipmentId;
                                        data[1] = shipmentList[0].expectedDeliveryDate;
                                        data[2] = shipmentList[0].shipmentStatus.label.label_en;
                                        data[3] = shipmentList[0].procurementAgent.label.label_en;
                                        data[4] = '';//funding source
                                        data[5] = '';//budget
                                        data[6] = shipmentList[0].planningUnit.label.label_en;
                                        data[7] = shipmentList[0].suggestedQty;
                                        data[8] = procurementAgentPlanningList[0].moq;
                                        data[9] = '';
                                        data[10] = '';
                                        data[11] = '';
                                        data[12] = '';
                                        data[13] = '';
                                        data[14] = '';
                                        data[15] = '';
                                        data[16] = procurementAgentPlanningList[0].catalogPrice;
                                        data[17] = '';
                                        data[18] = '';
                                        data[19] = shipmentList[0].notes;

                                        shipmentDataArr[0] = data;

                                        this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                                        this.el.destroy();
                                        var json = [];
                                        var data = shipmentDataArr;
                                        // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                                        // json[0] = data;
                                        var options = {
                                            data: data,
                                            columnDrag: true,
                                            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                            columns: [
                                                // { title: 'Month', type: 'text', readOnly: true },
                                                {
                                                    title: 'Shipment Id',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Expected Delivery date',
                                                    // type: 'calendar',
                                                    type: 'text',
                                                    readOnly: true

                                                },
                                                {
                                                    title: 'Shipment Status',
                                                    type: 'dropdown',
                                                    // source: ['Approved', 'Shipped', 'Delivered']
                                                    source: allowShipStatusList
                                                    // readOnly: true
                                                },
                                                {
                                                    title: 'Procurement Agent',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Funding Source',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Budget',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Planning Unit',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Suggested Order Qty',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'MoQ',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'User Qty',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Adjusted Order Qty',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Adjusted Pallets',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Adjusted Containers',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Manual Price per Planning Unit',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Procurement Unit',
                                                    type: 'dropdown',
                                                    source: paList
                                                },
                                                {
                                                    title: 'Supplier',
                                                    type: 'dropdown',
                                                    source: supList
                                                },
                                                {
                                                    title: 'Price per Planning Unit',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Amt',
                                                    type: 'numeric',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'RO Number',
                                                    type: 'text',
                                                    // readOnly: true
                                                },
                                                {
                                                    title: 'Notes',
                                                    type: 'text',
                                                    // readOnly: true
                                                },

                                            ],
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
                                            position: 'top'
                                        };

                                        this.el = jexcel(document.getElementById("shipmenttableDiv"), options);
                                    }.bind(this);

                                }.bind(this);
                            }.bind(this);

                        }
                        // if (shipmentList[0].shipmentStatus.id == 4) { //approved

                        // } else if (shipmentList[0].shipmentStatus.id == 5) { //shipped

                        // } else if (shipmentList[0].shipmentStatus.id == 6) { //Delivered

                        // } 
                        else if (shipmentList[0].shipmentStatus.id == 7) { //cancelled

                            document.getElementById("addButton").style.display = "none";

                            var data = [];
                            var shipmentDataArr = [];

                            data[0] = shipmentList[0].shipmentId;
                            data[1] = shipmentList[0].expectedDeliveryDate;
                            data[2] = shipmentList[0].shipmentStatus.label.label_en;
                            data[3] = shipmentList[0].procurementAgent.label.label_en;
                            data[4] = '';//funding source
                            data[5] = '';//budget
                            data[6] = shipmentList[0].planningUnit.label.label_en;
                            data[7] = shipmentList[0].suggestedQty;
                            data[8] = procurementAgentPlanningList[0].moq;
                            data[9] = ((procurementAgentPlanningList[0].moq / procurementAgentPlanningList[0].unitsPerPallet).toFixed(1) == "NaN") ? '0' : (procurementAgentPlanningList[0].moq / procurementAgentPlanningList[0].unitsPerPallet).toFixed(1);
                            data[10] = ((procurementAgentPlanningList[0].moq / procurementAgentPlanningList[0].unitsPerContainer).toFixed(1) == "NaN") ? '0' : (procurementAgentPlanningList[0].moq / procurementAgentPlanningList[0].unitsPerContainer).toFixed(1);
                            data[11] = '';
                            data[12] = '';
                            data[13] = '';
                            data[14] = shipmentList[0].quantity;
                            data[15] = '';
                            data[16] = '';
                            data[17] = shipmentList[0].rate;
                            data[18] = procurementAgentPlanningList[0].catalogPrice;
                            data[19] = (shipmentList[0].rate == null || shipmentList[0].rate == 0) ? (shipmentList[0].quantity * procurementAgentPlanningList[0].catalogPrice).toFixed(2) : (shipmentList[0].quantity * shipmentList[0].rate).toFixed(2);
                            data[20] = '';
                            data[21] = shipmentList[0].notes;
                            data[22] = true;
                            data[23] = procurementAgentPlanningList[0].unitsPerPallet;
                            data[24] = procurementAgentPlanningList[0].unitsPerContainer;

                            shipmentDataArr[0] = data;

                            // data = [];
                            // data[0] = '';
                            // data[1] = '10-09-2020';
                            // data[2] = '02-PLANNED';
                            // data[3] = 'PSM';
                            // data[4] = 'USAID';
                            // data[5] = 'Kenya - 2020 budget	';
                            // data[6] = 'Ceftriaxone 1 gm Powder Vial, 10 Vials';
                            // data[7] = '44773';
                            // data[8] = '45000'; //moq
                            // data[9] = '30.00';
                            // data[10] = '1.50';
                            // data[11] = '';
                            // data[12] = '';
                            // data[13] = '';
                            // data[14] = '';
                            // data[15] = '';
                            // data[16] = '';
                            // data[17] = '';
                            // data[18] = '7.83';
                            // data[19] = '';
                            // data[20] = '';
                            // data[21] = '';
                            // data[22] = '';
                            // data[23] = '1500';
                            // data[24] = '30000';
                            // shipmentDataArr[0] = data;

                            this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                            this.el.destroy();
                            var json = [];
                            var data = shipmentDataArr;
                            // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                            // json[0] = data;
                            var options = {
                                data: data,
                                columnDrag: true,
                                colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                columns: [
                                    // { title: 'Month', type: 'text', readOnly: true },
                                    {
                                        title: 'Shipment Id',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Expected Delivery date',
                                        // type: 'calendar',
                                        type: 'text',
                                        readOnly: true

                                    },
                                    {
                                        title: 'Shipment Status',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Procurement Agent',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Funding Source',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Budget',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Planning Unit',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Suggested Order Qty',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'MoQ',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'No of Pallets',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'No of Containers',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Order based on',
                                        type: 'text',
                                        readOnly: true

                                    },
                                    {
                                        title: 'Rounding option',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'User Qty',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Adjusted Order Qty',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Adjusted Pallets',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Adjusted Containers',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Manual Price per Planning Unit',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Price per Planning Unit',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Amt',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'RO Number',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Notes',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Cancelled Order',
                                        type: 'checkbox'
                                    },
                                    {
                                        title: 'Unit/Pallet',
                                        type: 'hidden'
                                    },
                                    {
                                        title: 'Unit/Container',
                                        type: 'hidden'
                                    }

                                ],
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
                                position: 'top'
                            };

                            this.el = jexcel(document.getElementById("shipmenttableDiv"), options);

                        }//end cancelled



                    }.bind(this);
                }.bind(this);
            }.bind(this);
        }//end else



    }




    temp() {
        document.getElementById("addButton").style.display = "none";
        // console.log("--------------shipmentId-------------", this.props.match.params.shipmentId);
        // console.log("--------------planningUnitId-------------", this.props.match.params.planningUnitId);
        // console.log("--------------filterBy-------------", this.props.match.params.filterBy);
        // console.log("--------------startDate-------------", this.props.match.params.startDate);
        // console.log("--------------endDate-------------", this.props.match.params.endDate);
        // console.log("--------------rowIndex-------------", this.props.match.params.rowIndex);

        let programId = this.props.match.params.programId;
        let shipmentId = this.props.match.params.shipmentId;
        let planningUnitId = this.props.match.params.planningUnitId;
        let filterBy = this.props.match.params.filterBy;
        let startDate = this.props.match.params.startDate;
        let endDate = this.props.match.params.endDate;
        let rowIndex = this.props.match.params.rowIndex;



        this.setState({ programId: programId });
        this.setState({ shipmentId: shipmentId });
        console.log("--------------1111111111111111-------------", programId);
        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);

        var procurementAgentList = [];
        var fundingSourceList = [];
        var budgetList = [];
        openRequest.onsuccess = function (e) {
            console.log("--------------22222222222222222222-------------", programId);
            db1 = e.target.result;

            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);

            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);




                if (shipmentId == 0 || typeof shipmentId == "undefined") {

                    // var dataSourceResult = [];
                    // dataSourceResult = dataSourceRequest.result;
                    // for (var k = 0; k < dataSourceResult.length; k++) {
                    //     if (dataSourceResult[k].program.id == programJson.programId || dataSourceResult[k].program.id == 0) {
                    //         if (dataSourceResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                    //             var dataSourceJson = {
                    //                 name: dataSourceResult[k].label.label_en,
                    //                 id: dataSourceResult[k].dataSourceId
                    //             }
                    //             dataSourceList[k] = dataSourceJson
                    //         }
                    //     }
                    // }
                    programId = 1;

                    var programTransaction1 = db1.transaction(['program'], 'readwrite');
                    var programOs1 = programTransaction1.objectStore('program');
                    var programRequest1 = programOs1.getAll();
                    console.log("this.props.match.params.shipmentStatusId-----", this.props.match.params.shipmentStatusId);

                    if (this.props.match.params.shipmentStatusId == 1) { //suggested

                        document.getElementById("addButton").style.display = "block";

                        programRequest1.onsuccess = function (event) {
                            var expectedDeliveryInDays = 0;
                            var programResult = [];
                            programResult = programRequest1.result;

                            for (var k = 0; k < programResult.length; k++) {
                                if (programResult[k].programId == programId) {
                                    expectedDeliveryInDays = parseInt(programResult[k].plannedToDraftLeadTime) + parseInt(programResult[k].draftToSubmittedLeadTime) + parseInt(programResult[k].submittedToApprovedLeadTime) + parseInt(programResult[k].approvedToShippedLeadTime) + parseInt(programResult[k].deliveredToReceivedLeadTime);
                                }
                            }

                            var expectedDeliveryDate = this.addDays(new Date(), expectedDeliveryInDays);

                            var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                            var procurementAgentOs = procurementAgentTransaction.objectStore('procurementAgent');
                            var procurementAgentRequest = procurementAgentOs.getAll();

                            procurementAgentRequest.onsuccess = function (event) {
                                var procurementAgentResult = [];
                                procurementAgentResult = procurementAgentRequest.result;
                                for (var k = 0; k < procurementAgentResult.length; k++) {
                                    var procurementAgentJson = {
                                        name: procurementAgentResult[k].label.label_en,
                                        id: procurementAgentResult[k].procurementAgentId
                                    }
                                    procurementAgentList[k] = procurementAgentJson
                                }


                                var fundingSourceTransaction = db1.transaction(['fundingSource'], 'readwrite');
                                var fundingSourceOs = fundingSourceTransaction.objectStore('fundingSource');
                                var fundingSourceRequest = fundingSourceOs.getAll();

                                fundingSourceRequest.onsuccess = function (event) {
                                    var fundingSourceResult = [];
                                    fundingSourceResult = fundingSourceRequest.result;
                                    for (var k = 0; k < fundingSourceResult.length; k++) {
                                        var fundingSourceJson = {
                                            name: fundingSourceResult[k].label.label_en,
                                            id: fundingSourceResult[k].fundingSourceId
                                        }
                                        fundingSourceList[k] = fundingSourceJson
                                    }


                                    var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                                    var budgetOs = budgetTransaction.objectStore('budget');
                                    var budgetRequest = budgetOs.getAll();

                                    budgetRequest.onsuccess = function (event) {
                                        var budgetResult = [];
                                        budgetResult = budgetRequest.result;
                                        for (var k = 0; k < budgetResult.length; k++) {
                                            var budgetJson = {
                                                name: budgetResult[k].label.label_en,
                                                id: budgetResult[k].budgetId
                                            }
                                            budgetList[k] = budgetJson
                                        }



                                        // Get inventory data from program

                                        // var shipmentList = (programJson.shipmentList).filter(c => c.planningUnit.id == plannigUnitId && c.shipmentStatus.id == 1);
                                        var shipmentList = '';
                                        this.setState({
                                            shipmentList: shipmentList
                                        });

                                        var data = [];
                                        var shipmentDataArr = []
                                        if (shipmentList.length == 0) {
                                            data = [];
                                            shipmentDataArr[0] = data;
                                        }

                                        // for (var j = 0; j < shipmentList.length; j++) {
                                        //     data = [];
                                        //     data[0] = shipmentList[j].dataSource.id;
                                        //     data[1] = shipmentList[j].region.id;
                                        //     data[2] = shipmentList[j].consumptionQty;
                                        //     data[3] = shipmentList[j].dayOfStockOut;
                                        //     data[4] = shipmentList[j].startDate;
                                        //     data[5] = shipmentList[j].stopDate;
                                        //     data[6] = shipmentList[j].actualFlag;

                                        //     shipmentDataArr[j] = data;
                                        // }

                                        data = [];
                                        data[0] = '';
                                        // data[1] = expectedDeliveryDate;
                                        data[1] = '10-31-2020';
                                        data[2] = '01-SUGGESTED';
                                        data[3] = 'Ceftriaxone 1 gm Powder Vial, 10 Vials';
                                        data[4] = '44773';
                                        data[5] = '';
                                        data[6] = '';
                                        data[7] = '';
                                        data[8] = '';
                                        data[9] = '';


                                        shipmentDataArr[0] = data;

                                        this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                                        this.el.destroy();
                                        var json = [];
                                        var data = shipmentDataArr;
                                        // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                                        // json[0] = data;
                                        var options = {
                                            data: data,
                                            columnDrag: true,
                                            colWidths: [150, 150, 150, 150, 150, 150, 150, 150, 150, 150],
                                            columns: [
                                                // { title: 'Month', type: 'text', readOnly: true },
                                                {
                                                    title: 'Qat Order No',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Expected Delivery date',
                                                    // type: 'calendar',
                                                    type: 'text',
                                                    readOnly: true

                                                },
                                                {
                                                    title: 'Shipment Status',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Planning Unit',
                                                    type: 'text',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Suggested Order Qty',
                                                    type: 'number',
                                                    // readOnly: true
                                                },
                                                {
                                                    title: 'Adjusted Order Qty',
                                                    type: 'number',
                                                    readOnly: true
                                                },
                                                {
                                                    title: 'Procurement Agent',
                                                    type: 'dropdown',
                                                    source: procurementAgentList,
                                                },
                                                {
                                                    title: 'Funding Source',
                                                    type: 'dropdown',
                                                    source: fundingSourceList,
                                                },
                                                {
                                                    title: 'Budget',
                                                    type: 'dropdown',
                                                    source: budgetList,
                                                },
                                                {
                                                    title: 'Notes',
                                                    type: 'text'
                                                },

                                            ],
                                            pagination: 10,
                                            search: true,
                                            columnSorting: true,
                                            tableOverflow: true,
                                            wordWrap: true,
                                            allowInsertColumn: false,
                                            allowManualInsertColumn: false,
                                            allowDeleteRow: false,
                                            onchange: this.changed,
                                            onload: this.load,
                                            oneditionend: this.onedit,
                                            copyCompatibility: true,
                                            paginationOptions: [10, 25, 50, 100],
                                            position: 'top'
                                        };

                                        this.el = jexcel(document.getElementById("shipmenttableDiv"), options);

                                        // var col = ("E").concat(parseInt(0) + 1);
                                        // ("E").concat(parseInt(0) + 1).addClass('readonly');
                                        // col.isReadOnly = true;
                                        // this.el.setConfig(col, "readonly",true);
                                        // this.el.setAttribute(col, "readonly", true);
                                        // this.el.setStyle(col, "readOnly", true);

                                        // this.el.setStyle(col, "background-color", "yellow");
                                    }.bind(this)
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }
                    if (this.props.match.params.shipmentStatusId == 2) { //planned

                        document.getElementById("addButton").style.display = "none";

                        var procurementAgentPlanningUnitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                        var procurementAgentPlanningUnitOs = procurementAgentPlanningUnitTransaction.objectStore('procurementAgentPlanningUnit');
                        var procurementAgentPlanningUnitRequest = procurementAgentPlanningUnitOs.getAll();

                        procurementAgentPlanningUnitRequest.onsuccess = function (event) {

                            // var procurementAgentResult = [];
                            // procurementAgentResult = procurementAgentPlanningUnitRequest.result;
                            // for (var k = 0; k < procurementAgentResult.length; k++) {
                            //     var procurementAgentJson = {
                            //         // name: procurementAgentResult[k].label.label_en,
                            //         // id: procurementAgentResult[k].procurementAgentId
                            //     }
                            //     procurementAgentList[k] = procurementAgentJson
                            // }





                            // var shipmentList = (programJson.shipmentList).filter(c => c.planningUnit.id == plannigUnitId && c.shipmentStatus.id == 2);
                            var shipmentList = '';

                            this.setState({
                                shipmentList: shipmentList
                            });

                            var data = [];
                            var shipmentDataArr = [];


                            // for (var j = 0; j < shipmentList.length; j++) {
                            //     if (shipmentList[j].shipmentId == 0 && shipmentList[j].shipmentStatusId == 1) {
                            //         data = [];
                            //         data[0] = shipmentList[j].dataSource.id;
                            //         data[1] = shipmentList[j].region.id;
                            //         data[2] = shipmentList[j].consumptionQty;
                            //         data[3] = shipmentList[j].dayOfStockOut;
                            //         data[4] = shipmentList[j].startDate;
                            //         data[5] = shipmentList[j].stopDate;
                            //         data[6] = shipmentList[j].actualFlag;
                            //     }

                            //     shipmentDataArr[j] = data;
                            // }

                            data = [];
                            data[0] = '';
                            data[1] = '10-09-2020';
                            data[2] = '02-PLANNED';
                            data[3] = 'PSM';
                            data[4] = 'USAID';
                            data[5] = 'Kenya - 2020 budget	';
                            data[6] = 'Ceftriaxone 1 gm Powder Vial, 10 Vials';
                            data[7] = '44773';
                            data[8] = '45000'; //moq
                            data[9] = '30.00';
                            data[10] = '1.50';
                            data[11] = '';
                            data[12] = '';
                            data[13] = '';
                            data[14] = '';
                            data[15] = '';
                            data[16] = '';
                            data[17] = '';
                            data[18] = '7.83';
                            data[19] = '';
                            data[20] = '';
                            data[21] = '';
                            data[22] = '';
                            data[23] = '1500';
                            data[24] = '30000';

                            shipmentDataArr[0] = data;

                            this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                            this.el.destroy();
                            var json = [];
                            var data = shipmentDataArr;
                            // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                            // json[0] = data;
                            var options = {
                                data: data,
                                columnDrag: true,
                                colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                columns: [
                                    // { title: 'Month', type: 'text', readOnly: true },
                                    {
                                        title: 'Qat Order No',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Expected Delivery date',
                                        // type: 'calendar',
                                        type: 'text',
                                        readOnly: true

                                    },
                                    {
                                        title: 'Shipment Status',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Procurement Agent',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Funding Source',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Budget',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Planning Unit',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Suggested Order Qty',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'MoQ',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'No of Pallets',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'No of Containers',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Order based on',
                                        type: 'dropdown',
                                        source: [{ id: 1, name: 'Container' }, { id: 2, name: 'Suggested Order Qty' }, { id: 3, name: 'MoQ' }, { id: 4, name: 'Pallet' }]

                                    },
                                    {
                                        title: 'Rounding option',
                                        type: 'dropdown',
                                        source: [{ id: 1, name: 'Round Up' }, { id: 2, name: 'Round Down' }]
                                    },
                                    {
                                        title: 'User Qty',
                                        type: 'text',
                                    },
                                    {
                                        title: 'Adjusted Order Qty',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Adjusted Pallets',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Adjusted Containers',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Manual Price per Planning Unit',
                                        type: 'text',
                                    },
                                    {
                                        title: 'Price per Planning Unit',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Amt',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'RO Number',
                                        type: 'text'
                                    },
                                    {
                                        title: 'Notes',
                                        type: 'text'
                                    },
                                    {
                                        title: 'Cancelled Order',
                                        type: 'checkbox'
                                    },
                                    {
                                        title: 'Unit/Pallet',
                                        type: 'hidden'
                                    },
                                    {
                                        title: 'Unit/Container',
                                        type: 'hidden'
                                    }

                                ],
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
                                position: 'top'
                            };

                            this.el = jexcel(document.getElementById("shipmenttableDiv"), options);

                        }.bind(this);
                    }

                    if (this.props.match.params.shipmentStatusId == 3) { //cancelled
                        document.getElementById("addButton").style.display = "none";

                        // var shipmentList = (programJson.shipmentList).filter(c => c.planningUnit.id == plannigUnitId && c.shipmentStatus.id == 2);
                        var shipmentList = '';

                        this.setState({
                            shipmentList: shipmentList
                        });

                        var data = [];
                        var shipmentDataArr = [];


                        // for (var j = 0; j < shipmentList.length; j++) {
                        //     if (shipmentList[j].shipmentId == 0 && shipmentList[j].shipmentStatusId == 1) {
                        //         data = [];
                        //         data[0] = shipmentList[j].dataSource.id;
                        //         data[1] = shipmentList[j].region.id;
                        //         data[2] = shipmentList[j].consumptionQty;
                        //         data[3] = shipmentList[j].dayOfStockOut;
                        //         data[4] = shipmentList[j].startDate;
                        //         data[5] = shipmentList[j].stopDate;
                        //         data[6] = shipmentList[j].actualFlag;
                        //     }

                        //     shipmentDataArr[j] = data;
                        // }

                        data = [];
                        data[0] = '';
                        data[1] = '10-09-2020';
                        data[2] = '02-CANCELLED';
                        data[3] = 'PSM';
                        data[4] = 'USAID';
                        data[5] = 'Kenya - 2020 budget';
                        data[6] = 'Ceftriaxone 1 gm Powder Vial, 10 Vials';
                        data[7] = '44773';
                        data[8] = '45000'; //moq
                        data[9] = 'Container';
                        data[10] = 'RoundUp';
                        data[11] = '';
                        data[12] = '60000';
                        data[13] = '40000';
                        data[14] = '2';
                        data[15] = '8.73';
                        data[16] = '7.83';
                        data[17] = '670000';
                        data[18] = 'dgre43';
                        data[19] = '';
                        data[20] = true;


                        shipmentDataArr[0] = data;

                        this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                        this.el.destroy();
                        var json = [];
                        var data = shipmentDataArr;
                        // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                        // json[0] = data;
                        var options = {
                            data: data,
                            columnDrag: true,
                            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                            columns: [
                                // { title: 'Month', type: 'text', readOnly: true },
                                {
                                    title: 'Qat Order No',
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: 'Expected Delivery date',
                                    // type: 'calendar',
                                    type: 'text',
                                    readOnly: true

                                },
                                {
                                    title: 'Shipment Status',
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: 'Procurement Agent',
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: 'Funding Source',
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: 'Budget',
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: 'Planning Unit',
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: 'Suggested Order Qty',
                                    type: 'numeric',
                                    readOnly: true
                                },
                                {
                                    title: 'MoQ',
                                    type: 'numeric',
                                    readOnly: true
                                },
                                {
                                    title: 'Order based on',
                                    type: 'text',
                                    readOnly: true

                                },
                                {
                                    title: 'Rounding option',
                                    type: 'text',
                                    readOnly: true

                                },
                                {
                                    title: 'User Qty',
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: 'Adjusted Order Qty',
                                    type: 'numeric',
                                    readOnly: true
                                },
                                {
                                    title: 'Adjusted Pallets',
                                    type: 'numeric',
                                    readOnly: true
                                },
                                {
                                    title: 'Adjusted Containers',
                                    type: 'numeric',
                                    readOnly: true
                                },
                                {
                                    title: 'Manual Price per Planning Unit',
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: 'Price per Planning Unit',
                                    type: 'numeric',
                                    readOnly: true
                                },
                                {
                                    title: 'Amt',
                                    type: 'numeric',
                                    readOnly: true
                                },
                                {
                                    title: 'RO Number',
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: 'Notes',
                                    type: 'text',
                                    readOnly: true
                                },
                                {
                                    title: 'Cancelled Order',
                                    type: 'checkbox'
                                }



                            ],
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
                            position: 'top'
                        };

                        this.el = jexcel(document.getElementById("shipmenttableDiv"), options);

                    }

                    if (this.props.match.params.shipmentStatusId == 4) { //submitted
                        document.getElementById("addButton").style.display = "none";
                        var paList = [];
                        var supList = [];
                        var allowShipStatusList = [];
                        var currentShipmentId = 3;
                        var nextShipmentAllowedList = [];

                        var procurementUnitTransaction = db1.transaction(['procurementUnit'], 'readwrite');
                        var procurementUnitOs = procurementUnitTransaction.objectStore('procurementUnit');
                        var procurementUnitRequest = procurementUnitOs.getAll();
                        procurementUnitRequest.onsuccess = function (event) {

                            var supplierTransaction = db1.transaction(['supplier'], 'readwrite');
                            var supplierOs = supplierTransaction.objectStore('supplier');
                            var supplierRequest = supplierOs.getAll();
                            supplierRequest.onsuccess = function (event) {

                                var procurementUnitResult = [];
                                procurementUnitResult = procurementUnitRequest.result;
                                for (var k = 0; k < procurementUnitResult.length; k++) {
                                    var paJson = {
                                        name: procurementUnitResult[k].label.label_en,
                                        id: procurementUnitResult[k].procurementUnitId
                                    }
                                    paList[k] = paJson;
                                }

                                var allowShipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                                var allowShipmentStatusOs = allowShipmentStatusTransaction.objectStore('shipmentStatus');
                                var allowShipmentStatusRequest = allowShipmentStatusOs.getAll();


                                allowShipmentStatusRequest.onsuccess = function (event) {

                                    var allowShipmentStatusResult = [];
                                    allowShipmentStatusResult = allowShipmentStatusRequest.result;

                                    for (var k = 0; k < allowShipmentStatusResult.length; k++) {
                                        if (currentShipmentId == allowShipmentStatusResult[k].shipmentStatusId) {
                                            nextShipmentAllowedList = allowShipmentStatusResult[k].nextShipmentStatusAllowedList;
                                        }
                                    }

                                    var count = 0;
                                    for (var k = 0; k < allowShipmentStatusResult.length; k++) {
                                        if (nextShipmentAllowedList[count] == allowShipmentStatusResult[k].shipmentStatusId) {
                                            var allowShipStatusJson = {
                                                name: allowShipmentStatusResult[k].label.label_en,
                                                id: allowShipmentStatusResult[k].shipmentStatusId
                                            }
                                            allowShipStatusList[count] = allowShipStatusJson;
                                            count++;
                                        }
                                    }

                                    this.setState({
                                        allowShipmentStatusList: allowShipStatusList
                                    });

                                    this.setState({
                                        procurementAgentList: paList
                                    });

                                    var supplierResult = [];
                                    supplierResult = supplierRequest.result;
                                    for (var k = 0; k < supplierResult.length; k++) {
                                        var supplierJson = {
                                            name: supplierResult[k].label.label_en,
                                            id: supplierResult[k].supplierId
                                        }
                                        supList[k] = supplierJson;
                                    }

                                    this.setState({
                                        supplierList: supList
                                    });

                                    // var shipmentList = (programJson.shipmentList).filter(c => c.planningUnit.id == plannigUnitId && c.shipmentStatus.id == 2);
                                    var shipmentList = '';

                                    this.setState({
                                        shipmentList: shipmentList
                                    });

                                    var data = [];
                                    var shipmentDataArr = [];


                                    // for (var j = 0; j < shipmentList.length; j++) {
                                    //     if (shipmentList[j].shipmentId == 0 && shipmentList[j].shipmentStatusId == 1) {
                                    //         data = [];
                                    //         data[0] = shipmentList[j].dataSource.id;
                                    //         data[1] = shipmentList[j].region.id;
                                    //         data[2] = shipmentList[j].consumptionQty;
                                    //         data[3] = shipmentList[j].dayOfStockOut;
                                    //         data[4] = shipmentList[j].startDate;
                                    //         data[5] = shipmentList[j].stopDate;
                                    //         data[6] = shipmentList[j].actualFlag;
                                    //     }

                                    //     shipmentDataArr[j] = data;
                                    // }

                                    data = [];
                                    data[0] = '';
                                    data[1] = '10-09-2020';
                                    data[2] = '';
                                    data[3] = 'PSM';
                                    data[4] = 'USAID';
                                    data[5] = 'Kenya - 2020 budget';
                                    data[6] = 'Ceftriaxone 1 gm Powder Vial, 10 Vials';
                                    data[7] = '44773';
                                    data[8] = '45000'; //moq
                                    data[9] = '';
                                    data[10] = '60000';
                                    data[11] = '40000';
                                    data[12] = '2';
                                    data[13] = '';
                                    data[14] = '';
                                    data[15] = '';
                                    data[16] = '7.83';
                                    data[17] = '670000';
                                    data[18] = 'dgre43';
                                    data[19] = '';


                                    shipmentDataArr[0] = data;

                                    this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                                    this.el.destroy();
                                    var json = [];
                                    var data = shipmentDataArr;
                                    // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                                    // json[0] = data;
                                    var options = {
                                        data: data,
                                        columnDrag: true,
                                        colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                        columns: [
                                            // { title: 'Month', type: 'text', readOnly: true },
                                            {
                                                title: 'Qat Order No',
                                                type: 'text',
                                                readOnly: true
                                            },
                                            {
                                                title: 'Expected Delivery date',
                                                // type: 'calendar',
                                                type: 'text',
                                                readOnly: true

                                            },
                                            {
                                                title: 'Shipment Status',
                                                type: 'dropdown',
                                                // source: ['Approved', 'Shipped', 'Delivered']
                                                source: allowShipStatusList
                                                // readOnly: true
                                            },
                                            {
                                                title: 'Procurement Agent',
                                                type: 'text',
                                                readOnly: true
                                            },
                                            {
                                                title: 'Funding Source',
                                                type: 'text',
                                                readOnly: true
                                            },
                                            {
                                                title: 'Budget',
                                                type: 'text',
                                                readOnly: true
                                            },
                                            {
                                                title: 'Planning Unit',
                                                type: 'text',
                                                readOnly: true
                                            },
                                            {
                                                title: 'Suggested Order Qty',
                                                type: 'numeric',
                                                readOnly: true
                                            },
                                            {
                                                title: 'MoQ',
                                                type: 'numeric',
                                                readOnly: true
                                            },
                                            {
                                                title: 'User Qty',
                                                type: 'text',
                                                readOnly: true
                                            },
                                            {
                                                title: 'Adjusted Order Qty',
                                                type: 'numeric',
                                                readOnly: true
                                            },
                                            {
                                                title: 'Adjusted Pallets',
                                                type: 'numeric',
                                                readOnly: true
                                            },
                                            {
                                                title: 'Adjusted Containers',
                                                type: 'numeric',
                                                readOnly: true
                                            },
                                            {
                                                title: 'Manual Price per Planning Unit',
                                                type: 'text',
                                                readOnly: true
                                            },
                                            {
                                                title: 'Procurement Unit',
                                                type: 'dropdown',
                                                source: paList
                                            },
                                            {
                                                title: 'Supplier',
                                                type: 'dropdown',
                                                source: supList
                                            },
                                            {
                                                title: 'Price per Planning Unit',
                                                type: 'numeric',
                                                readOnly: true
                                            },
                                            {
                                                title: 'Amt',
                                                type: 'numeric',
                                                readOnly: true
                                            },
                                            {
                                                title: 'RO Number',
                                                type: 'text',
                                                // readOnly: true
                                            },
                                            {
                                                title: 'Notes',
                                                type: 'text',
                                                readOnly: true
                                            },

                                        ],
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
                                        position: 'top'
                                    };

                                    this.el = jexcel(document.getElementById("shipmenttableDiv"), options);
                                }.bind(this);
                            }.bind(this);
                        }.bind(this);



                    }








                } else {

                    if (shipmentId == 2) { //planned

                        document.getElementById("addButton").style.display = "none";

                        var procurementAgentPlanningUnitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                        var procurementAgentPlanningUnitOs = procurementAgentPlanningUnitTransaction.objectStore('procurementAgentPlanningUnit');
                        var procurementAgentPlanningUnitRequest = procurementAgentPlanningUnitOs.getAll();

                        procurementAgentPlanningUnitRequest.onsuccess = function (event) {

                            // var procurementAgentResult = [];
                            // procurementAgentResult = procurementAgentPlanningUnitRequest.result;
                            // for (var k = 0; k < procurementAgentResult.length; k++) {
                            //     var procurementAgentJson = {
                            //         // name: procurementAgentResult[k].label.label_en,
                            //         // id: procurementAgentResult[k].procurementAgentId
                            //     }
                            //     procurementAgentList[k] = procurementAgentJson
                            // }





                            // var shipmentList = (programJson.shipmentList).filter(c => c.planningUnit.id == plannigUnitId && c.shipmentStatus.id == 2);
                            var shipmentList = '';

                            this.setState({
                                shipmentList: shipmentList
                            });

                            var data = [];
                            var shipmentDataArr = [];


                            // for (var j = 0; j < shipmentList.length; j++) {
                            //     if (shipmentList[j].shipmentId == 0 && shipmentList[j].shipmentStatusId == 1) {
                            //         data = [];
                            //         data[0] = shipmentList[j].dataSource.id;
                            //         data[1] = shipmentList[j].region.id;
                            //         data[2] = shipmentList[j].consumptionQty;
                            //         data[3] = shipmentList[j].dayOfStockOut;
                            //         data[4] = shipmentList[j].startDate;
                            //         data[5] = shipmentList[j].stopDate;
                            //         data[6] = shipmentList[j].actualFlag;
                            //     }

                            //     shipmentDataArr[j] = data;
                            // }

                            data = [];
                            data[0] = '';
                            data[1] = '10-09-2020';
                            data[2] = '02-PLANNED';
                            data[3] = 'PSM';
                            data[4] = 'USAID';
                            data[5] = 'Kenya - 2020 budget	';
                            data[6] = 'Ceftriaxone 1 gm Powder Vial, 10 Vials';
                            data[7] = '44773';
                            data[8] = '45000'; //moq
                            data[9] = '30.00';
                            data[10] = '1.50';
                            data[11] = '';
                            data[12] = '';
                            data[13] = '';
                            data[14] = '';
                            data[15] = '';
                            data[16] = '';
                            data[17] = '';
                            data[18] = '7.83';
                            data[19] = '';
                            data[20] = '';
                            data[21] = '';
                            data[22] = '';
                            data[23] = '1500';
                            data[24] = '30000';

                            shipmentDataArr[0] = data;

                            this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                            this.el.destroy();
                            var json = [];
                            var data = shipmentDataArr;
                            // var data = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                            // json[0] = data;
                            var options = {
                                data: data,
                                columnDrag: true,
                                colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                columns: [
                                    // { title: 'Month', type: 'text', readOnly: true },
                                    {
                                        title: 'Qat Order No',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Expected Delivery date',
                                        // type: 'calendar',
                                        type: 'text',
                                        readOnly: true

                                    },
                                    {
                                        title: 'Shipment Status',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Procurement Agent',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Funding Source',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Budget',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Planning Unit',
                                        type: 'text',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Suggested Order Qty',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'MoQ',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'No of Pallets',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'No of Containers',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Order based on',
                                        type: 'dropdown',
                                        source: [{ id: 1, name: 'Container' }, { id: 2, name: 'Suggested Order Qty' }, { id: 3, name: 'MoQ' }, { id: 4, name: 'Pallet' }]

                                    },
                                    {
                                        title: 'Rounding option',
                                        type: 'dropdown',
                                        source: [{ id: 1, name: 'Round Up' }, { id: 2, name: 'Round Down' }]
                                    },
                                    {
                                        title: 'User Qty',
                                        type: 'text',
                                    },
                                    {
                                        title: 'Adjusted Order Qty',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Adjusted Pallets',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Adjusted Containers',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Manual Price per Planning Unit',
                                        type: 'text',
                                    },
                                    {
                                        title: 'Price per Planning Unit',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'Amt',
                                        type: 'numeric',
                                        readOnly: true
                                    },
                                    {
                                        title: 'RO Number',
                                        type: 'text'
                                    },
                                    {
                                        title: 'Notes',
                                        type: 'text'
                                    },
                                    {
                                        title: 'Cancelled Order',
                                        type: 'checkbox'
                                    },
                                    {
                                        title: 'Unit/Pallet',
                                        type: 'hidden'
                                    },
                                    {
                                        title: 'Unit/Container',
                                        type: 'hidden'
                                    }

                                ],
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
                                position: 'top'
                            };

                            this.el = jexcel(document.getElementById("shipmenttableDiv"), options);

                        }.bind(this);




                    } else if (shipmentId == 3) { //submitted

                    } else if (shipmentId == 4) { //approved

                    } else if (shipmentId == 5) { //shipped

                    } else if (shipmentId == 5) { //Delivered

                    } else if (shipmentId == 6) { //cancelled

                    }







                }
            }.bind(this)
        }.bind(this)


    };


    addRow = function () {
        // document.getElementById("saveButtonDiv").style.display = "block";
        var procurementAgentList = [];
        var fundingSourceList = [];
        var budgetList = [];
        var shipmentStatusList = [];
        let planningUnitList = [];
        let procurementAgentPlanningList = [];

        var programId = (this.props.match.params.programId).split("_")[0];

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;


            var programTransaction1 = db1.transaction(['program'], 'readwrite');
            var programOs1 = programTransaction1.objectStore('program');
            var programRequest1 = programOs1.getAll();

            programRequest1.onsuccess = function (event) {

                var expectedDeliveryInDays = 0;
                var programResult = [];
                programResult = programRequest1.result;

                for (var k = 0; k < programResult.length; k++) {
                    if (programResult[k].programId == programId) {
                        expectedDeliveryInDays = parseInt(programResult[k].plannedToDraftLeadTime) + parseInt(programResult[k].draftToSubmittedLeadTime) + parseInt(programResult[k].submittedToApprovedLeadTime) + parseInt(programResult[k].approvedToShippedLeadTime) + parseInt(programResult[k].deliveredToReceivedLeadTime);
                    }
                }

                var expectedDeliveryDate = this.addDays(new Date(), expectedDeliveryInDays);


                var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                var procurementAgentOs = procurementAgentTransaction.objectStore('procurementAgent');
                var procurementAgentRequest = procurementAgentOs.getAll();

                procurementAgentRequest.onsuccess = function (event) {
                    var procurementAgentResult = [];
                    procurementAgentResult = procurementAgentRequest.result;
                    for (var k = 0; k < procurementAgentResult.length; k++) {
                        var procurementAgentJson = {
                            name: procurementAgentResult[k].label.label_en,
                            id: procurementAgentResult[k].procurementAgentId
                        }
                        procurementAgentList[k] = procurementAgentJson
                    }


                    var fundingSourceTransaction = db1.transaction(['fundingSource'], 'readwrite');
                    var fundingSourceOs = fundingSourceTransaction.objectStore('fundingSource');
                    var fundingSourceRequest = fundingSourceOs.getAll();

                    fundingSourceRequest.onsuccess = function (event) {
                        var fundingSourceResult = [];
                        fundingSourceResult = fundingSourceRequest.result;
                        for (var k = 0; k < fundingSourceResult.length; k++) {
                            var fundingSourceJson = {
                                name: fundingSourceResult[k].label.label_en,
                                id: fundingSourceResult[k].fundingSourceId
                            }
                            fundingSourceList[k] = fundingSourceJson
                        }


                        var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                        var budgetOs = budgetTransaction.objectStore('budget');
                        var budgetRequest = budgetOs.getAll();

                        budgetRequest.onsuccess = function (event) {
                            var budgetResult = [];
                            budgetResult = budgetRequest.result;
                            for (var k = 0; k < budgetResult.length; k++) {
                                var budgetJson = {
                                    name: budgetResult[k].label.label_en,
                                    id: budgetResult[k].budgetId
                                }
                                budgetList[k] = budgetJson
                            }


                            var planningUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                            var planningUnitOs = planningUnitTransaction.objectStore('planningUnit');
                            var planningUnitRequest = planningUnitOs.getAll();

                            planningUnitRequest.onsuccess = function (event) {
                                var planningUnitResult = [];
                                planningUnitResult = planningUnitRequest.result;

                                for (var k = 0; k < planningUnitResult.length; k++) {
                                    if (planningUnitResult[k].planningUnitId == this.props.match.params.planningUnitId) {
                                        let planningUnitJson = {
                                            name: planningUnitResult[k].label.label_en,
                                            id: planningUnitResult[k].id
                                        }
                                        planningUnitList[0] = planningUnitJson;

                                    }
                                }

                                let procurementAgentPlanningUnitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                                let procurementAgentPlanningUnitOs = procurementAgentPlanningUnitTransaction.objectStore('procurementAgentPlanningUnit');
                                let procurementAgentPlanningUnitRequest = procurementAgentPlanningUnitOs.getAll();

                                procurementAgentPlanningUnitRequest.onsuccess = function (event) {

                                    var procurementAgentPlanningUnitResult = [];
                                    procurementAgentPlanningUnitResult = procurementAgentPlanningUnitRequest.result;
                                    for (var k = 0; k < procurementAgentPlanningUnitResult.length; k++) {
                                        if (procurementAgentPlanningUnitResult[k].planningUnit.id == this.props.match.params.planningUnitId) {
                                            var procurementAgentJson = {
                                                id: procurementAgentPlanningUnitResult[k].procurementAgentPlanningUnitId,
                                                catalogPrice: procurementAgentPlanningUnitResult[k].catalogPrice,
                                                moq: procurementAgentPlanningUnitResult[k].moq,
                                                unitsPerPallet: procurementAgentPlanningUnitResult[k].unitsPerPallet,
                                                unitsPerContainer: procurementAgentPlanningUnitResult[k].unitsPerContainer
                                            }
                                            procurementAgentPlanningList[0] = procurementAgentJson
                                        }
                                    }

                                    var data = [];
                                    data[0] = '0';
                                    data[1] = expectedDeliveryDate;
                                    data[2] = 'Planned';
                                    data[3] = procurementAgentList;
                                    data[4] = fundingSourceList;
                                    data[5] = budgetList;
                                    data[6] = planningUnitList[0].name;
                                    data[7] = '';
                                    data[8] = procurementAgentPlanningList[0].moq;
                                    data[9] = ((procurementAgentPlanningList[0].moq / procurementAgentPlanningList[0].unitsPerPallet).toFixed(1) == "NaN") ? '0' : (procurementAgentPlanningList[0].moq / procurementAgentPlanningList[0].unitsPerPallet).toFixed(1);
                                    data[10] = ((procurementAgentPlanningList[0].moq / procurementAgentPlanningList[0].unitsPerContainer).toFixed(1) == "NaN") ? '0' : (procurementAgentPlanningList[0].moq / procurementAgentPlanningList[0].unitsPerContainer).toFixed(1);
                                    data[11] = [{ id: 1, name: 'Container' }, { id: 2, name: 'Suggested Order Qty' }, { id: 3, name: 'MoQ' }, { id: 4, name: 'Pallet' }];
                                    data[12] = [{ id: 1, name: 'Round Up' }, { id: 2, name: 'Round Down' }];
                                    data[13] = '';
                                    data[14] = '';
                                    data[15] = '';
                                    data[16] = '';
                                    data[17] = '';
                                    data[18] = procurementAgentPlanningList[0].catalogPrice;
                                    data[19] = '';
                                    data[20] = '';
                                    data[21] = '';
                                    data[22] = '';
                                    data[23] = procurementAgentPlanningList[0].unitsPerPallet;
                                    data[24] = procurementAgentPlanningList[0].unitsPerContainer;
                                    data[25] = -1;

                                    this.el.insertRow(
                                        data
                                    );

                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)

    };

    addDays = function (theDate, days) {
        var someDate = new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
        var dd = someDate.getDate();
        var mm = someDate.getMonth() + 1;
        var y = someDate.getFullYear();
        var someFormattedDate = mm + '-' + dd + '-' + y;
        return someFormattedDate;
    }.bind(this)

    saveData = function () {

        var validation = this.checkValidation();
        let tempShipmentList = this.state.shipmentList;
        var shipmentStatusId = tempShipmentList[0].shipmentStatus.id
        if (validation == true) {
            this.setState(
                {
                    changedFlag: 0
                }
            );
            console.log("all good...", this.el.getJson());
            let shipmentId = this.props.match.params.shipmentId;
            var tableJson = this.el.getJson();
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');

                var programId = this.props.match.params.programId;

                var programRequest = programTransaction.get(programId);
                programRequest.onsuccess = function (event) {
                    // console.log("(programRequest.result)----", (programRequest.result))
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var plannigUnitId = this.props.match.params.planningUnitId;


                    if (shipmentId == 0 || typeof shipmentId == "undefined") {




                    } else {

                        if (shipmentStatusId == 2) { //planned
                            var shipmentDataList = (programJson.shipmentList).filter(c => c.shipmentId == shipmentId);
                            var shipmentDataListNotFiltered = programJson.shipmentList;
                            // console.log("programJson.shipmentList-- ",programJson.shipmentList);
                            for (var i = 0; i < shipmentDataList.length; i++) {

                                var map = new Map(Object.entries(tableJson[i]));
                                shipmentDataListNotFiltered[parseInt(map.get("25"))].procurementAgent.id = map.get("3");
                                // shipmentDataListNotFiltered[parseInt(map.get("25"))].fundingSource.id = parseInt(map.get("4"));
                                // shipmentDataListNotFiltered[parseInt(map.get("25"))].budget.id = parseInt(map.get("5"));
                                // shipmentDataListNotFiltered[parseInt(map.get("25"))].orderBasedOn = map.get("11");
                                // shipmentDataListNotFiltered[parseInt(map.get("25"))].roundingOption = map.get("12");
                                shipmentDataListNotFiltered[parseInt(map.get("25"))].userQty = map.get("13");
                                shipmentDataListNotFiltered[parseInt(map.get("25"))].quantity = map.get("14");
                                shipmentDataListNotFiltered[parseInt(map.get("25"))].rate = map.get("17");
                                // shipmentDataListNotFiltered[parseInt(map.get("25"))].RONumber = map.get("7");                        
                                shipmentDataListNotFiltered[parseInt(map.get("25"))].notes = map.get("21");
                                if (map.get("22") == true || map.get("22") === 'true') {
                                    shipmentDataListNotFiltered[parseInt(map.get("25"))].shipmentStatus.id = 7;
                                    shipmentDataListNotFiltered[parseInt(map.get("25"))].shipmentStatus.label.label_en = 'Cancelled';
                                } else {
                                    shipmentDataListNotFiltered[parseInt(map.get("25"))].shipmentStatus.id = 3;
                                    shipmentDataListNotFiltered[parseInt(map.get("25"))].shipmentStatus.label.label_en = 'Submitted';
                                }
                            }

                            for (var i = shipmentDataList.length; i < tableJson.length; i++) {
                                let shipId = 0;
                                let shipLabel = '';
                                var map = new Map(Object.entries(tableJson[i]))

                                if (map.get("22") == true || map.get("22") === 'true') {
                                    shipId = 7;
                                    shipLabel = 'Cancelled';
                                } else {
                                    shipId = 3;
                                    shipLabel = 'Submitted';
                                }

                                var json = {
                                    shipmentId: 0,
                                    planningUnit: {
                                        id: plannigUnitId,
                                    },
                                    expectedDeliveryDate: moment(map.get("1")).format("YYYY-MM-DD"),
                                    suggestedQty: map.get("7"),
                                    procurementAgent: {
                                        id: map.get("3")
                                    },
                                    procurementUnit: {
                                        id: 0
                                    },
                                    supplier: {
                                        id: 0
                                    },
                                    quantity: map.get("14"),
                                    rate: map.get("17"),
                                    productCost: 0,
                                    shipmentMode: '',
                                    freightCost: 0,
                                    orderedDate: moment(new Date()).format("YYYY-MM-DD"),
                                    shippedDate: '',
                                    receivedDate: '',
                                    shipmentStatus: {
                                        id: shipId,
                                        label: {
                                            label_en: shipLabel
                                        }
                                    },
                                    notes: map.get("21"),
                                    dataSource: {
                                        id: 0
                                    },
                                    accountFlag: '',
                                    erpFlag: '',
                                    versionId: 0
                                }
                                shipmentDataList.push(json);
                                shipmentDataListNotFiltered.push(json);
                            }

                        } else if (shipmentStatusId == 7) {

                            var shipmentDataList = (programJson.shipmentList).filter(c => c.shipmentId == shipmentId);
                            var shipmentDataListNotFiltered = programJson.shipmentList;
                            for (var i = 0; i < shipmentDataList.length; i++) {
                                var map = new Map(Object.entries(tableJson[i]));
                                shipmentDataListNotFiltered[parseInt(map.get("23"))].notes = map.get("21");
                                if (map.get("22") == true || map.get("22") === 'true') {
                                    shipmentDataListNotFiltered[parseInt(map.get("23"))].shipmentStatus.id = 7;
                                    shipmentDataListNotFiltered[parseInt(map.get("23"))].shipmentStatus.label.label_en = 'Cancelled';
                                } else {
                                    shipmentDataListNotFiltered[parseInt(map.get("23"))].shipmentStatus.id = 2;
                                    shipmentDataListNotFiltered[parseInt(map.get("23"))].shipmentStatus.label.label_en = 'Cancelled';
                                }
                            }

                        } else if (shipmentStatusId == 3 || shipmentStatusId == 4 || shipmentStatusId == 5 || shipmentStatusId == 6) {

                            var shipmentDataList = (programJson.shipmentList).filter(c => c.shipmentId == shipmentId);
                            var shipmentDataListNotFiltered = programJson.shipmentList;

                            for (var i = 0; i < shipmentDataList.length; i++) {
                                let shipLabel = '';
                                var map = new Map(Object.entries(tableJson[i]));

                                if (map.get("2") == 3) {
                                    shipLabel = 'Submitted';
                                } else if (map.get("2") == 4) {
                                    shipLabel = 'Approved';
                                } else if (map.get("2") == 5) {
                                    shipLabel = 'Shipped';
                                } else if (map.get("2") == 6) {
                                    shipLabel = 'Delivered';
                                }

                                shipmentDataListNotFiltered[parseInt(map.get("20"))].shipmentStatus.id = map.get("2");
                                shipmentDataListNotFiltered[parseInt(map.get("20"))].shipmentStatus.label.label_en = shipLabel;
                                shipmentDataListNotFiltered[parseInt(map.get("20"))].procurementUnit.id = map.get("14");
                                shipmentDataListNotFiltered[parseInt(map.get("20"))].supplier.id = map.get("15");
                                // shipmentDataListNotFiltered[parseInt(map.get("23"))].RONumber = map.get("18");
                                shipmentDataListNotFiltered[parseInt(map.get("20"))].notes = map.get("19");

                            }

                        }

                    }




                    // var consumptionDataList = (programJson.shipmentList).filter(c => c.planningUnit.id == plannigUnitId);
                    // var consumptionDataListNotFiltered = programJson.shipmentList;

                    // // console.log("000000000000000   ", consumptionDataList)

                    // for (var i = 0; i < consumptionDataList.length; i++) {

                    //     var map = new Map(Object.entries(tableJson[i]));
                    //     consumptionDataListNotFiltered[parseInt(map.get("8"))].consumptionDate = moment(map.get("0")).format("YYYY-MM-DD");
                    //     consumptionDataListNotFiltered[parseInt(map.get("8"))].region.id = map.get("1");
                    //     consumptionDataListNotFiltered[parseInt(map.get("8"))].consumptionQty = map.get("2");
                    //     consumptionDataListNotFiltered[parseInt(map.get("8"))].dayOfStockOut = parseInt(map.get("3"));
                    //     consumptionDataListNotFiltered[parseInt(map.get("8"))].dataSource.id = map.get("4");
                    //     consumptionDataListNotFiltered[parseInt(map.get("8"))].notes = map.get("5");
                    //     consumptionDataListNotFiltered[parseInt(map.get("8"))].actualFlag = map.get("6");
                    //     consumptionDataListNotFiltered[parseInt(map.get("8"))].active = map.get("7");

                    // }


                    // console.log("productCategoryId--2222-->>>>>>>>> ", this.state.productCategoryId);
                    // for (var i = consumptionDataList.length; i < tableJson.length; i++) {
                    //     var map = new Map(Object.entries(tableJson[i]))
                    //     var json = {
                    //         consumptionId: 0,
                    //         consumptionDate: moment(map.get("0")).format("YYYY-MM-DD"),
                    //         region: {
                    //             id: map.get("1")
                    //         },
                    //         consumptionQty: map.get("2"),
                    //         dayOfStockOut: parseInt(map.get("3")),
                    //         dataSource: {
                    //             id: map.get("4")
                    //         },
                    //         notes: map.get("5"),
                    //         actualFlag: map.get("6"),
                    //         active: map.get("7"),

                    //         // planningUnit: {
                    //         //     id: plannigUnitId
                    //         // }
                    //         planningUnit: {
                    //             id: plannigUnitId,
                    //             forecastingUnit: {
                    //                 productCategory: {
                    //                     id: this.state.productCategoryId
                    //                 }
                    //             }
                    //         }
                    //     }
                    //     consumptionDataList.push(json);
                    //     consumptionDataListNotFiltered.push(json);
                    // }






                    //------------------------------------------------------------------------------
                    // console.log("1111111111111111111   ", shipmentDataList)
                    programJson.shipmentList = shipmentDataListNotFiltered;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        // Handle errors!
                    };
                    putRequest.onsuccess = function (event) {
                        // $("#saveButtonDiv").hide();
                        this.setState({
                            message: 'static.message.consumptionSaved',
                            changedFlag: 0
                        })
                        // this.props.history.push(`/consumptionDetails/${document.getElementById('programId').value}/${document.getElementById("planningUnitId").value}/` + i18n.t('static.message.consumptionSuccess'))
                        this.props.history.push(`/consumptionDetails/` + i18n.t('static.message.consumptionSuccess'));
                    }.bind(this)
                }.bind(this)
            }.bind(this)


        } else {
            console.log("some thing get wrong...");
        }

    }.bind(this);

    render() {

        return (

            <div className="animated fadeIn">
                <Col xs="12" sm="12">
                    <h5>{i18n.t(this.state.message)}</h5>
                    <Card>

                        <CardHeader>
                            <strong>Shipment details</strong>
                        </CardHeader>
                        <CardBody>
                            <Col xs="12" sm="12">
                                <div className="table-responsive">
                                    <div id="shipmenttableDiv">
                                    </div>
                                </div>
                            </Col>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveData()} ><i className="fa fa-check"></i>Save Data</Button>
                                <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.addRow()} id="addButton"><i className="fa fa-check"></i>Add Row</Button>

                                &nbsp;
</FormGroup>
                        </CardFooter>
                    </Card>
                </Col>

            </div >
        );
    }

    getPlanningUnitList(event) {
        // console.log("-------------in planning list-------------")
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
                // console.log("myResult", myResult);
                var programId = (document.getElementById("programId").value).split("_")[0];
                // console.log('programId----->>>', programId)
                console.log(myResult);
                var proList = []
                for (var i = 0; i < myResult.length; i++) {
                    if (myResult[i].program.id == programId) {
                        var productJson = {
                            name: getLabelText(myResult[i].planningUnit.label, lan),
                            id: myResult[i].planningUnit.id
                        }
                        proList[i] = productJson
                    }
                }
                this.setState({
                    planningUnitList: proList
                })
            }.bind(this);
        }.bind(this)
    }


    load = function (instance, cell, x, y, value) {
        // console.log("*****************************************");
        // var col = ("E").concat(parseInt(0) + 1);
        // this.el.setStyle(col, "readonly", "true");
        // this.el.setStyle(col, "background-color", "yellow");
        // col.addClass('readonly');


    }.bind(this);

    changed = function (instance, cell, x, y, value) {
        //---------------------------
        this.setState({
            changedFlag: 1
        })
        let tempShipmentList = this.state.shipmentList;
        var shipmentStatusId = tempShipmentList[0].shipmentStatus.id

        if (shipmentStatusId == 1) {
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
            if (x == 8) {
                var col = ("I").concat(parseInt(y) + 1);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }

        }

        if (shipmentStatusId == 2) {
            // if (x == 11 || x == 12 || x == 13) {

            var isValidForManualPrice = true;
            var isValidForUserQty = true;

            console.log("CHECK oF XXXXXXXXXXX ", x);
            if (x == 11 && isValidForManualPrice && isValidForUserQty) {
                var rowData = this.el.getRowData(y);
                var orderBasedOn = rowData[11];
                var roundingOption = rowData[12];


                if (value == "") {

                    var col = ("L").concat(parseInt(y) + 1);
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));

                } else {
                    var col = ("L").concat(parseInt(y) + 1);
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");


                    if (this.el.getValueFromCoords(13, y) == "") {
                        //Calculation based on Suggested order quantity
                        console.log("IF Calculation based on Suggested order quantity");

                        if (roundingOption != "") {
                            //calculation based on Rounding Options
                            console.log("IF calculation based on Rounding Options");

                            //checking the value of dropdown of order based on
                            if (value == 1) {
                                //container
                                console.log("IF container");

                                var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(24, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }

                                if (roundingOption == 1) {
                                    this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(24, y)), true);
                                } else {
                                    if (parseInt(modulusDown * this.el.getValueFromCoords(24, y)) < this.el.getValueFromCoords(8, y)) {
                                        this.el.setValueFromCoords(14, y, '', true);
                                        this.el.setValueFromCoords(15, y, '', true);
                                        this.el.setValueFromCoords(16, y, '', true);
                                        this.el.setValueFromCoords(19, y, '', true);
                                        alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                    } else {
                                        // this.el.setValueFromCoords(12, y, 1, true);
                                        this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(24, y), true);
                                    }
                                }


                            } else if (value == 4) {
                                //Pallet
                                console.log("IF pallet");

                                var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(23, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }

                                if (roundingOption == 1) {
                                    this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(23, y)), true);
                                } else {
                                    if (parseInt(modulusDown * this.el.getValueFromCoords(23, y)) < this.el.getValueFromCoords(8, y)) {
                                        this.el.setValueFromCoords(14, y, '', true);
                                        this.el.setValueFromCoords(15, y, '', true);
                                        this.el.setValueFromCoords(16, y, '', true);
                                        this.el.setValueFromCoords(19, y, '', true);
                                        alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                    } else {
                                        // this.el.setValueFromCoords(12, y, 1, true);
                                        this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(23, y), true);
                                    }
                                }

                            }


                            if (this.el.getValueFromCoords(14, y) != "") {

                                //set adjust pallet and container 
                                this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                            }


                        }

                        if (value == 2) {
                            //suggested order quantity
                            console.log("IF suggested order quantity");
                            if (this.el.getValueFromCoords(7, y) < this.el.getValueFromCoords(8, y)) {
                                this.el.setValueFromCoords(13, y, '', true);
                                this.el.setValueFromCoords(14, y, '', true);
                                this.el.setValueFromCoords(15, y, '', true);
                                this.el.setValueFromCoords(16, y, '', true);
                                this.el.setValueFromCoords(19, y, '', true);
                                alert("Sorry! Suggested order quantity is less than MoQ")
                            } else {
                                this.el.setValueFromCoords(13, y, '', true);
                                this.el.setValueFromCoords(14, y, this.el.getValueFromCoords(7, y), true);
                            }

                        } else if (value == 3) {
                            //MOQ
                            console.log("MOQ-----------");
                            this.el.setValueFromCoords(13, y, '', true);
                            this.el.setValueFromCoords(14, y, this.el.getValueFromCoords(8, y), true);
                            // this.el.setValueFromCoords(14, y, 1, true);

                        }


                    } else {
                        //calculation based on user quantity
                        console.log("ELSE Calculation based on Suggested order quantity");

                        if (roundingOption != "") {
                            //calculation based on Rounding Options

                            //checking the value of dropdown of order based on
                            if (value == 1) {
                                //container

                                var modulus = this.el.getValueFromCoords(13, y) / this.el.getValueFromCoords(24, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }

                                if (roundingOption == 1) {
                                    this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(24, y)), true);
                                } else {
                                    if (parseInt(modulusDown * this.el.getValueFromCoords(24, y)) < this.el.getValueFromCoords(8, y)) {
                                        this.el.setValueFromCoords(14, y, '', true);
                                        this.el.setValueFromCoords(15, y, '', true);
                                        this.el.setValueFromCoords(16, y, '', true);
                                        this.el.setValueFromCoords(19, y, '', true);
                                        alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                    } else {
                                        // this.el.setValueFromCoords(12, y, 1, true);
                                        this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(24, y), true);
                                    }
                                }


                            } else if (value == 4) {
                                //Pallet

                                var modulus = this.el.getValueFromCoords(13, y) / this.el.getValueFromCoords(23, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }

                                if (roundingOption == 1) {
                                    this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(23, y)), true);
                                } else {
                                    if (parseInt(modulusDown * this.el.getValueFromCoords(23, y)) < this.el.getValueFromCoords(8, y)) {
                                        this.el.setValueFromCoords(14, y, '', true);
                                        this.el.setValueFromCoords(15, y, '', true);
                                        this.el.setValueFromCoords(16, y, '', true);
                                        this.el.setValueFromCoords(19, y, '', true);
                                        alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                    } else {
                                        // this.el.setValueFromCoords(12, y, 1, true);
                                        this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(23, y), true);
                                    }
                                }

                            }

                            if (this.el.getValueFromCoords(14, y) != "") {

                                //set adjust pallet and container 
                                this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                            }


                        }

                        if (value == 2) {
                            //suggested order quantity
                            if (this.el.getValueFromCoords(7, y) < this.el.getValueFromCoords(8, y)) {
                                this.el.setValueFromCoords(13, y, '', true);
                                this.el.setValueFromCoords(14, y, '', true);
                                this.el.setValueFromCoords(15, y, '', true);
                                this.el.setValueFromCoords(16, y, '', true);
                                this.el.setValueFromCoords(19, y, '', true);
                                alert("Sorry! Suggested order quantity is less than MoQ")
                            } else {
                                this.el.setValueFromCoords(13, y, '', true);
                                this.el.setValueFromCoords(14, y, this.el.getValueFromCoords(7, y), true);
                            }

                        } else if (value == 3) {
                            //MOQ
                            this.el.setValueFromCoords(13, y, '', true);
                            this.el.setValueFromCoords(14, y, this.el.getValueFromCoords(8, y), true);

                        }

                    }



                    if (this.el.getValueFromCoords(14, y) != "") {

                        //set adjust Amt
                        // this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                        // this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container
                        if (this.el.getValueFromCoords(17, y) != "") {
                            this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(17, y) * this.el.getValueFromCoords(14, y)), true);
                        } else {
                            this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(18, y) * this.el.getValueFromCoords(14, y)), true);
                        }


                    }


                }




            }


            //*************************2222222222222222******************************


            if (x == 12 && isValidForManualPrice && isValidForUserQty) {
                var rowData = this.el.getRowData(y);
                var orderBasedOn = rowData[11];
                var roundingOption = rowData[12];


                if (this.el.getValueFromCoords(13, y) == "") {
                    //Calculation based on Suggested order quantity
                    console.log("IF Calculation based on Suggested order quantity");

                    if (value != "") {
                        //calculation based on Rounding Options
                        console.log("IF calculation based on Rounding Options");

                        //checking the value of dropdown of Rounding Option
                        if (value == 1) {
                            //Rounding Up
                            console.log("Rounding Up--->>>", this.el.getRowData(y));

                            if (orderBasedOn == 1) {
                                //order based on conrainer
                                var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(24, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }
                                console.log("modulusUp--", modulusUp);
                                console.log("modulusDown--", modulusDown);
                                console.log("Result--", parseInt(modulusUp * this.el.getValueFromCoords(24, y)));


                                this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(24, y)), true);


                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust pallet and container 
                                    this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                }


                            } else if (orderBasedOn == 4) {
                                //order based on pallet

                                var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(23, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }


                                this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(23, y)), true);


                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust pallet and container 
                                    this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                }

                            }



                        } else {
                            //Rounding Down
                            console.log("Rounding Down");
                            if (orderBasedOn == 1) {
                                //order based on conrainer

                                var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(24, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }


                                if (parseInt(modulusDown * this.el.getValueFromCoords(24, y)) < this.el.getValueFromCoords(8, y)) {
                                    this.el.setValueFromCoords(14, y, '', true);
                                    this.el.setValueFromCoords(15, y, '', true);
                                    this.el.setValueFromCoords(16, y, '', true);
                                    this.el.setValueFromCoords(19, y, '', true);
                                    alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                } else {
                                    // this.el.setValueFromCoords(12, y, 1, true);
                                    this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(24, y), true);
                                }


                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust pallet and container 
                                    this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                }






                            } else if (orderBasedOn == 4) {
                                //order based on pallet

                                var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(23, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }


                                if (parseInt(modulusDown * this.el.getValueFromCoords(23, y)) < this.el.getValueFromCoords(8, y)) {
                                    this.el.setValueFromCoords(14, y, '', true);
                                    this.el.setValueFromCoords(15, y, '', true);
                                    this.el.setValueFromCoords(16, y, '', true);
                                    this.el.setValueFromCoords(19, y, '', true);
                                    alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                } else {
                                    // this.el.setValueFromCoords(12, y, 1, true);
                                    this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(23, y), true);
                                }


                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust pallet and container 
                                    this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                }



                            }

                        }
                    }
                } else {
                    //Calculation based on user quantity

                    if (value != "") {
                        //calculation based on Rounding Options
                        console.log("IF calculation based on Rounding Options");

                        //checking the value of dropdown of Rounding Option
                        if (value == 1) {
                            //Rounding Up
                            console.log("Rounding Up");

                            if (orderBasedOn == 1) {
                                //order based on conrainer
                                var modulus = this.el.getValueFromCoords(13, y) / this.el.getValueFromCoords(24, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }

                                if (value == 1) {
                                    this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(24, y)), true);
                                }

                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust pallet and container 
                                    this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                }


                            } else if (orderBasedOn == 4) {
                                //order based on pallet

                                var modulus = this.el.getValueFromCoords(13, y) / this.el.getValueFromCoords(23, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }

                                if (value == 1) {
                                    this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(23, y)), true);
                                }

                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust pallet and container 
                                    this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                }

                            }



                        } else {
                            //Rounding Down
                            console.log("Rounding Down");
                            if (orderBasedOn == 1) {
                                //order based on conrainer

                                var modulus = this.el.getValueFromCoords(13, y) / this.el.getValueFromCoords(24, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }
                                console.log("MODULUS UP--------", modulusUp);
                                console.log("MODULUS DOWN-------", modulusDown);
                                console.log("parseInt(modulusDown * this.el.getValueFromCoords(24, y)", parseInt(modulusDown * this.el.getValueFromCoords(24, y)));
                                console.log("this.el.getValueFromCoords(8, y)", this.el.getValueFromCoords(8, y));

                                if (parseInt(modulusDown * this.el.getValueFromCoords(24, y)) < this.el.getValueFromCoords(8, y)) {
                                    console.log("----------IF------------");
                                    this.el.setValueFromCoords(14, y, '', true);
                                    this.el.setValueFromCoords(15, y, '', true);
                                    this.el.setValueFromCoords(16, y, '', true);
                                    this.el.setValueFromCoords(19, y, '', true);
                                    alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                } else {
                                    console.log("----------ELSE------------");
                                    // this.el.setValueFromCoords(12, y, 1, true);
                                    this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(24, y), true);
                                }


                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust pallet and container 
                                    this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                }






                            } else if (orderBasedOn == 4) {
                                //order based on pallet

                                var modulus = this.el.getValueFromCoords(13, y) / this.el.getValueFromCoords(23, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }

                                if (value == 2) {
                                    if (parseInt(modulusDown * this.el.getValueFromCoords(23, y)) < this.el.getValueFromCoords(8, y)) {
                                        this.el.setValueFromCoords(14, y, '', true);
                                        this.el.setValueFromCoords(15, y, '', true);
                                        this.el.setValueFromCoords(16, y, '', true);
                                        this.el.setValueFromCoords(19, y, '', true);
                                        alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                    } else {
                                        // this.el.setValueFromCoords(12, y, 1, true);
                                        this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(23, y), true);
                                    }
                                }

                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust pallet and container 
                                    this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                }



                            }

                        }
                    }



                }

                if (this.el.getValueFromCoords(14, y) != "") {

                    //set adjust Amt
                    // this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                    // this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container
                    if (this.el.getValueFromCoords(17, y) != "") {
                        this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(17, y) * this.el.getValueFromCoords(14, y)), true);
                    } else {
                        this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(18, y) * this.el.getValueFromCoords(14, y)), true);
                    }


                }

            }


            //*************************************333333333333*******************************************

            if (x == 13) {
                var reg = /^[0-9\b]+$/;
                var col = ("N").concat(parseInt(y) + 1);

                var rowData = this.el.getRowData(y);
                var orderBasedOn = rowData[11];
                var roundingOption = rowData[12];


                if (value != "") {
                    if (!(reg.test(value)) || isNaN(value) || value == 0) {
                        // console.log("if----------Problem-------------");
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        isValidForUserQty = false;

                        this.el.setValueFromCoords(14, y, '', true);
                        this.el.setValueFromCoords(15, y, '', true);
                        this.el.setValueFromCoords(16, y, '', true);
                        this.el.setValueFromCoords(19, y, '', true);

                    } else {
                        // console.log("else---------Not a problem------------");
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        isValidForUserQty = true;


                        if (value != "" && isValidForManualPrice && isValidForUserQty) {
                            //Calculation based on user Qty

                            if (roundingOption == 1) {
                                //calculation based on Rounding up


                                if (orderBasedOn == 1) {
                                    //order based on conrainer
                                    var modulus = this.el.getValueFromCoords(13, y) / this.el.getValueFromCoords(24, y);
                                    modulus = parseInt(Math.ceil(modulus));
                                    var modulusUp = modulus;
                                    var modulusDown = modulus - 1;
                                    if (modulusDown == 0) {
                                        modulusDown = 1;
                                    }

                                    this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(24, y)), true);

                                    if (this.el.getValueFromCoords(14, y) != "") {

                                        //set adjust pallet and container 
                                        this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                        this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                    }
                                } else if (orderBasedOn == 4) {
                                    //For pallet
                                    var modulus = this.el.getValueFromCoords(13, y) / this.el.getValueFromCoords(23, y);
                                    modulus = parseInt(Math.ceil(modulus));
                                    var modulusUp = modulus;
                                    var modulusDown = modulus - 1;
                                    if (modulusDown == 0) {
                                        modulusDown = 1;
                                    }

                                    this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(23, y)), true);

                                    if (this.el.getValueFromCoords(14, y) != "") {

                                        //set adjust pallet and container 
                                        this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                        this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                    }

                                }

                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust Amt
                                    // this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    // this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container
                                    if (this.el.getValueFromCoords(17, y) != "") {
                                        this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(17, y) * this.el.getValueFromCoords(14, y)), true);
                                    } else {
                                        this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(18, y) * this.el.getValueFromCoords(14, y)), true);
                                    }

                                }



                            } else {
                                //calculation based on Rounding down

                                if (orderBasedOn == 1) {
                                    //Based on container

                                    var modulus = this.el.getValueFromCoords(13, y) / this.el.getValueFromCoords(24, y);
                                    modulus = parseInt(Math.ceil(modulus));
                                    var modulusUp = modulus;
                                    var modulusDown = modulus - 1;
                                    if (modulusDown == 0) {
                                        modulusDown = 1;
                                    }


                                    if (parseInt(modulusDown * this.el.getValueFromCoords(24, y)) < this.el.getValueFromCoords(8, y)) {
                                        this.el.setValueFromCoords(14, y, '', true);
                                        this.el.setValueFromCoords(15, y, '', true);
                                        this.el.setValueFromCoords(16, y, '', true);
                                        this.el.setValueFromCoords(19, y, '', true);
                                        alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                    } else {
                                        // this.el.setValueFromCoords(12, y, 1, true);
                                        this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(24, y), true);
                                    }


                                    if (this.el.getValueFromCoords(14, y) != "") {

                                        //set adjust pallet and container 
                                        this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                        this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                    }



                                } else if (orderBasedOn == 4) {
                                    //Based on Pallet

                                    var modulus = this.el.getValueFromCoords(13, y) / this.el.getValueFromCoords(23, y);
                                    modulus = parseInt(Math.ceil(modulus));
                                    var modulusUp = modulus;
                                    var modulusDown = modulus - 1;
                                    if (modulusDown == 0) {
                                        modulusDown = 1;
                                    }


                                    if (parseInt(modulusDown * this.el.getValueFromCoords(23, y)) < this.el.getValueFromCoords(8, y)) {
                                        this.el.setValueFromCoords(14, y, '', true);
                                        this.el.setValueFromCoords(15, y, '', true);
                                        this.el.setValueFromCoords(16, y, '', true);
                                        this.el.setValueFromCoords(19, y, '', true);
                                        alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                    } else {
                                        // this.el.setValueFromCoords(12, y, 1, true);
                                        this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(23, y), true);
                                    }


                                    if (this.el.getValueFromCoords(14, y) != "") {

                                        //set adjust pallet and container 
                                        this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                        this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                    }
                                }

                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust Amt
                                    // this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    // this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container
                                    if (this.el.getValueFromCoords(17, y) != "") {
                                        this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(17, y) * this.el.getValueFromCoords(14, y)), true);
                                    } else {
                                        this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(18, y) * this.el.getValueFromCoords(14, y)), true);
                                    }

                                }



                            }

                        } else {
                            //order based on Suggested order quatity

                            if (roundingOption == 1) {
                                //calculation based on Rounding up


                                if (orderBasedOn == 1) {
                                    //order based on conrainer
                                    var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(24, y);
                                    modulus = parseInt(Math.ceil(modulus));
                                    var modulusUp = modulus;
                                    var modulusDown = modulus - 1;
                                    if (modulusDown == 0) {
                                        modulusDown = 1;
                                    }

                                    this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(24, y)), true);

                                    if (this.el.getValueFromCoords(14, y) != "") {

                                        //set adjust pallet and container 
                                        this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                        this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                    }
                                } else if (orderBasedOn == 4) {
                                    //For pallet
                                    var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(23, y);
                                    modulus = parseInt(Math.ceil(modulus));
                                    var modulusUp = modulus;
                                    var modulusDown = modulus - 1;
                                    if (modulusDown == 0) {
                                        modulusDown = 1;
                                    }

                                    this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(23, y)), true);

                                    if (this.el.getValueFromCoords(14, y) != "") {

                                        //set adjust pallet and container 
                                        this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                        this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                    }

                                }

                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust Amt
                                    // this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    // this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container
                                    if (this.el.getValueFromCoords(17, y) != "") {
                                        this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(17, y) * this.el.getValueFromCoords(14, y)), true);
                                    } else {
                                        this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(18, y) * this.el.getValueFromCoords(14, y)), true);
                                    }

                                }



                            } else {
                                //calculation based on Rounding down

                                if (orderBasedOn == 1) {
                                    //Based on container

                                    var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(24, y);
                                    modulus = parseInt(Math.ceil(modulus));
                                    var modulusUp = modulus;
                                    var modulusDown = modulus - 1;
                                    if (modulusDown == 0) {
                                        modulusDown = 1;
                                    }


                                    if (parseInt(modulusDown * this.el.getValueFromCoords(24, y)) < this.el.getValueFromCoords(8, y)) {
                                        this.el.setValueFromCoords(14, y, '', true);
                                        this.el.setValueFromCoords(15, y, '', true);
                                        this.el.setValueFromCoords(16, y, '', true);
                                        this.el.setValueFromCoords(19, y, '', true);
                                        alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                    } else {
                                        // this.el.setValueFromCoords(12, y, 1, true);
                                        this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(24, y), true);
                                    }


                                    if (this.el.getValueFromCoords(14, y) != "") {

                                        //set adjust pallet and container 
                                        this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                        this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                    }



                                } else if (orderBasedOn == 4) {
                                    //Based on Pallet

                                    var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(23, y);
                                    modulus = parseInt(Math.ceil(modulus));
                                    var modulusUp = modulus;
                                    var modulusDown = modulus - 1;
                                    if (modulusDown == 0) {
                                        modulusDown = 1;
                                    }


                                    if (parseInt(modulusDown * this.el.getValueFromCoords(23, y)) < this.el.getValueFromCoords(8, y)) {
                                        this.el.setValueFromCoords(14, y, '', true);
                                        this.el.setValueFromCoords(15, y, '', true);
                                        this.el.setValueFromCoords(16, y, '', true);
                                        this.el.setValueFromCoords(19, y, '', true);
                                        alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                    } else {
                                        // this.el.setValueFromCoords(12, y, 1, true);
                                        this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(23, y), true);
                                    }


                                    if (this.el.getValueFromCoords(14, y) != "") {

                                        //set adjust pallet and container 
                                        this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                        this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                    }
                                }

                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust Amt
                                    // this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    // this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container
                                    if (this.el.getValueFromCoords(17, y) != "") {
                                        this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(17, y) * this.el.getValueFromCoords(14, y)), true);
                                    } else {
                                        this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(18, y) * this.el.getValueFromCoords(14, y)), true);
                                    }

                                }

                            }

                        }

                    }
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    isValidForUserQty = true;


                    if (isValidForManualPrice) {
                        if (roundingOption == 1) {
                            //calculation based on Rounding up


                            if (orderBasedOn == 1) {
                                //order based on conrainer
                                var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(24, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }

                                this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(24, y)), true);

                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust pallet and container 
                                    this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                }
                            } else if (orderBasedOn == 4) {
                                //For pallet
                                var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(23, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }

                                this.el.setValueFromCoords(14, y, parseInt(modulusUp * this.el.getValueFromCoords(23, y)), true);

                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust pallet and container 
                                    this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                }

                            }

                            if (this.el.getValueFromCoords(14, y) != "") {

                                //set adjust Amt
                                // this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                // this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container
                                if (this.el.getValueFromCoords(17, y) != "") {
                                    this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(17, y) * this.el.getValueFromCoords(14, y)), true);
                                } else {
                                    this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(18, y) * this.el.getValueFromCoords(14, y)), true);
                                }

                            }



                        } else {
                            //calculation based on Rounding down

                            if (orderBasedOn == 1) {
                                //Based on container

                                var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(24, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }


                                if (parseInt(modulusDown * this.el.getValueFromCoords(24, y)) < this.el.getValueFromCoords(8, y)) {
                                    this.el.setValueFromCoords(14, y, '', true);
                                    this.el.setValueFromCoords(15, y, '', true);
                                    this.el.setValueFromCoords(16, y, '', true);
                                    this.el.setValueFromCoords(19, y, '', true);
                                    alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                } else {
                                    // this.el.setValueFromCoords(12, y, 1, true);
                                    this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(24, y), true);
                                }


                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust pallet and container 
                                    this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                }



                            } else if (orderBasedOn == 4) {
                                //Based on Pallet

                                var modulus = this.el.getValueFromCoords(7, y) / this.el.getValueFromCoords(23, y);
                                modulus = parseInt(Math.ceil(modulus));
                                var modulusUp = modulus;
                                var modulusDown = modulus - 1;
                                if (modulusDown == 0) {
                                    modulusDown = 1;
                                }


                                if (parseInt(modulusDown * this.el.getValueFromCoords(23, y)) < this.el.getValueFromCoords(8, y)) {
                                    this.el.setValueFromCoords(14, y, '', true);
                                    this.el.setValueFromCoords(15, y, '', true);
                                    this.el.setValueFromCoords(16, y, '', true);
                                    this.el.setValueFromCoords(19, y, '', true);
                                    alert("Sorry! Rounding Down options goes Adjested order quantity below the MoQ.");
                                } else {
                                    // this.el.setValueFromCoords(12, y, 1, true);
                                    this.el.setValueFromCoords(14, y, modulusDown * this.el.getValueFromCoords(23, y), true);
                                }


                                if (this.el.getValueFromCoords(14, y) != "") {

                                    //set adjust pallet and container 
                                    this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                    this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container

                                }
                            }

                            if (this.el.getValueFromCoords(14, y) != "") {

                                //set adjust Amt
                                // this.el.setValueFromCoords(15, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(23, y), true);//set Adjusted pallet
                                // this.el.setValueFromCoords(16, y, this.el.getValueFromCoords(14, y) / this.el.getValueFromCoords(24, y), true);//set Adjusted container
                                if (this.el.getValueFromCoords(17, y) != "") {
                                    this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(17, y) * this.el.getValueFromCoords(14, y)), true);
                                } else {
                                    this.el.setValueFromCoords(19, y, (this.el.getValueFromCoords(18, y) * this.el.getValueFromCoords(14, y)), true);
                                }

                            }

                        }


                    }






                }









            }


            //***********************************************************************************************











            if (x == 17) {
                var col = ("R").concat(parseInt(y) + 1);
                if (value != "") {
                    if (isNaN(value) || value <= 0) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        isValidForManualPrice = false;

                        this.el.setValueFromCoords(14, y, '', true);
                        this.el.setValueFromCoords(15, y, '', true);
                        this.el.setValueFromCoords(16, y, '', true);
                        this.el.setValueFromCoords(19, y, '', true);


                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                        isValidForManualPrice = true;

                        if (this.el.getValueFromCoords(17, y) != "" && this.el.getValueFromCoords(17, y) != 0 && isValidForManualPrice && isValidForUserQty) {
                            this.el.setValueFromCoords(19, y, this.el.getValueFromCoords(17, y) * this.el.getValueFromCoords(14, y), true);
                        } else {
                            this.el.setValueFromCoords(19, y, this.el.getValueFromCoords(18, y) * this.el.getValueFromCoords(14, y), true);
                        }

                    }
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                    isValidForManualPrice = true;

                    if (isValidForUserQty) {
                        this.el.setValueFromCoords(19, y, this.el.getValueFromCoords(18, y) * this.el.getValueFromCoords(14, y), true);
                    }

                }




            }

        }

    }.bind(this)

    checkValidation() {
        var valid = true;
        var json = this.el.getJson();

        // for (var y = 0; y < json.length; y++) {
        //     var col = ("A").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(0, y);
        //     if (value == "Invalid date" || value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //         valid = false;
        //     } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }

        //     var col = ("B").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(1, y);
        //     if (value == "Invalid date" || value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //         valid = false;
        //     } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }

        //     var col = ("C").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(2, y);
        //     if (value === "" || isNaN(Number.parseInt(value))) {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         valid = false;
        //         if (isNaN(Number.parseInt(value))) {
        //             this.el.setComments(col, "in valid number.");
        //         } else {
        //             this.el.setComments(col, "This field is required.");
        //         }
        //     } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }

        //     var col = ("D").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(3, y);
        //     if (value === "" || isNaN(Number.parseInt(value))) {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         if (isNaN(Number.parseInt(value))) {
        //             this.el.setComments(col, "in valid number.");
        //         } else {
        //             this.el.setComments(col, "This field is required.");
        //         }
        //         valid = false;
        //     } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }

        //     var col = ("E").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(4, y);
        //     if (value == "Invalid date" || value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //         valid = false;
        //     } else {
        //         // if (isNaN(Date.parse(value))) {
        //         //     this.el.setStyle(col, "background-color", "transparent");
        //         //     this.el.setStyle(col, "background-color", "yellow");
        //         //     this.el.setComments(col, "In valid Date.");
        //         //     valid = false;
        //         // } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //         // }
        //     }

        //     var col = ("F").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(5, y);
        //     if (value == "Invalid date" || value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //         valid = false;
        //     } else {
        //         // if (isNaN(Date.parse(value))) {
        //         //     this.el.setStyle(col, "background-color", "transparent");
        //         //     this.el.setStyle(col, "background-color", "yellow");
        //         //     this.el.setComments(col, "In valid Date.");
        //         //     valid = false;
        //         // } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //         // }
        //     }

        //     var col = ("G").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(6, y);
        //     if (value == "Invalid date" || value == "") {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setStyle(col, "background-color", "yellow");
        //         this.el.setComments(col, "This field is required.");
        //         valid = false;
        //     } else {
        //         this.el.setStyle(col, "background-color", "transparent");
        //         this.el.setComments(col, "");
        //     }

        // }

        // var shipmentStatusId = document.getElementById('shipmentId').value;
        // if (shipmentStatusId == 1) {
        //     valid = true;
        // } else {
        //     valid = false;
        // }

        return true;
    }
    cancelClicked() {
        this.props.history.push(`/dashboard/` + i18n.t('static.message.cancelled'))
    }
}

