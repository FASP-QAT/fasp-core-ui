import { generateRandomAplhaNumericCode, paddingZero } from "../../CommonComponent/JavascriptCommonFunctions";
import { NONE_SELECTED_DATA_SOURCE_ID, TBD_FUNDING_SOURCE, SECRET_KEY, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS, FIRST_DATA_ENTRY_DATE, TBD_PROCUREMENT_AGENT_ID, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, INDEXED_DB_NAME, INDEXED_DB_VERSION, QAT_DATA_SOURCE_ID, NOTES_FOR_QAT_ADJUSTMENTS, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, BATCH_PREFIX } from "../../Constants";
import moment from "moment";
import i18n from '../../i18n';
import AuthenticationService from "../Common/AuthenticationService";
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations';
import CryptoJS from 'crypto-js'
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";

export function convertSuggestedShipmentsIntoPlannedShipments(startDate, stopDate, programJson, generalProgramJson, props, planningUnitId, programPlanningUnitList, regionList, programIdParam, programJsonForStoringTheResult, programDataJson, programRequest) {
    props.updateState("scenarioId", '');
    var curDate = moment(startDate).format("YYYY-MM-DD");
    var startDate1 = moment(startDate).format("YYYY-MM-DD");
    for (var s = 0; moment(curDate).format("YYYY-MM") <= moment(stopDate).add(-1, 'months').format("YYYY-MM"); s++) {
        var supplyPlanData = programJson.supplyPlan;
        console.log("SupplyPlanData MohitPooja", supplyPlanData)
        curDate = moment(startDate1).add(s, 'months').format("YYYY-MM-DD");
        var jsonList = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(curDate).format("YYYY-MM-DD"));
        console.log("CurDateFirstForLoop MohitPooja", curDate);
        var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
        var compare = (curDate >= currentMonth);
        // var stockInHand = jsonList[0].closingBalance;
        var supplyPlanData = programJson.supplyPlan;
        var shipmentList = programJson.shipmentList;
        var amc = Math.round(Number(jsonList[0].amc));
        var spd1 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(curDate).format("YYYY-MM"));
        var spd2 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(curDate).add(1, 'months').format("YYYY-MM"));
        var spd3 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(curDate).add(2, 'months').format("YYYY-MM"));
        var mosForMonth1 = spd1.length > 0 ? spd1[0].mos : 0;
        var mosForMonth2 = spd2.length > 0 ? spd2[0].mos : 0;
        var mosForMonth3 = spd3.length > 0 ? spd3[0].mos : 0;

        var suggestShipment = false;
        var useMax = false;
        if (compare) {
            if (Number(amc) == 0) {
                suggestShipment = false;
            } else if (Number(mosForMonth1) != 0 && Number(mosForMonth1) < Number(props.state.minStockMoSQty) && (Number(mosForMonth2) > Number(props.state.minStockMoSQty) || Number(mosForMonth3) > Number(props.state.minStockMoSQty))) {
                suggestShipment = false;
            } else if (Number(mosForMonth1) != 0 && Number(mosForMonth1) < Number(props.state.minStockMoSQty) && Number(mosForMonth2) < Number(props.state.minStockMoSQty) && Number(mosForMonth3) < Number(props.state.minStockMoSQty)) {
                suggestShipment = true;
                useMax = true;
            } else if (Number(mosForMonth1) == 0) {
                suggestShipment = true;
                if (Number(mosForMonth2) < Number(props.state.minStockMoSQty) && Number(mosForMonth3) < Number(props.state.minStockMoSQty)) {
                    useMax = true;
                } else {
                    useMax = false;
                }
            }
        } else {
            suggestShipment = false;
        }
        var addLeadTimes = parseFloat(generalProgramJson.plannedToSubmittedLeadTime) + parseFloat(generalProgramJson.submittedToApprovedLeadTime) +
            parseFloat(generalProgramJson.approvedToShippedLeadTime) + parseFloat(generalProgramJson.shippedToArrivedBySeaLeadTime) +
            parseFloat(generalProgramJson.arrivedToDeliveredLeadTime);
        var expectedDeliveryDate = moment(curDate).subtract(Number(addLeadTimes * 30), 'days').format("YYYY-MM-DD");
        var isEmergencyOrder = false;
        if (expectedDeliveryDate >= currentMonth) {
            isEmergencyOrder = false;
        } else {
            isEmergencyOrder = true;
        }
        if (suggestShipment) {
            var suggestedOrd = 0;
            if (useMax) {
                suggestedOrd = Number((amc * Number(props.state.maxStockMoSQty)) - Number(jsonList[0].closingBalance) + Number(jsonList[0].unmetDemand));
            } else {
                suggestedOrd = Number((amc * Number(props.state.minStockMoSQty)) - Number(jsonList[0].closingBalance) + Number(jsonList[0].unmetDemand));
            }
            if (suggestedOrd <= 0) {
            } else {
                //Create a shipment 
                // -> Need to make this dynamic
                var pa = props.state.procurementAgentListForWhatIf.filter(c => c.procurementAgentId == props.state.procurementAgentIdSingle)[0];
                var programPlanningUnit = ((props.state.programPlanningUnitList).filter(p => p.planningUnit.id == planningUnitId))[0];
                var programPriceList = programPlanningUnit.programPlanningUnitProcurementAgentPrices.filter(c => c.program.id == programId && c.procurementAgent.id == props.state.procurementAgentIdSingle && c.planningUnit.id == planningUnitId && c.active);
                var pricePerUnit=0;
                if (programPriceList.length > 0) {
                    pricePerUnit = Number(programPriceList[0].price);
                } else {
                    var procurementAgentPlanningUnit = props.state.procurementAgentPlanningUnitForWhatIf.filter(c => c.procurementAgent.id == props.state.procurementAgentIdSingle && c.planningUnit.id == planningUnitId && c.active);
                    if (procurementAgentPlanningUnit.length > 0) {
                        pricePerUnit = Number(procurementAgentPlanningUnit[0].catalogPrice);
                    } else {
                        pricePerUnit = programPlanningUnit.catalogPrice
                    }
                }
                // var conversionRateToUsd = Number((this.state.currencyListAll.filter(c => c.currencyId == rowData[14])[0]).conversionRateToUsd);
                pricePerUnit = Number(pricePerUnit / 1).toFixed(2);
                var rate = pricePerUnit;
                var productCost=Number(Number(rate) * Number(suggestedOrd)).toFixed(2);
                var seaFreightPercentage = generalProgramJson.seaFreightPerc;
                var freightCost = Number(productCost) * (Number(Number(seaFreightPercentage) / 100));
                var b = props.state.budgetListForWhatIf.filter(c => c.budgetId == props.state.budgetIdSingle)[0];
                var c = (props.state.currencyListForWhatIf.filter(c => c.currencyId == 1)[0]);
                var fs = props.state.fundingSourceListForWhatIf.filter(c => c.fundingSourceId == props.state.fundingSourceIdSingle)[0];
                var curDate1 = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                var curUser = AuthenticationService.getLoggedInUserId();
                var username = AuthenticationService.getLoggedInUsername();

                var shipmentJson = {
                    accountFlag: true,
                    active: true,
                    dataSource: {
                        id: NONE_SELECTED_DATA_SOURCE_ID,
                        label: (props.state.dataSourceListAll).filter(c => c.dataSourceId == NONE_SELECTED_DATA_SOURCE_ID)[0].label
                    },
                    erpFlag: false,
                    localProcurement: false,
                    notes: "",
                    planningUnit: {
                        id: planningUnitId,
                        label: (props.state.planningUnitListAll.filter(c => c.planningUnit.id == planningUnitId)[0]).planningUnit.label
                    },
                    procurementAgent: {
                        id: pa.procurementAgentId,
                        code: pa.procurementAgentCode,
                        label: pa.label
                    },
                    rate: rate,//Single
                    productCost: productCost,//Multiplication
                    freightCost: freightCost,
                    budget: {
                        id: props.state.budgetIdSingle == "undefined" || props.state.budgetIdSingle == undefined || props.state.budgetIdSingle == "" ? '' : b.budgetId,
                        code: props.state.budgetIdSingle == "undefined" || props.state.budgetIdSingle == undefined || props.state.budgetIdSingle == "" ? '' : b.budgetCode,
                        label: props.state.budgetIdSingle == "undefined" || props.state.budgetIdSingle == undefined || props.state.budgetIdSingle == "" ? {} : b.label,
                    },
                    shipmentQty: suggestedOrd,
                    shipmentId: 0,
                    shipmentMode: "Sea",
                    shipmentStatus: {
                        id: PLANNED_SHIPMENT_STATUS,
                        label: (props.state.shipmentStatusListForWhatIf).filter(c => c.shipmentStatusId == PLANNED_SHIPMENT_STATUS)[0].label
                    },
                    suggestedQty: suggestedOrd,
                    emergencyOrder: isEmergencyOrder,
                    currency: c,
                    fundingSource: {
                        id: fs.fundingSourceId,
                        code: fs.fundingSourceCode,
                        label: fs.label
                    },
                    plannedDate: null,
                    submittedDate: null,
                    approvedDate: null,
                    shippedDate: null,
                    arrivedDate: null,
                    expectedDeliveryDate: curDate,
                    receivedDate: null,
                    index: shipmentList.length,
                    batchInfoList: [],
                    orderNo: "",
                    createdBy: {
                        userId: curUser,
                        username: username
                    },
                    createdDate: curDate1,
                    lastModifiedBy: {
                        userId: curUser,
                        username: username
                    },
                    lastModifiedDate: curDate1,
                    isAddedViaScenario:true
                }
                console.log("SHipmentList MohitPooja",shipmentJson)
                // -> Need to make this dynamic till here
                // if (shipmentStatusId == DELIVERED_SHIPMENT_STATUS) {
                // var shipmentBatchInfoList = map.get("25");
                var expectedDeliveryDate = moment(curDate).format("YYYY-MM-DD");
                var createdDate = expectedDeliveryDate;
                // if (shipmentDatesJson.receivedDate != "" && shipmentDatesJson.receivedDate != null && shipmentDatesJson.receivedDate != undefined && shipmentDatesJson.receivedDate != "Invalid date") {
                //     createdDate = moment(shipmentDatesJson.receivedDate).format("YYYY-MM-DD");
                // }
                // if (shipmentBatchInfoList == "" && shipmentBatchInfoList.length == 0) {
                var programId = (programIdParam).split("_")[0];
                var planningUnitId = planningUnitId;
                var batchNo = (BATCH_PREFIX).concat(paddingZero(programId, 0, 6)).concat(paddingZero(planningUnitId, 0, 8)).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                var expiryDate = moment(curDate != "" && curDate != null && curDate != "Invalid date" ? curDate : curDate).add(programPlanningUnitList.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                // if (shipmentDatesJson.receivedDate != "" && shipmentDatesJson.receivedDate != null && shipmentDatesJson.receivedDate != undefined && shipmentDatesJson.receivedDate != "Invalid date") {
                //     expiryDate = moment(shipmentDatesJson.receivedDate).add(this.props.items.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
                // }
                var batchInfoJson = {
                    shipmentTransBatchInfoId: 0,
                    batch: {
                        batchNo: batchNo,
                        expiryDate: expiryDate,
                        batchId: 0,
                        autoGenerated: true,
                        createdDate: createdDate
                    },
                    shipmentQty: suggestedOrd
                }
                var batchArr = [];
                batchArr.push(batchInfoJson);
                shipmentJson.batchInfoList = batchArr;
                var batchInfoList = programJson.batchInfoList;

                var batchDetails = {
                    batchId: 0,
                    batchNo: batchNo,
                    planningUnitId: planningUnitId,
                    expiryDate: expiryDate,
                    createdDate: createdDate,
                    autoGenerated: true
                }
                batchInfoList.push(batchDetails);
                // }

                programJson.batchInfoList = batchInfoList;
                // }
                shipmentList.push(shipmentJson);
                programJson.shipmentList = shipmentList;
                //Do calculations for supply plan
                var coreBatchDetails = programJson.batchInfoList;
                console.log("Core batch details initial MohitPooja", coreBatchDetails)
                var supplyPlanData = programJson.supplyPlan;
                if (supplyPlanData == undefined) {
                    supplyPlanData = []
                }
                var lastDataEntryDate = moment(stopDate).add(2, 'months').format("YYYY-MM-DD");
                console.log("lastDataEntryDate MohitPooja", lastDataEntryDate)
                supplyPlanData = supplyPlanData.filter(c => (c.planningUnitId != planningUnitId) || (c.planningUnitId == planningUnitId && (moment(c.transDate).format("YYYY-MM") < moment(curDate).format("YYYY-MM") || moment(c.transDate).format("YYYY-MM") > moment(lastDataEntryDate).format("YYYY-MM"))));
                var createdDate = moment(curDate).startOf('month').format("YYYY-MM");
                var firstDataEntryDate = moment(curDate).startOf('month').format("YYYY-MM");

                // Looping till the max data entry date
                for (var i = 0; createdDate < lastDataEntryDate; i++) {
                    // Adding months to created date and getting start date and end date
                    createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                    console.log("CreatedDate MohitPooja", createdDate);
                    var startDate = moment(createdDate).startOf('month').format('YYYY-MM-DD');
                    var endDate = moment(createdDate).endOf('month').format('YYYY-MM-DD');
                    // Getting prev month date
                    var prevMonthDate = moment(createdDate).subtract(1, 'months').startOf('month').format("YYYY-MM-DD");
                    // Getting prev month supply plan
                    var prevMonthSupplyPlan = [];
                    if (supplyPlanData.length > 0) {
                        prevMonthSupplyPlan = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(prevMonthDate).format("YYYY-MM-DD") && c.planningUnitId == planningUnitId);
                    } else {
                        prevMonthSupplyPlan = []
                    }
                    // Getting batch details if exists otherwise add qty as 0 for all the batches
                    var batchDetails = [];
                    var batchDetailsFromProgramJson = programJson.batchInfoList.filter(c => c.planningUnitId == planningUnitId);
                    if (prevMonthSupplyPlan.length > 0) {
                        batchDetails = prevMonthSupplyPlan[0].batchDetails;
                    }

                    // Calculations of exipred stock
                    var expiredStock = 0;
                    var expiredStockWps = 0;

                    // Formatting batchDetails
                    var myArray = [];
                    var myArrayWps = [];
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

                    var remainingBatches = (programJson.batchInfoList).filter(c => c.planningUnitId == planningUnitId && moment(c.createdDate).format("YYYY-MM") == moment(startDate).format("YYYY-MM") && moment(c.expiryDate).format("YYYY-MM") == moment(startDate).add(programPlanningUnitList.shelfLife, 'months').format("YYYY-MM"));
                    for (var rb = 0; rb < remainingBatches.length; rb++) {
                        var indexForRemainingBatch = myArray.findIndex(c => c.batchNo == remainingBatches[rb].batchNo && moment(remainingBatches[rb].expiryDate).format("YYYY-MM") == moment(c.expiryDate).format("YYYY-MM"));
                        if (indexForRemainingBatch == -1) {
                            var json1 = {
                                batchId: remainingBatches[rb].batchId,
                                batchNo: remainingBatches[rb].batchNo,
                                expiryDate: remainingBatches[rb].expiryDate,
                                createdDate: remainingBatches[rb].createdDate,
                                autoGenerated: remainingBatches[rb].autoGenerated,
                                openingBalance: 0,
                                openingBalanceWps: 0,
                                consumption: 0,
                                adjustment: 0,
                                stock: 0,
                                shipment: 0,
                                shipmentWps: 0,
                                expiredQty: 0,
                                expiredQtyWps: 0
                            }
                            myArray.push(json1);
                        }
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

                    // if (moment(startDate).format("YYYY-MM-DD") > moment(lastDate).format("YYYY-MM-DD") && openingBalance == 0 && openingBalanceWps == 0) {
                    // lastDataEntryDate = startDate;
                    // }
                    // Shipments part
                    // Getting shipments list for planning unit
                    var shipmentList = (programJson.shipmentList).filter(c => c.active.toString() == "true" && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag.toString() == "true");
                    // Getting shipment list for a month
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
                    // var negativeAdjustmentBatchQtyTotal=0;
                    var actualBatchQtyTotal = 0;

                    // For loop for getting total shipment qty
                    for (var j = 0; j < shipmentArr.length; j++) {
                        // Adding total shipment qty
                        shipmentTotalQty += Number((shipmentArr[j].shipmentQty));
                        // Adding total shipment qty wps
                        if (shipmentArr[j].shipmentStatus.id != PLANNED_SHIPMENT_STATUS) {
                            shipmentTotalQtyWps += Number((shipmentArr[j].shipmentQty));
                        }
                        // Adding manual shipments
                        if (shipmentArr[j].erpFlag.toString() == "false") {
                            manualTotalQty += Number((shipmentArr[j].shipmentQty));
                            // Adding shipments based on status
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
                            // Adding erp shipments
                            erpTotalQty += Number((shipmentArr[j].shipmentQty));
                            // Adding shipments based on status
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

                        // Adding shipments qty batch wise
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
                                        shipmentQtyWps = batchListForShipments[b].shipmentQty;
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
                                        shipment: batchListForShipments[b].shipmentQty,
                                        shipmentWps: shipmentQtyWps,
                                        expiredQty: 0,
                                        expiredQtyWps: 0
                                    }
                                    myArray.push(json);
                                }

                            } else {
                                myArray[index].shipment = Number(myArray[index].shipment) + Number(batchListForShipments[b].shipmentQty);
                                if (shipmentArr[j].shipmentStatus.id != PLANNED_SHIPMENT_STATUS) {
                                    myArray[index].shipmentWps = Number(myArray[index].shipmentWps) + Number(batchListForShipments[b].shipmentQty);
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
                    console.log("Trans Date+++", startDate)

                    // Inventory part
                    // Filtering inventory for planning unit and that particular month
                    var inventoryList = (programJson.inventoryList).filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.planningUnit.id == planningUnitId && c.active.toString() == "true");
                    var actualStockCount = 0;
                    var adjustmentQty = 0;
                    var regionsReportingActualInventory = 0;
                    var regionListFiltered = regionList;
                    var totalNoOfRegions = (regionListFiltered).length;
                    for (var r = 0; r < totalNoOfRegions; r++) {
                        // Filtering inventory data for a region
                        var inventoryListForRegion = inventoryList.filter(c => c.region != null && c.region.id != 0 && c.region.id == regionList[r].id);
                        // Check how many regions have reported actual stock count
                        var noOfEntriesOfActualStockCount = (inventoryListForRegion.filter(c => c.actualQty != undefined && c.actualQty != null && c.actualQty !== "")).length;
                        // Adding count of regions reporting actual inventory
                        if (noOfEntriesOfActualStockCount > 0) {
                            regionsReportingActualInventory += 1;
                        }
                        for (var inv = 0; inv < inventoryListForRegion.length; inv++) {
                            // If region have reported actual stock count that only consider actual stock count
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
                                // If region has not reported actual stock count we will only consider adjustments
                                if (inventoryListForRegion[inv].adjustmentQty !== "" && inventoryListForRegion[inv].adjustmentQty != null && inventoryListForRegion[inv].adjustmentQty != undefined) {
                                    adjustmentQty += Math.round(Number(inventoryListForRegion[inv].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier));
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
                    // Consumption part
                    // Filtering consumption list for that month, that planning unit
                    var consumptionList = (programJson.consumptionList).filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.planningUnit.id == planningUnitId && c.active.toString() == "true");
                    var actualConsumptionQty = 0;
                    var forecastedConsumptionQty = 0;
                    var regionsReportingActualConsumption = [];
                    var noOfRegionsReportingActualConsumption = 0;
                    var consumptionQty = 0;
                    var consumptionType = "";
                    var regionList = regionListFiltered;
                    for (var c = 0; c < consumptionList.length; c++) {
                        // Calculating actual consumption qty
                        if (consumptionList[c].actualFlag.toString() == "true") {
                            actualConsumptionQty += Math.round(Math.round(consumptionList[c].consumptionRcpuQty) * Number(consumptionList[c].multiplier));
                            // Adding regions reporting actual consumption
                            var index = regionsReportingActualConsumption.findIndex(f => f == consumptionList[c].region.id);
                            if (index == -1) {
                                regionsReportingActualConsumption.push(consumptionList[c].region.id);
                            }
                        } else {
                            // Calculating forecated consumption qty
                            forecastedConsumptionQty += Math.round(Math.round(consumptionList[c].consumptionRcpuQty) * Number(consumptionList[c].multiplier))
                        }
                    }
                    // Getting no of regions reporting actual consumption
                    noOfRegionsReportingActualConsumption = regionsReportingActualConsumption.length;
                    // Check if there are consumption details avaliable
                    if (consumptionList.length == 0) {
                        consumptionQty = "";
                        consumptionType = "";
                    } else if (((totalNoOfRegions == noOfRegionsReportingActualConsumption) || (actualConsumptionQty >= forecastedConsumptionQty)) && (noOfRegionsReportingActualConsumption > 0)) {
                        // Considering actual consumption if consumption for all regions is given or if actual consumption qty is greater than forecasted consumption qty
                        consumptionQty = actualConsumptionQty;
                        consumptionType = 1;
                        // Reducing consumption for the batches that are given by user
                        var consumptionListForActualConsumption = consumptionList.filter(c => c.actualFlag.toString() == "true");
                        // Looping across all the actual consumptions
                        for (var ac = 0; ac < consumptionListForActualConsumption.length; ac++) {
                            // Getting batch details
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
                        // Consider forecasted consumption since that is greater
                        consumptionQty = forecastedConsumptionQty;
                        consumptionType = 0;
                    }

                    // Calculating expected stock
                    var expectedStock = 0;
                    expectedStock = openingBalance - expiredStock + shipmentTotalQty - (consumptionQty !== "" ? Number(consumptionQty) : 0) + (adjustmentQty !== "" ? Number(adjustmentQty) : 0);
                    // Calculating expected stock wps
                    var expectedStockWps = 0;
                    expectedStockWps = openingBalanceWps - expiredStockWps + shipmentTotalQtyWps - (consumptionQty !== "" ? Number(consumptionQty) : 0) + (adjustmentQty !== "" ? Number(adjustmentQty) : 0);

                    // Calculations of national adjustments
                    var nationalAdjustment = 0;
                    // Check if all the regions have reported actual inventory and expected stock is not equal to actual stock make an national adjustment
                    if (regionsReportingActualInventory == totalNoOfRegions && expectedStock != actualStockCount) {
                        nationalAdjustment = actualStockCount - expectedStock;
                    } else if (regionsReportingActualInventory > 0 && inventoryList.length != 0 && actualStockCount > (expectedStock + adjustmentQty)) {
                        // If actual stock count is greater than expected + adjustment qty that consider that stock as national adjustment
                        nationalAdjustment = actualStockCount - expectedStock;
                    } else if (regionsReportingActualInventory > 0 && expectedStock < 0) {
                        // If expected is less than 0 than make an national adjustment
                        nationalAdjustment = actualStockCount - expectedStock;
                    }
                    // Calculations of national adjustments wps
                    var nationalAdjustmentWps = 0;
                    // Check if all the regions have reported actual inventory and expected stock is not equal to actual stock make an national adjustment wps
                    if (regionsReportingActualInventory == totalNoOfRegions && expectedStockWps != actualStockCount) {
                        nationalAdjustmentWps = actualStockCount - expectedStockWps;
                    } else if (regionsReportingActualInventory > 0 && inventoryList.length != 0 && actualStockCount > (expectedStock + adjustmentQty)) {
                        // If actual stock count is greater than expected + adjustment qty that consider that stock as national adjustment wps
                        nationalAdjustmentWps = actualStockCount - expectedStockWps;
                    } else if (regionsReportingActualInventory > 0 && expectedStockWps < 0) {
                        // If expected is less than 0 than make an national adjustment wps
                        nationalAdjustmentWps = actualStockCount - expectedStockWps;
                    }
                    // Accounting unallocated batchs
                    // Again sorting the batch details

                    myArray = myArray.sort(function (a, b) { return ((new Date(a.expiryDate) - new Date(b.expiryDate)) || (a.batchId - b.batchId)) })
                    var unallocatedFEFO = Number(consumptionQty) - Math.max(0, Number(adjustmentQty) + Number(nationalAdjustment));
                    var unallocatedLEFO = 0 - Math.min(0, Number(adjustmentQty) + Number(nationalAdjustment));

                    var unallocatedFEFOWps = Number(consumptionQty) - Math.max(0, Number(adjustmentQty) + Number(nationalAdjustment));
                    var unallocatedLEFOWps = 0 - Math.min(0, Number(adjustmentQty) + Number(nationalAdjustment));

                    for (var a = 0; a < myArray.length; a++) {
                        var bd = myArray[a];
                        var tempOB = Number(myArray[a].openingBalance)
                            - Number(myArray[a].expiredQty)
                            + Number(myArray[a].shipment);
                        var consumption = Number(myArray[a].consumption);
                        var adjustment = (Number(myArray[a].stock) == 0 ? Number(myArray[a].adjustment) : 0);
                        if (Number(adjustmentQty) + Number(nationalAdjustment) > 0) {
                            if ((Number(tempOB) + Number(adjustment)) >= 0) {
                                unallocatedFEFO += Number(adjustment);
                            } else {
                                unallocatedFEFO -= Number(tempOB);
                            }
                        } else {
                            if ((Number(tempOB) + Number(adjustment)) >= 0) {
                                unallocatedLEFO += Number(adjustment);
                            } else {
                                unallocatedLEFO -= Number(tempOB);
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

                        //WPS Calculations
                        var tempOBWps = Number(myArray[a].openingBalanceWps)
                            - Number(myArray[a].expiredQtyWps)
                            + Number(myArray[a].shipmentWps);
                        var consumptionWps = Number(myArray[a].consumption);
                        var adjustmentWps = (Number(myArray[a].stock) == 0 ? Number(myArray[a].adjustment) : 0);
                        if (Number(adjustmentQty) + Number(nationalAdjustment) > 0) {
                            if ((Number(tempOBWps) + Number(adjustmentWps)) >= 0) {
                                unallocatedFEFOWps += Number(adjustmentWps);
                            } else {
                                unallocatedFEFOWps -= Number(tempOBWps);
                            }
                        } else {
                            if ((Number(tempOBWps) + Number(adjustmentWps)) >= 0) {
                                unallocatedLEFOWps += Number(adjustmentWps);
                            } else {
                                unallocatedLEFOWps -= Number(tempOBWps);
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

                    if (Number(unallocatedLEFO) != 0) {
                        for (var a = (myArray.length) - 1; a >= 0; a--) {
                            if (Number(unallocatedLEFO) != 0) {
                                var tempCB = Number(myArray[a].closingBalance);
                                myArray[a].unallocatedLEFO = Number(unallocatedLEFO);
                                if (Number(tempCB) >= Number(unallocatedLEFO)) {
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

                    if (Number(unallocatedLEFOWps) != 0) {
                        for (var a = (myArray.length) - 1; a >= 0; a--) {
                            if (Number(unallocatedLEFOWps) != 0) {
                                var tempCB = Number(myArray[a].closingBalanceWps);
                                myArray[a].unallocatedLEFOWps = Number(unallocatedLEFOWps);
                                if (Number(tempCB) >= Number(unallocatedLEFOWps)) {
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

                    if (Number(unallocatedFEFO) < 0 || Number(unallocatedFEFOWps) < 0) {
                        var batchNo = (BATCH_PREFIX).concat(generalProgramJson.programId).concat(planningUnitId).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
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
                            shelfLife: programPlanningUnitList.shelfLife,
                            expiryDate: moment(startDate).add(programPlanningUnitList.shelfLife, 'months').format("YYYY-MM-DD"),
                            createdDate: moment(startDate).format("YYYY-MM-DD"),
                            openingBalance: 0,
                            openingBalanceWps: 0,
                            unallocatedFEFO: Number(unallocatedFEFO) < 0 ? Number(unallocatedFEFO) : 0,
                            calculatedFEFO: Number(unallocatedFEFO) < 0 ? Number(unallocatedFEFO) : 0,
                            unallocatedFEFOWps: Number(unallocatedFEFOWps) < 0 ? Number(unallocatedFEFOWps) : 0,
                            calculatedFEFOWps: Number(unallocatedFEFOWps) < 0 ? Number(unallocatedFEFOWps) : 0,
                            closingBalance: Number(unallocatedFEFO) < 0 ? 0 - Number(unallocatedFEFO) : 0,
                            closingBalanceWps: Number(unallocatedFEFOWps) < 0 ? 0 - Number(unallocatedFEFOWps) : 0,
                            qty: Number(unallocatedFEFO) < 0 ? 0 - Number(unallocatedFEFO) : 0,
                            qtyWps: Number(unallocatedFEFOWps) < 0 ? 0 - Number(unallocatedFEFOWps) : 0,
                        }
                        myArray.push(json);
                        var coreBatch = {
                            batchId: 0,
                            batchNo: batchNo,
                            autoGenerated: true,
                            planningUnitId: planningUnitId,
                            expiryDate: moment(startDate).add(programPlanningUnitList.shelfLife, 'months').format("YYYY-MM-DD"),
                            createdDate: moment(startDate).format("YYYY-MM-DD")
                        }
                        coreBatchDetails.push(coreBatch)
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
                    for (var ap = 1; ap <= programPlanningUnitList.monthsInPastForAmc; ap++) {
                        var amcDate = moment(startDate).subtract(ap, 'months').startOf('month').format("YYYY-MM-DD");
                        var amcFilter = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(amcDate).format("YYYY-MM-DD") && c.planningUnitId == planningUnitId);
                        if (amcFilter.length > 0) {
                            amcTotal += (amcFilter[0].consumptionQty != null && amcFilter[0].consumptionQty !== "" ? Number(amcFilter[0].consumptionQty) : 0);
                            if (amcFilter[0].consumptionQty != null && amcFilter[0].consumptionQty !== "") {
                                totalMonths += 1;
                            }
                        }
                    }
                    for (var ap = 0; ap < programPlanningUnitList.monthsInFutureForAmc; ap++) {
                        var amcDate = moment(startDate).add(ap, 'months').startOf('month').format("YYYY-MM-DD");
                        // Add consumption logic
                        var actualConsumptionQtyAmc = 0;
                        var forecastedConsumptionQtyAmc = 0;
                        var consumptionQtyAmc = 0;
                        var regionsReportingActualConsumptionAmc = []
                        var noOfRegionsReportingActualConsumptionAmc = []

                        var amcFilter = (programJson.consumptionList).filter(c => (c.consumptionDate >= amcDate && c.consumptionDate <= amcDate) && c.planningUnit.id == planningUnitId && c.active.toString() == "true");
                        for (var c = 0; c < amcFilter.length; c++) {
                            if (amcFilter[c].actualFlag.toString() == "true") {
                                actualConsumptionQtyAmc += Math.round(Math.round(amcFilter[c].consumptionRcpuQty) * Number(amcFilter[c].multiplier));
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
                        amc = Math.round((Number(amcTotal) / Number(totalMonths)));
                    }


                    // Calculations for Min stock
                    var maxForMonths = 0;
                    var realm = generalProgramJson.realmCountry.realm;
                    var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
                    var DEFAULT_MIN_MAX_MONTHS_OF_STOCK = realm.minMosMaxGaurdrail;
                    if (DEFAULT_MIN_MONTHS_OF_STOCK > programPlanningUnitList.minMonthsOfStock) {
                        maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
                    } else if (programPlanningUnitList.minMonthsOfStock < DEFAULT_MIN_MAX_MONTHS_OF_STOCK) {
                        maxForMonths = programPlanningUnitList.minMonthsOfStock
                    } else {
                        maxForMonths = DEFAULT_MIN_MAX_MONTHS_OF_STOCK
                    }
                    var minStockMoSQty = Number(maxForMonths);


                    // Calculations for Max Stock
                    var minForMonths = 0;
                    var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                    if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + programPlanningUnitList.reorderFrequencyInMonths)) {
                        minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                    } else {
                        minForMonths = (maxForMonths + programPlanningUnitList.reorderFrequencyInMonths);
                    }
                    var maxStockMoSQty = Number(minForMonths);

                    var minStock = Number(amc) * Number(minStockMoSQty);
                    var maxStock = Number(amc) * Number(maxStockMoSQty);

                    // Calculations of Closing balance
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

                    // Calculations of closing balance wps
                    if (regionsReportingActualInventory == totalNoOfRegions) {
                        closingBalanceWps = actualStockCount;
                    } else if (actualStockCount > expectedStockWps + nationalAdjustmentWps) {
                        closingBalanceWps = actualStockCount
                    } else {
                        closingBalanceWps = expectedStockWps + nationalAdjustmentWps;
                    }


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
                    if (closingBalance != 0 && amc != 0 && amc != null) {
                        mos = Number(closingBalance / amc).toFixed(4);
                    } else if (amc == 0 || amc == null) {
                        mos = null;
                    } else {
                        mos = 0;
                    }

                    var mosWps = "";
                    if (closingBalanceWps != 0 && amc != 0 && amc != null) {
                        mosWps = Number(closingBalanceWps / amc).toFixed(4);
                    } else if (amc == 0 || amc == null) {
                        mosWps = null;
                    } else {
                        mosWps = 0;
                    }
                    var json = {
                        programId: generalProgramJson.programId,
                        versionId: generalProgramJson.currentVersion.versionId,
                        planningUnitId: planningUnitId,
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
                programJson.supplyPlan = supplyPlanData
                console.log("SupplyPlanData MohitPooja at end", supplyPlanData)
            }
        } else {
        }

    }
    console.log("coreBatchDetails MohitPooja", coreBatchDetails)
    programJsonForStoringTheResult.batchInfoList = programJson.batchInfoList;
    programJsonForStoringTheResult.supplyPlan = programJson.supplyPlan;
    programJsonForStoringTheResult.shipmentList = programJson.shipmentList;
    var planningUnitDataList = programDataJson.planningUnitDataList;
    console.log("programJsonForStoringTheResult MohitPooja", programJsonForStoringTheResult)
    var planningUnitDataIndex = (planningUnitDataList).findIndex(c => c.planningUnitId == planningUnitId);
    if (planningUnitDataIndex != -1) {
        planningUnitDataList[planningUnitDataIndex].planningUnitData = (CryptoJS.AES.encrypt(JSON.stringify(programJsonForStoringTheResult), SECRET_KEY)).toString();
    } else {
        planningUnitDataList.push({ planningUnitId: planningUnitId, planningUnitData: (CryptoJS.AES.encrypt(JSON.stringify(programJsonForStoringTheResult), SECRET_KEY)).toString() });
    }
    props.updateState("fundingSourceIdSingle", "");
    props.updateState("procurementAgentIdSingle", "");
    props.updateState("budgetIdSingle", "");
    programDataJson.planningUnitDataList = planningUnitDataList;
    programRequest.result.programData = programDataJson;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
    }.bind(this);
    openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var programDataTransaction = db1.transaction(['whatIfProgramData'], 'readwrite');
        var programDataOs = programDataTransaction.objectStore('whatIfProgramData');
        var putRequest = programDataOs.put(programRequest.result);
        putRequest.onerror = function (event) {
        }.bind(this);
        putRequest.onsuccess = function (event) {
            calculateSupplyPlan(programIdParam, planningUnitId, "whatIfProgramData", "whatIf", props, [], startDate1)
        }.bind(this)
    }.bind(this)
}