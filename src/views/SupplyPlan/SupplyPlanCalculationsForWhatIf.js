import CryptoJS from 'crypto-js';
import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { generateRandomAplhaNumericCode, paddingZero } from "../../CommonComponent/JavascriptCommonFunctions";
import { APPROVED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, BATCH_PREFIX, CANCELLED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, INDEXED_DB_NAME, INDEXED_DB_VERSION, ON_HOLD_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, QAT_SUGGESTED_DATA_SOURCE_ID, SECRET_KEY, SHIPPED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS } from "../../Constants";
import AuthenticationService from "../Common/AuthenticationService";
import { calculateSupplyPlan } from '../SupplyPlan/SupplyPlanCalculations';
/**
 * This function is used to convert suggested shipments into planned shipments and to recalculate the supply plan
 * @param {*} startDate This is start date from where suggested shipments should be converted to planned shipments
 * @param {*} stopDate This is start date till when suggested shipments should be converted to planned shipments
 * @param {*} programJson This is the content of program i.e it has the information about consumption, inventory and shipments in the form of json from the data that user has downloaded
 * @param {*} generalProgramJson This is the content of the general information of the program that user has downloaded
 * @param {*} props This is the props of the page from which this function is called
 * @param {*} planningUnitId This is the planning unit Id for which supply plan has to be build 
 * @param {*} programPlanningUnitList This is the list of program planning units for a partcular program
 * @param {*} regionList This is the region list for a program
 * @param {*} programIdParam This is the program Id for which supply plan has to be build
 * @param {*} programJsonForStoringTheResult This is json that will be used to store the updated data
 * @param {*} programDataJson This is the program data json
 * @param {*} programRequest This is the request which will be used to save the data in local indexed db
 */
export function convertSuggestedShipmentsIntoPlannedShipments(startDate, stopDate, programJson, generalProgramJson, props, planningUnitId, programPlanningUnitList, regionList, programIdParam, programJsonForStoringTheResult, programDataJson, programRequest, monthsInPastForAMC, monthsInFutureForAMC) {
    props.updateState("scenarioId", '');
    var curDate = moment(startDate).format("YYYY-MM-DD");
    var startDate1 = moment(startDate).format("YYYY-MM-DD");
    for (var s = 1; moment(curDate).format("YYYY-MM") <= moment(stopDate).format("YYYY-MM"); s++) {
        var supplyPlanData = programJson.supplyPlan;
        var jsonList = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(curDate).format("YYYY-MM-DD"));
        var supplyPlanData = programJson.supplyPlan;
        var shipmentList = programJson.shipmentList;
        if (props.state.planBasedOn == 1) {
            var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
            var compare = (curDate >= currentMonth);
            var amc = jsonList.length > 0 ? Number(jsonList[0].amc) : "";
            var spd1 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(curDate).format("YYYY-MM"));
            var spd2 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(curDate).add(1, 'months').format("YYYY-MM"));
            var spd3 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(curDate).add(2, 'months').format("YYYY-MM"));
            var mosForMonth1 = spd1.length > 0 ? spd1[0].mos != null ? parseFloat(spd1[0].mos).toFixed(1) : null : 0;
            var mosForMonth2 = spd2.length > 0 ? spd2[0].mos != null ? parseFloat(spd2[0].mos).toFixed(1) : null : 0;
            var mosForMonth3 = spd3.length > 0 ? spd3[0].mos != null ? parseFloat(spd3[0].mos).toFixed(1) : null : 0;
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
                    suggestedOrd = Number(Math.round(amc * Number(props.state.maxStockMoSQty)) - Number(jsonList[0].closingBalance) + Number(jsonList[0].unmetDemand));
                } else {
                    suggestedOrd = Number(Math.round(amc * Number(props.state.minStockMoSQty)) - Number(jsonList[0].closingBalance) + Number(jsonList[0].unmetDemand));
                }
            }
        } else {
            var currentMonth = moment(Date.now()).utcOffset('-0500').startOf('month').format("YYYY-MM-DD");
            var compare = (curDate >= currentMonth);
            var spd1 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(curDate).add(props.state.distributionLeadTime, 'months').format("YYYY-MM"));
            var spd2 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(curDate).add(1 + props.state.distributionLeadTime, 'months').format("YYYY-MM"));
            var spd3 = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM") == moment(curDate).add(2 + props.state.distributionLeadTime, 'months').format("YYYY-MM"));
            var amc = spd1.length > 0 ? Number(spd1[0].amc) : 0;
            var mosForMonth1 = spd1.length > 0 ? spd1[0].mos != null ? parseFloat(spd1[0].mos).toFixed(1) : null : 0;
            var mosForMonth2 = spd2.length > 0 ? spd2[0].mos != null ? parseFloat(spd2[0].mos).toFixed(1) : null : 0;
            var mosForMonth3 = spd3.length > 0 ? spd3[0].mos != null ? parseFloat(spd3[0].mos).toFixed(1) : null : 0;
            var cbForMonth1 = spd1.length > 0 ? spd1[0].closingBalance : 0;
            var cbForMonth2 = spd2.length > 0 ? spd2[0].closingBalance : 0;
            var cbForMonth3 = spd3.length > 0 ? spd3[0].closingBalance : 0;
            var unmetDemandForMonth1 = spd1.length > 0 ? spd1[0].unmetDemand : 0;
            var maxStockForMonth1 = spd1.length > 0 ? spd1[0].maxStock : 0;
            var minStockForMonth1 = spd1.length > 0 ? spd1[0].minStock : 0;
            var suggestShipment = false;
            var useMax = false;
            if (compare) {
                if (Number(amc) == 0) {
                    suggestShipment = false;
                } else if (Number(cbForMonth1) != 0 && Number(cbForMonth1) < Number(props.state.minQtyPpu) && (Number(cbForMonth2) > Number(props.state.minQtyPpu) || Number(cbForMonth3) > Number(props.state.minQtyPpu))) {
                    suggestShipment = false;
                } else if (Number(cbForMonth1) != 0 && Number(cbForMonth1) < Number(props.state.minQtyPpu) && Number(cbForMonth2) < Number(props.state.minQtyPpu) && Number(cbForMonth3) < Number(props.state.minQtyPpu)) {
                    suggestShipment = true;
                    useMax = true;
                } else if (Number(cbForMonth1) == 0) {
                    suggestShipment = true;
                    if (Number(cbForMonth2) < Number(props.state.minQtyPpu) && Number(cbForMonth3) < Number(props.state.minQtyPpu)) {
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
                    suggestedOrd = Number(Math.round(Number(maxStockForMonth1)) - Number(cbForMonth1) + Number(unmetDemandForMonth1));
                } else {
                    suggestedOrd = Number(Math.round(Number(minStockForMonth1)) - Number(cbForMonth1) + Number(unmetDemandForMonth1));
                }
            }
        }
        if (suggestShipment) {
            if (suggestedOrd <= 0) {
            } else {
                var pa = props.state.procurementAgentListForWhatIf.filter(c => c.procurementAgentId == props.state.procurementAgentIdSingle)[0];
                var programPlanningUnit = ((props.state.programPlanningUnitList).filter(p => p.planningUnit.id == planningUnitId))[0];
                var programPriceList = programPlanningUnit.programPlanningUnitProcurementAgentPrices.filter(c => c.program.id == programId && c.procurementAgent.id == props.state.procurementAgentIdSingle && c.planningUnit.id == planningUnitId && c.active);
                var pricePerUnit = 0;
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
                pricePerUnit = Number(pricePerUnit / 1).toFixed(2);
                var rate = pricePerUnit;
                var productCost = Number(Number(rate) * Number(suggestedOrd)).toFixed(2);
                var seaFreightPercentage = generalProgramJson.seaFreightPerc;
                var freightCost = Number(productCost) * (Number(Number(seaFreightPercentage) / 100));
                var b = props.state.budgetListForWhatIf.filter(c => c.budgetId == props.state.budgetIdSingle)[0];
                var c = (props.state.currencyListForWhatIf.filter(c => c.currencyId == 1)[0]);
                var fs = props.state.fundingSourceListForWhatIf.filter(c => c.fundingSourceId == props.state.fundingSourceIdSingle)[0];
                var curDate1 = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM-DD HH:mm:ss");
                var curUser = AuthenticationService.getLoggedInUserId();
                var username = AuthenticationService.getLoggedInUsername();
                var rcpu = props.state.realmCountryPlanningUnitListAll.filter(c => c.multiplier == 1 && c.planningUnit.id == planningUnitId)[0];
                var shipmentJson = {
                    accountFlag: true,
                    active: true,
                    dataSource: {
                        id: QAT_SUGGESTED_DATA_SOURCE_ID,
                        label: (props.state.dataSourceListAll).filter(c => c.dataSourceId == QAT_SUGGESTED_DATA_SOURCE_ID)[0].label
                    },
                    erpFlag: false,
                    localProcurement: false,
                    notes: "",
                    planningUnit: {
                        id: planningUnitId,
                        label: (props.state.planningUnitListAll.filter(c => c.planningUnit.id == planningUnitId)[0]).planningUnit.label
                    },
                    realmCountryPlanningUnit: {
                        id: rcpu.realmCountryPlanningUnitId,
                        label: rcpu.label,
                        multiplier: rcpu.multiplier
                    },
                    procurementAgent: {
                        id: pa.procurementAgentId,
                        code: pa.procurementAgentCode,
                        label: pa.label
                    },
                    rate: rate,
                    productCost: productCost,
                    freightCost: freightCost,
                    budget: {
                        id: props.state.budgetIdSingle == "undefined" || props.state.budgetIdSingle == undefined || props.state.budgetIdSingle == "" ? '' : b.budgetId,
                        code: props.state.budgetIdSingle == "undefined" || props.state.budgetIdSingle == undefined || props.state.budgetIdSingle == "" ? '' : b.budgetCode,
                        label: props.state.budgetIdSingle == "undefined" || props.state.budgetIdSingle == undefined || props.state.budgetIdSingle == "" ? {} : b.label,
                    },
                    shipmentQty: suggestedOrd,
                    shipmentRcpuQty: suggestedOrd,
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
                    isAddedViaScenario: true
                }
                var expectedDeliveryDate = moment(curDate).format("YYYY-MM-DD");
                var createdDate = expectedDeliveryDate;
                var programId = (programIdParam).split("_")[0];
                var planningUnitId = planningUnitId;
                var batchNo = (BATCH_PREFIX).concat(paddingZero(programId, 0, 6)).concat(paddingZero(planningUnitId, 0, 8)).concat(moment(Date.now()).format("YYMMDD")).concat(generateRandomAplhaNumericCode(3));
                var expiryDate = moment(curDate != "" && curDate != null && curDate != "Invalid date" ? curDate : curDate).add(programPlanningUnitList.shelfLife, 'months').startOf('month').format("YYYY-MM-DD");
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
                programJson.batchInfoList = batchInfoList;
                shipmentList.push(shipmentJson);
                programJson.shipmentList = shipmentList;
                var coreBatchDetails = programJson.batchInfoList;
                var supplyPlanData = programJson.supplyPlan;
                if (supplyPlanData == undefined) {
                    supplyPlanData = []
                }
                var lastDataEntryDate = moment(stopDate).add(2 + props.state.distributionLeadTime, 'months').format("YYYY-MM-DD");
                supplyPlanData = supplyPlanData.filter(c => (c.planningUnitId != planningUnitId) || (c.planningUnitId == planningUnitId && (moment(c.transDate).format("YYYY-MM") < moment(curDate).format("YYYY-MM") || moment(c.transDate).format("YYYY-MM") > moment(lastDataEntryDate).format("YYYY-MM"))));
                var createdDate = moment(curDate).startOf('month').format("YYYY-MM");
                var firstDataEntryDate = moment(curDate).startOf('month').format("YYYY-MM");
                for (var i = 0; createdDate < lastDataEntryDate; i++) {
                    createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
                    var startDate = moment(createdDate).startOf('month').format('YYYY-MM-DD');
                    var endDate = moment(createdDate).endOf('month').format('YYYY-MM-DD');
                    var prevMonthDate = moment(createdDate).subtract(1, 'months').startOf('month').format("YYYY-MM-DD");
                    var prevMonthSupplyPlan = [];
                    if (supplyPlanData.length > 0) {
                        prevMonthSupplyPlan = supplyPlanData.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(prevMonthDate).format("YYYY-MM-DD") && c.planningUnitId == planningUnitId);
                    } else {
                        prevMonthSupplyPlan = []
                    }
                    var batchDetails = [];
                    var batchDetailsFromProgramJson = programJson.batchInfoList.filter(c => c.planningUnitId == planningUnitId);
                    if (prevMonthSupplyPlan.length > 0) {
                        batchDetails = prevMonthSupplyPlan[0].batchDetails;
                    }
                    var expiredStock = 0;
                    var expiredStockWps = 0;
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
                            expiredStock += (Number(batchDetails[b].qty));
                            expiredStockWps += (Number(batchDetails[b].qtyWps));
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
                    var cutOffDate = generalProgramJson.cutOffDate != undefined && generalProgramJson.cutOffDate != null && generalProgramJson.cutOffDate != "" ? generalProgramJson.cutOffDate : "";
                    if (cutOffDate != "" && moment(createdDate).format("YYYY-MM") <= moment(cutOffDate).format("YYYY-MM")) {
                        var currentMonthSupplyPlan = programJsonForStoringTheResult.supplyPlan.filter(c => moment(c.transDate).format("YYYY-MM-DD") == moment(createdDate).format("YYYY-MM-DD") && c.planningUnitId == planningUnitId);
                        if (currentMonthSupplyPlan.length > 0) {
                            openingBalance = currentMonthSupplyPlan[0].openingBalance;
                            openingBalanceWps = currentMonthSupplyPlan[0].openingBalanceWps;
                        } else {
                            openingBalance = 0;
                            openingBalanceWps = 0;
                        }
                    }
                    var shipmentList = (programJson.shipmentList).filter(c => c.active.toString() == "true" && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag.toString() == "true");
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
                                        shipmentQtyWps = (Number(batchListForShipments[b].shipmentQty) * Number(shipmentArr[j].realmCountryPlanningUnit.multiplier));
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
                                        shipment: (Number(batchListForShipments[b].shipmentQty) * Number(shipmentArr[j].realmCountryPlanningUnit.multiplier)),
                                        shipmentWps: shipmentQtyWps,
                                        expiredQty: 0,
                                        expiredQtyWps: 0
                                    }
                                    myArray.push(json);
                                }
                            } else {
                                myArray[index].shipment = Number(myArray[index].shipment) + (Number(batchListForShipments[b].shipmentQty) * Number(shipmentArr[j].realmCountryPlanningUnit.multiplier));
                                if (shipmentArr[j].shipmentStatus.id != PLANNED_SHIPMENT_STATUS) {
                                    myArray[index].shipmentWps = Number(myArray[index].shipmentWps) + (Number(batchListForShipments[b].shipmentQty) * Number(shipmentArr[j].realmCountryPlanningUnit.multiplier));
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
                    var inventoryList = (programJson.inventoryList).filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.planningUnit.id == planningUnitId && c.active.toString() == "true");
                    var actualStockCount = 0;
                    var adjustmentQty = 0;
                    var regionsReportingActualInventory = 0;
                    var regionListFiltered = regionList;
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
                                    actualStockCount += (Number(inventoryListForRegion[inv].actualQty) * Number(inventoryListForRegion[inv].multiplier));
                                }
                                if (inventoryListForRegion[inv].adjustmentQty !== "" && inventoryListForRegion[inv].adjustmentQty != null && inventoryListForRegion[inv].adjustmentQty != undefined) {
                                    adjustmentQty += (Number(inventoryListForRegion[inv].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier));
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
                                                adjustment: (Number(batchListForInventory[b].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier)),
                                                stock: (Number(batchListForInventory[b].actualQty) * Number(inventoryListForRegion[inv].multiplier)),
                                                shipment: 0,
                                                shipmentWps: 0,
                                                expiredQty: 0,
                                                expiredQtyWps: 0
                                            }
                                            myArray.push(json);
                                        }
                                    } else {
                                        myArray[index].stock = Number(myArray[index].stock) + (Number(batchListForInventory[b].actualQty) * Number(inventoryListForRegion[inv].multiplier));
                                        myArray[index].adjustment = Number(myArray[index].adjustment) + (Number(batchListForInventory[b].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier));
                                    }
                                    var index = myArray.findIndex(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                    actualBatchQtyTotal += (Number(batchListForInventory[b].actualQty) * Number(inventoryListForRegion[inv].multiplier));
                                }
                            } else {
                                if (inventoryListForRegion[inv].adjustmentQty !== "" && inventoryListForRegion[inv].adjustmentQty != null && inventoryListForRegion[inv].adjustmentQty != undefined) {
                                    adjustmentQty += (Number(inventoryListForRegion[inv].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier));
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
                                                adjustment: (Number(batchListForInventory[b].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier)),
                                                stock: 0,
                                                shipment: 0,
                                                shipmentWps: 0,
                                                expiredQty: 0,
                                                expiredQtyWps: 0
                                            }
                                            myArray.push(json);
                                            adjustmentBatchQtyTotal += (Number(batchListForInventory[b].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier));
                                        }
                                    } else {
                                        myArray[index].adjustment = Number(myArray[index].adjustment) + (Number(batchListForInventory[b].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier));
                                        if (myArray[index].stock == 0) {
                                            adjustmentBatchQtyTotal += (Number(batchListForInventory[b].adjustmentQty) * Number(inventoryListForRegion[inv].multiplier));
                                        }
                                    }
                                }
                            }
                        }
                    }
                    var consumptionList = (programJson.consumptionList).filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.planningUnit.id == planningUnitId && c.active.toString() == "true");
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
                            actualConsumptionQty += ((consumptionList[c].consumptionRcpuQty) * Number(consumptionList[c].multiplier));
                            if (consumptionList[c].dayOfStockOut > 0) {
                                var daysPerMonth = moment(startDate).daysInMonth();
                                var daysOfData = daysPerMonth - consumptionList[c].dayOfStockOut;
                                if (daysOfData > 0) {
                                    var trueDemandPerDay = ((consumptionList[c].consumptionRcpuQty) * Number(consumptionList[c].multiplier)) / daysOfData;
                                    trueDemandPerMonth += (trueDemandPerDay * daysPerMonth);
                                }
                            } else {
                                trueDemandPerMonth += ((consumptionList[c].consumptionRcpuQty) * Number(consumptionList[c].multiplier))
                            }
                            var index = regionsReportingActualConsumption.findIndex(f => f == consumptionList[c].region.id);
                            if (index == -1) {
                                regionsReportingActualConsumption.push(consumptionList[c].region.id);
                            }
                        } else {
                            forecastedConsumptionQty += ((consumptionList[c].consumptionRcpuQty) * Number(consumptionList[c].multiplier))
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
                                            consumption: (Number(batchListForConsumption[b].consumptionQty) * Number(consumptionListForActualConsumption[ac].multiplier)),
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
                                    myArray[index].consumption = Number(myArray[index].consumption) + (Number(batchListForConsumption[b].consumptionQty) * Number(consumptionListForActualConsumption[ac].multiplier));
                                }
                                var index = myArray.findIndex(c => c.batchNo == batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(expiryDate).format("YYYY-MM"));
                                consumptionBatchQtyTotal += (Number(batchListForConsumption[b].consumptionQty) * Number(consumptionListForActualConsumption[ac].multiplier));
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
                    var useInventoryCalculations = false;
                    var batchInventoryList = generalProgramJson.batchInventoryList;
                    if (batchInventoryList == undefined) {
                        batchInventoryList = [];
                    }
                    var batchInventoryListFilter = batchInventoryList.filter(c => moment(c.inventoryDate).format("YYYY-MM") == moment(startDate).format("YYYY-MM"));
                    if (batchInventoryListFilter.length > 0) {
                        var inventoryListForRegionFilter = inventoryList.filter(c => c.region != null && c.region.id != 0 && c.actualQty != undefined && c.actualQty != null && c.actualQty !== "" && c.active.toString() == "true");
                        if (inventoryListForRegionFilter.length == totalNoOfRegions) {
                            var stock = 0;
                            inventoryListForRegionFilter.map(item => {
                                stock += Number(item.actualQty)
                            })
                            var batchQty = 0;
                            var batchInfoList = batchInventoryListFilter[0].batchList;
                            batchInfoList.map(item => {
                                batchQty += Number(item.qty)
                            })
                            if (Number(stock) == Number(batchQty)) {
                                useInventoryCalculations = true;
                            }
                            batchInfoList.map(item => {
                                var index = myArray.findIndex(c => c.batchNo == item.batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(item.batch.expiryDate).format("YYYY-MM"));
                                if (index == -1) {
                                    var bd = batchDetailsFromProgramJson.filter(c => c.batchNo == item.batch.batchNo && moment(c.expiryDate).format("YYYY-MM") == moment(item.batch.expiryDate).format("YYYY-MM"));
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
                                            adjustment: 0,
                                            stock: 0,
                                            shipment: 0,
                                            shipmentWps: 0,
                                            expiredQty: 0,
                                            expiredQtyWps: 0
                                        }
                                        myArray.push(json);
                                    }
                                }
                            })
                        }
                    }
                    myArray = myArray.sort(function (a, b) { return ((new Date(a.expiryDate) - new Date(b.expiryDate)) || (a.batchId - b.batchId)) })
                    if(useInventoryCalculations){
                        for(var a=0;a<myArray.length;a++){
                            var batchListForInventory=batchInventoryListFilter[0].batchList.filter(c=>c.batch.batchNo==myArray[a].batchNo && moment(c.batch.expiryDate).format("YYYY-MM")==moment(myArray[a].expiryDate).format("YYYY-MM"));
                            myArray[a].closingBalance=batchListForInventory.length>0?Number(batchListForInventory[0].qty):0;
                            myArray[a].closingBalanceWps=batchListForInventory.length>0?Number(batchListForInventory[0].qty):0
                            myArray[a].qty=batchListForInventory.length>0?Number(batchListForInventory[0].qty):0;
                            myArray[a].qtyWps=batchListForInventory.length>0?Number(batchListForInventory[0].qty):0
                            myArray[a].unallocatedFEFO=0;
                            myArray[a].unallocatedFEFOWps=0;
                            myArray[a].unallocatedLEFO=0;
                            myArray[a].unallocatedLEFOWps=0;
                            myArray[a].calculatedFEFO=0;
                            myArray[a].calculatedFEFOWps=0;
                            myArray[a].calculatedLEFO=0;
                            myArray[a].calculatedLEFOWps=0;
                        }
                    }else{
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
                        var adjustment = Number(myArray[a].adjustment);
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
                        var checkIfBatchExists = batchDetailsFromProgramJson.findIndex(c => moment(c.createdDate).format("YYYY-MM-DD") == moment(startDate).format("YYYY-MM-DD") && moment(c.expiryDate).format("YYYY-MM-DD") == moment(startDate).add(programPlanningUnitList.shelfLife, 'months').format("YYYY-MM-DD"));
                        if (checkIfBatchExists == -1) {
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
                                planningUnitId: planningUnitId,
                                expiryDate: moment(startDate).add(programPlanningUnitList.shelfLife, 'months').format("YYYY-MM-DD"),
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
                                shelfLife: programPlanningUnitList.shelfLife,
                                expiryDate: moment(startDate).add(programPlanningUnitList.shelfLife, 'months').format("YYYY-MM-DD"),
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
                            shipmentQtyWps: myArray[ma].shipmentWps
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
                        var amcFilter = (programJson.consumptionList).filter(c => (c.consumptionDate >= amcDate && c.consumptionDate <= amcDate) && c.planningUnit.id == programPlanningUnitList.planningUnit.id && c.active.toString() == "true");
                        for (var c = 0; c < amcFilter.length; c++) {
                            if (amcFilter[c].actualFlag.toString() == "true") {
                                var daysPerMonthPast = moment(amcDate).daysInMonth();
                                var daysOfDataPast = daysPerMonthPast - Number(amcFilter[c].dayOfStockOut);
                                var trueDemandPerDayPast = ((amcFilter[c].consumptionRcpuQty) * Number(amcFilter[c].multiplier)) / daysOfDataPast;
                                var trueDemandPerMonth1 = (trueDemandPerDayPast * daysPerMonthPast);
                                actualConsumptionQtyAmc += daysOfDataPast > 0 ? trueDemandPerMonth1 : 0;
                                var index = regionsReportingActualConsumptionAmc.findIndex(f => f == amcFilter[c].region.id);
                                if (index == -1) {
                                    regionsReportingActualConsumptionAmc.push(amcFilter[c].region.id);
                                }
                            } else {
                                forecastedConsumptionQtyAmc += ((amcFilter[c].consumptionRcpuQty) * Number(amcFilter[c].multiplier));
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
                    var monthsInPastForAmc = programPlanningUnitList.monthsInPastForAmc;
                    if (monthsInPastForAMC != undefined) {
                        monthsInPastForAmc = monthsInPastForAMC
                    }
                    var monthsInFutureForAmc = programPlanningUnitList.monthsInFutureForAmc;
                    if (monthsInFutureForAMC != undefined) {
                        monthsInFutureForAmc = monthsInFutureForAMC
                    }
                    for (var ap = 0; ap < monthsInFutureForAmc; ap++) {
                        var amcDate = moment(startDate).add(ap, 'months').startOf('month').format("YYYY-MM-DD");
                        var actualConsumptionQtyAmc = 0;
                        var forecastedConsumptionQtyAmc = 0;
                        var consumptionQtyAmc = 0;
                        var regionsReportingActualConsumptionAmc = []
                        var noOfRegionsReportingActualConsumptionAmc = []
                        var amcFilter = (programJson.consumptionList).filter(c => (c.consumptionDate >= amcDate && c.consumptionDate <= amcDate) && c.planningUnit.id == planningUnitId && c.active.toString() == "true");
                        for (var c = 0; c < amcFilter.length; c++) {
                            if (amcFilter[c].actualFlag.toString() == "true") {
                                var daysPerMonthPast = moment(amcDate).daysInMonth();
                                var daysOfDataPast = daysPerMonthPast - Number(amcFilter[c].dayOfStockOut);
                                var trueDemandPerDayPast = ((amcFilter[c].consumptionRcpuQty) * Number(amcFilter[c].multiplier)) / daysOfDataPast;
                                var trueDemandPerMonth1 = (trueDemandPerDayPast * daysPerMonthPast);
                                actualConsumptionQtyAmc += daysOfDataPast > 0 ? trueDemandPerMonth1 : 0;
                                var index = regionsReportingActualConsumptionAmc.findIndex(f => f == amcFilter[c].region.id);
                                if (index == -1) {
                                    regionsReportingActualConsumptionAmc.push(amcFilter[c].region.id);
                                }
                            } else {
                                forecastedConsumptionQtyAmc += ((amcFilter[c].consumptionRcpuQty) * Number(amcFilter[c].multiplier));
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
                    // var cutOffDate=generalProgramJson.cutOffDate!=undefined&&generalProgramJson.cutOffDate!=null&&generalProgramJson.cutOffDate!=""?generalProgramJson.cutOffDate:"";
                    // if(cutOffDate!="" && moment(createdDate).format("YYYY-MM")<=moment(cutOffDate).add(monthsInPastForAmc-1,'months').format("YYYY-MM")){
                    //     amc=null;
                    // }
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
                    var minForMonths = 0;
                    var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
                    if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + programPlanningUnitList.reorderFrequencyInMonths)) {
                        minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
                    } else {
                        minForMonths = (maxForMonths + programPlanningUnitList.reorderFrequencyInMonths);
                    }
                    var maxStockMoSQty = Number(minForMonths);
                    var minStock = 0;
                    var maxStock = 0;
                    if (programPlanningUnitList.planBasedOn == 2) {
                        minStock = programPlanningUnitList.minQty;
                        maxStock = Number(Number(programPlanningUnitList.minQty) + Number(programPlanningUnitList.reorderFrequencyInMonths) * Number(amc)).toFixed(8);
                        minStockMoSQty = Number(Number(programPlanningUnitList.minQty) / Number(amc)).toFixed(8);
                        maxStockMoSQty = Number(Number(Number(programPlanningUnitList.minQty) / Number(amc)) + Number(programPlanningUnitList.reorderFrequencyInMonths)).toFixed(8);
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
                    if (regionsReportingActualInventory != totalNoOfRegions) {
                        if (closingBalance <= 0) {
                            unmetDemandQty = 0 - expectedStock + diffBetweenTrueDemandAndConsumption;
                            closingBalance = 0;
                        } else {
                            unmetDemandQty = diffBetweenTrueDemandAndConsumption;
                        }
                        if (closingBalanceWps <= 0) {
                            unmetDemandQtyWps = 0 - expectedStockWps + diffBetweenTrueDemandAndConsumption;
                            closingBalanceWps = 0;
                        } else {
                            unmetDemandQtyWps = diffBetweenTrueDemandAndConsumption;
                        }
                    } else {
                        unmetDemandQty = diffBetweenTrueDemandAndConsumption;
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
            }
        } else {
        }
        curDate = moment(startDate1).add(s, 'months').format("YYYY-MM-DD");
    }
    programJsonForStoringTheResult.batchInfoList = programJson.batchInfoList;
    programJsonForStoringTheResult.supplyPlan = programJson.supplyPlan;
    programJsonForStoringTheResult.shipmentList = programJson.shipmentList;
    var planningUnitDataList = programDataJson.planningUnitDataList;
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
            calculateSupplyPlan(programIdParam, planningUnitId, "whatIfProgramData", "whatIf", props, [], startDate1, '', false, false, monthsInPastForAmc, monthsInFutureForAmc)
        }.bind(this)
    }.bind(this)
}