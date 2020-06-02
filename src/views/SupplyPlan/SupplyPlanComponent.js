import React from "react";

import {
    Card, CardBody, CardHeader,
    Col, Table, Modal, ModalBody, ModalFooter, ModalHeader, Button,
    Input, InputGroup, Label, FormGroup, Form, Row
} from 'reactstrap';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';
import { Menu, Item } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';
import { contextMenu } from 'react-contexify';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { Link } from "react-router-dom";
import NumberFormat from 'react-number-format';

const entityname = "Supply plan"

export default class SupplyPlanComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            monthsArray: [],
            programList: [],
            planningUnitList: [],
            planningUnitName: [],
            regionList: [],
            consumptionTotalData: [],
            consumptionDataForAllMonths: [],
            amcTotalData: [],
            consumptionFilteredArray: [],
            regionListFiltered: [],
            consumptionTotalMonthWise: [],
            consumptionChangedFlag: 0,
            inventoryTotalData: [],
            expectedBalTotalData: [],
            suggestedShipmentsTotalData: [],
            inventoryFilteredArray: [],
            inventoryTotalMonthWise: [],
            inventoryChangedFlag: 0,
            monthCount: 0,
            monthCountConsumption: 0,
            monthCountAdjustments: 0,
            minStockArray: [],
            maxStockArray: [],
            minMonthOfStock: 0,
            reorderFrequency: 0,
            programPlanningUnitList: [],
            openingBalanceArray: [],
            closingBalanceArray: [],
            monthsOfStockArray: [],
            suggestedShipmentChangedFlag: 0,
            psmShipmentsTotalData: [],
            nonPsmShipmentsTotalData: [],
            artmisShipmentsTotalData: [],
            plannedPsmChangedFlag: 0
        }
        this.getMonthArray = this.getMonthArray.bind(this);
        this.getPlanningUnitList = this.getPlanningUnitList.bind(this)
        this.formSubmit = this.formSubmit.bind(this);
        this.toggleLarge = this.toggleLarge.bind(this);
        this.saveConsumption = this.saveConsumption.bind(this);
        this.consumptionDetailsClicked = this.consumptionDetailsClicked.bind(this);
        this.consumptionChanged = this.consumptionChanged.bind(this);

        this.adjustmentsDetailsClicked = this.adjustmentsDetailsClicked.bind(this);
        this.inventoryChanged = this.inventoryChanged.bind(this);
        this.checkValidationConsumption = this.checkValidationConsumption.bind(this);
        this.checkValidationInventory = this.checkValidationInventory.bind(this);
        this.inventoryOnedit = this.inventoryOnedit.bind(this);
        this.saveInventory = this.saveInventory.bind(this);

        this.leftClicked = this.leftClicked.bind(this);
        this.rightClicked = this.rightClicked.bind(this);
        this.leftClickedConsumption = this.leftClickedConsumption.bind(this);
        this.rightClickedConsumption = this.rightClickedConsumption.bind(this);

        this.leftClickedAdjustments = this.leftClickedAdjustments.bind(this);
        this.rightClickedAdjustments = this.rightClickedAdjustments.bind(this);

        this.actionCanceled = this.actionCanceled.bind(this);

        this.suggestedShipmentsDetailsClicked = this.suggestedShipmentsDetailsClicked.bind(this);
        this.suggestedShipmentChanged = this.suggestedShipmentChanged.bind(this);
        this.saveSuggestedShipments = this.saveSuggestedShipments.bind(this);
        this.checkValidationSuggestedShipments = this.checkValidationSuggestedShipments.bind(this);


        this.budgetChanged = this.budgetChanged.bind(this);
        this.checkBudgetValidation = this.checkBudgetValidation.bind(this);
        this.shipmentStatusDropdownFilter = this.shipmentStatusDropdownFilter.bind(this);
        this.procurementUnitDropdownFilter = this.procurementUnitDropdownFilter.bind(this);
        this.shipmentsDetailsClicked = this.shipmentsDetailsClicked.bind(this);
        this.shipmentChanged = this.shipmentChanged.bind(this);
        this.saveShipments = this.saveShipments.bind(this);
        this.checkValidationForShipments = this.checkValidationForShipments.bind(this);

        this.budgetDropdownFilter = this.budgetDropdownFilter.bind(this);
    }

    componentDidMount() {
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
                // Handle errors!
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
                            name: getLabelText(JSON.parse(programNameLabel), lan) + "~v" + myResult[i].version,
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

    getPlanningUnitList(event) {
        const lan = 'en';
        var db1;
        var storeOS;
        getDatabase();
        var regionList = [];
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(['programData'], 'readwrite');
            var programDataOs = programDataTransaction.objectStore('programData');
            var programRequest = programDataOs.get(document.getElementById("programId").value);
            programRequest.onerror = function (event) {
                // Handle errors!
            };
            programRequest.onsuccess = function (e) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                for (var i = 0; i < programJson.regionList.length; i++) {
                    var regionJson = {
                        name: getLabelText(programJson.regionList[i].label, lan),
                        id: programJson.regionList[i].regionId
                    }
                    regionList[i] = regionJson

                }
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
                    var programId = (document.getElementById("programId").value).split("_")[0];
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
                        planningUnitList: proList,
                        programPlanningUnitList: myResult,
                        regionList: regionList
                    })
                }.bind(this);
            }.bind(this);
        }.bind(this)
    }

    getMonthArray(currentDate) {
        var month = [];
        var curDate = currentDate.subtract(8, 'months');
        month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')), display: 0 })
        for (var i = 0; i < 22; i++) {
            var display = 1;
            if (i < 2 || i >= 20) {
                display = 0;
            }
            var curDate = currentDate.add(1, 'months');
            month.push({ startDate: curDate.startOf('month').format('YYYY-MM-DD'), endDate: curDate.endOf('month').format('YYYY-MM-DD'), month: (curDate.format('MMM YY')), display: display })
        }
        this.setState({
            monthsArray: month
        })
        return month;
    }

    formSubmit(monthCount) {
        document.getElementById("supplyPlanTableId").style.display = 'block';

        var m = this.getMonthArray(moment(Date.now()).add(monthCount, 'months').utcOffset('-0500'));

        var programId = document.getElementById("programId").value;
        var regionId = -1;
        var planningUnitId = document.getElementById("planningUnitId").value;

        var planningUnit = document.getElementById("planningUnitId");
        var planningUnitName = planningUnit.options[planningUnit.selectedIndex].text;

        var programPlanningUnit = ((this.state.programPlanningUnitList).filter(p => p.planningUnit.id = planningUnitId))[0];
        var minMonthsOfStock = programPlanningUnit.minMonthsOfStock;
        var reorderFrequencyInMonths = programPlanningUnit.reorderFrequencyInMonths;

        var regionListFiltered = [];
        if (regionId != -1) {
            regionListFiltered = (this.state.regionList).filter(r => r.id == regionId);
        } else {
            regionListFiltered = this.state.regionList
        }

        var db1;
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);
            var consumptionTotalData = [];

            var consumptionDataForAllMonths = [];
            var amcTotalData = [];

            var consumptionTotalMonthWise = [];
            var filteredArray = [];
            var minStockArray = [];
            var maxStockArray = [];

            var inventoryTotalData = [];
            var expectedBalTotalData = [];
            var suggestedShipmentsTotalData = [];
            var inventoryTotalMonthWise = [];
            var filteredArrayInventory = [];
            var openingBalanceArray = [];
            var closingBalanceArray = [];

            var psmFilteredArray = [];
            var psmShipmentsTotalData = [];
            var nonPsmFilteredArray = [];
            var nonPsmShipmentsTotalData = [];
            var artmisFilteredArray = [];
            var artmisShipmentsTotalData = [];
            var jsonArrForGraph = [];
            var monthsOfStockArray = [];

            var plannedTotalShipmentsBasedOnMonth = [];
            var draftTotalShipmentsBasedOnMonth = [];
            var submittedTotalShipmentsBasedOnMonth = [];
            var approvedTotalShipmentsBasedOnMonth = [];
            var shippedTotalShipmentsBasedOnMonth = [];
            var arrivedTotalShipmentsBasedOnMonth = [];
            var deliveredTotalShipmentsBasedOnMonth = [];
            var cancelledTotalShipmentsBasedOnMonth = [];
            var onHoldTotalShipmentsBasedOnMonth = [];
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);

                var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
                if (regionId != -1) {
                    consumptionList = consumptionList.filter(c => c.region.id == regionId)
                }

                for (var i = 0; i < 23; i++) {
                    var c = consumptionList.filter(c => (c.consumptionDate >= m[i].startDate && c.consumptionDate <= m[i].endDate))
                    var consumptionQty = 0;
                    var filteredJson = { consumptionQty: '', region: { id: 0 }, month: m[i] };
                    for (var j = 0; j < c.length; j++) {
                        var count = 0;
                        for (var k = 0; k < c.length; k++) {
                            if (c[j].consumptionDate == c[k].consumptionDate && c[j].region.id == c[k].region.id && j != k) {
                                count++;
                            } else {

                            }
                        }
                        if (count == 0) {
                            consumptionQty += parseInt((c[j].consumptionQty));
                            filteredJson = { month: m[i], region: c[j].region, consumptionQty: consumptionQty, consumptionId: c[j].consumptionId, actualFlag: c[j].actualFlag, consumptionDate: c[j].consumptionDate };
                        } else {
                            if (c[j].actualFlag.toString() == 'true') {
                                consumptionQty += parseInt((c[j].consumptionQty));
                                filteredJson = { month: m[i], region: c[j].region, consumptionQty: consumptionQty, consumptionId: c[j].consumptionId, actualFlag: c[j].actualFlag, consumptionDate: c[j].consumptionDate };
                            }
                        }
                    }

                    // Logic for consumption data for all months
                    if (c.length == 0) {
                        consumptionDataForAllMonths.push('');
                    } else {
                        consumptionDataForAllMonths.push(consumptionQty);
                    }

                    // Consumption details
                    if (i >= 3 && i < 21) {
                        if (c.length == 0) {
                            consumptionTotalData.push("");
                        } else {
                            consumptionTotalData.push(consumptionQty);
                        }
                        filteredArray.push(filteredJson);
                    }
                }

                // Calculations for AMC
                for (var i = 3; i < 21; i++) {
                    var amcM1 = 0;
                    var amcM2 = 0;
                    var amcM3 = 0;
                    var amcM4 = 0;
                    var amcM5 = 0;
                    var amcM6 = 0;
                    var countAMC = 0;
                    if (consumptionDataForAllMonths[i - 3] != '') {
                        amcM1 = consumptionDataForAllMonths[i - 3]
                        countAMC++;
                    }
                    if (consumptionDataForAllMonths[i - 2] != '') {
                        amcM2 = consumptionDataForAllMonths[i - 2]
                        countAMC++;
                    }
                    if (consumptionDataForAllMonths[i - 1] != '') {
                        amcM3 = consumptionDataForAllMonths[i - 1]
                        countAMC++;
                    }
                    if (consumptionDataForAllMonths[i] != '') {
                        amcM4 = consumptionDataForAllMonths[i]
                        countAMC++;
                    }
                    if (consumptionDataForAllMonths[i + 1] != '') {
                        amcM5 = consumptionDataForAllMonths[i + 1]
                        countAMC++;
                    }
                    if (consumptionDataForAllMonths[i + 2] != '') {
                        amcM6 = consumptionDataForAllMonths[i + 2]
                        countAMC++;
                    }
                    if (countAMC != 0) {
                        var amcCalcualted = Math.floor((parseInt(amcM1) + parseInt(amcM2) + parseInt(amcM3)
                            + parseInt(amcM4)
                            + parseInt(amcM5) + parseInt(amcM6)) / countAMC);
                        amcTotalData.push(amcCalcualted);

                        // Calculations for Min stock
                        var maxForMonths = 0;
                        if (3 > minMonthsOfStock) {
                            maxForMonths = 3
                        } else {
                            maxForMonths = minMonthsOfStock
                        }
                        var minStock = parseInt(parseInt(amcCalcualted) * parseInt(maxForMonths));
                        minStockArray.push(minStock);


                        // Calculations for Max Stock
                        var minForMonths = 0;
                        if (18 < (maxForMonths + reorderFrequencyInMonths)) {
                            minForMonths = 18
                        } else {
                            minForMonths = (maxForMonths + reorderFrequencyInMonths);
                        }
                        var maxStock = parseInt(parseInt(amcCalcualted) * parseInt(minForMonths));;
                        maxStockArray.push(maxStock);
                    } else {
                        amcTotalData.push("");
                        minStockArray.push("");
                        maxStockArray.push("");
                    }
                }

                // Region wise calculations for consumption
                for (var i = 0; i < regionListFiltered.length; i++) {
                    var regionCount = 0;
                    var f = filteredArray.length
                    for (var j = 0; j < f; j++) {
                        if (filteredArray[j].region.id == 0) {
                            filteredArray[j].region.id = regionListFiltered[i].id;
                        }
                        if (regionListFiltered[i].id == filteredArray[j].region.id) {
                            regionCount++;
                        }
                    }
                    if (regionCount == 0) {
                        for (var k = 3; k < 21; k++) {
                            filteredArray.push({ consumptionQty: '', region: { id: regionListFiltered[i].id }, month: m[k] })
                        }
                    }
                }
                for (var i = 3; i < 21; i++) {
                    var consumptionListFilteredForMonth = filteredArray.filter(c => c.consumptionQty == '' || c.month.month == m[i].month);
                    var monthWiseCount = 0;
                    for (var cL = 0; cL < consumptionListFilteredForMonth.length; cL++) {
                        if (consumptionListFilteredForMonth[cL].consumptionQty != '') {
                            monthWiseCount += parseInt(consumptionListFilteredForMonth[cL].consumptionQty);
                        }
                    }
                    consumptionTotalMonthWise.push(monthWiseCount);
                }

                // Inventory part
                var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
                if (regionId != -1) {
                    inventoryList = inventoryList.filter(c => c.region.id == regionId)
                }
                for (var i = 3; i < 21; i++) {
                    var c = inventoryList.filter(c => (c.inventoryDate >= m[i].startDate && c.inventoryDate <= m[i].endDate))
                    var adjustmentQty = 0;
                    var filteredJsonInventory = { adjustmentQty: '', region: { id: 0 }, month: m[i] };
                    for (var j = 0; j < c.length; j++) {
                        adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                        filteredJsonInventory = { month: m[i], region: c[j].region, adjustmentQty: adjustmentQty, inventoryId: c[j].inventoryId, inventoryDate: c[j].inventoryDate };
                    }
                    if (c.length == 0) {
                        inventoryTotalData.push("");
                    } else {
                        inventoryTotalData.push(adjustmentQty);
                    }
                    filteredArrayInventory.push(filteredJsonInventory);
                }

                // Region wise calculations for inventory
                for (var i = 0; i < regionListFiltered.length; i++) {
                    var regionCount = 0;
                    var f = filteredArrayInventory.length
                    for (var j = 0; j < f; j++) {
                        if (filteredArrayInventory[j].region.id == 0) {
                            filteredArrayInventory[j].region.id = regionListFiltered[i].id;
                        }
                        if (regionListFiltered[i].id == filteredArrayInventory[j].region.id) {
                            regionCount++;
                        }
                    }
                    if (regionCount == 0) {
                        for (var k = 3; k < 21; k++) {
                            filteredArrayInventory.push({ adjustmentQty: '', region: { id: regionListFiltered[i].id }, month: m[k] })
                        }
                    }
                }
                for (var i = 3; i < 21; i++) {
                    var inventoryListFilteredForMonth = filteredArrayInventory.filter(c => c.adjustmentQty == '' || c.month.month == m[i].month);
                    var monthWiseCount = 0;
                    for (var cL = 0; cL < inventoryListFilteredForMonth.length; cL++) {
                        if (inventoryListFilteredForMonth[cL].adjustmentQty != '') {
                            monthWiseCount += parseInt(inventoryListFilteredForMonth[cL].adjustmentQty);
                        }
                    }
                    inventoryTotalMonthWise.push(monthWiseCount);
                }

                // Shipments part
                var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != 8);
                for (var i = 3; i < 21; i++) {
                    var psm = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.erpFlag == false && c.procurementAgent.id == 1)
                    var nonPsm = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.procurementAgent.id != 1)
                    var artmisShipments = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate) && c.erpFlag == true)
                    var psmQty = 0;
                    var psmToBeAccounted = 0;
                    var nonPsmQty = 0;
                    var nonPsmToBeAccounted = 0;
                    var artmisQty = 0;
                    var artmisToBeAccounted = 0;
                    var psmEmergencyOrder = 0;
                    var artmisEmergencyOrder = 0;
                    var nonPsmEmergencyOrder = 0;
                    for (var j = 0; j < psm.length; j++) {
                        psmQty += parseFloat((psm[j].quantity));
                        if (psm[j].accountFlag == 1) {
                            psmToBeAccounted = 1;
                        }
                        if (psm[j].emergencyOrder == 1) {
                            psmEmergencyOrder = 1;
                        }
                    }
                    if (psm.length == 0) {
                        psmShipmentsTotalData.push("");
                    } else {
                        psmShipmentsTotalData.push({ qty: psmQty, accountFlag: psmToBeAccounted, index: i - 3, month: m[i], isEmergencyOrder: psmEmergencyOrder });
                    }

                    for (var np = 0; np < nonPsm.length; np++) {
                        nonPsmQty += parseFloat((nonPsm[np].quantity));
                        if (nonPsm[np].accountFlag == 1) {
                            nonPsmToBeAccounted = 1;
                        }

                        if (nonPsm[np].emergencyOrder == 1) {
                            nonPsmEmergencyOrder = 1;
                        }
                    }
                    if (nonPsm.length == 0) {
                        nonPsmShipmentsTotalData.push("");
                    } else {
                        nonPsmShipmentsTotalData.push({ qty: nonPsmQty, accountFlag: nonPsmToBeAccounted, index: i - 3, month: m[i], isEmergencyOrder: nonPsmEmergencyOrder });
                    }

                    for (var a = 0; a < artmisShipments.length; a++) {
                        artmisQty += parseFloat((artmisShipments[a].quantity));
                        if (artmisShipments[a].accountFlag == 1) {
                            artmisToBeAccounted = 1;
                        }
                        if (psm[a].emergencyOrder == 1) {
                            artmisEmergencyOrder = 1;
                        }
                    }
                    if (artmisShipments.length == 0) {
                        artmisShipmentsTotalData.push("");
                    } else {
                        artmisShipmentsTotalData.push({ qty: artmisQty, accountFlag: artmisToBeAccounted, index: i - 3, month: m[i], isEmergencyOrder: artmisEmergencyOrder });
                    }
                }

                // Calculation of opening and closing balance
                var openingBalance = 0;
                var totalConsumption = 0;
                var totalAdjustments = 0;
                var totalShipments = 0;

                var consumptionRemainingList = consumptionList.filter(c => c.consumptionDate < m[3].startDate);
                for (var j = 0; j < consumptionRemainingList.length; j++) {
                    var count = 0;
                    for (var k = 0; k < consumptionRemainingList.length; k++) {
                        if (consumptionRemainingList[j].consumptionDate == consumptionRemainingList[k].consumptionDate && consumptionRemainingList[j].region.id == consumptionRemainingList[k].region.id && j != k) {
                            count++;
                        } else {

                        }
                    }
                    if (count == 0) {
                        totalConsumption += parseInt((consumptionRemainingList[j].consumptionQty));
                    } else {
                        if (consumptionRemainingList[j].actualFlag.toString() == 'true') {
                            totalConsumption += parseInt((consumptionRemainingList[j].consumptionQty));
                        }
                    }
                }

                var adjustmentsRemainingList = inventoryList.filter(c => c.inventoryDate < m[3].startDate);
                for (var j = 0; j < adjustmentsRemainingList.length; j++) {
                    totalAdjustments += parseFloat((adjustmentsRemainingList[j].adjustmentQty * adjustmentsRemainingList[j].multiplier));
                }

                var shipmentsRemainingList = shipmentList.filter(c => c.orderedDate < m[3].startDate && c.accountFlag == true);
                for (var j = 0; j < shipmentsRemainingList.length; j++) {
                    totalShipments += parseFloat((shipmentsRemainingList[j].quantity));
                }
                openingBalance = totalAdjustments - totalConsumption + totalShipments;
                openingBalanceArray.push(openingBalance);
                for (var i = 1; i <= 18; i++) {

                    var consumptionQtyForCB = 0;
                    if (consumptionTotalData[i - 1] != "") {
                        consumptionQtyForCB = consumptionTotalData[i - 1];
                    }
                    var inventoryQtyForCB = 0;
                    if (inventoryTotalData[i - 1] != "") {
                        inventoryQtyForCB = inventoryTotalData[i - 1];
                    }
                    var psmShipmentQtyForCB = 0;
                    if (psmShipmentsTotalData[i - 1] != "" && psmShipmentsTotalData[i - 1].accountFlag == true) {
                        psmShipmentQtyForCB = psmShipmentsTotalData[i - 1].qty;
                    }

                    var nonPsmShipmentQtyForCB = 0;
                    if (nonPsmShipmentsTotalData[i - 1] != "" && nonPsmShipmentsTotalData[i - 1].accountFlag == true) {
                        nonPsmShipmentQtyForCB = nonPsmShipmentsTotalData[i - 1].qty;
                    }

                    var artmisShipmentQtyForCB = 0;
                    if (artmisShipmentsTotalData[i - 1] != "" && artmisShipmentsTotalData[i - 1].accountFlag == true) {
                        artmisShipmentQtyForCB = artmisShipmentsTotalData[i - 1].qty;
                    }

                    // Suggested shipments part
                    var s = i - 1;
                    var month = m[s + 3].startDate;
                    var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                    var compare = (month >= currentMonth);
                    var stockInHand = openingBalanceArray[s] - consumptionQtyForCB + inventoryQtyForCB + psmShipmentQtyForCB + nonPsmShipmentQtyForCB + artmisShipmentQtyForCB;
                    if (compare && parseInt(stockInHand) <= parseInt(minStockArray[s])) {
                        var suggestedOrd = parseInt(maxStockArray[s] - minStockArray[s]);
                        if (suggestedOrd == 0) {
                            var addLeadTimes = parseInt(parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                                parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                                parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime)) + 1;
                            var expectedDeliveryDate = moment(month).subtract(addLeadTimes, 'months').format("YYYY-MM-DD");
                            var isEmergencyOrder = 0;
                            if (expectedDeliveryDate >= currentMonth) {
                                isEmergencyOrder = 0;
                            } else {
                                isEmergencyOrder = 1;
                            }
                            suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": m[s + 3].startDate, "isEmergencyOrder": isEmergencyOrder });
                        } else {
                            var addLeadTimes = parseInt(parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                                parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                                parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime)) + 1;
                            var expectedDeliveryDate = moment(month).subtract(addLeadTimes, 'months').format("YYYY-MM-DD");
                            var isEmergencyOrder = 0;
                            if (expectedDeliveryDate >= currentMonth) {
                                isEmergencyOrder = 0;
                            } else {
                                isEmergencyOrder = 1;
                            }
                            suggestedShipmentsTotalData.push({ "suggestedOrderQty": suggestedOrd, "month": m[s + 3].startDate, "isEmergencyOrder": isEmergencyOrder });
                        }
                    } else {
                        var addLeadTimes = parseInt(parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                            parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                            parseFloat(programJson.shippedToArrivedBySeaLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime)) + 1;
                        var expectedDeliveryDate = moment(month).subtract(addLeadTimes, 'months').format("YYYY-MM-DD");
                        var isEmergencyOrder = 0;
                        if (expectedDeliveryDate >= currentMonth) {
                            isEmergencyOrder = 0;
                        } else {
                            isEmergencyOrder = 1;
                        }
                        suggestedShipmentsTotalData.push({ "suggestedOrderQty": "", "month": m[s + 3].startDate, "isEmergencyOrder": isEmergencyOrder });
                    }

                    var suggestedShipmentQtyForCB = 0;
                    if (suggestedShipmentsTotalData[i - 1].suggestedOrderQty != "") {
                        suggestedShipmentQtyForCB = suggestedShipmentsTotalData[i - 1].suggestedOrderQty;
                    }
                    var closingBalance = openingBalanceArray[i - 1] - consumptionQtyForCB + inventoryQtyForCB + psmShipmentQtyForCB + nonPsmShipmentQtyForCB + artmisShipmentQtyForCB + suggestedShipmentQtyForCB;
                    closingBalanceArray.push(closingBalance);
                    if (i != 18) {
                        openingBalanceArray.push(closingBalance);
                    }
                }

                // Calculations for monthsOfStock
                for (var s = 0; s < 18; s++) {
                    if (closingBalanceArray[s] != 0 && amcTotalData[s] != 0 && closingBalanceArray[s] != "" && amcTotalData[s] != "") {
                        var mos = parseFloat(closingBalanceArray[s] / amcTotalData[s]).toFixed(2);
                        monthsOfStockArray.push(mos);
                    } else {
                        monthsOfStockArray.push("");
                    }
                }

                // Calculating shipments based on shipment status
                var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);

                for (var i = 3; i < 21; i++) {
                    var shipmentsBasedOnMonth = shipmentList.filter(c => (c.expectedDeliveryDate >= m[i].startDate && c.expectedDeliveryDate <= m[i].endDate));

                    var plannedShipmentQty = 0;
                    var draftShipmentQty = 0;
                    var submittedShipmentQty = 0;
                    var approvedShipmentQty = 0;
                    var shippedShipmentQty = 0;
                    var arrivedShipmentQty = 0;
                    var deliveredShipmentQty = 0;
                    var cancelledShipmentQty = 0;
                    var onHoldShipmentQty = 0;

                    var plannedShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == 1);
                    for (var j = 0; j < plannedShipments.length; j++) {
                        plannedShipmentQty += parseInt((plannedShipments[j].quantity));
                    }
                    plannedTotalShipmentsBasedOnMonth.push(plannedShipmentQty);

                    var draftShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == 2);
                    for (var j = 0; j < draftShipments.length; j++) {
                        draftShipmentQty += parseInt((draftShipments[j].quantity));
                    }
                    draftTotalShipmentsBasedOnMonth.push(draftShipmentQty);

                    var submittedShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == 3);
                    for (var j = 0; j < submittedShipments.length; j++) {
                        submittedShipmentQty += parseInt((submittedShipments[j].quantity));
                    }
                    submittedTotalShipmentsBasedOnMonth.push(submittedShipmentQty);

                    var approvedShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == 4);
                    for (var j = 0; j < approvedShipments.length; j++) {
                        approvedShipmentQty += parseInt((approvedShipments[j].quantity));
                    }
                    approvedTotalShipmentsBasedOnMonth.push(approvedShipmentQty);

                    var shippedShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == 5);
                    for (var j = 0; j < shippedShipments.length; j++) {
                        shippedShipmentQty += parseInt((shippedShipments[j].quantity));
                    }
                    shippedTotalShipmentsBasedOnMonth.push(shippedShipmentQty);

                    var arrivedShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == 6);
                    for (var j = 0; j < arrivedShipments.length; j++) {
                        arrivedShipmentQty += parseInt((arrivedShipments[j].quantity));
                    }
                    arrivedTotalShipmentsBasedOnMonth.push(arrivedShipmentQty);

                    var deliveredShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == 7);
                    for (var j = 0; j < deliveredShipments.length; j++) {
                        deliveredShipmentQty += parseInt((deliveredShipments[j].quantity));
                    }
                    deliveredTotalShipmentsBasedOnMonth.push(deliveredShipmentQty);

                    var cancelledShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == 8);
                    for (var j = 0; j < cancelledShipments.length; j++) {
                        cancelledShipmentQty += parseInt((cancelledShipments[j].quantity));
                    }
                    cancelledTotalShipmentsBasedOnMonth.push(cancelledShipmentQty);

                    var onHoldShipments = shipmentsBasedOnMonth.filter(c => c.shipmentStatus.id == 9);
                    for (var j = 0; j < onHoldShipments.length; j++) {
                        onHoldShipmentQty += parseInt((onHoldShipments[j].quantity));
                    }
                    onHoldTotalShipmentsBasedOnMonth.push(onHoldShipmentQty);

                }

                // Building json for graph
                for (var jsonForGraph = 0; jsonForGraph < 18; jsonForGraph++) {
                    var json = {
                        month: m[jsonForGraph + 3].month,
                        consumption: consumptionTotalData[jsonForGraph],
                        stock: inventoryTotalData[jsonForGraph],
                        planned: plannedTotalShipmentsBasedOnMonth[jsonForGraph],
                        draft: draftTotalShipmentsBasedOnMonth[jsonForGraph],
                        submitted: submittedTotalShipmentsBasedOnMonth[jsonForGraph],
                        approved: approvedTotalShipmentsBasedOnMonth[jsonForGraph],
                        shipped: shippedTotalShipmentsBasedOnMonth[jsonForGraph],
                        arrived: arrivedTotalShipmentsBasedOnMonth[jsonForGraph],
                        delivered: deliveredTotalShipmentsBasedOnMonth[jsonForGraph],
                        cancelled: cancelledTotalShipmentsBasedOnMonth[jsonForGraph],
                        onHold: onHoldTotalShipmentsBasedOnMonth[jsonForGraph]
                    }
                    jsonArrForGraph.push(json);
                }
                console.log("JsonforGrpah----------------->", jsonArrForGraph);
                this.setState({
                    suggestedShipmentsTotalData: suggestedShipmentsTotalData,
                    inventoryTotalData: inventoryTotalData,
                    inventoryFilteredArray: filteredArrayInventory,
                    regionListFiltered: regionListFiltered,
                    inventoryTotalMonthWise: inventoryTotalMonthWise,
                    openingBalanceArray: openingBalanceArray,
                    closingBalanceArray: closingBalanceArray,
                    consumptionTotalData: consumptionTotalData,
                    consumptionFilteredArray: filteredArray,
                    consumptionTotalMonthWise: consumptionTotalMonthWise,
                    amcTotalData: amcTotalData,
                    minStockArray: minStockArray,
                    maxStockArray: maxStockArray,
                    monthsOfStockArray: monthsOfStockArray,
                    planningUnitName: planningUnitName,
                    psmShipmentsTotalData: psmShipmentsTotalData,
                    nonPsmShipmentsTotalData: nonPsmShipmentsTotalData,
                    artmisShipmentsTotalData: artmisShipmentsTotalData,
                    jsonArrForGraph: jsonArrForGraph
                })
            }.bind(this)
        }.bind(this)

    }

    toggleLarge(supplyPlanType, month, quantity, startDate, endDate, isEmergencyOrder) {
        var supplyPlanType = supplyPlanType;
        this.setState({
            consumptionError: '',
            inventoryError: '',
            shipmentError: '',
            shipmentDuplicateError: '',
            shipmentBudgetError: '',
            suggestedShipmentError: '',
            suggestedShipmentDuplicateError: '',
            budgetError: '',
            consumptionDuplicateError: '',
            inventoryDuplicateError: '',

        })
        if (supplyPlanType == 'Consumption') {
            var monthCountConsumption = this.state.monthCount;
            this.setState({
                consumption: !this.state.consumption,
                monthCountConsumption: monthCountConsumption,
            });
            this.formSubmit(monthCountConsumption);
        } else if (supplyPlanType == 'SuggestedShipments') {
            this.setState({
                suggestedShipments: !this.state.suggestedShipments,
            });
            this.suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder);
        } else if (supplyPlanType == 'psmShipments') {
            this.setState({
                psmShipments: !this.state.psmShipments
            });
            this.shipmentsDetailsClicked(supplyPlanType, startDate, endDate);
        } else if (supplyPlanType == 'artmisShipments') {
            this.setState({
                artmisShipments: !this.state.artmisShipments,
            });
            this.shipmentsDetailsClicked(supplyPlanType, startDate, endDate);
        }
        else if (supplyPlanType == 'nonPsmShipments') {
            this.setState({
                nonPsmShipments: !this.state.nonPsmShipments
            });
            this.shipmentsDetailsClicked(supplyPlanType, startDate, endDate);
        } else if (supplyPlanType == 'Adjustments') {
            var monthCountAdjustments = this.state.monthCount;
            this.setState({
                adjustments: !this.state.adjustments,
                monthCountAdjustments: monthCountAdjustments
            });
            this.formSubmit(monthCountAdjustments);
        }
    }

    actionCanceled(supplyPlanType) {
        var inputs = document.getElementsByClassName("submitBtn");
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].disabled = true;
        }
        this.setState({
            message: i18n.t('static.message.cancelled'),
            consumptionError: '',
            inventoryError: '',
            shipmentError: '',
            suggestedShipmentError: '',
            shipmentDuplicateError: '',
            shipmentBudgetError: '',
            suggestedShipmentDuplicateError: '',
            budgetError: '',
            consumptionChangedFlag: 0,
            suggestedShipmentChangedFlag: 0,
            inventoryChangedFlag: 0,
            consumptionDuplicateError: '',
            inventoryDuplicateError: ''

        })
        this.toggleLarge(supplyPlanType);
    }

    leftClicked() {
        var monthCount = (this.state.monthCount) - 1;
        this.setState({
            monthCount: monthCount
        })
        this.formSubmit(monthCount)
    }

    rightClicked() {
        var monthCount = (this.state.monthCount) + 1;
        this.setState({
            monthCount: monthCount
        })
        this.formSubmit(monthCount)
    }

    leftClickedConsumption() {
        var monthCountConsumption = (this.state.monthCountConsumption) - 1;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(monthCountConsumption)
    }

    rightClickedConsumption() {
        var monthCountConsumption = (this.state.monthCountConsumption) + 1;
        this.setState({
            monthCountConsumption: monthCountConsumption
        })
        this.formSubmit(monthCountConsumption);
    }

    leftClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) - 1;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(monthCountAdjustments)
    }

    rightClickedAdjustments() {
        var monthCountAdjustments = (this.state.monthCountAdjustments) + 1;
        this.setState({
            monthCountAdjustments: monthCountAdjustments
        })
        this.formSubmit(monthCountAdjustments);
    }

    // Consumption Functionality

    // Show consumption details
    consumptionDetailsClicked(startDate, endDate, region, actualFlag, month) {
        if (this.state.consumptionChangedFlag == 0) {
            var planningUnitId = document.getElementById("planningUnitId").value;
            var programId = document.getElementById("programId").value;
            var db1;
            var dataSourceList = [];
            var myVar = '';
            getDatabase();
            var openRequest = indexedDB.open('fasp', 1);
            openRequest.onsuccess = function (e) {
                db1 = e.target.result;
                var transaction = db1.transaction(['programData'], 'readwrite');
                var programTransaction = transaction.objectStore('programData');
                var programRequest = programTransaction.get(programId);
                var consumptionTotalData = [];
                var filteredArray = [];
                programRequest.onsuccess = function (event) {
                    var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                    var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                    var dataSourceRequest = dataSourceOs.getAll();
                    dataSourceRequest.onsuccess = function (event) {
                        var dataSourceResult = [];
                        dataSourceResult = dataSourceRequest.result;
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

                        var consumptionListUnFiltered = (programJson.consumptionList);
                        this.setState({
                            consumptionListUnFiltered: consumptionListUnFiltered
                        })
                        var consumptionList = consumptionListUnFiltered.filter(con =>
                            con.planningUnit.id == planningUnitId
                            && con.region.id == region
                            && ((con.consumptionDate >= startDate && con.consumptionDate <= endDate)));
                        this.el = jexcel(document.getElementById("consumptionDetailsTable"), '');
                        this.el.destroy();
                        var data = [];
                        var consumptionDataArr = []
                        for (var j = 0; j < consumptionList.length; j++) {
                            data = [];
                            data[0] = month;
                            data[1] = consumptionList[j].region.id;
                            data[2] = consumptionList[j].dataSource.id;
                            data[3] = consumptionList[j].consumptionQty;
                            data[4] = consumptionList[j].dayOfStockOut;
                            if (consumptionList[j].notes === null || ((consumptionList[j].notes).trim() == "NULL")) {
                                data[5] = "";
                            } else {
                                data[5] = consumptionList[j].notes;
                            }
                            data[6] = consumptionListUnFiltered.findIndex(c => c.planningUnit.id == planningUnitId && c.region.id == region && c.consumptionDate == consumptionList[j].consumptionDate && c.actualFlag.toString() == consumptionList[j].actualFlag.toString());
                            data[7] = "";
                            data[8] = consumptionList[j].actualFlag;
                            data[9] = consumptionList[j].active;
                            consumptionDataArr[j] = data;
                        }
                        if (consumptionList.length == 0) {
                            data = [];
                            data[0] = month;
                            data[1] = region;
                            data[2] = "";
                            data[3] = "";
                            data[4] = "";
                            data[5] = "";
                            data[6] = -1;
                            data[7] = startDate;
                            data[8] = "";
                            data[9] = "";
                            consumptionDataArr[0] = data;
                        }
                        var options = {
                            data: consumptionDataArr,
                            colHeaders: [
                                "Month",
                                "Region",
                                "Data source",
                                "Quantity",
                                "Days of Stock out",
                                "Notes",
                                "index",
                                "consumption date",
                                i18n.t('static.consumption.actualflag'),
                                i18n.t('static.common.active')
                            ],
                            colWidths: [80, 150, 200, 80, 80, 350],
                            columns: [
                                { type: 'text', readOnly: true },
                                { type: 'dropdown', readOnly: true, source: this.state.regionList },
                                { type: 'dropdown', source: dataSourceList },
                                { type: 'numeric' },
                                { type: 'numeric' },
                                { type: 'text' },
                                { type: 'hidden' },
                                { type: 'hidden' },
                                { type: 'checkbox' },
                                { type: 'checkbox' }
                            ],
                            pagination: false,
                            search: false,
                            columnSorting: true,
                            tableOverflow: true,
                            wordWrap: true,
                            allowInsertColumn: false,
                            allowManualInsertColumn: false,
                            allowDeleteRow: false,
                            // allowInsertRow: true,
                            allowManualInsertRow: false,
                            onchange: this.consumptionChanged,
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
                                        var json = obj.getJson();
                                        if (json.length < 2) {
                                            items.push({
                                                title: obj.options.text.insertANewRowAfter,
                                                onclick: function () {
                                                    var json = obj.getJson();
                                                    var map = new Map(Object.entries(json[0]));
                                                    var data = [];
                                                    data[0] = map.get("0");
                                                    data[1] = map.get("1");
                                                    data[2] = "";
                                                    data[3] = "";
                                                    data[4] = "";
                                                    data[5] = "";
                                                    data[6] = -1;
                                                    data[7] = startDate;
                                                    data[8] = "";
                                                    data[9] = "";
                                                    consumptionDataArr[0] = data;
                                                    obj.insertRow(data);
                                                }.bind(this)
                                            });
                                        }
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
                                        title: 'Export as csv',
                                        shortcut: 'Ctrl + S',
                                        onclick: function () {
                                            obj.download(true);
                                        }
                                    });
                                }

                                return items;
                            }.bind(this)
                        };
                        myVar = jexcel(document.getElementById("consumptionDetailsTable"), options);
                        this.el = myVar;
                        this.setState({
                            consumptionEl: myVar
                        })
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                consumptionError: "You need to save the data first."
            })
        }
    }

    // Consumption changed
    consumptionChanged = function (instance, cell, x, y, value) {
        this.setState({
            consumptionError: "",
            consumptionDuplicateError: ""
        })
        var elInstance = this.state.consumptionEl;
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }
        if (x == 8) {
            var col = ("I").concat(parseInt(y) + 1);
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
        }
        if (x == 3) {
            var reg = /^[0-9\b]+$/;
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "In valid number.");
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }
        }
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            var reg = /^[0-9\b]+$/;
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "In valid number.");
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

            }
        }
        this.setState({
            consumptionChangedFlag: 1
        })
    }

    // consumption final validations
    checkValidationConsumption() {
        var valid = true;
        var elInstance = this.state.consumptionEl;
        var json = elInstance.getJson();
        var mapArray = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("8") == map.get("8")
            )
            if (checkDuplicateInMap.length > 1) {
                var colArr = ['I'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "Duplicate consumption");
                }
                valid = false;
                this.setState({
                    consumptionDuplicateError: 'Duplicate consumption'
                })
            } else {
                var colArr = ['I'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                var col = ("C").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(2, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "This field is required.");
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("D").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(3, y);
                var reg = /^[0-9\b]+$/;
                if (value === "" || isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                        elInstance.setComments(col, "in valid number.");
                    } else {
                        elInstance.setComments(col, "This field is required.");
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var reg = /^[0-9\b]+$/;
                var col = ("E").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(4, y);
                if (value === "" || isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                        elInstance.setComments(col, "in valid number.");
                    } else {
                        elInstance.setComments(col, "This field is required.");
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }
        return valid;

    }

    // Save consumption
    saveConsumption() {
        this.setState({
            consumptionError: '',
            consumptionDuplicateError: ''
        })
        var validation = this.checkValidationConsumption();
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            var elInstance = this.state.consumptionEl;
            var json = elInstance.getJson();
            var planningUnitId = document.getElementById("planningUnitId").value;
            var productCategoryId = (this.state.programPlanningUnitList).filter(c => c.planningUnit.id == planningUnitId);
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
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var consumptionDataList = (programJson.consumptionList);
                    for (var i = 0; i < json.length; i++) {
                        var map = new Map(Object.entries(json[i]));
                        if (map.get("6") != -1) {
                            consumptionDataList[parseInt(map.get("6"))].dataSource.id = map.get("2");
                            consumptionDataList[parseInt(map.get("6"))].consumptionQty = map.get("3");
                            consumptionDataList[parseInt(map.get("6"))].dayOfStockOut = parseInt(map.get("4"));
                            consumptionDataList[parseInt(map.get("6"))].notes = map.get("5");
                            consumptionDataList[parseInt(map.get("6"))].actualFlag = map.get("8");
                            consumptionDataList[parseInt(map.get("6"))].active = map.get("9");
                        } else {
                            var consumptionJson = {
                                consumptionId: 0,
                                consumptionDate: moment(map.get("7")).format("YYYY-MM-DD"),
                                region: {
                                    id: map.get("1")
                                },
                                consumptionQty: map.get("3"),
                                dayOfStockOut: parseInt(map.get("4")),
                                dataSource: {
                                    id: map.get("2")
                                },
                                notes: map.get("5"),
                                actualFlag: map.get("8"),
                                active: map.get("9"),

                                // planningUnit: {
                                //     id: plannigUnitId
                                // }
                                planningUnit: {
                                    id: planningUnitId,
                                    forecastingUnit: {
                                        productCategory: {
                                            id: productCategoryId
                                        }
                                    }
                                }
                            }
                            consumptionDataList.push(consumptionJson);
                        }
                    }
                    programJson.consumptionList = consumptionDataList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        // Handle errors!
                    };
                    putRequest.onsuccess = function (event) {
                        this.toggleLarge('Consumption');
                        this.setState({
                            message: `Consumption Data Saved`,
                            consumptionChangedFlag: 0
                        })
                        this.formSubmit(this.state.monthCount);
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                consumptionError: "Validation failed."
            })
        }
    }


    // Consumption Functionality

    // Adjustments Functionality
    // Show adjustments details
    adjustmentsDetailsClicked(region, month, endDate) {
        if (this.state.inventoryChangedFlag == 0) {
            var planningUnitId = document.getElementById("planningUnitId").value;
            var programId = document.getElementById("programId").value;
            var db1;
            var dataSourceList = [];
            var countrySKUList = [];
            var countrySKUListAll = [];
            var myVar = '';
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
                    var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                    var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                    var dataSourceRequest = dataSourceOs.getAll();
                    dataSourceRequest.onsuccess = function (event) {
                        var dataSourceResult = [];
                        dataSourceResult = dataSourceRequest.result;
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

                        var countrySKUTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                        var countrySKUOs = countrySKUTransaction.objectStore('realmCountryPlanningUnit');
                        var countrySKURequest = countrySKUOs.getAll();
                        countrySKURequest.onsuccess = function (event) {
                            var countrySKUResult = [];
                            countrySKUResult = countrySKURequest.result;
                            for (var k = 0; k < countrySKUResult.length; k++) {
                                if (countrySKUResult[k].realmCountry.id == programJson.realmCountry.realmCountryId) {
                                    var countrySKUJson = {
                                        name: countrySKUResult[k].label.label_en,
                                        id: countrySKUResult[k].realmCountryPlanningUnitId
                                    }
                                    countrySKUList[k] = countrySKUJson
                                    countrySKUListAll.push(countrySKUResult[k]);
                                }
                            }
                            this.setState({
                                countrySKUListAll: countrySKUListAll
                            })
                            var inventoryListUnFiltered = (programJson.inventoryList)
                            this.setState({
                                inventoryListUnFiltered: inventoryListUnFiltered
                            })
                            var inventoryList = (programJson.inventoryList).filter(c =>
                                c.planningUnit.id == planningUnitId &&
                                c.region.id == region &&
                                moment(c.inventoryDate).format("MMM YY") == month);
                            this.el = jexcel(document.getElementById("adjustmentsTable"), '');
                            this.el.destroy();
                            var data = [];
                            var inventoryDataArr = [];
                            var readonlyCountrySKU = true;
                            for (var j = 0; j < inventoryList.length; j++) {
                                var readonlyCountrySKU = true;
                                data = [];
                                data[0] = month;
                                data[1] = inventoryList[j].region.id;
                                data[2] = inventoryList[j].dataSource.id;
                                data[3] = inventoryList[j].realmCountryPlanningUnit.id;
                                data[4] = inventoryList[j].multiplier;
                                data[5] = inventoryList[j].expectedBal;
                                data[6] = `=E${j + 1}*F${j + 1}`;
                                data[7] = inventoryList[j].adjustmentQty;
                                data[8] = `=E${j + 1}*H${j + 1}`;
                                data[9] = inventoryList[j].actualQty;
                                data[10] = `=E${j + 1}*J${j + 1}`;

                                if (inventoryList[j].notes === null || ((inventoryList[j].notes).trim() == "NULL")) {
                                    data[11] = "";
                                } else {
                                    data[11] = inventoryList[j].notes;
                                }
                                data[12] = inventoryListUnFiltered.findIndex(c => c.planningUnit.id == planningUnitId && c.region.id == region && moment(c.inventoryDate).format("MMM YY") == month && c.inventoryDate == inventoryList[j].inventoryDate && c.realmCountryPlanningUnit.id == inventoryList[j].realmCountryPlanningUnit.id);
                                data[13] = inventoryList[j].active;
                                data[14] = endDate;
                                inventoryDataArr[j] = data;
                            }
                            if (inventoryList.length == 0) {
                                var readonlyCountrySKU = false;
                                data = [];
                                data[0] = month;
                                data[1] = region;
                                data[2] = "";
                                data[3] = "";
                                data[4] = "";
                                data[5] = "";
                                data[6] = `=E1*F1`;
                                data[7] = "";
                                data[8] = `=E1*H1`;
                                data[9] = "";
                                data[10] = `=E1*J1`;
                                data[11] = "";
                                data[12] = -1;
                                data[13] = "";
                                data[14] = endDate;
                                inventoryDataArr[0] = data;
                            }
                            var options = {
                                data: inventoryDataArr,
                                nestedHeaders: [
                                    [
                                        {
                                            title: '',
                                            colspan: '5',
                                        },
                                        {
                                            title: 'Expected Stock',
                                            colspan: '2'
                                        },
                                        {
                                            title: 'Manual Adjustment',
                                            colspan: '2'
                                        }, {
                                            title: 'Actual Stock count',
                                            colspan: '2'
                                        },
                                        {
                                            title: '',
                                            colspan: '3',
                                        }
                                    ],
                                ],
                                columnDrag: true,
                                colWidths: [80, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 200],
                                columns: [
                                    { title: 'Month', type: 'text', readOnly: true },
                                    { title: 'Region', type: 'dropdown', readOnly: true, source: this.state.regionList },
                                    { title: 'Data source', type: 'dropdown', source: dataSourceList },
                                    { title: 'Country SKU', type: 'dropdown', source: countrySKUList, readOnly: readonlyCountrySKU },
                                    { title: 'Conversion units', type: 'text', readOnly: true },
                                    { title: 'Quantity', type: 'text', readOnly: true },
                                    { title: 'Planning Unit Qty', type: 'text', readOnly: true },
                                    { title: 'Quantity', type: 'text' },
                                    { title: 'Planning Unit Qty', type: 'text', readOnly: true },
                                    { title: 'Quantity', type: 'text' },
                                    { title: 'Planning Unit Qty', type: 'text', readOnly: true },
                                    { title: 'Notes', type: 'text' },
                                    { title: 'index', type: 'hidden', readOnly: true },
                                    { title: i18n.t('static.inventory.active'), type: 'checkbox' },
                                    { title: 'inventory date', type: 'hidden' }
                                ],
                                pagination: false,
                                search: true,
                                columnSorting: true,
                                tableOverflow: true,
                                wordWrap: true,
                                allowInsertColumn: false,
                                allowManualInsertColumn: false,
                                allowDeleteRow: false,
                                // allowInsertRow: false,
                                allowManualInsertRow: false,
                                onchange: this.inventoryChanged,
                                oneditionend: this.inventoryOnedit,
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
                                            var json = obj.getJson();
                                            items.push({
                                                title: obj.options.text.insertANewRowAfter,
                                                onclick: function () {
                                                    var json = obj.getJson();
                                                    var map = new Map(Object.entries(json[0]));
                                                    var data = [];
                                                    data[0] = map.get("0");
                                                    data[1] = map.get("1");
                                                    data[2] = "";
                                                    data[3] = "";
                                                    data[4] = "";
                                                    data[5] = "";
                                                    data[6] = `=E${(json.length) + 1}*F${(json.length) + 1}`;
                                                    data[7] = "";
                                                    data[8] = `=E${(json.length) + 1}*H${(json.length) + 1}`;
                                                    data[9] = "";
                                                    data[10] = `=E${(json.length) + 1}*J${(json.length) + 1}`;
                                                    data[11] = "";
                                                    data[12] = -1;
                                                    data[13] = "";
                                                    data[14] = endDate;
                                                    obj.insertRow(data);
                                                    var cell = obj.getCell(`D${parseInt(json.length) + 1}`)
                                                    cell.classList.remove('readonly');

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
                                            title: 'Export as csv',
                                            shortcut: 'Ctrl + S',
                                            onclick: function () {
                                                obj.download(true);
                                            }
                                        });
                                    }

                                    return items;
                                }.bind(this)
                            };
                            myVar = jexcel(document.getElementById("adjustmentsTable"), options);
                            this.el = myVar;
                            this.setState({
                                inventoryEl: myVar
                            })
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                inventoryError: "You need to save the data first."
            })
        }
    }

    // Adjustments changed
    inventoryChanged = function (instance, cell, x, y, value) {
        this.setState({
            inventoryError: '',
            inventoryDuplicateError: ''
        })
        var elInstance = this.state.inventoryEl;
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var countrySKU = this.state.countrySKUListAll.filter(c => c.realmCountryPlanningUnitId == value)[0];
                var multiplier = countrySKU.multiplier;
                elInstance.setValueFromCoords(4, y, multiplier, true);
                var region = elInstance.getValueFromCoords(1, y);
                var endDate = elInstance.getValueFromCoords(14, y);
                var inventoryDetails = this.state.inventoryListUnFiltered.filter(c => c.realmCountryPlanningUnit.id == value
                    && c.region.id == region
                    && c.inventoryDate <= endDate
                );
                var lastInventoryDate = "";
                for (var id = 0; id < inventoryDetails.length; id++) {
                    if (id == 0) {
                        lastInventoryDate = inventoryDetails[id].inventoryDate;
                    }
                    if (lastInventoryDate < inventoryDetails[id].inventoryDate) {
                        lastInventoryDate = inventoryDetails[id].inventoryDate;
                    }
                }
                var inventoryDetailsFiltered = inventoryDetails.filter(c => c.inventoryDate == lastInventoryDate);
                var expBal = 0;
                if (inventoryDetailsFiltered.length > 0) {
                    var expBal = parseInt(inventoryDetailsFiltered[0].expectedBal) + parseInt(inventoryDetailsFiltered[0].adjustmentQty);
                }
                elInstance.setValueFromCoords(5, y, expBal, true);
                // elInstance.setValueFromCoords(6, y, parseInt(expBal)*parseInt(multiplier), true);
                // elInstance.setValueFromCoords(8, y, parseInt(elInstance.getValueFromCoords(7,y))*parseInt(multiplier), true);
                // elInstance.setValueFromCoords(10, y, parseInt(elInstance.getValueFromCoords(9,y))*parseInt(multiplier), true);
            }
        }
        if (x == 7) {
            var col = ("H").concat(parseInt(y) + 1);
            var reg = /-?\d+/;
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "In valid number.");
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }

        if (x == 9) {
            if (elInstance.getValueFromCoords(9, y) != "") {
                var reg = /^[0-9\b]+$/;
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    var col = ("J").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "In valid number.");
                } else {
                    var col = ("J").concat(parseInt(y) + 1);
                    var manualAdj = elInstance.getValueFromCoords(9, y) - elInstance.getValueFromCoords(5, y);
                    elInstance.setValueFromCoords(7, y, parseInt(manualAdj), true);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            } else {
                var col = ("J").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }
        if (x == 5) {
            if (elInstance.getValueFromCoords(9, y) != "") {
                var manualAdj = elInstance.getValueFromCoords(9, y) - elInstance.getValueFromCoords(5, y);
                elInstance.setValueFromCoords(7, y, parseInt(manualAdj), true);
            }
        }

        this.setState({
            inventoryChangedFlag: 1
        })
    }

    // Adjustments edit
    inventoryOnedit = function (instance, cell, x, y, value) {
        var elInstance = this.state.inventoryEl;
        if (x == 7) {
            elInstance.setValueFromCoords(9, y, "", true);
        }
    }.bind(this);

    // Adjustments final validation
    checkValidationInventory() {
        var valid = true;
        var elInstance = this.state.inventoryEl;
        var json = elInstance.getJson();
        var mapArray = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);

            var checkDuplicateInMap = mapArray.filter(c =>
                c.get("4") == map.get("4")
            )
            if (checkDuplicateInMap.length > 1) {
                var colArr = ['D'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "Duplicate adjustments");
                }
                valid = false;
                this.setState({
                    inventoryDuplicateError: 'Duplicate adjustments'
                })
            } else {
                var colArr = ['D'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                var col = ("C").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(2, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "This field is required.");
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("H").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(7, y);
                var reg = /-?\d+/;
                if (value === "" || isNaN(parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                        elInstance.setComments(col, "in valid number.");
                    } else {
                        elInstance.setComments(col, "This field is required.");
                    }
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var value = elInstance.getValueFromCoords(9, y);
                if (elInstance.getValueFromCoords(9, y) != "") {
                    var reg = /^[0-9\b]+$/;
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        var col = ("J").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setStyle(col, "background-color", "yellow");
                        elInstance.setComments(col, "In valid number.");
                    } else {
                        var col = ("J").concat(parseInt(y) + 1);
                        var manualAdj = elInstance.getValueFromCoords(9, y) - elInstance.getValueFromCoords(5, y);
                        elInstance.setValueFromCoords(7, y, parseInt(manualAdj), true);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                } else {
                    var col = ("J").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }
        return valid;
    }

    // Save adjustments
    saveInventory() {
        this.setState({
            inventoryError: ''
        })
        var validation = this.checkValidationInventory();
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            var elInstance = this.state.inventoryEl;
            var planningUnitId = document.getElementById("planningUnitId").value;
            var json = elInstance.getJson();
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
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var inventoryDataList = (programJson.inventoryList);
                    for (var i = 0; i < json.length; i++) {
                        var map = new Map(Object.entries(json[i]));
                        if (parseInt(map.get("12")) != -1) {
                            inventoryDataList[parseInt(map.get("12"))].dataSource.id = map.get("2");
                            inventoryDataList[parseInt(map.get("12"))].expectedBal = parseInt(map.get("5"));
                            inventoryDataList[parseInt(map.get("12"))].adjustmentQty = parseInt(map.get("7"));
                            inventoryDataList[parseInt(map.get("12"))].actualQty = parseInt(map.get("9"));
                            inventoryDataList[parseInt(map.get("12"))].notes = parseInt(map.get("11"));
                            inventoryDataList[parseInt(map.get("12"))].active = parseInt(map.get("13"));

                            var inventoryDataListFiltered = inventoryDataList.filter(c => c.realmCountryPlanningUnit.id == map.get("3") && c.region.id == map.get("2"));
                            for (var j = 0; j < inventoryDataListFiltered.length; j++) {
                                var inventoryId = inventoryDataListFiltered[j].inventoryId;
                                var index;
                                if (inventoryId != 0) {
                                    index = inventoryDataList.findIndex(c => c.inventoryId == inventoryId)
                                } else {
                                    index = inventoryDataList.findIndex(c => c.planningUnit.id == inventoryDataListFiltered[j].planningUnit.id && c.region.id == inventoryDataListFiltered[j].region.id && moment(c.inventoryDate).format("MMM YY") == moment(inventoryDataListFiltered[j].inventoryDate).format("MMM YY") && c.inventoryDate == inventoryDataListFiltered[j].inventoryDate && c.realmCountryPlanningUnit.id == inventoryDataListFiltered[j].realmCountryPlanningUnit.id);
                                }
                                if (j == 0) {
                                    inventoryDataList[index].expectedBal = 0
                                } else {
                                    var inventoryDetails = inventoryDataListFiltered.filter(c => c.inventoryDate >= map.get("14"));
                                    var lastInventoryDate = "";
                                    for (var id = 0; id < inventoryDetails.length; id++) {
                                        if (id == 0) {
                                            lastInventoryDate = inventoryDetails[id].inventoryDate;
                                        }
                                        if (lastInventoryDate < inventoryDetails[id].inventoryDate) {
                                            lastInventoryDate = inventoryDetails[id].inventoryDate;
                                        }
                                    }
                                    var inventoryDetailsFiltered = inventoryDetails.filter(c => c.inventoryDate == lastInventoryDate);
                                    if (inventoryDetailsFiltered.length != 0) {
                                        inventoryDataList[index].expectedBal = parseInt(inventoryDetailsFiltered[0].expectedBal) + parseInt(inventoryDetailsFiltered[0].adjustmentQty);
                                    }
                                }

                            }
                        } else {
                            var inventoryJson = {
                                inventoryId: 0,
                                dataSource: {
                                    id: map.get("2")
                                },
                                region: {
                                    id: map.get("1")
                                },
                                inventoryDate: map.get("14"),
                                expectedBal: map.get("5"),
                                adjustmentQty: map.get("7"),
                                actualQty: map.get("9"),
                                // batchNo: map.get("6"),
                                // expiryDate: expiryDate,
                                active: map.get("13"),
                                realmCountryPlanningUnit: {
                                    id: map.get("3"),
                                },
                                multiplier: map.get("4"),
                                planningUnit: {
                                    id: planningUnitId
                                },
                                notes: map.get("11")
                            }


                            inventoryDataList.push(inventoryJson);
                            var inventoryDataListFiltered = inventoryDataList.filter(c => c.realmCountryPlanningUnit.id == map.get("3") && c.region.id == map.get("2"));
                            for (var j = 0; j < inventoryDataListFiltered.length; j++) {
                                var inventoryId = inventoryDataListFiltered[j].inventoryId;
                                var index;
                                if (inventoryId != 0) {
                                    index = inventoryDataList.findIndex(c => c.inventoryId == inventoryId)
                                } else {
                                    index = inventoryDataList.findIndex(c => c.planningUnit.id == inventoryDataListFiltered[j].planningUnit.id && c.region.id == inventoryDataListFiltered[j].region.id && moment(c.inventoryDate).format("MMM YY") == moment(inventoryDataListFiltered[j].inventoryDate).format("MMM YY") && c.inventoryDate == inventoryDataListFiltered[j].inventoryDate && c.realmCountryPlanningUnit.id == inventoryDataListFiltered[j].realmCountryPlanningUnit.id);
                                }
                                if (j == 0) {
                                    inventoryDataList[index].expectedBal = 0
                                } else {
                                    var inventoryDetails = inventoryDataListFiltered.filter(c => c.inventoryDate >= map.get("14"));
                                    var lastInventoryDate = "";
                                    for (var id = 0; id < inventoryDetails.length; id++) {
                                        if (id == 0) {
                                            lastInventoryDate = inventoryDetails[id].inventoryDate;
                                        }
                                        if (lastInventoryDate < inventoryDetails[id].inventoryDate) {
                                            lastInventoryDate = inventoryDetails[id].inventoryDate;
                                        }
                                    }
                                    var inventoryDetailsFiltered = inventoryDetails.filter(c => c.inventoryDate == lastInventoryDate);
                                    if (inventoryDetailsFiltered.length != 0) {
                                        inventoryDataList[index].expectedBal = parseInt(inventoryDetailsFiltered[0].expectedBal) + parseInt(inventoryDetailsFiltered[0].adjustmentQty);
                                    }
                                }


                            }
                        }
                    }
                    programJson.inventoryList = inventoryDataList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        // Handle errors!
                    };
                    putRequest.onsuccess = function (event) {
                        this.toggleLarge('Adjustments');
                        this.setState({
                            message: `Inventory Data Saved`,
                            inventoryChangedFlag: 0
                        })
                        this.formSubmit(this.state.monthCount);
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                inventoryError: "Validation failed."
            })
        }
    }

    // Adjustments Functionality

    // Shipments functionality
    // Suggested shipments

    //Show Suggested shipments details
    suggestedShipmentsDetailsClicked(month, quantity, isEmergencyOrder) {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programId = document.getElementById("programId").value;
        var db1;
        var procurementAgentList = [];
        var fundingSourceList = [];
        var budgetList = [];
        var dataSourceList = [];
        var myVar = '';
        getDatabase();
        var openRequest = indexedDB.open('fasp', 1);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var transaction = db1.transaction(['programData'], 'readwrite');
            var programTransaction = transaction.objectStore('programData');
            var programRequest = programTransaction.get(programId);
            var consumptionTotalData = [];
            var filteredArray = [];
            programRequest.onsuccess = function (event) {
                var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                this.setState({
                    shipmentListUnFiltered: programJson.shipmentList
                })

                // var addLeadTimes = Math.floor(parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                //     parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                //     parseFloat(programJson.deliveredToReceivedLeadTime));
                // var expectedDeliveryDateEnFormat = moment(Date.now()).utcOffset('-0500').add(addLeadTimes, 'months').format("MM-DD-YYYY");
                // var expectedDeliveryDate = moment(Date.now()).utcOffset('-0500').add(addLeadTimes, 'months').format("YYYY-MM-DD");
                var papuTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                var papuOs = papuTransaction.objectStore('procurementAgentPlanningUnit');
                var papuRequest = papuOs.getAll();
                papuRequest.onsuccess = function (event) {
                    var papuResult = [];
                    papuResult = papuRequest.result;
                    for (var k = 0; k < papuResult.length; k++) {
                        if (papuResult[k].planningUnit.id == planningUnitId) {
                            var papuJson = {
                                name: papuResult[k].procurementAgent.label.label_en,
                                id: papuResult[k].procurementAgent.id
                            }
                            procurementAgentList.push(papuJson);
                        }
                    }

                    var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                    var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                    var dataSourceRequest = dataSourceOs.getAll();
                    dataSourceRequest.onsuccess = function (event) {
                        var dataSourceResult = [];
                        dataSourceResult = dataSourceRequest.result;
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
                        var suggestedShipmentList = [];
                        suggestedShipmentList = this.state.suggestedShipmentsTotalData.filter(c => c.month == month && c.suggestedOrderQty != "");
                        this.el = jexcel(document.getElementById("suggestedShipmentsDetailsTable"), '');
                        this.el.destroy();
                        var data = [];
                        var suggestedShipmentsArr = []
                        var orderedDate = moment(Date.now()).format("YYYY-MM-DD");
                        for (var j = 0; j < suggestedShipmentList.length; j++) {
                            var readOnlySuggestedOrderQty = true;
                            data = [];
                            // data[0]= expectedDeliveryDateEnFormat;
                            data[0] = "SUGGESTED";
                            data[1] = this.state.planningUnitName;
                            data[2] = suggestedShipmentList[j].suggestedOrderQty;
                            data[3] = `=C${j + 1}`;
                            data[4] = "";
                            data[5] = "";
                            data[6] = suggestedShipmentList[j].shipmentMode;
                            data[7] = "";
                            data[8] = orderedDate;
                            data[9] = "";
                            data[10] = isEmergencyOrder;
                            suggestedShipmentsArr[j] = data;
                        }
                        if (suggestedShipmentList.length == 0) {
                            var readOnlySuggestedOrderQty = false;
                            data = [];
                            // data[0]= expectedDeliveryDateEnFormat;
                            data[0] = "SUGGESTED";
                            data[1] = this.state.planningUnitName;
                            data[2] = "";
                            data[3] = `=C1`;
                            data[4] = "";
                            data[5] = "";
                            data[6] = "";
                            data[7] = "";
                            data[8] = orderedDate;
                            data[9] = "";
                            data[10] = isEmergencyOrder;
                            suggestedShipmentsArr[0] = data;
                        }
                        var options = {
                            data: suggestedShipmentsArr,
                            colHeaders: [
                                "Shipment status",
                                "Planning unit",
                                "Suggested order qty",
                                "Adjusted order qty",
                                "Data Source",
                                "Procurement agent",
                                "Shipment Mode",
                                "Notes",
                                "Ordered Date",
                                "Expected delivery date",
                                "Emergency Order"
                            ],
                            colWidths: [150, 200, 80, 80, 150, 350, 150, 150, 80, 100],
                            columns: [
                                { type: 'text', readOnly: true },
                                { type: 'text', readOnly: true },
                                { type: 'numeric', readOnly: readOnlySuggestedOrderQty },
                                { type: 'numeric', readOnly: true },
                                { type: 'dropdown', source: dataSourceList },
                                { type: 'dropdown', source: procurementAgentList },
                                { type: 'dropdown', source: ['Sea', 'Air'] },
                                { type: 'text' },
                                { type: 'hidden' },
                                { type: 'calendar', options: { format: 'MM-DD-YYYY', validRange: [moment(Date.now()).format("YYYY-MM-DD"), ''] } },
                                { type: 'hidden' }
                            ],
                            pagination: false,
                            search: false,
                            columnSorting: true,
                            tableOverflow: true,
                            wordWrap: true,
                            allowInsertColumn: false,
                            allowManualInsertColumn: false,
                            allowDeleteRow: false,
                            // allowInsertRow: false,
                            allowManualInsertRow: false,
                            onchange: this.suggestedShipmentChanged,
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
                                            title: obj.options.text.insertANewRowAfter,
                                            onclick: function () {
                                                var json = obj.getJson();
                                                var data = [];
                                                var orderedDate = moment(Date.now()).format("YYYY-MM-DD");
                                                data[0] = "SUGGESTED";
                                                data[1] = this.state.planningUnitName;
                                                data[2] = "";
                                                data[3] = `=C${json.length + 1}`;
                                                data[4] = "";
                                                data[5] = "";
                                                data[6] = "";
                                                data[7] = "";
                                                data[8] = orderedDate;
                                                data[9] = "";
                                                data[10] = 0;
                                                obj.insertRow(data);
                                                var cell = obj.getCell(`C${json.length + 1}`)
                                                cell.classList.remove('readonly');
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
                                        title: 'Export as csv',
                                        shortcut: 'Ctrl + S',
                                        onclick: function () {
                                            obj.download(true);
                                        }
                                    });
                                }

                                return items;
                            }.bind(this)
                        };
                        myVar = jexcel(document.getElementById("suggestedShipmentsDetailsTable"), options);
                        this.el = myVar;
                        this.setState({
                            suggestedShipmentsEl: myVar
                        })
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    // Suggested shipment changed 
    suggestedShipmentChanged = function (instance, cell, x, y, value) {
        this.setState({
            suggestedShipmentError: '',
            suggestedShipmentDuplicateError: ''
        })
        var elInstance = this.state.suggestedShipmentsEl;
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
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
            var reg = /^[0-9\b]+$/;
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                if (isNaN(Number.parseInt(value)) || !(reg.test(value))) {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "In valid number.");
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
            }
        }

        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var valueOfJ = elInstance.getValueFromCoords(9, y);
                if (valueOfJ != "") {
                    var col1 = ("J").concat(parseInt(y) + 1);
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }
            }
        }

        if (x == 6) {
            var col = ("G").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
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
                        var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                        var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                        var programJson = JSON.parse(programData);
                        var addLeadTimes = parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) + parseFloat(programJson.arrivedToDeliveredLeadTime) +
                            parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime);

                        if (value == "Sea") {
                            addLeadTimes = addLeadTimes + parseFloat(programJson.shippedToArrivedBySeaLeadTime);
                        } else {
                            addLeadTimes = addLeadTimes + parseFloat(programJson.shippedToDeliveredByAirLeadTime);
                        }
                        addLeadTimes = parseInt(addLeadTimes) + 1;
                        var expectedDeliveryDate = moment(Date.now()).utcOffset('-0500').add(addLeadTimes, 'months').format("YYYY-MM-DD");
                        elInstance.setValueFromCoords(9, y, expectedDeliveryDate, true);
                    }.bind(this)
                }.bind(this)
            }
        }

        if (x == 9) {
            var col = ("J").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                // if (moment(value).format("YYYY-MM-DD") == 'Invalid date') {
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

        this.setState({
            suggestedShipmentChangedFlag: 1
        });
    }

    // Suggested shipments final validations
    checkValidationSuggestedShipments() {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var valid = true;
        var elInstance = this.state.suggestedShipmentsEl;
        var json = elInstance.getJson();
        var mapArray = []
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);
            var shipmentDataList = this.state.shipmentListUnFiltered;
            var checkDuplicate = shipmentDataList.filter(c =>
                moment(c.expectedDeliveryDate).format("YYYY-MM") == moment(Date.parse(map.get("9"))).format("YYYY-MM")
                && c.planningUnit.id == planningUnitId
                && c.procurementAgent.id == map.get("5")
                && c.shipmentStatus.id != 8
            )
            var checkDuplicateInMap = mapArray.filter(c =>
                moment(Date.parse(c.get("9"))).format("YYYY-MM") == moment(Date.parse(map.get("9"))).format("YYYY-MM")
                && c.get("5") == map.get("5")
            )
            if (checkDuplicate.length >= 1 || checkDuplicateInMap.length > 1) {
                var colArr = ['F', 'J'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "Duplicate shipment");
                }
                valid = false;
                this.setState({
                    suggestedShipmentDuplicateError: 'Duplicate shipment',
                })
            } else {
                var colArr = ['F', 'J'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }
                var col = ("E").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(4, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "This field is required.");
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
                    elInstance.setComments(col, "This field is required.");
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("G").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(6, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "This field is required.");
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("J").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(9, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                } else {
                    // if (moment(value).format("YYYY-MM-DD") == 'Invalid date') {
                    //     elInstance.setStyle(col, "background-color", "transparent");
                    //     elInstance.setStyle(col, "background-color", "yellow");
                    //     elInstance.setComments(col, i18n.t('static.message.invaliddate'));
                    //     valid = false;
                    // } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                    // }
                }
            }
        }
        return valid;

    }

    // Save suggested shipments
    saveSuggestedShipments() {
        var validation = this.checkValidationSuggestedShipments();
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            var elInstance = this.state.suggestedShipmentsEl;
            var json = elInstance.getJson();
            var planningUnitId = document.getElementById("planningUnitId").value;
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
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var shipmentDataList = (programJson.shipmentList);
                    for (var jl = 0; jl < json.length; jl++) {
                        var map = new Map(Object.entries(json[jl]));
                        var shipmentJson = {
                            accountFlag: true,
                            active: true,
                            dataSource: {
                                id: map.get("4")
                            },
                            erpFlag: false,
                            expectedDeliveryDate: moment(Date.parse(map.get("9"))).format("YYYY-MM-DD"),
                            freightCost: 0,
                            notes: map.get("7"),
                            orderedDate: map.get("8"),
                            planningUnit: {
                                id: planningUnitId
                            },
                            procurementAgent: {
                                id: map.get("5")
                            },
                            procurementUnit: {
                                id: 0
                            },
                            productCost: 0,
                            quantity: map.get("2"),
                            rate: 0,
                            receivedDate: "",
                            shipmentId: 0,
                            shipmentMode: map.get("6"),
                            shipmentStatus: {
                                id: 1
                            },
                            shippedDate: "",
                            suggestedQty: map.get("2"),
                            supplier: {
                                id: 0
                            },
                            shipmentBudgetList: [],
                            emergencyOrder: map.get("10")
                        }

                        shipmentDataList.push(shipmentJson);
                    }
                    programJson.shipmentList = shipmentDataList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        // Handle errors!
                    };
                    putRequest.onsuccess = function (event) {
                        this.toggleLarge('SuggestedShipments');
                        this.setState({
                            message: `Suggested shipments Data Saved`,
                            suggestedShipmentChangedFlag: 0
                        })
                        this.formSubmit(this.state.monthCount);
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                suggestedShipmentError: "Validation Failed."
            })
        }
    }

    // Suggested shipments

    budgetDropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[1];
        if (value != "") {
            var budgetList = this.state.budgetList;
            var mylist = budgetList.filter(b => b.fundingSource.fundingSourceId == value);
        }
        return mylist;
    }

    //Shipment budget
    //Budget changed
    budgetChanged = function (instance, cell, x, y, value) {
        this.setState({
            budgetChangedFlag: 1,
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
            elInstance.setValueFromCoords(parseInt(x) + 1, y, '', true);
        }
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
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

        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var currency = (this.state.currencyListAll).filter(c => c.currencyId == value)[0];
                elInstance.setValueFromCoords(5, y, currency.conversionRateToUsd, true)
            }
        }
    }

    //Final validations for Budget
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

            var col = ("E").concat(parseInt(y) + 1);
            var value = elInstance.getValueFromCoords(4, y);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                valid = false
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }
        return valid;
    }

    //Budget Save
    saveBudget() {
        var validation = this.checkBudgetValidation()
        if (validation == true) {
            var elInstance = this.state.shipmentBudgetTableEl;
            var json = elInstance.getJson();
            var budgetArray = [];
            var rowNumber = 0;
            var totalBudget = 0;
            for (var i = 0; i < json.length; i++) {
                var map = new Map(Object.entries(json[i]));
                var budgetJson = {
                    shipmentBudgetId: map.get("0"),
                    budget: {
                        budgetId: map.get("2"),
                        fundingSource: {
                            fundingSourceId: map.get("1")
                        }
                    },
                    active: true,
                    budgetAmt: map.get('3'),
                    conversionRateToUsd: map.get("5"),
                    currency: {
                        currencyId: map.get("4")
                    }
                }
                budgetArray.push(budgetJson);
                totalBudget += map.get('3') * map.get("5");
                if (i == 0) {
                    rowNumber = map.get("6");
                }
            }
            var shipmentInstance = this.state.shipmentsEl;
            var rowData = shipmentInstance.getRowData(rowNumber);
            rowData[31] = totalBudget;
            rowData[32] = budgetArray;
            shipmentInstance.setRowData(rowNumber, rowData);
            // shipmentInstance.setValueFromCoords(31, rowNumber, totalBudget, true)
            // shipmentInstance.setValueFromCoords(32, rowNumber, budgetArray, true)
            this.setState({
                shipmentChangedFlag: 1,
                budgetChangedFlag: 0,
                shipmentBudgetTableEl: ''
            })
            document.getElementById("showButtonsDiv").style.display = 'none';
            elInstance.destroy();
        } else {
            this.setState({
                budgetError: 'Validation Failed.'
            })
        }
    }

    shipmentStatusDropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[35];
        if (value != "") {
            var shipmentStatusList = this.state.shipmentStatusList;
            var shipmentStatus = (this.state.shipmentStatusList).filter(c => c.shipmentStatusId == value)[0];
            var possibleStatusArray = shipmentStatus.nextShipmentStatusAllowedList;
            for (var k = 0; k < shipmentStatusList.length; k++) {
                if (possibleStatusArray.includes(shipmentStatusList[k].shipmentStatusId)) {
                    var shipmentStatusJson = {
                        name: shipmentStatusList[k].label.label_en,
                        id: shipmentStatusList[k].shipmentStatusId
                    }
                    mylist.push(shipmentStatusJson);
                }

            }
        }
        return mylist;
    }

    // Procurement Unit list based on procurement agent

    procurementUnitDropdownFilter = function (instance, cell, c, r, source) {
        var mylist = [];
        var value = (instance.jexcel.getJson()[r])[5];
        if (value != "") {
            var procurementUnitList = (this.state.procurementUnitList).filter(c => c.procurementAgent.id == value);
            for (var k = 0; k < procurementUnitList.length; k++) {
                var procurementUnitJson = {
                    name: procurementUnitList[k].procurementUnit.label.label_en,
                    id: procurementUnitList[k].procurementUnit.id
                }
                mylist.push(procurementUnitJson);
            }
        }
        return mylist;
    }

    // To be accounted funtionality for shipments
    handleEvent(e, toBeAccounted, startDate, endDate, type) {
        e.preventDefault();
        if (toBeAccounted == true) {
            contextMenu.show({
                id: 'menu_id',
                event: e,
                props: {
                    type: type,
                    startDate: startDate,
                    endDate: endDate
                }
            });
        } else {
            contextMenu.show({
                id: 'no_skip',
                event: e,
                props: {
                    type: type,
                    startDate: startDate,
                    endDate: endDate
                }
            });
        }
    }

    // On click of context menu
    onClick = ({ event, props }) => {
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
                var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var shipmentDataList = (programJson.shipmentList);
                for (var i = 0; i < shipmentDataList.length; i++) {
                    if (props.type == 'psm' && shipmentDataList[i].expectedDeliveryDate >= props.startDate && shipmentDataList[i].expectedDeliveryDate <= props.endDate && shipmentDataList[i].erpFlag == false && shipmentDataList[i].procurementAgent.id == 1) {
                        shipmentDataList[i].accountFlag = !shipmentDataList[i].accountFlag;
                    } else if (props.type == 'nonPsm' && shipmentDataList[i].expectedDeliveryDate >= props.startDate && shipmentDataList[i].expectedDeliveryDate <= props.endDate && shipmentDataList[i].procurementAgent.id != 1) {
                        shipmentDataList[i].accountFlag = !shipmentDataList[i].accountFlag;
                    } else if (props.type == 'artmis' && shipmentDataList[i].expectedDeliveryDate >= props.startDate && shipmentDataList[i].expectedDeliveryDate <= props.endDate && shipmentDataList[i].erpFlag == true) {
                        shipmentDataList[i].accountFlag = !shipmentDataList[i].accountFlag;
                    }
                }

                programJson.shipmentList = shipmentDataList;
                programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                var putRequest = programTransaction.put(programRequest.result);

                putRequest.onerror = function (event) {
                    // Handle errors!
                };
                putRequest.onsuccess = function (event) {
                    this.setState({
                        message: `Account flag changed`
                    })
                    this.formSubmit(this.state.monthCount);
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    // Shipments Functionality


    render() {
        const MyMenu = (props) => (
            <Menu id='menu_id'>
                <Item disabled>Yes-Account</Item>
                <Item onClick={this.onClick}>No-Skip</Item>
            </Menu>
        );

        const NoSkip = () => (
            <Menu id='no_skip'>
                <Item onClick={this.onClick}>Yes-Account</Item>
                <Item disabled>No-Skip</Item>
            </Menu>
        );

        const lan = 'en';
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

        const { regionList } = this.state;
        let regions = regionList.length > 0
            && regionList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>{item.name}</option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <h5>{i18n.t(this.state.message, { entityname })}</h5>

                <Card>
                    <CardHeader>
                        <strong>Supply plan</strong>
                        <div className="card-header-actions">
                            <a className="card-header-action">
                                <Link to='/supplyPlanFormulas' target="_blank"><small className="supplyplanformulas">Supply Plan Formulas</small></Link>
                            </a>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Formik
                            render={
                                ({
                                }) => (
                                        <Form name='simpleForm'>
                                            <Col md="9 pl-0">
                                                <div className="d-md-flex">
                                                    <FormGroup className="tab-ml-1">
                                                        <Label htmlFor="appendedInputButton">Program</Label>
                                                        <div className="controls SelectGo">
                                                            <InputGroup>
                                                                <Input type="select"
                                                                    bsSize="sm"
                                                                    value={this.state.programId}
                                                                    name="programId" id="programId"
                                                                    onChange={this.getPlanningUnitList}
                                                                >
                                                                    <option value="0">Please select</option>
                                                                    {programs}
                                                                </Input>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="tab-ml-1">
                                                        <Label htmlFor="appendedInputButton">Planning Unit</Label>
                                                        <div className="controls SelectGo">
                                                            <InputGroup>
                                                                <Input
                                                                    type="select"
                                                                    name="planningUnitId"
                                                                    id="planningUnitId"
                                                                    bsSize="sm"
                                                                    value={this.state.planningUnitId}
                                                                    onChange={() => this.formSubmit(this.state.monthCount)}
                                                                >
                                                                    <option value="0">Please Select</option>
                                                                    {planningUnits}
                                                                </Input>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                    <ul className="legend legendsync mt-0" >
                                                        <li><span className="skipedShipmentslegend"></span><span className="legendTextsync">  Skipped shipments</span></li>
                                                        <li><span className="redlegend"></span><span className="legendTextsync"> Emergency shipments for frozen lead time</span></li>
                                                        <li><span className="skipedShipmentsEmegencylegend"></span><span className="legendTextsync"> Skipped Emergency shipments for frozen lead time</span></li>
                                                    </ul>
                                                </div>
                                            </Col>
                                        </Form>

                                    )} />
                        <div id="supplyPlanTableId" style={{ display: 'none' }}>
                            <Row>
                                <div className="col-md-12">
                                    <span className="supplyplan-larrow" onClick={this.leftClicked}> <i class="cui-arrow-left icons " > </i> Scroll to left </span>
                                    <span className="supplyplan-rarrow" onClick={this.rightClicked}> Scroll to right <i class="cui-arrow-right icons" ></i> </span>
                                </div>
                            </Row>
                            <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                <thead>
                                    <tr>
                                        <th ></th>
                                        {
                                            this.state.monthsArray.filter(m => m.display == 1).map(item => (
                                                <th style={{ padding: '10px 0 !important' }}>{item.month}</th>
                                            ))
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    <MyMenu props />
                                    <NoSkip props />
                                    <tr>
                                        <td align="left">Opening Balance</td>
                                        {
                                            this.state.openingBalanceArray.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                    <tr className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '')}>
                                        <td align="left">Consumption</td>
                                        {
                                            this.state.consumptionTotalData.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(255, 229, 202)" }}>
                                        <td align="left">Suggested Shipments</td>
                                        {
                                            this.state.suggestedShipmentsTotalData.map(item1 => {
                                                if (item1.suggestedOrderQty.toString() != "") {
                                                    if (item1.isEmergencyOrder == 1) {
                                                        return (<td align="right" style={{ color: 'red' }} className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`, '', '', `${item1.isEmergencyOrder}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                    } else {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`, '', '', `${item1.isEmergencyOrder}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.suggestedOrderQty} /></td>)
                                                    }
                                                } else {
                                                    var compare = item1.month >= moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                                    if (compare) {
                                                        return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, ``, '', '', `${item1.isEmergencyOrder}`)}>{item1.suggestedOrderQty}</td>)
                                                    } else {
                                                        return (<td>{item1.suggestedOrderQty}</td>)
                                                    }
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(224, 239, 212)" }}>
                                        <td align="left">PSM Shipments in QAT</td>
                                        {
                                            this.state.psmShipmentsTotalData.map(item1 => {
                                                if (item1.toString() != "") {
                                                    if (item1.accountFlag == true) {
                                                        if (item1.isEmergencyOrder == 1) {
                                                            return (<td align="right" style={{ color: 'red' }} className="hoverTd" onClick={() => this.toggleLarge('psmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} onContextMenu={(e) => this.handleEvent(e, `${item1.accountFlag}`, `${item1.month.startDate}`, `${item1.month.endDate}`, 'psm')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('psmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} onContextMenu={(e) => this.handleEvent(e, `${item1.accountFlag}`, `${item1.month.startDate}`, `${item1.month.endDate}`, 'psm')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        if (item1.isEmergencyOrder == 1) {
                                                            return (<td align="right" style={{ color: '#FA8072' }} className="hoverTd" onClick={() => this.toggleLarge('psmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} onContextMenu={(e) => this.handleEvent(e, `${item1.accountFlag}`, `${item1.month.startDate}`, `${item1.month.endDate}`, 'psm')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td align="right" className="hoverTd" style={{ color: '#696969' }} onClick={() => this.toggleLarge('psmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} onContextMenu={(e) => this.handleEvent(e, `${item1.accountFlag}`, `${item1.month.startDate}`, `${item1.month.endDate}`, 'psm')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    }
                                                } else {
                                                    return (<td align="right" >{item1}</td>)
                                                }
                                            })
                                        }
                                    </tr>

                                    <tr style={{ "backgroundColor": "rgb(255, 251, 204)" }}>
                                        <td align="left">PSM Shipments from ARTMIS</td>
                                        {
                                            this.state.artmisShipmentsTotalData.map(item1 => {
                                                if (item1.toString() != "") {
                                                    if (item1.accountFlag == true) {
                                                        if (item1.isEmergencyOrder == 1) {
                                                            return (<td align="right" style={{ color: 'red' }} className="hoverTd" onClick={() => this.toggleLarge('artmisShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} onContextMenu={(e) => this.handleEvent(e, `${item1.accountFlag}`, `${item1.month.startDate}`, `${item1.month.endDate}`, 'artmis')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td align="right" className="hoverTd" onClick={() => this.toggleLarge('artmisShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} onContextMenu={(e) => this.handleEvent(e, `${item1.accountFlag}`, `${item1.month.startDate}`, `${item1.month.endDate}`, 'artmis')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        if (item1.isEmergencyOrder == 1) {
                                                            return (<td align="right" style={{ color: '#FA8072' }} className="hoverTd" onClick={() => this.toggleLarge('artmisShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} onContextMenu={(e) => this.handleEvent(e, `${item1.accountFlag}`, `${item1.month.startDate}`, `${item1.month.endDate}`, 'artmis')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td align="right" style={{ color: '#696969' }} className="hoverTd" onClick={() => this.toggleLarge('artmisShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} onContextMenu={(e) => this.handleEvent(e, `${item1.accountFlag}`, `${item1.month.startDate}`, `${item1.month.endDate}`, 'artmis')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    }
                                                } else {
                                                    return (<td align="right" > {item1}</td>)
                                                }
                                            })
                                        }
                                    </tr>

                                    <tr style={{ "backgroundColor": "rgb(207, 226, 243)" }}>
                                        <td align="left">Non PSM Shipment</td>
                                        {
                                            this.state.nonPsmShipmentsTotalData.map(item1 => {
                                                if (item1.toString() != "") {
                                                    if (item1.accountFlag == true) {
                                                        if (item1.isEmergencyOrder == 1) {
                                                            return (<td align="right" style={{ color: 'red' }} onClick={() => this.toggleLarge('nonPsmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} className="hoverTd" onContextMenu={(e) => this.handleEvent(e, `${item1.accountFlag}`, `${item1.month.startDate}`, `${item1.month.endDate}`, 'nonPsm')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td align="right" onClick={() => this.toggleLarge('nonPsmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} className="hoverTd" onContextMenu={(e) => this.handleEvent(e, `${item1.accountFlag}`, `${item1.month.startDate}`, `${item1.month.endDate}`, 'nonPsm')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }
                                                    } else {
                                                        if (item1.isEmergencyOrder == 1) {
                                                            return (<td align="right" onClick={() => this.toggleLarge('nonPsmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} style={{ color: '#FA8072' }} className="hoverTd" onContextMenu={(e) => this.handleEvent(e, `${item1.accountFlag}`, `${item1.month.startDate}`, `${item1.month.endDate}`, 'nonPsm')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        } else {
                                                            return (<td align="right" onClick={() => this.toggleLarge('nonPsmShipments', '', '', `${item1.month.startDate}`, `${item1.month.endDate}`)} style={{ color: '#696969' }} className="hoverTd" onContextMenu={(e) => this.handleEvent(e, `${item1.accountFlag}`, `${item1.month.startDate}`, `${item1.month.endDate}`, 'nonPsm')}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.qty} /></td>)
                                                        }

                                                    }
                                                } else {
                                                    return (<td align="right" >{item1}</td>)
                                                }
                                            })
                                        }
                                    </tr>

                                    <tr className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '')}>
                                        <td align="left">Adjustments</td>
                                        {
                                            this.state.inventoryTotalData.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(188, 228, 229)" }}>
                                        <td align="left">Ending Balance</td>
                                        {
                                            this.state.closingBalanceArray.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td align="left">AMC</td>
                                        {
                                            this.state.amcTotalData.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td align="left">Months of Stock</td>
                                        {
                                            this.state.monthsOfStockArray.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td align="left">Min stock</td>
                                        {
                                            this.state.minStockArray.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td align="left">Max stock</td>
                                        {
                                            this.state.maxStockArray.map(item1 => (
                                                <td align="right"><NumberFormat displayType={'text'} thousandSeparator={true} value={item1} /></td>
                                            ))
                                        }
                                    </tr>
                                </tbody>
                            </Table>
                        </div>

                        {/* Consumption modal */}
                        <Modal isOpen={this.state.consumption}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('Consumption')} className="modalHeaderSupplyPlan">
                                <strong>Consumption Details</strong>
                                <ul className="legend legend-supplypln">
                                    <li><span className="purplelegend"></span> <span className="legendText">Forecasted consumption</span></li>
                                    <li><span className="blacklegend"></span> <span className="legendText">Actual consumption</span></li>
                                </ul>
                            </ModalHeader>
                            <ModalBody>
                                <h6 className="red">{this.state.consumptionDuplicateError || this.state.consumptionError}</h6>
                                <div className="col-md-12">
                                    <span className="supplyplan-larrow" onClick={this.leftClickedConsumption}> <i class="cui-arrow-left icons " > </i> Scroll to left </span>
                                    <span className="supplyplan-rarrow" onClick={this.rightClickedConsumption}> Scroll to right <i class="cui-arrow-right icons" ></i> </span>
                                </div>
                                <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            {
                                                this.state.monthsArray.filter(m => m.display == 1).map(item => (
                                                    <th>{item.month}</th>
                                                ))
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.regionListFiltered.map(item => (
                                                <tr>
                                                    <td align="left">{item.name}</td>
                                                    {
                                                        this.state.consumptionFilteredArray.filter(c => c.region.id == item.id).map(item1 => {
                                                            if (item1.consumptionQty.toString() != '') {
                                                                if (item1.actualFlag.toString() == 'true') {
                                                                    return (<td align="right" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.region.id}`, `${item1.actualFlag}`, `${item1.month.month}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></td>)
                                                                } else {
                                                                    return (<td align="right" style={{ color: 'rgb(170, 85, 161)' }} className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.region.id}`, `${item1.actualFlag}`, `${item1.month.month}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.consumptionQty} /></td>)
                                                                }
                                                            } else {
                                                                return (<td align="right" className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.region.id}`, ``, `${item1.month.month}`)}></td>)
                                                            }
                                                        })
                                                    }
                                                </tr>
                                            )
                                            )
                                        }
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th style={{ textAlign: 'left' }}>Total</th>
                                            {
                                                this.state.consumptionTotalMonthWise.map(item => (
                                                    <th style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item} /></th>
                                                ))
                                            }
                                        </tr>
                                    </tfoot>
                                </Table>
                                <div className="table-responsive">
                                    <div id="consumptionDetailsTable" />
                                </div>

                            </ModalBody>
                            <ModalFooter>
                                {this.state.consumptionChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.saveConsumption}> <i className="fa fa-check"></i> Save</Button>}{' '}
                                <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Consumption')}> <i className="fa fa-times"></i> Cancel</Button>
                            </ModalFooter>
                        </Modal>
                        {/* Consumption modal */}
                        {/* Adjustments modal */}
                        <Modal isOpen={this.state.adjustments}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('Adjustments')} className="modalHeaderSupplyPlan">Adjustments Details</ModalHeader>
                            <ModalBody>
                                <h6 className="red">{this.state.inventoryDuplicateError || this.state.inventoryError}</h6>
                                <div className="col-md-12">
                                    <span className="supplyplan-larrow" onClick={this.leftClickedAdjustments}> <i class="cui-arrow-left icons " > </i> Scroll to left </span>
                                    <span className="supplyplan-rarrow" onClick={this.rightClickedAdjustments}> Scroll to right <i class="cui-arrow-right icons" ></i> </span>
                                </div>
                                <Table className="table-bordered text-center mt-2" bordered responsive size="sm" options={this.options}>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            {
                                                this.state.monthsArray.filter(m => m.display == 1).map(item => (
                                                    <th>{item.month}</th>
                                                ))
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.regionListFiltered.map(item => (
                                                <tr>
                                                    <td style={{ textAlign: 'left' }}>{item.name}</td>
                                                    {
                                                        this.state.inventoryFilteredArray.filter(c => c.region.id == item.id).map(item1 => {
                                                            if (item1.adjustmentQty.toString() != '') {
                                                                return (<td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`)}><NumberFormat displayType={'text'} thousandSeparator={true} value={item1.adjustmentQty} /></td>)
                                                            } else {
                                                                return (<td align="right" className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.region.id}`, `${item1.month.month}`, `${item1.month.endDate}`)}></td>)
                                                            }
                                                        })
                                                    }
                                                </tr>
                                            )
                                            )
                                        }
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th style={{ textAlign: 'left' }}>Total</th>
                                            {
                                                this.state.inventoryTotalMonthWise.map(item => (
                                                    <th style={{ textAlign: 'right' }}><NumberFormat displayType={'text'} thousandSeparator={true} value={item} /></th>
                                                ))
                                            }
                                        </tr>
                                    </tfoot>
                                </Table>
                                <div className="table-responsive">
                                    <div id="adjustmentsTable" className="table-responsive" />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                {this.state.inventoryChangedFlag == 1 && <Button size="md" color="success" className="submitBtn float-right mr-1" onClick={this.saveInventory}> <i className="fa fa-check"></i> Save</Button>}{' '}
                                <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('Adjustments')}> <i className="fa fa-times"></i> Cancel</Button>
                            </ModalFooter>
                        </Modal>
                        {/* adjustments modal */}

                        {/* Suggested shipments modal */}
                        <Modal isOpen={this.state.suggestedShipments}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('SuggestedShipments')} className="modalHeaderSupplyPlan">
                                <strong>Shipment Details</strong>
                            </ModalHeader>
                            <ModalBody>
                                <h6 className="red">{this.state.suggestedShipmentDuplicateError || this.state.suggestedShipmentError}</h6>
                                <div className="table-responsive">
                                    <div id="suggestedShipmentsDetailsTable" />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                {this.state.suggestedShipmentChangedFlag == 1 && <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={this.saveSuggestedShipments}> <i className="fa fa-check"></i> Save</Button>}{' '}
                                <Button size="md" color="danger" className="submitBtn float-right mr-1" onClick={() => this.actionCanceled('SuggestedShipments')}> <i className="fa fa-times"></i> Cancel</Button>
                            </ModalFooter>
                        </Modal>
                        {/* Suggested shipments modal */}
                        {/* PSM Shipments modal */}
                        <Modal isOpen={this.state.psmShipments}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('psmShipments')} className="modalHeaderSupplyPlan">
                                <strong>Shipment Details</strong>
                            </ModalHeader>
                            <ModalBody>
                                <h6 className="red">{this.state.shipmentDuplicateError || this.state.shipmentBudgetError || this.state.shipmentError}</h6>
                                <div className="table-responsive">
                                    <div id="shipmentsDetailsTable" />
                                </div>
                                <h6 className="red">{this.state.budgetError}</h6>
                                <div className="table-responsive">
                                    <div id="shipmentBudgetTable"></div>
                                </div>

                                <div id="showButtonsDiv" style={{ display: 'none' }}>
                                    {this.state.budgetChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveBudget()} ><i className="fa fa-check"></i>Save budget</Button>}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button type="submit" size="md" color="success" className="submitBtn float-right mr-1" onClick={() => this.saveShipments('psmShipments')}> <i className="fa fa-check"></i> Save</Button>
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('psmShipments')}> <i className="fa fa-times"></i> Cancel</Button>
                            </ModalFooter>
                        </Modal>
                        {/* PSM Shipments modal */}
                        {/* artmis shipments modal */}
                        <Modal isOpen={this.state.artmisShipments}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('artmisShipments')} className="modalHeaderSupplyPlan">
                                <strong>Shipment Details</strong>
                            </ModalHeader>
                            <ModalBody>
                                <h6 className="red">{this.state.shipmentDuplicateError || this.state.shipmentError || this.state.shipmentBudgetError}</h6>
                                <div className="table-responsive">
                                    <div id="shipmentsDetailsTable" />
                                </div>
                                <h6 className="red">{this.state.budgetError}</h6>
                                <div className="table-responsive">
                                    <div id="shipmentBudgetTable"></div>
                                </div>

                                <div id="showButtonsDiv" style={{ display: 'none' }}>
                                    {this.state.budgetChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveBudget()} ><i className="fa fa-check"></i>Save budget</Button>}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('artmisShipments')}> <i className="fa fa-times"></i> Cancel</Button>
                            </ModalFooter>
                        </Modal>
                        {/* artmis shipments modal */}

                        {/* Non PSM Shipments modal */}
                        <Modal isOpen={this.state.nonPsmShipments}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('nonPsmShipments')} className="modalHeaderSupplyPlan">
                                <strong>Shipment Details</strong>
                            </ModalHeader>
                            <ModalBody>
                                <h6 className="red">{this.state.shipmentDuplicateError || this.state.shipmentError || this.state.shipmentBudgetError}</h6>
                                <div className="table-responsive">
                                    <div id="shipmentsDetailsTable" />
                                </div>
                                <h6 className="red">{this.state.budgetError}</h6>
                                <div className="table-responsive">
                                    <div id="shipmentBudgetTable"></div>
                                </div>

                                <div id="showButtonsDiv" style={{ display: 'none' }}>
                                    {this.state.budgetChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveBudget()} ><i className="fa fa-check"></i>Save budget</Button>}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.saveShipments('nonPsmShipments')}> <i className="fa fa-check"></i> Save</Button>{' '}
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('nonPsmShipments')}> <i className="fa fa-times"></i> Cancel</Button>
                            </ModalFooter>
                        </Modal>
                        {/* Non PSM Shipments modal */}
                    </CardBody>
                </Card>

            </div>
        )
    }

    shipmentsDetailsClicked(supplyPlanType, startDate, endDate) {
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
        var elVar = "";
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
                var airFreightPerc = programJson.airFreightPerc;
                var seaFreightPerc = programJson.seaFreightPerc;
                var papuTransaction = db1.transaction(['procurementAgentPlanningUnit'], 'readwrite');
                var papuOs = papuTransaction.objectStore('procurementAgentPlanningUnit');
                var papuRequest = papuOs.getAll();
                papuRequest.onsuccess = function (event) {
                    var papuResult = [];
                    papuResult = papuRequest.result;
                    for (var k = 0; k < papuResult.length; k++) {
                        if (papuResult[k].planningUnit.id == planningUnitId) {
                            var papuJson = {
                                name: papuResult[k].procurementAgent.label.label_en,
                                id: papuResult[k].procurementAgent.id
                            }
                            procurementAgentList.push(papuJson);
                            procurementAgentListAll.push(papuResult[k]);
                        }
                    }

                    var fsTransaction = db1.transaction(['fundingSource'], 'readwrite');
                    var fsOs = fsTransaction.objectStore('fundingSource');
                    var fsRequest = fsOs.getAll();
                    fsRequest.onsuccess = function (event) {
                        var fsResult = [];
                        fsResult = fsRequest.result;
                        for (var k = 0; k < fsResult.length; k++) {
                            if (fsResult[k].realm.id == programJson.realmCountry.realm.realmId) {
                                var fsJson = {
                                    name: fsResult[k].label.label_en,
                                    id: fsResult[k].fundingSourceId
                                }
                                fundingSourceList.push(fsJson);
                            }
                        }

                        var dataSourceTransaction = db1.transaction(['dataSource'], 'readwrite');
                        var dataSourceOs = dataSourceTransaction.objectStore('dataSource');
                        var dataSourceRequest = dataSourceOs.getAll();
                        dataSourceRequest.onsuccess = function (event) {
                            var dataSourceResult = [];
                            dataSourceResult = dataSourceRequest.result;
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

                            var procurementUnitTransaction = db1.transaction(['procurementAgentProcurementUnit'], 'readwrite');
                            var procurementUnitOs = procurementUnitTransaction.objectStore('procurementAgentProcurementUnit');
                            var procurementUnitRequest = procurementUnitOs.getAll();
                            procurementUnitRequest.onsuccess = function (event) {
                                var procurementUnitResult = [];
                                procurementUnitResult = procurementUnitRequest.result;
                                for (var k = 0; k < procurementUnitResult.length; k++) {
                                    var procurementUnitJson = {
                                        name: procurementUnitResult[k].procurementUnit.label.label_en,
                                        id: procurementUnitResult[k].procurementUnit.id
                                    }
                                    procurementUnitList.push(procurementUnitJson);
                                    procurementUnitListAll.push(procurementUnitResult[k]);
                                }
                                this.setState({ procurementUnitList: procurementUnitListAll });
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
                                        supplierList.push(supplierJson);
                                    }

                                    var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                                    var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
                                    var shipmentStatusRequest = shipmentStatusOs.getAll();
                                    shipmentStatusRequest.onsuccess = function (event) {
                                        var shipmentStatusResult = [];
                                        shipmentStatusResult = shipmentStatusRequest.result;
                                        for (var k = 0; k < shipmentStatusResult.length; k++) {

                                            var shipmentStatusJson = {
                                                name: shipmentStatusResult[k].label.label_en,
                                                id: shipmentStatusResult[k].shipmentStatusId
                                            }
                                            shipmentStatusList[k] = shipmentStatusJson
                                            shipmentStatusListAll.push(shipmentStatusResult[k])
                                        }
                                        this.setState({ shipmentStatusList: shipmentStatusListAll })

                                        var currencyTransaction = db1.transaction(['currency'], 'readwrite');
                                        var currencyOs = currencyTransaction.objectStore('currency');
                                        var currencyRequest = currencyOs.getAll();
                                        currencyRequest.onsuccess = function (event) {
                                            var currencyResult = [];
                                            currencyResult = currencyRequest.result;
                                            for (var k = 0; k < currencyResult.length; k++) {

                                                var currencyJson = {
                                                    name: currencyResult[k].label.label_en,
                                                    id: currencyResult[k].currencyId
                                                }
                                                currencyList.push(currencyJson);
                                                currencyListAll.push(currencyResult[k]);
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
                                                    fundingSourceList.push(fundingSourceJson);
                                                }

                                                var bTransaction = db1.transaction(['budget'], 'readwrite');
                                                var bOs = bTransaction.objectStore('budget');
                                                var bRequest = bOs.getAll();
                                                var budgetListAll = []
                                                bRequest.onsuccess = function (event) {
                                                    var bResult = [];
                                                    bResult = bRequest.result;
                                                    for (var k = 0; k < bResult.length; k++) {
                                                        var bJson = {
                                                            name: bResult[k].label.label_en,
                                                            id: bResult[k].budgetId
                                                        }
                                                        budgetList.push(bJson);
                                                        budgetListAll.push({
                                                            name: bResult[k].label.label_en,
                                                            id: bResult[k].budgetId,
                                                            fundingSource: bResult[k].fundingSource
                                                        })

                                                    }
                                                    this.setState({
                                                        budgetList: budgetListAll,
                                                        currencyListAll: currencyListAll
                                                    })

                                                    var shipmentListUnFiltered = programJson.shipmentList;
                                                    this.setState({
                                                        shipmentListUnFiltered: shipmentListUnFiltered
                                                    })
                                                    var shipmentList = [];
                                                    if (supplyPlanType == 'psmShipments') {
                                                        shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.procurementAgent.id == 1 && c.erpFlag == false && c.shipmentStatus.id != 8);
                                                    } else if (supplyPlanType == 'artmisShipments') {
                                                        shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.erpFlag == true && c.shipmentStatus.id != 8);
                                                    } else if (supplyPlanType == 'nonPsmShipments') {
                                                        shipmentList = programJson.shipmentList.filter(c => c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate && c.procurementAgent.id != 1 && c.shipmentStatus.id != 8);
                                                    }

                                                    var procurementUnitType = 'hidden';
                                                    if (supplyPlanType == 'nonPsmShipments') {
                                                        procurementUnitType = 'dropdown';
                                                    }

                                                    var tableEditableBasedOnSupplyPlan = true;
                                                    if (supplyPlanType == 'artmisShipments') {
                                                        tableEditableBasedOnSupplyPlan = false;
                                                    }

                                                    this.el = jexcel(document.getElementById("shipmentsDetailsTable"), '');
                                                    this.el.destroy();

                                                    this.el = jexcel(document.getElementById("shipmentBudgetTable"), '');
                                                    this.el.destroy();

                                                    var colArr = ['A', 'F'];
                                                    var data = [];
                                                    var shipmentsArr = [];
                                                    for (var i = 0; i < shipmentList.length; i++) {
                                                        var procurementAgentPlanningUnit = procurementAgentListAll.filter(p => p.procurementAgent.id == shipmentList[i].procurementAgent.id)[0];
                                                        var moq = procurementAgentPlanningUnit.moq;
                                                        var pricePerPlanningUnit = procurementAgentPlanningUnit.catalogPrice;
                                                        var budgetAmount = 0;
                                                        var budgetJson = [];
                                                        var shipmentBudgetList = shipmentList[i].shipmentBudgetList;
                                                        for (var sb = 0; sb < shipmentBudgetList.length; sb++) {
                                                            budgetAmount += (shipmentBudgetList[sb].budgetAmt * shipmentBudgetList[sb].conversionRateToUsd);
                                                            budgetJson.push(shipmentBudgetList[sb]);
                                                        }
                                                        var userQty = "";
                                                        if (procurementAgentPlanningUnit.unitsPerPallet != 0 && procurementAgentPlanningUnit.unitsPerContainer != 0) {
                                                            userQty = shipmentList[i].quantity;
                                                        }
                                                        budgetAmount = budgetAmount.toFixed(2);
                                                        data[0] = shipmentList[i].expectedDeliveryDate; // A
                                                        data[1] = shipmentList[i].shipmentStatus.id; //B
                                                        data[2] = shipmentList[i].orderNo; //C
                                                        data[3] = shipmentList[i].primeLineNo; //D
                                                        data[4] = shipmentList[i].dataSource.id; // E
                                                        data[5] = shipmentList[i].procurementAgent.id; //F
                                                        data[6] = this.state.planningUnitName; //G
                                                        data[7] = shipmentList[i].suggestedQty; //H
                                                        data[8] = moq; //I
                                                        data[9] = `=IF(AB${i + 1}!=0,IF(H${i + 1}>I${i + 1},H${i + 1}/AB${i + 1},I${i + 1}/AB${i + 1}),0)`;
                                                        data[10] = `=IF(AC${i + 1}!=0,IF(H${i + 1}>I${i + 1},H${i + 1}/AC${i + 1},I${i + 1}/AC${i + 1}),0)`;
                                                        data[11] = ""; // Order based on
                                                        data[12] = ""; // Rounding option
                                                        data[13] = userQty; // User Qty
                                                        data[14] = `=IF(L${i + 1}==3,
   
                                    IF(M${i + 1}==1,
                                            CEILING(I${i + 1},1),
                                            FLOOR(I${i + 1},1)
                                    )
                            ,
                            IF(L${i + 1}==4,
                                    IF(NOT(ISBLANK(N${i + 1})),
                                            IF(M${i + 1}==1,
                                                    CEILING(N${i + 1}/AB${i + 1},1)*AB${i + 1},
                                                    FLOOR(N${i + 1}/AB${i + 1},1)*AB${i + 1}
                                            ),
                                            IF(M${i + 1}==1,
                                                    CEILING(J${i + 1},1)*AB${i + 1},
                                                    FLOOR(J${i + 1},1)*AB${i + 1}
                                            )
                                    ),
                                    IF(L${i + 1}==1,
                                            IF(NOT(ISBLANK(N${i + 1})),
                                                    IF(M${i + 1}==1,
                                                    CEILING(N${i + 1}/AC${i + 1},1)*AC${i + 1},
                                                    FLOOR(N${i + 1}/AC${i + 1},1)*AC${i + 1}
                                            ),
                                                    IF(M${i + 1}==1,
                                                            CEILING(K${i + 1},1)*AC${i + 1},
                                                            FLOOR(K${i + 1},1)*AC${i + 1}
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
                                                        data[15] = `=IF(AB${i + 1}!=0,O${i + 1}/AB${i + 1},0)`;
                                                        data[16] = `=IF(AC${i + 1},O${i + 1}/AC${i + 1},0)`;
                                                        data[17] = shipmentList[i].rate;//Manual price
                                                        data[18] = shipmentList[i].procurementUnit.id;
                                                        data[19] = shipmentList[i].supplier.id;
                                                        data[20] = pricePerPlanningUnit;
                                                        data[21] = `=ROUND(IF(AND(NOT(ISBLANK(R${i + 1})),(R${i + 1} != 0)),R${i + 1},U${i + 1})*O${i + 1},2)`; //Amount
                                                        data[22] = shipmentList[i].shipmentMode;//Shipment method
                                                        data[23] = shipmentList[i].freightCost;// Freight Cost
                                                        data[24] = `=ROUND(IF(W${i + 1}=="Sea",(V${i + 1}*AE${i + 1})/100,(V${i + 1}*AD${i + 1})/100),2)`;// Default frieght cost
                                                        data[25] = `=ROUND(V${i + 1}+IF(AND(NOT(ISBLANK(X${i + 1})),(X${i + 1}!= 0)),X${i + 1},Y${i + 1}),2)`; // Final Amount
                                                        data[26] = shipmentList[i].notes;//Notes
                                                        data[27] = procurementAgentPlanningUnit.unitsPerPallet;
                                                        data[28] = procurementAgentPlanningUnit.unitsPerContainer;
                                                        data[29] = airFreightPerc;
                                                        data[30] = seaFreightPerc;
                                                        data[31] = budgetAmount;
                                                        data[32] = budgetJson;
                                                        var index;
                                                        if (shipmentList[i].shipmentId != 0) {
                                                            index = shipmentListUnFiltered.findIndex(c => c.shipmentId == shipmentList[i].shipmentId);
                                                        } else {
                                                            index = shipmentListUnFiltered.findIndex(c => c.orderedDate == shipmentList[i].orderedDate && c.procurementAgent.id == shipmentList[i].procurementAgent.id && c.erpFlag == shipmentList[i].erpFlag && c.expectedDeliveryDate == shipmentList[i].expectedDeliveryDate && c.suggestedOrderQty == shipmentList[i].suggestedOrderQty && c.shipmentStatus.id == shipmentList[i].shipmentStatus.id);
                                                        }
                                                        data[33] = index;
                                                        data[34] = ""// Procurment unit price
                                                        data[35] = shipmentList[i].shipmentStatus.id;
                                                        data[36] = supplyPlanType;
                                                        data[37] = shipmentList[i].active;
                                                        shipmentsArr.push(data);
                                                    }
                                                    var options = {
                                                        data: shipmentsArr,
                                                        colWidths: [100, 100, 100, 100, 120, 120, 200, 80, 80, 80, 80, 100, 100, 80, 80, 80, 80, 80, 250, 120, 80, 100, 80, 80, 80, 100],
                                                        columns: [
                                                            { type: 'calendar', options: { format: 'MM-DD-YYYY', validRange: [moment(Date.now()).format("YYYY-MM-DD"), ''] }, title: "Expected Delivery date" },
                                                            { type: 'dropdown', title: "Shipment status", source: shipmentStatusList, filter: this.shipmentStatusDropdownFilter },
                                                            { type: 'text', title: "Order No" },
                                                            { type: 'text', title: "Prime line number" },
                                                            { type: 'dropdown', title: "Data source", source: dataSourceList },
                                                            { type: 'dropdown', title: "Procurement Agent", source: procurementAgentList },
                                                            { type: 'text', readOnly: true, title: "Planning unit" },
                                                            { type: 'number', readOnly: true, title: "Suggested order qty" },
                                                            { type: 'number', readOnly: true, title: "MoQ" },
                                                            { type: 'number', readOnly: true, title: "No of pallets" },
                                                            { type: 'number', readOnly: true, title: "No of containers" },
                                                            { type: 'dropdown', title: "Order based on", source: [{ id: 1, name: 'Container' }, { id: 2, name: 'Suggested Order Qty' }, { id: 3, name: 'MoQ' }, { id: 4, name: 'Pallet' }] },
                                                            { type: 'dropdown', title: "Rounding option", source: [{ id: 1, name: 'Round Up' }, { id: 2, name: 'Round Down' }] },
                                                            { type: 'text', title: "User qty" },
                                                            { type: 'text', readOnly: true, title: "Adjusted order qty" },
                                                            { type: 'text', readOnly: true, title: "Adjusted pallets" },
                                                            { type: 'text', readOnly: true, title: "Adjusted containers" },
                                                            { type: 'text', title: "User price per planning unit (in USD)" },
                                                            { type: procurementUnitType, title: "Procurement Unit", source: procurementUnitList, filter: this.procurementUnitDropdownFilter },
                                                            { type: procurementUnitType, title: 'Supplier', source: supplierList },
                                                            { type: 'text', readOnly: true, title: "Price per planning unit (in USD)" },
                                                            { type: 'text', readOnly: true, title: "Amount (in USD)" },
                                                            { type: 'dropdown', title: "Shipped method", source: ['Sea', 'Air'] },
                                                            { type: 'text', title: "User Freight cost amount (in USD)" },
                                                            { type: 'text', readOnly: true, title: "Default freight cost (in USD)" },
                                                            { type: 'text', readOnly: true, title: "Total amount (in USD)" },
                                                            { type: 'text', title: "Notes" },
                                                            { type: 'hidden', title: "Units/Pallet" },
                                                            { type: 'hidden', title: "Units/Container" },
                                                            { type: 'hidden', title: "Air Freight Percentage" },
                                                            { type: 'hidden', title: "Sea Freight Percentage" },
                                                            { type: 'hidden', title: 'Budget Amount' },
                                                            { type: 'hidden', title: "Budget Array" },
                                                            { type: 'hidden', title: 'index' },
                                                            { type: 'hidden', title: 'Price per procurement unit' },
                                                            { type: 'hidden', title: 'Shipment status id' },
                                                            { type: 'hidden', title: 'Supply plan type' },
                                                            { type: 'checkbox', title: 'Active' }
                                                        ],
                                                        pagination: false,
                                                        search: false,
                                                        columnSorting: true,
                                                        tableOverflow: true,
                                                        wordWrap: true,
                                                        allowInsertColumn: false,
                                                        allowManualInsertColumn: false,
                                                        allowDeleteRow: false,
                                                        allowInsertRow: false,
                                                        allowManualInsertRow: false,
                                                        copyCompatibility: true,
                                                        editable: tableEditableBasedOnSupplyPlan,
                                                        onchange: this.shipmentChanged,
                                                        updateTable: function (el, cell, x, y, source, value, id) {
                                                            var elInstance = el.jexcel;
                                                            var rowData = elInstance.getRowData(y);
                                                            var unitsPerPalletForUpdate = rowData[27];
                                                            var unitsPerContainerForUpdate = rowData[28];
                                                            var shipmentStatus = rowData[35];
                                                            if (shipmentStatus == 7) {
                                                                for (var i = 0; i < colArr.length; i++) {
                                                                    var cell = elInstance.getCell(`${colArr[i]}${y + 1}`)
                                                                    cell.classList.add('readonly');
                                                                }
                                                            } else if (shipmentStatus >= 3 && supplyPlanType == 'psmShipments' && shipmentStatus != 9) {
                                                                for (var i = 0; i < colArr.length; i++) {
                                                                    var cell = elInstance.getCell(`${colArr[i]}${y + 1}`)
                                                                    cell.classList.add('readonly');
                                                                }
                                                            } else {
                                                                if (unitsPerPalletForUpdate == 0 || unitsPerContainerForUpdate == 0) {
                                                                    var cell = elInstance.getCell(`J${y + 1}`)
                                                                    cell.classList.add('readonly');
                                                                    var cell = elInstance.getCell(`K${y + 1}`)
                                                                    cell.classList.add('readonly');
                                                                    var cell = elInstance.getCell(`L${y + 1}`)
                                                                    cell.classList.add('readonly');
                                                                    var cell = elInstance.getCell(`M${y + 1}`)
                                                                    cell.classList.add('readonly');
                                                                    var cell = elInstance.getCell(`N${y + 1}`)
                                                                    cell.classList.add('readonly');
                                                                } else {
                                                                    var cell = elInstance.getCell(`J${y + 1}`)
                                                                    cell.classList.remove('readonly');
                                                                    var cell = elInstance.getCell(`K${y + 1}`)
                                                                    cell.classList.remove('readonly');
                                                                    var cell = elInstance.getCell(`L${y + 1}`)
                                                                    cell.classList.remove('readonly');
                                                                    var cell = elInstance.getCell(`M${y + 1}`)
                                                                    cell.classList.remove('readonly');
                                                                    var cell = elInstance.getCell(`N${y + 1}`)
                                                                    cell.classList.remove('readonly');
                                                                }
                                                            }
                                                        },
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
                                                                    var shipmentBudget = rowData[32];
                                                                    for (var sb = 0; sb < shipmentBudget.length; sb++) {
                                                                        var data = [];
                                                                        data[0] = shipmentBudget[sb].shipmentBudgetId;
                                                                        data[1] = shipmentBudget[sb].budget.fundingSource.fundingSourceId;
                                                                        data[2] = shipmentBudget[sb].budget.budgetId;
                                                                        data[3] = shipmentBudget[sb].budgetAmt;
                                                                        data[4] = shipmentBudget[sb].currency.currencyId;
                                                                        data[5] = shipmentBudget[sb].conversionRateToUsd;
                                                                        data[6] = y;
                                                                        json.push(data);
                                                                    }
                                                                    if (shipmentBudget.length == 0) {
                                                                        var data = [];
                                                                        data[0] = "";
                                                                        data[1] = "";
                                                                        data[2] = "";
                                                                        data[3] = "";
                                                                        data[4] = ""
                                                                        data[5] = ""
                                                                        data[6] = y;
                                                                        json = [data]
                                                                    }
                                                                    var options = {
                                                                        data: json,
                                                                        columnDrag: true,
                                                                        colWidths: [100, 150, 290, 100, 170, 100],
                                                                        columns: [
                                                                            {
                                                                                title: 'Shipment Budget Id',
                                                                                type: 'hidden',
                                                                            },
                                                                            {
                                                                                title: 'Funding Source',
                                                                                type: 'dropdown',
                                                                                source: fundingSourceList
                                                                            },
                                                                            {
                                                                                title: 'Budget',
                                                                                type: 'dropdown',
                                                                                source: budgetList,
                                                                                filter: this.budgetDropdownFilter
                                                                            },
                                                                            {
                                                                                title: 'Budget Amount',
                                                                                type: 'number',
                                                                            },
                                                                            {
                                                                                title: 'Currency',
                                                                                type: 'dropdown',
                                                                                source: currencyList
                                                                            },
                                                                            {
                                                                                title: 'Conversion rate to USD',
                                                                                type: 'number',
                                                                                readOnly: true
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
                                                                        editable: tableEditableBasedOnSupplyPlan,
                                                                        onchange: this.budgetChanged,
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
                                                                                    title: 'Export as csv',
                                                                                    shortcut: 'Ctrl + S',
                                                                                    onclick: function () {
                                                                                        obj.download(true);
                                                                                    }
                                                                                });
                                                                            }

                                                                            return items;
                                                                        }.bind(this)

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
                                                                    title: 'Export as csv',
                                                                    shortcut: 'Ctrl + S',
                                                                    onclick: function () {
                                                                        obj.download(true);
                                                                    }
                                                                });
                                                            }
                                                            return items;
                                                        }.bind(this)
                                                    };
                                                    myVar = jexcel(document.getElementById("shipmentsDetailsTable"), options);
                                                    this.el = myVar;
                                                    // submitted shipments
                                                    this.setState({
                                                        shipmentsEl: myVar,
                                                        shipmentBudgetTableEl: elVar,
                                                        shipmentChangedFlag: 0,
                                                        budgetChangedFlag: 0
                                                    })
                                                }.bind(this)
                                            }.bind(this)
                                        }.bind(this)
                                    }.bind(this)
                                }.bind(this)
                            }.bind(this)
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }

    shipmentChanged = function (instance, cell, x, y, value) {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var elInstance = this.state.shipmentsEl;
        this.setState({
            shipmentError: '',
            shipmentDuplicateError: '',
        })
        if (x == 0) {
            var col = ("A").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                // if (moment(value).format("YYYY-MM-DD") == 'Invalid date') {
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
            var col1 = ("C").concat(parseInt(y) + 1);
            var col2 = ("D").concat(parseInt(y) + 1);
            var col4 = ("S").concat(parseInt(y) + 1);
            var col5 = ("T").concat(parseInt(y) + 1);
            var supplyPlanType = elInstance.getValueFromCoords(36, y);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                if (value == 3 && supplyPlanType == 'psmShipments') {
                    var orderNo = elInstance.getValueFromCoords(2, y);
                    var lineNo = elInstance.getValueFromCoords(3, y);
                    if (orderNo == "") {
                        elInstance.setStyle(col1, "background-color", "transparent");
                        elInstance.setStyle(col1, "background-color", "yellow");
                        elInstance.setComments(col1, "This field is required.");
                    } else {
                        elInstance.setStyle(col1, "background-color", "transparent");
                        elInstance.setComments(col1, "");
                    }

                    if (lineNo == "") {
                        elInstance.setStyle(col2, "background-color", "transparent");
                        elInstance.setStyle(col2, "background-color", "yellow");
                        elInstance.setComments(col2, "This field is required.");
                    } else {
                        elInstance.setStyle(col2, "background-color", "transparent");
                        elInstance.setComments(col2, "");
                    }
                } else if (value == 4 && supplyPlanType == 'nonPsmShipments') {
                    var procurementUnit = elInstance.getValueFromCoords(18, y);
                    var supplier = elInstance.getValueFromCoords(19, y);
                    if (procurementUnit == "") {
                        elInstance.setStyle(col4, "background-color", "transparent");
                        elInstance.setStyle(col4, "background-color", "yellow");
                        elInstance.setComments(col4, "This field is required.");
                    } else {
                        elInstance.setStyle(col4, "background-color", "transparent");
                        elInstance.setComments(col4, "");
                    }

                    if (supplier == "") {
                        elInstance.setStyle(col5, "background-color", "transparent");
                        elInstance.setStyle(col5, "background-color", "yellow");
                        elInstance.setComments(col5, "This field is required.");
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
                    elInstance.setStyle(col4, "background-color", "transparent");
                    elInstance.setComments(col4, "");
                    elInstance.setStyle(col5, "background-color", "transparent");
                    elInstance.setComments(col5, "");

                }

            }
        }

        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 22) {
            var col = ("W").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
            }
        }

        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            if (value == "") {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, "This field is required.");
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                var valueOfA = elInstance.getValueFromCoords(0, y);
                if (valueOfA != "") {
                    var col1 = ("A").concat(parseInt(y) + 1);
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }
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
                        var procurementAgentPlanningUnit = papuResult.filter(c => c.procurementAgent.id == value && c.planningUnit.id == planningUnitId)[0];
                        elInstance.setValueFromCoords(8, y, procurementAgentPlanningUnit.moq, true);
                        elInstance.setValueFromCoords(20, y, procurementAgentPlanningUnit.catalogPrice, true);
                        elInstance.setValueFromCoords(27, y, procurementAgentPlanningUnit.unitsPerPallet, true);
                        elInstance.setValueFromCoords(28, y, procurementAgentPlanningUnit.unitsPerContainer, true);
                        if (procurementAgentPlanningUnit.unitsPerPallet == 0 || procurementAgentPlanningUnit.unitsPerPallet == 0) {
                            elInstance.setValueFromCoords(11, y, "", true);
                            elInstance.setValueFromCoords(12, y, "", true);
                            elInstance.setValueFromCoords(13, y, "", true);
                        }
                    }.bind(this)
                }.bind(this)
            }
        }

        if (x == 17) {
            var col = ("R").concat(parseInt(y) + 1);
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

        if (x == 13) {
            var col = ("N").concat(parseInt(y) + 1);
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

        if (x == 23) {
            var col = ("X").concat(parseInt(y) + 1);
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

        if (x == 31) {
            var totalAmount = parseFloat((elInstance.getCell(`Z${y + 1}`)).innerHTML).toFixed(2);
            if (value != totalAmount) {
                var col = ("Z").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, 'Budget amount does not match required amount.');
            } else {
                var col = ("Z").concat(parseInt(y) + 1);
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, '');
                this.setState({
                    shipmentBudgetError: '',
                })
            }
        }

        if (x == 2) {
            var shipmentStatus = elInstance.getValueFromCoords(1, y);
            var col1 = ("C").concat(parseInt(y) + 1);
            if (shipmentStatus == 3 && supplyPlanType == 'psmShipments') {
                var orderNo = value;
                if (orderNo == "") {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setStyle(col1, "background-color", "yellow");
                    elInstance.setComments(col1, "This field is required.");
                } else {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }
            } else {
                elInstance.setStyle(col1, "background-color", "transparent");
                elInstance.setComments(col1, "");
            }
        }

        if (x == 3) {
            var shipmentStatus = elInstance.getValueFromCoords(1, y);
            var col1 = ("D").concat(parseInt(y) + 1);
            if (shipmentStatus == 3 && supplyPlanType == 'psmShipments') {
                var orderNo = value;
                if (orderNo == "") {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setStyle(col1, "background-color", "yellow");
                    elInstance.setComments(col1, "This field is required.");
                } else {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }
            } else {
                elInstance.setStyle(col1, "background-color", "transparent");
                elInstance.setComments(col1, "");
            }
        }

        if (x == 18) {
            var shipmentStatus = elInstance.getValueFromCoords(1, y);
            var col1 = ("S").concat(parseInt(y) + 1);
            if (shipmentStatus == 4 && supplyPlanType == 'nonPsmShipments') {
                var orderNo = value;
                if (orderNo == "") {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setStyle(col1, "background-color", "yellow");
                    elInstance.setComments(col1, "This field is required.");
                } else {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }
            } else {
                elInstance.setStyle(col1, "background-color", "transparent");
                elInstance.setComments(col1, "");
            }
        }

        if (x == 19) {
            var shipmentStatus = elInstance.getValueFromCoords(1, y);
            var col1 = ("T").concat(parseInt(y) + 1);
            if (shipmentStatus == 4 && supplyPlanType == 'nonPsmShipments') {
                var orderNo = value;
                if (orderNo == "") {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setStyle(col1, "background-color", "yellow");
                    elInstance.setComments(col1, "This field is required.");
                } else {
                    elInstance.setStyle(col1, "background-color", "transparent");
                    elInstance.setComments(col1, "");
                }
            } else {
                elInstance.setStyle(col1, "background-color", "transparent");
                elInstance.setComments(col1, "");
            }
        }

        this.setState({
            shipmentChangedFlag: 1
        });
    }

    checkValidationForShipments(supplyPlanType) {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var valid = true;
        var elInstance = this.state.shipmentsEl;
        var json = elInstance.getJson();
        var mapArray = [];
        for (var y = 0; y < json.length; y++) {
            var map = new Map(Object.entries(json[y]));
            mapArray.push(map);
            var shipmentDataList = this.state.shipmentListUnFiltered;
            var checkDuplicate = shipmentDataList.filter(c =>
                moment(c.expectedDeliveryDate).format("YYYY-MM") == moment(Date.parse(map.get("0"))).format("YYYY-MM")
                && c.planningUnit.id == planningUnitId
                && c.procurementAgent.id == map.get("5")
                && c.shipmentStatus.id != 8
            )
            var index = shipmentDataList.findIndex(c => moment(c.expectedDeliveryDate).format("YYYY-MM") == moment(Date.parse(map.get("0"))).format("YYYY-MM")
                && c.planningUnit.id == planningUnitId
                && c.procurementAgent.id == map.get("5")
                && c.shipmentStatus.id != 8);

            var checkDuplicateInMap = mapArray.filter(c =>
                moment(c.get("0")).format("YYYY-MM") == moment(Date.parse(map.get("0"))).format("YYYY-MM")
                && c.get("5") == map.get("5")
            )

            if ((checkDuplicate.length >= 1 && index != map.get("33")) || checkDuplicateInMap.length > 1) {
                var colArr = ['A', 'F'];
                for (var c = 0; c < colArr.length; c++) {
                    var col = (colArr[c]).concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "Duplicate shipment");
                }
                valid = false;
                this.setState({
                    shipmentDuplicateError: 'Duplicate shipment'
                })
            } else {
                var colArr = ['A', 'F'];
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
                    elInstance.setComments(col, "This field is required.");
                    valid = false;
                } else {
                    // if (moment(value).format("YYYY-MM-DD") == 'Invalid date') {
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
                var col1 = ("C").concat(parseInt(y) + 1);
                var value = elInstance.getRowData(y)[1];
                var col2 = ("D").concat(parseInt(y) + 1);

                var col4 = ("S").concat(parseInt(y) + 1);
                var col5 = ("T").concat(parseInt(y) + 1);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, "This field is required.");
                    valid = false;
                } else {
                    if (value == 3 && supplyPlanType == 'psmShipments') {
                        var value1 = elInstance.getValueFromCoords(2, y);
                        if (value1 == "") {
                            elInstance.setStyle(col1, "background-color", "transparent");
                            elInstance.setStyle(col1, "background-color", "yellow");
                            elInstance.setComments(col1, i18n.t('static.label.fieldRequired'));
                            valid = false;
                        } else {
                            elInstance.setStyle(col1, "background-color", "transparent");
                            elInstance.setComments(col1, "");
                        }

                        var col2 = ("D").concat(parseInt(y) + 1);
                        var value2 = elInstance.getValueFromCoords(3, y);
                        if (value2 == "") {
                            elInstance.setStyle(col2, "background-color", "transparent");
                            elInstance.setStyle(col2, "background-color", "yellow");
                            elInstance.setComments(col2, i18n.t('static.label.fieldRequired'));
                            valid = false;
                        } else {
                            elInstance.setStyle(col2, "background-color", "transparent");
                            elInstance.setComments(col2, "");
                        }

                    } else if (value == 4 && supplyPlanType == 'nonPsmShipments') {
                        var procurementUnit = elInstance.getValueFromCoords(18, y);
                        var supplier = elInstance.getValueFromCoords(19, y);
                        if (procurementUnit == "") {
                            elInstance.setStyle(col4, "background-color", "transparent");
                            elInstance.setStyle(col4, "background-color", "yellow");
                            elInstance.setComments(col4, "This field is required.");
                            valid = false;
                        } else {
                            elInstance.setStyle(col4, "background-color", "transparent");
                            elInstance.setComments(col4, "");
                        }

                        if (supplier == "") {
                            elInstance.setStyle(col5, "background-color", "transparent");
                            elInstance.setStyle(col5, "background-color", "yellow");
                            elInstance.setComments(col5, "This field is required.");
                            valid = false
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

                        elInstance.setStyle(col4, "background-color", "transparent");
                        elInstance.setComments(col4, "");
                        elInstance.setStyle(col5, "background-color", "transparent");
                        elInstance.setComments(col5, "");

                    }
                }

                var col = ("W").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(22, y);
                if (value == "") {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setComments(col, "");
                }

                var col = ("N").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(13, y);
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

                var col = ("R").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(17, y);
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

                var col = ("X").concat(parseInt(y) + 1);
                var value = elInstance.getValueFromCoords(23, y);
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
                if (shipmentStatus != 8 && shipmentStatus != 9) {
                    var budgetAmount = (elInstance.getValueFromCoords(31, y));
                    budgetAmount = parseFloat(budgetAmount).toFixed(2);
                    var totalAmount = parseFloat((elInstance.getCell(`Z${y + 1}`)).innerHTML).toFixed(2);
                    var col = ("Z").concat(parseInt(y) + 1);
                    elInstance.setStyle(col, "background-color", "transparent");
                    elInstance.setStyle(col, "background-color", "yellow");
                    elInstance.setComments(col, 'Budget amount does not match required amount.');
                    if (budgetAmount != totalAmount) {
                        this.setState({
                            shipmentBudgetError: "Budget amount does not match required amount."
                        })
                        valid = false;
                    } else {
                        var col = ("Z").concat(parseInt(y) + 1);
                        elInstance.setStyle(col, "background-color", "transparent");
                        elInstance.setComments(col, "");
                    }
                }
            }
        }
        return valid;
    }

    saveShipments(supplyPlanType) {
        var validation = this.checkValidationForShipments(supplyPlanType);
        if (validation == true) {
            var inputs = document.getElementsByClassName("submitBtn");
            for (var i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            this.setState({
                shipmentError: "",
                shipmentDuplicateError: '',
                shipmentBudgetError: ''
            })
            var elInstance = this.state.shipmentsEl;
            var json = elInstance.getJson();
            var planningUnitId = document.getElementById("planningUnitId").value;
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
                    var programDataBytes = CryptoJS.AES.decrypt((programRequest.result).programData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var shipmentDataList = (programJson.shipmentList);
                    for (var j = 0; j < json.length; j++) {
                        var map = new Map(Object.entries(json[j]));
                        var selectedShipmentStatus = map.get("1");
                        var shipmentStatusId = 2;
                        if (selectedShipmentStatus == 1 || selectedShipmentStatus == 2 || (selectedShipmentStatus == 3 && supplyPlanType == 'psmShipments')) {
                            if (map.get("2").length != 0 && map.get("3").length != 0) {
                                shipmentStatusId = 3;
                            }
                        } else if ((selectedShipmentStatus == 3 && supplyPlanType == 'nonPsmShipments')) {
                            if (parseInt(map.get("18")) > 0 && parseInt(map.get("19")) > 0) {
                                shipmentStatusId = 4;
                            } else {
                                shipmentStatusId = 3;
                            }
                        } else {
                            shipmentStatusId = selectedShipmentStatus;
                        }
                        var quantity = (elInstance.getCell(`O${j}`)).innerHTML;
                        var productCost = (elInstance.getCell(`V${j}`)).innerHTML;
                        var rate = 0;
                        if ((elInstance.getCell(`R${j}`)).innerHTML != "" || (elInstance.getCell(`R${j}`)).innerHTML != 0) {
                            rate = (elInstance.getCell(`R${j}`)).innerHTML;
                        } else {
                            rate = (elInstance.getCell(`U${j}`)).innerHTML;
                        }
                        var freightCost = 0;
                        if ((elInstance.getCell(`X${j}`)).innerHTML != "" || (elInstance.getCell(`X${j}`)).innerHTML != 0) {
                            freightCost = (elInstance.getCell(`X${j}`)).innerHTML;
                        } else {
                            freightCost = (elInstance.getCell(`Y${j}`)).innerHTML;
                        }
                        shipmentDataList[parseInt(map.get("33"))].shipmentStatus.id = shipmentStatusId;
                        shipmentDataList[parseInt(map.get("33"))].expectedDeliveryDate = moment(map.get("0")).format("YYYY-MM-DD");
                        shipmentDataList[parseInt(map.get("33"))].orderNo = map.get("2");
                        shipmentDataList[parseInt(map.get("33"))].primeLineNo = map.get("3");
                        shipmentDataList[parseInt(map.get("33"))].dataSource.id = map.get("4");
                        shipmentDataList[parseInt(map.get("33"))].procurementAgent.id = map.get("5");
                        shipmentDataList[parseInt(map.get("33"))].quantity = quantity;
                        shipmentDataList[parseInt(map.get("33"))].rate = rate;
                        shipmentDataList[parseInt(map.get("33"))].productCost = productCost;
                        shipmentDataList[parseInt(map.get("33"))].shipmentMode = map.get("22");
                        shipmentDataList[parseInt(map.get("33"))].freightCost = parseFloat(freightCost).toFixed(2);
                        shipmentDataList[parseInt(map.get("33"))].notes = map.get("26");
                        shipmentDataList[parseInt(map.get("33"))].shipmentBudgetList = map.get("32");
                        shipmentDataList[parseInt(map.get("33"))].procurementUnit.id = map.get("18");
                        shipmentDataList[parseInt(map.get("33"))].supplier.id = map.get("19");
                        shipmentDataList[parseInt(map.get("33"))].active = map.get("37");
                        if (shipmentStatusId == 5) {
                            shipmentDataList[parseInt(map.get("33"))].shippedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                        if (shipmentStatusId == 7) {
                            shipmentDataList[parseInt(map.get("33"))].receivedDate = moment(Date.now()).format("YYYY-MM-DD");
                        }
                    }

                    programJson.shipmentList = shipmentDataList;
                    programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJson), SECRET_KEY)).toString();
                    var putRequest = programTransaction.put(programRequest.result);

                    putRequest.onerror = function (event) {
                        // Handle errors!
                    };
                    putRequest.onsuccess = function (event) {
                        this.toggleLarge(supplyPlanType);
                        this.setState({
                            message: `Shipments Data Saved`,
                            shipmentChangedFlag: 0,
                            budgetChangedFlag: 0,
                            shipmentsEl: '',
                            shipmentBudgetTableEl: ''
                        })
                        this.formSubmit(this.state.monthCount);
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        } else {
            this.setState({
                shipmentError: 'Validation Failed.'
            })
        }
    }

}