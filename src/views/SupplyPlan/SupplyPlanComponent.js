import React from "react";

import {
    Card, CardBody, CardHeader,
    Col, Table, Modal, ModalBody, ModalFooter, ModalHeader, Button,
    InputGroupAddon, Input, InputGroup, Label, FormGroup, Form, Row
} from 'reactstrap';
import ReactDOM from 'react-dom';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import i18n from '../../i18n';
import { Menu, Item, Separator, Submenu, MenuProvider } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';
import { contextMenu } from 'react-contexify';
import { Formik } from 'formik';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import getLabelText from '../../CommonComponent/getLabelText'
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ConsumptionDetails from "../Consumption/ConsumptionDetails";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'

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
            filteredArraySuggestedShipments: [],
            suggestedShipmentChangedFlag: 0
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
        this.dropdownFilter = this.dropdownFilter.bind(this);
        this.suggestedShipmentChanged = this.suggestedShipmentChanged.bind(this);
        this.saveSuggestedShipments = this.saveSuggestedShipments.bind(this);
        this.checkValidationSuggestedShipments = this.checkValidationSuggestedShipments.bind(this);
    }

    actionCanceled(supplyPlanType) {
        this.setState({
            message: i18n.t('static.message.cancelled'),
            suggestedShipmentChangedFlag: 0,
            consumptionChangedFlag: 0,
            inventoryChangedFlag: 0
        })
        this.toggleLarge(supplyPlanType);
    }

    toggleLarge(supplyPlanType, month, quantity) {
        var supplyPlanType = supplyPlanType;
        if (supplyPlanType == 'Consumption') {
            var monthCountConsumption = this.state.monthCount;
            this.setState({
                consumption: !this.state.consumption,
                monthCountConsumption: monthCountConsumption
            });
            this.formSubmit(monthCountConsumption);
        } else if (supplyPlanType == 'SuggestedShipments') {
            this.setState({
                suggestedShipments: !this.state.suggestedShipments,
            });
            this.suggestedShipmentsDetailsClicked(month, quantity);
            console.log("Month-------->", month);
            console.log("Quantity----->", quantity);
        } else if (supplyPlanType == 'Actual QAT Orders') {
            this.setState({
                actualQATOrders: !this.state.actualQATOrders,
                qty: quantity
            });
        } else if (supplyPlanType == 'Shipments ARTMIS') {
            this.setState({
                shipmentsArtmis: !this.state.shipmentsArtmis,
                qty: quantity
            });
        } else if (supplyPlanType == 'Adjustments') {
            var monthCountAdjustments = this.state.monthCount;
            this.setState({
                adjustments: !this.state.adjustments,
                monthCountAdjustments: monthCountAdjustments
            });
            this.formSubmit(monthCountAdjustments);
        } else if (supplyPlanType == 'QAT Recommended Order Qty') {
            this.setState({
                QATRecommendedOrderQty: !this.state.QATRecommendedOrderQty,
                qty: quantity
            });
        }

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


    formSubmit(monthCount) {
        document.getElementById("supplyPlanTableId").style.display = 'block';

        var m = this.getMonthArray(moment(Date.now()).add(monthCount, 'months').utcOffset('-0500'));

        var programId = document.getElementById("programId").value;
        var regionId = document.getElementById("regionId").value;
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

            var filteredArraySuggestedShipments = [];

            var monthsOfStockArray = [];
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
                    var filteredJson = { consumptionQty: '', region: { id: 0 } };
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
                            filteredArray.push({ consumptionQty: '', region: { id: regionListFiltered[i].id } })
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
                    var filteredJsonInventory = { adjustmentQty: '', region: { id: 0 } };
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
                            filteredArrayInventory.push({ adjustmentQty: '', region: { id: regionListFiltered[i].id } })
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

                // Calculation of opening and closing balance
                var openingBalance = 0;
                var totalConsumption = 0;
                var totalAdjustments = 0;

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

                openingBalance = totalAdjustments - totalConsumption;
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
                    var closingBalance = openingBalanceArray[i - 1] - consumptionQtyForCB + inventoryQtyForCB;
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


                // Suggested shipments part
                for (var s = 0; s < 18; s++) {
                    var month = m[s + 3].startDate;
                    var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                    var compare = (month >= currentMonth);
                    if (compare && parseInt(openingBalanceArray[s]) <= parseInt(minStockArray[s])) {
                        var suggestedOrd = parseInt(maxStockArray[s] - minStockArray[s]);
                        if (suggestedOrd == 0) {
                            suggestedShipmentsTotalData.push("");
                        } else {
                            suggestedShipmentsTotalData.push({ "suggestedOrderQty": suggestedOrd, "month": m[s + 3].startDate });
                            filteredArraySuggestedShipments.push({ "suggestedOrderQty": suggestedOrd, "month": m[s + 3].startDate, "type": "suggestedNew" })
                        }
                    } else {
                        suggestedShipmentsTotalData.push("");
                    }
                }
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
                    filteredArraySuggestedShipments: filteredArraySuggestedShipments
                })
            }.bind(this)
        }.bind(this)

    }


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
                        var consumptionList = consumptionListUnFiltered.filter(con => con.planningUnit.id == planningUnitId && con.region.id == region && ((con.consumptionDate >= startDate && con.consumptionDate <= endDate)) && con.actualFlag.toString() == actualFlag.toString());
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
                            data[6] = consumptionListUnFiltered.findIndex(c => c.planningUnit.id == planningUnitId && c.region.id == region && c.consumptionDate == consumptionList[j].consumptionDate && c.actualFlag.toString() == actualFlag.toString());
                            consumptionDataArr[j] = data;
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
                                "index"
                            ],
                            colWidths: [80, 150, 200, 80, 80, 350],
                            columns: [
                                { type: 'text', readOnly: true },
                                { type: 'dropdown', readOnly: true, source: this.state.regionList },
                                { type: 'dropdown', source: dataSourceList },
                                { type: 'numeric' },
                                { type: 'numeric' },
                                { type: 'text' },
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
                            allowInsertRow: false,
                            allowManualInsertRow: false,
                            onchange: this.consumptionChanged,
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
            alert("You need to save the data first.");
        }
    }

    adjustmentsDetailsClicked(inventoryDate, region, month) {
        if (this.state.inventoryChangedFlag == 0) {
            var planningUnitId = document.getElementById("planningUnitId").value;
            var programId = document.getElementById("programId").value;
            var db1;
            var dataSourceList = [];
            var countrySKUList = [];
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
                                }
                            }
                            var inventoryListUnFiltered = (programJson.inventoryList)
                            var inventoryList = (programJson.inventoryList).filter(c => c.planningUnit.id == planningUnitId && c.region.id == region && moment(c.inventoryDate).format("MMM YY") == month);
                            this.el = jexcel(document.getElementById("adjustmentsTable"), '');
                            this.el.destroy();
                            var data = [];
                            var inventoryDataArr = []
                            for (var j = 0; j < inventoryList.length; j++) {
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
                                inventoryDataArr[j] = data;
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
                                            colspan: '1',
                                        }
                                    ],
                                ],
                                columnDrag: true,
                                colWidths: [80, 100, 100, 100, 50, 50, 50, 50, 50, 50, 50, 200],
                                columns: [
                                    { title: 'Month', type: 'text', readOnly: true },
                                    { title: 'Region', type: 'dropdown', readOnly: true, source: this.state.regionList },
                                    { title: 'Data source', type: 'dropdown', source: dataSourceList },
                                    { title: 'Country SKU', type: 'dropdown', source: countrySKUList, readOnly: true },
                                    { title: 'Conversion units', type: 'text', readOnly: true },
                                    { title: 'Quantity', type: 'text', readOnly: true },
                                    { title: 'Planning Unit Qty', type: 'text', readOnly: true },
                                    { title: 'Quantity', type: 'text' },
                                    { title: 'Planning Unit Qty', type: 'text', readOnly: true },
                                    { title: 'Quantity', type: 'text' },
                                    { title: 'Planning Unit Qty', type: 'text', readOnly: true },
                                    { title: 'Notes', type: 'text' },
                                    { title: 'index', type: 'hidden', readOnly: true }
                                ],
                                pagination: false,
                                search: true,
                                columnSorting: true,
                                tableOverflow: true,
                                wordWrap: true,
                                allowInsertColumn: false,
                                allowManualInsertColumn: false,
                                allowDeleteRow: false,
                                allowInsertRow: false,
                                allowManualInsertRow: false,
                                onchange: this.inventoryChanged,
                                oneditionend: this.inventoryOnedit,
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
            alert("You need to save the data first.");
        }
    }

    suggestedShipmentsDetailsClicked(month, quantity) {
        var planningUnitId = document.getElementById("planningUnitId").value;
        var programId = document.getElementById("programId").value;
        var db1;
        var procurementAgentList = [];
        var fundingSourceList = [];
        var budgetList = [];
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
                console.log("Program Json", programJson.shipmentList);

                var addLeadTimes = Math.floor(parseFloat(programJson.plannedToDraftLeadTime) + parseFloat(programJson.draftToSubmittedLeadTime) +
                    parseFloat(programJson.submittedToApprovedLeadTime) + parseFloat(programJson.approvedToShippedLeadTime) +
                    parseFloat(programJson.deliveredToReceivedLeadTime));
                var expectedDeliveryDate = moment(Date.now()).utcOffset('-0500').add(addLeadTimes, 'months').format("YYYY-MM-DD");
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
                                    id: bResult[k].budgetId, fundingSource: bResult[k].fundingSource
                                })

                            }
                            this.setState({
                                budgetList: budgetListAll
                            })
                            var suggestedShipmentList = this.state.filteredArraySuggestedShipments.filter(c => c.month == month);
                            this.el = jexcel(document.getElementById("suggestedShipmentsDetailsTable"), '');
                            this.el.destroy();
                            var data = [];
                            var suggestedShipmentsArr = []
                            for (var j = 0; j < suggestedShipmentList.length; j++) {
                                data = [];
                                data[0] = expectedDeliveryDate;
                                data[1] = "SUGGESTED";
                                data[2] = this.state.planningUnitName;
                                data[3] = suggestedShipmentList[j].suggestedOrderQty;
                                data[4] = suggestedShipmentList[j].suggestedOrderQty;
                                data[5] = "";
                                data[6] = "";
                                data[7] = "";
                                data[8] = "";
                                suggestedShipmentsArr[j] = data;
                            }
                            var options = {
                                data: suggestedShipmentsArr,
                                colHeaders: [
                                    "Expected delivery date",
                                    "Shipment status",
                                    "Planning unit",
                                    "Suggested order qty",
                                    "Adjusted order qty",
                                    "Procurement agent",
                                    "Funding source",
                                    "Budget",
                                    "Notes",
                                ],
                                colWidths: [80, 150, 200, 80, 80, 350, 80, 80, 80],
                                columns: [
                                    { type: 'text', readOnly: true },
                                    { type: 'text', readOnly: true },
                                    { type: 'text', readOnly: true },
                                    { type: 'numeric', readOnly: true },
                                    { type: 'numeric', readOnly: true },
                                    { type: 'dropdown', source: procurementAgentList },
                                    { type: 'dropdown', source: fundingSourceList },
                                    { type: 'dropdown', source: budgetList, filter: this.dropdownFilter },
                                    { type: 'text' },
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
                                onchange: this.suggestedShipmentChanged,
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
        }.bind(this)
    }
}

dropdownFilter = function (instance, cell, c, r, source) {
    var mylist = [];
    var value = (instance.jexcel.getJson()[r])[c - 1];
    console.log(this.state.budgetList);
    var bList = (this.state.budgetList).filter(c => c.fundingSource.fundingSourceId == value);
    return bList;
}

consumptionChanged = function (instance, cell, x, y, value) {
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
    if (x == 3) {
        var col = ("D").concat(parseInt(y) + 1);
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, "This field is required.");
        } else {
            if (isNaN(Number.parseInt(value))) {
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
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, "This field is required.");
        } else {
            if (isNaN(Number.parseInt(value))) {
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

inventoryChanged = function (instance, cell, x, y, value) {
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
    if (x == 7) {
        var col = ("H").concat(parseInt(y) + 1);
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, "This field is required.");
        } else {
            if (isNaN(parseInt(value))) {
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
            if (isNaN(parseInt(value))) {
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

inventoryOnedit = function (instance, cell, x, y, value) {
    var elInstance = this.state.inventoryEl;
    if (x == 7) {
        elInstance.setValueFromCoords(9, y, "", true);
    }
}.bind(this);

suggestedShipmentChanged = function (instance, cell, x, y, value) {
    var elInstance = this.state.suggestedShipmentsEl;
    if (x == 5) {
        var col = ("F").concat(parseInt(y) + 1);
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, "This field is required.");
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
            elInstance.setComments(col, "This field is required.");
        } else {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
        }
    }

    if (x == 7) {
        var col = ("H").concat(parseInt(y) + 1);
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, "This field is required.");
        } else {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
        }
    }

    this.setState({
        suggestedShipmentChangedFlag: 1
    })
}

checkValidationConsumption() {
    var valid = true;
    var elInstance = this.state.consumptionEl;
    var json = elInstance.getJson();
    for (var y = 0; y < json.length; y++) {
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
        if (value === "" || isNaN(Number.parseInt(value))) {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            valid = false;
            if (isNaN(Number.parseInt(value))) {
                elInstance.setComments(col, "in valid number.");
            } else {
                elInstance.setComments(col, "This field is required.");
            }
        } else {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
        }

        var col = ("E").concat(parseInt(y) + 1);
        var value = elInstance.getValueFromCoords(4, y);
        if (value === "" || isNaN(Number.parseInt(value))) {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            valid = false;
            if (isNaN(Number.parseInt(value))) {
                elInstance.setComments(col, "in valid number.");
            } else {
                elInstance.setComments(col, "This field is required.");
            }
        } else {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
        }
    }
    return valid;

}

saveConsumption() {
    var validation = this.checkValidationConsumption();
    if (validation == true) {
        var elInstance = this.state.consumptionEl;
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
                var consumptionDataList = (programJson.consumptionList);
                for (var i = 0; i < json.length; i++) {
                    var map = new Map(Object.entries(json[i]));
                    consumptionDataList[parseInt(map.get("6"))].dataSource.id = map.get("2");
                    consumptionDataList[parseInt(map.get("6"))].consumptionQty = map.get("3");
                    consumptionDataList[parseInt(map.get("6"))].dayOfStockOut = parseInt(map.get("4"));
                    consumptionDataList[parseInt(map.get("6"))].notes = map.get("5");
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
        alert("Validation failed");
    }
}

checkValidationInventory() {
    var valid = true;
    var elInstance = this.state.inventoryEl;
    var json = elInstance.getJson();
    for (var y = 0; y < json.length; y++) {
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
        if (value === "" || isNaN(Number.parseInt(value))) {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            valid = false;
            if (isNaN(Number.parseInt(value))) {
                elInstance.setComments(col, "in valid number.");
            } else {
                elInstance.setComments(col, "This field is required.");
            }
        } else {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
        }
    }
    return valid;
}

saveInventory() {
    var validation = this.checkValidationInventory();
    if (validation == true) {
        var elInstance = this.state.inventoryEl;
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
                    inventoryDataList[parseInt(map.get("12"))].dataSource.id = map.get("2");
                    inventoryDataList[parseInt(map.get("12"))].expectedBal = parseInt(map.get("5"));
                    inventoryDataList[parseInt(map.get("12"))].adjustmentQty = parseInt(map.get("7"));
                    inventoryDataList[parseInt(map.get("12"))].actualQty = parseInt(map.get("9"));
                    inventoryDataList[parseInt(map.get("12"))].notes = parseInt(map.get("11"));


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
                            inventoryDataList[index].expectedBal = parseInt(inventoryDataListFiltered[j - 1].expectedBal) + parseInt(inventoryDataListFiltered[j - 1].adjustmentQty);
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
        alert("Validation failed");
    }
}

checkValidationSuggestedShipments() {
    var valid = true;
    var elInstance = this.state.suggestedShipmentsEl;
    var json = elInstance.getJson();
    for (var y = 0; y < json.length; y++) {
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

        var col = ("H").concat(parseInt(y) + 1);
        var value = elInstance.getValueFromCoords(7, y);
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, "This field is required.");
            valid = false;
        } else {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
        }


    }
    return valid;

}

saveSuggestedShipments() {
    var validation = this.checkValidationSuggestedShipments();
    if (validation == true) {
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
                console.log("Shipment data list", shipmentDataList);
                var map = new Map(Object.entries(json[0]));
                // "Expected delivery date",
                // "Shipment status",
                // "Planning unit",
                // "Suggested order qty",
                // "Adjusted order qty",
                // "Procurement agent",
                // "Funding source",
                // "Budget",
                // "Notes",
                var shipmentJson = {
                    accountFlag: true,
                    active: true,
                    dataSource: {
                        id: 0
                    },
                    erpFlag: false,
                    expectedDeliveryDate: map.get("0"),
                    freightCost: 0,
                    notes: map.get("8"),
                    orderedDate: new Date(),
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
                    quantity: map.get("3"),
                    rate: 0,
                    receivedDate: "",
                    shipmentId: 0,
                    shipmentMode: "",
                    shipmentStatus: {
                        id: 1
                    },
                    shippedDate: "",
                    suggestedQty: map.get("3"),
                    supplier: {
                        id: 0
                    }
                }

                shipmentDataList.push(shipmentJson);
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
        alert("Validation failed");
    }
}

render() {
    const MyMenu = () => (
        <Menu id='menu_id'>
            <Item disabled>Yes-Account</Item>
            <Item>No-Skip</Item>
        </Menu>
    );

    const NoSkip = () => (
        <Menu id='no_skip'>
            <Item>Yes-Account</Item>
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
            <Col xs="12" sm="12">
                <Card>
                    <CardHeader>
                        <strong>Supply plan</strong>
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
                                                                >
                                                                    <option value="0">Please Select</option>
                                                                    {planningUnits}
                                                                </Input>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
                                                    <FormGroup className="tab-ml-1">
                                                        <Label htmlFor="appendedInputButton">Region</Label>
                                                        <div className="controls SelectGo">
                                                            <InputGroup>
                                                                <Input type="select"
                                                                    bsSize="sm"
                                                                    value={this.state.regionId}
                                                                    name="regionId" id="regionId"
                                                                >
                                                                    <option value="-1">All</option>
                                                                    {regions}
                                                                </Input>
                                                                <InputGroupAddon addonType="append">
                                                                    &nbsp;<Button color="secondary Gobtn btn-sm" onClick={() => this.formSubmit(this.state.monthCount)}>{i18n.t('static.common.go')}</Button>
                                                                </InputGroupAddon>
                                                            </InputGroup>
                                                        </div>
                                                    </FormGroup>
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
                                        <th></th>
                                        {
                                            this.state.monthsArray.filter(m => m.display == 1).map(item => (
                                                <th>{item.month}</th>
                                            ))
                                        }
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Opening Balance</td>
                                        {
                                            this.state.openingBalanceArray.map(item1 => (
                                                <td>{item1}</td>
                                            ))
                                        }
                                    </tr>
                                    <tr className="hoverTd" onClick={() => this.toggleLarge('Consumption', '', '')}>
                                        <td>Consumption</td>
                                        {
                                            this.state.consumptionTotalData.map(item1 => (
                                                <td>{item1}</td>
                                            ))
                                        }
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(255, 229, 202)" }}>
                                        <td>Suggested Shipments</td>
                                        {
                                            this.state.suggestedShipmentsTotalData.map(item1 => {
                                                if (item1.toString() != "") {
                                                    return (<td className="hoverTd" onClick={() => this.toggleLarge('SuggestedShipments', `${item1.month}`, `${item1.suggestedOrderQty}`)}>{item1.suggestedOrderQty}</td>)
                                                } else {
                                                    return (<td>{item1}</td>)
                                                }
                                            })
                                        }
                                    </tr>
                                    <tr className="hoverTd" onClick={() => this.toggleLarge('Adjustments', '', '')}>
                                        <td>Adjustments</td>
                                        {
                                            this.state.inventoryTotalData.map(item1 => (
                                                <td>{item1}</td>
                                            ))
                                        }
                                    </tr>
                                    <tr style={{ "backgroundColor": "rgb(188, 228, 229)" }}>
                                        <td>Ending Balance</td>
                                        {
                                            this.state.closingBalanceArray.map(item1 => (
                                                <td>{item1}</td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td>AMC</td>
                                        {
                                            this.state.amcTotalData.map(item1 => (
                                                <td>{item1}</td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td>Months of Stock</td>
                                        {
                                            this.state.monthsOfStockArray.map(item1 => (
                                                <td>{item1}</td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td>Min stock</td>
                                        {
                                            this.state.minStockArray.map(item1 => (
                                                <td>{item1}</td>
                                            ))
                                        }
                                    </tr>
                                    <tr>
                                        <td>Max stock</td>
                                        {
                                            this.state.maxStockArray.map(item1 => (
                                                <td>{item1}</td>
                                            ))
                                        }
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                        <Modal isOpen={this.state.consumption} toggle={() => this.toggleLarge('Consumption')}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('Consumption')} className="modalHeaderSupplyPlan">
                                <strong>Consumption Details</strong>
                                <ul className="legend legend-supplypln">
                                    <li><span className="purplelegend"></span> <span className="legendText">Forecasted consumption</span></li>
                                    <li><span className="blacklegend"></span> <span className="legendText">Actual consumption</span></li>
                                </ul>
                            </ModalHeader>
                            <ModalBody>
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
                                                    <td>{item.name}</td>
                                                    {
                                                        this.state.consumptionFilteredArray.filter(c => c.region.id == item.id).map(item1 => {
                                                            if (item1.consumptionQty.toString() != '') {
                                                                if (item1.actualFlag.toString() == 'true') {
                                                                    return (<td className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.region.id}`, `${item1.actualFlag}`, `${item1.month.month}`)}>{item1.consumptionQty}</td>)
                                                                } else {
                                                                    return (<td style={{ color: 'rgb(170, 85, 161)' }} className="hoverTd" onClick={() => this.consumptionDetailsClicked(`${item1.month.startDate}`, `${item1.month.endDate}`, `${item1.region.id}`, `${item1.actualFlag}`, `${item1.month.month}`)}>{item1.consumptionQty}</td>)
                                                                }
                                                            } else {
                                                                return (<td></td>)
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
                                            <th>Total</th>
                                            {
                                                this.state.consumptionTotalMonthWise.map(item => (
                                                    <th>{item}</th>
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
                                {this.state.consumptionChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={this.saveConsumption}> <i className="fa fa-check"></i> Save</Button>}{' '}
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('Consumption')}> <i className="fa fa-times"></i> Cancel</Button>
                            </ModalFooter>
                        </Modal>

                        <Modal isOpen={this.state.adjustments} toggle={() => this.toggleLarge('Adjustments')}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('Adjustments')} className="modalHeaderSupplyPlan">Adjustments Details</ModalHeader>
                            <ModalBody>
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
                                                    <td>{item.name}</td>
                                                    {
                                                        this.state.inventoryFilteredArray.filter(c => c.region.id == item.id).map(item1 => {
                                                            if (item1.adjustmentQty.toString() != '') {
                                                                return (<td className="hoverTd" onClick={() => this.adjustmentsDetailsClicked(`${item1.inventoryDate}`, `${item1.region.id}`, `${item1.month.month}`)}>{item1.adjustmentQty}</td>)
                                                            } else {
                                                                return (<td></td>)
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
                                            <th>Total</th>
                                            {
                                                this.state.inventoryTotalMonthWise.map(item => (
                                                    <th>{item}</th>
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
                                {this.state.inventoryChangedFlag == 1 && <Button size="md" color="success" className="float-right mr-1" onClick={this.saveInventory}> <i className="fa fa-check"></i> Save</Button>}{' '}
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('Adjustments')}> <i className="fa fa-times"></i> Cancel</Button>
                            </ModalFooter>
                        </Modal>

                        <Modal isOpen={this.state.suggestedShipments} toggle={() => this.toggleLarge('SuggestedShipments')}
                            className={'modal-lg ' + this.props.className, "modalWidth"}>
                            <ModalHeader toggle={() => this.toggleLarge('SuggestedShipments')} className="modalHeaderSupplyPlan">
                                <strong>Shipment Details</strong>
                            </ModalHeader>
                            <ModalBody>
                                <div className="table-responsive">
                                    <div id="suggestedShipmentsDetailsTable" />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                {this.state.suggestedShipmentChangedFlag == 1 && <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={this.saveSuggestedShipments}> <i className="fa fa-check"></i> Save</Button>}{' '}
                                <Button size="md" color="danger" className="float-right mr-1" onClick={() => this.actionCanceled('SuggestedShipments')}> <i className="fa fa-times"></i> Cancel</Button>
                            </ModalFooter>
                        </Modal>
                    </CardBody>
                </Card>
            </Col>
        </div>
    )
}

cancelClicked() {
    // this.props.history.push(`/dashboard/${i18n.t('static.actionCancelled')}`)
}


}