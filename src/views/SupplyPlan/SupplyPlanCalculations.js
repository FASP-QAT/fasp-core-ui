import CryptoJS from 'crypto-js'
import { SECRET_KEY, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS, FIRST_DATA_ENTRY_DATE, TBD_PROCUREMENT_AGENT_ID, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, INDEXED_DB_NAME, INDEXED_DB_VERSION, QAT_DATA_SOURCE_ID, NOTES_FOR_QAT_ADJUSTMENTS, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE } from '../../Constants.js'
import moment from "moment";
import { contrast } from '../../CommonComponent/JavascriptCommonFunctions.js';
import i18n from '../../i18n';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import ProgramService from '../../api/ProgramService.js';

export function calculateSupplyPlan(programId, planningUnitId, objectStoreName, page, props, planningUnitList) {
    console.log("In calculate")
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
            var programDataBytes = CryptoJS.AES.decrypt(programRequest.result.programData, SECRET_KEY);
            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
            var programJson = JSON.parse(programData);
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
                var inventoryListForNationalAdjustments = programJson.inventoryList;
                var supplyPlanData = programJsonForStoringTheResult.supplyPlan;
                if (supplyPlanData == undefined) {
                    supplyPlanData = []
                }
                var regionListFiltered = [];
                var regionList = [];
                for (var i = 0; i < programJsonForStoringTheResult.regionList.length; i++) {
                    var regionJson = {
                        id: programJsonForStoringTheResult.regionList[i].regionId
                    }
                    regionList.push(regionJson);
                }
                regionListFiltered = regionList;

                var shipmentStatusTransaction = db1.transaction(['shipmentStatus'], 'readwrite');
                var shipmentStatusOs = shipmentStatusTransaction.objectStore('shipmentStatus');
                var shipmentStatusRequest = shipmentStatusOs.getAll();
                shipmentStatusRequest.onerror = function (event) {
                }.bind(this);
                shipmentStatusRequest.onsuccess = function (event) {
                    var shipmentStatusResult = [];
                    shipmentStatusResult = shipmentStatusRequest.result;
                    var papuTransaction = db1.transaction(['procurementAgent'], 'readwrite');
                    var papuOs = papuTransaction.objectStore('procurementAgent');
                    var papuRequest = papuOs.getAll();
                    papuRequest.onerror = function (event) {
                    }.bind(this);
                    papuRequest.onsuccess = function (event) {
                        var papuResult = [];
                        papuResult = papuRequest.result;
                        var rcpuTransaction = db1.transaction(['realmCountryPlanningUnit'], 'readwrite');
                        var rcpuOs = rcpuTransaction.objectStore('realmCountryPlanningUnit');
                        var rcpuRequest = rcpuOs.getAll();
                        rcpuRequest.onerror = function (event) {
                            this.props.updateState("supplyPlanError", i18n.t('static.program.errortext'));
                        }.bind(this);
                        rcpuRequest.onsuccess = function (event) {
                            var rcpuResult = [];
                            rcpuResult = rcpuRequest.result.filter(c => (c.active).toString() == "true");
                            for (var k = 0; k < rcpuResult.length; k++) {
                                if (rcpuResult[k].realmCountry.id == programJsonForStoringTheResult.realmCountry.realmCountryId) {
                                    var rcpuJson = {
                                        id: rcpuResult[k].realmCountryPlanningUnitId,
                                        multiplier: rcpuResult[k].multiplier,
                                        planningUnit: rcpuResult[k].planningUnit
                                    }
                                    realmCountryPlanningUnitList.push(rcpuJson);
                                }
                            }

                            programPlanningUnitList = (programPlanningUnitList).filter(c => c.program.id == programJsonForStoringTheResult.programId && c.active == true);
                            if (planningUnitId != 0) {
                                programPlanningUnitList = programPlanningUnitList.filter(c => c.planningUnit.id == planningUnitId);
                            }
                            if (planningUnitList != undefined && planningUnitList != []) {
                                for (var pp = 0; pp < planningUnitList.length; pp++) {
                                    programPlanningUnitList = programPlanningUnitList.filter(c => c.planningUnit.id == planningUnitList[pp]);
                                }
                            }
                            if ((page == 'masterDataSync' || page == 'syncPage') && planningUnitList.length == 0) {
                                console.log("in if");
                                programPlanningUnitList = [];
                            }
                            console.log("Filtered planning unit list", programPlanningUnitList);
                            var paColors = []
                            for (var ppL = 0; ppL < programPlanningUnitList.length; ppL++) {

                                var shipmentListForMax = (programJsonForStoringTheResult.shipmentList).filter(c => c.active == true && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                var inventoryListForMax = (programJsonForStoringTheResult.inventoryList).filter(c => c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                                var consumptionListForMax = (programJsonForStoringTheResult.consumptionList).filter(c => c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                                let invmax = moment.max(inventoryListForMax.map(d => moment(d.inventoryDate)))
                                let shipmax = moment.max(shipmentListForMax.map(d => moment(d.expectedDeliveryDate)))
                                let conmax = moment.max(consumptionListForMax.map(d => moment(d.consumptionDate)))
                                var maxDate = invmax.isAfter(shipmax) && invmax.isAfter(conmax) ? invmax : shipmax.isAfter(invmax) && shipmax.isAfter(conmax) ? shipmax : conmax
                                let invmin = moment.min(inventoryListForMax.map(d => moment(d.inventoryDate)))
                                let shipmin = moment.min(shipmentListForMax.map(d => moment(d.expectedDeliveryDate)))
                                let conmin = moment.min(consumptionListForMax.map(d => moment(d.consumptionDate)))
                                var minDate = invmin.isBefore(shipmin) && invmin.isBefore(conmin) ? invmin : shipmin.isBefore(invmin) && shipmin.isBefore(conmin) ? shipmin : conmin
                                var FIRST_DATA_ENTRY_DATE = minDate;
                                var createdDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                                var firstDataEntryDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                                var lastDataEntryDate = moment(maxDate).add(programPlanningUnitList[ppL].monthsInPastForAmc, 'months').format("YYYY-MM-DD");
                                supplyPlanData = supplyPlanData.filter(c => c.planningUnitId != programPlanningUnitList[ppL].planningUnit.id);
                                for (var i = 0; createdDate < lastDataEntryDate; i++) {
                                    createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                    var startDate = moment(createdDate).startOf('month').format('YYYY-MM-DD');
                                    var endDate = moment(createdDate).endOf('month').format('YYYY-MM-DD');
                                    var month = { startDate: startDate, endDate: endDate, month: moment(createdDate).format('MMM YY'), monthName: i18n.t("static.common." + (moment(createdDate).format('MMM')).toLowerCase()), monthYear: moment(createdDate).format('YY') };

                                    var prevMonthDate = moment(createdDate).subtract(1, 'months').startOf('month').format("YYYY-MM-DD");
                                    var prevMonthSupplyPlan = [];
                                    if (supplyPlanData.length > 0) {
                                        prevMonthSupplyPlan = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(prevMonthDate).format("YYYY-MM-DD") && c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id);
                                    } else {
                                        prevMonthSupplyPlan = []
                                    }
                                    var batchDetails = [];
                                    if (prevMonthSupplyPlan.length > 0) {
                                        batchDetails = prevMonthSupplyPlan[0].batchDetails;
                                    } else {
                                        batchDetails = programJsonForStoringTheResult.batchInfoList.filter(c => c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id);
                                        for (var bda = 0; bda < batchDetails.length; bda++) {
                                            batchDetails[bda].qty = 0;
                                            batchDetails[bda].qtyWps = 0;
                                            batchDetails[bda].expiredQty = 0;
                                            batchDetails[bda].expiredQtyWps = 0;
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

                                    var myArray = batchDetails.sort(function (a, b) { return new Date(a.expiryDate) - new Date(b.expiryDate) });



                                    // Shipments part

                                    var shipmentList = (programJsonForStoringTheResult.shipmentList).filter(c => c.active == true && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                    var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate))
                                    var manualShipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate) && c.erpFlag == false);
                                    var shipmentTotalQty = 0;
                                    var shipmentTotalQtyWps = 0;
                                    var manualTotalQty = 0;
                                    var receivedShipmentsTotalData = 0;
                                    var shippedShipmentsTotalData = 0;
                                    var approvedShipmentsTotalData = 0;
                                    var submittedShipmentsTotalData = 0;
                                    var plannedShipmentsTotalData = 0;
                                    var onholdShipmentsTotalData = 0;
                                    var erpShipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate) && c.erpFlag == true);
                                    var erpTotalQty = 0;
                                    var receivedErpShipmentsTotalData = 0;
                                    var shippedErpShipmentsTotalData = 0;
                                    var approvedErpShipmentsTotalData = 0;
                                    var submittedErpShipmentsTotalData = 0;
                                    var plannedErpShipmentsTotalData = 0;
                                    var onholdErpShipmentsTotalData = 0;

                                    for (var j = 0; j < shipmentArr.length; j++) {
                                        shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                        var batchListForShipments = shipmentArr[j].batchInfoList;
                                        console.log("Batch list for shipments", batchListForShipments);
                                        for (var b = 0; b < batchListForShipments.length; b++) {
                                            var batchNo = batchListForShipments[b].batch.batchNo;
                                            var index = myArray.findIndex(c => c.batchNo == batchNo);
                                            console.log("My Array", myArray);
                                            console.log("Index", index);
                                            myArray[index].qty = parseInt(myArray[index].qty) + batchListForShipments[b].shipmentQty;
                                            console.log("Btach No", batchNo, "B", b, "Qty", batchListForShipments[b].shipmentQty)
                                        }
                                        if (shipmentArr[j].shipmentStatus.id != PLANNED_SHIPMENT_STATUS && shipmentArr[j].shipmentStatus.id != ON_HOLD_SHIPMENT_STATUS && shipmentArr[j].shipmentStatus.id != SUBMITTED_SHIPMENT_STATUS) {
                                            shipmentTotalQtyWps += parseInt((shipmentArr[j].shipmentQty));
                                            var batchListForShipmentsWps = shipmentArr[j].batchInfoList;
                                            console.log("Batch list for shipments", batchListForShipments);
                                            for (var b = 0; b < batchListForShipmentsWps.length; b++) {
                                                var batchNoWps = batchListForShipmentsWps[b].batch.batchNo;
                                                var index = myArray.findIndex(c => c.batchNo == batchNoWps);
                                                console.log("My Array", myArray);
                                                console.log("Index", index);
                                                myArray[index].qtyWps = parseInt(myArray[index].qtyWps) + batchListForShipmentsWps[b].shipmentQty;
                                                console.log("Btach No", batchNoWps, "B", b, "Qty", batchListForShipments[b].shipmentQty)
                                            }
                                        }
                                    }

                                    for (var j = 0; j < manualShipmentArr.length; j++) {
                                        manualTotalQty += parseInt((manualShipmentArr[j].shipmentQty));
                                        if (manualShipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                            receivedShipmentsTotalData += parseInt((manualShipmentArr[j].shipmentQty));
                                        } else if (manualShipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                            shippedShipmentsTotalData += parseInt((manualShipmentArr[j].shipmentQty));
                                        } else if (manualShipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                            approvedShipmentsTotalData += parseInt((manualShipmentArr[j].shipmentQty));
                                        } else if (manualShipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                            submittedShipmentsTotalData += parseInt((manualShipmentArr[j].shipmentQty));
                                        } else if (manualShipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS) {
                                            plannedShipmentsTotalData += parseInt((manualShipmentArr[j].shipmentQty));
                                        } else if (manualShipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                            onholdShipmentsTotalData += parseInt((manualShipmentArr[j].shipmentQty));
                                        }
                                    }

                                    for (var j = 0; j < erpShipmentArr.length; j++) {
                                        erpTotalQty += parseInt((erpShipmentArr[j].shipmentQty));
                                        if (erpShipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                            receivedErpShipmentsTotalData += parseInt((erpShipmentArr[j].shipmentQty));
                                        } else if (erpShipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                            shippedErpShipmentsTotalData += parseInt((erpShipmentArr[j].shipmentQty));
                                        } else if (erpShipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                            approvedErpShipmentsTotalData += parseInt((erpShipmentArr[j].shipmentQty));
                                        } else if (erpShipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                            submittedErpShipmentsTotalData += parseInt((erpShipmentArr[j].shipmentQty));
                                        } else if (erpShipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS) {
                                            plannedErpShipmentsTotalData += parseInt((erpShipmentArr[j].shipmentQty));
                                        } else if (erpShipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS) {
                                            onholdErpShipmentsTotalData += parseInt((erpShipmentArr[j].shipmentQty));
                                        }
                                    }



                                    // Inventory part
                                    var inventoryList = (programJsonForStoringTheResult.inventoryList).filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                                    var actualStockCount = 0;
                                    var adjustmentQty = 0;
                                    var unallocatedAdjustmentQty = 0;
                                    var unallocatedAdjustmentQtyWps = 0;
                                    var regionsReportingActualInventory = 0;
                                    for (var r = 0; r < totalNoOfRegions; r++) {
                                        var inventoryListForRegion = inventoryList.filter(c => c.region != null && c.region.id != 0 && c.region.id == regionList[r].id);
                                        console.log("inventiryListForRegion", inventoryListForRegion);
                                        var noOfEntriesOfActualStockCount = (inventoryListForRegion.filter(c => c.actualQty != 0 && c.actualQty != null && c.actualQty != "")).length;
                                        if (noOfEntriesOfActualStockCount > 0) {
                                            regionsReportingActualInventory += 1;
                                        }
                                        for (var inv = 0; inv < inventoryListForRegion.length; inv++) {
                                            if (noOfEntriesOfActualStockCount > 0) {
                                                console.log("Actual stock count", actualStockCount);
                                                if (inventoryListForRegion[inv].actualQty != "" && inventoryListForRegion[inv].actualQty != null && inventoryListForRegion[inv].actualQty != 0) {
                                                    console.log("parseInt(parseInt(inventoryListForRegion[inv].actualQty) * parseInt(inventoryListForRegion[inv].multiplier))", parseInt(parseInt(inventoryListForRegion[inv].actualQty) * parseInt(inventoryListForRegion[inv].multiplier)));
                                                    actualStockCount += parseInt(parseInt(inventoryListForRegion[inv].actualQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                                }
                                                var batchListForInventory = inventoryListForRegion[inv].batchInfoList;
                                                for (var b = 0; b < batchListForInventory.length; b++) {
                                                    var batchNo = batchListForInventory[b].batch.batchNo;
                                                    var index = myArray.findIndex(c => c.batchNo == batchNo);
                                                    myArray[index].qty = parseInt(parseInt(batchListForInventory[b].actualQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                                    myArray[index].qtyWps = parseInt(parseInt(batchListForInventory[b].actualQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                                    console.log("Btach No", batchNo, "Qty", parseInt(parseInt(batchListForInventory[b].actualQty) * parseInt(inventoryListForRegion[inv].multiplier)))
                                                }
                                            } else {
                                                if (inventoryListForRegion[inv].adjustmentQty != "" && inventoryListForRegion[inv].adjustmentQty != null && inventoryListForRegion[inv].adjustmentQty != 0) {
                                                    adjustmentQty += parseInt(parseInt(inventoryListForRegion[inv].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                                }
                                                var batchListForInventory = inventoryListForRegion[inv].batchInfoList;
                                                console.log("Btach list adjustments", batchListForInventory);
                                                for (var b = 0; b < batchListForInventory.length; b++) {
                                                    var batchNo = batchListForInventory[b].batch.batchNo;
                                                    var index = myArray.findIndex(c => c.batchNo == batchNo);
                                                    var quantity = myArray[index].qty + parseInt(parseInt(batchListForInventory[b].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                                    if (quantity < 0) {
                                                        unallocatedAdjustmentQty += parseInt(parseInt(batchListForInventory[b].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier)) - myArray[index].qty;
                                                        myArray[index].qty = 0;
                                                    } else {
                                                        myArray[index].qty = myArray[index].qty + parseInt(parseInt(batchListForInventory[b].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                                    }

                                                    var quantityWps = myArray[index].qtyWps + parseInt(parseInt(batchListForInventory[b].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                                    if (quantityWps < 0) {
                                                        unallocatedAdjustmentQtyWps += parseInt(parseInt(batchListForInventory[b].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier)) - myArray[index].qtyWps;
                                                        myArray[index].qtyWps = 0;
                                                    } else {
                                                        myArray[index].qtyWps = myArray[index].qtyWps + parseInt(parseInt(batchListForInventory[b].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                                    }
                                                    console.log("Btach No", batchNo, "Qty", parseInt(parseInt(batchListForInventory[b].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier)))
                                                }
                                                var qty = 0;
                                                if (batchListForInventory.length > 0) {
                                                    for (var a = 0; a < batchListForInventory.length; a++) {
                                                        qty += parseInt((batchListForInventory)[a].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier);
                                                    }
                                                }
                                                var remainingQty = parseInt(parseInt(parseInt(inventoryListForRegion[inv].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier))) - parseInt(qty);
                                                unallocatedAdjustmentQty += parseInt(remainingQty);
                                                unallocatedAdjustmentQtyWps += parseInt(remainingQty);
                                            }
                                        }
                                    }


                                    // Consumption part
                                    var consumptionList = (programJsonForStoringTheResult.consumptionList).filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                                    var actualConsumptionQty = 0;
                                    var forecastedConsumptionQty = 0;
                                    var regionsReportingActualConsumption = [];
                                    var noOfRegionsReportingActualConsumption = 0;
                                    var totalNoOfRegions = (regionListFiltered).length;
                                    var consumptionQty = 0;
                                    var consumptionType = "";
                                    var regionList = regionListFiltered;
                                    var unallocatedConsumptionQty = 0;
                                    var unallocatedConsumptionQtyWps = 0;
                                    for (var c = 0; c < consumptionList.length; c++) {
                                        if (consumptionList[c].actualFlag.toString() == "true") {
                                            actualConsumptionQty += parseInt(consumptionList[c].consumptionQty);
                                            var index = regionsReportingActualConsumption.findIndex(f => f == consumptionList[c].region.id);
                                            if (index == -1) {
                                                regionsReportingActualConsumption.push(consumptionList[c].region.id);
                                            }

                                        } else {
                                            forecastedConsumptionQty += parseInt(consumptionList[c].consumptionQty);
                                        }
                                    }
                                    noOfRegionsReportingActualConsumption = regionsReportingActualConsumption.length;
                                    if (consumptionList.length == 0) {
                                        consumptionQty = "";
                                        consumptionType = "";
                                    } else if ((totalNoOfRegions == noOfRegionsReportingActualConsumption) || (actualConsumptionQty >= forecastedConsumptionQty)) {
                                        consumptionQty = actualConsumptionQty;
                                        consumptionType = 1;
                                        var consumptionListForActualConsumption = consumptionList.filter(c => c.actualFlag.toString() == "true");
                                        for (var ac = 0; ac < consumptionListForActualConsumption.length; ac++) {
                                            var batchListForConsumption = consumptionListForActualConsumption[ac].batchInfoList;
                                            console.log("Batch list consumption", batchListForConsumption);
                                            for (var b = 0; b < batchListForConsumption.length; b++) {
                                                var batchNo = batchListForConsumption[b].batch.batchNo;
                                                var index = myArray.findIndex(c => c.batchNo == batchNo);
                                                var quantity = myArray[index].qty - parseInt(parseInt(batchListForConsumption[b].consumptionQty) * parseInt(consumptionListForActualConsumption[ac].multiplier));
                                                if (quantity < 0) {
                                                    unallocatedConsumptionQty += parseInt(parseInt(batchListForConsumption[b].consumptionQty) * parseInt(consumptionListForActualConsumption[ac].multiplier)) - myArray[index].qty;
                                                    myArray[index].qty = 0;
                                                } else {
                                                    myArray[index].qty = quantity;
                                                }

                                                var quantityWps = myArray[index].qtyWps - parseInt(parseInt(batchListForConsumption[b].consumptionQty) * parseInt(consumptionListForActualConsumption[ac].multiplier));
                                                if (quantityWps < 0) {
                                                    unallocatedConsumptionQtyWps += parseInt(parseInt(batchListForConsumption[b].consumptionQty) * parseInt(consumptionListForActualConsumption[ac].multiplier)) - myArray[index].qtyWps;
                                                    myArray[index].qtyWps = 0;
                                                } else {
                                                    myArray[index].qtyWps = quantityWps;
                                                }
                                            }
                                            var qty = 0;
                                            if (batchListForConsumption.length > 0) {
                                                for (var a = 0; a < batchListForConsumption.length; a++) {
                                                    qty += parseInt((batchListForConsumption)[a].consumptionQty) * parseInt(consumptionListForActualConsumption[ac].multiplier);
                                                }
                                            }
                                            var remainingQty = parseInt(parseInt(parseInt(consumptionListForActualConsumption[ac].consumptionQty))) - parseInt(qty);
                                            unallocatedConsumptionQty += parseInt(remainingQty);
                                            unallocatedConsumptionQtyWps += parseInt(remainingQty);
                                        }
                                    } else {
                                        consumptionQty = forecastedConsumptionQty;
                                        consumptionType = 0;
                                        unallocatedConsumptionQty += forecastedConsumptionQty;
                                        unallocatedConsumptionQtyWps += forecastedConsumptionQty;
                                    }


                                    // QAT Adjustments
                                    var nationalAdjustment = 0;
                                    var nationalAdjustmentWps = 0;
                                    console.log("regionsReportingActualInventory", regionsReportingActualInventory, "totalNoOfRegions", totalNoOfRegions, "actualStockCount", actualStockCount);
                                    if (regionsReportingActualInventory == totalNoOfRegions && actualStockCount > 0) {
                                        // Calculations for auto adjustments
                                        var ob = 0;
                                        if (prevMonthSupplyPlan.length > 0) {
                                            ob = prevMonthSupplyPlan[0].closingBalance;
                                        } else {
                                            ob = 0;
                                        }

                                        var obWps = 0;
                                        if (prevMonthSupplyPlan.length > 0) {
                                            obWps = prevMonthSupplyPlan[0].closingBalanceWps;
                                        } else {
                                            obWps = 0;
                                        }
                                        var cb = parseInt(ob) - (consumptionQty != "" ? parseInt(consumptionQty) : 0) + parseInt(shipmentTotalQty);
                                        var cbWps = parseInt(obWps) - (consumptionQty != "" ? parseInt(consumptionQty) : 0) + parseInt(shipmentTotalQtyWps);
                                        console.log("Cb-------------------->", cb);
                                        nationalAdjustment = parseInt(actualStockCount) - parseInt(cb);
                                        nationalAdjustmentWps = parseInt(actualStockCount) - parseInt(cbWps);
                                        console.log("nation adjustments", nationalAdjustment);
                                    }
                                    adjustmentQty += nationalAdjustment;
                                    unallocatedAdjustmentQty += nationalAdjustment;
                                    unallocatedAdjustmentQtyWps += nationalAdjustmentWps;

                                    // Pushing national adjutsments to inventory data
                                    if (nationalAdjustment != 0) {
                                        var nationAdjustmentIndex = inventoryListForNationalAdjustments.findIndex(c => (c.region == null || c.region.id == 0) && moment(c.inventoryDate).format("YYYY-MM") == moment(endDate).format("YYYY-MM") && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id);
                                        var realmCountryPlanningUnitId = realmCountryPlanningUnitList.filter(c => c.multiplier == 1)[0].id;
                                        console.log("Realmcountry planningUnit Id", realmCountryPlanningUnitId);
                                        if (nationAdjustmentIndex == -1) {
                                            var inventoryJson = {
                                                inventoryId: 0,
                                                dataSource: {
                                                    id: QAT_DATA_SOURCE_ID
                                                },
                                                region: null,
                                                inventoryDate: moment(endDate).endOf('month').format("YYYY-MM-DD"),
                                                adjustmentQty: nationalAdjustment,
                                                actualQty: "",
                                                active: true,
                                                realmCountryPlanningUnit: {
                                                    id: realmCountryPlanningUnitId,
                                                },
                                                multiplier: 1,
                                                planningUnit: {
                                                    id: programPlanningUnitList[ppL].planningUnit.id
                                                },
                                                notes: NOTES_FOR_QAT_ADJUSTMENTS,
                                                batchInfoList: []
                                            }
                                            inventoryListForNationalAdjustments.push(inventoryJson);
                                        } else {
                                            inventoryListForNationalAdjustments[parseInt(nationAdjustmentIndex)].adjustmentQty = nationalAdjustment;
                                            inventoryListForNationalAdjustments[parseInt(nationAdjustmentIndex)].active = true;

                                        }
                                    } else {
                                        var nationAdjustmentIndex = inventoryListForNationalAdjustments.findIndex(c => (c.region == null || c.region.id == 0) && moment(c.inventoryDate).format("YYYY-MM") == moment(endDate).format("YYYY-MM") && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id);
                                        if (nationAdjustmentIndex != -1) {
                                            inventoryListForNationalAdjustments[parseInt(nationAdjustmentIndex)].active = false;
                                        }
                                    }

                                    var inventoryList = (programJsonForStoringTheResult.inventoryList).filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                                    if (inventoryList.length == 0) {
                                        adjustmentQty = ""
                                    }

                                    console.log("Unallocated adjustemnts", unallocatedAdjustmentQty);
                                    console.log("Unallocated consumption QTy", unallocatedConsumptionQty);
                                    for (var ma = 0; ma < myArray.length; ma++) {
                                        console.log("Batch No", myArray[ma].batchNo, "Remaining batch qty", myArray[ma].remainingBatchQty);
                                    }

                                    console.log("Unallocated adjustemnts", unallocatedAdjustmentQty);
                                    console.log("Unallocated consumption QTy", unallocatedConsumptionQty);
                                    for (var ma = 0; ma < myArray.length; ma++) {
                                        console.log("Batch No", myArray[ma].batchNo, "Remaining batch qty", myArray[ma].remainingBatchQty);
                                    }


                                    // Accounting unallocated batchs
                                    myArray = myArray.sort(function (a, b) { return new Date(a.expiryDate) - new Date(b.expiryDate) })
                                    var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) > (moment(startDate).format("YYYY-MM-DD"))));
                                    if (unallocatedAdjustmentQty > 0) {
                                        if (batchDetailsForParticularPeriod.length > 0) {
                                            console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                            console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                            batchDetailsForParticularPeriod[0].qty = batchDetailsForParticularPeriod[0].qty + unallocatedAdjustmentQty;
                                            unallocatedAdjustmentQty = 0;
                                        }
                                    }

                                    if (unallocatedAdjustmentQtyWps > 0) {
                                        if (batchDetailsForParticularPeriod.length > 0) {
                                            console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].qtyWps), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                            console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                            batchDetailsForParticularPeriod[0].qtyWps = batchDetailsForParticularPeriod[0].qtyWps + unallocatedAdjustmentQtyWps;
                                            unallocatedAdjustmentQtyWps = 0;
                                        }
                                    }

                                    var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) > (moment(startDate).format("YYYY-MM-DD"))) && (c.qty > 0));
                                    if (unallocatedAdjustmentQty < 0) {
                                        for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                            var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
                                            if (parseInt(batchDetailsForParticularPeriod[ua - 1].qty) + parseInt(unallocatedAdjustmentQty) > 0) {
                                                myArray[index].qty = parseInt(batchDetailsForParticularPeriod[ua - 1].qty) + parseInt(unallocatedAdjustmentQty);
                                                unallocatedAdjustmentQty = 0
                                            } else {
                                                var rq = batchDetailsForParticularPeriod[ua - 1].qty;
                                                myArray[index].qty = 0;
                                                unallocatedAdjustmentQty = parseInt(unallocatedAdjustmentQty) + parseInt(rq);
                                            }
                                        }
                                    }

                                    batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) > (moment(startDate).format("YYYY-MM-DD"))) && (c.qty > 0));
                                    for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
                                        var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua].batchNo);
                                        if (parseInt(batchDetailsForParticularPeriod[ua].qty) >= parseInt(unallocatedConsumptionQty)) {
                                            myArray[index].qty = parseInt(batchDetailsForParticularPeriod[ua].qty) - parseInt(unallocatedConsumptionQty);
                                            unallocatedConsumptionQty = 0
                                        } else {
                                            var rq = batchDetailsForParticularPeriod[ua].qty;
                                            myArray[index].qty = 0;
                                            unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) - parseInt(rq);
                                        }
                                    }

                                    // WPS
                                    var batchDetailsForParticularPeriodWps = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) > (moment(startDate).format("YYYY-MM-DD"))) && (c.qtyWps > 0));
                                    if (unallocatedAdjustmentQtyWps < 0) {
                                        for (var ua = batchDetailsForParticularPeriodWps.length; unallocatedAdjustmentQtyWps != 0 && batchDetailsForParticularPeriodWps.length > 0 && ua != 0; ua--) {
                                            var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriodWps[ua - 1].batchNo);
                                            if (parseInt(batchDetailsForParticularPeriodWps[ua - 1].qty) + parseInt(unallocatedAdjustmentQtyWps) > 0) {
                                                myArray[index].qtyWps = parseInt(batchDetailsForParticularPeriodWps[ua - 1].qtyWps) + parseInt(unallocatedAdjustmentQtyWps);
                                                unallocatedAdjustmentQtyWps = 0
                                            } else {
                                                var rq = batchDetailsForParticularPeriodWps[ua - 1].qtyWps;
                                                myArray[index].qtyWps = 0;
                                                unallocatedAdjustmentQtyWps = parseInt(unallocatedAdjustmentQtyWps) + parseInt(rq);
                                            }
                                        }
                                    }

                                    batchDetailsForParticularPeriodWps = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) > (moment(startDate).format("YYYY-MM-DD"))) && (c.qtyWps > 0));
                                    for (var ua = 0; unallocatedConsumptionQtyWps != 0 && batchDetailsForParticularPeriodWps.length > 0 && ua < batchDetailsForParticularPeriodWps.length; ua++) {
                                        var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriodWps[ua].batchNo);
                                        if (parseInt(batchDetailsForParticularPeriodWps[ua].qty) >= parseInt(unallocatedConsumptionQtyWps)) {
                                            myArray[index].qtyWps = parseInt(batchDetailsForParticularPeriodWps[ua].qtyWps) - parseInt(unallocatedConsumptionQtyWps);
                                            unallocatedConsumptionQtyWps = 0
                                        } else {
                                            var rq = batchDetailsForParticularPeriodWps[ua].qty;
                                            myArray[index].qtyWps = 0;
                                            unallocatedConsumptionQtyWps = parseInt(unallocatedConsumptionQtyWps) - parseInt(rq);
                                        }
                                    }
                                    batchDetails = myArray;
                                    var expiredStock = 0;
                                    var expiredStockWps = 0;
                                    var expiredStockArr = batchDetails.filter(c => c.expiryDate >= startDate && c.expiryDate <= endDate);
                                    for (var e = 0; e < expiredStockArr.length; e++) {
                                        expiredStock += parseInt(expiredStockArr[e].qty);
                                        var index = batchDetails.findIndex(c => c.batchNo == expiredStockArr[e].batchNo);
                                        batchDetails[index].expiredQty = batchDetails[index].qty;
                                        batchDetails[index].qty = 0;

                                        expiredStockWps += parseInt(expiredStockArr[e].qtyWps);
                                        var index = batchDetails.findIndex(c => c.batchNo == expiredStockArr[e].batchNo);
                                        batchDetails[index].expiredQtyWps = batchDetails[index].qtyWps;
                                        batchDetails[index].qtyWps = 0;
                                    }

                                    // AMC part
                                    var amcTotal = 0;
                                    var totalMonths = 0;
                                    for (var ap = 1; ap <= programPlanningUnitList[ppL].monthsInPastForAmc; ap++) {
                                        var amcDate = moment(startDate).subtract(ap, 'months').startOf('month').format("YYYY-MM-DD");
                                        var amcFilter = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(amcDate).format("YYYY-MM-DD") && c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id);
                                        if (amcFilter.length > 0) {
                                            amcTotal += (amcFilter[0].consumptionQty != null && amcFilter[0].consumptionQty != "" ? parseInt(amcFilter[0].consumptionQty) : 0);
                                            if (amcFilter[0].consumptionQty != null && amcFilter[0].consumptionQty != "") {
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
                                                actualConsumptionQtyAmc += parseInt(amcFilter[c].consumptionQty);
                                                var index = regionsReportingActualConsumptionAmc.findIndex(f => f == amcFilter[c].region.id);
                                                if (index == -1) {
                                                    regionsReportingActualConsumptionAmc.push(amcFilter[c].region.id);
                                                }
                                            } else {
                                                forecastedConsumptionQtyAmc += parseInt(amcFilter[c].consumptionQty);
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
                                            amcTotal += (consumptionQtyAmc != "" ? parseInt(consumptionQtyAmc) : 0);
                                            if (consumptionQtyAmc != "") {
                                                totalMonths += 1;
                                            }
                                        }
                                    }
                                    console.log("AmcTotal", amcTotal);
                                    console.log("totalMonths", totalMonths);
                                    var amc = ((parseInt(amcTotal) / parseInt(totalMonths))).toFixed(4);


                                    // Calculations for Min stock
                                    var maxForMonths = 0;
                                    var realm = programJsonForStoringTheResult.realmCountry.realm;
                                    var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                                    if (DEFAULT_MIN_MONTHS_OF_STOCK > programPlanningUnitList[ppL].minMonthsOfStock) {
                                        maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                    } else {
                                        maxForMonths = programPlanningUnitList[ppL].minMonthsOfStock
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


                                    var closingBalance = 0;
                                    var closingBalanceWps = 0;
                                    var unmetDemandQty = "";
                                    var unmetDemandQtyWps = "";
                                    closingBalance = parseInt(openingBalance) - (consumptionQty != "" ? parseInt(consumptionQty) : 0) + (adjustmentQty != "" ? parseInt(adjustmentQty) : 0) + parseInt(shipmentTotalQty) - parseInt(expiredStock);
                                    closingBalanceWps = parseInt(openingBalanceWps) - (consumptionQty != "" ? parseInt(consumptionQty) : 0) + (adjustmentQty != "" ? parseInt(adjustmentQty) : 0) + parseInt(shipmentTotalQtyWps) - parseInt(expiredStockWps);
                                    if (closingBalance < 0) {
                                        unmetDemandQty = closingBalance;
                                        closingBalance = 0;

                                    }

                                    if (closingBalanceWps < 0) {
                                        unmetDemandQtyWps = closingBalanceWps;
                                        closingBalanceWps = 0;

                                    }
                                    var mos = "";
                                    if (closingBalance != 0) {
                                        mos = parseFloat(closingBalance / amc).toFixed(4);
                                    }

                                    var json = {
                                        programId: programJsonForStoringTheResult.programId,
                                        versionId: programJsonForStoringTheResult.currentVersion.versionId,
                                        planningUnitId: programPlanningUnitList[ppL].planningUnit.id,
                                        transDate: startDate,
                                        stockQty: actualStockCount == "" ? null : actualStockCount,
                                        adjustmentQty: adjustmentQty == "" ? null : adjustmentQty,
                                        actualFlag: consumptionType == "" ? null : consumptionType,
                                        consumptionQty: consumptionQty == "" ? null : consumptionQty,
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
                                        unmetDemand: unmetDemandQty == "" ? null : unmetDemandQty,
                                        unmetDemandWps: unmetDemandQtyWps == "" ? null : unmetDemandQtyWps,
                                        mos: mos
                                    }
                                    supplyPlanData.push(json);
                                }
                            }
                            console.log("Supply plan data", supplyPlanData);
                            programJsonForStoringTheResult.supplyPlan = supplyPlanData;
                            programJsonForStoringTheResult.inventoryList = inventoryListForNationalAdjustments;
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
                                        props.formSubmit(props.items.planningUnit);
                                    }
                                    props.updateState("loading", false);
                                    console.log("Start date", new Date());
                                } else if (page == "inventory") {
                                    console.log("After save")
                                    // this.showInventoryData();
                                    console.log("props.items.inventoryDataType", props.items.inventoryDataType);
                                    props.updateState("message", i18n.t('static.message.adjustmentsSaved'));
                                    props.updateState("color", 'green');
                                    props.updateState("inventoryChangedFlag", 0);
                                    console.log("after update state")
                                    if (props.inventoryPage != "inventoryDataEntry") {
                                        props.toggleLarge('Adjustments');
                                        if (props.inventoryPage != "supplyPlanCompare") {
                                            props.formSubmit(props.items.planningUnit, props.items.monthCount);
                                        } else {
                                            props.formSubmit(props.items.monthCount);
                                        }
                                    }
                                    if (props.inventoryPage == "inventoryDataEntry") {
                                        props.formSubmit(props.items.planningUnit);
                                    }
                                    props.updateState("loading", false);
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
                                        props.formSubmit(props.items.planningUnit);
                                    }
                                    props.updateState("loading", false);
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
                                    console.log("ProgramJsonForSToring the result", programJsonForStoringTheResult);
                                    ProgramService.saveProgramData(programJsonForStoringTheResult).then(response => {
                                        if (response.status == 200) {
                                            props.redirectToDashbaord();
                                        } else {
                                            props.updateState("message", response.data.messageCode)
                                        }
                                    })
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}