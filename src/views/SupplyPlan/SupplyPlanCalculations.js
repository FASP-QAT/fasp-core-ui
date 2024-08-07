import CryptoJS from 'crypto-js';
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { generateRandomAplhaNumericCode, paddingZero } from '../../CommonComponent/JavascriptCommonFunctions.js';
import { APPROVED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, BATCH_PREFIX, CANCELLED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, INDEXED_DB_NAME, INDEXED_DB_VERSION, ON_HOLD_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SECRET_KEY, SHIPPED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS } from '../../Constants.js';
import i18n from '../../i18n';
import { convertSuggestedShipmentsIntoPlannedShipments } from '../SupplyPlan/SupplyPlanCalculationsForWhatIf.js';
/**
 * This function is used do all the supply plan calculations
 * @param {*} programId This is the program Id for which supply plan has to be build
 * @param {*} planningUnitId This is the planning unit Id for which supply plan has to be build
 * @param {*} objectStoreName This is the name of object store for which supply plan has to be build i.e if supply plan needs to build for scenario planning or supply planning
 * @param {*} page This is the name of the page from which this function is called
 * @param {*} props This is the props of the page from which this function is called
 * @param {*} planningUnitList List of planning units for which supply plan has to be build
 * @param {*} minimumDate This is the minimum date from where the supply plan has to be build
 * @param {*} problemListChild This is the ref for QPL so that QPL can be rebuild after supply plan is build
 * @param {*} rebuild This is used to check if supply plan has to be rebuild or not
 * @param {*} rebuildQPL This is used to check if QPL has to be rebuild or not
 */
export function calculateSupplyPlan(programId, planningUnitId, objectStoreName, page, props, planningUnitList, minimumDate, problemListChild, rebuild, rebuildQPL,monthsInPastForAMC,monthsInFutureForAMC) {
    if (page == 'masterDataSync' && !rebuild) {
        if (problemListChild != undefined && problemListChild != "undefined" && rebuildQPL) {
            problemListChild.qatProblemActions(programId, "loading", true);
        } else {
            props.fetchData(1, programId);
        }
    } else {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onerror = function (event) {
        }.bind(this);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var programDataTransaction = db1.transaction([objectStoreName], 'readwrite');
            var programDataOs = programDataTransaction.objectStore(objectStoreName);
            var programRequest = programDataOs.get(programId);
            programRequest.onerror = function (event) {
            }.bind(this);
            programRequest.onsuccess = function (e) {
                var programDataJson = programRequest.result.programData;
                var planningUnitDataList = programDataJson.planningUnitDataList;
                var generalProgramDataBytes = CryptoJS.AES.decrypt(programDataJson.generalData, SECRET_KEY);
                var generalProgramData = generalProgramDataBytes.toString(CryptoJS.enc.Utf8);
                var generalProgramJson = JSON.parse(generalProgramData);
                var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
                var planningunitRequest = planningunitOs.getAll();
                planningunitRequest.onerror = function (event) {
                }.bind(this);
                planningunitRequest.onsuccess = function (e) {
                    var myResult = [];
                    myResult = planningunitRequest.result;
                    var programQPLDetailsTransaction = db1.transaction(['programQPLDetails'], 'readwrite');
                    var programQPLDetailsOs = programQPLDetailsTransaction.objectStore('programQPLDetails');
                    var programQPLDetailsJsonRequest = programQPLDetailsOs.get(programId);
                    programQPLDetailsJsonRequest.onsuccess = function (e) {
                        var programQPLDetailsJson = programQPLDetailsJsonRequest.result;
                        if (objectStoreName != "whatIfProgramData") {
                            if (page != "masterDataSync") {
                                programQPLDetailsJson.programModified = 1;
                            }
                        }
                        var programPlanningUnitList = myResult;
                        var regionListFiltered = [];
                        var regionList = [];
                        for (var i = 0; i < generalProgramJson.regionList.length; i++) {
                            var regionJson = {
                                id: generalProgramJson.regionList[i].regionId
                            }
                            regionList.push(regionJson);
                        }
                        regionListFiltered = regionList;
                        programPlanningUnitList = (programPlanningUnitList).filter(c => c.program.id == generalProgramJson.programId && c.active.toString() == "true");
                        if (planningUnitId != 0) {
                            programPlanningUnitList = programPlanningUnitList.filter(c => c.planningUnit.id == planningUnitId);
                        }
                        if (planningUnitList != undefined && planningUnitList != [] && planningUnitList.length != 0) {
                            var ppList = [];
                            for (var pp = 0; pp < planningUnitList.length; pp++) {
                                var p = programPlanningUnitList.filter(c => c.planningUnit.id == planningUnitList[pp]);
                                ppList.push(p[0]);
                            }
                            programPlanningUnitList = ppList;
                        }
                        if ((page == 'masterDataSync' || page == 'syncPage' || page == 'erpDelink') && planningUnitList.length == 0) {
                            programPlanningUnitList = [];
                        }
                        try {
                            programPlanningUnitList = programPlanningUnitList.filter(c => c != undefined);
                            for (var ppL = 0; ppL < programPlanningUnitList.length; ppL++) {
                                var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id);
                                var programJson = {};
                                if (planningUnitDataIndex != -1) {
                                    var planningUnitData = ((planningUnitDataList).filter(c => c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id))[0];
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
                                var programJsonForStoringTheResult = programJson;
                                var coreBatchDetails = programJsonForStoringTheResult.batchInfoList;
                                var supplyPlanData = programJsonForStoringTheResult.supplyPlan;
                                if (supplyPlanData == undefined) {
                                    supplyPlanData = []
                                }
                                var shipmentListForMax = (programJsonForStoringTheResult.shipmentList).filter(c => c.active.toString() == "true" && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag.toString() == "true");
                                var inventoryListForMax = (programJsonForStoringTheResult.inventoryList).filter(c => c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active.toString() == "true");
                                var consumptionListForMax = (programJsonForStoringTheResult.consumptionList).filter(c => c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active.toString() == "true");
                                let invmax = moment.max(inventoryListForMax.map(d => moment(d.inventoryDate)))
                                let shipmax = moment.max(shipmentListForMax.map(d => moment(d.expectedDeliveryDate)))
                                let conmax = moment.max(consumptionListForMax.map(d => moment(d.consumptionDate)))
                                var maxDate = invmax.isAfter(shipmax) && invmax.isAfter(conmax) ? invmax : shipmax.isAfter(invmax) && shipmax.isAfter(conmax) ? shipmax : conmax
                                var minDate;
                                var monthsInPastForAmc=programPlanningUnitList[ppL].monthsInPastForAmc;
                                if(monthsInPastForAMC!=undefined){
                                    monthsInPastForAmc=monthsInPastForAMC
                                }
                                var monthsInFutureForAmc=programPlanningUnitList[ppL].monthsInFutureForAmc;
                                if(monthsInFutureForAMC!=undefined){
                                    monthsInFutureForAmc=monthsInFutureForAMC
                                }
                                if (minimumDate != null) {
                                    minDate = moment(minimumDate).subtract(monthsInFutureForAmc + 1, 'months').format("YYYY-MM-DD");
                                } else {
                                    minDate = undefined;
                                }
                                if (minDate == undefined) {
                                    let invmin = moment.min(inventoryListForMax.map(d => moment(d.inventoryDate)))
                                    let shipmin = moment.min(shipmentListForMax.map(d => moment(d.expectedDeliveryDate)))
                                    let conmin = moment.min(consumptionListForMax.map(d => moment(d.consumptionDate)))
                                    minDate = invmin.isBefore(shipmin) && invmin.isBefore(conmin) ? invmin : shipmin.isBefore(invmin) && shipmin.isBefore(conmin) ? shipmin : conmin
                                    minDate = moment(minDate).subtract(monthsInFutureForAmc + 1, 'months').format("YYYY-MM-DD");
                                }
                                var FIRST_DATA_ENTRY_DATE = minDate;
                                var createdDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                                var firstDataEntryDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                                var lastDataEntryDate = moment(maxDate).add((monthsInPastForAmc), 'months').format("YYYY-MM-DD");
                                var lastDate = lastDataEntryDate;
                                var dateAfterFiveYrs = moment(Date.now()).add(60, 'months').format("YYYY-MM-DD");
                                var dateAfterTenYrs = moment(Date.now()).add(120, 'months').format("YYYY-MM-DD");
                                if (moment(dateAfterFiveYrs).format("YYYY-MM-DD") > moment(lastDataEntryDate).format("YYYY-MM-DD")) {
                                    lastDataEntryDate = dateAfterFiveYrs;
                                }
                                if (moment(dateAfterTenYrs).format("YYYY-MM-DD") < moment(lastDataEntryDate).format("YYYY-MM-DD")) {
                                    lastDataEntryDate = dateAfterTenYrs;
                                }
                                supplyPlanData = supplyPlanData.filter(c => (c.planningUnitId != programPlanningUnitList[ppL].planningUnit.id) || (c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id && moment(c.transDate).format("YYYY-MM") < moment(minDate).format("YYYY-MM")));
                                for (var i = 0; createdDate < lastDataEntryDate; i++) {
                                    createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                    var startDate = moment(createdDate).startOf('month').format('YYYY-MM-DD');
                                    var endDate = moment(createdDate).endOf('month').format('YYYY-MM-DD');
                                    var prevMonthDate = moment(createdDate).subtract(1, 'months').startOf('month').format("YYYY-MM-DD");
                                    var prevMonthSupplyPlan = [];
                                    if (supplyPlanData.length > 0) {
                                        prevMonthSupplyPlan = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(prevMonthDate).format("YYYY-MM-DD") && c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id);
                                    } else {
                                        prevMonthSupplyPlan = []
                                    }
                                    var batchDetails = [];
                                    var batchDetailsFromProgramJson = programJsonForStoringTheResult.batchInfoList.filter(c => c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id);
                                    if (prevMonthSupplyPlan.length > 0) {
                                        batchDetails = prevMonthSupplyPlan[0].batchDetails;
                                    }
                                    var expiredStock = 0;
                                    var expiredStockWps = 0;
                                    var myArray = [];
                                    for (var b = 0; b < batchDetails.length; b++) {
                                        if (moment(batchDetails[b].expiryDate).format("YYYY-MM") > moment(startDate).format("YYYY-MM")) {
                                            var json = {
                                                batchId: batchDetails[b].batchId,
                                                batchNo: batchDetails[b].batchNo,
                                                expiryDate: batchDetails[b].expiryDate,
                                                createdDate: batchDetails[b].createdDate,
                                                autoGenerated: batchDetails[b].autoGenerated,
                                                openingBalance: batchDetails[b].qty != undefined && batchDetails[b].qty != null ? Number(batchDetails[b].qty) : 0,
                                                openingBalanceWps: batchDetails[b].qtyWps != undefined && batchDetails[b].qtyWps != null ? Number(batchDetails[b].qtyWps) : 0,
                                                consumption: 0,
                                                adjustment: 0,
                                                stock: 0,
                                                shipment: 0,
                                                shipmentWps: 0,
                                                expiredQty: batchDetails[b].expiredQty != undefined && batchDetails[b].expiredQty != null ? Number(batchDetails[b].expiredQty) : 0,
                                                expiredQtyWps: batchDetails[b].expiredQtyWps != undefined && batchDetails[b].expiredQtyWps != null ? Number(batchDetails[b].expiredQtyWps) : 0
                                            }
                                            myArray.push(json);
                                        } else if (moment(batchDetails[b].expiryDate).format("YYYY-MM") == moment(startDate).format("YYYY-MM")) {
                                            expiredStock += Math.round(Number(batchDetails[b].qty));
                                            expiredStockWps += Math.round(Number(batchDetails[b].qtyWps));
                                            var json = {
                                                batchId: batchDetails[b].batchId,
                                                batchNo: batchDetails[b].batchNo,
                                                expiryDate: batchDetails[b].expiryDate,
                                                createdDate: batchDetails[b].createdDate,
                                                autoGenerated: batchDetails[b].autoGenerated,
                                                openingBalance: batchDetails[b].qty != undefined && batchDetails[b].qty != null ? Number(batchDetails[b].qty) : 0,
                                                openingBalanceWps: batchDetails[b].qtyWps != undefined && batchDetails[b].qtyWps != null ? Number(batchDetails[b].qtyWps) : 0,
                                                consumption: 0,
                                                adjustment: 0,
                                                stock: 0,
                                                shipment: 0,
                                                shipmentWps: 0,
                                                expiredQty: batchDetails[b].qty != undefined && batchDetails[b].qty != null ? Number(batchDetails[b].qty) : 0,
                                                expiredQtyWps: batchDetails[b].qty != undefined && batchDetails[b].qty != null ? Number(batchDetails[b].qty) : 0
                                            }
                                            myArray.push(json);
                                        }
                                    }
                                    var openingBalance = 0;
                                    if (prevMonthSupplyPlan.length > 0) {
                                        openingBalance = prevMonthSupplyPlan[0].closingBalance;
                                    } else {
                                        openingBalance = 0;
                                    }
                                    var openingBalanceWps = 0;
                                    if (prevMonthSupplyPlan.length > 0) {
                                        openingBalanceWps = prevMonthSupplyPlan[0].closingBalanceWps;
                                    } else {
                                        openingBalanceWps = 0;
                                    }
                                    var cutOffDate=generalProgramJson.cutOffDate!=undefined&&generalProgramJson.cutOffDate!=null&&generalProgramJson.cutOffDate!=""?generalProgramJson.cutOffDate:"";
                                    if(cutOffDate!="" && moment(createdDate).format("YYYY-MM")<=moment(cutOffDate).format("YYYY-MM")){
                                        var currentMonthSupplyPlan = programJsonForStoringTheResult.supplyPlan.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(createdDate).format("YYYY-MM-DD") && c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id)
                                        if(currentMonthSupplyPlan.length>0){
                                            openingBalance=currentMonthSupplyPlan[0].openingBalance;
                                            openingBalanceWps=currentMonthSupplyPlan[0].openingBalanceWps;
                                        }else{
                                            openingBalance=0;
                                            openingBalanceWps=0;
                                        }
                                    }
                                    if (moment(startDate).format("YYYY-MM-DD") > moment(lastDate).format("YYYY-MM-DD") && openingBalance == 0 && openingBalanceWps == 0) {
                                        lastDataEntryDate = startDate;
                                    }
                                    var shipmentList = (programJsonForStoringTheResult.shipmentList).filter(c => c.active.toString() == "true" && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag.toString() == "true");
                                    var shipmentArr = shipmentList.filter(c => (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date") ? (c.receivedDate >= startDate && c.receivedDate <= endDate) : (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate))
                                    var shipmentTotalQty = 0;
                                    var shipmentTotalQtyWps = 0;
                                    var manualTotalQty = 0;
                                    var receivedShipmentsTotalData = 0;
                                    var shippedShipmentsTotalData = 0;
                                    var approvedShipmentsTotalData = 0;
                                    var submittedShipmentsTotalData = 0;
                                    var plannedShipmentsTotalData = 0;
                                    var onholdShipmentsTotalData = 0;
                                    var erpTotalQty = 0;
                                    var receivedErpShipmentsTotalData = 0;
                                    var shippedErpShipmentsTotalData = 0;
                                    var approvedErpShipmentsTotalData = 0;
                                    var submittedErpShipmentsTotalData = 0;
                                    var plannedErpShipmentsTotalData = 0;
                                    var onholdErpShipmentsTotalData = 0;
                                    var shipmentBatchQtyTotal = 0;
                                    var shipmentBatchQtyTotalWps = 0;
                                    var consumptionBatchQtyTotal = 0;
                                    var adjustmentBatchQtyTotal = 0;
                                    var actualBatchQtyTotal = 0;
                                    for (var j = 0; j < shipmentArr.length; j++) {
                                        shipmentTotalQty += Number((shipmentArr[j].shipmentQty));
                                        if (shipmentArr[j].shipmentStatus.id != PLANNED_SHIPMENT_STATUS) {
                                            shipmentTotalQtyWps += Number((shipmentArr[j].shipmentQty));
                                        }
                                        if (shipmentArr[j].erpFlag.toString() == "false") {
                                            manualTotalQty += Number((shipmentArr[j].shipmentQty));
                                            if (shipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                                receivedShipmentsTotalData += Number((shipmentArr[j].shipmentQty));
                                            } else if (shipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || shipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                                shippedShipmentsTotalData += Number((shipmentArr[j].shipmentQty));
                                            } else if (shipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                                approvedShipmentsTotalData += Number((shipmentArr[j].shipmentQty));
                                            } else if (shipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                                submittedShipmentsTotalData += Number((shipmentArr[j].shipmentQty));
                                            } else if (shipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS) {
                                                plannedShipmentsTotalData += Number((shipmentArr[j].shipmentQty));
                                            } else if (shipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                                onholdShipmentsTotalData += Number((shipmentArr[j].shipmentQty));
                                            }
                                        } else {
                                            erpTotalQty += Number((shipmentArr[j].shipmentQty));
                                            if (shipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                                receivedErpShipmentsTotalData += Number((shipmentArr[j].shipmentQty));
                                            } else if (shipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || shipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                                shippedErpShipmentsTotalData += Number((shipmentArr[j].shipmentQty));
                                            } else if (shipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                                approvedErpShipmentsTotalData += Number((shipmentArr[j].shipmentQty));
                                            } else if (shipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                                submittedErpShipmentsTotalData += Number((shipmentArr[j].shipmentQty));
                                            } else if (shipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS) {
                                                plannedErpShipmentsTotalData += Number((shipmentArr[j].shipmentQty));
                                            } else if (shipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                                onholdErpShipmentsTotalData += Number((shipmentArr[j].shipmentQty));
                                            }
                                        }
                                        var batchListForShipments = shipmentArr[j].batchInfoList;
                                        for (var b = 0; b < batchListForShipments.length; b++) {
                                            var batchNo = batchListForShipments[b].batch.batchNo;
                                            var expiryDate = batchListForShipments[b].batch.expiryDate
                                            var index = myArray.findIndex(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                            if (index == -1) {
                                                var bd = batchDetailsFromProgramJson.filter(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                                if (bd.length > 0) {
                                                    bd = bd[0];
                                                    var shipmentQtyWps = 0;
                                                    if (shipmentArr[j].shipmentStatus.id != PLANNED_SHIPMENT_STATUS) {
                                                        shipmentQtyWps = Math.round(Number(batchListForShipments[b].shipmentQty) * Number(shipmentArr[j].realmCountryPlanningUnit.multiplier));
                                                    }
                                                    var json = {
                                                        batchId: bd.batchId,
                                                        batchNo: bd.batchNo,
                                                        expiryDate: bd.expiryDate,
                                                        createdDate: bd.createdDate,
                                                        autoGenerated: bd.autoGenerated,
                                                        openingBalance: 0,
                                                        openingBalanceWps: 0,
                                                        consumption: 0,
                                                        adjustment: 0,
                                                        stock: 0,
                                                        shipment: Math.round(Number(batchListForShipments[b].shipmentQty) * Number(shipmentArr[j].realmCountryPlanningUnit.multiplier)),
                                                        shipmentWps: shipmentQtyWps,
                                                        expiredQty: 0,
                                                        expiredQtyWps: 0
                                                    }
                                                    myArray.push(json);
                                                }
                                            } else {
                                                myArray[index].shipment = Number(myArray[index].shipment) + Math.round(Number(batchListForShipments[b].shipmentQty) * Number(shipmentArr[j].realmCountryPlanningUnit.multiplier));
                                                if (shipmentArr[j].shipmentStatus.id != PLANNED_SHIPMENT_STATUS) {
                                                    myArray[index].shipmentWps = Number(myArray[index].shipmentWps) + Math.round(Number(batchListForShipments[b].shipmentQty) * Number(shipmentArr[j].realmCountryPlanningUnit.multiplier));
                                                }
                                            }
                                            var index = myArray.findIndex(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") && moment(expiryDate).format("YYYY-MM"));
                                            if (index != -1) {
                                                shipmentBatchQtyTotal += Number(myArray[index].shipment) + Number(batchListForShipments[b].shipmentQty);
                                                if (shipmentArr[j].shipmentStatus.id != PLANNED_SHIPMENT_STATUS) {
                                                    shipmentBatchQtyTotalWps += Number(myArray[index].shipment) + Number(batchListForShipments[b].shipmentQty);
                                                }
                                            }
                                        }
                                    }
                                    var inventoryList = (programJsonForStoringTheResult.inventoryList).filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active.toString() == "true");
                                    var actualStockCount = 0;
                                    var adjustmentQty = 0;
                                    var regionsReportingActualInventory = 0;
                                    var totalNoOfRegions = (regionListFiltered).length;
                                    for (var r = 0; r < totalNoOfRegions; r++) {
                                        var inventoryListForRegion = inventoryList.filter(c => c.region != null && c.region.id != 0 && c.region.id == regionList[r].id);
                                        var noOfEntriesOfActualStockCount = (inventoryListForRegion.filter(c => c.actualQty != undefined && c.actualQty != null && c.actualQty !== "")).length;
                                        if (noOfEntriesOfActualStockCount > 0) {
                                            regionsReportingActualInventory += 1;
                                        }
                                        for (var inv = 0; inv < inventoryListForRegion.length; inv++) {
                                            if (noOfEntriesOfActualStockCount > 0) {
                                                if (inventoryListForRegion[inv].actualQty !== "" && inventoryListForRegion[inv].actualQty != null && inventoryListForRegion[inv].actualQty != undefined) {
                                                    actualStockCount += Math.round(Number(inventoryListForRegion[inv].actualQty) * Number(inventoryListForRegion[inv].multiplier));
                                                }
                                                var batchListForInventory = inventoryListForRegion[inv].batchInfoList;
                                                for (var b = 0; b < batchListForInventory.length; b++) {
                                                    var batchNo = batchListForInventory[b].batch.batchNo;
                                                    var expiryDate = batchListForInventory[b].batch.expiryDate;
                                                    var index = myArray.findIndex(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                                    if (index == -1) {
                                                        var bd = batchDetailsFromProgramJson.filter(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                                        if (bd.length > 0) {
                                                            bd = bd[0]
                                                            var json = {
                                                                batchId: bd.batchId,
                                                                batchNo: bd.batchNo,
                                                                expiryDate: bd.expiryDate,
                                                                createdDate: bd.createdDate,
                                                                autoGenerated: bd.autoGenerated,
                                                                openingBalance: 0,
                                                                openingBalanceWps: 0,
                                                                consumption: 0,
                                                                adjustment: 0,
                                                                stock: Math.round(Number(batchListForInventory[b].actualQty) * Number(inventoryListForRegion[inv].multiplier)),
                                                                shipment: 0,
                                                                shipmentWps: 0,
                                                                expiredQty: 0,
                                                                expiredQtyWps: 0
                                                            }
                                                            myArray.push(json);
                                                        }
                                                    } else {
                                                        myArray[index].stock = Number(myArray[index].stock) + Math.round(Number(batchListForInventory[b].actualQty) * Number(inventoryListForRegion[inv].multiplier));
                                                    }
                                                    var index = myArray.findIndex(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                                    actualBatchQtyTotal += Math.round(Number(batchListForInventory[b].actualQty) * Number(inventoryListForRegion[inv].multiplier));
                                                }
                                            } else {
                                                if (inventoryListForRegion[inv].adjustmentQty !== "" && inventoryListForRegion[inv].adjustmentQty != null && inventoryListForRegion[inv].adjustmentQty != undefined) {
                                                    adjustmentQty += Math.round(Number(inventoryListForRegion[inv].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier));
                                                }
                                                var batchListForInventory = inventoryListForRegion[inv].batchInfoList;
                                                for (var b = 0; b < batchListForInventory.length; b++) {
                                                    var batchNo = batchListForInventory[b].batch.batchNo;
                                                    var expiryDate = batchListForInventory[b].batch.expiryDate;
                                                    var index = myArray.findIndex(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                                    if (index == -1) {
                                                        var bd = batchDetailsFromProgramJson.filter(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                                        if (bd.length > 0) {
                                                            bd = bd[0];
                                                            var json = {
                                                                batchId: bd.batchId,
                                                                batchNo: bd.batchNo,
                                                                expiryDate: bd.expiryDate,
                                                                createdDate: bd.createdDate,
                                                                autoGenerated: bd.autoGenerated,
                                                                openingBalance: 0,
                                                                openingBalanceWps: 0,
                                                                consumption: 0,
                                                                adjustment: Math.round(Number(batchListForInventory[b].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier)),
                                                                stock: 0,
                                                                shipment: 0,
                                                                shipmentWps: 0,
                                                                expiredQty: 0,
                                                                expiredQtyWps: 0
                                                            }
                                                            myArray.push(json);
                                                            adjustmentBatchQtyTotal += Math.round(Number(batchListForInventory[b].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier));
                                                        }
                                                    } else {
                                                        myArray[index].adjustment = Number(myArray[index].adjustment) + Math.round(Number(batchListForInventory[b].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier));
                                                        if (myArray[index].stock == 0) {
                                                            adjustmentBatchQtyTotal += Math.round(Number(batchListForInventory[b].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier));
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    var consumptionList = (programJsonForStoringTheResult.consumptionList).filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active.toString() == "true");
                                    var actualConsumptionQty = 0;
                                    var trueDemandPerMonth = 0;
                                    var forecastedConsumptionQty = 0;
                                    var regionsReportingActualConsumption = [];
                                    var noOfRegionsReportingActualConsumption = 0;
                                    var consumptionQty = 0;
                                    var consumptionType = "";
                                    var regionList = regionListFiltered;
                                    for (var c = 0; c < consumptionList.length; c++) {
                                        if (consumptionList[c].actualFlag.toString() == "true") {
                                            actualConsumptionQty += Math.round(Math.round(consumptionList[c].consumptionRcpuQty) * Number(consumptionList[c].multiplier));
                                            if (consumptionList[c].dayOfStockOut > 0) {
                                                var daysPerMonth = moment(startDate).daysInMonth();
                                                var daysOfData = daysPerMonth - consumptionList[c].dayOfStockOut;
                                                if (daysOfData > 0) {
                                                    var trueDemandPerDay = (Math.round(consumptionList[c].consumptionRcpuQty) * Number(consumptionList[c].multiplier)) / daysOfData;
                                                    trueDemandPerMonth += Math.round(trueDemandPerDay * daysPerMonth);
                                                }
                                            } else {
                                                trueDemandPerMonth += Math.round(Math.round(consumptionList[c].consumptionRcpuQty) * Number(consumptionList[c].multiplier))
                                            }
                                            var index = regionsReportingActualConsumption.findIndex(f => f == consumptionList[c].region.id);
                                            if (index == -1) {
                                                regionsReportingActualConsumption.push(consumptionList[c].region.id);
                                            }
                                        } else {
                                            forecastedConsumptionQty += Math.round(Math.round(consumptionList[c].consumptionRcpuQty) * Number(consumptionList[c].multiplier))
                                        }
                                    }
                                    noOfRegionsReportingActualConsumption = regionsReportingActualConsumption.length;
                                    if (consumptionList.length == 0) {
                                        consumptionQty = "";
                                        consumptionType = "";
                                    } else if (((totalNoOfRegions == noOfRegionsReportingActualConsumption) || (actualConsumptionQty >= forecastedConsumptionQty)) && (noOfRegionsReportingActualConsumption > 0)) {
                                        consumptionQty = actualConsumptionQty;
                                        consumptionType = 1;
                                        var consumptionListForActualConsumption = consumptionList.filter(c => c.actualFlag.toString() == "true");
                                        for (var ac = 0; ac < consumptionListForActualConsumption.length; ac++) {
                                            var batchListForConsumption = consumptionListForActualConsumption[ac].batchInfoList;
                                            for (var b = 0; b < batchListForConsumption.length; b++) {
                                                var batchNo = batchListForConsumption[b].batch.batchNo;
                                                var expiryDate = batchListForConsumption[b].batch.expiryDate;
                                                var index = myArray.findIndex(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                                if (index == -1) {
                                                    var bd = batchDetailsFromProgramJson.filter(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                                    if (bd.length > 0) {
                                                        bd = bd[0]
                                                        var json = {
                                                            batchId: bd.batchId,
                                                            batchNo: bd.batchNo,
                                                            expiryDate: bd.expiryDate,
                                                            createdDate: bd.createdDate,
                                                            autoGenerated: bd.autoGenerated,
                                                            openingBalance: 0,
                                                            openingBalanceWps: 0,
                                                            consumption: Math.round(Number(batchListForConsumption[b].consumptionQty) * Number(consumptionListForActualConsumption[ac].multiplier)),
                                                            adjustment: 0,
                                                            stock: 0,
                                                            shipment: 0,
                                                            shipmentWps: 0,
                                                            expiredQty: 0,
                                                            expiredQtyWps: 0
                                                        }
                                                        myArray.push(json);
                                                    }
                                                } else {
                                                    myArray[index].consumption = Number(myArray[index].consumption) + Math.round(Number(batchListForConsumption[b].consumptionQty) * Number(consumptionListForActualConsumption[ac].multiplier));
                                                }
                                                var index = myArray.findIndex(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                                consumptionBatchQtyTotal += Math.round(Number(batchListForConsumption[b].consumptionQty) * Number(consumptionListForActualConsumption[ac].multiplier));
                                            }
                                        }
                                    } else {
                                        consumptionQty = forecastedConsumptionQty;
                                        consumptionType = 0;
                                        trueDemandPerMonth = forecastedConsumptionQty;
                                    }
                                    var expectedStock = 0;
                                    expectedStock = openingBalance - expiredStock + shipmentTotalQty - (consumptionQty !== "" ? Number(consumptionQty) : 0) + (adjustmentQty !== "" ? Number(adjustmentQty) : 0);
                                    var expectedStockWps = 0;
                                    expectedStockWps = openingBalanceWps - expiredStockWps + shipmentTotalQtyWps - (consumptionQty !== "" ? Number(consumptionQty) : 0) + (adjustmentQty !== "" ? Number(adjustmentQty) : 0);
                                    var nationalAdjustment = 0;
                                    if (regionsReportingActualInventory == totalNoOfRegions && expectedStock != actualStockCount) {
                                        nationalAdjustment = actualStockCount - expectedStock;
                                    } else if (regionsReportingActualInventory > 0 && inventoryList.length != 0 && actualStockCount > (expectedStock + adjustmentQty)) {
                                        nationalAdjustment = actualStockCount - expectedStock;
                                    } else if (regionsReportingActualInventory > 0 && expectedStock < 0) {
                                        nationalAdjustment = actualStockCount - expectedStock;
                                    }
                                    var nationalAdjustmentWps = 0;
                                    if (regionsReportingActualInventory == totalNoOfRegions && expectedStockWps != actualStockCount) {
                                        nationalAdjustmentWps = actualStockCount - expectedStockWps;
                                    } else if (regionsReportingActualInventory > 0 && inventoryList.length != 0 && actualStockCount > (expectedStock + adjustmentQty)) {
                                        nationalAdjustmentWps = actualStockCount - expectedStockWps;
                                    } else if (regionsReportingActualInventory > 0 && expectedStockWps < 0) {
                                        nationalAdjustmentWps = actualStockCount - expectedStockWps;
                                    }
                                    myArray = myArray.sort(function (a, b) { return ((new Date(a.expiryDate) - new Date(b.expiryDate)) || (a.batchId - b.batchId)) })
                                    var unallocatedFEFO = Number(consumptionQty) - Math.min(0, Number(adjustmentQty) + Number(nationalAdjustment));
                                    var unallocatedLEFO = 0 - Math.max(0, Number(adjustmentQty) + Number(nationalAdjustment));
                                    var unallocatedFEFOWps = Number(consumptionQty) - Math.min(0, Number(adjustmentQty) + Number(nationalAdjustment));
                                    var unallocatedLEFOWps = 0 - Math.max(0, Number(adjustmentQty) + Number(nationalAdjustment));
                                    for (var a = 0; a < myArray.length; a++) {
                                        var bd = myArray[a];
                                        var tempOB = Number(myArray[a].openingBalance)
                                            - Number(myArray[a].expiredQty)
                                            + Number(myArray[a].shipment);
                                        var consumption = Number(myArray[a].consumption);
                                        var adjustment = (Number(myArray[a].stock) == 0 ? Number(myArray[a].adjustment) : 0);
                                        if (Number(adjustmentQty) + Number(nationalAdjustment) > 0) {
                                            if ((Number(tempOB) + Number(adjustment)) >= 0) {
                                                unallocatedLEFO += Number(adjustment);
                                            } else {
                                                unallocatedLEFO -= Number(tempOB);
                                            }
                                        } else {
                                            if ((Number(tempOB) + Number(adjustment)) >= 0) {
                                                unallocatedFEFO += Number(adjustment);
                                            } else {
                                                unallocatedFEFO -= Number(tempOB);
                                            }
                                        }
                                        if ((Number(tempOB) - Number(consumption) + Number(adjustment)) >= 0) {
                                            unallocatedFEFO -= Number(consumption);
                                        } else {
                                            unallocatedFEFO -= (Number(tempOB) + Number(adjustment)) > 0 ? Number(tempOB) + Number(adjustment) : 0;
                                        }
                                        if ((Number(tempOB) - Number(consumption) + Number(adjustment)) > 0) {
                                            myArray[a].closingBalance = (Number(tempOB) - Number(consumption) + Number(adjustment));
                                        } else {
                                            myArray[a].closingBalance = 0;
                                        }
                                        var tempOBWps = Number(myArray[a].openingBalanceWps)
                                            - Number(myArray[a].expiredQtyWps)
                                            + Number(myArray[a].shipmentWps);
                                        var consumptionWps = Number(myArray[a].consumption);
                                        var adjustmentWps = (Number(myArray[a].stock) == 0 ? Number(myArray[a].adjustment) : 0);
                                        if (Number(adjustmentQty) + Number(nationalAdjustment) > 0) {
                                            if ((Number(tempOBWps) + Number(adjustmentWps)) >= 0) {
                                                unallocatedLEFOWps += Number(adjustmentWps);
                                            } else {
                                                unallocatedLEFOWps -= Number(tempOBWps);
                                            }
                                        } else {
                                            if ((Number(tempOBWps) + Number(adjustmentWps)) >= 0) {
                                                unallocatedFEFOWps += Number(adjustmentWps);
                                            } else {
                                                unallocatedFEFOWps -= Number(tempOBWps);
                                            }
                                        }
                                        if ((Number(tempOBWps) - Number(consumptionWps) + Number(adjustmentWps)) >= 0) {
                                            unallocatedFEFOWps -= Number(consumptionWps);
                                        } else {
                                            unallocatedFEFOWps -= (Number(tempOBWps) + Number(adjustmentWps)) > 0 ? Number(tempOBWps) + Number(adjustmentWps) : 0;
                                        }
                                        if ((Number(tempOBWps) - Number(consumptionWps) + Number(adjustmentWps)) > 0) {
                                            myArray[a].closingBalanceWps = (Number(tempOBWps) - Number(consumptionWps) + Number(adjustmentWps));
                                        } else {
                                            myArray[a].closingBalanceWps = 0;
                                        }
                                    }
                                    if (Number(unallocatedLEFO) != 0) {
                                        for (var a = (myArray.length) - 1; a >= 0; a--) {
                                            if (Number(unallocatedLEFO) != 0) {
                                                var tempCB = Number(myArray[a].closingBalance);
                                                myArray[a].unallocatedLEFO = Number(unallocatedLEFO);
                                                if (Number(tempCB) >= Number(unallocatedLEFO) && moment(myArray[a].expiryDate).format("YYYY-MM") > moment(startDate).format("YYYY-MM")) {
                                                    myArray[a].closingBalance = Number(tempCB) - Number(unallocatedLEFO);
                                                    myArray[a].calculatedLEFO = Number(unallocatedLEFO);
                                                    unallocatedLEFO = 0;
                                                } else {
                                                    myArray[a].closingBalance = 0;
                                                    myArray[a].calculatedLEFO = Number(tempCB);
                                                    unallocatedLEFO -= Number(tempCB);
                                                }
                                                myArray[a].qty = Number(myArray[a].closingBalance);
                                            }
                                        }
                                    }
                                    if (Number(unallocatedLEFOWps) != 0) {
                                        for (var a = (myArray.length) - 1; a >= 0; a--) {
                                            if (Number(unallocatedLEFOWps) != 0) {
                                                var tempCB = Number(myArray[a].closingBalanceWps);
                                                myArray[a].unallocatedLEFOWps = Number(unallocatedLEFOWps);
                                                if (Number(tempCB) >= Number(unallocatedLEFOWps) && moment(myArray[a].expiryDate).format("YYYY-MM") > moment(startDate).format("YYYY-MM")) {
                                                    myArray[a].closingBalanceWps = Number(tempCB) - Number(unallocatedLEFOWps);
                                                    myArray[a].calculatedLEFOWps = Number(unallocatedLEFOWps);
                                                    unallocatedLEFOWps = 0;
                                                } else {
                                                    myArray[a].closingBalanceWps = 0;
                                                    myArray[a].calculatedLEFOWps = Number(tempCB);
                                                    unallocatedLEFOWps -= Number(tempCB);
                                                }
                                                myArray[a].qtyWps = Number(myArray[a].closingBalanceWps);
                                            }
                                        }
                                    }
                                    if (Number(unallocatedLEFO) < 0 || Number(unallocatedLEFOWps) < 0) {
                                        var checkIfBatchExists = batchDetailsFromProgramJson.findIndex(c => moment(c.createdDate).format("YYYY-MM-DD") == moment(startDate).format("YYYY-MM-DD") && moment(c.expiryDate).format("YYYY-MM-DD") == moment(startDate).add(programPlanningUnitList[ppL].shelfLife, 'months').format("YYYY-MM-DD"));
                                        if (checkIfBatchExists == -1) {
                                            var batchNo = (BATCH_PREFIX).concat(paddingZero(generalProgramJson.programId, 0, 6)).concat(paddingZero(programPlanningUnitList[ppL].planningUnit.id, 0, 8)).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                                            var json = {
                                                batchId: 0,
                                                batchNo: batchNo,
                                                autoGenerated: true,
                                                openingBalance: 0,
                                                openingBalanceWps: 0,
                                                consumption: 0,
                                                adjustment: 0,
                                                stock: 0,
                                                shipment: 0,
                                                shipmentWps: 0,
                                                expiredQty: 0,
                                                expiredQtyWps: 0,
                                                shelfLife: programPlanningUnitList[ppL].shelfLife,
                                                expiryDate: moment(startDate).add(programPlanningUnitList[ppL].shelfLife, 'months').format("YYYY-MM-DD"),
                                                createdDate: moment(startDate).format("YYYY-MM-DD"),
                                                openingBalance: 0,
                                                openingBalanceWps: 0,
                                                unallocatedLEFO: Number(unallocatedLEFO) < 0 ? Number(unallocatedLEFO) : 0,
                                                calculatedLEFO: Number(unallocatedLEFO) < 0 ? Number(unallocatedLEFO) : 0,
                                                unallocatedLEFOWps: Number(unallocatedLEFOWps) < 0 ? Number(unallocatedLEFOWps) : 0,
                                                calculatedLEFOWps: Number(unallocatedLEFOWps) < 0 ? Number(unallocatedLEFOWps) : 0,
                                                closingBalance: Number(unallocatedLEFO) < 0 ? 0 - Number(unallocatedLEFO) : 0,
                                                closingBalanceWps: Number(unallocatedLEFOWps) < 0 ? 0 - Number(unallocatedLEFOWps) : 0,
                                                qty: Number(unallocatedLEFO) < 0 ? 0 - Number(unallocatedLEFO) : 0,
                                                qtyWps: Number(unallocatedLEFOWps) < 0 ? 0 - Number(unallocatedLEFOWps) : 0,
                                            }
                                            myArray.push(json);
                                            var coreBatch = {
                                                batchId: 0,
                                                batchNo: batchNo,
                                                autoGenerated: true,
                                                planningUnitId: programPlanningUnitList[ppL].planningUnit.id,
                                                expiryDate: moment(startDate).add(programPlanningUnitList[ppL].shelfLife, 'months').format("YYYY-MM-DD"),
                                                createdDate: moment(startDate).format("YYYY-MM-DD")
                                            }
                                            coreBatchDetails.push(coreBatch)
                                        } else {
                                            var json = {
                                                batchId: batchDetailsFromProgramJson[checkIfBatchExists].batchId,
                                                batchNo: batchDetailsFromProgramJson[checkIfBatchExists].batchNo,
                                                autoGenerated: batchDetailsFromProgramJson[checkIfBatchExists].autoGenerated,
                                                openingBalance: 0,
                                                openingBalanceWps: 0,
                                                consumption: 0,
                                                adjustment: 0,
                                                stock: 0,
                                                shipment: 0,
                                                shipmentWps: 0,
                                                expiredQty: 0,
                                                expiredQtyWps: 0,
                                                shelfLife: programPlanningUnitList[ppL].shelfLife,
                                                expiryDate: moment(startDate).add(programPlanningUnitList[ppL].shelfLife, 'months').format("YYYY-MM-DD"),
                                                createdDate: moment(startDate).format("YYYY-MM-DD"),
                                                openingBalance: 0,
                                                openingBalanceWps: 0,
                                                unallocatedLEFO: Number(unallocatedLEFO) < 0 ? Number(unallocatedLEFO) : 0,
                                                calculatedLEFO: Number(unallocatedLEFO) < 0 ? Number(unallocatedLEFO) : 0,
                                                unallocatedLEFOWps: Number(unallocatedLEFOWps) < 0 ? Number(unallocatedLEFOWps) : 0,
                                                calculatedLEFOWps: Number(unallocatedLEFOWps) < 0 ? Number(unallocatedLEFOWps) : 0,
                                                closingBalance: Number(unallocatedLEFO) < 0 ? 0 - Number(unallocatedLEFO) : 0,
                                                closingBalanceWps: Number(unallocatedLEFOWps) < 0 ? 0 - Number(unallocatedLEFOWps) : 0,
                                                qty: Number(unallocatedLEFO) < 0 ? 0 - Number(unallocatedLEFO) : 0,
                                                qtyWps: Number(unallocatedLEFOWps) < 0 ? 0 - Number(unallocatedLEFOWps) : 0,
                                            }
                                            myArray.push(json);
                                        }
                                    }
                                    for (var a = 0; a < myArray.length; a++) {
                                        var tempCB = Number(myArray[a].closingBalance);
                                        myArray[a].unallocatedFEFO = Number(unallocatedFEFO);
                                        if (Number(tempCB) >= Number(unallocatedFEFO) && moment(myArray[a].expiryDate).format("YYYY-MM") > moment(startDate).format("YYYY-MM")) {
                                            myArray[a].closingBalance = Number(tempCB) - Number(unallocatedFEFO);
                                            myArray[a].calculatedFEFO = Number(unallocatedFEFO);
                                            unallocatedFEFO = 0;
                                        } else {
                                            myArray[a].closingBalance = 0;
                                            myArray[a].calculatedFEFO = Number(tempCB);
                                            unallocatedFEFO -= Number(tempCB);
                                        }
                                        myArray[a].qty = Number(myArray[a].closingBalance);
                                    }
                                    for (var a = 0; a < myArray.length; a++) {
                                        var tempCB = Number(myArray[a].closingBalanceWps);
                                        myArray[a].unallocatedFEFOWps = Number(unallocatedFEFOWps);
                                        if (Number(tempCB) >= Number(unallocatedFEFOWps) && moment(myArray[a].expiryDate).format("YYYY-MM") > moment(startDate).format("YYYY-MM")) {
                                            myArray[a].closingBalanceWps = Number(tempCB) - Number(unallocatedFEFOWps);
                                            myArray[a].calculatedFEFOWps = Number(unallocatedFEFOWps);
                                            unallocatedFEFOWps = 0;
                                        } else {
                                            myArray[a].closingBalanceWps = 0;
                                            myArray[a].calculatedFEFOWps = Number(tempCB);
                                            unallocatedFEFOWps -= Number(tempCB);
                                        }
                                        myArray[a].qtyWps = Number(myArray[a].closingBalanceWps);
                                    }
                                    myArray = myArray.filter(c => (
                                        (c.openingBalance != 0 && c.openingBalance != undefined) ||
                                        (c.consumption != 0 && c.consumption != undefined) ||
                                        (c.shipment != 0 && c.shipment != undefined) ||
                                        (c.stock != 0 && c.stock != undefined) ||
                                        (c.adjustment != 0 && c.adjustment != undefined) ||
                                        (c.calculatedLEFO != 0 && c.calculatedLEFO != undefined) ||
                                        (c.calculatedFEFO != 0 && c.calculatedFEFO != undefined) ||
                                        (c.closingBalance != 0 && c.closingBalance != undefined) ||
                                        (c.openingBalanceWps != 0 && c.openingBalanceWps != undefined) ||
                                        (c.consumptionWps != 0 && c.consumptionWps != undefined) ||
                                        (c.shipmentWps != 0 && c.shipmentWps != undefined) ||
                                        (c.stockWps != 0 && c.stockWps != undefined) ||
                                        (c.adjustmentWps != 0 && c.adjustmentWps != undefined) ||
                                        (c.calculatedLEFOWps != 0 && c.calculatedLEFOWps != undefined) ||
                                        (c.calculatedFEFOWps != 0 && c.calculatedFEFOWps != undefined) ||
                                        (c.closingBalanceWps != 0 && c.closingBalanceWps != undefined)
                                    ));
                                    var finalBatchDetails = []
                                    for (var ma = 0; ma < myArray.length; ma++) {
                                        var finalBatch = {
                                            batchId: myArray[ma].batchId,
                                            batchNo: myArray[ma].batchNo,
                                            expiryDate: myArray[ma].expiryDate,
                                            autoGenerated: myArray[ma].autoGenerated,
                                            qty: Number(myArray[ma].qty),
                                            qtyWps: Number(myArray[ma].qtyWps),
                                            expiredQty: Number(myArray[ma].expiredQty),
                                            expiredQtyWps: Number(myArray[ma].expiredQtyWps),
                                            createdDate: myArray[ma].createdDate,
                                            openingBalance: myArray[ma].openingBalance,
                                            unallocatedQty: Number(myArray[ma].calculatedFEFO) + (myArray[ma].calculatedLEFO != undefined && myArray[ma].calculatedLEFO != "" && myArray[ma].calculatedLEFO != null ? myArray[ma].calculatedLEFO : 0),
                                            consumptionQty: myArray[ma].consumption == 0 ? null : myArray[ma].consumption,
                                            adjustmentQty: myArray[ma].adjustment == 0 ? null : myArray[ma].adjustment,
                                            stockQty: myArray[ma].stock == 0 ? null : myArray[ma].stock,
                                            shipmentQty: myArray[ma].shipment,
                                            openingBalanceWps: myArray[ma].openingBalanceWps,
                                            unallocatedQtyWps: Number(myArray[ma].calculatedFEFOWps) + (myArray[ma].calculatedLEFOWps != undefined && myArray[ma].calculatedLEFOWps != "" && myArray[ma].calculatedLEFOWps != null ? myArray[ma].calculatedLEFOWps : 0),
                                            shipmentQtyWps: myArray[ma].shipmentWps,
                                        }
                                        finalBatchDetails.push(finalBatch)
                                    }
                                    adjustmentQty = adjustmentQty + nationalAdjustment;
                                    if (inventoryList.length == 0) {
                                        adjustmentQty = ""
                                    }
                                    batchDetails = myArray;
                                    var amcTotal = 0;
                                    var totalMonths = 0;
                                    for (var ap = 1; ap <= monthsInPastForAmc; ap++) {
                                        var amcDate = moment(startDate).subtract(ap, 'months').startOf('month').format("YYYY-MM-DD");
                                        var actualConsumptionQtyAmc = 0;
                                        var forecastedConsumptionQtyAmc = 0;
                                        var consumptionQtyAmc = 0;
                                        var regionsReportingActualConsumptionAmc = []
                                        var noOfRegionsReportingActualConsumptionAmc = []
                                        var amcFilter = (programJsonForStoringTheResult.consumptionList).filter(c => (c.consumptionDate >= amcDate && c.consumptionDate <= amcDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active.toString() == "true");
                                        for (var c = 0; c < amcFilter.length; c++) {
                                            if (amcFilter[c].actualFlag.toString() == "true") {
                                                var daysPerMonthPast = moment(amcDate).daysInMonth();
                                                var daysOfDataPast = daysPerMonthPast - Number(amcFilter[c].dayOfStockOut);
                                                var trueDemandPerDayPast = Math.round(Math.round(amcFilter[c].consumptionRcpuQty) * Number(amcFilter[c].multiplier)) / daysOfDataPast;
                                                var trueDemandPerMonth1 = Math.round(trueDemandPerDayPast * daysPerMonthPast);
                                                actualConsumptionQtyAmc += daysOfDataPast > 0 ? trueDemandPerMonth1 : 0;
                                                var index = regionsReportingActualConsumptionAmc.findIndex(f => f == amcFilter[c].region.id);
                                                if (index == -1) {
                                                    regionsReportingActualConsumptionAmc.push(amcFilter[c].region.id);
                                                }
                                            } else {
                                                forecastedConsumptionQtyAmc += Math.round(Math.round(amcFilter[c].consumptionRcpuQty) * Number(amcFilter[c].multiplier));
                                            }
                                        }
                                        noOfRegionsReportingActualConsumptionAmc = regionsReportingActualConsumptionAmc.length;
                                        if (amcFilter.length == 0) {
                                            consumptionQtyAmc = "";
                                        } else if (totalNoOfRegions == noOfRegionsReportingActualConsumptionAmc || actualConsumptionQtyAmc > forecastedConsumptionQtyAmc) {
                                            consumptionQtyAmc = actualConsumptionQtyAmc;
                                        } else {
                                            consumptionQtyAmc = forecastedConsumptionQtyAmc;
                                        }
                                        if (amcFilter.length > 0) {
                                            amcTotal += (consumptionQtyAmc !== "" ? Number(consumptionQtyAmc) : 0);
                                            if (consumptionQtyAmc !== "") {
                                                totalMonths += 1;
                                            }
                                        }
                                    }
                                    for (var ap = 0; ap < monthsInFutureForAmc; ap++) {
                                        var amcDate = moment(startDate).add(ap, 'months').startOf('month').format("YYYY-MM-DD");
                                        var actualConsumptionQtyAmc = 0;
                                        var forecastedConsumptionQtyAmc = 0;
                                        var consumptionQtyAmc = 0;
                                        var regionsReportingActualConsumptionAmc = []
                                        var noOfRegionsReportingActualConsumptionAmc = []
                                        var amcFilter = (programJsonForStoringTheResult.consumptionList).filter(c => (c.consumptionDate >= amcDate && c.consumptionDate <= amcDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active.toString() == "true");
                                        for (var c = 0; c < amcFilter.length; c++) {
                                            if (amcFilter[c].actualFlag.toString() == "true") {
                                                var daysPerMonthPast = moment(amcDate).daysInMonth();
                                                var daysOfDataPast = daysPerMonthPast - Number(amcFilter[c].dayOfStockOut);
                                                var trueDemandPerDayPast = Math.round(Math.round(amcFilter[c].consumptionRcpuQty) * Number(amcFilter[c].multiplier)) / daysOfDataPast;
                                                var trueDemandPerMonth1 = Math.round(trueDemandPerDayPast * daysPerMonthPast);
                                                actualConsumptionQtyAmc += daysOfDataPast > 0 ? trueDemandPerMonth1 : 0;
                                                var index = regionsReportingActualConsumptionAmc.findIndex(f => f == amcFilter[c].region.id);
                                                if (index == -1) {
                                                    regionsReportingActualConsumptionAmc.push(amcFilter[c].region.id);
                                                }
                                            } else {
                                                forecastedConsumptionQtyAmc += Math.round(Math.round(amcFilter[c].consumptionRcpuQty) * Number(amcFilter[c].multiplier));
                                            }
                                        }
                                        noOfRegionsReportingActualConsumptionAmc = regionsReportingActualConsumptionAmc.length;
                                        if (amcFilter.length == 0) {
                                            consumptionQtyAmc = "";
                                        } else if (totalNoOfRegions == noOfRegionsReportingActualConsumptionAmc || actualConsumptionQtyAmc > forecastedConsumptionQtyAmc) {
                                            consumptionQtyAmc = actualConsumptionQtyAmc;
                                        } else {
                                            consumptionQtyAmc = forecastedConsumptionQtyAmc;
                                        }
                                        if (amcFilter.length > 0) {
                                            amcTotal += (consumptionQtyAmc !== "" ? Number(consumptionQtyAmc) : 0);
                                            if (consumptionQtyAmc !== "") {
                                                totalMonths += 1;
                                            }
                                        }
                                    }
                                    var amc = "";
                                    if (totalMonths == 0) {
                                        amc = null;
                                    } else {
                                        amc = Number((Number(amcTotal) / Number(totalMonths))).toFixed(8);
                                    }
                                    var cutOffDate=generalProgramJson.cutOffDate!=undefined&&generalProgramJson.cutOffDate!=null&&generalProgramJson.cutOffDate!=""?generalProgramJson.cutOffDate:"";
                                    if(cutOffDate!="" && moment(createdDate).format("YYYY-MM")<=moment(cutOffDate).add(monthsInPastForAmc-1,'months').format("YYYY-MM")){
                                        amc=null;
                                    }
                                    var maxForMonths = 0;
                                    var realm = generalProgramJson.realmCountry.realm;
                                    var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                                    var DEFAULT_MIN_MAX_MONTHS_OF_STOCK = realm.minMosMaxGaurdrail;
                                    if (DEFAULT_MIN_MONTHS_OF_STOCK > programPlanningUnitList[ppL].minMonthsOfStock) {
                                        maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                    } else if (programPlanningUnitList[ppL].minMonthsOfStock < DEFAULT_MIN_MAX_MONTHS_OF_STOCK) {
                                        maxForMonths = programPlanningUnitList[ppL].minMonthsOfStock
                                    } else {
                                        maxForMonths = DEFAULT_MIN_MAX_MONTHS_OF_STOCK
                                    }
                                    var minStockMoSQty = Number(maxForMonths);
                                    var minForMonths = 0;
                                    var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                                    if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + programPlanningUnitList[ppL].reorderFrequencyInMonths)) {
                                        minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                                    } else {
                                        minForMonths = (maxForMonths + programPlanningUnitList[ppL].reorderFrequencyInMonths);
                                    }
                                    var maxStockMoSQty = Number(minForMonths);
                                    var minStock = 0;
                                    var maxStock = 0;
                                    if (programPlanningUnitList[ppL].planBasedOn == 2) {
                                        minStock = programPlanningUnitList[ppL].minQty;
                                        maxStock = Number(Number(programPlanningUnitList[ppL].minQty) + Number(programPlanningUnitList[ppL].reorderFrequencyInMonths) * Number(amc)).toFixed(8);
                                        minStockMoSQty = Number(Number(programPlanningUnitList[ppL].minQty) / Number(amc)).toFixed(8);
                                        maxStockMoSQty = Number(Number(Number(programPlanningUnitList[ppL].minQty) / Number(amc)) + Number(programPlanningUnitList[ppL].reorderFrequencyInMonths)).toFixed(8);
                                    } else {
                                        minStock = Number(Number(amc) * Number(minStockMoSQty)).toFixed(8);
                                        maxStock = Number(Number(amc) * Number(maxStockMoSQty)).toFixed(8);
                                    }
                                    var closingBalance = 0;
                                    var closingBalanceWps = 0;
                                    var unmetDemandQty = "";
                                    var unmetDemandQtyWps = "";
                                    if (regionsReportingActualInventory == totalNoOfRegions) {
                                        closingBalance = actualStockCount;
                                    } else if (regionsReportingActualInventory != 0 && actualStockCount > expectedStock + nationalAdjustment) {
                                        closingBalance = actualStockCount
                                    } else {
                                        closingBalance = expectedStock + nationalAdjustment;
                                    }
                                    if (regionsReportingActualInventory == totalNoOfRegions) {
                                        closingBalanceWps = actualStockCount;
                                    } else if (actualStockCount > expectedStockWps + nationalAdjustmentWps) {
                                        closingBalanceWps = actualStockCount
                                    } else {
                                        closingBalanceWps = expectedStockWps + nationalAdjustmentWps;
                                    }
                                    var diffBetweenTrueDemandAndConsumption = Number(trueDemandPerMonth) - (consumptionQty !== "" ? Number(consumptionQty) : 0);
                                    if (closingBalance - diffBetweenTrueDemandAndConsumption < 0) {
                                        unmetDemandQty = 0 - expectedStock + diffBetweenTrueDemandAndConsumption;
                                        closingBalance = 0;
                                    } else {
                                        unmetDemandQty = diffBetweenTrueDemandAndConsumption;
                                    }
                                    if (closingBalanceWps - diffBetweenTrueDemandAndConsumption < 0) {
                                        unmetDemandQtyWps = 0 - expectedStockWps + diffBetweenTrueDemandAndConsumption;
                                        closingBalanceWps = 0;
                                    } else {
                                        unmetDemandQtyWps = diffBetweenTrueDemandAndConsumption;
                                    }
                                    var mos = "";
                                    if (closingBalance != 0 && amc != 0 && amc != null) {
                                        mos = Number(closingBalance / amc).toFixed(8);
                                    } else if (amc == 0 || amc == null) {
                                        mos = null;
                                    } else {
                                        mos = 0;
                                    }
                                    var mosWps = "";
                                    if (closingBalanceWps != 0 && amc != 0 && amc != null) {
                                        mosWps = Number(closingBalanceWps / amc).toFixed(8);
                                    } else if (amc == 0 || amc == null) {
                                        mosWps = null;
                                    } else {
                                        mosWps = 0;
                                    }
                                    var json = {
                                        programId: generalProgramJson.programId,
                                        versionId: generalProgramJson.currentVersion.versionId,
                                        planningUnitId: programPlanningUnitList[ppL].planningUnit.id,
                                        transDate: startDate,
                                        stockQty: actualStockCount === "" ? null : actualStockCount,
                                        adjustmentQty: adjustmentQty === "" ? null : adjustmentQty,
                                        actualFlag: consumptionType == "" ? null : consumptionType,
                                        consumptionQty: consumptionQty === "" ? null : consumptionQty,
                                        shipmentTotalQty: shipmentTotalQty,
                                        shipmentTotalQtyWps: shipmentTotalQtyWps,
                                        manualTotalQty: manualTotalQty,
                                        receivedShipmentsTotalData: receivedShipmentsTotalData,
                                        shippedShipmentsTotalData: shippedShipmentsTotalData,
                                        approvedShipmentsTotalData: approvedShipmentsTotalData,
                                        submittedShipmentsTotalData: submittedShipmentsTotalData,
                                        plannedShipmentsTotalData: plannedShipmentsTotalData,
                                        onholdShipmentsTotalData: onholdShipmentsTotalData,
                                        erpTotalQty: erpTotalQty,
                                        receivedErpShipmentsTotalData: receivedErpShipmentsTotalData,
                                        shippedErpShipmentsTotalData: shippedErpShipmentsTotalData,
                                        approvedErpShipmentsTotalData: approvedErpShipmentsTotalData,
                                        submittedErpShipmentsTotalData: submittedErpShipmentsTotalData,
                                        plannedErpShipmentsTotalData: plannedErpShipmentsTotalData,
                                        onholdErpShipmentsTotalData: onholdErpShipmentsTotalData,
                                        amc: amc,
                                        amcCount: totalMonths,
                                        minStock: minStock,
                                        maxStock: maxStock,
                                        minStockMoS: minStockMoSQty,
                                        maxStockMoS: maxStockMoSQty,
                                        expiredStock: expiredStock,
                                        expiredStockWps: expiredStockWps,
                                        batchDetails: finalBatchDetails,
                                        openingBalance: openingBalance,
                                        openingBalanceWps: openingBalanceWps,
                                        closingBalance: closingBalance,
                                        closingBalanceWps: closingBalanceWps,
                                        unmetDemand: unmetDemandQty === "" ? null : unmetDemandQty,
                                        unmetDemandWps: unmetDemandQtyWps === "" ? null : unmetDemandQtyWps,
                                        mos: mos,
                                        mosWps: mosWps,
                                        nationalAdjustment: nationalAdjustment,
                                        nationalAdjustmentWps: nationalAdjustmentWps,
                                        expectedStock: expectedStock,
                                        expectedStockWps: expectedStockWps,
                                        regionCountForStock: regionsReportingActualInventory,
                                        regionCount: totalNoOfRegions
                                    }
                                    supplyPlanData.push(json);
                                }
                                programJsonForStoringTheResult.batchInfoList = coreBatchDetails;
                                programJsonForStoringTheResult.supplyPlan = supplyPlanData;
                                if (planningUnitDataIndex != -1) {
                                    planningUnitDataList[planningUnitDataIndex].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJsonForStoringTheResult), SECRET_KEY)).toString();
                                } else {
                                    planningUnitDataList.push({ planningUnitId: planningUnitId, planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJsonForStoringTheResult), SECRET_KEY)).toString() });
                                }
                            }
                        } catch (err) {
                            props.fetchData(1, programId)
                        }
                        programDataJson.planningUnitDataList = planningUnitDataList;
                        programRequest.result.programData = programDataJson;
                        var programDataTransaction = db1.transaction([objectStoreName], 'readwrite');
                        var programDataOs = programDataTransaction.objectStore(objectStoreName);
                        var putRequest = programDataOs.put(programRequest.result);
                        putRequest.onerror = function (event) {
                        }.bind(this);
                        putRequest.onsuccess = function (event) {
                            var programQPLDetailsTransaction1 = db1.transaction(['programQPLDetails'], 'readwrite');
                            var programQPLDetailsOs1 = programQPLDetailsTransaction1.objectStore('programQPLDetails');
                            var programQPLDetailsRequest1 = programQPLDetailsOs1.put(programQPLDetailsJson);
                            programQPLDetailsRequest1.onsuccess = function (event) {
                                if (page == "consumption") {
                                    props.updateState("message", i18n.t('static.message.consumptionSaved'));
                                    props.updateState("color", 'green');
                                    props.updateState("consumptionChangedFlag", 0);
                                    if (props.consumptionPage != "consumptionDataEntry") {
                                        props.toggleLarge('Consumption');
                                        if (props.consumptionPage != "supplyPlanCompare") {
                                            props.updateState("programJson", programJsonForStoringTheResult);
                                            props.updateState("planningUnitDataList", planningUnitDataList);
                                            props.formSubmit(props.items.planningUnit, props.items.monthCount);
                                        } else {
                                            props.formSubmit(props.items.monthCount);
                                        }
                                    }
                                    if (props.consumptionPage == "consumptionDataEntry") {
                                        props.formSubmit(props.items.planningUnit, props.items.rangeValue);
                                    }
                                    if (props.consumptionPage == "whatIf") {
                                        props.updateState("programModified", 1);
                                    }
                                    props.updateState("loading", false);
                                    props.hideFirstComponent();
                                } else if (page == "inventory") {
                                    props.updateState("color", 'green');
                                    props.updateState("inventoryChangedFlag", 0);
                                    if (props.inventoryPage != "inventoryDataEntry") {
                                        if (props.items.inventoryType == 1) {
                                            props.updateState("message", i18n.t('static.message.inventorySaved'));
                                        } else {
                                            props.updateState("message", i18n.t('static.message.adjustmentsSaved'));
                                        }
                                        props.toggleLarge('Adjustments');
                                        if (props.inventoryPage != "supplyPlanCompare") {
                                            props.updateState("programJson", programJsonForStoringTheResult);
                                            props.updateState("planningUnitDataList", planningUnitDataList);
                                            props.formSubmit(props.items.planningUnit, props.items.monthCount);
                                        } else {
                                            props.formSubmit(props.items.monthCount);
                                        }
                                    }
                                    if (props.inventoryPage == "inventoryDataEntry") {
                                        if (props.items.inventoryType == 1) {
                                            props.updateState("message", i18n.t('static.message.inventorySaved'));
                                        } else {
                                            props.updateState("message", i18n.t('static.message.adjustmentsSaved'));
                                        }
                                        props.formSubmit(props.items.planningUnit, props.items.rangeValue);
                                    }
                                    if (props.inventoryPage == "whatIf") {
                                        props.updateState("programModified", 1);
                                    }
                                    props.updateState("loading", false);
                                    props.hideFirstComponent();
                                } else if (page == "shipment") {
                                    props.updateState("message", i18n.t('static.message.shipmentsSaved'));
                                    props.updateState("color", 'green');
                                    props.updateState("shipmentChangedFlag", 0);
                                    props.updateState("budgetChangedFlag", 0);
                                    props.updateState("shipmentsEl", "");
                                    if (props.shipmentPage != "shipmentDataEntry") {
                                        props.toggleLarge('shipments');
                                        if (props.shipmentPage != "supplyPlanCompare") {
                                            props.updateState("programJson", programJsonForStoringTheResult);
                                            props.updateState("planningUnitDataList", planningUnitDataList);
                                            props.formSubmit(props.items.planningUnit, props.items.monthCount);
                                        } else {
                                            props.formSubmit(props.items.monthCount);
                                        }
                                    }
                                    if (props.shipmentPage == "shipmentDataEntry") {
                                        props.formSubmit(props.items.planningUnit, props.items.rangeValue);
                                    }
                                    if (props.shipmentPage == "whatIf") {
                                        props.updateState("programModified", 1);
                                    }
                                    props.updateState("loading", false);
                                    props.hideFirstComponent()
                                } else if (page == "shipment1") {
                                    props.updateState("shipmentsEl", "");
                                    if (props.shipmentPage != "shipmentDataEntry") {
                                        if (props.shipmentPage != undefined) {
                                            props.toggleLarge('shipments');
                                        }
                                        if (props.shipmentPage != "supplyPlanCompare") {
                                            var programDataJson1 = programRequest.result.programData;
                                            var planningUnitDataList1 = programDataJson1.planningUnitDataList;
                                            var planningUnitDataIndex1 = (planningUnitDataList1).findIndex(c => c.planningUnitId == props.state.planningUnit.value);
                                            var programJson1 = {};
                                            if (planningUnitDataIndex1 != -1) {
                                                var planningUnitData1 = ((planningUnitDataList1).filter(c => c.planningUnitId == props.state.planningUnit.value))[0];
                                                var programDataBytes1 = CryptoJS.AES.decrypt(planningUnitData1.planningUnitData, SECRET_KEY);
                                                var programData1 = programDataBytes1.toString(CryptoJS.enc.Utf8);
                                                programJson1 = JSON.parse(programData1);
                                            } else {
                                                programJson1 = {
                                                    consumptionList: [],
                                                    inventoryList: [],
                                                    shipmentList: [],
                                                    batchInfoList: [],
                                                    supplyPlan: []
                                                }
                                            }
                                            props.updateState("programJson", programJson1);
                                            props.updateState("planningUnitDataList", planningUnitDataList1);
                                            try {
                                                props.formSubmit(props.items.planningUnit, props.items.monthCount);
                                            } catch (err) {
                                            }
                                        }
                                    }
                                    if (props.shipmentPage == "shipmentDataEntry") {
                                        props.formSubmit(props.items.planningUnit, props.items.rangeValue);
                                    }
                                    if (page == "shipment1") {
                                        try {
                                            props.formSubmit(props.state.planningUnit, props.state.rangeValue);
                                        } catch (err) {
                                        }
                                    }
                                    if (props.shipmentPage == "whatIf") {
                                        props.updateState("programModified", 1);
                                    }
                                    props.updateState("showPlanningUnitAndQty", 1)
                                    props.updateState("loading", false);
                                    props.hideFirstComponent()
                                }
                                else if (page == "whatIf") {
                                    if (props.state.scenarioId != 7) {
                                        props.updateState("programJson", programJsonForStoringTheResult);
                                        props.updateState("planningUnitDataList", planningUnitDataList);
                                        props.updateState("message", i18n.t('static.whatIf.scenarioAdded'));
                                        props.formSubmit(props.state.planningUnit, props.state.monthCount);
                                        props.updateState("loading", false);
                                    } else {
                                        var programDataJson2 = programRequest.result.programData;
                                        var planningUnitDataList2 = programDataJson2.planningUnitDataList;
                                        var rangeValue = props.state.rangeValue1;
                                        let startDate = rangeValue.from.year + '-' + rangeValue.from.month + '-01';
                                        if (rangeValue.from.month <= 9) {
                                            startDate = rangeValue.from.year + '-0' + rangeValue.from.month + '-01';
                                        }
                                        let stopDate = rangeValue.to.year + '-' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
                                        if (rangeValue.to.month <= 9) {
                                            stopDate = rangeValue.to.year + '-0' + rangeValue.to.month + '-' + new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
                                        }
                                        convertSuggestedShipmentsIntoPlannedShipments(startDate, stopDate, programJsonForStoringTheResult, generalProgramJson, props, planningUnitId, programPlanningUnitList.filter(c => c.planningUnit.id == planningUnitId)[0], regionListFiltered, programId, programJsonForStoringTheResult, programDataJson2, programRequest,monthsInPastForAmc,monthsInFutureForAmc)
                                    }
                                } else if (page == "supplyPlan") {
                                    props.formSubmit(props.state.planningUnit, props.state.monthCount);
                                } else if (page == "supplyPlanCompare") {
                                    props.formSubmit(props.state.monthCount);
                                } else if (page == "whatIfFormSubmit") {
                                    props.formSubmit(props.state.planningUnit, props.state.monthCount);
                                    props.updateState("loading", false);
                                } else if (page == 'syncPage') {
                                } else if (page == 'quantimedImport') {
                                    props.updateState("loading", false);
                                    props.redirectToDashbaord();
                                } else if (page == 'masterDataSync') {
                                    if (problemListChild != undefined && problemListChild != "undefined" && rebuildQPL) {
                                        problemListChild.qatProblemActions(programId, "loading", true);
                                    } else {
                                        props.fetchData(1, programId)
                                    }
                                } else if (page == 'erp') {
                                    props.getLocalProgramList(props.state.active3 ? 1 : 0)
                                    props.updateState("message", (props.state.active2 ? i18n.t('static.mt.linkingUpdateSuccess') : i18n.t('static.shipment.linkingsuccess')))
                                    props.updateState("color", "green");
                                    props.updateState("loading1", false);
                                    props.updateState("planningUnitIdUpdated", "");
                                    props.toggleLarge();
                                    props.hideSecondComponent();
                                    if (props.state.active1) {
                                        props.getVersionList()
                                    } else {
                                    }
                                } else if (page == 'erpDelink') {
                                    props.getLocalProgramList(props.state.active3 ? 1 : 0)
                                    props.updateState("message", (props.state.active2 ? i18n.t('static.mt.linkingUpdateSuccess') : i18n.t('static.shipment.linkingsuccess')))
                                    props.updateState("color", "green");
                                    props.updateState("changedDataForTab2", false);
                                    props.updateState("loading", false);
                                    props.updateState("planningUnitIdUpdated", "");
                                    props.hideSecondComponent();
                                    if (props.state.active1 || props.state.active2) {
                                        props.getVersionList()
                                    } else {
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
