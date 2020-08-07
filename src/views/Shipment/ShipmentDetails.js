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
import { SECRET_KEY, SHIPMENT_DATA_SOURCE_TYPE, DELIVERED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS, CANCELLED_SHIPMENT_STATUS, TBD_PROCUREMENT_AGENT_ID, TBD_FUNDING_SOURCE, APPROVED_SHIPMENT_STATUS } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { jExcelLoadedFunction, jExcelLoadedFunctionOnlyHideRow } from '../../CommonComponent/JExcelCommonFunctions.js'
import { paddingZero, generateRandomAplhaNumericCode } from "../../CommonComponent/JavascriptCommonFunctions";
import ShipmentsInSupplyPlanComponent from "../SupplyPlan/ShipmentsInSupplyPlan";

const entityname = i18n.t('static.dashboard.shipmentdetails');

export default class ShipmentDetails extends React.Component {

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
            shipmentsEl: '',
            timeout: 0,
            showShipments: 0,
            shipmentChangedFlag: 0,
            shipmentModalTitle: ""
        }
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.formSubmit = this.formSubmit.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideFirstComponent = this.hideFirstComponent.bind(this);
        this.procurementUnitDropdownFilter = this.procurementUnitDropdownFilter.bind(this);
        this.shipmentStatusDropdownFilter = this.shipmentStatusDropdownFilter.bind(this);
        this.shipmentChanged = this.shipmentChanged.bind(this);
        this.budgetDropdownFilter = this.budgetDropdownFilter.bind(this)
        this.toggleLarge = this.toggleLarge.bind(this);
        this.batchInfoChangedShipment = this.batchInfoChangedShipment.bind(this);
        this.checkValidationForShipments = this.checkValidationForShipments.bind(this);
        this.checkValidationShipmentBatchInfo = this.checkValidationShipmentBatchInfo.bind(this);
        this.saveShipmentBatchInfo = this.saveShipmentBatchInfo.bind(this);
        this.updateState = this.updateState.bind(this);
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
                    planningUnitList: proList,
                    planningUnitListAll: myResult
                })
            }.bind(this);
        }.bind(this)
    }

    formSubmit() {
        var programId = document.getElementById('programId').value;
        this.setState({ programId: programId });
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programId = document.getElementById("programId").value;
        var procurementAgentList = [];
        var procurementAgentListAll = [];
        var fundingSourceList = [];
        var budgetList = [];
        var dataSourceList = [];
        var shipmentStatusList = [];
        var shipmentStatusListAll = [];
        var currencyList = [];
        var currencyListAll = [];
        var procurementUnitList = [];
        var procurementUnitListAll = [];
        var supplierList = [];
        var fundingSourceList = [];
        var myVar = '';
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

                console.log("this.state.planningUnitListAll", this.state.planningUnitListAll);
                var programPlanningUnit = ((this.state.planningUnitListAll).filter(p => p.planningUnit.id == planningUnitId))[0];
                var shipmentListUnFiltered = programJson.shipmentList;
                this.setState({
                    shipmentListUnFiltered: shipmentListUnFiltered
                })
                var shipmentList = programJson.shipmentList.filter(c => c.planningUnit.id == document.getElementById("planningUnitId").value);
                this.setState({
                    shelfLife: programPlanningUnit.shelfLife,
                    programJson: programJson,
                    shipmentListUnFiltered: shipmentListUnFiltered,
                    shipmentList: shipmentList,
                    showShipments: 1,
                })

            }.bind(this)
        }.bind(this)
    }

    checkValidationForShipments() {
        console.log("In method");
        var valid = true;
        var elInstance = this.state.shipmentsEl;
        var json = elInstance.getJson();
        var checkOtherValidation = false;
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            if (map.get("8") != "") {
                var budget = this.state.budgetListAll.filter(c => c.budgetId == map.get("8"))[0]
                var totalBudget = budget.budgetAmt * budget.currency.conversionRateToUsd;
                var shipmentList = this.state.shipmentListUnFiltered.filter(c => c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.active == true && c.budget.id == map.get("8"));
                var usedBudgetTotalAmount = 0;
                for (var s = 0; s < shipmentList.length; s++) {
                    var index = "";
                    if (shipmentList[s].shipmentId != 0) {
                        index = shipmentList.findIndex(c => c.shipmentId == shipmentList[s].shipmentId);
                    } else {
                        index = shipmentList[s].index;
                    }
                    if (map.get("37") != index) {
                        usedBudgetTotalAmount += parseFloat((parseFloat(shipmentList[s].productCost) + parseFloat(shipmentList[s].freightCost)) * parseFloat(shipmentList[s].currency.conversionRateToUsd));
                    }
                }
                var totalCost = ((elInstance.getCell(`AH${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", "");
                var enteredBudgetAmt = (totalCost * map.get("6"));
                usedBudgetTotalAmount = usedBudgetTotalAmount.toFixed(2);
                enteredBudgetAmt = enteredBudgetAmt.toFixed(2);

                var availableBudgetAmount = totalBudget - usedBudgetTotalAmount;
                if (enteredBudgetAmt > availableBudgetAmount) {
                    valid = false;
                    var col = ("I").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.noFundsAvailable'));

                    var col = ("AH").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.noFundsAvailable'));
                    this.setState({
                        noFundsBudgetError: i18n.t('static.label.noFundsAvailable')
                    })
                } else {
                    checkOtherValidation = true;
                }
            } else {
                checkOtherValidation = true;

            }
            if (checkOtherValidation) {
                console.log("In eklse");
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


                var value = elInstance.getRowData(y)[1];
                var col = ("B").concat(parseInt(y) + 1);
                var col1 = ("AA").concat(parseInt(y) + 1);
                var col2 = ("AB").concat(parseInt(y) + 1);
                var col3 = ("I").concat(parseInt(y) + 1);

                var col4 = ("E").concat(parseInt(y) + 1);
                var col5 = ("H").concat(parseInt(y) + 1);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var oldShipmentId = elInstance.getValueFromCoords(38, y);
                    if ((value == SHIPPED_SHIPMENT_STATUS || value == ARRIVED_SHIPMENT_STATUS || value == DELIVERED_SHIPMENT_STATUS) && oldShipmentId != DELIVERED_SHIPMENT_STATUS) {
                        var procurementUnit = elInstance.getValueFromCoords(26, y);
                        var supplier = elInstance.getValueFromCoords(27, y);
                        if (procurementUnit == "") {
                            elInstance.setStyle(col1, "background-color", "transparent");
                            elInstance.setStyle(col1, "background-color", "yellow");
                            elInstance.setComments(col1, i18n.t('static.label.fieldRequired'));
                            valid = false;
                        } else {
                            elInstance.setStyle(col1, "background-color", "transparent");
                            elInstance.setComments(col1, "");
                        }

                        if (supplier == "") {
                            elInstance.setStyle(col2, "background-color", "transparent");
                            elInstance.setStyle(col2, "background-color", "yellow");
                            elInstance.setComments(col2, i18n.t('static.label.fieldRequired'));
                            valid = false;
                        } else {
                            elInstance.setStyle(col2, "background-color", "transparent");
                            elInstance.setComments(col2, "");
                        }
                    } else if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                        var budget = elInstance.getValueFromCoords(8, y);
                        if (budget == "") {
                            elInstance.setStyle(col3, "background-color", "transparent");
                            elInstance.setStyle(col3, "background-color", "yellow");
                            elInstance.setComments(col3, i18n.t('static.label.fieldRequired'));
                            valid = false;
                        } else {
                            elInstance.setStyle(col3, "background-color", "transparent");
                            elInstance.setComments(col3, "");
                        }
                        var procurementAgent = (elInstance.getRowData(y))[4];
                        var fundingSource = (elInstance.getRowData(y))[7];

                        if (procurementAgent == TBD_PROCUREMENT_AGENT_ID) {
                            elInstance.setStyle(col4, "background-color", "transparent");
                            elInstance.setStyle(col4, "background-color", "yellow");
                            elInstance.setComments(col4, i18n.t('static.supplyPlan.procurementAgentCannotBeTBD'));
                        } else {
                            elInstance.setStyle(col4, "background-color", "transparent");
                            elInstance.setComments(col4, "");
                        }

                        if (fundingSource == TBD_FUNDING_SOURCE) {
                            elInstance.setStyle(col5, "background-color", "transparent");
                            elInstance.setStyle(col5, "background-color", "yellow");
                            elInstance.setComments(col5, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'));
                        } else {
                            elInstance.setStyle(col5, "background-color", "transparent");
                            elInstance.setComments(col5, "");
                        }
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                        elInstance.setStyle(col1, "background-color", "transparent");
                        elInstance.setComments(col1, "");
                        elInstance.setStyle(col2, "background-color", "transparent");
                        elInstance.setComments(col2, "");
                        elInstance.setStyle(col3, "background-color", "transparent");
                        elInstance.setComments(col3, "");
                        elInstance.setStyle(col4, "background-color", "transparent");
                        elInstance.setComments(col4, "");
                        elInstance.setStyle(col5, "background-color", "transparent");
                        elInstance.setComments(col5, "");
                    }
                }

                var col = ("AE").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(30, y);
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

                var col = ("K").concat(parseInt(y) + 1);
                var value = (elInstance.getRowData(y))[10];
                var reg = /^[0-9\b]+$/;
                value = value.toString().replaceAll("\,", "");
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    if (isNaN(Number.parseInt(value)) || !(reg.test(value)) || value == 0) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                }

                var col = ("U").concat(parseInt(y) + 1);
                var value = (elInstance.getRowData(y))[20];
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
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

                var col = ("E").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(4, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var shipmentStatus = (elInstance.getRowData(y))[1];
                    if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                        if (value == TBD_PROCUREMENT_AGENT_ID) {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", "yellow");
                            elInstance.setComments(col, i18n.t('static.supplyPlan.procurementAgentCannotBeTBD'));
                        } else {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setComments(col, "");
                        }
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                }

                var col = ("H").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(7, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    var shipmentStatus = (elInstance.getRowData(y))[1];
                    if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                        if (value == TBD_FUNDING_SOURCE) {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setStyle(col, "background-color", "yellow");
                            elInstance.setComments(col, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'));
                        } else {
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setComments(col, "");
                        }
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
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("Z").concat(parseInt(y) + 1);
                var value = (elInstance.getRowData(y))[25];
                value = value.toString().replaceAll("\,", "");
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
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

                var col = ("AF").concat(parseInt(y) + 1);
                var value = (elInstance.getRowData(y))[31];
                value = value.toString().replaceAll("\,", "");
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
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
                var shipmentStatus = elInstance.getRowData(y)[1];
                console.log("Shipment status", shipmentStatus);
                if (shipmentStatus != CANCELLED_SHIPMENT_STATUS && shipmentStatus != ON_HOLD_SHIPMENT_STATUS) {
                    if (shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                        console.log("In if");
                        var totalShipmentQty = (elInstance.getValueFromCoords(44, y));
                        var adjustedOrderQty = (elInstance.getCell(`V${parseInt(y) + 1}`)).innerHTML;
                        adjustedOrderQty = adjustedOrderQty.toString().replaceAll("\,", "");
                        var col = ("V").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.supplyPlan.batchNumberMissing'));
                        console.log("totalShipmentQty", totalShipmentQty);
                        console.log("adjustedOrderQty", adjustedOrderQty);
                        if (totalShipmentQty != 0 && totalShipmentQty != adjustedOrderQty) {
                            valid = false;
                            this.setState({
                                shipmentBatchError: i18n.t('static.supplyPlan.batchNumberMissing')
                            })
                        } else {
                            var col = ("V").concat(parseInt(y) + 1);
                            elInstance.setStyle(col, "background-color", "transparent");
                            elInstance.setComments(col, "");
                        }
                    }
                }
            }
        }
        return valid;
    }



    loadedShipments = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    shipmentChanged = function (instance, cell, x, y, value) {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var elInstance = this.state.shipmentsEl;
        this.setState({
            shipmentError: '',
            shipmentDuplicateError: '',
            noFundsBudgetError: ''
        })

        if (x == 8 || x == 33) {
            var col = ("I").concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
            var col = ("AH").concat(parseInt(y) + 1);
            if (value != "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

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
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var valueOfF = elInstance.getValueFromCoords(5, y);
                if (valueOfF != "") {
                    var col1 = ("F").concat(parseInt(y) + 1);
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }

                // }
            }
        }

        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            var col1 = ("AA").concat(parseInt(y) + 1);
            var col2 = ("AB").concat(parseInt(y) + 1);
            var col3 = ("I").concat(parseInt(y) + 1);
            var col4 = ("E").concat(parseInt(y) + 1);
            var col5 = ("H").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                var oldShipmentId = elInstance.getValueFromCoords(38, y);
                if ((value == SHIPPED_SHIPMENT_STATUS || value == ARRIVED_SHIPMENT_STATUS || value == DELIVERED_SHIPMENT_STATUS) && oldShipmentId != DELIVERED_SHIPMENT_STATUS) {
                    var procurementUnit = elInstance.getValueFromCoords(26, y);
                    var supplier = elInstance.getValueFromCoords(27, y);
                    if (procurementUnit == "") {
                        elInstance.setStyle(col1, "background-color", "transparent");
                        elInstance.setStyle(col1, "background-color", "yellow");
                        elInstance.setComments(col1, i18n.t('static.label.fieldRequired'));
                    } else {
                        elInstance.setStyle(col1, "background-color", "transparent");
                        elInstance.setComments(col1, "");
                    }

                    if (supplier == "") {
                        elInstance.setStyle(col2, "background-color", "transparent");
                        elInstance.setStyle(col2, "background-color", "yellow");
                        elInstance.setComments(col2, i18n.t('static.label.fieldRequired'));
                    } else {
                        elInstance.setStyle(col2, "background-color", "transparent");
                        elInstance.setComments(col2, "");
                    }
                } else if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                    var budget = elInstance.getValueFromCoords(8, y);
                    if (budget == "") {
                        elInstance.setStyle(col3, "background-color", "transparent");
                        elInstance.setStyle(col3, "background-color", "yellow");
                        elInstance.setComments(col3, i18n.t('static.label.fieldRequired'));
                    } else {
                        elInstance.setStyle(col3, "background-color", "transparent");
                        elInstance.setComments(col3, "");
                    }

                    var procurementAgent = (elInstance.getRowData(y))[4];
                    var fundingSource = (elInstance.getRowData(y))[7];

                    if (procurementAgent == TBD_PROCUREMENT_AGENT_ID) {
                        elInstance.setStyle(col4, "background-color", "transparent");
                        elInstance.setStyle(col4, "background-color", "yellow");
                        elInstance.setComments(col4, i18n.t('static.supplyPlan.procurementAgentCannotBeTBD'));
                    } else {
                        elInstance.setStyle(col4, "background-color", "transparent");
                        elInstance.setComments(col4, "");
                    }

                    if (fundingSource == TBD_FUNDING_SOURCE) {
                        elInstance.setStyle(col5, "background-color", "transparent");
                        elInstance.setStyle(col5, "background-color", "yellow");
                        elInstance.setComments(col5, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'));
                    } else {
                        elInstance.setStyle(col5, "background-color", "transparent");
                        elInstance.setComments(col5, "");
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                    elInstance.setStyle(col2, "background-color", "transparent");
                    elInstance.setComments(col2, "");
                    elInstance.setStyle(col3, "background-color", "transparent");
                    elInstance.setComments(col3, "");
                    elInstance.setStyle(col4, "background-color", "transparent");
                    elInstance.setComments(col4, "");
                    elInstance.setStyle(col5, "background-color", "transparent");
                    elInstance.setComments(col5, "");
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
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                elInstance.setValueFromCoords(26, y, "", true);
                elInstance.setValueFromCoords(28, y, "", true);
            } else {
                var shipmentStatus = (elInstance.getRowData(y))[1];
                if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                    if (value == TBD_PROCUREMENT_AGENT_ID) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.supplyPlan.procurementAgentCannotBeTBD'));
                    } else {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                    var procurementAgentPlanningUnit = this.state.procurementAgentListAll.filter(c => c.procurementAgent.id == value && c.planningUnit.id == planningUnitId)[0];
                    var procurementUnitValue = elInstance.getRowData(y)[26];
                    var pricePerUnit = procurementAgentPlanningUnit.catalogPrice;
                    console.log("Price per unit", pricePerUnit);
                    if (procurementUnitValue != "") {
                        var procurementUnit = this.state.procurementUnitListAll.filter(p => p.procurementUnit.id == procurementUnitValue && p.procurementAgent.id == value)[0];
                        if (procurementUnit.vendorPrice != 0 && procurementUnit.vendorPrice != null) {
                            pricePerUnit = procurementUnit.vendorPrice;
                        }
                    }
                    var conversionRateToUsd = elInstance.getValueFromCoords(6, y);
                    pricePerUnit = (pricePerUnit / conversionRateToUsd).toFixed(2);
                    elInstance.setValueFromCoords(11, y, procurementAgentPlanningUnit.moq, true);
                    elInstance.setValueFromCoords(28, y, pricePerUnit, true);
                    elInstance.setValueFromCoords(12, y, procurementAgentPlanningUnit.unitsPerPalletEuro1, true);
                    elInstance.setValueFromCoords(13, y, procurementAgentPlanningUnit.unitsPerPalletEuro2, true);
                    elInstance.setValueFromCoords(14, y, procurementAgentPlanningUnit.unitsPerContainer, true);
                    if (procurementAgentPlanningUnit.unitsPerPalletEuro1 == 0 || procurementAgentPlanningUnit.unitsPerContainer == 0 || procurementAgentPlanningUnit.unitsPerContainer == null || procurementAgentPlanningUnit.unitsPerPalletEuro1 == null) {
                        elInstance.setValueFromCoords(11, y, "", true);
                        elInstance.setValueFromCoords(12, y, "", true);
                        elInstance.setValueFromCoords(13, y, "", true);
                        elInstance.setValueFromCoords(14, y, "", true);
                    }
                }
                elInstance.setValueFromCoords(26, y, "", true);
            }
        }

        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                elInstance.setValueFromCoords(6, y, "", true)
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var currency = (this.state.currencyListAll).filter(c => c.currencyId == value)[0];
                elInstance.setValueFromCoords(6, y, currency.conversionRateToUsd, true)
                var procurementAgentId = (elInstance.getRowData(y))[4];
                var procurementAgentPlanningUnit = this.state.procurementAgentListAll.filter(c => c.procurementAgent.id == procurementAgentId && c.planningUnit.id == planningUnitId)[0];
                var procurementUnitValue = elInstance.getRowData(y)[26];
                var pricePerUnit = procurementAgentPlanningUnit.catalogPrice;
                console.log("Price per unit", pricePerUnit);
                if (procurementUnitValue != "") {
                    var procurementUnit = this.state.procurementUnitListAll.filter(p => p.procurementUnit.id == procurementUnitValue && p.procurementAgent.id == value)[0];
                    if (procurementUnit.vendorPrice != 0 && procurementUnit.vendorPrice != null) {
                        pricePerUnit = procurementUnit.vendorPrice;
                    }
                }
                var conversionRateToUsd = value;
                pricePerUnit = (pricePerUnit / conversionRateToUsd).toFixed(2);
                elInstance.setValueFromCoords(28, y, pricePerUnit, true);
            }
        }

        if (x == 7) {
            var col = ("H").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                elInstance.setValueFromCoords(8, y, "", true);
            } else {
                elInstance.setValueFromCoords(8, y, "", true);
                var shipmentStatus = (elInstance.getRowData(y))[1];
                if (shipmentStatus == SUBMITTED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == APPROVED_SHIPMENT_STATUS) {
                    if (value == TBD_FUNDING_SOURCE) {
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, i18n.t('static.supplyPlan.fundingSourceCannotBeTBD'));
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

        if (x == 10) {
            var col = ("K").concat(parseInt(y) + 1);
            var reg = /^[0-9\b]+$/;
            value = (elInstance.getRowData(y))[10];
            value = value.toString().replaceAll("\,", "");
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
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }

        if (x == 20) {
            var col = ("U").concat(parseInt(y) + 1);
            value = (elInstance.getRowData(y))[20];
            value = value.toString().replaceAll("\,", "");
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
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

        if (x == 25) {
            var col = ("Z").concat(parseInt(y) + 1);
            value = (elInstance.getRowData(y))[25];
            value = value.toString().replaceAll("\,", "");
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
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

        if (x == 26) {
            elInstance.setValueFromCoords(27, y, "", true);
            if (value != "") {
                // Logic for Procurement Unit on change
                var valueOfF = elInstance.getRowData(y)[4];
                if (valueOfF != "") {
                    var procurementUnit = this.state.procurementUnitListAll.filter(p => p.procurementUnit.id == value && p.procurementAgent.id == valueOfF)[0];
                    var pu = this.state.procurementListForSupplier.filter(c => c.procurementUnitId == value)[0];
                    var supplier = pu.supplier.id;
                    var conversionRateToUsd = elInstance.getValueFromCoords(6, y);
                    if (procurementUnit.vendorPrice != 0 && procurementUnit.vendorPrice != null) {
                        pricePerUnit = procurementUnit.vendorPrice;
                        pricePerUnit = (pricePerUnit / conversionRateToUsd).toFixed(2);
                        elInstance.setValueFromCoords(28, y, pricePerUnit, true);
                    }
                    elInstance.setValueFromCoords(27, y, supplier, true);
                }
            } else {
                var procurementAgentId = (elInstance.getRowData(y))[4];
                var procurementAgentPlanningUnit = this.state.procurementAgentListAll.filter(c => c.procurementAgent.id == procurementAgentId && c.planningUnit.id == planningUnitId)[0];
                var procurementUnitValue = elInstance.getRowData(y)[26];
                var pricePerUnit = procurementAgentPlanningUnit.catalogPrice;
                console.log("Price per unit", pricePerUnit);
                if (procurementUnitValue != "") {
                    var procurementUnit = this.state.procurementUnitListAll.filter(p => p.procurementUnit.id == procurementUnitValue && p.procurementAgent.id == value)[0];
                    if (procurementUnit.vendorPrice != 0 && procurementUnit.vendorPrice != null) {
                        pricePerUnit = procurementUnit.vendorPrice;
                    }
                }
                var conversionRateToUsd = elInstance.getRowData(y)[5];
                pricePerUnit = (pricePerUnit / conversionRateToUsd).toFixed(2);
                elInstance.setValueFromCoords(28, y, pricePerUnit, true);
            }

            var shipmentStatus = elInstance.getRowData(y)[1];
            var col1 = ("AA").concat(parseInt(y) + 1);
            if (shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                var procurementUnit = value;
                if (procurementUnit == "") {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setStyle(col1, "background-color", "yellow");
                    elInstance.setComments(col1, i18n.t('static.label.fieldRequired'));
                } else {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }
            } else {
                elInstance.setStyle(col1, "background-color", "transparent");
                elInstance.setComments(col1, "");
            }
        }

        if (x == 27) {
            var shipmentStatus = elInstance.getRowData(y)[1];
            var col1 = ("AB").concat(parseInt(y) + 1);
            if (shipmentStatus == DELIVERED_SHIPMENT_STATUS || shipmentStatus == SHIPPED_SHIPMENT_STATUS || shipmentStatus == ARRIVED_SHIPMENT_STATUS) {
                var supplier = value;
                if (supplier == "") {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setStyle(col1, "background-color", "yellow");
                    elInstance.setComments(col1, i18n.t('static.label.fieldRequired'));
                } else {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }
            } else {
                elInstance.setStyle(col1, "background-color", "transparent");
                elInstance.setComments(col1, "");
            }
        }

        if (x == 30) {
            var col = ("AE").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 31) {
            var col = ("AF").concat(parseInt(y) + 1);
            value = (elInstance.getRowData(y))[31];
            value = value.toString().replaceAll("\,", "");
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
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

        if (x == 44) {
            if (value != 0) {
                var adjustedQty = ((elInstance.getCell(`V${parseInt(y) + 1}`)).innerHTML).toString().replaceAll("\,", "");
                if (value != adjustedQty) {
                    var col = ("V").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.supplyPlan.batchNumberMissing'));
                    this.setState({
                        shipmentBatchError: i18n.t('static.supplyPlan.batchNumberMissing'),
                    })
                } else {
                    var col = ("V").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, '');
                    this.setState({
                        shipmentBatchError: '',
                    })
                }
            }
        }

        this.setState({
            shipmentChangedFlag: 1
        });
    }

    shipmentStatusDropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[38];
        if (value != "") {
            var shipmentStatusList = this.state.shipmentStatusList;
            var shipmentStatus = (this.state.shipmentStatusList).filter(c => c.shipmentStatusId == value)[0];
            var possibleStatusArray = shipmentStatus.nextShipmentStatusAllowedList;
            for (var k = 0; k < shipmentStatusList.length; k++) {
                if (possibleStatusArray.includes(shipmentStatusList[k].shipmentStatusId)) {
                    var shipmentStatusJson = {
                        name: getLabelText(shipmentStatusList[k].label, this.state.lang),
                        id: shipmentStatusList[k].shipmentStatusId
                    }
                    mylist.push(shipmentStatusJson);
                }

            }
        }
        return mylist;
    }

    budgetDropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[7];
        if (value != "") {
            var budgetList = this.state.budgetList;
            var mylist = budgetList.filter(b => b.fundingSource.fundingSourceId == value);
        }
        return mylist;
    }

    filterOrderBasedOn = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[13];
        if (value > 0) {
            var mylist = [{ id: 1, name: i18n.t('static.supplyPlan.container') }, { id: 2, name: i18n.t('static.supplyPlan.suggestedOrderQty') }, { id: 3, name: i18n.t('static.procurementAgentPlanningUnit.moq') }, { id: 4, name: i18n.t('static.supplyPlan.palletEuro1') }, { id: 5, name: i18n.t('static.supplyPlan.palletEuro2') }]
        } else {
            var mylist = [{ id: 1, name: i18n.t('static.supplyPlan.container') }, { id: 2, name: i18n.t('static.supplyPlan.suggestedOrderQty') }, { id: 3, name: i18n.t('static.procurementAgentPlanningUnit.moq') }, { id: 4, name: i18n.t('static.supplyPlan.palletEuro1') }]
        }
        return mylist;
    }

    procurementUnitDropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[5];
        if (value != "") {
            var procurementUnitList = (this.state.procurementUnitListAll).filter(c => c.procurementAgent.id == value);
            for (var k = 0; k < procurementUnitList.length; k++) {
                var procurementUnitJson = {
                    name: getLabelText(procurementUnitList[k].procurementUnit.label, this.state.lang),
                    id: procurementUnitList[k].procurementUnit.id
                }
                mylist.push(procurementUnitJson);
            }
        }
        return mylist;
    }

    cancelClicked() {
        this.props.history.push(`/ApplicationDashboard/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    toggleLarge() {
        this.setState({
            shipmentBatchInfoChangedFlag: 0,
            shipmentBatchInfoDuplicateError: '',
            shipmentValidationBatchError: ''
        })
        this.setState({
            batchInfo: !this.state.batchInfo,
        });
    }

    loadedBatchInfoShipment = function (instance, cell, x, y, value) {
        jExcelLoadedFunctionOnlyHideRow(instance);
    }

    batchInfoChangedShipment = function (instance, cell, x, y, value) {
        console.log("In change")
        this.setState({
            shipmentValidationBatchError: ''
        })
        var elInstance = instance.jexcel;
        if (x == 0) {
            this.setState({
                shipmentBatchInfoDuplicateError: ''
            })
            var col = ("A").concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
            console.log("In 0")
        }

        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }
        if (x == 2) {
            var reg = /^[0-9\b]+$/;
            var col = ("C").concat(parseInt(y) + 1);
            value = (elInstance.getRowData(y))[2];
            value = value.toString().replaceAll("\,", "");
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
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }
        }
        this.setState({
            shipmentBatchInfoChangedFlag: 1
        })
    }.bind(this)

    checkValidationShipmentBatchInfo() {
        var valid = true;
        var elInstance = this.state.shipmentBatchInfoTableEl;
        var json = elInstance.getJson();
        var mapArray = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var batchInfoList = this.state.batchInfoListAll;
            var checkDuplicate = batchInfoList.filter(c =>
                c.batchNo == map.get("0")
            )
            var index = batchInfoList.findIndex(c =>
                c.batchNo == map.get("0")
            );

            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("0") == map.get("0")
            )

            if ((checkDuplicate.length >= 1 && index != map.get("5")) || checkDuplicateInMap.length > 1) {
                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.supplyPlan.duplicateBatchNumber'));
                }
                valid = false;
                this.setState({
                    shipmentBatchInfoDuplicateError: i18n.t('static.supplyPlan.duplicateBatchNumber')
                })
            } else {

                var colArr = ['A'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
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
                var value = (elInstance.getRowData(y))[2];
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


            }
        }
        return valid;
    }

    saveShipmentBatchInfo() {
        var validation = this.checkValidationShipmentBatchInfo();
        if (validation == true) {
            var elInstance = this.state.shipmentBatchInfoTableEl;
            var json = elInstance.getJson();
            var batchInfoArray = [];
            var rowNumber = 0;
            var totalShipmentQty = 0;
            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                if (i == 0) {
                    rowNumber = map.get("4");
                }
                var shipmentInstance = this.state.shipmentsEl;
                var rowData = shipmentInstance.getRowData(parseInt(rowNumber));
                var batchNo = "";
                if (map.get("0") != "") {
                    batchNo = map.get("0");
                } else {
                    var programId = (document.getElementById("programId").value).split("_")[0];
                    var planningUnitId = document.getElementById("planningUnitId").value;
                    programId = paddingZero(programId, 0, 6);
                    planningUnitId = paddingZero(planningUnitId, 0, 8);
                    batchNo = (programId).concat(planningUnitId).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                    console.log("BatchNo", batchNo);
                }
                var batchInfoJson = {
                    shipmentTransBatchInfoId: map.get("3"),
                    batch: {
                        batchNo: batchNo,
                        expiryDate: moment(map.get("1")).format("YYYY-MM-DD"),
                        batchId: 0
                    },
                    shipmentQty: map.get("2").toString().replaceAll("\,", "")
                }
                batchInfoArray.push(batchInfoJson);
                totalShipmentQty += parseInt(map.get("2").toString().replaceAll("\,", ""))
            }

            rowData[43] = batchInfoArray;
            rowData[44] = totalShipmentQty;
            shipmentInstance.setValueFromCoords(43, rowNumber, batchInfoArray, true);
            shipmentInstance.setValueFromCoords(44, rowNumber, totalShipmentQty, true);
            this.setState({
                shipmentChangedFlag: 1,
                shipmentBatchInfoChangedFlag: 0,
                shipmentBatchInfoTableEl: ''
            })
            var cell = shipmentInstance.getCell(`A${parseInt(rowNumber) + 1}`)
            cell.classList.remove('readonly');
            this.toggleLarge();
            elInstance.destroy();
        } else {
            this.setState({
                shipmentValidationBatchError: i18n.t('static.supplyPlan.validationFailed')
            })
        }
    }

    saveShipments() {
        var validation = this.checkValidationForShipments();
        console.log("Validation---------------->", validation);
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            this.setState({
                shipmentError: "",
                shipmentDuplicateError: '',
                shipmentBudgetError: '',
                shipmentBatchError: '',
                noFundsBudgetError: ''
            })
            var db1;
            var storeOS;
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onerror = function (event) {
                this.setState({
                    supplyPlanError: i18n.t('static.program.errortext')
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
                        supplyPlanError: i18n.t('static.program.errortext')
                    })
                }.bind(this);
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var shipmentDataList = (programJson.shipmentList);
                    var batchInfoList = programJson.batchInfoList;
                    var planningUnitId = document.getElementById("planningUnitId").value;
                    var elInstance = this.state.shipmentsEl;
                    var json = elInstance.getJson();
                    console.log("json", json);
                    for (var j = 0; j < json.length; j++) {
                        var map = new Map(Object.entries(json[j]));
                        var index = parseInt(map.get("37"));
                        if (index != -1) {
                            var selectedShipmentStatus = map.get("1");
                            var shipmentStatusId = selectedShipmentStatus;
                            var shipmentQty = (elInstance.getCell(`V${parseInt(j) + 1}`)).innerHTML;
                            var productCost = (elInstance.getCell(`AD${parseInt(j) + 1}`)).innerHTML;
                            var rate = 0;
                            if ((elInstance.getCell(`Z${parseInt(j) + 1}`)).innerHTML != "" || (elInstance.getCell(`Z${parseInt(j) + 1}`)).innerHTML != 0) {
                                rate = (elInstance.getCell(`Z${parseInt(j) + 1}`)).innerHTML;
                            } else {
                                rate = (elInstance.getCell(`AC${parseInt(j) + 1}`)).innerHTML;
                            }

                            var freightCost = 0;
                            if ((elInstance.getCell(`AF${parseInt(j) + 1}`)).innerHTML != "" || (elInstance.getCell(`AF${parseInt(j) + 1}`)).innerHTML != 0) {
                                freightCost = (elInstance.getCell(`AF${parseInt(j) + 1}`)).innerHTML;
                            } else {
                                freightCost = (elInstance.getCell(`AG${parseInt(j) + 1}`)).innerHTML;
                            }
                            var shipmentMode = "Sea";
                            if (map.get("30") == 2) {
                                shipmentMode = "Air";
                            }
                            shipmentDataList[parseInt(map.get("37"))].expectedDeliveryDate = moment(map.get("0")).format("YYYY-MM-DD");
                            shipmentDataList[parseInt(map.get("37"))].shipmentStatus.id = shipmentStatusId;
                            shipmentDataList[parseInt(map.get("37"))].dataSource.id = map.get("3");
                            shipmentDataList[parseInt(map.get("37"))].procurementAgent.id = map.get("4");
                            shipmentDataList[parseInt(map.get("37"))].fundingSource.id = map.get("7");
                            shipmentDataList[parseInt(map.get("37"))].budget.id = map.get("8");
                            shipmentDataList[parseInt(map.get("37"))].shipmentQty = shipmentQty.toString().replaceAll("\,", "");
                            shipmentDataList[parseInt(map.get("37"))].rate = rate.toString().replaceAll("\,", "");
                            shipmentDataList[parseInt(map.get("37"))].procurementUnit.id = map.get("26");
                            shipmentDataList[parseInt(map.get("37"))].supplier.id = map.get("27");
                            shipmentDataList[parseInt(map.get("37"))].shipmentMode = shipmentMode;
                            shipmentDataList[parseInt(map.get("37"))].productCost = productCost.toString().replaceAll("\,", "");
                            shipmentDataList[parseInt(map.get("37"))].freightCost = parseFloat(freightCost.toString().replaceAll("\,", "")).toFixed(2);
                            shipmentDataList[parseInt(map.get("37"))].notes = map.get("34");
                            shipmentDataList[parseInt(map.get("37"))].active = map.get("42");
                            shipmentDataList[parseInt(map.get("37"))].accountFlag = map.get("40");
                            shipmentDataList[parseInt(map.get("37"))].emergencyOrder = map.get("41");
                            if (map.get("43").length != 0) {
                                shipmentDataList[parseInt(map.get("37"))].batchInfoList = map.get("43");
                            }
                            if (shipmentStatusId == SHIPPED_SHIPMENT_STATUS) {
                                shipmentDataList[parseInt(map.get("37"))].shippedDate = moment(Date.now()).format("YYYY-MM-DD");
                            }
                            if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                                shipmentDataList[parseInt(map.get("37"))].deliveredDate = moment(Date.now()).format("YYYY-MM-DD");
                                var shipmentBatchInfoList = map.get("43");
                                if (shipmentBatchInfoList.length == 0) {
                                    var programId = (document.getElementById("programId").value).split("_")[0];
                                    var planningUnitId = document.getElementById("planningUnitId").value;
                                    var batchNo = (paddingZero(programId, 0, 6)).concat(paddingZero(planningUnitId, 0, 8)).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                                    var expectedDeliveryDate = moment(map.get("0")).format("YYYY-MM-DD");
                                    var expiryDate = moment(expectedDeliveryDate).add(this.state.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                                    var batchInfoJson = {
                                        shipmentTransBatchInfoId: 0,
                                        batch: {
                                            batchNo: batchNo,
                                            expiryDate: expiryDate,
                                            batchId: 0
                                        },
                                        shipmentQty: shipmentQty,
                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
                                    }
                                    var batchArr = [];
                                    batchArr.push(batchInfoJson);
                                    shipmentDataList[parseInt(map.get("37"))].batchInfoList = batchArr;
                                    var batchDetails = {
                                        batchId: 0,
                                        batchNo: batchNo,
                                        planningUnitId: parseInt(document.getElementById("planningUnitId").value),
                                        expiryDate: expiryDate,
                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
                                    }
                                    batchInfoList.push(batchDetails);
                                }
                                for (var bi = 0; bi < shipmentBatchInfoList.length; bi++) {
                                    var batchDetails = {
                                        batchId: shipmentBatchInfoList[bi].batch.batchId,
                                        batchNo: shipmentBatchInfoList[bi].batch.batchNo,
                                        planningUnitId: parseInt(document.getElementById("planningUnitId").value),
                                        expiryDate: shipmentBatchInfoList[bi].batch.expiryDate,
                                        createdDate: moment(Date.now()).format("YYYY-MM-DD")
                                    }
                                    batchInfoList.push(batchDetails);
                                }
                                programJson.batchInfoList = batchInfoList;
                            }
                        } else {
                            var shipmentQty = (elInstance.getCell(`V${parseInt(j) + 1}`)).innerHTML;
                            var productCost = (elInstance.getCell(`AD${parseInt(j) + 1}`)).innerHTML;
                            var rate = 0;
                            if ((elInstance.getCell(`Z${parseInt(j) + 1}`)).innerHTML != "" || (elInstance.getCell(`Z${parseInt(j) + 1}`)).innerHTML != 0) {
                                rate = (elInstance.getCell(`Z${parseInt(j) + 1}`)).innerHTML;
                            } else {
                                rate = (elInstance.getCell(`AC${parseInt(j) + 1}`)).innerHTML;
                            }

                            var freightCost = 0;
                            if ((elInstance.getCell(`AF${parseInt(j) + 1}`)).innerHTML != "" || (elInstance.getCell(`AF${parseInt(j) + 1}`)).innerHTML != 0) {
                                freightCost = (elInstance.getCell(`AF${parseInt(j) + 1}`)).innerHTML;
                            } else {
                                freightCost = (elInstance.getCell(`AG${parseInt(j) + 1}`)).innerHTML;
                            }
                            var shipmentMode = "Sea";
                            if (map.get("30") == 2) {
                                shipmentMode = "Air";
                            }

                            var json = {
                                expectedDeliveryDate: moment(map.get("0")).format("YYYY-MM-DD"),
                                shipmentId: 0,
                                shipmentStatus: {
                                    id: PLANNED_SHIPMENT_STATUS
                                },
                                dataSource: {
                                    id: map.get("3")
                                },
                                procurementAgent: {
                                    id: map.get("4")
                                },
                                fundingSource: {
                                    id: map.get("7")
                                },
                                budget: {
                                    id: map.get("8")
                                },
                                shipmentQty: shipmentQty.toString().replaceAll("\,", ""),
                                rate: rate.toString().replaceAll("\,", ""),
                                procurementUnit: {
                                    id: map.get("26")
                                },
                                supplier: {
                                    id: map.get("27")
                                },
                                shipmentMode: shipmentMode,
                                productCost: productCost.toString().replaceAll("\,", ""),
                                freightCost: parseFloat(freightCost.toString().replaceAll("\,", "")).toFixed(2),
                                notes: map.get("34"),
                                active: map.get("42"),
                                accountFlag: map.get("40"),
                                emergencyOrder: map.get("41"),
                                erpFlag: false,
                                planningUnit: {
                                    id: planningUnitId
                                },
                                deliveredDate: "",
                                shippedDate: "",
                                index: shipmentDataList.length,
                                batchInfoList: [],
                                orderedDate: moment(Date.now()).format("YYYY-MM-DD"),

                                suggestedQty: map.get("10").toString().replaceAll("\,", ""),
                                currency: {
                                    currencyId: map.get("5"),
                                    conversionRateToUsd: map.get("6")
                                },
                            }
                            shipmentDataList.push(json);
                        }
                    }
                    programJson.shipmentList = shipmentDataList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        this.setState({
                            supplyPlanError: i18n.t('static.program.errortext')
                        })
                    }.bind(this);
                    putRequest.onsuccess = function (event) {
                        this.setState({
                            message: 'static.message.shipmentsSaved',
                            shipmentChangedFlag: 0,
                            color: 'green'
                        })
                        this.hideFirstComponent();
                        this.props.history.push(`/shipment/shipmentDetails/` + i18n.t('static.message.shipmentsSaved'));
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                shipmentError: i18n.t('static.supplyPlan.validationFailed')
            })
        }
    }

    actionCanceled() {
        this.setState({
            message: i18n.t('static.message.cancelled'),
            color: 'red',
        })
        this.toggleLarge();
    }

    updateState(parameterName, value) {
        console.log("in update state")
        this.setState({
            [parameterName]: value
        })

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
                    <CardBody >
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
                            {this.state.showShipments == 1 && <ShipmentsInSupplyPlanComponent ref="shipmentChild" items={this.state} updateState={this.updateState} toggleLarge={this.toggleLarge} shipmentPage="shipmentDataEntry" />}
                            {/* {this.state.showShipments == 1 && <ShipmentsInSupplyPlanComponent ref="shipmentChild" items={this.state} />} */}
                            <h6 className="red">{this.state.noFundsBudgetError || this.state.shipmentBatchError || this.state.shipmentError || this.state.supplyPlanError}</h6>
                            <div className="table-responsive">
                                <div id="shipmentsDetailsTable" />
                            </div>
                        </Col>
                    </CardBody>
                    <CardFooter>
                        <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            {this.state.shipmentChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipments()}> <i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>}
                            &nbsp;
                        </FormGroup>
                    </CardFooter>
                </Card>

                <Modal isOpen={this.state.batchInfo}
                    className={'modal-lg ' + this.props.className, "modalWidth"}>
                    <ModalHeader toggle={() => this.toggleLarge()} className="modalHeaderSupplyPlan">
                        <strong>{this.state.shipmentModalTitle}</strong>
                    </ModalHeader>
                    <ModalBody>
                        <h6 className="red">{this.state.qtyCalculatorValidationError}</h6>
                        <div className="table-responsive">
                            <div id="qtyCalculatorTable"></div>
                        </div>

                        <div className="table-responsive">
                            <div id="qtyCalculatorTable1"></div>
                        </div>
                        <h6 className="red">{this.state.shipmentDatesError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentDatesTable"></div>
                        </div>
                        <h6 className="red">{this.state.shipmentBatchInfoDuplicateError || this.state.shipmentValidationBatchError}</h6>
                        <div className="table-responsive">
                            <div id="shipmentBatchInfoTable"></div>
                        </div>

                    </ModalBody>
                    <ModalFooter>
                        <div id="showShipmentBatchInfoButtonsDiv" style={{ display: 'none' }}>
                            {this.state.shipmentBatchInfoChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentBatchInfo()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveBatchInfo')}</Button>}
                        </div>
                        <div id="showSaveShipmentsDatesButtonsDiv" style={{ display: 'none' }}>
                            {this.state.shipmentDatesChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentsDate()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentDates')}</Button>}
                        </div>
                        <div id="showSaveQtyButtonDiv" style={{ display: 'none' }}>
                            {this.state.shipmentQtyChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.refs.shipmentChild.saveShipmentQty()} ><i className="fa fa-check"></i>{i18n.t('static.supplyPlan.saveShipmentQty')}</Button>}
                        </div>
                        <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled()}> <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                    </ModalFooter>
                </Modal>
                {/* Consumption modal */}
            </div>
        );
    }
}
