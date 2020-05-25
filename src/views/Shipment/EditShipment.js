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
            countVar: 1,
            planningUnitId: 0,
            rowIndex1: 0,
        }

        // this.getConsumptionData = this.getConsumptionData.bind(this);
        this.saveData = this.saveData.bind(this)
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        // this.formSubmit = this.formSubmit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.backClicked = this.backClicked.bind(this);
        this.getProcurementAgentById = this.getProcurementAgentById.bind(this);
        this.getProcurementUnitById = this.getProcurementUnitById.bind(this);
        this.getSupplierById = this.getSupplierById.bind(this);
        this.getBudgetById = this.getBudgetById.bind(this);
        this.saveBudget = this.saveBudget.bind(this);
        this.checkBudgetValidation = this.checkBudgetValidation.bind(this);
    }

    componentDidMount = function () {
        this.getProcurementAgentById();
        this.getProcurementUnitById();
        this.getSupplierById();
        this.getBudgetById();
        document.getElementById("addButton").style.display = "none";
        let programId = this.props.match.params.programId;
        let shipmentId = this.props.match.params.shipmentId;
        let planningUnitId = this.props.match.params.planningUnitId;
        let filterBy = this.props.match.params.filterBy;
        let startDate = this.props.match.params.startDate;
        let endDate = this.props.match.params.endDate;
        let rowIndex = this.props.match.params.rowIndex;
        this.setState({ programId: programId });
        this.setState({ planningUnitId: planningUnitId });


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

                let shipmentListWithoutFilter = (programJson.shipmentList);

                var shipmentListFilter = [];
                if (shipmentId == 0 || typeof shipmentId == "undefined") {

                    const planningUnitFilterList = shipmentListWithoutFilter.filter(c => c.planningUnit.id == planningUnitId);
                    let dateFilterList = '';
                    if (filterBy == 1) {
                        //Order Date Filter
                        dateFilterList = planningUnitFilterList.filter(c => moment(c.orderedDate).isBetween(startDate, endDate, null, '[)'))
                    } else {
                        //Expected Delivery Date
                        dateFilterList = planningUnitFilterList.filter(c => moment(c.expectedDeliveryDate).isBetween(startDate, endDate, null, '[)'))
                    }
                    console.log("dateFilterList---- ", dateFilterList);
                    // let rowIndexFilterList = [];
                    // for (var y = 0; y < dateFilterList.length; y++) {
                    //     if (y == rowIndex) {
                    //         rowIndexFilterList[0] = dateFilterList[y];
                    //     }
                    // }
                    shipmentListFilter[0] = dateFilterList[rowIndex];
                    console.log("shipmentListFilter---- ", shipmentListFilter);

                    for (var i = 0; i < shipmentListWithoutFilter.length; i++) {

                        if (shipmentListWithoutFilter[i].planningUnit.id == planningUnitId) {

                            if (filterBy == 1) {
                                if (moment(shipmentListWithoutFilter[i].orderedDate).isBetween(startDate, endDate, null, '[)')) {
                                    this.setState({
                                        rowIndex1: i + parseInt(rowIndex)
                                    },
                                        () => {
                                            console.log("WHICH ROW--NON-SHIPMENT-----", this.state.rowIndex1);
                                        })
                                    break;
                                }

                            } else {
                                if (moment(shipmentListWithoutFilter[i].expectedDeliveryDate).isBetween(startDate, endDate, null, '[)')) {
                                    this.setState({
                                        rowIndex1: i + parseInt(rowIndex)
                                    },
                                        () => {
                                            console.log("WHICH ROW--NON-SHIPMENT-----", this.state.rowIndex1);
                                        })
                                    break;
                                }
                            }

                        }

                    }



                } else {
                    shipmentListFilter = (programJson.shipmentList).filter(c => c.shipmentId == shipmentId);
                    for (var i = 0; i < shipmentListWithoutFilter.length; i++) {
                        if (shipmentListWithoutFilter[i].shipmentId == shipmentId) {
                            this.setState({
                                rowIndex1: i
                            },
                                () => {
                                    console.log("WHICH ROW--------", this.state.rowIndex1);
                                })
                        }

                    }


                }
                var shipmentList = '';
                shipmentList = shipmentListFilter[0];
                console.log("shipmentList-------", shipmentList);
                //--------------VariableSec--------------------

                var planningUnit = [];
                var procurementAgent = [];
                var procurementAgentPlanningUnit = [];
                var shipmentStatus = [];
                var nextShipmentAllowedList = [];
                var allowShipStatusList = [];
                var procurementUnit = [];
                var budgetList = [];
                var dataSource = [];
                var supplier = [];
                var programByte = [];
                var elVar = "";
                this.setState({ shipmentStatusId: shipmentList.shipmentStatus.id });
                this.setState({ shipmentList: shipmentList });


                var planningUnitTransaction = db1.transaction(['planningUnit'], 'readwrite');
                var planningUnitOs = planningUnitTransaction.objectStore('planningUnit');
                var planningUnitRequest = planningUnitOs.getAll();

                planningUnitRequest.onsuccess = function (event) {
                    var planningUnitResult = [];
                    planningUnitResult = planningUnitRequest.result;

                    for (var k = 0; k < planningUnitResult.length; k++) {

                        let planningUnitJson = {
                            name: planningUnitResult[k].label.label_en,
                            id: planningUnitResult[k].planningUnitId
                        }
                        planningUnit[k] = planningUnitJson;

                    }

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
                            procurementAgent[k] = procurementAgentJson
                        }


                        var procurementAgentPlanningUnitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                        var procurementAgentPlanningUnitOs = procurementAgentPlanningUnitTransaction.objectStore('procurementAgentPlanningUnit');
                        var procurementAgentPlanningUnitRequest = procurementAgentPlanningUnitOs.getAll();

                        procurementAgentPlanningUnitRequest.onsuccess = function (event) {
                            var procurementAgentPlanningUnitResult = [];
                            procurementAgentPlanningUnitResult = procurementAgentPlanningUnitRequest.result;
                            for (var k = 0; k < procurementAgentPlanningUnitResult.length; k++) {
                                var procurementAgentJson = {
                                    procurementAgentId: procurementAgentPlanningUnitResult[k].procurementAgent.id,
                                    planningUnitId: procurementAgentPlanningUnitResult[k].planningUnit.id,
                                    catalogPrice: procurementAgentPlanningUnitResult[k].catalogPrice,
                                    moq: procurementAgentPlanningUnitResult[k].moq,
                                    unitsPerPallet: procurementAgentPlanningUnitResult[k].unitsPerPallet,
                                    unitsPerContainer: procurementAgentPlanningUnitResult[k].unitsPerContainer
                                }
                                procurementAgentPlanningUnit[k] = procurementAgentJson
                            }


                            var allowShipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                            var allowShipmentStatusOs = allowShipmentStatusTransaction.objectStore('shipmentStatus');
                            var allowShipmentStatusRequest = allowShipmentStatusOs.getAll();


                            allowShipmentStatusRequest.onsuccess = function (event) {
                                var allowShipmentStatusResult = [];
                                allowShipmentStatusResult = allowShipmentStatusRequest.result;
                                for (var k = 0; k < allowShipmentStatusResult.length; k++) {
                                    if (shipmentList.shipmentStatus.id == allowShipmentStatusResult[k].shipmentStatusId) {
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
                                for (var k = 0; k < allowShipmentStatusResult.length; k++) {
                                    var shipmentStatusJson = {
                                        name: allowShipmentStatusResult[k].label.label_en,
                                        id: allowShipmentStatusResult[k].shipmentStatusId
                                    }
                                    shipmentStatus[k] = shipmentStatusJson
                                }

                                var procurementUnitTransaction = db1.transaction(['procurementUnit'], 'readwrite');
                                var procurementUnitOs = procurementUnitTransaction.objectStore('procurementUnit');
                                var procurementUnitRequest = procurementUnitOs.getAll();
                                procurementUnitRequest.onsuccess = function (event) {

                                    var procurementUnitResult = [];
                                    procurementUnitResult = procurementUnitRequest.result;
                                    for (var k = 0; k < procurementUnitResult.length; k++) {
                                        var procurementUnitJson = {
                                            name: procurementUnitResult[k].label.label_en,
                                            id: procurementUnitResult[k].procurementUnitId
                                        }
                                        procurementUnit[k] = procurementUnitJson;
                                    }

                                    var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                                    var budgetOs = budgetTransaction.objectStore('budget');
                                    var budgetRequest = budgetOs.getAll();

                                    budgetRequest.onsuccess = function (event) {
                                        var budgetResult = [];
                                        budgetResult = budgetRequest.result;
                                        for (var k = 0; k < budgetResult.length; k++) {
                                            var budgetObj = {
                                                name: budgetResult[k].label.label_en,
                                                id: budgetResult[k].budgetId
                                            }
                                            budgetList[k] = budgetObj
                                        }

                                        var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                                        var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                                        var dataSourceRequest = dataSourceOs.getAll();

                                        dataSourceRequest.onsuccess = function (event) {
                                            var dataSourceResult = [];
                                            dataSourceResult = dataSourceRequest.result;
                                            for (var k = 0; k < dataSourceResult.length; k++) {
                                                var dataSourceJson = {
                                                    name: dataSourceResult[k].label.label_en,
                                                    id: dataSourceResult[k].dataSourceId
                                                }
                                                dataSource[k] = dataSourceJson
                                            }


                                            var supplierTransaction = db1.transaction(['supplier'], 'readwrite');
                                            var supplierOs = supplierTransaction.objectStore('supplier');
                                            var supplierRequest = supplierOs.getAll();

                                            supplierRequest.onsuccess = function (event) {
                                                var supplierResult = [];
                                                supplierResult = supplierRequest.result;
                                                for (var k = 0; k < supplierResult.length; k++) {
                                                    var supplierJson = {
                                                        name: supplierResult[k].label.label_en,
                                                        id: supplierResult[k].supplierId
                                                    }
                                                    supplier[k] = supplierJson;
                                                }

                                                var programTransaction1 = db1.transaction(['program'], 'readwrite');
                                                var programOs1 = programTransaction1.objectStore('program');
                                                var programRequest1 = programOs1.getAll();

                                                programRequest1.onsuccess = function (event) {

                                                    var expectedDeliveryInDays = 0;
                                                    var programResult = [];
                                                    programResult = programRequest1.result;

                                                    for (var k = 0; k < programResult.length; k++) {
                                                        if (programResult[k].programId == (this.props.match.params.programId).split("_")[0]) {
                                                            expectedDeliveryInDays = parseInt(programResult[k].plannedToDraftLeadTime) + parseInt(programResult[k].draftToSubmittedLeadTime) + parseInt(programResult[k].submittedToApprovedLeadTime) + parseInt(programResult[k].approvedToShippedLeadTime) + parseInt(programResult[k].deliveredToReceivedLeadTime);
                                                            var programByteJson = {
                                                                airFreightPerc: programResult[k].airFreightPerc,
                                                                seaFreightPerc: programResult[k].seaFreightPerc
                                                            }
                                                            programByte = programByteJson
                                                        }
                                                    }


                                                    // console.log("procurementAgent--  ", procurementAgent);
                                                    var procurementAgentDuplicateList = procurementAgentPlanningUnit.filter(p => p.planningUnitId == shipmentList.planningUnit.id);
                                                    // console.log("procurementAgentDuplicateList--  ", procurementAgentDuplicateList);
                                                    var procurementAgentUniqueIdList = procurementAgentDuplicateList.filter((v, i, a) => a.indexOf(v) === i);
                                                    // console.log("procurementAgentUniqueIdList--  ", procurementAgentUniqueIdList);

                                                    // var procurementAgentPerPlanningUnit = procurementAgent.filter(p => p.id == procurementAgentUniqueIdList.procurementAgentId);
                                                    // console.log('procurementAgentPerPlanningUnit-- ', procurementAgentPerPlanningUnit);

                                                    var procurementAgentPerPlanningUnit = [];
                                                    let flag = 0;
                                                    for (var i = 0; i < procurementAgent.length; i++) {
                                                        for (var j = 0; j < procurementAgentUniqueIdList.length; j++) {
                                                            if (procurementAgent[i].id == procurementAgentUniqueIdList[j].procurementAgentId) {
                                                                procurementAgentPerPlanningUnit[flag] = procurementAgent[i];
                                                                flag++;
                                                            }
                                                        }
                                                    }
                                                    // console.log('procurementAgentPerPlanningUnit-- ', procurementAgentPerPlanningUnit);


                                                    var procurementAgentPlanningUnitObj = procurementAgentPlanningUnit.filter(p => p.procurementAgentId == shipmentList.procurementAgent.id && p.planningUnitId == shipmentList.planningUnit.id)[0];

                                                    if (shipmentList.shipmentStatus.id == 2) {//planned


                                                        document.getElementById("addButton").style.display = "block";
                                                        this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                                                        this.el.destroy();

                                                        var data = [];
                                                        var shipmentDataArr = [];
                                                        var i = 0;

                                                        var budgetAmount = 0;
                                                        var budgetJson = [];
                                                        var shipmentBudgetList = shipmentList.shipmentBudgetList;
                                                        for (var sb = 0; sb < shipmentBudgetList.length; sb++) {
                                                            budgetAmount += (shipmentBudgetList[sb].budgetAmt * shipmentBudgetList[sb].conversionRateToUsd);
                                                            budgetJson.push(shipmentBudgetList[sb]);
                                                        }
                                                        budgetAmount = budgetAmount.toFixed(2);


                                                        if (procurementAgentPlanningUnitObj == "" || procurementAgentPlanningUnitObj === undefined) {
                                                            // console.log("UNDEFINE-----------------");
                                                            procurementAgentPlanningUnitObj = {
                                                                procurementAgentId: 0,
                                                                planningUnitId: planningUnitId,
                                                                catalogPrice: 0,
                                                                moq: 0,
                                                                unitsPerPallet: 0,
                                                                unitsPerContainer: 0
                                                            }
                                                        }


                                                        // console.log("budgetAmount--- ", budgetAmount);
                                                        // console.log("budgetJson--- ", budgetJson);
                                                        data[0] = shipmentList.expectedDeliveryDate;
                                                        data[1] = shipmentList.shipmentStatus.id;
                                                        data[2] = shipmentList.orderNo;
                                                        data[3] = shipmentList.primeLineNo;
                                                        data[4] = shipmentList.dataSource.id; // E
                                                        data[5] = shipmentList.procurementAgent.id;
                                                        data[6] = shipmentList.planningUnit.id;
                                                        data[7] = shipmentList.suggestedQty;
                                                        data[8] = procurementAgentPlanningUnitObj.moq;
                                                        data[9] = `=IF(H${i + 1}>I${i + 1},H${i + 1}/Z${i + 1},I${i + 1}/Z${i + 1})`;
                                                        data[10] = `=IF(H${i + 1}>I${i + 1},H${i + 1}/AA${i + 1},I${i + 1}/AA${i + 1})`;
                                                        data[11] = ""; // Order based on
                                                        data[12] = ""; // Rounding option
                                                        data[13] = shipmentList.quantity; // User Qty
                                                        data[14] = `=IF(L${i + 1}==3,
   
                                                        IF(M${i + 1}==1,
                                                                CEILING(I${i + 1},1),
                                                                FLOOR(I${i + 1},1)
                                                        )
                                                ,
                                                IF(L${i + 1}==4,
                                                        IF(NOT(ISBLANK(N${i + 1})),
                                                                IF(M${i + 1}==1,
                                                                        CEILING(N${i + 1}/Z${i + 1},1)*Z${i + 1},
                                                                        FLOOR(N${i + 1}/Z${i + 1},1)*Z${i + 1}
                                                                ),
                                                                IF(M${i + 1}==1,
                                                                        CEILING(J${i + 1},1)*Z${i + 1},
                                                                        FLOOR(J${i + 1},1)*Z${i + 1}
                                                                )
                                                        ),
                                                        IF(L${i + 1}==1,
                                                                IF(NOT(ISBLANK(N${i + 1})),
                                                                        IF(M${i + 1}==1,
                                                                        CEILING(N${i + 1}/Z${i + 1},1)*AA${i + 1},
                                                                        FLOOR(N${i + 1}/Z${i + 1},1)*AA${i + 1}
                                                                ),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(K${i + 1},1)*AA${i + 1},
                                                                                FLOOR(K${i + 1},1)*AA${i + 1}
                                                                        )
                                                                ),
                                                                IF(NOT(ISBLANK(N${i + 1})),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(N${i + 1},1),
                                                                                FLOOR(N${i + 1},1)
                                                                        ),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(H${i + 1},1),
                                                                                FLOOR(H${i + 1},1)
                                                                        )
                                                                )
                                                        )
                                                )
                                         )`;
                                                        data[15] = `=O${i + 1}/Z${i + 1}`;
                                                        data[16] = `=O${i + 1}/AA${i + 1}`;
                                                        data[17] = "";//Manual price
                                                        data[18] = procurementAgentPlanningUnitObj.catalogPrice;
                                                        data[19] = `=ROUND(S${i + 1}*O${i + 1},2)`; //Amount
                                                        data[20] = shipmentList.shipmentMode;//Shipment method
                                                        data[21] = shipmentList.freightCost;// Freight Cost
                                                        data[22] = `=IF(U${i + 1}=="Sea",(T${i + 1}*AC${i + 1})/100,(T${i + 1}*AB${i + 1})/100)`;// Default frieght cost
                                                        data[23] = `=ROUND(T${i + 1}+W${i + 1},2)`; // Final Amount
                                                        data[24] = shipmentList.notes;//Notes
                                                        data[25] = procurementAgentPlanningUnitObj.unitsPerPallet;
                                                        data[26] = procurementAgentPlanningUnitObj.unitsPerContainer;
                                                        data[27] = programByte.airFreightPerc;
                                                        data[28] = programByte.seaFreightPerc;
                                                        data[29] = budgetAmount;
                                                        data[30] = budgetJson;
                                                        data[31] = rowIndex;
                                                        data[32] = '';

                                                        shipmentDataArr[0] = data;

                                                        var json = [];
                                                        var data = shipmentDataArr;

                                                        var options = {
                                                            data: data,
                                                            columnDrag: true,
                                                            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                                            columns: [
                                                                { type: 'text', readOnly: true, options: { format: 'MM-DD-YYYY' }, title: "Expected Delivery date" },
                                                                { type: 'dropdown', readOnly: true, title: "Shipment status", source: shipmentStatus },
                                                                { type: 'text', title: "Order No" },
                                                                { type: 'text', title: "Prime line number" },
                                                                { type: 'dropdown', title: "Data source", source: dataSource },
                                                                { type: 'dropdown', title: "Procurement Agent", source: procurementAgentPerPlanningUnit },
                                                                { type: 'dropdown', readOnly: true, title: "Planning unit", source: planningUnit },
                                                                { type: 'number', title: "Suggested order qty" },
                                                                { type: 'number', readOnly: true, title: "MoQ" },
                                                                { type: 'number', readOnly: true, title: "No of pallets" },
                                                                { type: 'number', readOnly: true, title: "No of containers" },
                                                                { type: 'dropdown', title: "Order based on", source: [{ id: 1, name: 'Container' }, { id: 2, name: 'Suggested Order Qty' }, { id: 3, name: 'MoQ' }, { id: 4, name: 'Pallet' }] },
                                                                { type: 'dropdown', title: "Rounding option", source: [{ id: 1, name: 'Round Up' }, { id: 2, name: 'Round Down' }] },
                                                                { type: 'text', title: "User qty" },
                                                                { type: 'text', readOnly: true, title: "Adjusted order qty" },
                                                                { type: 'text', readOnly: true, title: "Adjusted pallets" },
                                                                { type: 'text', readOnly: true, title: "Adjusted containers" },
                                                                { type: 'text', title: "Manual price per planning unit" },
                                                                { type: 'text', readOnly: true, title: "Price per planning unit" },
                                                                { type: 'text', readOnly: true, title: "Amount" },
                                                                { type: 'dropdown', title: "Shipped method", source: ['Sea', 'Air'] },
                                                                { type: 'text', title: "Freight cost amount" },
                                                                { type: 'text', readOnly: true, title: "Default freight cost" },
                                                                { type: 'text', readOnly: true, title: "Total amount" },
                                                                { type: 'text', title: "Notes" },
                                                                { type: 'hidden', title: "Units/Pallet" },
                                                                { type: 'hidden', title: "Units/Container" },
                                                                { type: 'hidden', title: "Air Freight Percentage" },
                                                                { type: 'hidden', title: "Sea Freight Percentage" },
                                                                { type: 'hidden', title: 'Budget Amount' },
                                                                { type: 'hidden', title: "Budget Array" },
                                                                { type: 'hidden', title: 'index' },
                                                                { type: 'checkbox', title: 'Cancelled Order' }
                                                            ],
                                                            pagination: 10,
                                                            search: true,
                                                            columnSorting: true,
                                                            tableOverflow: true,
                                                            wordWrap: true,
                                                            allowInsertColumn: false,
                                                            allowManualInsertColumn: false,
                                                            allowDeleteRow: false,
                                                            onchange: this.plannedPsmChanged,
                                                            oneditionend: this.onedit,
                                                            copyCompatibility: true,
                                                            paginationOptions: [10, 25, 50, 100],
                                                            position: 'top',
                                                            contextMenu: function (obj, x, y, e) {
                                                                var items = [];
                                                                //Add Shipment Budget
                                                                items.push({
                                                                    title: "List / Add shipment budget",
                                                                    onclick: function () {
                                                                        document.getElementById("showButtonsDiv").style.display = 'block';
                                                                        this.el = jexcel(document.getElementById("shipmentBudgetTable"), '');
                                                                        this.el.destroy();
                                                                        var json = [];
                                                                        // var elInstance=this.state.plannedPsmShipmentsEl;
                                                                        var rowData = obj.getRowData(y)
                                                                        console.log("RowData", rowData);
                                                                        var shipmentBudget = rowData[30];
                                                                        console.log("Shipemnt Budget", shipmentBudget);
                                                                        for (var sb = 0; sb < shipmentBudget.length; sb++) {
                                                                            var data = [];
                                                                            data[0] = shipmentBudget[sb].shipmentBudgetId;
                                                                            data[1] = shipmentBudget[sb].budget.budgetId;
                                                                            data[2] = shipmentBudget[sb].budgetAmt;
                                                                            data[3] = shipmentBudget[sb].conversionRateToUsd;
                                                                            data[4] = y;
                                                                            json.push(data);
                                                                        }
                                                                        if (shipmentBudget.length == 0) {
                                                                            var data = [];
                                                                            data[0] = "";
                                                                            data[1] = "";
                                                                            data[2] = "";
                                                                            data[3] = "";
                                                                            data[4] = y;
                                                                            json = [data]
                                                                        }
                                                                        var options = {
                                                                            data: json,
                                                                            columnDrag: true,
                                                                            colWidths: [290, 290, 170, 170],
                                                                            columns: [

                                                                                {
                                                                                    title: 'Shipment Budget Id',
                                                                                    type: 'hidden',
                                                                                },
                                                                                {
                                                                                    title: 'Budget',
                                                                                    type: 'dropdown',
                                                                                    source: budgetList
                                                                                },
                                                                                {
                                                                                    title: 'Budget Amount',
                                                                                    type: 'number',
                                                                                },
                                                                                {
                                                                                    title: 'Conversion rate to USD',
                                                                                    type: 'number'
                                                                                },
                                                                                {
                                                                                    title: 'Row number',
                                                                                    type: 'hidden'
                                                                                }
                                                                            ],
                                                                            pagination: false,
                                                                            search: true,
                                                                            columnSorting: true,
                                                                            tableOverflow: true,
                                                                            wordWrap: true,
                                                                            allowInsertColumn: false,
                                                                            allowManualInsertColumn: false,
                                                                            allowDeleteRow: false,
                                                                            oneditionend: this.onedit,
                                                                            copyCompatibility: true,
                                                                            // editable: false
                                                                            onchange: this.budgetChanged

                                                                        };
                                                                        elVar = jexcel(document.getElementById("shipmentBudgetTable"), options);
                                                                        this.el = elVar;
                                                                        this.setState({ shipmentBudgetTableEl: elVar });
                                                                    }.bind(this)
                                                                    // this.setState({ shipmentBudgetTableEl: elVar });
                                                                });
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
                                                                            title: obj.options.text.insertANewRowBefore,
                                                                            onclick: function () {
                                                                                obj.insertRow(1, parseInt(y), 1);
                                                                            }
                                                                        });

                                                                        items.push({
                                                                            title: obj.options.text.insertANewRowAfter,
                                                                            onclick: function () {
                                                                                obj.insertRow(1, parseInt(y));
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
                                                                        title: obj.options.text.saveAs,
                                                                        shortcut: 'Ctrl + S',
                                                                        onclick: function () {
                                                                            obj.download();
                                                                        }
                                                                    });
                                                                }

                                                                // About
                                                                if (obj.options.about) {
                                                                    items.push({
                                                                        title: obj.options.text.about,
                                                                        onclick: function () {
                                                                            alert(obj.options.about);
                                                                        }
                                                                    });
                                                                }
                                                                return items;
                                                            }.bind(this)














                                                        };

                                                        // this.el = jexcel(document.getElementById("shipmenttableDiv"), options);

                                                        var shipmentEL = jexcel(document.getElementById("shipmenttableDiv"), options);

                                                        this.el = shipmentEL;

                                                        this.setState({
                                                            shipmentEL: shipmentEL
                                                        })




                                                    } else if (shipmentList.shipmentStatus.id == 7) {//cancelled

                                                        document.getElementById("addButton").style.display = "none";
                                                        this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                                                        this.el.destroy();

                                                        var data = [];
                                                        var shipmentDataArr = [];
                                                        var i = 0;

                                                        var budgetAmount = 0;
                                                        var budgetJson = [];
                                                        var shipmentBudgetList = shipmentList.shipmentBudgetList;
                                                        for (var sb = 0; sb < shipmentBudgetList.length; sb++) {
                                                            budgetAmount += (shipmentBudgetList[sb].budgetAmt * shipmentBudgetList[sb].conversionRateToUsd);
                                                            budgetJson.push(shipmentBudgetList[sb]);
                                                        }
                                                        budgetAmount = budgetAmount.toFixed(2);

                                                        // console.log("procurementAgentPlanningUnitObj------", procurementAgentPlanningUnitObj);
                                                        if (procurementAgentPlanningUnitObj == "" || procurementAgentPlanningUnitObj === undefined) {
                                                            // console.log("UNDEFINE-----------------");
                                                            procurementAgentPlanningUnitObj = {
                                                                procurementAgentId: 0,
                                                                planningUnitId: planningUnitId,
                                                                catalogPrice: 0,
                                                                moq: 0,
                                                                unitsPerPallet: 0,
                                                                unitsPerContainer: 0
                                                            }
                                                        }

                                                        // console.log("budgetAmount--- ", budgetAmount);
                                                        // console.log("budgetJson--- ", budgetJson);
                                                        data[0] = shipmentList.expectedDeliveryDate;
                                                        data[1] = shipmentList.shipmentStatus.id;
                                                        data[2] = shipmentList.orderNo;
                                                        data[3] = shipmentList.primeLineNo;
                                                        data[4] = shipmentList.dataSource.id; // E
                                                        data[5] = shipmentList.procurementAgent.id;
                                                        data[6] = shipmentList.planningUnit.id;
                                                        data[7] = shipmentList.suggestedQty;
                                                        data[8] = procurementAgentPlanningUnitObj.moq;
                                                        data[9] = `=IF(H${i + 1}>I${i + 1},H${i + 1}/Z${i + 1},I${i + 1}/Z${i + 1})`;
                                                        data[10] = `=IF(H${i + 1}>I${i + 1},H${i + 1}/AA${i + 1},I${i + 1}/AA${i + 1})`;
                                                        data[11] = ""; // Order based on
                                                        data[12] = ""; // Rounding option
                                                        data[13] = shipmentList.quantity; // User Qty
                                                        data[14] = `=IF(L${i + 1}==3,
   
                                                        IF(M${i + 1}==1,
                                                                CEILING(I${i + 1},1),
                                                                FLOOR(I${i + 1},1)
                                                        )
                                                ,
                                                IF(L${i + 1}==4,
                                                        IF(NOT(ISBLANK(N${i + 1})),
                                                                IF(M${i + 1}==1,
                                                                        CEILING(N${i + 1}/Z${i + 1},1)*Z${i + 1},
                                                                        FLOOR(N${i + 1}/Z${i + 1},1)*Z${i + 1}
                                                                ),
                                                                IF(M${i + 1}==1,
                                                                        CEILING(J${i + 1},1)*Z${i + 1},
                                                                        FLOOR(J${i + 1},1)*Z${i + 1}
                                                                )
                                                        ),
                                                        IF(L${i + 1}==1,
                                                                IF(NOT(ISBLANK(N${i + 1})),
                                                                        IF(M${i + 1}==1,
                                                                        CEILING(N${i + 1}/Z${i + 1},1)*AA${i + 1},
                                                                        FLOOR(N${i + 1}/Z${i + 1},1)*AA${i + 1}
                                                                ),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(K${i + 1},1)*AA${i + 1},
                                                                                FLOOR(K${i + 1},1)*AA${i + 1}
                                                                        )
                                                                ),
                                                                IF(NOT(ISBLANK(N${i + 1})),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(N${i + 1},1),
                                                                                FLOOR(N${i + 1},1)
                                                                        ),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(H${i + 1},1),
                                                                                FLOOR(H${i + 1},1)
                                                                        )
                                                                )
                                                        )
                                                )
                                         )`;
                                                        data[15] = `=O${i + 1}/Z${i + 1}`;
                                                        data[16] = `=O${i + 1}/AA${i + 1}`;
                                                        data[17] = "";//Manual price
                                                        data[18] = procurementAgentPlanningUnitObj.catalogPrice;
                                                        data[19] = `=ROUND(S${i + 1}*O${i + 1},2)`; //Amount
                                                        data[20] = shipmentList.shipmentMode;//Shipment method
                                                        data[21] = shipmentList.freightCost;// Freight Cost
                                                        data[22] = `=IF(U${i + 1}=="Sea",(T${i + 1}*AC${i + 1})/100,(T${i + 1}*AB${i + 1})/100)`;// Default frieght cost
                                                        data[23] = `=ROUND(T${i + 1}+W${i + 1},2)`; // Final Amount
                                                        data[24] = shipmentList.notes;//Notes
                                                        data[25] = procurementAgentPlanningUnitObj.unitsPerPallet;
                                                        data[26] = procurementAgentPlanningUnitObj.unitsPerContainer;
                                                        data[27] = programByte.airFreightPerc;
                                                        data[28] = programByte.seaFreightPerc;
                                                        data[29] = budgetAmount;
                                                        data[30] = budgetJson;
                                                        data[31] = true;
                                                        data[32] = rowIndex;

                                                        shipmentDataArr[0] = data;

                                                        var json = [];
                                                        var data = shipmentDataArr;

                                                        var options = {
                                                            data: data,
                                                            columnDrag: true,
                                                            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                                            columns: [
                                                                { type: 'text', readOnly: true, options: { format: 'MM-DD-YYYY' }, title: "Expected Delivery date" },
                                                                { type: 'dropdown', readOnly: true, title: "Shipment status", source: shipmentStatus },
                                                                { type: 'text', title: "Order No" },
                                                                { type: 'text', title: "Prime line number" },
                                                                { type: 'dropdown', readOnly: true, title: "Data source", source: dataSource },
                                                                { type: 'dropdown', readOnly: true, title: "Procurement Agent", source: procurementAgentPerPlanningUnit },
                                                                { type: 'dropdown', readOnly: true, title: "Planning unit", source: planningUnit },
                                                                { type: 'number', readOnly: true, title: "Suggested order qty" },
                                                                { type: 'number', readOnly: true, title: "MoQ" },
                                                                { type: 'number', readOnly: true, title: "No of pallets" },
                                                                { type: 'number', readOnly: true, title: "No of containers" },
                                                                { type: 'dropdown', readOnly: true, title: "Order based on", source: [{ id: 1, name: 'Container' }, { id: 2, name: 'Suggested Order Qty' }, { id: 3, name: 'MoQ' }, { id: 4, name: 'Pallet' }] },
                                                                { type: 'dropdown', readOnly: true, title: "Rounding option", source: [{ id: 1, name: 'Round Up' }, { id: 2, name: 'Round Down' }] },
                                                                { type: 'text', readOnly: true, title: "User qty" },
                                                                { type: 'text', readOnly: true, title: "Adjusted order qty" },
                                                                { type: 'text', readOnly: true, title: "Adjusted pallets" },
                                                                { type: 'text', readOnly: true, title: "Adjusted containers" },
                                                                { type: 'text', readOnly: true, title: "Manual price per planning unit" },
                                                                { type: 'text', readOnly: true, title: "Price per planning unit" },
                                                                { type: 'text', readOnly: true, title: "Amount" },
                                                                { type: 'dropdown', readOnly: true, title: "Shipped method", source: ['Sea', 'Air'] },
                                                                { type: 'text', title: "Freight cost amount" },
                                                                { type: 'text', readOnly: true, title: "Default freight cost" },
                                                                { type: 'text', readOnly: true, title: "Total amount" },
                                                                { type: 'text', readOnly: true, title: "Notes" },
                                                                { type: 'hidden', title: "Units/Pallet" },
                                                                { type: 'hidden', title: "Units/Container" },
                                                                { type: 'hidden', title: "Air Freight Percentage" },
                                                                { type: 'hidden', title: "Sea Freight Percentage" },
                                                                { type: 'hidden', title: 'Budget Amount' },
                                                                { type: 'hidden', title: "Budget Array" },
                                                                { type: 'checkbox', title: "Cancelled Order" },
                                                                { type: 'hidden', title: 'index' },
                                                            ],
                                                            pagination: 10,
                                                            search: true,
                                                            columnSorting: true,
                                                            tableOverflow: true,
                                                            wordWrap: true,
                                                            allowInsertColumn: false,
                                                            allowManualInsertColumn: false,
                                                            allowDeleteRow: false,
                                                            // onchange: this.plannedPsmChanged,
                                                            oneditionend: this.onedit,
                                                            copyCompatibility: true,
                                                            paginationOptions: [10, 25, 50, 100],
                                                            position: 'top',
                                                        };

                                                        this.el = jexcel(document.getElementById("shipmenttableDiv"), options);


                                                    } else if (shipmentList.shipmentStatus.id == 3 && shipmentList.procurementAgent.id != 1) {//submitted

                                                        //submitted-notpsm

                                                        document.getElementById("addButton").style.display = "none";
                                                        this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                                                        this.el.destroy();

                                                        var data = [];
                                                        var shipmentDataArr = [];
                                                        var i = 0;

                                                        var budgetAmount = 0;
                                                        var budgetJson = [];
                                                        var shipmentBudgetList = shipmentList.shipmentBudgetList;
                                                        for (var sb = 0; sb < shipmentBudgetList.length; sb++) {
                                                            budgetAmount += (shipmentBudgetList[sb].budgetAmt * shipmentBudgetList[sb].conversionRateToUsd);
                                                            budgetJson.push(shipmentBudgetList[sb]);
                                                        }
                                                        budgetAmount = budgetAmount.toFixed(2);

                                                        // console.log("budgetAmount--- ", budgetAmount);
                                                        // console.log("budgetJson--- ", budgetJson);
                                                        data[0] = shipmentList.expectedDeliveryDate;
                                                        data[1] = shipmentList.shipmentStatus.id;
                                                        data[2] = shipmentList.orderNo;
                                                        data[3] = shipmentList.primeLineNo;
                                                        data[4] = shipmentList.dataSource.id; // E
                                                        data[5] = shipmentList.procurementAgent.id;
                                                        data[6] = shipmentList.planningUnit.id;
                                                        data[7] = shipmentList.suggestedQty;
                                                        data[8] = procurementAgentPlanningUnitObj.moq;
                                                        data[9] = `=IF(H${i + 1}>I${i + 1},H${i + 1}/Z${i + 1},I${i + 1}/Z${i + 1})`;
                                                        data[10] = `=IF(H${i + 1}>I${i + 1},H${i + 1}/AA${i + 1},I${i + 1}/AA${i + 1})`;
                                                        data[11] = ""; // Order based on
                                                        data[12] = ""; // Rounding option
                                                        data[13] = shipmentList.quantity; // User Qty
                                                        data[14] = `=IF(L${i + 1}==3,
   
                                                        IF(M${i + 1}==1,
                                                                CEILING(I${i + 1},1),
                                                                FLOOR(I${i + 1},1)
                                                        )
                                                ,
                                                IF(L${i + 1}==4,
                                                        IF(NOT(ISBLANK(N${i + 1})),
                                                                IF(M${i + 1}==1,
                                                                        CEILING(N${i + 1}/Z${i + 1},1)*Z${i + 1},
                                                                        FLOOR(N${i + 1}/Z${i + 1},1)*Z${i + 1}
                                                                ),
                                                                IF(M${i + 1}==1,
                                                                        CEILING(J${i + 1},1)*Z${i + 1},
                                                                        FLOOR(J${i + 1},1)*Z${i + 1}
                                                                )
                                                        ),
                                                        IF(L${i + 1}==1,
                                                                IF(NOT(ISBLANK(N${i + 1})),
                                                                        IF(M${i + 1}==1,
                                                                        CEILING(N${i + 1}/Z${i + 1},1)*AA${i + 1},
                                                                        FLOOR(N${i + 1}/Z${i + 1},1)*AA${i + 1}
                                                                ),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(K${i + 1},1)*AA${i + 1},
                                                                                FLOOR(K${i + 1},1)*AA${i + 1}
                                                                        )
                                                                ),
                                                                IF(NOT(ISBLANK(N${i + 1})),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(N${i + 1},1),
                                                                                FLOOR(N${i + 1},1)
                                                                        ),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(H${i + 1},1),
                                                                                FLOOR(H${i + 1},1)
                                                                        )
                                                                )
                                                        )
                                                )
                                         )`;
                                                        data[15] = `=O${i + 1}/Z${i + 1}`;
                                                        data[16] = `=O${i + 1}/AA${i + 1}`;
                                                        data[17] = "";//Manual price
                                                        data[18] = procurementAgentPlanningUnitObj.catalogPrice;
                                                        data[19] = `=ROUND(S${i + 1}*O${i + 1},2)`; //Amount
                                                        data[20] = shipmentList.shipmentMode;//Shipment method
                                                        data[21] = shipmentList.freightCost;// Freight Cost
                                                        data[22] = `=IF(U${i + 1}=="Sea",(T${i + 1}*AC${i + 1})/100,(T${i + 1}*AB${i + 1})/100)`;// Default frieght cost
                                                        data[23] = `=ROUND(T${i + 1}+W${i + 1},2)`; // Final Amount
                                                        data[24] = shipmentList.notes;//Notes
                                                        data[25] = procurementAgentPlanningUnitObj.unitsPerPallet;
                                                        data[26] = procurementAgentPlanningUnitObj.unitsPerContainer;
                                                        data[27] = programByte.airFreightPerc;
                                                        data[28] = programByte.seaFreightPerc;
                                                        data[29] = budgetAmount;
                                                        data[30] = budgetJson;
                                                        data[31] = rowIndex;
                                                        data[32] = '';
                                                        data[33] = '';

                                                        shipmentDataArr[0] = data;

                                                        var json = [];
                                                        var data = shipmentDataArr;

                                                        var options = {
                                                            data: data,
                                                            columnDrag: true,
                                                            colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                                            columns: [
                                                                { type: 'text', readOnly: true, options: { format: 'MM-DD-YYYY' }, title: "Expected Delivery date" },
                                                                { type: 'dropdown', title: "Shipment status", source: allowShipStatusList },
                                                                { type: 'text', readOnly: true, title: "Order No" },
                                                                { type: 'text', readOnly: true, title: "Prime line number" },
                                                                { type: 'dropdown', readOnly: true, title: "Data source", source: dataSource },
                                                                { type: 'dropdown', readOnly: true, title: "Procurement Agent", source: procurementAgentPerPlanningUnit },
                                                                { type: 'dropdown', readOnly: true, title: "Planning unit", source: planningUnit },
                                                                { type: 'number', readOnly: true, title: "Suggested order qty" },
                                                                { type: 'number', readOnly: true, title: "MoQ" },
                                                                { type: 'number', readOnly: true, title: "No of pallets" },
                                                                { type: 'number', readOnly: true, title: "No of containers" },
                                                                { type: 'dropdown', readOnly: true, title: "Order based on", source: [{ id: 1, name: 'Container' }, { id: 2, name: 'Suggested Order Qty' }, { id: 3, name: 'MoQ' }, { id: 4, name: 'Pallet' }] },
                                                                { type: 'dropdown', readOnly: true, title: "Rounding option", source: [{ id: 1, name: 'Round Up' }, { id: 2, name: 'Round Down' }] },
                                                                { type: 'text', readOnly: true, title: "User qty" },
                                                                { type: 'text', readOnly: true, title: "Adjusted order qty" },
                                                                { type: 'text', readOnly: true, title: "Adjusted pallets" },
                                                                { type: 'text', readOnly: true, title: "Adjusted containers" },
                                                                { type: 'text', readOnly: true, title: "Manual price per planning unit" },
                                                                { type: 'text', readOnly: true, title: "Price per planning unit" },
                                                                { type: 'text', readOnly: true, title: "Amount" },
                                                                { type: 'dropdown', readOnly: true, title: "Shipped method", source: ['Sea', 'Air'] },
                                                                { type: 'text', readOnly: true, title: "Freight cost amount" },
                                                                { type: 'text', readOnly: true, title: "Default freight cost" },
                                                                { type: 'text', readOnly: true, title: "Total amount" },
                                                                { type: 'text', readOnly: true, title: "Notes" },
                                                                { type: 'hidden', title: "Units/Pallet" },
                                                                { type: 'hidden', title: "Units/Container" },
                                                                { type: 'hidden', title: "Air Freight Percentage" },
                                                                { type: 'hidden', title: "Sea Freight Percentage" },
                                                                { type: 'hidden', title: 'Budget Amount' },
                                                                { type: 'hidden', title: "Budget Array" },
                                                                { type: 'hidden', title: 'index' },
                                                                { type: 'dropdown', title: "Procurement Unit", source: procurementUnit },
                                                                { type: 'dropdown', title: "Supplier", source: supplier },
                                                            ],
                                                            pagination: 10,
                                                            search: true,
                                                            columnSorting: true,
                                                            tableOverflow: true,
                                                            wordWrap: true,
                                                            allowInsertColumn: false,
                                                            allowManualInsertColumn: false,
                                                            allowDeleteRow: false,
                                                            // onchange: this.plannedPsmChanged,
                                                            oneditionend: this.onedit,
                                                            copyCompatibility: true,
                                                            paginationOptions: [10, 25, 50, 100],
                                                            position: 'top',
                                                        };

                                                        this.el = jexcel(document.getElementById("shipmenttableDiv"), options);






                                                    } else if (shipmentList.shipmentStatus.id == 3 || shipmentList.shipmentStatus.id == 4 || shipmentList.shipmentStatus.id == 5 || shipmentList.shipmentStatus.id == 6) {

                                                        if (shipmentList.procurementAgent.id == 1) {//approved-psm

                                                            document.getElementById("addButton").style.display = "none";
                                                            this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                                                            this.el.destroy();

                                                            var data = [];
                                                            var shipmentDataArr = [];
                                                            var i = 0;

                                                            var budgetAmount = 0;
                                                            var budgetJson = [];
                                                            var shipmentBudgetList = shipmentList.shipmentBudgetList;
                                                            for (var sb = 0; sb < shipmentBudgetList.length; sb++) {
                                                                budgetAmount += (shipmentBudgetList[sb].budgetAmt * shipmentBudgetList[sb].conversionRateToUsd);
                                                                budgetJson.push(shipmentBudgetList[sb]);
                                                            }
                                                            budgetAmount = budgetAmount.toFixed(2);

                                                            // console.log("budgetAmount--- ", budgetAmount);
                                                            // console.log("budgetJson--- ", budgetJson);
                                                            data[0] = shipmentList.expectedDeliveryDate;
                                                            data[1] = shipmentList.shipmentStatus.id;
                                                            data[2] = shipmentList.orderNo;
                                                            data[3] = shipmentList.primeLineNo;
                                                            data[4] = shipmentList.dataSource.id; // E
                                                            data[5] = shipmentList.procurementAgent.id;
                                                            data[6] = shipmentList.planningUnit.id;
                                                            data[7] = shipmentList.suggestedQty;
                                                            data[8] = procurementAgentPlanningUnitObj.moq;
                                                            data[9] = `=IF(H${i + 1}>I${i + 1},H${i + 1}/Z${i + 1},I${i + 1}/Z${i + 1})`;
                                                            data[10] = `=IF(H${i + 1}>I${i + 1},H${i + 1}/AA${i + 1},I${i + 1}/AA${i + 1})`;
                                                            data[11] = ""; // Order based on
                                                            data[12] = ""; // Rounding option
                                                            data[13] = shipmentList.quantity; // User Qty
                                                            data[14] = `=IF(L${i + 1}==3,
   
                                                        IF(M${i + 1}==1,
                                                                CEILING(I${i + 1},1),
                                                                FLOOR(I${i + 1},1)
                                                        )
                                                ,
                                                IF(L${i + 1}==4,
                                                        IF(NOT(ISBLANK(N${i + 1})),
                                                                IF(M${i + 1}==1,
                                                                        CEILING(N${i + 1}/Z${i + 1},1)*Z${i + 1},
                                                                        FLOOR(N${i + 1}/Z${i + 1},1)*Z${i + 1}
                                                                ),
                                                                IF(M${i + 1}==1,
                                                                        CEILING(J${i + 1},1)*Z${i + 1},
                                                                        FLOOR(J${i + 1},1)*Z${i + 1}
                                                                )
                                                        ),
                                                        IF(L${i + 1}==1,
                                                                IF(NOT(ISBLANK(N${i + 1})),
                                                                        IF(M${i + 1}==1,
                                                                        CEILING(N${i + 1}/Z${i + 1},1)*AA${i + 1},
                                                                        FLOOR(N${i + 1}/Z${i + 1},1)*AA${i + 1}
                                                                ),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(K${i + 1},1)*AA${i + 1},
                                                                                FLOOR(K${i + 1},1)*AA${i + 1}
                                                                        )
                                                                ),
                                                                IF(NOT(ISBLANK(N${i + 1})),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(N${i + 1},1),
                                                                                FLOOR(N${i + 1},1)
                                                                        ),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(H${i + 1},1),
                                                                                FLOOR(H${i + 1},1)
                                                                        )
                                                                )
                                                        )
                                                )
                                         )`;
                                                            data[15] = `=O${i + 1}/Z${i + 1}`;
                                                            data[16] = `=O${i + 1}/AA${i + 1}`;
                                                            data[17] = "";//Manual price
                                                            data[18] = procurementAgentPlanningUnitObj.catalogPrice;
                                                            data[19] = `=ROUND(S${i + 1}*O${i + 1},2)`; //Amount
                                                            data[20] = shipmentList.shipmentMode;//Shipment method
                                                            data[21] = shipmentList.freightCost;// Freight Cost
                                                            data[22] = `=IF(U${i + 1}=="Sea",(T${i + 1}*AC${i + 1})/100,(T${i + 1}*AB${i + 1})/100)`;// Default frieght cost
                                                            data[23] = `=ROUND(T${i + 1}+W${i + 1},2)`; // Final Amount
                                                            data[24] = shipmentList.notes;//Notes
                                                            data[25] = procurementAgentPlanningUnitObj.unitsPerPallet;
                                                            data[26] = procurementAgentPlanningUnitObj.unitsPerContainer;
                                                            data[27] = programByte.airFreightPerc;
                                                            data[28] = programByte.seaFreightPerc;
                                                            data[29] = budgetAmount;
                                                            data[30] = budgetJson;
                                                            data[31] = rowIndex;

                                                            shipmentDataArr[0] = data;

                                                            var json = [];
                                                            var data = shipmentDataArr;

                                                            var options = {
                                                                data: data,
                                                                columnDrag: true,
                                                                colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                                                columns: [
                                                                    { type: 'text', readOnly: true, options: { format: 'MM-DD-YYYY' }, title: "Expected Delivery date" },
                                                                    { type: 'dropdown', readOnly: true, title: "Shipment status", source: shipmentStatus },
                                                                    { type: 'text', readOnly: true, title: "Order No" },
                                                                    { type: 'text', readOnly: true, title: "Prime line number" },
                                                                    { type: 'dropdown', readOnly: true, title: "Data source", source: dataSource },
                                                                    { type: 'dropdown', readOnly: true, title: "Procurement Agent", source: procurementAgentPerPlanningUnit },
                                                                    { type: 'dropdown', readOnly: true, title: "Planning unit", source: planningUnit },
                                                                    { type: 'number', readOnly: true, title: "Suggested order qty" },
                                                                    { type: 'number', readOnly: true, title: "MoQ" },
                                                                    { type: 'number', readOnly: true, title: "No of pallets" },
                                                                    { type: 'number', readOnly: true, title: "No of containers" },
                                                                    { type: 'dropdown', readOnly: true, title: "Order based on", source: [{ id: 1, name: 'Container' }, { id: 2, name: 'Suggested Order Qty' }, { id: 3, name: 'MoQ' }, { id: 4, name: 'Pallet' }] },
                                                                    { type: 'dropdown', readOnly: true, title: "Rounding option", source: [{ id: 1, name: 'Round Up' }, { id: 2, name: 'Round Down' }] },
                                                                    { type: 'text', readOnly: true, title: "User qty" },
                                                                    { type: 'text', readOnly: true, title: "Adjusted order qty" },
                                                                    { type: 'text', readOnly: true, title: "Adjusted pallets" },
                                                                    { type: 'text', readOnly: true, title: "Adjusted containers" },
                                                                    { type: 'text', readOnly: true, title: "Manual price per planning unit" },
                                                                    { type: 'text', readOnly: true, title: "Price per planning unit" },
                                                                    { type: 'text', readOnly: true, title: "Amount" },
                                                                    { type: 'dropdown', readOnly: true, title: "Shipped method", source: ['Sea', 'Air'] },
                                                                    { type: 'text', readOnly: true, title: "Freight cost amount" },
                                                                    { type: 'text', readOnly: true, title: "Default freight cost" },
                                                                    { type: 'text', readOnly: true, title: "Total amount" },
                                                                    { type: 'text', readOnly: true, title: "Notes" },
                                                                    { type: 'hidden', title: "Units/Pallet" },
                                                                    { type: 'hidden', title: "Units/Container" },
                                                                    { type: 'hidden', title: "Air Freight Percentage" },
                                                                    { type: 'hidden', title: "Sea Freight Percentage" },
                                                                    { type: 'hidden', title: 'Budget Amount' },
                                                                    { type: 'hidden', title: "Budget Array" },
                                                                    { type: 'hidden', title: 'index' },
                                                                ],
                                                                pagination: 10,
                                                                search: true,
                                                                columnSorting: true,
                                                                tableOverflow: true,
                                                                wordWrap: true,
                                                                allowInsertColumn: false,
                                                                allowManualInsertColumn: false,
                                                                allowDeleteRow: false,
                                                                // onchange: this.plannedPsmChanged,
                                                                oneditionend: this.onedit,
                                                                copyCompatibility: true,
                                                                paginationOptions: [10, 25, 50, 100],
                                                                position: 'top',
                                                            };

                                                            this.el = jexcel(document.getElementById("shipmenttableDiv"), options);





                                                        } else {//approved-notpsm


                                                            document.getElementById("addButton").style.display = "none";
                                                            this.el = jexcel(document.getElementById("shipmenttableDiv"), '');
                                                            this.el.destroy();

                                                            var data = [];
                                                            var shipmentDataArr = [];
                                                            var i = 0;

                                                            var budgetAmount = 0;
                                                            var budgetJson = [];
                                                            var shipmentBudgetList = shipmentList.shipmentBudgetList;
                                                            for (var sb = 0; sb < shipmentBudgetList.length; sb++) {
                                                                budgetAmount += (shipmentBudgetList[sb].budgetAmt * shipmentBudgetList[sb].conversionRateToUsd);
                                                                budgetJson.push(shipmentBudgetList[sb]);
                                                            }
                                                            budgetAmount = budgetAmount.toFixed(2);

                                                            // console.log("budgetAmount--- ", budgetAmount);
                                                            // console.log("budgetJson--- ", budgetJson);
                                                            data[0] = shipmentList.expectedDeliveryDate;
                                                            data[1] = shipmentList.shipmentStatus.id;
                                                            data[2] = shipmentList.orderNo;
                                                            data[3] = shipmentList.primeLineNo;
                                                            data[4] = shipmentList.dataSource.id; // E
                                                            data[5] = shipmentList.procurementAgent.id;
                                                            data[6] = shipmentList.planningUnit.id;
                                                            data[7] = shipmentList.suggestedQty;
                                                            data[8] = procurementAgentPlanningUnitObj.moq;
                                                            data[9] = `=IF(H${i + 1}>I${i + 1},H${i + 1}/Z${i + 1},I${i + 1}/Z${i + 1})`;
                                                            data[10] = `=IF(H${i + 1}>I${i + 1},H${i + 1}/AA${i + 1},I${i + 1}/AA${i + 1})`;
                                                            data[11] = ""; // Order based on
                                                            data[12] = ""; // Rounding option
                                                            data[13] = shipmentList.quantity; // User Qty
                                                            data[14] = `=IF(L${i + 1}==3,
   
                                                        IF(M${i + 1}==1,
                                                                CEILING(I${i + 1},1),
                                                                FLOOR(I${i + 1},1)
                                                        )
                                                ,
                                                IF(L${i + 1}==4,
                                                        IF(NOT(ISBLANK(N${i + 1})),
                                                                IF(M${i + 1}==1,
                                                                        CEILING(N${i + 1}/Z${i + 1},1)*Z${i + 1},
                                                                        FLOOR(N${i + 1}/Z${i + 1},1)*Z${i + 1}
                                                                ),
                                                                IF(M${i + 1}==1,
                                                                        CEILING(J${i + 1},1)*Z${i + 1},
                                                                        FLOOR(J${i + 1},1)*Z${i + 1}
                                                                )
                                                        ),
                                                        IF(L${i + 1}==1,
                                                                IF(NOT(ISBLANK(N${i + 1})),
                                                                        IF(M${i + 1}==1,
                                                                        CEILING(N${i + 1}/Z${i + 1},1)*AA${i + 1},
                                                                        FLOOR(N${i + 1}/Z${i + 1},1)*AA${i + 1}
                                                                ),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(K${i + 1},1)*AA${i + 1},
                                                                                FLOOR(K${i + 1},1)*AA${i + 1}
                                                                        )
                                                                ),
                                                                IF(NOT(ISBLANK(N${i + 1})),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(N${i + 1},1),
                                                                                FLOOR(N${i + 1},1)
                                                                        ),
                                                                        IF(M${i + 1}==1,
                                                                                CEILING(H${i + 1},1),
                                                                                FLOOR(H${i + 1},1)
                                                                        )
                                                                )
                                                        )
                                                )
                                         )`;
                                                            data[15] = `=O${i + 1}/Z${i + 1}`;
                                                            data[16] = `=O${i + 1}/AA${i + 1}`;
                                                            data[17] = "";//Manual price
                                                            data[18] = procurementAgentPlanningUnitObj.catalogPrice;
                                                            data[19] = `=ROUND(S${i + 1}*O${i + 1},2)`; //Amount
                                                            data[20] = shipmentList.shipmentMode;//Shipment method
                                                            data[21] = shipmentList.freightCost;// Freight Cost
                                                            data[22] = `=IF(U${i + 1}=="Sea",(T${i + 1}*AC${i + 1})/100,(T${i + 1}*AB${i + 1})/100)`;// Default frieght cost
                                                            data[23] = `=ROUND(T${i + 1}+W${i + 1},2)`; // Final Amount
                                                            data[24] = shipmentList.notes;//Notes
                                                            data[25] = procurementAgentPlanningUnitObj.unitsPerPallet;
                                                            data[26] = procurementAgentPlanningUnitObj.unitsPerContainer;
                                                            data[27] = programByte.airFreightPerc;
                                                            data[28] = programByte.seaFreightPerc;
                                                            data[29] = budgetAmount;
                                                            data[30] = budgetJson;
                                                            data[31] = rowIndex;

                                                            shipmentDataArr[0] = data;

                                                            var json = [];
                                                            var data = shipmentDataArr;

                                                            var options = {
                                                                data: data,
                                                                columnDrag: true,
                                                                colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                                                columns: [
                                                                    { type: 'text', readOnly: true, options: { format: 'MM-DD-YYYY' }, title: "Expected Delivery date" },
                                                                    { type: 'dropdown', title: "Shipment status", source: allowShipStatusList },
                                                                    { type: 'text', readOnly: true, title: "Order No" },
                                                                    { type: 'text', readOnly: true, title: "Prime line number" },
                                                                    { type: 'dropdown', readOnly: true, title: "Data source", source: dataSource },
                                                                    { type: 'dropdown', readOnly: true, title: "Procurement Agent", source: procurementAgentPerPlanningUnit },
                                                                    { type: 'dropdown', readOnly: true, title: "Planning unit", source: planningUnit },
                                                                    { type: 'number', readOnly: true, title: "Suggested order qty" },
                                                                    { type: 'number', readOnly: true, title: "MoQ" },
                                                                    { type: 'number', readOnly: true, title: "No of pallets" },
                                                                    { type: 'number', readOnly: true, title: "No of containers" },
                                                                    { type: 'dropdown', readOnly: true, title: "Order based on", source: [{ id: 1, name: 'Container' }, { id: 2, name: 'Suggested Order Qty' }, { id: 3, name: 'MoQ' }, { id: 4, name: 'Pallet' }] },
                                                                    { type: 'dropdown', readOnly: true, title: "Rounding option", source: [{ id: 1, name: 'Round Up' }, { id: 2, name: 'Round Down' }] },
                                                                    { type: 'text', readOnly: true, title: "User qty" },
                                                                    { type: 'text', readOnly: true, title: "Adjusted order qty" },
                                                                    { type: 'text', readOnly: true, title: "Adjusted pallets" },
                                                                    { type: 'text', readOnly: true, title: "Adjusted containers" },
                                                                    { type: 'text', readOnly: true, title: "Manual price per planning unit" },
                                                                    { type: 'text', readOnly: true, title: "Price per planning unit" },
                                                                    { type: 'text', readOnly: true, title: "Amount" },
                                                                    { type: 'dropdown', readOnly: true, title: "Shipped method", source: ['Sea', 'Air'] },
                                                                    { type: 'text', readOnly: true, title: "Freight cost amount" },
                                                                    { type: 'text', readOnly: true, title: "Default freight cost" },
                                                                    { type: 'text', readOnly: true, title: "Total amount" },
                                                                    { type: 'text', readOnly: true, title: "Notes" },
                                                                    { type: 'hidden', title: "Units/Pallet" },
                                                                    { type: 'hidden', title: "Units/Container" },
                                                                    { type: 'hidden', title: "Air Freight Percentage" },
                                                                    { type: 'hidden', title: "Sea Freight Percentage" },
                                                                    { type: 'hidden', title: 'Budget Amount' },
                                                                    { type: 'hidden', title: "Budget Array" },
                                                                    { type: 'hidden', title: 'index' },
                                                                ],
                                                                pagination: 10,
                                                                search: true,
                                                                columnSorting: true,
                                                                tableOverflow: true,
                                                                wordWrap: true,
                                                                allowInsertColumn: false,
                                                                allowManualInsertColumn: false,
                                                                allowDeleteRow: false,
                                                                // onchange: this.plannedPsmChanged,
                                                                oneditionend: this.onedit,
                                                                copyCompatibility: true,
                                                                paginationOptions: [10, 25, 50, 100],
                                                                position: 'top',
                                                            };

                                                            this.el = jexcel(document.getElementById("shipmenttableDiv"), options);

                                                        }
                                                    }

                                                }.bind(this);
                                            }.bind(this);
                                        }.bind(this);
                                    }.bind(this);
                                }.bind(this);
                            }.bind(this);
                        }.bind(this);
                    }.bind(this);
                }.bind(this);



            }.bind(this);
        }.bind(this);


    }

    budgetChanged = function (instance, cell, x, y, value) {
        this.setState({
            budgetChangedFlag: 1
        })
        var elInstance = instance.jexcel;
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
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
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }
        }

        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }
        }
    }.bind(this);

    // Final validations for Budget
    checkBudgetValidation() {
        var valid = true;
        var elInstance = this.state.shipmentBudgetTableEl;
        var json = elInstance.getJson();
        for (var y = 0; y < json.length; y++) {
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
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }

            var col = ("D").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(3, y);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }

        }
        return valid;
    }

    // Budget Save
    saveBudget() {

        var validation = this.checkBudgetValidation()
        if (validation == true) {
            var elInstance = this.state.shipmentBudgetTableEl;
            console.log(elInstance);
            var json = elInstance.getJson();
            var budgetArray = [];
            var rowNumber = 0;
            var totalBudget = 0;
            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                var budgetJson = {
                    shipmentBudgetId: map.get("0"),
                    budget: {
                        budgetId: map.get("1")
                    },
                    active: true,
                    budgetAmt: map.get('2'),
                    conversionRateToUsd: map.get("3"),
                }
                budgetArray.push(budgetJson);
                totalBudget += map.get('2') * map.get("3");
                if (i == 0) {
                    rowNumber = map.get("4");
                }
            }
            var shipmentInstance = this.state.shipmentEL;

            console.log("shipmentInstance----- ", shipmentInstance);
            console.log("rowNumber==== ", rowNumber);



            shipmentInstance.setValueFromCoords(29, rowNumber, totalBudget, true)
            shipmentInstance.setValueFromCoords(30, rowNumber, budgetArray, true)
            this.setState({
                plannedPsmChangedFlag: 1,
                budgetChangedFlag: 0
            })
            document.getElementById("showButtonsDiv").style.display = 'none';
            elInstance.destroy();
        } else {
            alert("Budget Save fail validation");
        }
    }

    addRow = function () {
        // document.getElementById("saveButtonDiv").style.display = "block";
        var procurementAgentList = [];
        var fundingSourceList = [];
        var budgetList = [];
        var shipmentStatusList = [];
        let planningUnitList = [];
        let procurementAgentPlanningList = [];
        var dataSourceList = [];
        var programByteList = '';
        var planningUnitObj = '';

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
                        var programByteJson = {
                            airFreightPerc: programResult[k].airFreightPerc,
                            seaFreightPerc: programResult[k].seaFreightPerc
                        }
                        programByteList = programByteJson
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
                                            id: planningUnitResult[k].planningUnitId
                                        }
                                        planningUnitObj = planningUnitJson;

                                    }
                                }

                                this.setState({ planningUnitObj: planningUnitObj });

                                let procurementAgentPlanningUnitTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                                let procurementAgentPlanningUnitOs = procurementAgentPlanningUnitTransaction.objectStore('procurementAgentPlanningUnit');
                                let procurementAgentPlanningUnitRequest = procurementAgentPlanningUnitOs.getAll();

                                procurementAgentPlanningUnitRequest.onsuccess = function (event) {

                                    var procurementAgentPlanningUnitResult = [];
                                    procurementAgentPlanningUnitResult = procurementAgentPlanningUnitRequest.result;
                                    for (var k = 0; k < procurementAgentPlanningUnitResult.length; k++) {
                                        if (procurementAgentPlanningUnitResult[k].planningUnit.id == this.props.match.params.planningUnitId) {
                                            var procurementAgentJson = {
                                                procurementAgentId: procurementAgentPlanningUnitResult[k].procurementAgent.id,
                                                planningUnitId: procurementAgentPlanningUnitResult[k].planningUnit.id,
                                                catalogPrice: procurementAgentPlanningUnitResult[k].catalogPrice,
                                                moq: procurementAgentPlanningUnitResult[k].moq,
                                                unitsPerPallet: procurementAgentPlanningUnitResult[k].unitsPerPallet,
                                                unitsPerContainer: procurementAgentPlanningUnitResult[k].unitsPerContainer
                                            }
                                            procurementAgentPlanningList[0] = procurementAgentJson
                                        }
                                    }

                                    var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                                    var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                                    var dataSourceRequest = dataSourceOs.getAll();

                                    dataSourceRequest.onsuccess = function (event) {
                                        var dataSourceResult = [];
                                        dataSourceResult = dataSourceRequest.result;
                                        for (var k = 0; k < dataSourceResult.length; k++) {
                                            var dataSourceJson = {
                                                name: dataSourceResult[k].label.label_en,
                                                id: dataSourceResult[k].dataSourceId
                                            }
                                            dataSourceList[k] = dataSourceJson
                                        }

                                        let i = this.state.countVar;
                                        var budgetAmount = 0;
                                        var budgetJson = [];
                                        var data = [];
                                        data[0] = expectedDeliveryDate;//a
                                        data[1] = 2;//b
                                        data[2] = '';//c
                                        data[3] = '';//d
                                        data[4] = '';//e
                                        data[5] = '';//f
                                        data[6] = this.props.match.params.planningUnitId;//g
                                        data[7] = '';//h
                                        data[8] = '';//i
                                        data[9] = `=IF(H${i + 1}>I${i + 1},H${i + 1}/Z${i + 1},I${i + 1}/Z${i + 1})`;
                                        data[10] = `=IF(H${i + 1}>I${i + 1},H${i + 1}/AA${i + 1},I${i + 1}/AA${i + 1})`;
                                        data[11] = '';
                                        data[12] = '';
                                        data[13] = '';
                                        data[14] = `=IF(L${i + 1}==3,
   
                                            IF(M${i + 1}==1,
                                                    CEILING(I${i + 1},1),
                                                    FLOOR(I${i + 1},1)
                                            )
                                    ,
                                    IF(L${i + 1}==4,
                                            IF(NOT(ISBLANK(N${i + 1})),
                                                    IF(M${i + 1}==1,
                                                            CEILING(N${i + 1}/Z${i + 1},1)*Z${i + 1},
                                                            FLOOR(N${i + 1}/Z${i + 1},1)*Z${i + 1}
                                                    ),
                                                    IF(M${i + 1}==1,
                                                            CEILING(J${i + 1},1)*Z${i + 1},
                                                            FLOOR(J${i + 1},1)*Z${i + 1}
                                                    )
                                            ),
                                            IF(L${i + 1}==1,
                                                    IF(NOT(ISBLANK(N${i + 1})),
                                                            IF(M${i + 1}==1,
                                                            CEILING(N${i + 1}/Z${i + 1},1)*AA${i + 1},
                                                            FLOOR(N${i + 1}/Z${i + 1},1)*AA${i + 1}
                                                    ),
                                                            IF(M${i + 1}==1,
                                                                    CEILING(K${i + 1},1)*AA${i + 1},
                                                                    FLOOR(K${i + 1},1)*AA${i + 1}
                                                            )
                                                    ),
                                                    IF(NOT(ISBLANK(N${i + 1})),
                                                            IF(M${i + 1}==1,
                                                                    CEILING(N${i + 1},1),
                                                                    FLOOR(N${i + 1},1)
                                                            ),
                                                            IF(M${i + 1}==1,
                                                                    CEILING(H${i + 1},1),
                                                                    FLOOR(H${i + 1},1)
                                                            )
                                                    )
                                            )
                                    )
                             )`;
                                        data[15] = `=O${i + 1}/Z${i + 1}`;
                                        data[16] = `=O${i + 1}/AA${i + 1}`;
                                        data[17] = "";//Manual price
                                        data[18] = '';
                                        data[19] = `=ROUND(S${i + 1}*O${i + 1},2)`; //Amount
                                        data[20] = "";//Shipment method
                                        data[21] = "";// Freight Cost
                                        data[22] = `=IF(U${i + 1}=="Sea",(T${i + 1}*AC${i + 1})/100,(T${i + 1}*AB${i + 1})/100)`;// Default frieght cost
                                        data[23] = `=ROUND(T${i + 1}+W${i + 1},2)`; // Final Amount
                                        data[24] = "";//Notes
                                        data[25] = '';
                                        data[26] = '';
                                        data[27] = programByteList.airFreightPerc;
                                        data[28] = programByteList.seaFreightPerc;
                                        data[29] = budgetAmount;
                                        data[30] = budgetJson;
                                        data[31] = -1;
                                        data[32] = false;

                                        this.setState({
                                            countVar: i++
                                        })

                                        var elInstance = this.state.shipmentEL;

                                        elInstance.insertRow(
                                            data
                                        );

                                    }.bind(this)
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
        var someFormattedDate = y + '-' + mm + '-' + dd;
        console.log("someFormattedDate-------", someFormattedDate);
        return someFormattedDate;
    }.bind(this)

    saveData = function () {

        var validation = this.checkValidation();
        // var validation = true;
        if (validation == true) {
            this.setState(
                {
                    changedFlag: 0
                }
            );
            console.log("all good...", this.el.getJson());
            let shipmentId = this.props.match.params.shipmentId;
            let planningUnitId = this.props.match.params.planningUnitId;
            let filterBy = this.props.match.params.filterBy;
            let startDate = this.props.match.params.startDate;
            let endDate = this.props.match.params.endDate;
            let rowIndex = this.props.match.params.rowIndex;
            let programId = this.props.match.params.programId;

            let rowIndex1 = this.state.rowIndex1;

            var elInstance = this.state.shipmentEL;
            var tableJson = elInstance.getJson();
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');

                var programRequest = programTransaction.get(programId);
                programRequest.onsuccess = function (event) {

                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);

                    var shipmentDataList = [];
                    if (shipmentId == 0 || typeof shipmentId == "undefined") {
                        const planningUnitFilterList = (programJson.shipmentList).filter(c => c.planningUnit.id == planningUnitId);

                        let dateFilterList = '';
                        if (filterBy == 1) {
                            //Order Date Filter
                            dateFilterList = planningUnitFilterList.filter(c => moment(c.orderedDate).isBetween(startDate, endDate, null, '[)'))
                        } else {
                            //Expected Delivery Date
                            dateFilterList = planningUnitFilterList.filter(c => moment(c.expectedDeliveryDate).isBetween(startDate, endDate, null, '[)'))
                        }

                        let rowIndexFilterList = [];
                        for (var y = 0; y < dateFilterList.length; y++) {
                            if (y == rowIndex) {
                                rowIndexFilterList[0] = dateFilterList[y];
                            }
                        }

                        shipmentDataList = rowIndexFilterList;
                    } else {
                        shipmentDataList = (programJson.shipmentList).filter(c => c.shipmentId == shipmentId);
                    }

                    console.log("shipmentDataList[0].shipmentStatus.id----", shipmentDataList[0].shipmentStatus.id);
                    let shipmentDataListNotFiltered = (programJson.shipmentList);

                    if (shipmentDataList[0].shipmentStatus.id == 2) {

                        for (var i = 0; i < shipmentDataList.length; i++) {
                            var map = new Map(Object.entries(tableJson[i]));
                            if (map.get("32") == false || map.get("32") == 'false') {

                                var quantity = (elInstance.getCell(`O${i}`)).innerHTML;
                                var productCost = (elInstance.getCell(`T${i}`)).innerHTML;
                                var rate = (elInstance.getCell(`S${i}`)).innerHTML;
                                var freightCost = (elInstance.getCell(`W${i}`)).innerHTML;

                                shipmentDataListNotFiltered[parseInt(rowIndex1)].shipmentStatus.id = 3;
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].shipmentStatus.label.label_en = 'Submitted';
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].orderNo = map.get("2");
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].primeLineNo = map.get("3");
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].dataSource.id = map.get("4");
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].procurementAgent.id = map.get("5");
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].suggestedQty = map.get("7");
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].quantity = quantity;
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].rate = rate;
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].shipmentMode = map.get("20");
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].freightCost = freightCost;
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].notes = map.get("24");

                            } else {
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].shipmentStatus.id = 7;
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].shipmentStatus.label.label_en = 'Cancelled';
                            }

                        }

                        for (var i = shipmentDataList.length; i < tableJson.length; i++) {
                            var map = new Map(Object.entries(tableJson[i]))
                            let shipId = 0;
                            let shipLabel = '';
                            if (map.get("32") == false || map.get("32") == 'false') {
                                shipId = 3;
                                shipLabel = 'Submitted';
                            } else {
                                shipId = 7;
                                shipLabel = 'Cancelled';
                            }


                            var json = {
                                shipmentId: 0,
                                planningUnit: {
                                    id: planningUnitId,
                                    label: {
                                        label_en: this.state.planningUnitObj.name
                                    }
                                },
                                expectedDeliveryDate: moment(map.get("0")).format("YYYY-MM-DD"),
                                suggestedQty: map.get("7"),
                                procurementAgent: {
                                    id: map.get("5"),
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
                                shipmentMode: map.get("20"),
                                freightCost: map.get("21"),
                                orderedDate: moment(new Date()).format("YYYY-MM-DD"),
                                shippedDate: '',
                                receivedDate: '',
                                shipmentStatus: {
                                    id: shipId,
                                    label: {
                                        label_en: shipLabel
                                    }
                                },
                                notes: map.get("24"),
                                dataSource: {
                                    id: map.get("4")
                                },
                                accountFlag: '',
                                erpFlag: '',
                                orderNo: map.get("2"),
                                primeLineNo: map.get("3"),
                                versionId: 1,
                                shipmentBudgetList: map.get("30"),
                                active: true
                            }
                            // shipmentDataList.push(json);
                            shipmentDataListNotFiltered.push(json);
                            console.log("JSON---- ", json);
                        }

                    } else if (shipmentDataList[0].shipmentStatus.id == 7) {

                        for (var i = 0; i < shipmentDataList.length; i++) {
                            var map = new Map(Object.entries(tableJson[i]));

                            if (map.get("31") == false || map.get("31") == "false") {
                                console.log("rowIndex---", rowIndex1);

                                shipmentDataListNotFiltered[parseInt(rowIndex1)].shipmentStatus.id = 2;
                                shipmentDataListNotFiltered[parseInt(rowIndex1)].shipmentStatus.label.label_en = 'Planned';
                            }
                        }

                    } else if (shipmentDataList[0].shipmentStatus.id == 3 && shipmentDataList[0].procurementAgent.id != 1) {

                        for (var i = 0; i < shipmentDataList.length; i++) {
                            var map = new Map(Object.entries(tableJson[i]));
                            let shipmentLabel = '';
                            if (map.get("1") == 3) {
                                shipmentLabel = 'Submitted';
                            } else if (map.get("1") == 4) {
                                shipmentLabel = 'Approved';
                            } else if (map.get("1") == 5) {
                                shipmentLabel = 'Shipped';
                            } else if (map.get("1") == 6) {
                                shipmentLabel = 'Delivered';
                            }

                            shipmentDataListNotFiltered[parseInt(rowIndex1)].shipmentStatus.id = map.get("1");
                            shipmentDataListNotFiltered[parseInt(rowIndex1)].shipmentStatus.label.label_en = shipmentLabel;
                            shipmentDataListNotFiltered[parseInt(rowIndex1)].procurementUnit.id = map.get("32");
                            shipmentDataListNotFiltered[parseInt(rowIndex1)].supplier.id = map.get("33");
                        }

                    } else if ((shipmentDataList[0].shipmentStatus.id == 4 || shipmentDataList[0].shipmentStatus.id == 5 || shipmentDataList[0].shipmentStatus.id == 6) && shipmentDataList[0].procurementAgent.id != 1) {

                        for (var i = 0; i < shipmentDataList.length; i++) {
                            var map = new Map(Object.entries(tableJson[i]));

                            let shipmentLabel = '';
                            if (map.get("1") == 3) {
                                shipmentLabel = 'Submitted';
                            } else if (map.get("1") == 4) {
                                shipmentLabel = 'Approved';
                            } else if (map.get("1") == 5) {
                                shipmentLabel = 'Shipped';
                            } else if (map.get("1") == 6) {
                                shipmentLabel = 'Delivered';
                            }

                            shipmentDataListNotFiltered[parseInt(rowIndex1)].shipmentStatus.id = map.get("1");
                            shipmentDataListNotFiltered[parseInt(rowIndex1)].shipmentStatus.label.label_en = shipmentLabel;
                        }
                    }


                    // console.log("1111111111111111111   ", consumptionDataList)
                    console.log("shipmentDataListNotFiltered---", shipmentDataListNotFiltered);
                    programJson.shipmentList = shipmentDataListNotFiltered;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        // Handle errors!
                    };
                    putRequest.onsuccess = function (event) {
                        // $("#saveButtonDiv").hide();
                        this.setState({
                            message: 'static.message.shipmentSaved',
                            changedFlag: 0
                        })
                        // this.props.history.push(`/consumptionDetails/${document.getElementById('programId').value}/${document.getElementById("planningUnitId").value}/` + i18n.t('static.message.consumptionSuccess'))
                        this.props.history.push(`/shipment/ShipmentList/` + i18n.t('static.message.shipmentSaved'));
                        // this.props.history.push(`/consumptionDetails/` + i18n.t('static.message.consumptionSuccess'));
                    }.bind(this)
                }.bind(this)
            }.bind(this)


        } else {
            console.log("some thing get wrong...");
            // alert("some thing get wrong...");
        }

    }.bind(this);






    render() {

        return (

            <div className="animated fadeIn">
                <Col xs="12" sm="12">
                    <h5>{i18n.t(this.state.message)}</h5>
                    <h5 style={{ color: 'red' }}>{i18n.t(this.state.budgetError)}</h5>
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
                                <div className="table-responsive">
                                    <div id="shipmentBudgetTable"></div>
                                </div>
                                <div id="showButtonsDiv" style={{ display: 'none' }}>
                                    {this.state.budgetChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveBudget()} ><i className="fa fa-check"></i>Save budget</Button>}
                                </div>
                            </Col>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.backClicked}><i className="fa fa-times"></i> {i18n.t('static.common.back')}</Button>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveData()} ><i className="fa fa-check"></i>Save Data</Button>
                                <Button type="button" size="md" color="success" className="float-right mr-1" onClick={() => this.addRow()} id="addButton"><i className="fa fa-check"></i>Add Row</Button>

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


    plannedPsmChanged = function (instance, cell, x, y, value) {
        var planningUnitId = this.state.planningUnitId;
        var elInstance = instance.jexcel;
        console.log("elInstance========== ", this.state.planningUnitId);

        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var db1;
                getDatabase();
                var openRequest = indexedDB.open('fasp', 1);
                openRequest.onsuccess = function (e) {
                    db1 = e.target.result;
                    var papuTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                    var papuOs = papuTransaction.objectStore('procurementAgentPlanningUnit');
                    var papuRequest = papuOs.getAll();
                    papuRequest.onsuccess = function (event) {
                        var papuResult = [];
                        papuResult = papuRequest.result;
                        console.log("----------1111------", papuResult)
                        console.log("value-----", value);
                        console.log("planningUnitId----", planningUnitId)
                        var procurementAgentPlanningUnit = papuResult.filter(c => c.procurementAgent.id == value && c.planningUnit.id == planningUnitId)[0];
                        console.log("--------2222--------", procurementAgentPlanningUnit)
                        elInstance.setValueFromCoords(8, y, procurementAgentPlanningUnit.moq, true);
                        elInstance.setValueFromCoords(18, y, procurementAgentPlanningUnit.catalogPrice, true);
                        elInstance.setValueFromCoords(25, y, procurementAgentPlanningUnit.unitsPerPallet, true);
                        elInstance.setValueFromCoords(26, y, procurementAgentPlanningUnit.unitsPerContainer, true);
                    }.bind(this)
                }.bind(this)
            }
        }

        if (x == 17) {
            var col = ("R").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                    elInstance.setValueFromCoords(18, y, value, true);
                }

            }
        }

        if (x == 21) {
            var col = ("R").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                    elInstance.setValueFromCoords(22, y, value, true);
                }

            }
        }
    }.bind(this);

    checkValidation() {
        let shipmentStatusId = this.state.shipmentStatusId;
        console.log("shipmentStatusId---///--- ", shipmentStatusId);

        var valid = true;

        // var json = this.el.getJson();
        // for (var y = 0; y < json.length; y++) {
        //     var col = ("F").concat(parseInt(y) + 1);
        //     var value = this.el.getValueFromCoords(5, y);
        //     console.log("value-------- ", value);
        // }





        if (shipmentStatusId == 2) {

            var elInstance = this.state.shipmentEL;
            var json = elInstance.getJson();
            for (var y = 0; y < json.length; y++) {

                var col = ("AG").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(32, y);
                console.log("val-------------- ", value);
                // if (value == false || value == "false") {

                // }





                var col = ("A").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(0, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "This field is required.");
                } else {
                    if (isNaN(Date.parse(value))) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
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

                var col = ("D").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(3, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("H").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(7, y);
                if (value == "" || isNaN(Number.parseInt(value)) || value < 0) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || value < 0) {
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("L").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(11, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("U").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(20, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("V").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(21, y);
                if (value == "" || isNaN(Number.parseInt(value)) || value < 0) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || value < 0) {
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("O").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(14, y);
                if (value == "" || isNaN(Number.parseInt(value)) || value <= 0) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || value <= 0) {
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }




                var col = ("U").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(20, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("F").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(5, y);
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
                var value = elInstance.getValueFromCoords(4, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var budgetAmount = (elInstance.getValueFromCoords(29, y));
                budgetAmount = parseFloat(budgetAmount).toFixed(2);
                var totalAmount = parseFloat((elInstance.getCell(`X${y + 1}`)).innerHTML).toFixed(2);
                console.log("BudgetAmount", budgetAmount);
                console.log("Total AMount", totalAmount);
                console.log("yyyy ", y);
                if (budgetAmount != totalAmount) {
                    this.setState({
                        budgetError: "Budget amount does not match required amount."
                    })
                    valid = false;
                }










            }

        } else if (shipmentStatusId == 3) {
            var json = this.el.getJson();
            for (var y = 0; y < json.length; y++) {
                var col = ("F").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(5, y);
                console.log("VALUE1111-", value);
                // if (value != " PSM" || value != '') {
                if (value != "PSM") {

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

                    var col = ("AF").concat(parseInt(y) + 1);
                    var value = this.el.getValueFromCoords(32, y);
                    if (value == "Invalid date" || value == "") {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }

                    var col = ("AG").concat(parseInt(y) + 1);
                    var value = this.el.getValueFromCoords(33, y);
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

            }
        } else if (shipmentStatusId == 4 || shipmentStatusId == 5 || shipmentStatusId == 6) {
            var json = this.el.getJson();
            for (var y = 0; y < json.length; y++) {
                var col = ("F").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(5, y);
                if (value != "PSM") {
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
                }
            }

        }
        return valid;


    }
    cancelClicked() {
        this.props.history.push(`/dashboard/` + i18n.t('static.message.cancelled'))
    }

    backClicked() {
        this.props.history.push(`/shipment/shipmentList`)
    }

    getProcurementAgentById() {

        let programId = this.props.match.params.programId;
        let shipmentId = this.props.match.params.shipmentId;
        let planningUnitId = this.props.match.params.planningUnitId;
        let filterBy = this.props.match.params.filterBy;
        let startDate = this.props.match.params.startDate;
        let endDate = this.props.match.params.endDate;
        let rowIndex = this.props.match.params.rowIndex;


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

                var procurementAgentObj = '';
                var procurementAgentObjList = [];
                var procurementAgentTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                var procurementAgentOs = procurementAgentTransaction.objectStore('procurementAgent');
                var procurementAgentRequest = procurementAgentOs.getAll();

                procurementAgentRequest.onsuccess = function (event) {
                    var procurementAgentResult = [];
                    procurementAgentResult = procurementAgentRequest.result;
                    for (var k = 0; k < procurementAgentResult.length; k++) {


                        procurementAgentObj = {
                            name: procurementAgentResult[k].label.label_en,
                            id: procurementAgentResult[k].procurementAgentId
                        }
                        procurementAgentObjList[k] = procurementAgentObj;
                    }
                    this.setState({
                        procurementAgentObjList: procurementAgentObjList
                    })

                    console.log("set procurementAgentObj --- ", procurementAgentObj);



                }.bind(this);
            }.bind(this);
        }.bind(this);


    }

    getProcurementUnitById() {

        let programId = this.props.match.params.programId;
        let shipmentId = this.props.match.params.shipmentId;
        let planningUnitId = this.props.match.params.planningUnitId;
        let filterBy = this.props.match.params.filterBy;
        let startDate = this.props.match.params.startDate;
        let endDate = this.props.match.params.endDate;
        let rowIndex = this.props.match.params.rowIndex;



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

                var procurementUnitJson = '';
                var procurementUnitObjList = [];
                var procurementUnitTransaction = db1.transaction(['procurementUnit'], 'readwrite');
                var procurementUnitOs = procurementUnitTransaction.objectStore('procurementUnit');
                var procurementUnitRequest = procurementUnitOs.getAll();
                procurementUnitRequest.onsuccess = function (event) {

                    var procurementUnitResult = [];
                    procurementUnitResult = procurementUnitRequest.result;
                    for (var k = 0; k < procurementUnitResult.length; k++) {

                        procurementUnitJson = {
                            name: procurementUnitResult[k].label.label_en,
                            id: procurementUnitResult[k].procurementUnitId
                        }

                        procurementUnitObjList[k] = procurementUnitJson;
                    }

                    this.setState({
                        procurementUnitObjList: procurementUnitObjList
                    })

                }.bind(this);
            }.bind(this);
        }.bind(this);
    }

    getBudgetById() {
        let programId = this.props.match.params.programId;
        let shipmentId = this.props.match.params.shipmentId;
        let planningUnitId = this.props.match.params.planningUnitId;
        let filterBy = this.props.match.params.filterBy;
        let startDate = this.props.match.params.startDate;
        let endDate = this.props.match.params.endDate;
        let rowIndex = this.props.match.params.rowIndex;


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

                // var budgetObj = '';
                var budgetObjList = [];


                var budgetTransaction = db1.transaction(['budget'], 'readwrite');
                var budgetOs = budgetTransaction.objectStore('budget');
                var budgetRequest = budgetOs.getAll();

                budgetRequest.onsuccess = function (event) {
                    var budgetResult = [];
                    budgetResult = budgetRequest.result;
                    for (var k = 0; k < budgetResult.length; k++) {
                        var budgetObj = {
                            name: budgetResult[k].label.label_en,
                            id: budgetResult[k].budgetId
                        }
                        budgetObjList[k] = budgetObj
                    }

                    this.setState({
                        budgetObjList: budgetObjList
                    });

                }.bind(this);
            }.bind(this);
        }.bind(this);
    }


    getSupplierById() {
        let programId = this.props.match.params.programId;
        let shipmentId = this.props.match.params.shipmentId;
        let planningUnitId = this.props.match.params.planningUnitId;
        let filterBy = this.props.match.params.filterBy;
        let startDate = this.props.match.params.startDate;
        let endDate = this.props.match.params.endDate;
        let rowIndex = this.props.match.params.rowIndex;


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

                var supplierObj = '';
                var supplierObjList = [];
                var supplierTransaction = db1.transaction(['supplier'], 'readwrite');
                var supplierOs = supplierTransaction.objectStore('supplier');
                var supplierRequest = supplierOs.getAll();
                supplierRequest.onsuccess = function (event) {

                    var supplierResult = [];
                    supplierResult = supplierRequest.result;
                    for (var k = 0; k < supplierResult.length; k++) {

                        supplierObj = {
                            name: supplierResult[k].label.label_en,
                            id: supplierResult[k].supplierId
                        }
                        supplierObjList[k] = supplierObj;
                    }

                    this.setState({
                        supplierObjList: supplierObjList
                    });

                }.bind(this);
            }.bind(this);
        }.bind(this);
    }
}

