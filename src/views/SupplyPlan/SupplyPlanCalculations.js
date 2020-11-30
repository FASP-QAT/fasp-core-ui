import CryptoJS from 'crypto-js'
import { SECRET_KEY, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS, FIRST_DATA_ENTRY_DATE, TBD_PROCUREMENT_AGENT_ID, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, INDEXED_DB_NAME, INDEXED_DB_VERSION, QAT_DATA_SOURCE_ID, NOTES_FOR_QAT_ADJUSTMENTS, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE } from '../../Constants.js'
import moment from "moment";
import i18n from '../../i18n';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";

export function calculateSupplyPlan(programId, planningUnitId, objectStoreName, page, props, planningUnitList, minimumDate, problemListChild, lastSyncDate) {
    console.log("In calculate", minimumDate);
    console.log("D------------> in calculate")
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
    }.bind(this);
    openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        // Getting program data
        var programDataTransaction = db1.transaction([objectStoreName], 'readwrite');
        var programDataOs = programDataTransaction.objectStore(objectStoreName);
        var programRequest = programDataOs.get(programId);
        programRequest.onerror = function (event) {
        }.bind(this);
        programRequest.onsuccess = function (e) {
            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson = JSON.parse(programData);

            // Getting program planning unit
            var planningunitTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
            var planningunitOs = planningunitTransaction.objectStore('programPlanningUnit');
            var planningunitRequest = planningunitOs.getAll();
            var planningList = []
            var realmCountryPlanningUnitList = []
            planningunitRequest.onerror = function (event) {
            }.bind(this);
            planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var programPlanningUnitList = myResult;
                var programJsonForStoringTheResult = programJson;

                // Checking if data exists
                var supplyPlanData = programJsonForStoringTheResult.supplyPlan;
                if (supplyPlanData == undefined) {
                    supplyPlanData = []
                }
                console.log("Before filter", supplyPlanData.length);
                // Getting region details
                var regionListFiltered = [];
                var regionList = [];
                for (var i = 0; i < programJsonForStoringTheResult.regionList.length; i++) {
                    var regionJson = {
                        id: programJsonForStoringTheResult.regionList[i].regionId
                    }
                    regionList.push(regionJson);
                }
                regionListFiltered = regionList;

                // Filtering program planning unit based on program Id and active is true
                programPlanningUnitList = (programPlanningUnitList).filter(c => c.program.id == programJsonForStoringTheResult.programId && c.active == true);
                // Filter planning unit list for single planning unit
                if (planningUnitId != 0) {
                    console.log("Planning unit id ", planningUnitId);
                    programPlanningUnitList = programPlanningUnitList.filter(c => c.planningUnit.id == planningUnitId);
                    console.log("programPlanningUnitList for planning unit id not 0", programPlanningUnitList);
                }
                // Filtering planning unit for planning unit list in case of master data sync and sync page
                console.log("planningUnitList", planningUnitList);
                if (planningUnitList != undefined && planningUnitList != [] && planningUnitList.length != 0) {
                    console.log("In planning unit list if", planningUnitList);
                    var ppList = [];
                    for (var pp = 0; pp < planningUnitList.length; pp++) {
                        var p = programPlanningUnitList.filter(c => c.planningUnit.id == planningUnitList[pp]);
                        ppList.push(p[0]);
                    }
                    programPlanningUnitList = ppList;
                }
                if ((page == 'masterDataSync' || page == 'syncPage') && planningUnitList.length == 0) {
                    console.log("in if");
                    programPlanningUnitList = [];
                }
                console.log("Filtered planning unit list", programPlanningUnitList);
                programPlanningUnitList = programPlanningUnitList.filter(c => c != undefined);
                // Loop across filtered planning unit
                for (var ppL = 0; ppL < programPlanningUnitList.length; ppL++) {
                    console.log("D----------------------------->PlanningUnitId", programPlanningUnitList[ppL].planningUnit.id)
                    // Getting max data entry date
                    var shipmentListForMax = (programJsonForStoringTheResult.shipmentList).filter(c => c.active == true && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                    var inventoryListForMax = (programJsonForStoringTheResult.inventoryList).filter(c => c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                    var consumptionListForMax = (programJsonForStoringTheResult.consumptionList).filter(c => c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                    let invmax = moment.max(inventoryListForMax.map(d => moment(d.inventoryDate)))
                    let shipmax = moment.max(shipmentListForMax.map(d => moment(d.expectedDeliveryDate)))
                    let conmax = moment.max(consumptionListForMax.map(d => moment(d.consumptionDate)))
                    var maxDate = invmax.isAfter(shipmax) && invmax.isAfter(conmax) ? invmax : shipmax.isAfter(invmax) && shipmax.isAfter(conmax) ? shipmax : conmax
                    // Getting min data entry date
                    var minDate = moment(minimumDate).subtract(programPlanningUnitList[ppL].monthsInPastForAmc + 1, 'months').format("YYYY-MM-DD");
                    console.log("Min Date", minDate);
                    if (minDate == undefined) {
                        let invmin = moment.min(inventoryListForMax.map(d => moment(d.inventoryDate)))
                        let shipmin = moment.min(shipmentListForMax.map(d => moment(d.expectedDeliveryDate)))
                        let conmin = moment.min(consumptionListForMax.map(d => moment(d.consumptionDate)))
                        minDate = invmin.isBefore(shipmin) && invmin.isBefore(conmin) ? invmin : shipmin.isBefore(invmin) && shipmin.isBefore(conmin) ? shipmin : conmin
                    }
                    var FIRST_DATA_ENTRY_DATE = minDate;
                    var createdDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                    var firstDataEntryDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                    // Adding months in past for all the calculations
                    var lastDataEntryDate = moment(maxDate).add(programPlanningUnitList[ppL].monthsInPastForAmc, 'months').format("YYYY-MM-DD");
                    // Filtering supply plan data for excluding the selected planning units
                    supplyPlanData = supplyPlanData.filter(c => (c.planningUnitId != programPlanningUnitList[ppL].planningUnit.id) || (c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id && moment(c.transDate).format("YYYY-MM") < moment(minDate).format("YYYY-MM")));
                    // Looping till the max data entry date
                    for (var i = 0; createdDate < lastDataEntryDate; i++) {
                        // Adding months to created date and getting start date and end date
                        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                        var startDate = moment(createdDate).startOf('month').format('YYYY-MM-DD');
                        var endDate = moment(createdDate).endOf('month').format('YYYY-MM-DD');
                        console.log("--------------------------------------", startDate);
                        // Getting prev month date
                        var prevMonthDate = moment(createdDate).subtract(1, 'months').startOf('month').format("YYYY-MM-DD");
                        // Getting prev month supply plan
                        var prevMonthSupplyPlan = [];
                        if (supplyPlanData.length > 0) {
                            prevMonthSupplyPlan = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(prevMonthDate).format("YYYY-MM-DD") && c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id);
                        } else {
                            prevMonthSupplyPlan = []
                        }
                        // Getting batch details if exists otherwise add qty as 0 for all the batches
                        var batchDetails = [];
                        var batchDetailsFromProgramJson = programJsonForStoringTheResult.batchInfoList.filter(c => c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id);
                        if (prevMonthSupplyPlan.length > 0) {
                            batchDetails = prevMonthSupplyPlan[0].batchDetails;
                        } else {
                            // batchDetails = programJsonForStoringTheResult.batchInfoList.filter(c => c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id);
                            // for (var bda = 0; bda < batchDetails.length; bda++) {
                            //     batchDetails[bda].qty = 0;
                            //     batchDetails[bda].qtyWps = 0;
                            //     batchDetails[bda].expiredQty = 0;
                            //     batchDetails[bda].expiredQtyWps = 0;
                            // }
                        }

                        // Calculations of exipred stock
                        var expiredStock = 0;
                        var expiredStockWps = 0;
                        console.log("D-------------->Date start---------------->", startDate);
                        console.log("D------------>PrevMonthSUpplyPlan------->", prevMonthSupplyPlan);
                        console.log("D----------batchDetails", batchDetails);
                        var expiredBatchDetailsOfPrevMonth = batchDetails.filter(c => c.expiryDate >= startDate && c.expiryDate <= endDate);
                        console.log("D----------------->expiredBatchDetailsOfPrevMonth-------------->", expiredBatchDetailsOfPrevMonth);
                        for (var e = 0; e < expiredBatchDetailsOfPrevMonth.length; e++) {
                            console.log("D------------------> In for loop", expiredBatchDetailsOfPrevMonth[e].qty);
                            expiredStock += parseInt(expiredBatchDetailsOfPrevMonth[e].qty);
                            expiredStockWps += parseInt(expiredBatchDetailsOfPrevMonth[e].qtyWps);
                            // var index = batchDetails.findIndex(c => c.batchNo == expiredBatchDetailsOfPrevMonth[e].batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiredBatchDetailsOfPrevMonth[e].expiryDate).format("YYYY-MM"));
                            // batchDetails[index].expiredQty = expiredBatchDetailsOfPrevMonth[e].qty;
                            // batchDetails[index].qty = 0;
                            // batchDetails[index].expiredQtyWps = expiredBatchDetailsOfPrevMonth[e].qtyWps;
                            // batchDetails[index].qtyWps = 0;
                        }

                        // Formatting batchDetails
                        var myArray = [];
                        var myArrayWps = [];
                        for (var b = 0; b < batchDetails.length; b++) {
                            var json = {
                                batchId: batchDetails[b].batchId,
                                batchNo: batchDetails[b].batchNo,
                                expiryDate: batchDetails[b].expiryDate,
                                createdDate: batchDetails[b].createdDate,
                                autoGenerated: batchDetails[b].autoGenerated,
                                openingBalance: batchDetails[b].qty,
                                consumption: 0,
                                adjustment: 0,
                                stock: 0,
                                shipment: 0,
                                expiredQty: batchDetails[b].expiredQty,
                                expiredQtyWps: batchDetails[b].expiredQtyWps
                            }
                            myArray.push(json);
                        }


                        // Calculations of opening balance including planned shipments
                        var openingBalance = 0;
                        if (prevMonthSupplyPlan.length > 0) {
                            openingBalance = prevMonthSupplyPlan[0].closingBalance;
                        } else {
                            openingBalance = 0;
                        }

                        // Calculations of opening balance without including planned shipments
                        var openingBalanceWps = 0;
                        if (prevMonthSupplyPlan.length > 0) {
                            openingBalanceWps = prevMonthSupplyPlan[0].closingBalanceWps;
                        } else {
                            openingBalanceWps = 0;
                        }

                        // Sorting batch array based on expiry date
                        // var myArray = batchDetails.sort(function (a, b) { return new Date(a.expiryDate) - new Date(b.expiryDate) });

                        // Shipments part
                        // Getting shipments list for planning unit
                        var shipmentList = (programJsonForStoringTheResult.shipmentList).filter(c => c.active == true && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                        console.log("Shipment list----------------->", shipmentList);
                        // Getting shipment list for a month
                        var shipmentArr = shipmentList.filter(c => (c.receivedDate != "" && c.receivedDate != null && c.receivedDate != undefined && c.receivedDate != "Invalid date") ? (c.receivedDate >= startDate && c.receivedDate <= endDate) : (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate))
                        console.log("D Shipment Arr----------------->", shipmentArr);
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

                        // For loop for getting total shipment qty
                        for (var j = 0; j < shipmentArr.length; j++) {
                            // Adding total shipment qty
                            shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                            console.log("D Shipment Arr----------------->(shipmentArr[j].shipmentQty)", (shipmentArr[j].shipmentQty));
                            // Adding total shipment qty wps
                            if (shipmentArr[j].shipmentStatus.id != PLANNED_SHIPMENT_STATUS && shipmentArr[j].shipmentStatus.id != ON_HOLD_SHIPMENT_STATUS && shipmentArr[j].shipmentStatus.id != SUBMITTED_SHIPMENT_STATUS) {
                                shipmentTotalQtyWps += parseInt((shipmentArr[j].shipmentQty));
                            }
                            // Adding manual shipments
                            console.log("D Shipment Arr----------------->shipmentArr[j].erpFlag.toString()", shipmentArr[j].erpFlag.toString());
                            console.log("D Shipment Arr----------------->Consition", shipmentArr[j].erpFlag.toString() == "false");
                            console.log("D Shipment Arr----------------->manualTotalQty------------>", manualTotalQty);
                            if (shipmentArr[j].erpFlag.toString() == "false") {
                                console.log("D Shipment Arr----------------->In if", shipmentArr[j].shipmentQty);
                                manualTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                // Adding shipments based on status
                                if (shipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                    receivedShipmentsTotalData += parseInt((shipmentArr[j].shipmentQty));
                                } else if (shipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || shipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                    shippedShipmentsTotalData += parseInt((shipmentArr[j].shipmentQty));
                                } else if (shipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                    approvedShipmentsTotalData += parseInt((shipmentArr[j].shipmentQty));
                                } else if (shipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                    submittedShipmentsTotalData += parseInt((shipmentArr[j].shipmentQty));
                                } else if (shipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS) {
                                    plannedShipmentsTotalData += parseInt((shipmentArr[j].shipmentQty));
                                } else if (shipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                    onholdShipmentsTotalData += parseInt((shipmentArr[j].shipmentQty));
                                }
                            } else {
                                // Adding erp shipments
                                console.log("D Shipment Arr----------------->In else", shipmentArr[j].shipmentQty, "Planning unit", shipmentArr[j].planningUnit.id, "Shipmentg sttays", shipmentArr[j].shipmentStatus.id, "Shipment Ud", shipmentArr[j].shipmentId);
                                erpTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                console.log("D Shipment Arr----------------->ErpTotalQty", erpTotalQty);
                                // Adding shipments based on status
                                if (shipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                    receivedErpShipmentsTotalData += parseInt((shipmentArr[j].shipmentQty));
                                } else if (shipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || shipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                    shippedErpShipmentsTotalData += parseInt((shipmentArr[j].shipmentQty));
                                } else if (shipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                    approvedErpShipmentsTotalData += parseInt((shipmentArr[j].shipmentQty));
                                } else if (shipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                    submittedErpShipmentsTotalData += parseInt((shipmentArr[j].shipmentQty));
                                } else if (shipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS) {
                                    plannedErpShipmentsTotalData += parseInt((shipmentArr[j].shipmentQty));
                                } else if (shipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                    onholdErpShipmentsTotalData += parseInt((shipmentArr[j].shipmentQty));
                                }
                            }

                            // Adding shipments qty batch wise
                            var batchListForShipments = shipmentArr[j].batchInfoList;
                            console.log("Batch list for shipments", batchListForShipments);
                            console.log("D--------------->shipmentArr[j]", shipmentArr[j].shipmentId);
                            for (var b = 0; b < batchListForShipments.length; b++) {
                                var batchNo = batchListForShipments[b].batch.batchNo;
                                var expiryDate = batchListForShipments[b].batch.expiryDate
                                console.log("BatchNo----------->>>>>>>>>>>>", batchNo);
                                console.log("ExpiryDate----------->>>>>>>>>>>>", expiryDate);
                                var index = myArray.findIndex(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                console.log("My Array", myArray);
                                console.log("Index----------->>>>>>>>>>>>", index);

                                if (index == -1) {
                                    console.log("batchDetailsFromProgramJson----------->>>>>>>>>>>>", batchDetailsFromProgramJson)
                                    var bd = batchDetailsFromProgramJson.filter(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                    if (bd.length > 0) {
                                        bd = bd[0];
                                        console.log("Bd----------->>>>>>>>>>>>", bd);
                                        var shipmentQtyWps = 0;
                                        if (shipmentArr[j].shipmentStatus.id != PLANNED_SHIPMENT_STATUS && shipmentArr[j].shipmentStatus.id != ON_HOLD_SHIPMENT_STATUS && shipmentArr[j].shipmentStatus.id != SUBMITTED_SHIPMENT_STATUS) {
                                            shipmentQtyWps = batchListForShipments[b].shipmentQty;
                                        }
                                        var json = {
                                            batchId: bd.batchId,
                                            batchNo: bd.batchNo,
                                            expiryDate: bd.expiryDate,
                                            autoGenerated: bd.autoGenerated,
                                            openingBalance: 0,
                                            openingBalanceWps: 0,
                                            consumption: 0,
                                            adjustment: 0,
                                            stock: 0,
                                            shipment: batchListForShipments[b].shipmentQty,
                                            shipmentWps: shipmentQtyWps,
                                            expiredQty: 0,
                                            expiredQtyWps: 0
                                        }
                                        myArray.push(json);
                                    }

                                } else {
                                    myArray[index].shipment = parseInt(myArray[index].shipment) + batchListForShipments[b].shipmentQty;
                                    if (shipmentArr[j].shipmentStatus.id != PLANNED_SHIPMENT_STATUS && shipmentArr[j].shipmentStatus.id != ON_HOLD_SHIPMENT_STATUS && shipmentArr[j].shipmentStatus.id != SUBMITTED_SHIPMENT_STATUS) {
                                        myArray[index].shipmentWps = parseInt(myArray[index].shipmentWps) + batchListForShipments[b].shipmentQty;
                                    }
                                }
                                console.log("D------------>MyArray", myArray);
                                var index = myArray.findIndex(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") && moment(expiryDate).format("YYYY-MM"));
                                console.log("D------------------>Index--------->", index, "BatchNo----------->", batchNo, "Expiry date---------->", expiryDate);
                                if (index != -1) {
                                    shipmentBatchQtyTotal += parseInt(myArray[index].shipment) + batchListForShipments[b].shipmentQty;
                                    if (shipmentArr[j].shipmentStatus.id != PLANNED_SHIPMENT_STATUS && shipmentArr[j].shipmentStatus.id != ON_HOLD_SHIPMENT_STATUS && shipmentArr[j].shipmentStatus.id != SUBMITTED_SHIPMENT_STATUS) {
                                        shipmentBatchQtyTotalWps += parseInt(myArray[index].shipment) + batchListForShipments[b].shipmentQty;
                                    }
                                }
                            }
                        }

                        // Inventory part
                        // Filtering inventory for planning unit and that particular month
                        var inventoryList = (programJsonForStoringTheResult.inventoryList).filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                        var actualStockCount = 0;
                        var adjustmentQty = 0;
                        var regionsReportingActualInventory = 0;
                        var totalNoOfRegions = (regionListFiltered).length;
                        for (var r = 0; r < totalNoOfRegions; r++) {
                            // Filtering inventory data for a region
                            var inventoryListForRegion = inventoryList.filter(c => c.region != null && c.region.id != 0 && c.region.id == regionList[r].id);
                            console.log("inventiryListForRegion", inventoryListForRegion);
                            // Check how many regions have reported actual stock count
                            var noOfEntriesOfActualStockCount = (inventoryListForRegion.filter(c => c.actualQty != undefined && c.actualQty != null && c.actualQty != "")).length;
                            // Adding count of regions reporting actual inventory
                            if (noOfEntriesOfActualStockCount > 0) {
                                regionsReportingActualInventory += 1;
                            }
                            for (var inv = 0; inv < inventoryListForRegion.length; inv++) {
                                // If region have reported actual stock count that only consider actual stock count
                                if (noOfEntriesOfActualStockCount > 0) {
                                    console.log("Actual stock count", actualStockCount);
                                    if (inventoryListForRegion[inv].actualQty != "" && inventoryListForRegion[inv].actualQty != null && inventoryListForRegion[inv].actualQty != undefined) {
                                        actualStockCount += Math.round(parseFloat(inventoryListForRegion[inv].actualQty) * parseFloat(inventoryListForRegion[inv].multiplier));
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
                                                    autoGenerated: bd.autoGenerated,
                                                    openingBalance: 0,
                                                    openingBalanceWps: 0,
                                                    consumption: 0,
                                                    adjustment: 0,
                                                    stock: parseInt(parseInt(batchListForInventory[b].actualQty) * parseInt(inventoryListForRegion[inv].multiplier)),
                                                    shipment: 0,
                                                    shipmentWps: shipmentQtyWps,
                                                    expiredQty: 0,
                                                    expiredQtyWps: 0
                                                }
                                                myArray.push(json);
                                            }
                                        } else {
                                            myArray[index].stock = parseInt(myArray[index].stock) + parseInt(parseInt(batchListForInventory[b].actualQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                        }
                                        var index = myArray.findIndex(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                        actualBatchQtyTotal += parseInt(parseInt(batchListForInventory[b].actualQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                    }
                                } else {
                                    // If region has not reported actual stock count we will only consider adjustments
                                    if (inventoryListForRegion[inv].adjustmentQty != "" && inventoryListForRegion[inv].adjustmentQty != null && inventoryListForRegion[inv].adjustmentQty != undefined) {
                                        adjustmentQty += Math.round(parseFloat(inventoryListForRegion[inv].adjustmentQty) * parseFloat(inventoryListForRegion[inv].multiplier));
                                    }
                                    // Check batch details for adjustments if available
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
                                                    autoGenerated: bd.autoGenerated,
                                                    openingBalance: 0,
                                                    openingBalanceWps: 0,
                                                    consumption: 0,
                                                    adjustment: parseInt(parseInt(batchListForInventory[b].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier)),
                                                    stock: 0,
                                                    shipment: 0,
                                                    shipmentWps: shipmentQtyWps,
                                                    expiredQty: 0,
                                                    expiredQtyWps: 0
                                                }
                                                myArray.push(json);
                                                adjustmentBatchQtyTotal += parseInt(parseInt(batchListForInventory[b].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                            }
                                        } else {
                                            myArray[index].adjustment = parseInt(myArray[index].adjustment) + parseInt(parseInt(batchListForInventory[b].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                            if (myArray[index].stock == 0) {
                                                adjustmentBatchQtyTotal += parseInt(parseInt(batchListForInventory[b].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                            }
                                        }

                                    }
                                }
                            }
                        }
                        // Consumption part
                        // Filtering consumption list for that month, that planning unit
                        var consumptionList = (programJsonForStoringTheResult.consumptionList).filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                        var actualConsumptionQty = 0;
                        var forecastedConsumptionQty = 0;
                        var regionsReportingActualConsumption = [];
                        var noOfRegionsReportingActualConsumption = 0;
                        var consumptionQty = 0;
                        var consumptionType = "";
                        var regionList = regionListFiltered;
                        for (var c = 0; c < consumptionList.length; c++) {
                            // Calculating actual consumption qty
                            console.log("consumptionList[c].actualFlag", consumptionList[c].actualFlag.toString())
                            if (consumptionList[c].actualFlag.toString() == "true") {
                                console.log("In if for actual true");
                                actualConsumptionQty += Math.round(consumptionList[c].consumptionQty);
                                // Adding regions reporting actual consumption
                                var index = regionsReportingActualConsumption.findIndex(f => f == consumptionList[c].region.id);
                                if (index == -1) {
                                    regionsReportingActualConsumption.push(consumptionList[c].region.id);
                                }
                            } else {
                                // Calculating forecated consumption qty
                                forecastedConsumptionQty += Math.round(consumptionList[c].consumptionQty);
                            }
                        }
                        console.log("regionsReportingActualConsumption", regionsReportingActualConsumption);
                        // Getting no of regions reporting actual consumption
                        noOfRegionsReportingActualConsumption = regionsReportingActualConsumption.length;
                        // Check if there are consumption details avaliable
                        if (consumptionList.length == 0) {
                            console.log("In if for length 0");
                            consumptionQty = "";
                            consumptionType = "";
                        } else if (((totalNoOfRegions == noOfRegionsReportingActualConsumption) || (actualConsumptionQty >= forecastedConsumptionQty)) && (noOfRegionsReportingActualConsumption > 0)) {
                            console.log("In if for considering actual consumption", actualConsumptionQty);
                            // Considering actual consumption if consumption for all regions is given or if actual consumption qty is greater than forecasted consumption qty
                            consumptionQty = actualConsumptionQty;
                            consumptionType = 1;
                            // Reducing consumption for the batches that are given by user
                            var consumptionListForActualConsumption = consumptionList.filter(c => c.actualFlag.toString() == "true");
                            // Looping across all the actual consumptions
                            for (var ac = 0; ac < consumptionListForActualConsumption.length; ac++) {
                                // Getting batch details
                                var batchListForConsumption = consumptionListForActualConsumption[ac].batchInfoList;
                                console.log("Batch list consumption", batchListForConsumption);
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
                                                autoGenerated: bd.autoGenerated,
                                                openingBalance: 0,
                                                openingBalanceWps: 0,
                                                consumption: parseInt(parseInt(batchListForConsumption[b].consumptionQty) * parseInt(consumptionListForActualConsumption[ac].multiplier)),
                                                adjustment: 0,
                                                stock: 0,
                                                shipment: 0,
                                                shipmentWps: shipmentQtyWps,
                                                expiredQty: 0,
                                                expiredQtyWps: 0
                                            }
                                            myArray.push(json);
                                        }
                                    } else {
                                        myArray[index].consumption = parseInt(myArray[index].consumption) + parseInt(parseInt(batchListForConsumption[b].consumptionQty) * parseInt(consumptionListForActualConsumption[ac].multiplier));
                                    }
                                    var index = myArray.findIndex(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                    consumptionBatchQtyTotal += parseInt(parseInt(batchListForConsumption[b].consumptionQty) * parseInt(consumptionListForActualConsumption[ac].multiplier));
                                }
                            }
                        } else {
                            console.log("In else for considering forecasted consumption", forecastedConsumptionQty);
                            // Consider forecasted consumption since that is greater
                            consumptionQty = forecastedConsumptionQty;
                            consumptionType = 0;
                        }

                        // Calculating expected stock
                        var expectedStock = 0;
                        console.log("D----------------->expiredStock-------------------->", expiredStock)
                        expectedStock = openingBalance - expiredStock + shipmentTotalQty - (consumptionQty != "" ? parseInt(consumptionQty) : 0) + (adjustmentQty != "" ? parseInt(adjustmentQty) : 0);
                        console.log("D--------------->Expected stock------------>", expectedStock);
                        console.log("D------------>openingBalance------------ -->", openingBalance, "---Expired stock-->", expiredStock, "--shipmentTotalQty-->", shipmentTotalQty, "--consumptionQty--->", consumptionQty, "---adjustmentQty--->", adjustmentQty);
                        // Calculating expected stock wps
                        var expectedStockWps = 0;
                        expectedStockWps = openingBalanceWps - expiredStockWps + shipmentTotalQtyWps - (consumptionQty != "" ? parseInt(consumptionQty) : 0) + (adjustmentQty != "" ? parseInt(adjustmentQty) : 0);

                        // Calculations of national adjustments
                        var nationalAdjustment = 0;
                        console.log("National adjustment");
                        // Check if all the regions have reported actual inventory and expected stock is not equal to actual stock make an national adjustment
                        console.log("regionsReportingActualInventory", regionsReportingActualInventory, "totalNoOfRegions", totalNoOfRegions, "expectedStock", expectedStock, "actualStockCount", actualStockCount, "Adjutsment qty", adjustmentQty);
                        if (regionsReportingActualInventory == totalNoOfRegions && expectedStock != actualStockCount) {
                            console.log("D-------------->In first if");
                            nationalAdjustment = actualStockCount - expectedStock;
                        } else if (inventoryList.length != 0 && actualStockCount > (expectedStock + adjustmentQty)) {
                            console.log("In second if");
                            // If actual stock count is greater than expected + adjustment qty that consider that stock as national adjustment
                            nationalAdjustment = actualStockCount - expectedStock;
                        } else if (regionsReportingActualInventory > 0 && expectedStock < 0) {
                            console.log("In 3rd if");
                            // If expected is less than 0 than make an national adjustment
                            nationalAdjustment = actualStockCount - expectedStock;
                        }
                        console.log("National adjutsment", nationalAdjustment);
                        // Calculations of national adjustments wps
                        var nationalAdjustmentWps = 0;
                        // Check if all the regions have reported actual inventory and expected stock is not equal to actual stock make an national adjustment wps
                        if (regionsReportingActualInventory == totalNoOfRegions && expectedStockWps != actualStockCount) {
                            nationalAdjustmentWps = actualStockCount - expectedStockWps;
                        } else if (actualStockCount > (expectedStockWps + adjustmentQty)) {
                            // If actual stock count is greater than expected + adjustment qty that consider that stock as national adjustment wps
                            nationalAdjustmentWps = actualStockCount - expectedStockWps;
                        } else if (regionsReportingActualInventory > 0 && expectedStockWps < 0) {
                            // If expected is less than 0 than make an national adjustment wps
                            nationalAdjustmentWps = actualStockCount - expectedStockWps;
                        }
                        // Accounting unallocated batchs
                        // Again sorting the batch details
                        var unallocatedQty = parseInt(consumptionQty) - parseInt(adjustmentQty) - parseInt(nationalAdjustment) - (parseInt(consumptionBatchQtyTotal) - parseInt(adjustmentBatchQtyTotal));
                        myArray = myArray.sort(function (a, b) { return ((new Date(a.expiryDate) - new Date(b.expiryDate)) || (a.batchId - b.batchId)) })
                        myArray = myArray.filter(c => (c.openingBalance != 0 || c.consumption != 0 || c.shipment != 0 || c.stock != 0 || c.adjustment != 0) || moment(c.expiryDate).format("YYYY-MM-DD") == moment(startDate).format("YYYY-MM-DD"));
                        for (var a = 0; a < myArray.length; a++) {
                            var expectedB = parseInt(myArray[a].openingBalance) + parseInt(myArray[a].shipment) - parseInt(myArray[a].consumption) + (parseInt(myArray[a].stock) == 0 ? parseInt(myArray[a].adjustment) : 0);
                            var expectedBWps = parseInt(myArray[a].openingBalanceWps) + parseInt(myArray[a].shipmentWps) - parseInt(myArray[a].consumption) + (parseInt(myArray[a].stock) == 0 ? parseInt(myArray[a].adjustment) : 0);
                            myArray[a].expectedB = parseInt(expectedB) < 0 ? 0 : parseInt(expectedB);
                            myArray[a].expectedBWps = parseInt(expectedBWps) < 0 ? 0 : parseInt(expectedBWps);
                            if (a == 0) {
                                myArray[a].unallocated = unallocatedQty;
                                myArray[a].unallocatedWps = unallocatedQty;
                            } else {
                                myArray[a].unallocated = myArray[a - 1].unallocated - myArray[a - 1].used;
                                myArray[a].unallocatedWps = myArray[a - 1].unallocatedWps - myArray[a - 1].usedWps;
                            }

                            var max = 0;
                            if (myArray[a].expectedB - myArray[a].unallocated > max) {
                                max = myArray[a].expectedB - myArray[a].unallocated;
                            }
                            if (myArray[a].stock > max) {
                                max = myArray[a].stock;
                            }
                            myArray[a].closingBalance = max;

                            var maxWps = 0;
                            if (myArray[a].expectedBWps - myArray[a].unallocatedWps > maxWps) {
                                maxWps = myArray[a].expectedBWps - myArray[a].unallocatedWps;
                            }
                            if (myArray[a].stock > maxWps) {
                                maxWps = myArray[a].stock;
                            }
                            myArray[a].closingBalanceWps = maxWps;

                            var used = -parseInt(max) + parseInt(myArray[a].openingBalance) + parseInt(myArray[a].shipment) - parseInt(myArray[a].consumption) + (parseInt(myArray[a].stock) == 0 ? parseInt(myArray[a].adjustment) : 0);
                            myArray[a].used = used;

                            var usedWps = -parseInt(maxWps) + parseInt(myArray[a].openingBalanceWps) + parseInt(myArray[a].shipmentWps) - parseInt(myArray[a].consumption) + (parseInt(myArray[a].stock) == 0 ? parseInt(myArray[a].adjustment) : 0);
                            myArray[a].usedWps = usedWps;

                            myArray[a].qty = max;
                            myArray[a].qtyWps = maxWps;

                        }
                        console.log("MyArray----------------->", myArray);

                        // Adding national adjustments to adjustment qty
                        adjustmentQty = adjustmentQty + nationalAdjustment;

                        // If there is no data make adjustment qty as null
                        if (inventoryList.length == 0) {
                            adjustmentQty = ""
                        }
                        batchDetails = myArray;


                        // AMC part
                        var amcTotal = 0;
                        var totalMonths = 0;
                        for (var ap = 1; ap <= programPlanningUnitList[ppL].monthsInPastForAmc; ap++) {
                            var amcDate = moment(startDate).subtract(ap, 'months').startOf('month').format("YYYY-MM-DD");
                            var amcFilter = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(amcDate).format("YYYY-MM-DD") && c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id);
                            if (amcFilter.length > 0) {
                                amcTotal += (amcFilter[0].consumptionQty != null && amcFilter[0].consumptionQty !== "" ? parseInt(amcFilter[0].consumptionQty) : 0);
                                if (amcFilter[0].consumptionQty != null && amcFilter[0].consumptionQty !== "") {
                                    totalMonths += 1;
                                }
                            }
                        }
                        for (var ap = 0; ap < programPlanningUnitList[ppL].monthsInFutureForAmc; ap++) {
                            var amcDate = moment(startDate).add(ap, 'months').startOf('month').format("YYYY-MM-DD");
                            // Add consumption logic
                            var actualConsumptionQtyAmc = 0;
                            var forecastedConsumptionQtyAmc = 0;
                            var consumptionQtyAmc = 0;
                            var regionsReportingActualConsumptionAmc = []
                            var noOfRegionsReportingActualConsumptionAmc = []

                            var amcFilter = (programJsonForStoringTheResult.consumptionList).filter(c => (c.consumptionDate >= amcDate && c.consumptionDate <= amcDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                            for (var c = 0; c < amcFilter.length; c++) {
                                if (amcFilter[c].actualFlag.toString() == "true") {
                                    actualConsumptionQtyAmc += Math.round(amcFilter[c].consumptionQty);
                                    var index = regionsReportingActualConsumptionAmc.findIndex(f => f == amcFilter[c].region.id);
                                    if (index == -1) {
                                        regionsReportingActualConsumptionAmc.push(amcFilter[c].region.id);
                                    }
                                } else {
                                    forecastedConsumptionQtyAmc += Math.round(amcFilter[c].consumptionQty);
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
                                amcTotal += (consumptionQtyAmc !== "" ? parseInt(consumptionQtyAmc) : 0);
                                if (consumptionQtyAmc !== "") {
                                    totalMonths += 1;
                                }
                            }
                        }
                        console.log("D--------------------->AmcTotal", amcTotal);
                        console.log("D--------------------->totalMonths", totalMonths);
                        var amc = ((parseInt(amcTotal) / parseInt(totalMonths))).toFixed(4);
                        console.log("D--------------------->AMC", amc);

                        // Calculations for Min stock
                        var maxForMonths = 0;
                        var realm = programJsonForStoringTheResult.realmCountry.realm;
                        var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                        var DEFAULT_MIN_MAX_MONTHS_OF_STOCK = realm.minMosMaxGaurdrail;
                        if (DEFAULT_MIN_MONTHS_OF_STOCK > programPlanningUnitList[ppL].minMonthsOfStock) {
                            maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                        } else if (programPlanningUnitList[ppL].minMonthsOfStock < DEFAULT_MIN_MAX_MONTHS_OF_STOCK) {
                            maxForMonths = programPlanningUnitList[ppL].minMonthsOfStock
                        } else {
                            maxForMonths = DEFAULT_MIN_MAX_MONTHS_OF_STOCK
                        }
                        var minStockMoSQty = parseInt(maxForMonths);


                        // Calculations for Max Stock
                        var minForMonths = 0;
                        var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                        if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + programPlanningUnitList[ppL].reorderFrequencyInMonths)) {
                            minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                        } else {
                            minForMonths = (maxForMonths + programPlanningUnitList[ppL].reorderFrequencyInMonths);
                        }
                        var maxStockMoSQty = parseInt(minForMonths);

                        var minStock = parseInt(amc) * parseInt(minStockMoSQty);
                        var maxStock = parseInt(amc) * parseInt(maxStockMoSQty);

                        // Calculations of Closing balance
                        var closingBalance = 0;
                        var closingBalanceWps = 0;
                        var unmetDemandQty = "";
                        var unmetDemandQtyWps = "";
                        console.log("Expected stocvk", expectedStock);
                        console.log("National adjutsment", nationalAdjustment);
                        if (regionsReportingActualInventory == totalNoOfRegions) {
                            console.log("In if")
                            closingBalance = actualStockCount;
                        } else if (inventoryList.length != 0 && actualStockCount > expectedStock + nationalAdjustment) {
                            console.log("in second if")
                            closingBalance = actualStockCount
                        } else {
                            console.log("In else")
                            closingBalance = expectedStock + nationalAdjustment;
                        }

                        // Calculations of closing balance wps
                        if (regionsReportingActualInventory == totalNoOfRegions) {
                            closingBalanceWps = actualStockCount;
                        } else if (actualStockCount > expectedStockWps + nationalAdjustmentWps) {
                            closingBalanceWps = actualStockCount
                        } else {
                            closingBalanceWps = expectedStockWps + nationalAdjustmentWps;
                        }

                        console.log("Closing balance", closingBalance);
                        console.log("Expected Stock", expectedStock);

                        // Calculations of unmet demand
                        if (closingBalance < 0) {
                            unmetDemandQty = 0 - expectedStock;
                            closingBalance = 0;
                        }

                        if (closingBalanceWps < 0) {
                            unmetDemandQtyWps = 0 - expectedStockWps;
                            closingBalanceWps = 0;
                        }

                        var mos = "";
                        if (closingBalance != 0 && amc != 0) {
                            mos = parseFloat(closingBalance / amc).toFixed(4);
                        } else {
                            mos = 0;
                        }
                        console.log("Consumption QTy", consumptionQty);
                        console.log("Conditipn print", consumptionQty === "" ? null : consumptionQty);
                        for (var bd = 0; bd < batchDetails.length; bd++) {
                            console.log("D------------------->", batchDetails[bd].batchNo, "Qty", batchDetails[bd].qty, "Expired Qty", batchDetails[bd].expiredQty);
                        }
                        var json = {
                            programId: programJsonForStoringTheResult.programId,
                            versionId: programJsonForStoringTheResult.currentVersion.versionId,
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
                            batchDetails: batchDetails,
                            openingBalance: openingBalance,
                            openingBalanceWps: openingBalanceWps,
                            closingBalance: closingBalance,
                            closingBalanceWps: closingBalanceWps,
                            unmetDemand: unmetDemandQty === "" ? null : unmetDemandQty,
                            unmetDemandWps: unmetDemandQtyWps === "" ? null : unmetDemandQtyWps,
                            mos: mos,
                            nationalAdjustment: nationalAdjustment,
                            nationalAdjustmentWps: nationalAdjustmentWps,
                            expectedStock: expectedStock,
                            expectedStockWps: expectedStockWps,
                            regionCountForStock: regionsReportingActualInventory
                        }
                        console.log("D Shipment Arr----------------->JSON", json);
                        console.log("Json", json.batchDetails.length > 0 ? json.batchDetails[0].expiredQty : "");
                        console.log("D Shipment Arr----------------->supplyPlanData---------------->", supplyPlanData);
                        supplyPlanData.push(json);
                        console.log("D Shipment Arr----------------->supplyPlanData1--------->", supplyPlanData);
                    }
                }
                console.log("Supply plan data", supplyPlanData);
                programJsonForStoringTheResult.supplyPlan = supplyPlanData;
                programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJsonForStoringTheResult), SECRET_KEY)).toString();
                var programDataTransaction = db1.transaction([objectStoreName], 'readwrite');
                var programDataOs = programDataTransaction.objectStore(objectStoreName);
                var putRequest = programDataOs.put(programRequest.result);
                putRequest.onerror = function (event) {
                }.bind(this);
                putRequest.onsuccess = function (event) {
                    console.log("Time taken", performance.now())
                    if (page == "consumption") {
                        console.log("After save")
                        props.updateState("message", i18n.t('static.message.consumptionSaved'));
                        props.updateState("color", 'green');
                        props.updateState("consumptionChangedFlag", 0);
                        console.log("after update state")
                        if (props.consumptionPage != "consumptionDataEntry") {
                            props.toggleLarge('Consumption');
                            if (props.consumptionPage != "supplyPlanCompare") {
                                props.formSubmit(props.items.planningUnit, props.items.monthCount);
                            } else {
                                props.formSubmit(props.items.monthCount);
                            }
                        }
                        if (props.consumptionPage == "consumptionDataEntry") {
                            props.formSubmit(props.items.planningUnit, props.items.rangeValue);
                        }
                        props.updateState("loading", false);
                        props.hideFirstComponent();
                        console.log("Start date", new Date());
                    } else if (page == "inventory") {
                        console.log("After save")
                        // this.showInventoryData();
                        // console.log("props.items.inventoryDataType", props.items.inventoryDataType);
                        props.updateState("color", 'green');
                        props.updateState("inventoryChangedFlag", 0);
                        console.log("after update state")
                        if (props.inventoryPage != "inventoryDataEntry") {
                            if (props.items.inventoryType == 1) {
                                props.updateState("message", i18n.t('static.message.inventorySaved'));
                            } else {
                                props.updateState("message", i18n.t('static.message.adjustmentsSaved'));
                            }
                            props.toggleLarge('Adjustments');
                            if (props.inventoryPage != "supplyPlanCompare") {
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
                                props.formSubmit(props.items.planningUnit, props.items.monthCount);
                            } else {
                                props.formSubmit(props.items.monthCount);
                            }
                        }
                        if (props.shipmentPage == "shipmentDataEntry") {
                            props.formSubmit(props.items.planningUnit, props.items.rangeValue);
                        }
                        props.updateState("loading", false);
                        props.hideFirstComponent()
                    } else if (page == "whatIf") {
                        props.formSubmit(props.state.planningUnit, props.state.monthCount);
                        props.updateState("loading", false);
                    } else if (page == "supplyPlan") {
                        props.formSubmit(props.state.planningUnit, props.state.monthCount);
                    } else if (page == "supplyPlanCompare") {
                        props.formSubmit(props.state.monthCount);
                    } else if (page == "whatIfFormSubmit") {
                        props.formSubmit(props.state.planningUnit, props.state.monthCount);
                        props.updateState("loading", false);
                    } else if (page == 'syncPage') {
                        // console.log("ProgramJsonForSToring the result", programJsonForStoringTheResult);
                        // ProgramService.saveProgramData(programJsonForStoringTheResult).then(response => {
                        //     if (response.status == 200) {
                        //         props.redirectToDashbaord();
                        //     } else {
                        //         props.updateState("message", response.data.messageCode)
                        //         props.updateState("color", "red")
                        //         props.hideFirstComponent();
                        //     }
                        // })
                        //     .catch(
                        //         error => {
                        //             if (error.message === "Network Error") {
                        //                 props.updateState("message", error.message)
                        //                 props.updateState("loading", false)
                        //                 props.updateState("color", "red")
                        //                 props.hideFirstComponent();
                        //             } else {
                        //                 switch (error.response ? error.response.status : "") {
                        //                     case 500:
                        //                     case 401:
                        //                     case 404:
                        //                     case 406:
                        //                     case 412:
                        //                         props.updateState("message", error.response.data.messageCode)
                        //                         props.updateState("loading", false)
                        //                         props.updateState("color", "red")
                        //                         props.hideFirstComponent();
                        //                         break;
                        //                     default:
                        //                         props.updateState("message", 'static.unkownError')
                        //                         props.updateState("loading", false)
                        //                         props.updateState("color", "red")
                        //                         props.hideFirstComponent();
                        //                         break;
                        //                 }
                        //             }
                        //         }
                        //     );
                    } else if (page == 'quantimedImport') {
                        props.updateState("loading", false);
                        props.redirectToDashbaord();
                    } else if (page == 'masterDataSync') {
                        console.log("D------------> in master data sync")
                        console.log("D------------> props", problemListChild);
                        if (moment(lastSyncDate).format("YYYY-MM-DD") < (moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD'))) {
                            console.log("D------------> in last login date")
                            problemListChild.qatProblemActions(programId);
                        }
                    }
                }
            }
        }
    }
}