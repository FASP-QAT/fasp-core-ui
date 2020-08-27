import CryptoJS from 'crypto-js'
import { SECRET_KEY, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS, FIRST_DATA_ENTRY_DATE, TBD_PROCUREMENT_AGENT_ID, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, INDEXED_DB_NAME, INDEXED_DB_VERSION, QAT_DATA_SOURCE_ID, NOTES_FOR_QAT_ADJUSTMENTS } from '../../Constants.js'
import moment from "moment";
import { contrast } from '../../CommonComponent/JavascriptCommonFunctions.js';
import i18n from '../../i18n';
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";

export function calculateSupplyPlan(programId, planningUnitId, objectStoreName, page, props) {
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
                var supplyPlanData = programJsonForStoringTheResult.supplyPlanData;
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
                            var paColors = []
                            for (var ppL = 0; ppL < programPlanningUnitList.length; ppL++) {
                                var createdDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");
                                var firstDataEntryDate = moment(FIRST_DATA_ENTRY_DATE).format("YYYY-MM-DD");



                                var shipmentListForMax = (programJsonForStoringTheResult.shipmentList).filter(c => c.active == true && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                var inventoryListForMax = (programJsonForStoringTheResult.inventoryList).filter(c => c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                                var consumptionListForMax = (programJsonForStoringTheResult.consumptionList).filter(c => c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                                let invmax = moment.max(inventoryListForMax.map(d => moment(d.inventoryDate)))
                                let shipmax = moment.max(shipmentListForMax.map(d => moment(d.expectedDeliveryDate)))
                                let conmax = moment.max(consumptionListForMax.map(d => moment(d.consumptionDate)))
                                var maxDate = invmax.isAfter(shipmax) && invmax.isAfter(conmax) ? invmax : shipmax.isAfter(invmax) && shipmax.isAfter(conmax) ? shipmax : conmax

                                var lastDataEntryDate = moment(maxDate).add(programPlanningUnitList[ppL].monthsInPastForAmc, 'months').format("YYYY-MM-DD");
                                supplyPlanData = supplyPlanData.filter(c => c.planningUnitId != programPlanningUnitList[ppL].planningUnit.id);
                                for (var i = 0; createdDate < lastDataEntryDate; i++) {
                                    createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                                    var startDate = moment(createdDate).startOf('month').format('YYYY-MM-DD');
                                    var endDate = moment(createdDate).endOf('month').format('YYYY-MM-DD');
                                    var month = { startDate: startDate, endDate: endDate, month: moment(createdDate).format('MMM YY'), monthName: i18n.t("static.common." + (moment(createdDate).format('MMM')).toLowerCase()), monthYear: moment(createdDate).format('YY') };
                                    console.log("------------------------------------");
                                    console.log("Start date----------------", createdDate);
                                    // Calculations of expired stock
                                    var prevMonthDate = moment(createdDate).subtract(1, 'months').startOf('month').format("YYYY-MM-DD");
                                    var prevMonthSupplyPlan = [];
                                    if (supplyPlanData.length > 0) {
                                        prevMonthSupplyPlan = supplyPlanData.filter(c => moment(c.startDate).format("YYYY-MM-DD") == moment(prevMonthDate).format("YYYY-MM-DD") && c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id);
                                    } else {
                                        prevMonthSupplyPlan = []
                                    }
                                    var batchDetailsArray = [];
                                    if (prevMonthSupplyPlan.length > 0) {
                                        batchDetailsArray = prevMonthSupplyPlan[0].batchDetailsArray;
                                    } else {
                                        batchDetailsArray = programJsonForStoringTheResult.batchInfoList.filter(c => c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id);
                                        for (var bda = 0; bda < batchDetailsArray.length; bda++) {
                                            batchDetailsArray[bda].remainingBatchQty = 0;
                                        }
                                    }

                                    var myArray = batchDetailsArray.sort(function (a, b) { return new Date(a.expiryDate) - new Date(b.expiryDate) });
                                    var consumptionList = (programJsonForStoringTheResult.consumptionList).filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                                    var actualConsumptionQty = 0;
                                    var forecastedConsumptionQty = 0;
                                    var regionsReportingActualConsumption = [];
                                    var noOfRegionsReportingActualConsumption = 0;
                                    var totalNoOfRegions = (regionListFiltered).length;
                                    var consumptionQty = 0;
                                    var consumptionType = "";
                                    var textColor = "";
                                    var consumptionJson = {}
                                    var regionList = regionListFiltered;
                                    var unallocatedActualConsumptionQty = 0;
                                    var unallocatedForecastedConsumptionQty = 0;
                                    var unallocatedConsumptionQty = 0;
                                    var suggestedShipmentsTotalData = ""
                                    var plannedErpShipmentsTotalData = ""
                                    var orderedErpShipmentsTotalData = ""
                                    var shippedErpShipmentsTotalData = ""
                                    var deliveredErpShipmentsTotalData = ""
                                    var plannedShipmentsTotalData = ""
                                    var orderedShipmentsTotalData = ""
                                    var shippedShipmentsTotalData = ""
                                    var deliveredShipmentsTotalData = ""
                                    var minMonthsOfStock = 0;

                                    var shipmentList = (programJsonForStoringTheResult.shipmentList).filter(c => c.active == true && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
                                    var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate))
                                    var shipmentTotalQty = 0;

                                    var manualShipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate) && c.erpFlag == false);
                                    var manualTotalQty = 0;
                                    var deliveredShipmentsQty = 0;
                                    var shippedShipmentsQty = 0;
                                    var orderedShipmentsQty = 0;
                                    var plannedShipmentsQty = 0;

                                    var deliveredShipmentsDetailsArr = [];
                                    var shippedShipmentsDetailsArr = [];
                                    var orderedShipmentsDetailsArr = [];
                                    var plannedShipmentsDetailsArr = [];

                                    var erpShipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate) && c.erpFlag == true);
                                    var erpTotalQty = 0;

                                    var deliveredErpShipmentsQty = 0;
                                    var shippedErpShipmentsQty = 0;
                                    var orderedErpShipmentsQty = 0;
                                    var plannedErpShipmentsQty = 0;

                                    var deliveredErpShipmentsDetailsArr = [];
                                    var shippedErpShipmentsDetailsArr = [];
                                    var orderedErpShipmentsDetailsArr = [];
                                    var plannedErpShipmentsDetailsArr = [];
                                    var paColor = "";
                                    console.log("Prev month Qty");
                                    for (var ma = 0; ma < myArray.length; ma++) {
                                        console.log("Batch No", myArray[ma].batchNo, "Remaining batch qty", myArray[ma].remainingBatchQty);
                                    }
                                    for (var j = 0; j < shipmentArr.length; j++) {
                                        shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
                                        var batchListForShipments = shipmentArr[j].batchInfoList;
                                        console.log("Batch list for shipments", batchListForShipments);
                                        for (var b = 0; b < batchListForShipments.length; b++) {
                                            var batchNo = batchListForShipments[b].batch.batchNo;
                                            var index = myArray.findIndex(c => c.batchNo == batchNo);
                                            console.log("My Array", myArray);
                                            console.log("Index", index);
                                            myArray[index].remainingBatchQty = parseInt(myArray[index].remainingBatchQty) + batchListForShipments[b].shipmentQty;
                                            console.log("Btach No", batchNo, "B", b, "Qty", batchListForShipments[b].shipmentQty)
                                        }
                                    }
                                    console.log("Qty after shipments");
                                    for (var ma = 0; ma < myArray.length; ma++) {
                                        console.log("Batch No", myArray[ma].batchNo, "Remaining batch qty", myArray[ma].remainingBatchQty);
                                    }
                                    for (var j = 0; j < manualShipmentArr.length; j++) {
                                        manualTotalQty += parseInt((manualShipmentArr[j].shipmentQty));
                                        if (manualShipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                            if (manualShipmentArr[j].procurementAgent.id != "" && manualShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                paColor = procurementAgent.colorHtmlCode;
                                                var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                if (index == -1) {
                                                    paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                }
                                            } else {
                                                if (manualShipmentArr[j].procurementAgent.id != "") {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                } else {
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                }
                                            }
                                            deliveredShipmentsDetailsArr.push(shipmentDetail);
                                            deliveredShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                                        } else if (manualShipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                            if (manualShipmentArr[j].procurementAgent.id != "" && manualShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                paColor = procurementAgent.colorHtmlCode;
                                                var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                if (index == -1) {
                                                    paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                }
                                            } else {
                                                if (manualShipmentArr[j].procurementAgent.id != "") {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                } else {
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                }
                                            }
                                            shippedShipmentsDetailsArr.push(shipmentDetail);
                                            shippedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                                        } else if (manualShipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                            if (manualShipmentArr[j].procurementAgent.id != "" && manualShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                paColor = procurementAgent.colorHtmlCode;
                                                var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                if (index == -1) {
                                                    paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                }
                                            } else {
                                                if (manualShipmentArr[j].procurementAgent.id != "") {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                } else {
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                }
                                            }
                                            orderedShipmentsDetailsArr.push(shipmentDetail);
                                            orderedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                                        } else if (manualShipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || manualShipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                            if (manualShipmentArr[j].procurementAgent.id != "" && manualShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                paColor = procurementAgent.colorHtmlCode;
                                                var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                if (index == -1) {
                                                    paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                }
                                            } else {
                                                if (manualShipmentArr[j].procurementAgent.id != "") {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                } else {
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                }
                                            }
                                            plannedShipmentsDetailsArr.push(shipmentDetail);
                                            plannedShipmentsQty += parseInt((manualShipmentArr[j].shipmentQty));
                                        }
                                    }


                                    if ((manualShipmentArr.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (deliveredShipmentsDetailsArr.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        deliveredShipmentsTotalData = { qty: deliveredShipmentsQty, month: month, shipmentDetail: deliveredShipmentsDetailsArr, noOfShipments: deliveredShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) }
                                    } else {
                                        deliveredShipmentsTotalData = "";
                                    }

                                    if ((manualShipmentArr.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (shippedShipmentsDetailsArr.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        shippedShipmentsTotalData = { qty: shippedShipmentsQty, month: month, shipmentDetail: shippedShipmentsDetailsArr, noOfShipments: shippedShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) };
                                    } else {
                                        shippedShipmentsTotalData = "";
                                    }

                                    if ((manualShipmentArr.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (orderedShipmentsDetailsArr.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        orderedShipmentsTotalData = { qty: orderedShipmentsQty, month: month, shipmentDetail: orderedShipmentsDetailsArr, noOfShipments: orderedShipmentsDetailsArr.length, textColor: contrast(colour) }
                                    } else {
                                        orderedShipmentsTotalData = "";
                                    }

                                    if ((manualShipmentArr.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (plannedShipmentsDetailsArr.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        plannedShipmentsTotalData = { qty: plannedShipmentsQty, month: month, shipmentDetail: plannedShipmentsDetailsArr, noOfShipments: plannedShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) };
                                    } else {
                                        plannedShipmentsTotalData = "";
                                    }

                                    for (var j = 0; j < erpShipmentArr.length; j++) {
                                        erpTotalQty += parseInt((erpShipmentArr[j].shipmentQty));
                                        if (erpShipmentArr[j].shipmentStatus.id == DELIVERED_SHIPMENT_STATUS) {
                                            if (erpShipmentArr[j].procurementAgent.id != "" && erpShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                                var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                paColor = procurementAgent.colorHtmlCode;
                                                var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                if (index == -1) {
                                                    paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                }
                                            } else {
                                                if (erpShipmentArr[j].procurementAgent.id != "") {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                } else {
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                }
                                            }
                                            deliveredErpShipmentsDetailsArr.push(shipmentDetail);
                                            deliveredErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                                        } else if (erpShipmentArr[j].shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == ARRIVED_SHIPMENT_STATUS) {
                                            if (erpShipmentArr[j].procurementAgent.id != "" && erpShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                                var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                paColor = procurementAgent.colorHtmlCode;
                                                var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                if (index == -1) {
                                                    paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                }
                                            } else {
                                                if (erpShipmentArr[j].procurementAgent.id != "") {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                } else {
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                }
                                            }
                                            shippedErpShipmentsDetailsArr.push(shipmentDetail);
                                            shippedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                                        } else if (erpShipmentArr[j].shipmentStatus.id == APPROVED_SHIPMENT_STATUS) {
                                            if (erpShipmentArr[j].procurementAgent.id != "" && erpShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                                var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                paColor = procurementAgent.colorHtmlCode;
                                                var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                if (index == -1) {
                                                    paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                }
                                            } else {
                                                if (erpShipmentArr[j].procurementAgent.id != "") {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                } else {
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                }
                                            }
                                            orderedErpShipmentsDetailsArr.push(shipmentDetail);
                                            orderedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                                        } else if (erpShipmentArr[j].shipmentStatus.id == PLANNED_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || erpShipmentArr[j].shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS) {
                                            if (erpShipmentArr[j].procurementAgent.id != "" && erpShipmentArr[j].procurementAgent.id != TBD_PROCUREMENT_AGENT_ID) {
                                                var procurementAgent = papuResult.filter(c => c.procurementAgentId == erpShipmentArr[j].procurementAgent.id)[0];
                                                var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == erpShipmentArr[j].shipmentStatus.id)[0];
                                                var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                paColor = procurementAgent.colorHtmlCode;
                                                var index = paColors.findIndex(c => c.color == "#" + paColor);
                                                if (index == -1) {
                                                    paColors.push({ color: "#" + paColor, text: procurementAgent.procurementAgentCode })
                                                }
                                            } else {
                                                if (erpShipmentArr[j].procurementAgent.id != "") {
                                                    var procurementAgent = papuResult.filter(c => c.procurementAgentId == manualShipmentArr[j].procurementAgent.id)[0];
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                } else {
                                                    var shipmentStatus = shipmentStatusResult.filter(c => c.shipmentStatusId == manualShipmentArr[j].shipmentStatus.id)[0];
                                                    var shipmentDetail = { pa: procurementAgent.procurementAgentCode, qty: manualShipmentArr[j].shipmentQty, status: shipmentStatus.label };
                                                    paColor = "#efefef"
                                                }
                                            }
                                            plannedErpShipmentsDetailsArr.push(shipmentDetail);
                                            plannedErpShipmentsQty += parseInt((erpShipmentArr[j].shipmentQty));
                                        }
                                    }
                                    if ((erpShipmentArr.filter(c => c.shipmentStatus.id == DELIVERED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (deliveredErpShipmentsDetailsArr.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        deliveredErpShipmentsTotalData = { qty: deliveredErpShipmentsQty, month: month, shipmentDetail: deliveredErpShipmentsDetailsArr, noOfShipments: deliveredErpShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) };
                                    } else {
                                        deliveredErpShipmentsTotalData = "";
                                    }

                                    if ((erpShipmentArr.filter(c => c.shipmentStatus.id == SHIPPED_SHIPMENT_STATUS || c.shipmentStatus.id == ARRIVED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (shippedErpShipmentsDetailsArr.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        shippedErpShipmentsTotalData = { qty: shippedErpShipmentsQty, month: month, shipmentDetail: shippedErpShipmentsDetailsArr, noOfShipments: shippedErpShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) };
                                    } else {
                                        shippedErpShipmentsTotalData = "";
                                    }

                                    if ((erpShipmentArr.filter(c => c.shipmentStatus.id == APPROVED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (orderedErpShipmentsDetailsArr.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        orderedErpShipmentsTotalData = { qty: orderedErpShipmentsQty, month: month, shipmentDetail: orderedErpShipmentsDetailsArr, noOfShipments: orderedErpShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) };
                                    } else {
                                        orderedErpShipmentsTotalData = "";
                                    }

                                    if ((erpShipmentArr.filter(c => c.shipmentStatus.id == PLANNED_SHIPMENT_STATUS || c.shipmentStatus.id == ON_HOLD_SHIPMENT_STATUS || c.shipmentStatus.id == SUBMITTED_SHIPMENT_STATUS)).length > 0) {
                                        var colour = paColor;
                                        if (plannedErpShipmentsDetailsArr.length > 1) {
                                            colour = "#d9ead3";
                                        }
                                        plannedErpShipmentsTotalData = { qty: plannedErpShipmentsQty, month: month, shipmentDetail: plannedErpShipmentsDetailsArr, noOfShipments: plannedErpShipmentsDetailsArr.length, colour: colour, textColor: contrast(colour) }
                                    } else {
                                        plannedErpShipmentsTotalData = "";
                                    }
                                    for (var c = 0; c < consumptionList.length; c++) {
                                        if (consumptionList[c].actualFlag.toString() == "true") {
                                            actualConsumptionQty += parseInt(consumptionList[c].consumptionQty);
                                            var index = regionsReportingActualConsumption.findIndex(f => f == consumptionList[c].region.id);
                                            if (index == -1) {
                                                regionsReportingActualConsumption.push(consumptionList[c].region.id);
                                            }
                                            var batchListForConsumption = consumptionList[c].batchInfoList;
                                            console.log("Batch list consumption", batchListForConsumption);
                                            for (var b = 0; b < batchListForConsumption.length; b++) {
                                                var batchNo = batchListForConsumption[b].batch.batchNo;
                                                var index = myArray.findIndex(c => c.batchNo == batchNo);
                                                myArray[index].remainingBatchQty = myArray[index].remainingBatchQty - parseInt(parseInt(batchListForConsumption[b].consumptionQty) * parseInt(consumptionList[c].multiplier));
                                                console.log("Btach No", batchNo, "Qty", parseInt(parseInt(batchListForConsumption[b].consumptionQty) * parseInt(consumptionList[c].multiplier)))
                                            }
                                            var qty = 0;
                                            if (batchListForConsumption.length > 0) {
                                                for (var a = 0; a < batchListForConsumption.length; a++) {
                                                    qty += parseInt((batchListForConsumption)[a].consumptionQty) * parseInt(consumptionList[c].multiplier);
                                                }
                                            }
                                            var remainingQty = parseInt(parseInt(parseInt(consumptionList[c].consumptionQty))) - parseInt(qty);
                                            unallocatedActualConsumptionQty += parseInt(remainingQty);
                                        } else {
                                            forecastedConsumptionQty += parseInt(consumptionList[c].consumptionQty);
                                            unallocatedForecastedConsumptionQty += parseInt(consumptionList[c].consumptionQty);
                                        }
                                    }
                                    noOfRegionsReportingActualConsumption = regionsReportingActualConsumption.length;
                                    if (consumptionList.length == 0) {
                                        consumptionQty = "";
                                        consumptionType = ACTUAL_CONSUMPTION_TYPE;
                                        textColor = "#000000";
                                        unallocatedConsumptionQty = 0;
                                    } else if ((totalNoOfRegions == noOfRegionsReportingActualConsumption) || (actualConsumptionQty >= forecastedConsumptionQty)) {
                                        consumptionQty = actualConsumptionQty;
                                        consumptionType = ACTUAL_CONSUMPTION_TYPE;
                                        textColor = "#000000";
                                        unallocatedConsumptionQty = unallocatedActualConsumptionQty;
                                    } else {
                                        consumptionQty = forecastedConsumptionQty;
                                        consumptionType = FORCASTED_CONSUMPTION_TYPE;
                                        textColor = "rgb(170, 85, 161)";
                                        unallocatedConsumptionQty = unallocatedForecastedConsumptionQty;
                                    }
                                    consumptionJson = {
                                        consumptionQty: consumptionQty,
                                        consumptionType: consumptionType,
                                        textColor: textColor
                                    }
                                    console.log("Qty after consumption");



                                    for (var ma = 0; ma < myArray.length; ma++) {
                                        console.log("Batch No", myArray[ma].batchNo, "Remaining batch qty", myArray[ma].remainingBatchQty);
                                    }
                                    var inventoryList = (programJsonForStoringTheResult.inventoryList).filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                                    var actualStockCount = 0;
                                    var adjustmentQty = 0;
                                    var unallocatedActualStockQty = 0;
                                    var unallocatedAdjustmentQty = 0;
                                    var regionsReportingActualInventory = 0;
                                    for (var r = 0; r < totalNoOfRegions; r++) {
                                        var inventoryListForRegion = inventoryList.filter(c => c.region != null && c.region.id == regionList[r].id);
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
                                                    myArray[index].remainingBatchQty = parseInt(parseInt(batchListForInventory[b].actualQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                                    console.log("Btach No", batchNo, "Qty", parseInt(parseInt(batchListForInventory[b].actualQty) * parseInt(inventoryListForRegion[inv].multiplier)))
                                                }

                                                var qty = 0;
                                                if (batchListForInventory.length > 0) {
                                                    for (var a = 0; a < batchListForInventory.length; a++) {
                                                        qty += parseInt((batchListForInventory)[a].actualQty) * parseInt(inventoryListForRegion[inv].multiplier);
                                                    }
                                                }
                                                var remainingQty = parseInt(parseInt(parseInt(inventoryListForRegion[inv].actualQty) * parseInt(inventoryListForRegion[inv].multiplier))) - parseInt(qty);
                                                unallocatedActualStockQty += parseInt(remainingQty);
                                            } else {
                                                if (inventoryListForRegion[inv].adjustmentQty != "" && inventoryListForRegion[inv].adjustmentQty != null && inventoryListForRegion[inv].adjustmentQty != 0) {
                                                    adjustmentQty += parseInt(parseInt(inventoryListForRegion[inv].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier));
                                                }
                                                var batchListForInventory = inventoryListForRegion[inv].batchInfoList;
                                                console.log("Btach list adjustments", batchListForInventory);
                                                for (var b = 0; b < batchListForInventory.length; b++) {
                                                    var batchNo = batchListForInventory[b].batch.batchNo;
                                                    var index = myArray.findIndex(c => c.batchNo == batchNo);
                                                    myArray[index].remainingBatchQty = myArray[index].remainingBatchQty + parseInt(parseInt(batchListForInventory[b].adjustmentQty) * parseInt(inventoryListForRegion[inv].multiplier));
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
                                            }
                                        }
                                    }
                                    var nationalAdjustment = 0;
                                    console.log("regionsReportingActualInventory", regionsReportingActualInventory, "totalNoOfRegions", totalNoOfRegions, "actualStockCount", actualStockCount);
                                    if (regionsReportingActualInventory == totalNoOfRegions && actualStockCount > 0) {
                                        // Calculations for auto adjustments
                                        var ob = 0;
                                        if (prevMonthSupplyPlan.length > 0) {
                                            ob = prevMonthSupplyPlan[0].closingBalance;
                                        } else {
                                            ob = 0;
                                        }
                                        var cb = parseInt(ob) - (consumptionQty != "" ? parseInt(consumptionQty) : 0) + parseInt(shipmentTotalQty);
                                        console.log("Cb-------------------->", cb);
                                        nationalAdjustment = parseInt(actualStockCount) - parseInt(cb);
                                        console.log("nation adjustments", nationalAdjustment);
                                    }
                                    var autoAdjustments = 0;
                                    adjustmentQty += nationalAdjustment;
                                    autoAdjustments += nationalAdjustment;
                                    unallocatedAdjustmentQty += nationalAdjustment;
                                    if (regionsReportingActualInventory == totalNoOfRegions && actualStockCount > 0) {

                                    } else {
                                        autoAdjustments = "";
                                    }
                                    console.log("Auto adjutsments", autoAdjustments);
                                    // Pushing national adjutsments to inventory data
                                    if (nationalAdjustment != 0) {
                                        var nationAdjustmentIndex = inventoryListForNationalAdjustments.findIndex(c => c.region == null && moment(c.inventoryDate).format("YYYY-MM") == moment(endDate).format("YYYY-MM") && c.planningUnit.idd == programPlanningUnitList[ppL].planningUnit.id);
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
                                    // Accounting unallocated batchs
                                    myArray = myArray.sort(function (a, b) { return new Date(a.expiryDate) - new Date(b.expiryDate) })
                                    var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) > (moment(startDate).format("YYYY-MM-DD"))));
                                    if (unallocatedAdjustmentQty > 0) {
                                        if (batchDetailsForParticularPeriod.length > 0) {
                                            console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                                            console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                            batchDetailsForParticularPeriod[0].remainingBatchQty = batchDetailsForParticularPeriod[0].remainingBatchQty + unallocatedAdjustmentQty;
                                            unallocatedAdjustmentQty = 0;
                                        }
                                    }

                                    var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) > (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
                                    if (unallocatedAdjustmentQty < 0) {
                                        for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                                            console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                                            console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                                            var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
                                            if (parseInt(batchDetailsForParticularPeriod[ua - 1].remainingBatchQty) + parseInt(unallocatedAdjustmentQty) > 0) {
                                                myArray[index].remainingBatchQty = parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
                                                unallocatedAdjustmentQty = 0
                                            } else {
                                                var rq = batchDetailsForParticularPeriod[ua - 1].remainingBatchQty;
                                                myArray[index].remainingBatchQty = 0;
                                                unallocatedAdjustmentQty = parseInt(unallocatedAdjustmentQty) + parseInt(rq);
                                            }
                                        }
                                    }
                                    batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) > (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));

                                    for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
                                        console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua].batchNo);
                                        console.log("Unallocated consumption", unallocatedConsumptionQty);
                                        var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua].batchNo);
                                        if (parseInt(batchDetailsForParticularPeriod[ua].remainingBatchQty) >= parseInt(unallocatedConsumptionQty)) {
                                            myArray[index].remainingBatchQty = parseInt(batchDetailsForParticularPeriod[ua].remainingBatchQty) - parseInt(unallocatedConsumptionQty);
                                            unallocatedConsumptionQty = 0
                                        } else {
                                            var rq = batchDetailsForParticularPeriod[ua].remainingBatchQty;
                                            myArray[index].remainingBatchQty = 0;
                                            unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) - parseInt(rq);
                                        }
                                    }

                                    var expiredStockCount = 0;
                                    var expiredStockArr = batchDetailsArray.filter(c => c.expiryDate >= startDate && c.expiryDate <= endDate);
                                    for (var e = 0; e < expiredStockArr.length; e++) {
                                        expiredStockCount += parseInt(expiredStockArr[e].remainingBatchQty);
                                    }
                                    expiredStockArr = { qty: expiredStockCount, details: expiredStockArr, month }
                                    var batchDetailsArray = myArray;
                                    var openingBalance = 0;
                                    var closingBalance = 0;
                                    var unmetDemandQty = "";
                                    if (prevMonthSupplyPlan.length > 0) {
                                        openingBalance = prevMonthSupplyPlan[0].closingBalance;
                                    } else {
                                        openingBalance = 0;
                                    }
                                    closingBalance = parseInt(openingBalance) - (consumptionQty != "" ? parseInt(consumptionQty) : 0) + (adjustmentQty != "" ? parseInt(adjustmentQty) : 0) + parseInt(shipmentTotalQty) - parseInt(expiredStockCount);
                                    if (closingBalance < 0) {
                                        unmetDemandQty = closingBalance;
                                        closingBalance = 0;

                                    }

                                    // Calculations for Min stock
                                    var maxForMonths = 0;
                                    var realm = programJsonForStoringTheResult.realmCountry.realm;
                                    var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                                    if (DEFAULT_MIN_MONTHS_OF_STOCK > minMonthsOfStock) {
                                        maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                                    } else {
                                        maxForMonths = minMonthsOfStock
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


                                    var amcTotal = 0;
                                    var totalMonths = 0;
                                    for (var ap = 1; ap <= programPlanningUnitList[ppL].monthsInPastForAmc; ap++) {
                                        var amcDate = moment(startDate).subtract(ap, 'months').startOf('month').format("YYYY-MM-DD");
                                        var amcFilter = supplyPlanData.filter(c => moment(c.startDate).format("YYYY-MM-DD") == moment(amcDate).format("YYYY-MM-DD") && c.planningUnitId == programPlanningUnitList[ppL].planningUnit.id);
                                        if (amcFilter.length > 0) {
                                            amcTotal += (amcFilter[0].consumptionJson.consumptionQty != "" ? parseInt(amcFilter[0].consumptionJson.consumptionQty) : 0);
                                            if (amcFilter[0].consumptionJson.consumptionQty != "") {
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
                                    var amc = Math.ceil((parseInt(amcTotal) / parseInt(totalMonths)));
                                    var mos = "";
                                    if (closingBalance != 0) {
                                        mos = parseFloat(closingBalance / amc).toFixed(2);
                                    }

                                    var minStock = parseInt(amc) * parseInt(minStockMoSQty);
                                    var maxStock = parseInt(amc) * parseInt(maxStockMoSQty);

                                    var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
                                    var compare = (createdDate >= currentMonth);
                                    var stockInHand = closingBalance;
                                    if (compare && parseInt(stockInHand) <= parseInt(minStock)) {
                                        var suggestedOrd = parseInt(maxStock - minStock);
                                        if (suggestedOrd == 0) {
                                            var addLeadTimes = parseFloat(programJsonForStoringTheResult.plannedToSubmittedLeadTime) + parseFloat(programJsonForStoringTheResult.submittedToApprovedLeadTime) +
                                                parseFloat(programJsonForStoringTheResult.approvedToShippedLeadTime) + parseFloat(programJsonForStoringTheResult.shippedToArrivedBySeaLeadTime) +
                                                parseFloat(programJsonForStoringTheResult.arrivedToDeliveredLeadTime);
                                            var expectedDeliveryDate = moment(createdDate).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                            var isEmergencyOrder = 0;
                                            if (expectedDeliveryDate >= currentMonth) {
                                                isEmergencyOrder = 0;
                                            } else {
                                                isEmergencyOrder = 1;
                                            }
                                            suggestedShipmentsTotalData = { "suggestedOrderQty": "", "month": startDate, "isEmergencyOrder": isEmergencyOrder };
                                        } else {
                                            var addLeadTimes = parseFloat(programJsonForStoringTheResult.plannedToSubmittedLeadTime) + parseFloat(programJsonForStoringTheResult.submittedToApprovedLeadTime) +
                                                parseFloat(programJsonForStoringTheResult.approvedToShippedLeadTime) + parseFloat(programJsonForStoringTheResult.shippedToArrivedBySeaLeadTime) +
                                                parseFloat(programJsonForStoringTheResult.arrivedToDeliveredLeadTime);
                                            var expectedDeliveryDate = moment(createdDate).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                            var isEmergencyOrder = 0;
                                            if (expectedDeliveryDate >= currentMonth) {
                                                isEmergencyOrder = 0;
                                            } else {
                                                isEmergencyOrder = 1;
                                            }
                                            suggestedShipmentsTotalData = { "suggestedOrderQty": suggestedOrd, "month": startDate, "isEmergencyOrder": isEmergencyOrder };
                                        }
                                    } else {
                                        var addLeadTimes = parseFloat(programJsonForStoringTheResult.plannedToSubmittedLeadTime) + parseFloat(programJsonForStoringTheResult.submittedToApprovedLeadTime) +
                                            parseFloat(programJsonForStoringTheResult.approvedToShippedLeadTime) + parseFloat(programJsonForStoringTheResult.shippedToArrivedBySeaLeadTime) +
                                            parseFloat(programJsonForStoringTheResult.arrivedToDeliveredLeadTime);
                                        var expectedDeliveryDate = moment(createdDate).subtract(parseInt(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
                                        var isEmergencyOrder = 0;
                                        if (expectedDeliveryDate >= currentMonth) {
                                            isEmergencyOrder = 0;
                                        } else {
                                            isEmergencyOrder = 1;
                                        }
                                        suggestedShipmentsTotalData = { "suggestedOrderQty": "", "month": startDate, "isEmergencyOrder": isEmergencyOrder };
                                    }
                                    console.log("Adjustment qty", adjustmentQty);
                                    console.log("Actual stock count", actualStockCount);
                                    var consumptionListForRegion = (programJsonForStoringTheResult.consumptionList).filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                                    var inventoryListForRegion = (programJsonForStoringTheResult.inventoryList).filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true);
                                    var consumptionTotalForRegion = 0;
                                    var consumptionArrayForRegion = [];
                                    var totalAdjustmentsQtyForRegion = 0;
                                    var totalActualQtyForRegion = 0;
                                    var projectedInventoryForRegion = 0;
                                    var inventoryArrayForRegion = [];
                                    var regionsReportingActualInventory = [];
                                    for (var r = 0; r < totalNoOfRegions; r++) {
                                        var consumptionQtyForRegion = 0;
                                        var actualFlagForRegion = "";
                                        var consumptionListForRegionalDetails = consumptionListForRegion.filter(c => c.region.id == regionListFiltered[r].id);

                                        var noOfActualEntries = (consumptionListForRegionalDetails.filter(c => c.actualFlag.toString() == "true")).length;
                                        for (var cr = 0; cr < consumptionListForRegionalDetails.length; cr++) {
                                            if (noOfActualEntries > 0) {
                                                if (consumptionListForRegionalDetails[cr].actualFlag.toString() == "true") {
                                                    consumptionQtyForRegion += parseInt(consumptionListForRegionalDetails[cr].consumptionQty);
                                                    consumptionTotalForRegion += parseInt(consumptionListForRegionalDetails[cr].consumptionQty);
                                                }
                                                actualFlagForRegion = true;
                                            } else {
                                                consumptionQtyForRegion += parseInt(consumptionListForRegionalDetails[cr].consumptionQty);
                                                consumptionTotalForRegion += parseInt(consumptionListForRegionalDetails[cr].consumptionQty);
                                                actualFlagForRegion = false;
                                            }
                                        }
                                        if (consumptionListForRegionalDetails.length == 0) {
                                            consumptionQtyForRegion = "";
                                        }
                                        consumptionArrayForRegion.push({ "regionId": regionListFiltered[r].id, "qty": consumptionQtyForRegion, "actualFlag": actualFlagForRegion, "month": month })

                                        var adjustmentsQtyForRegion = 0;
                                        var actualQtyForRegion = 0;
                                        var inventoryListForRegionalDetails = inventoryListForRegion.filter(c => c.region != null && c.region.id == regionListFiltered[r].id);
                                        var actualCount = 0;
                                        var adjustmentsCount = 0;
                                        for (var cr = 0; cr < inventoryListForRegionalDetails.length; cr++) {
                                            if (inventoryListForRegionalDetails[cr].actualQty != 0 && inventoryListForRegionalDetails[cr].actualQty != null && inventoryListForRegionalDetails[cr].actualQty != "") {
                                                actualCount += 1;
                                                actualQtyForRegion += parseInt(inventoryListForRegionalDetails[cr].actualQty) * parseInt(inventoryListForRegionalDetails[cr].multiplier);
                                                totalActualQtyForRegion += parseInt(inventoryListForRegionalDetails[cr].actualQty) * parseInt(inventoryListForRegionalDetails[cr].multiplier);
                                                var index = regionsReportingActualInventory.findIndex(c => c == regionListFiltered[r].id);
                                                if (index == -1) {
                                                    regionsReportingActualInventory.push(regionListFiltered[r].id)
                                                }
                                            }
                                            if (inventoryListForRegionalDetails[cr].adjustmentQty != 0 && inventoryListForRegionalDetails[cr].adjustmentQty != null && inventoryListForRegionalDetails[cr].adjustmentQty != "") {
                                                adjustmentsCount += 1;
                                                adjustmentsQtyForRegion += parseInt(inventoryListForRegionalDetails[cr].adjustmentQty) * parseInt(inventoryListForRegionalDetails[cr].multiplier);
                                                totalAdjustmentsQtyForRegion += parseInt(inventoryListForRegionalDetails[cr].adjustmentQty) * parseInt(inventoryListForRegionalDetails[cr].multiplier);
                                            }
                                        }
                                        if (actualCount == 0) {
                                            actualQtyForRegion = "";
                                        }
                                        if (adjustmentsCount == 0) {
                                            adjustmentsQtyForRegion = "";
                                        }
                                        inventoryArrayForRegion.push({ "regionId": regionListFiltered[r].id, "adjustmentsQty": adjustmentsQtyForRegion, "actualQty": actualQtyForRegion, "month": month })
                                    }
                                    consumptionArrayForRegion.push({ "regionId": -1, "qty": consumptionTotalForRegion, "actualFlag": true, "month": month })

                                    console.log("closingBalance", closingBalance);
                                    console.log("auto adjustments", autoAdjustments);
                                    var projectedInventoryForRegion = closingBalance - (autoAdjustments != "" ? autoAdjustments : 0);
                                    console.log("project Inventory", projectedInventoryForRegion);
                                    if (regionsReportingActualInventory.length != totalNoOfRegions) {
                                        totalActualQtyForRegion = i18n.t('static.supplyPlan.notAllRegionsHaveActualStock');
                                    }
                                    inventoryArrayForRegion.push({ "regionId": -1, "adjustmentsQty": totalAdjustmentsQtyForRegion, "actualQty": totalActualQtyForRegion, "finalInventory": closingBalance, "autoAdjustments": autoAdjustments, "projectedInventory": projectedInventoryForRegion, "month": month })
                                    var lastActualConsumptionDate = [];
                                    for (var r = 0; r < totalNoOfRegions; r++) {
                                        var consumptionListForRegion = (programJsonForStoringTheResult.consumptionList).filter(c => c.planningUnit.id == programPlanningUnitList[ppL].planningUnit.id && c.active == true && c.actualFlag.toString() == "true");
                                        let conmax = moment.max(consumptionListForRegion.map(d => moment(d.consumptionDate)))
                                        lastActualConsumptionDate.push({ lastActualConsumptionDate: conmax, region: regionListFiltered[r].id });
                                    }
                                    var json = {
                                        programId: programJsonForStoringTheResult.programId,
                                        versionId: programJsonForStoringTheResult.currentVersion.versionId,
                                        planningUnitId: programPlanningUnitList[ppL].planningUnit.id,
                                        startDate: month.startDate,
                                        consumptionJson: consumptionJson,
                                        shipmentTotalQty: shipmentTotalQty,
                                        manualTotalQty: manualTotalQty,
                                        deliveredShipmentsTotalData: deliveredShipmentsTotalData,
                                        shippedShipmentsTotalData: shippedShipmentsTotalData,
                                        orderedShipmentsTotalData: orderedShipmentsTotalData,
                                        plannedShipmentsTotalData: plannedShipmentsTotalData,
                                        erpTotalQty: erpTotalQty,
                                        deliveredErpShipmentsTotalData: deliveredErpShipmentsTotalData,
                                        shippedErpShipmentsTotalData: shippedErpShipmentsTotalData,
                                        orderedErpShipmentsTotalData: orderedErpShipmentsTotalData,
                                        plannedErpShipmentsTotalData: plannedErpShipmentsTotalData,
                                        actualStockCount: actualStockCount,
                                        adjustmentQty: adjustmentQty,
                                        amc: amc,
                                        minStock: minStock,
                                        minStockMoS: minStockMoSQty,
                                        maxStock: maxStock,
                                        maxStockMoS: maxStockMoSQty,
                                        batchDetailsArray: batchDetailsArray,
                                        expiredStockCount: expiredStockCount,
                                        expiredStockArr: expiredStockArr,
                                        unmetDemand: unmetDemandQty,
                                        openingBalance: openingBalance,
                                        closingBalance: closingBalance,
                                        mos: mos,
                                        suggestedShipmentsTotalData: suggestedShipmentsTotalData,
                                        consumptionArrayForRegion: consumptionArrayForRegion,
                                        inventoryArrayForRegion: inventoryArrayForRegion,
                                        lastActualConsumptionDate: lastActualConsumptionDate,
                                        paColors: paColors
                                    }
                                    supplyPlanData.push(json);
                                }
                            }
                            programJsonForStoringTheResult.supplyPlanData = supplyPlanData;
                            programJsonForStoringTheResult.inventoryList = inventoryListForNationalAdjustments;
                            programRequest.result.programData = (CryptoJS.AES.encrypt(JSON.stringify(programJsonForStoringTheResult), SECRET_KEY)).toString();
                            var programDataTransaction = db1.transaction([objectStoreName], 'readwrite');
                            var programDataOs = programDataTransaction.objectStore(objectStoreName);
                            var putRequest = programDataOs.put(programRequest.result);
                            putRequest.onerror = function (event) {
                            }.bind(this);
                            putRequest.onsuccess = function (event) {
                                console.log("Time taken",performance.now())
                                if (page == "consumption") {
                                    console.log("After save")
                                    props.updateState("message", i18n.t('static.message.consumptionSaved'));
                                    props.updateState("color", 'green');
                                    props.updateState("consumptionChangedFlag", 0);
                                    console.log("after update state")
                                    if (props.consumptionPage != "consumptionDataEntry") {
                                        props.toggleLarge('Consumption');
                                    }
                                    if (props.consumptionPage != "consumptionDataEntry") {
                                        if (props.consumptionPage != "supplyPlanCompare") {
                                            props.formSubmit(props.items.planningUnit, props.items.monthCount);
                                        } else {
                                            props.formSubmit(props.items.monthCount);
                                        }

                                    }
                                    console.log("Start date", new Date());
                                } else if (page == "inventory") {
                                    console.log("After save")
                                    // this.showInventoryData();
                                    props.updateState("message", i18n.t('static.message.adjustmentsSaved'));
                                    props.updateState("color", 'green');
                                    props.updateState("inventoryChangedFlag", 0);
                                    console.log("after update state")
                                    if (props.inventoryPage != "inventoryDataEntry") {
                                        props.toggleLarge('Adjustments');
                                    }
                                    if (props.inventoryPage != "inventoryDataEntry") {
                                        if (props.inventoryPage != "supplyPlanCompare") {
                                            props.formSubmit(props.items.planningUnit, props.items.monthCount);
                                        } else {
                                            props.formSubmit(props.items.monthCount);
                                        }
                                    }
                                } else if (page == "shipment") {
                                    if (props.shipmentPage != "shipmentDataEntry") {
                                        props.toggleLarge('shipments');
                                    }
                                    props.updateState("message", i18n.t('static.message.shipmentsSaved'));
                                    props.updateState("color", 'green');
                                    props.updateState("shipmentChangedFlag", 0);
                                    props.updateState("budgetChangedFlag", 0);
                                    props.updateState("shipmentsEl", "");
                                    if (props.shipmentPage != "shipmentDataEntry") {
                                        if (props.shipmentPage != "supplyPlanCompare") {
                                            props.formSubmit(props.items.planningUnit, props.items.monthCount);
                                        } else {
                                            props.formSubmit(props.items.monthCount);
                                        }
                                    }
                                } else if (page == "whatIf") {
                                    props.formSubmit(props.state.planningUnit, props.state.monthCount);
                                } else if (page == "supplyPlan") {
                                    props.formSubmit(props.state.planningUnit, props.state.monthCount);
                                } else if (page == "supplyPlanCompare") {
                                    props.formSubmit(props.state.monthCount);
                                } else if (page == "whatIfFormSubmit") {
                                    props.formSubmit(props.state.planningUnit, props.state.monthCount);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}