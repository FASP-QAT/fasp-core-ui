function minMax() {
    var m = moment(Date.now()).utcOffset('-0500').format("YYYY-MM-DD");
    var mStartDate = moment(m).startOf('month').format("YYYY-MM-DD");
    var mEndDate = moment(m).endOf('month').format("YYYY-MM-DD");

    var programId = programList[pp].programId;
    var regionId = -1;
    var planningUnitId = planningUnitList[p].planningUnit.id;

    var programPlanningUnit = planningUnitList[p];
    var minMonthsOfStock = programPlanningUnit.minMonthsOfStock;
    var reorderFrequencyInMonths = programPlanningUnit.reorderFrequencyInMonths;

    var regionListFiltered = regionList;
    // console.log("regionList----->", regionList);

    var consumptionTotalData = [];
    var shipmentsTotalData = [];
    var manualShipmentsTotalData = [];
    var deliveredShipmentsTotalData = [];
    var shippedShipmentsTotalData = [];
    var orderedShipmentsTotalData = [];
    var plannedShipmentsTotalData = [];
    var erpShipmentsTotalData = [];
    var deliveredErpShipmentsTotalData = [];
    var shippedErpShipmentsTotalData = [];
    var orderedErpShipmentsTotalData = [];
    var plannedErpShipmentsTotalData = [];
    var totalExpiredStockArr = [];

    var consumptionDataForAllMonths = [];
    var amcTotalData = [];

    var consumptionTotalMonthWise = [];
    var filteredArray = [];
    var minStockArray = [];
    var maxStockArray = [];
    var minStockMoS = [];
    var maxStockMoS = [];

    var inventoryTotalData = [];
    var expectedBalTotalData = [];
    var suggestedShipmentsTotalData = [];
    var inventoryTotalMonthWise = [];
    var filteredArrayInventory = [];
    var openingBalanceArray = [];
    var closingBalanceArray = [];
    var jsonArrForGraph = [];
    var monthsOfStockArray = [];
    var unmetDemand = [];
    var unallocatedConsumption = [];
    var unallocatedAdjustments = [];

    var programJson = programList[pp];
    console.log("************ProgramJson***********", programJson);
    var shelfLife = programPlanningUnit.shelfLife;
    var monthsInPastForAMC = programPlanningUnit.monthsInPastForAmc;
    var monthsInFutureForAMC = programPlanningUnit.monthsInFutureForAmc;
    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);

    var consumptionQty = 0;
    for (var reg = 0; reg < regionListFiltered.length; reg++) {
        var c = consumptionList.filter(c => (c.consumptionDate >= mStartDate && c.consumptionDate <= mEndDate) && c.region.id == regionListFiltered[reg].regionId);
        for (var j = 0; j < c.length; j++) {
            var count = 0;
            for (var k = 0; k < c.length; k++) {
                if (c[j].consumptionDate == c[k].consumptionDate && c[j].region.id == c[k].region.id && j != k) {
                    count++;
                } else {

                }
            }
            if (count == 0) {
                consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
            } else {
                if (c[j].actualFlag.toString() == 'true') {
                    consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                }
            }
        }
    }

    var consumptionQtyForEB = consumptionQty;
    // Calculations for AMC
    var amcBeforeArray = [];
    var amcAfterArray = [];
    for (var c = 0; c < monthsInPastForAMC; c++) {
        var month1MonthsBefore = moment(mStartDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
        var currentMonth1Before = moment(mEndDate).subtract(c + 1, 'months').format("YYYY-MM-DD");
        var consumptionListForAMC = consumptionList.filter(con => con.consumptionDate >= month1MonthsBefore && con.consumptionDate <= currentMonth1Before);
        if (consumptionListForAMC.length > 0) {
            var consumptionQty = 0;
            for (var j = 0; j < consumptionListForAMC.length; j++) {
                var count = 0;
                for (var k = 0; k < consumptionListForAMC.length; k++) {
                    if (consumptionListForAMC[j].consumptionDate == consumptionListForAMC[k].consumptionDate && consumptionListForAMC[j].region.id == consumptionListForAMC[k].region.id && j != k) {
                        count++;
                    } else {

                    }
                }

                if (count == 0) {
                    consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                } else {
                    if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                        consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                    }
                }
            }
            amcBeforeArray.push({ consumptionQty: consumptionQty });
            var amcArrayForMonth = amcBeforeArray;
            if (amcArrayForMonth.length == monthsInPastForAMC) {
                c = monthsInPastForAMC;
            }
        }

    }

    for (var c = 0; c < monthsInFutureForAMC; c++) {
        var month1MonthsAfter = moment(mStartDate).add(c, 'months').format("YYYY-MM-DD");
        var currentMonth1After = moment(mEndDate).add(c, 'months').format("YYYY-MM-DD");
        var consumptionListForAMC = consumptionList.filter(con => con.consumptionDate >= month1MonthsAfter && con.consumptionDate <= currentMonth1After);
        if (consumptionListForAMC.length > 0) {
            var consumptionQty = 0;
            for (var j = 0; j < consumptionListForAMC.length; j++) {
                var count = 0;
                for (var k = 0; k < consumptionListForAMC.length; k++) {
                    if (consumptionListForAMC[j].consumptionDate == consumptionListForAMC[k].consumptionDate && consumptionListForAMC[j].region.id == consumptionListForAMC[k].region.id && j != k) {
                        count++;
                    } else {

                    }
                }

                if (count == 0) {
                    consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                } else {
                    if (consumptionListForAMC[j].actualFlag.toString() == 'true') {
                        consumptionQty += parseInt((consumptionListForAMC[j].consumptionQty));
                    }
                }
            }
            amcAfterArray.push({ consumptionQty: consumptionQty });
            var amcArrayForMonth = amcAfterArray;
            if (amcArrayForMonth.length == monthsInFutureForAMC) {
                c = monthsInFutureForAMC;
            }
        }

    }
    var amcArray = amcBeforeArray.concat(amcAfterArray);
    var amcArrayFilteredForMonth = amcArray;
    var countAMC = amcArrayFilteredForMonth.length;
    var sumOfConsumptions = 0;
    for (var amcFilteredArray = 0; amcFilteredArray < amcArrayFilteredForMonth.length; amcFilteredArray++) {
        sumOfConsumptions += amcArrayFilteredForMonth[amcFilteredArray].consumptionQty
    }
    if (countAMC != 0) {
        var amcCalcualted = Math.ceil((sumOfConsumptions) / countAMC);

        // Calculations for Min stock
        var maxForMonths = 0;
        var realm = programJson.realmCountry.realm;
        var DEFAULT_MIN_MONTHS_OF_STOCK = realm.minMosMinGaurdrail;
        if (DEFAULT_MIN_MONTHS_OF_STOCK > minMonthsOfStock) {
            maxForMonths = DEFAULT_MIN_MONTHS_OF_STOCK
        } else {
            maxForMonths = minMonthsOfStock
        }
        var minStock = parseInt(parseInt(amcCalcualted) * parseInt(maxForMonths));


        // Calculations for Max Stock
        var minForMonths = 0;
        var DEFAULT_MAX_MONTHS_OF_STOCK = realm.maxMosMaxGaurdrail;
        if (DEFAULT_MAX_MONTHS_OF_STOCK < (maxForMonths + reorderFrequencyInMonths)) {
            minForMonths = DEFAULT_MAX_MONTHS_OF_STOCK
        } else {
            minForMonths = (maxForMonths + reorderFrequencyInMonths);
        }
        var maxStock = parseInt(parseInt(amcCalcualted) * parseInt(minForMonths));
    } else {
    }


    // Inventory part
    var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
    if (regionId != -1) {
        inventoryList = inventoryList.filter(c => c.region.id == regionId)
    }
    var adjustmentQty = 0;
    for (var reg = 0; reg < regionListFiltered.length; reg++) {
        var c = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
        for (var j = 0; j < c.length; j++) {
            adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
        }
    }
    var c1 = inventoryList.filter(c => (c.inventoryDate >= mStartDate && c.inventoryDate <= mEndDate) && c.region == null);
    for (var j = 0; j < c1.length; j++) {
        adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
    }

    // Shipments updated part

    // Shipments part
    var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
    var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= mStartDate && c.expectedDeliveryDate <= mEndDate))
    var shipmentTotalQty = 0;
    for (var j = 0; j < shipmentArr.length; j++) {
        shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
    }

    // Calculations for exipred stock
    var batchInfoForPlanningUnit = programJson.batchInfoList.filter(c => c.planningUnitId == planningUnitId);
    var myArray = batchInfoForPlanningUnit.sort(function (a, b) { return new Date(a.expiryDate) - new Date(b.expiryDate) })
    for (var ma = 0; ma < myArray.length; ma++) {
        var shipmentList = programJson.shipmentList;
        var shipmentBatchArray = [];
        for (var ship = 0; ship < shipmentList.length; ship++) {
            var batchInfoList = shipmentList[ship].batchInfoList;
            for (var bi = 0; bi < batchInfoList.length; bi++) {
                shipmentBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].shipmentQty })
            }
        }
        var stockForBatchNumber = shipmentBatchArray.filter(c => c.batchNo == myArray[ma].batchNo)[0];
        var totalStockForBatchNumber = stockForBatchNumber.qty;
        var consumptionList = programJson.consumptionList;
        var consumptionBatchArray = [];

        for (var con = 0; con < consumptionList.length; con++) {
            var batchInfoList = consumptionList[con].batchInfoList;
            for (var bi = 0; bi < batchInfoList.length; bi++) {
                consumptionBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].consumptionQty })
            }
        }
        var consumptionForBatchNumber = consumptionBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
        if (consumptionForBatchNumber == undefined) {
            consumptionForBatchNumber = [];
        }
        var consumptionQty = 0;
        for (var b = 0; b < consumptionForBatchNumber.length; b++) {
            consumptionQty += parseInt(consumptionForBatchNumber[b].qty);
        }
        var inventoryList = programJson.inventoryList;
        var inventoryBatchArray = [];
        for (var inv = 0; inv < inventoryList.length; inv++) {
            var batchInfoList = inventoryList[inv].batchInfoList;
            for (var bi = 0; bi < batchInfoList.length; bi++) {
                inventoryBatchArray.push({ batchNo: batchInfoList[bi].batch.batchNo, qty: batchInfoList[bi].adjustmentQty * inventoryList[inv].multiplier })
            }
        }
        var inventoryForBatchNumber = [];
        if (inventoryBatchArray.length > 0) {
            inventoryForBatchNumber = inventoryBatchArray.filter(c => c.batchNo == myArray[ma].batchNo);
        }
        if (inventoryForBatchNumber == undefined) {
            inventoryForBatchNumber = [];
        }
        var adjustmentQty = 0;
        for (var b = 0; b < inventoryForBatchNumber.length; b++) {
            adjustmentQty += parseFloat(inventoryForBatchNumber[b].qty);
        }
        var remainingBatchQty = parseInt(totalStockForBatchNumber) - parseInt(consumptionQty) + parseFloat(adjustmentQty);
        myArray[ma].remainingQty = remainingBatchQty;
    }
    // console.log("MyArray", myArray);

    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
    var inventoryList = (programJson.inventoryList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
    var curDate = moment(Date.now()).format("YYYY-MM-DD");
    for (var i = 0; createdDate < curDate; i++) {
        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
        var consumptionQty = 0;
        var unallocatedConsumptionQty = 0;
        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
        for (var reg = 0; reg < regionListFiltered.length; reg++) {
            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
            for (var j = 0; j < c.length; j++) {
                var count = 0;
                for (var k = 0; k < c.length; k++) {
                    if (c[j].consumptionDate == c[k].consumptionDate && c[j].region.id == c[k].region.id && j != k) {
                        count++;
                    } else {

                    }
                }
                if (count == 0) {
                    consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                    var qty = 0;
                    if (c[j].batchInfoList.length > 0) {
                        for (var a = 0; a < c[j].batchInfoList.length; a++) {
                            qty += parseInt((c[j].batchInfoList)[a].consumptionQty);
                        }
                    }
                    var remainingQty = parseInt((c[j].consumptionQty)) - parseInt(qty);
                    unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
                } else {
                    if (c[j].actualFlag.toString() == 'true') {
                        consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                        var qty = 0;
                        if (c[j].batchInfoList.length > 0) {
                            for (var a = 0; a < c[j].batchInfoList.length; a++) {
                                qty += parseInt((c[j].batchInfoList)[a].consumptionQty);
                            }
                        }
                        var remainingQty = parseInt((c[j].consumptionQty)) - parseInt(qty);
                        unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) + parseInt(remainingQty);
                    }
                }
            }
        }

        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))));
        // console.log("--------------------------------------------------------------");
        // console.log("Start date", startDate);
        var adjustmentQty = 0;
        var unallocatedAdjustmentQty = 0;
        for (var reg = 0; reg < regionListFiltered.length; reg++) {
            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
            for (var j = 0; j < c.length; j++) {
                adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                var qty1 = 0;
                if (c[j].batchInfoList.length > 0) {
                    for (var a = 0; a < c[j].batchInfoList.length; a++) {
                        qty1 += parseFloat(parseInt((c[j].batchInfoList)[a].adjustmentQty) * c[j].multiplier);
                    }
                }
                var remainingQty = parseFloat((c[j].adjustmentQty * c[j].multiplier)) - parseFloat(qty1);
                unallocatedAdjustmentQty = parseFloat(remainingQty);
                if (unallocatedAdjustmentQty > 0) {
                    if (batchDetailsForParticularPeriod.length > 0) {
                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                        batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                        unallocatedAdjustmentQty = 0;
                    }
                }

            }
        }
        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
        for (var j = 0; j < c1.length; j++) {
            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
            unallocatedAdjustmentQty = parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
            if (unallocatedAdjustmentQty > 0) {
                if (batchDetailsForParticularPeriod.length > 0) {
                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[0].remainingQty), "Batch no", batchDetailsForParticularPeriod[0].batchNo);
                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                    batchDetailsForParticularPeriod[0].remainingQty = batchDetailsForParticularPeriod[0].remainingQty + unallocatedAdjustmentQty;
                    unallocatedAdjustmentQty = 0;
                }
            }
        }
        var batchDetailsForParticularPeriod = myArray.filter(c => (moment(c.createdDate).format("YYYY-MM-DD") <= moment(startDate).format("YYYY-MM-DD")) && ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && (c.remainingQty > 0));
        for (var ua = 0; unallocatedConsumptionQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua < batchDetailsForParticularPeriod.length; ua++) {
            // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua].batchNo);
            // console.log("Unallocated consumption", unallocatedConsumptionQty);
            var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua].batchNo);
            if (parseInt(batchDetailsForParticularPeriod[ua].remainingQty) >= parseInt(unallocatedConsumptionQty)) {
                myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua].remainingQty) - parseInt(unallocatedConsumptionQty);
                unallocatedConsumptionQty = 0
            } else {
                var rq = batchDetailsForParticularPeriod[ua].remainingQty;
                myArray[index].remainingQty = 0;
                unallocatedConsumptionQty = parseInt(unallocatedConsumptionQty) - parseInt(rq);
            }
        }
        var adjustmentQty = 0;
        var unallocatedAdjustmentQty = 0;
        for (var reg = 0; reg < regionListFiltered.length; reg++) {
            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
            for (var j = 0; j < c.length; j++) {
                adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
                var qty1 = 0;
                if (c[j].batchInfoList.length > 0) {
                    for (var a = 0; a < c[j].batchInfoList.length; a++) {
                        qty1 += parseFloat(parseInt((c[j].batchInfoList)[a].adjustmentQty) * c[j].multiplier);
                    }
                }
                var remainingQty = parseFloat((c[j].adjustmentQty * c[j].multiplier)) - parseFloat(qty1);
                unallocatedAdjustmentQty = parseFloat(remainingQty);
                if (unallocatedAdjustmentQty < 0) {
                    for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                        // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                        // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                        var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
                        if (parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
                            myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
                            unallocatedAdjustmentQty = 0
                        } else {
                            var rq = batchDetailsForParticularPeriod[ua - 1].remainingQty;
                            myArray[index].remainingQty = 0;
                            unallocatedAdjustmentQty = parseInt(unallocatedAdjustmentQty) + parseInt(rq);
                        }
                    }
                } else {
                }

            }
        }
        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
        for (var j = 0; j < c1.length; j++) {
            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
            unallocatedAdjustmentQty = parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
            if (unallocatedAdjustmentQty < 0) {
                for (var ua = batchDetailsForParticularPeriod.length; unallocatedAdjustmentQty != 0 && batchDetailsForParticularPeriod.length > 0 && ua != 0; ua--) {
                    // console.log("Remaining Qty", parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty), "Batch no", batchDetailsForParticularPeriod[ua - 1].batchNo);
                    // console.log("Unallocated adjustments", unallocatedAdjustmentQty);
                    var index = myArray.findIndex(c => c.batchNo == batchDetailsForParticularPeriod[ua - 1].batchNo);
                    if (parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty) > 0) {
                        myArray[index].remainingQty = parseInt(batchDetailsForParticularPeriod[ua - 1].remainingQty) + parseInt(unallocatedAdjustmentQty);
                        unallocatedAdjustmentQty = 0
                    } else {
                        var rq = batchDetailsForParticularPeriod[ua - 1].remainingQty;
                        myArray[index].remainingQty = 0;
                        unallocatedAdjustmentQty = parseInt(unallocatedAdjustmentQty) + parseInt(rq);
                    }
                }
            } else {
            }
        }

    }

    // console.log("My array after accounting all the calcuklations", myArray);
    var expiredStockArr = myArray;

    // Calculation of opening and closing balance
    var consumptionList = (programJson.consumptionList).filter(c => c.planningUnit.id == planningUnitId && c.active == true);
    var createdDate = moment('2017-01-01').format("YYYY-MM-DD");
    var firstDataEntryDate = moment('2017-01-01').format("YYYY-MM-DD");
    var curDate = moment(Date.now()).subtract(1, 'months').format("YYYY-MM-DD");
    var openingBalance = 0;
    var expiredStockQty = 0;
    for (var i = 0; createdDate < curDate; i++) {
        createdDate = moment(firstDataEntryDate).add(i, 'months').format("YYYY-MM-DD");
        var consumptionQty = 0;
        var startDate = moment(createdDate).startOf('month').format("YYYY-MM-DD");
        var endDate = moment(createdDate).endOf('month').format("YYYY-MM-DD");
        for (var reg = 0; reg < regionListFiltered.length; reg++) {
            var c = consumptionList.filter(c => (c.consumptionDate >= startDate && c.consumptionDate <= endDate) && c.region.id == regionListFiltered[reg].regionId);
            for (var j = 0; j < c.length; j++) {
                var count = 0;
                for (var k = 0; k < c.length; k++) {
                    if (c[j].consumptionDate == c[k].consumptionDate && c[j].region.id == c[k].region.id && j != k) {
                        count++;
                    } else {

                    }
                }
                if (count == 0) {
                    consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                } else {
                    if (c[j].actualFlag.toString() == 'true') {
                        consumptionQty = consumptionQty + parseInt((c[j].consumptionQty));
                    }
                }

            }
        }
        // console.log("main consumption====>", consumptionQty);
        // Inventory part
        var inventoryList = (programJson.inventoryList).filter(c => c.active == true && c.planningUnit.id == planningUnitId);
        var adjustmentQty = 0;
        for (var reg = 0; reg < regionListFiltered.length; reg++) {
            var c = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region != null && c.region.id == regionListFiltered[reg].regionId);
            for (var j = 0; j < c.length; j++) {
                adjustmentQty += parseFloat((c[j].adjustmentQty * c[j].multiplier));
            }
        }
        var c1 = inventoryList.filter(c => (c.inventoryDate >= startDate && c.inventoryDate <= endDate) && c.region == null);
        for (var j = 0; j < c1.length; j++) {
            adjustmentQty += parseFloat((c1[j].adjustmentQty * c1[j].multiplier));
        }
        var adjustmentQtyForEB = adjustmentQty;

        // Shipments part
        var shipmentList = (programJson.shipmentList).filter(c => c.active == true && c.planningUnit.id == planningUnitId && c.shipmentStatus.id != CANCELLED_SHIPMENT_STATUS && c.accountFlag == true);
        var shipmentArr = shipmentList.filter(c => (c.expectedDeliveryDate >= startDate && c.expectedDeliveryDate <= endDate))
        var shipmentTotalQty = 0;
        for (var j = 0; j < shipmentArr.length; j++) {
            shipmentTotalQty += parseInt((shipmentArr[j].shipmentQty));
        }

        var expiredStock = expiredStockArr.filter(c => ((moment(c.expiryDate).format("YYYY-MM-DD")) >= (moment(startDate).format("YYYY-MM-DD"))) && ((moment(c.expiryDate).format("YYYY-MM-DD")) <= (moment(endDate).format("YYYY-MM-DD"))));
        expiredStockQty = 0;
        for (var j = 0; j < expiredStock.length; j++) {
            expiredStockQty += parseInt((expiredStock[j].remainingQty));
        }
        // console.log("created date 0===>", createdDate)
        // console.log("$$$$$$ 1====>", openingBalance);
        // console.log("$$$$$$ 2====>", shipmentTotalQty);

        // console.log("$$$$$$ 3====>", adjustmentQty);
        // console.log("$$$$$$ 4====>", consumptionQty);
        // console.log("$$$$$$ 5====>", expiredStockQty)


        var closingBalance = parseInt(openingBalance) + parseInt(shipmentTotalQty) + parseFloat(adjustmentQty) - parseInt(consumptionQty) - parseInt(expiredStockQty);
        if (closingBalance < 0) {
            closingBalance = 0;
        }
        // console.log("closing balance===>", closingBalance);
        openingBalance = closingBalance;
    }
    // console.log("Total exipred stock", totalExpiredStockArr);




    // Calculations for monthsOfStock
    // console.log("closing balance===>", closingBalance, "AMC====>", amcCalcualted);
    if (closingBalance != 0 && amcCalcualted != 0 && closingBalance != "" && amcCalcualted != "") {
        var mos = parseFloat(closingBalance / amcCalcualted).toFixed(2);
    } else {
        var mos = "";
    }
    console.log("mos----------->", mos);
    console.log("minStock mos", maxForMonths);
    console.log("maxStock mos", minForMonths)

}