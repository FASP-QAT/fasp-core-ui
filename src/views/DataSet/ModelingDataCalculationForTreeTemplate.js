import moment from 'moment';

export function calculateModelingData(dataset, props, page, nodeId, scenarioId, type, treeId, isTemplate) {
    console.log("modelling dataset---", dataset);
    // console.log("modeling nodeId---", nodeId);
    // console.log("modelling scenarioId---", scenarioId);
    nodeId = -1;

    // var db1;
    // getDatabase();
    // var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    // openRequest.onerror = function (event) {
    // }.bind(this);
    // openRequest.onsuccess = function (e) {
    //     db1 = e.target.result;
    //     var datasetDataBytes = CryptoJS.AES.decrypt(dataset.programData, SECRET_KEY);
    //     var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
    var datasetJson = {};
    if (!isTemplate) {
        datasetJson = dataset.programData;
    } else {
        datasetJson = dataset;
    }
    var allNodeDataList = [];
    // console.log("datasetJson modeling--->", datasetJson.treeList);
    var treeList = [];
    if (!isTemplate) {
        treeList = datasetJson.treeList;
    } else {
        treeList = [
            {
                tree: {
                    flatList: datasetJson.flatList
                },
                scenarioList: [{
                    id: 0
                }]
            }
        ]
    }
    if (treeId != -1) {
        treeList = treeList.filter(c => c.treeId == treeId);
    }
    for (var tl = 0; tl < treeList.length; tl++) {
        var tree = treeList[tl];
        var flatListUnsorted = tree.tree.flatList;
        var sortOrderArray = [...new Set(flatListUnsorted.map(ele => (ele.sortOrder)))];
        var sortedArray = sortOrderArray.sort();
        var flatList = [];
        for (var i = 0; i < sortedArray.length; i++) {
            flatList.push(flatListUnsorted.filter(c => c.sortOrder == sortedArray[i])[0]);
        }
        var transferToNodeList = [];
        // if (nodeId != -1) {
        //     var curNode = flatList.filter(c => c.id == nodeId)[0];
        //     var currentNodeType = curNode.payload.nodeType.id;
        //     var parentNodeType = curNode.parent != null ? flatList.filter(c => c.id == curNode.parent)[0].payload.nodeType.id : 0;
        //     if (currentNodeType == 2 && parentNodeType == 1) {

        //     } else {
        //         flatList = flatList.filter(c => c.id == nodeId);
        //     }
        // }
        for (var fl = 0; fl < flatList.length; fl++) {
            var payload = flatList[fl].payload;
            if (payload.nodeType.id != 1) {
                var nodeDataMap = payload.nodeDataMap;
                var scenarioList = tree.scenarioList;
                if (scenarioId != -1) {
                    scenarioList = scenarioList.filter(c => c.id == scenarioId);
                }
                for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                    var nodeDataMapForScenario = (nodeDataMap[scenarioList[ndm].id])[0];
                    var nodeDataModelingListUnFiltered = (nodeDataMapForScenario.nodeDataModelingList);
                    var hasTransferNodeIdList = nodeDataModelingListUnFiltered.filter(c => c.transferNodeDataId != null);

                    for (var tnl = 0; tnl < hasTransferNodeIdList.length; tnl++) {
                        // console.log("modeling datavalue 5---", hasTransferNodeIdList[tnl].dataValue)
                        transferToNodeList.push({
                            dataValue: 0 - hasTransferNodeIdList[tnl].dataValue,
                            modelingType: hasTransferNodeIdList[tnl].modelingType,
                            nodeDataModelingId: hasTransferNodeIdList[tnl].nodeDataModelingId,
                            notes: hasTransferNodeIdList[tnl].notes,
                            startDate: hasTransferNodeIdList[tnl].startDate,
                            startDateNo: hasTransferNodeIdList[tnl].startDateNo,
                            stopDate: hasTransferNodeIdList[tnl].stopDate,
                            stopDateNo: hasTransferNodeIdList[tnl].stopDateNo,
                            transferNodeDataId: -1,
                            nodeDataId: hasTransferNodeIdList[tnl].transferNodeDataId,
                            transferFromNodeDataId: flatList[fl].id,
                            increaseDecrease: 1
                        })
                    }


                }
            }


        }
        // console.log("Transfer To Node list###@@@", transferToNodeList);
        // console.log("FlatList###@@@", flatList)
        var maxLevel = Math.max.apply(Math, flatList.map(function (o) { return o.level; }))
        var sortedFlatList = [];
        var sortedFlatListId = [];
        var sortedFlatListNodeDataId = [];
        for (var ml = 0; ml <= maxLevel; ml++) {
            // console.log("Level###@@@", ml);
            var flatListForLevel = flatList.filter(c => c.level == ml && c.payload.nodeType.id != 1);
            for (var fll = 0; fll < flatListForLevel.length; fll++) {
                for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                    // console.log("fll###@@@", fll);
                    // Vo wali list lekar aao jiske calculations nhi hue hai
                    var filterFlatListWhoseCalculationsAreRemaining = flatListForLevel.filter(c => !sortedFlatListId.includes(c.id));
                    // console.log("filterFlatListWhoseCalculationsAreRemaining###@@@", filterFlatListWhoseCalculationsAreRemaining)
                    var leaveLoop = false;
                    for (var v = 0; (v < filterFlatListWhoseCalculationsAreRemaining.length && !leaveLoop); v++) {
                        var listOfTransferTo = transferToNodeList.filter(c => (filterFlatListWhoseCalculationsAreRemaining[v].payload.nodeDataMap[scenarioList[ndm].id])[0].nodeDataId == c.nodeDataId);
                        // console.log("Kya usme kuch transfer ho raha hai v###@@@", v)
                        // console.log("ListOf transfer to###@@@", listOfTransferTo);
                        if (listOfTransferTo.length == 0) {
                            // console.log("In if ###@@@");
                            sortedFlatList.push(filterFlatListWhoseCalculationsAreRemaining[v]);
                            sortedFlatListId.push(filterFlatListWhoseCalculationsAreRemaining[v].id);
                            sortedFlatListNodeDataId.push((filterFlatListWhoseCalculationsAreRemaining[v].payload.nodeDataMap[scenarioList[ndm].id])[0].nodeDataId);
                            leaveLoop = true;
                        } else {
                            // console.log("###@@@in else")
                            var checkIfAllFromCalculationsAreDone = listOfTransferTo.filter(c => sortedFlatListId.includes(c.transferFromNodeDataId));
                            // console.log("Check if all the calculations are done###@@@", checkIfAllFromCalculationsAreDone)
                            if (listOfTransferTo.length == checkIfAllFromCalculationsAreDone.length) {
                                sortedFlatList.push(filterFlatListWhoseCalculationsAreRemaining[v]);
                                sortedFlatListId.push(filterFlatListWhoseCalculationsAreRemaining[v].id);
                                sortedFlatListNodeDataId.push((filterFlatListWhoseCalculationsAreRemaining[v].payload.nodeDataMap[scenarioList[ndm].id])[0].nodeDataId);
                                leaveLoop = true;
                            }
                        }
                        // var flatListWhichIsNotDepended = filterFlatListWhoseCalculationsAreRemaining
                    }

                }
            }
        }
        var overallTransferList = [];
        // console.log("sortedFlatList###", sortedFlatList);
        flatList = sortedFlatList.concat(flatList.filter(c => c.payload.nodeType.id == 1)).concat(flatList.filter(c => c.payload.nodeType.id != 1 && !sortedFlatListId.includes(c.id)));
        console.log("FlatList$$$###", flatList);
        for (var fl = 0; fl < flatList.length; fl++) {
            // console.log("FlatList$$$", flatList[fl]);
            var payload = flatList[fl].payload;
            if (payload.nodeType.id != 1 && (payload.extrapolation == undefined || payload.extrapolation.toString() == "false")) {
                var nodeDataMap = payload.nodeDataMap;
                var scenarioList = tree.scenarioList;
                if (scenarioId != -1) {
                    scenarioList = scenarioList.filter(c => c.id == scenarioId);
                }
                // console.log("start date---", startDate);
                // console.log("stop date---", stopDate);
                // console.log("scenarioList---", scenarioList);
                for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                    var nodeDataMapForScenario = (nodeDataMap[scenarioList[ndm].id])[0];
                    var nodeDataModelingListUnFiltered = (nodeDataMapForScenario.nodeDataModelingList);
                    var transferNodeList = transferToNodeList.filter(c => c.nodeDataId == nodeDataMapForScenario.nodeDataId);
                    var nodeDataModelingListWithTransfer = nodeDataModelingListUnFiltered.concat(transferNodeList);
                    var curDate = nodeDataMapForScenario.monthNo;
                    var nodeDataList = [];
                    var calculatedMMdPatients = [];
                    var calculatedValueForLag = [];
                    var countOfI = -1;
                    for (var i = curDate; i <= datasetJson.monthsInFuture; i++) {
                        var test = 1;
                        if (i != 0) {
                            countOfI += 1;
                            var nodeDataModelingList = (nodeDataModelingListWithTransfer).filter(c => i >= c.startDateNo && i <= c.stopDateNo);
                            var nodeDataOverrideList = (nodeDataMapForScenario.nodeDataOverrideList);
                            var startValue = 0;
                            // console.log("nodeDataMapForScenario---", nodeDataMapForScenario)
                            if (i == nodeDataMapForScenario.monthNo) {
                                if (nodeDataMapForScenario.calculatedDataValue == null || payload.nodeType.id != 2) {
                                    // console.log("modeling datavalue 1---", nodeDataMapForScenario.dataValue)
                                    startValue = nodeDataMapForScenario.dataValue;
                                } else {
                                    startValue = nodeDataMapForScenario.calculatedDataValue;
                                }
                            } else if (i < nodeDataMapForScenario.monthNo) {
                                startValue = 0;
                            } else if (i > nodeDataMapForScenario.monthNo) {
                                var minusNumber = (i == 1 ? i - 2 : i - 1);
                                var nodeDataListPrevMonthFilter = nodeDataList.filter(c => c.month == minusNumber);
                                if (nodeDataListPrevMonthFilter.length > 0) {
                                    var nodeDataListPrevMonth = nodeDataListPrevMonthFilter[0];
                                    startValue = nodeDataMapForScenario.manualChangesEffectFuture ? nodeDataListPrevMonth.endValue : nodeDataListPrevMonth.endValueWMC;
                                } else {
                                    startValue = 0;
                                }
                            }
                            // console.log("startValue---", startValue);
                            var difference = 0;
                            var differenceWMC = 0;
                            var transferNodeValue = 0;
                            var endValue = Number(startValue);
                            var endValueWMC = Number(startValue);
                            var transfer = 0;
                            var transferWMC = 0;
                            // console.log("nodeDataModelingList****", nodeDataModelingList);
                            for (var ndml = 0; ndml < nodeDataModelingList.length; ndml++) {
                                var nodeDataModeling = nodeDataModelingList[ndml];
                                var nodeDataModelingValue = nodeDataModeling.increaseDecrease == 1 ? nodeDataModeling.dataValue : 0 - nodeDataModeling.dataValue;
                                //Linear number
                                if (nodeDataModeling.modelingType.id == 2 || nodeDataModeling.modelingType.id == 5) {
                                    if (nodeDataModeling.transferNodeDataId > 0) {
                                        transfer += Number(nodeDataModelingValue);
                                        transferWMC += Number(nodeDataModelingValue);
                                        if (endValue + Number(nodeDataModelingValue) >= 0) {
                                            endValue += Number(nodeDataModelingValue);
                                            endValueWMC += Number(nodeDataModelingValue);
                                            difference += Number(nodeDataModelingValue);
                                            differenceWMC += Number(nodeDataModelingValue);
                                            overallTransferList.push({ month: i, transfer: Number(transfer), transferWMC: Number(transferWMC), transferFromNodeDataId: flatList[fl].id, transferToNodeDataId: nodeDataModeling.transferNodeDataId, nodeDataModelingId: nodeDataModeling.nodeDataModelingId });
                                        } else {
                                            difference += Number(nodeDataModelingValue);
                                            differenceWMC += Number(nodeDataModelingValue);
                                            overallTransferList.push({ month: i, transfer: Number(0 - Number(endValue)), transferWMC: Number(0 - Number(endValueWMC)), transferFromNodeDataId: flatList[fl].id, transferToNodeDataId: nodeDataModeling.transferNodeDataId, nodeDataModelingId: nodeDataModeling.nodeDataModelingId });
                                            endValue = 0;
                                            endValueWMC = 0;
                                        }
                                    } else if (nodeDataModeling.transferNodeDataId == -1) {
                                        var overallFilter = overallTransferList.filter(c => c.month == i && c.nodeDataModelingId == nodeDataModeling.nodeDataModelingId && c.transferFromNodeDataId == nodeDataModeling.transferFromNodeDataId && c.transferToNodeDataId == nodeDataModeling.nodeDataId);
                                        if (overallFilter.length > 0) {
                                            difference += Number(0 - overallFilter[0].transfer);
                                            differenceWMC += Number(0 - overallFilter[0].transferWMC);
                                            endValue += Number(0 - overallFilter[0].transfer);
                                            endValueWMC += Number(0 - overallFilter[0].transferWMC);
                                        }
                                    } else {
                                        difference += Number(nodeDataModelingValue);
                                        differenceWMC += Number(nodeDataModelingValue);
                                        endValue += Number(nodeDataModelingValue);
                                        endValueWMC += Number(nodeDataModelingValue);
                                    }

                                }
                                //Linear %
                                else if (nodeDataModeling.modelingType.id == 3) {
                                    var dv = 0;
                                    var dvWMC = 0;
                                    if (nodeDataMapForScenario.monthNo == nodeDataModeling.startDateNo) {
                                        if (nodeDataMapForScenario.calculatedDataValue == null || payload.nodeType.id != 2) {
                                            // console.log("modeling datavalue 3---", nodeDataMapForScenario.dataValue)
                                            dv = nodeDataMapForScenario.dataValue;
                                            dvWMC = nodeDataMapForScenario.dataValue;
                                        } else {
                                            dv = nodeDataMapForScenario.calculatedDataValue;
                                            dvWMC = nodeDataMapForScenario.calculatedDataValue;
                                        }
                                    } else {
                                        var dataLstFiltered = nodeDataList.filter(c => c.month == nodeDataModeling.startDateNo - 1);
                                        if (dataLstFiltered.length > 0) {
                                            dv = (dataLstFiltered[0]).endValue;
                                            dvWMC = (dataLstFiltered[0]).endValueWMC;
                                        } else {
                                            dv = 0;
                                            dvWMC = 0;
                                        }
                                    }
                                    if (nodeDataModeling.transferNodeDataId > 0) {
                                        transfer += Number((Number(dv) * Number(nodeDataModelingValue)) / 100);
                                        transferWMC += Number((Number(dvWMC) * Number(nodeDataModelingValue)) / 100);
                                        console.log("Transfer+++++++++++++@@@@@", transfer);
                                        if (endValue + Number((Number(dv) * Number(nodeDataModelingValue)) / 100) >= 0) {
                                            endValue += Number((Number(dv) * Number(nodeDataModelingValue)) / 100);
                                            endValueWMC += Number((Number(dvWMC) * Number(nodeDataModelingValue)) / 100);
                                            difference += Number((Number(dv) * Number(nodeDataModelingValue)) / 100);
                                            differenceWMC += Number((Number(dvWMC) * Number(nodeDataModelingValue)) / 100);
                                            overallTransferList.push({ month: i, transfer: Number(transfer), transferWMC: Number(transferWMC), transferFromNodeDataId: flatList[fl].id, transferToNodeDataId: nodeDataModeling.transferNodeDataId, nodeDataModelingId: nodeDataModeling.nodeDataModelingId });
                                        } else {
                                            console.log("EndValue+++++++++++++@@@@@", endValue);
                                            difference += Number((Number(dv) * Number(nodeDataModelingValue)) / 100);
                                            differenceWMC += Number((Number(dvWMC) * Number(nodeDataModelingValue)) / 100);
                                            overallTransferList.push({ month: i, transfer: Number(0 - Number(endValue)), transferWMC: Number(0 - Number(endValueWMC)), transferFromNodeDataId: flatList[fl].id, transferToNodeDataId: nodeDataModeling.transferNodeDataId, nodeDataModelingId: nodeDataModeling.nodeDataModelingId });
                                            endValue = 0;
                                            endValueWMC = 0;
                                        }
                                    } else if (nodeDataModeling.transferNodeDataId == -1) {
                                        console.log("overallTransferList@@@@@@@@@@@@@@@@@###########", overallTransferList);
                                        var overallFilter = overallTransferList.filter(c => c.month == i && c.nodeDataModelingId == nodeDataModeling.nodeDataModelingId && c.transferFromNodeDataId == nodeDataModeling.transferFromNodeDataId && c.transferToNodeDataId == nodeDataModeling.nodeDataId);
                                        console.log("overallFilter@@@@@@@@@@@@@@@@@###########", overallFilter);
                                        if (overallFilter.length > 0) {
                                            console.log("endValue@@@@@@@@@@@@@@@@@###########", endValue);
                                            difference += Number(0 - overallFilter[0].transfer);
                                            differenceWMC += Number(0 - overallFilter[0].transferWMC);
                                            endValue += Number(0 - overallFilter[0].transfer);
                                            endValueWMC += Number(0 - overallFilter[0].transferWMC);
                                        }
                                    } else {
                                        difference += Number((Number(dv) * Number(nodeDataModelingValue)) / 100);
                                        differenceWMC += Number((Number(dvWMC) * Number(nodeDataModelingValue)) / 100);
                                        endValue += Number((Number(dv) * Number(nodeDataModelingValue)) / 100);
                                        endValueWMC += Number((Number(dvWMC) * Number(nodeDataModelingValue)) / 100);
                                    }
                                }
                                //Exponential %
                                else if (nodeDataModeling.modelingType.id == 4) {
                                    if (nodeDataModeling.transferNodeDataId > 0) {
                                        transfer += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                        transferWMC += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                        if (endValue + Number((Number(startValue) * Number(nodeDataModelingValue)) / 100) >= 0) {
                                            endValue += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                            endValueWMC += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                            difference += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                            differenceWMC += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                            overallTransferList.push({ month: i, transfer: Number(transfer), transferWMC: Number(transferWMC), transferFromNodeDataId: flatList[fl].id, transferToNodeDataId: nodeDataModeling.transferNodeDataId, nodeDataModelingId: nodeDataModeling.nodeDataModelingId });
                                        } else {
                                            difference += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                            differenceWMC += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                            overallTransferList.push({ month: i, transfer: Number(0 - Number(endValue)), transferWMC: Number(0 - Number(endValueWMC)), transferFromNodeDataId: flatList[fl].id, transferToNodeDataId: nodeDataModeling.transferNodeDataId, nodeDataModelingId: nodeDataModeling.nodeDataModelingId });
                                            endValue = 0;
                                            endValueWMC = 0;
                                        }
                                    } else if (nodeDataModeling.transferNodeDataId == -1) {
                                        var overallFilter = overallTransferList.filter(c => c.month == i && c.nodeDataModelingId == nodeDataModeling.nodeDataModelingId && c.transferFromNodeDataId == nodeDataModeling.transferFromNodeDataId && c.transferToNodeDataId == nodeDataModeling.nodeDataId);
                                        if (overallFilter.length > 0) {
                                            difference += Number(0 - overallFilter[0].transfer);
                                            differenceWMC += Number(0 - overallFilter[0].transferWMC);
                                            endValue += Number(0 - overallFilter[0].transfer);
                                            endValueWMC += Number(0 - overallFilter[0].transferWMC);
                                        }
                                    } else {
                                        difference += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                        differenceWMC += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                        endValue += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                        endValueWMC += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                    }
                                }
                            }
                            difference = endValue - startValue;
                            differenceWMC = endValueWMC - startValue;

                            var totalManualChange = 0;
                            var seasonalityPercTotal = 0;
                            var manualChangeTotal = 0;
                            var nodeDataOverrideListFiltered = nodeDataOverrideList.length != null ? nodeDataOverrideList.filter(c => c.monthNo == i) : [];
                            // console.log("nodeDataOverrideListFiltered---", nodeDataOverrideListFiltered)
                            if (nodeDataOverrideListFiltered.length > 0) {
                                var seasonalityNumber = (Number(endValue) * Number(nodeDataOverrideListFiltered[0].seasonalityPerc)) / 100;
                                seasonalityPercTotal += Number(nodeDataOverrideListFiltered[0].seasonalityPerc);
                                totalManualChange = Number(seasonalityNumber) + Number(nodeDataOverrideListFiltered[0].manualChange);
                                manualChangeTotal += Number(nodeDataOverrideListFiltered[0].manualChange);
                            }

                            endValue = endValue + totalManualChange;
                            if (payload.nodeType.id == 3 || payload.nodeType.id == 4 || payload.nodeType.id == 5) {
                                if (endValue < 0) {
                                    endValue = 0;
                                }
                                // if (endValue > 100) {
                                //     endValue = 100;
                                // }

                                if (endValueWMC < 0) {
                                    endValueWMC = 0;
                                }
                                // if (endValueWMC > 100) {
                                //     endValueWMC = 100;
                                // }
                            } else if (payload.nodeType.id == 2) {
                                if (endValue < 0) {
                                    endValue = 0;
                                }
                                if (endValueWMC < 0) {
                                    endValueWMC = 0;
                                }
                            }

                            var calculatedValue = 0;
                            if (payload.nodeType.id == 2) {
                                calculatedValue = endValue;
                            } else if (payload.nodeType.id == 3 || payload.nodeType.id == 4 || payload.nodeType.id == 5) {
                                // Jo uske parent ki calculated value hai Uska endValue %
                                var parent = flatList[fl].parent;
                                // console.log("parent---", parent);
                                // console.log("flatList---", flatList);
                                var parentFiltered = (flatListUnsorted.filter(c => c.id == parent))[0];
                                // console.log("parentFiltered---", parentFiltered);
                                var singleNodeData = (parentFiltered.payload.nodeDataMap[scenarioList[ndm].id]);
                                // console.log("singleNodeData---", singleNodeData);
                                if (singleNodeData != undefined && singleNodeData.length > 0) {
                                    var parentValueFilter = singleNodeData[0].nodeDataMomList.filter(c => c.month == i);
                                    if (parentValueFilter.length > 0) {
                                        var parentValue = parentValueFilter[0].calculatedValue;
                                        calculatedValue = (Number(Number(parentValue) * Number(endValue)) / 100);
                                    } else {
                                        calculatedValue = 0;
                                    }
                                } else {
                                    calculatedValue = 0;
                                }
                            }

                            if (payload.nodeType.id == 4) {
                                var fuPerMonth, totalValue, usageFrequency, convertToMonth;
                                var noOfForecastingUnitsPerPerson = nodeDataMapForScenario.fuNode.noOfForecastingUnitsPerPerson;
                                if (nodeDataMapForScenario.fuNode.usageType.id == 2 || (nodeDataMapForScenario.fuNode.oneTimeUsage != "true" && nodeDataMapForScenario.fuNode.oneTimeUsage != true)) {
                                    usageFrequency = nodeDataMapForScenario.fuNode.usageFrequency;
                                    var usagePeriodFilter = (props.state.usagePeriodList.filter(c => c.usagePeriodId == nodeDataMapForScenario.fuNode.usagePeriod.usagePeriodId));
                                    if (usagePeriodFilter.length > 0) {
                                        convertToMonth = usagePeriodFilter[0].convertToMonth;
                                    } else {
                                        convertToMonth = 0;
                                    }

                                }
                                if (nodeDataMapForScenario.fuNode.usageType.id == 2) {
                                    fuPerMonth = ((noOfForecastingUnitsPerPerson / usageFrequency) * convertToMonth);
                                    totalValue = fuPerMonth * calculatedValue;

                                } else {
                                    var noOfPersons = nodeDataMapForScenario.fuNode.noOfPersons;
                                    if (nodeDataMapForScenario.fuNode.oneTimeUsage == "true" || nodeDataMapForScenario.fuNode.oneTimeUsage == true) {
                                        fuPerMonth = noOfForecastingUnitsPerPerson / noOfPersons;
                                        totalValue = fuPerMonth * calculatedValue;
                                    } else {
                                        fuPerMonth = ((noOfForecastingUnitsPerPerson / noOfPersons) * usageFrequency * convertToMonth);
                                        totalValue = fuPerMonth * calculatedValue;
                                    }
                                }
                                calculatedValue = totalValue;
                                calculatedValueForLag.push(calculatedValue);
                                var lag = nodeDataMapForScenario.fuNode.lagInMonths;
                                console.log("Lag in months++++", lag);
                                if (countOfI >= lag) {
                                    calculatedValue = calculatedValueForLag[countOfI - lag];
                                } else {
                                    calculatedValue = 0;
                                }

                            }
                            if (payload.nodeType.id == 5) {
                                if (!isTemplate) {
                                    var puFilter = (datasetJson.planningUnitList).filter(c => c.planningUnit.id == nodeDataMapForScenario.puNode.planningUnit.id);
                                    if (puFilter.length > 0) {
                                        var pu = puFilter[0];
                                        var fuPerPu = pu.planningUnit.multiplier;
                                        calculatedValue = calculatedValue / fuPerPu;
                                    }
                                } else {
                                    var fuPerPu = nodeDataMapForScenario.puNode.planningUnit.multiplier;
                                    calculatedValue = calculatedValue / fuPerPu;
                                }

                            }
                            var calculatedMmdValue = calculatedValue;
                            console.log("flatList[fl]$$$###", flatList[fl])
                            if (payload.nodeType.id == 5) {
                                var parent = (flatList[fl].parent);
                                var parentFiltered = (flatListUnsorted.filter(c => c.id == parent))[0];
                                var parentNodeNodeData = (parentFiltered.payload.nodeDataMap[scenarioList[ndm].id])[0];
                                if (parentNodeNodeData.fuNode.usageType.id == 2
                                    //  && nodeDataMapForScenario.puNode.refillMonths > 1
                                ) {
                                    var daysPerMonth = 365 / 12;

                                    var grandParent = parentFiltered.parent;
                                    var grandParentFiltered = (flatListUnsorted.filter(c => c.id == grandParent))[0];
                                    var patients = 0;
                                    var grandParentNodeData = (grandParentFiltered.payload.nodeDataMap[scenarioList[ndm].id])[0];
                                    console.log("grandParentNodeData$$$%%%", grandParentNodeData)
                                    if (grandParentNodeData != undefined) {
                                        var minusNumber = (nodeDataMapForScenario.month == 1 ? nodeDataMapForScenario.month - 2 : nodeDataMapForScenario.month - 1);
                                        var grandParentPrevMonthMMDValue = grandParentNodeData.nodeDataMomList.filter(c => c.month == minusNumber);
                                        if (grandParentPrevMonthMMDValue.length > 0) {
                                            patients = grandParentPrevMonthMMDValue[0].calculatedValue;
                                        } else {
                                            var grandParentCurMonthMMDValue = grandParentNodeData.nodeDataMomList.filter(c => c.month == nodeDataMapForScenario.month);
                                            if (grandParentCurMonthMMDValue.length > 0) {
                                                patients = grandParentCurMonthMMDValue[0].calculatedValue;
                                            } else {
                                                patients = 0;
                                            }
                                        }
                                    } else {
                                        patients = 0;
                                    }
                                    // patients = 5432;
                                    // console.log("nodeDataMapForScenario$$$%%%", nodeDataMapForScenario)
                                    if (!isTemplate) {
                                        var puFilter = (datasetJson.planningUnitList).filter(c => c.planningUnit.id == (nodeDataMapForScenario.puNode.planningUnit.id));
                                        var fuPerPu = 1;
                                        if (puFilter.length > 0) {
                                            var pu = puFilter[0];
                                            fuPerPu = pu.planningUnit.multiplier;
                                        }
                                    } else {
                                        fuPerPu = nodeDataMapForScenario.puNode.planningUnit.multiplier;
                                    }

                                    var monthsPerVisit = nodeDataMapForScenario.puNode.refillMonths;
                                    var noOfBottlesInOneVisit = nodeDataMapForScenario.puNode.puPerVisit;
                                    var puPerBaseMonth = Math.floor(patients / monthsPerVisit);
                                    var puPerMonthBalance = patients - puPerBaseMonth * monthsPerVisit + puPerBaseMonth;
                                    console.log("daysPerMonth$$$%%%", daysPerMonth);
                                    console.log("patients$$$%%%", patients);
                                    console.log("fuPerPu$$$%%%", fuPerPu);
                                    console.log("monthsPerVisit$$$%%%", monthsPerVisit);
                                    console.log("noOfBottlesInOneVisit$$$%%%", noOfBottlesInOneVisit);
                                    console.log("puPerBaseMonth$$$%%%", puPerBaseMonth);
                                    console.log("puPerMonthBalance$$$%%%", puPerMonthBalance);
                                    var monthNo = countOfI;
                                    console.log("monthNo$$$%%%", monthNo);
                                    var cycle = Math.floor(monthNo / monthsPerVisit);
                                    console.log("cycle$$$%%%", cycle);
                                    var deltaPatients = 0;
                                    if (i == 0) {
                                        var filter1 = grandParentNodeData.nodeDataMomList.filter(c => c.month == i);
                                        if (filter1.length > 0) {
                                            deltaPatients = filter1[0].calculatedValue - patients;
                                        }
                                    } else {
                                        var filter1 = grandParentNodeData.nodeDataMomList.filter(c => c.month == i);
                                        var minusNumber = (i == 1 ? i - 2 : i - 1);
                                        var filter2 = grandParentNodeData.nodeDataMomList.filter(c => c.month == minusNumber);
                                        if (filter1.length > 0 && filter2.length > 0) {
                                            deltaPatients = filter1[0].calculatedValue - filter2[0].calculatedValue;
                                        }
                                    }
                                    console.log("deltaPatients$$$%%%", deltaPatients);
                                    var noOfPatientsNew = 0;
                                    var noOfPatients = 0;
                                    if (cycle == 0) {
                                        // var mod = monthNo % monthsPerVisit;
                                        // console.log("mod$$$%%%", mod);
                                        // if (mod == 0) {
                                        //     noOfPatientsNew = puPerMonthBalance + deltaPatients;
                                        // } else {
                                        //     noOfPatientsNew = puPerBaseMonth + deltaPatients;
                                        // }
                                        // console.log("noOfPatientsNew$$$%%%", noOfPatientsNew);
                                        noOfPatients = (patients / monthsPerVisit) + deltaPatients;
                                        console.log("noOfPatients@@@", noOfPatients);
                                        calculatedMMdPatients.push({ month: i, value: noOfPatients < 0 ? 0 : noOfPatients });
                                    } else {
                                        console.log("MonthsPer visit@@@@@@@@@@@", monthsPerVisit);
                                        console.log("I++++++++++@@@@@@@@@@@", i);
                                        var prevCycleValue = calculatedMMdPatients[countOfI - monthsPerVisit].value;
                                        noOfPatients = prevCycleValue + deltaPatients;
                                        calculatedMMdPatients.push({ month: i, value: noOfPatients < 0 ? 0 : noOfPatients });
                                    }
                                    // console.log("noOfPus$$$%%%", noOfPus);
                                    // calculatedMmdValue = noOfPus;
                                    // var parent = (flatList[fl].parent);
                                    // var parentFiltered = (flatListUnsorted.filter(c => c.id == parent))[0];

                                    var lag = parentNodeNodeData.fuNode.lagInMonths;
                                    var noOfFus = 0;
                                    if (countOfI >= lag) {
                                        var nodeDataMomForParentPerc = parentNodeNodeData.nodeDataMomList[countOfI - lag];
                                        var percentageToMultiply = 0;
                                        if (nodeDataMomForParentPerc != undefined) {
                                            percentageToMultiply = nodeDataMomForParentPerc.endValue;
                                        }
                                        // var diffForI = countOfI - lag == 0 ? 1 : countOfI - lag;
                                        noOfFus = (((calculatedMMdPatients[countOfI - lag].value * percentageToMultiply / 100) * noOfBottlesInOneVisit) * fuPerPu).toFixed(2);
                                    } else {
                                        noOfFus = 0;
                                    }
                                    if (countOfI >= lag) {
                                        var percentageOfEndValue = (lag == 0 ? endValue : nodeDataList[countOfI - lag].endValue);
                                        calculatedMmdValue = Math.round((noOfFus * percentageOfEndValue / 100) / fuPerPu);
                                    } else {
                                        calculatedMmdValue = 0;
                                    }

                                    console.log("CalculatedMmdValueForPU$$$$###", calculatedMmdValue)
                                }
                            }


                            //Month For loop
                            nodeDataList.push({
                                month: i,
                                startValue: startValue,
                                endValue: endValue,
                                calculatedValue: calculatedValue,
                                endValueWMC: endValueWMC,
                                difference: difference,
                                seasonalityPerc: seasonalityPercTotal,
                                manualChange: manualChangeTotal,
                                calculatedMmdValue: calculatedMmdValue < 0 ? 0 : calculatedMmdValue
                            })
                            // console.log("Node MOM List%%%", nodeDataList);
                        }
                    }

                    // console.log("Node MOM List$$$", nodeDataList);
                    console.log("Before node data list all push 1")
                    allNodeDataList.push({
                        nodeId: flatList[fl].id,
                        nodeDataMomList: nodeDataList
                    })

                    nodeDataMapForScenario.nodeDataMomList = nodeDataList;
                    nodeDataMap[scenarioList[ndm].id] = [nodeDataMapForScenario];
                    // nodeDataMapForScenario.nodeDataMomList = nodeDataList;
                    // nodeDataMap[scenarioList[ndm].id] = [nodeDataMapForScenario];
                    // }
                }
                if (nodeId == -1) {
                    var findIndex = flatListUnsorted.findIndex(c => c.id == flatList[fl].id);
                    payload.nodeDataMap = nodeDataMap;
                    flatListUnsorted[findIndex].payload = payload;
                    var findIndex1 = flatList.findIndex(c => c.id == flatList[fl].id);
                    flatList[findIndex1].payload = payload;

                }
                // payload.nodeDataMap = nodeDataMap;
                // flatList[fl].payload = payload;
            } else {

            }
        }

        var aggregateNodeList = flatList.filter(c => c.payload.nodeType.id == 1);
        // console.log("aggregateNodeList---", aggregateNodeList);
        for (var fl = aggregateNodeList.length; fl > 0; fl--) {
            // console.log("fl---", fl)
            // console.log("agg flatList[fl]---", aggregateNodeList[fl - 1])
            var payload = aggregateNodeList[fl - 1].payload;
            // console.log("agg payload---", payload);
            if (payload.nodeType.id == 1) {
                // console.log("agg nodeDataMap---", nodeDataMap);
                var nodeDataMap = payload.nodeDataMap;
                // console.log("agg nodeDataMap---", nodeDataMap);
                var scenarioList = tree.scenarioList;
                if (scenarioId != -1) {
                    scenarioList = scenarioList.filter(c => c.id == scenarioId);
                }
                // console.log("agg scenario---", scenarioList);
                for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                    var nodeDataMapForScenario = (nodeDataMap[scenarioList[ndm].id])[0];
                    // console.log("agg node data---", nodeDataMapForScenario);
                    var childNodeFlatList = flatListUnsorted.filter(c => c.parent == aggregateNodeList[fl - 1].id);
                    var monthList = [];
                    childNodeFlatList.map(d => {
                        if (d.payload.nodeDataMap[scenarioList[ndm].id][0].nodeDataMomList != undefined && d.payload.nodeDataMap[scenarioList[ndm].id][0].nodeDataMomList.length > 0) {
                            monthList.push(d.payload.nodeDataMap[scenarioList[ndm].id][0].nodeDataMomList[0].month);
                        } else {
                            monthList.push((d.payload.nodeDataMap[scenarioList[ndm].id][0].monthNo));
                        }
                    })
                    var minMonth = Math.min(...monthList);
                    // var minMonth = moment.min();
                    // console.log("agg child&&&", childNodeFlatList);
                    // console.log("scenarioList[ndm].id&&&", scenarioList[ndm].id);
                    var curDate = minMonth;
                    var nodeDataList = [];
                    for (var i = curDate; i <= datasetJson.monthsInFuture; i++) {
                        var aggregatedStartValue = 0;
                        var aggregatedEndValue = 0;
                        var aggregatedCalculatedValue = 0;
                        var aggregatedDifference = 0;
                        var aggregatedSeasonality = 0;
                        var aggregatedManualChange = 0;
                        if (i != 0) {
                            for (var cnfl = 0; cnfl < childNodeFlatList.length; cnfl++) {
                                var childScenario = (childNodeFlatList[cnfl].payload.nodeDataMap[scenarioList[ndm].id]);
                                if (childScenario != undefined && childScenario.length > 0) {
                                    var childNodeMomData = childScenario[0].nodeDataMomList;
                                    var nodeDataListFilteredFilter = (childNodeMomData.filter(c => c.month == i));
                                    if (nodeDataListFilteredFilter.length > 0) {
                                        var nodeDataListFiltered = nodeDataListFilteredFilter[0];
                                        // console.log("nodeDataListFiltered&&&", nodeDataListFiltered)
                                        aggregatedStartValue += Number(nodeDataListFiltered.startValue);
                                        aggregatedEndValue += Number(nodeDataListFiltered.endValue);
                                        aggregatedCalculatedValue += Number(nodeDataListFiltered.calculatedValue);
                                        aggregatedDifference += Number(nodeDataListFiltered.difference);
                                        aggregatedSeasonality += Number(nodeDataListFiltered.seasonalityPerc);
                                        aggregatedManualChange += Number(nodeDataListFiltered.manualChange);
                                    }
                                }
                            }
                            // console.log("agg data---", aggregatedStartValue)
                            nodeDataList.push(
                                {
                                    month: i,
                                    startValue: aggregatedStartValue,
                                    endValue: aggregatedEndValue,
                                    calculatedValue: aggregatedCalculatedValue,
                                    difference: aggregatedDifference,
                                    seasonalityPerc: aggregatedSeasonality,
                                    manualChange: aggregatedManualChange,
                                    calculatedMmdValue: aggregatedCalculatedValue
                                }
                            );
                        }
                    }
                    // console.log("Nodedatalist&&&", nodeDataList);
                    console.log("Before node data list all push 2")
                    allNodeDataList.push({
                        nodeId: aggregateNodeList[fl - 1].id,
                        nodeDataMomList: nodeDataList
                    })

                    nodeDataMapForScenario.nodeDataMomList = nodeDataList;
                    nodeDataMap[scenarioList[ndm].id] = [nodeDataMapForScenario];
                }
                if (nodeId == -1) {
                    var findIndex = flatListUnsorted.findIndex(c => c.id == aggregateNodeList[fl - 1].id);
                    // console.log("flatListUnsorted++++", flatListUnsorted)
                    // console.log("flatListUnsorted++++", aggregateNodeList[fl - 1].id)
                    payload.nodeDataMap = nodeDataMap;
                    flatListUnsorted[findIndex].payload = payload;

                    var findIndex1 = flatList.findIndex(c => c.id == aggregateNodeList[fl - 1].id);
                    flatList[findIndex1].payload = payload;
                }
            }
        }

        // Have list of ids having transer to and transfer from
        // Then based on that work with each one


        // treeList[tl].tree.flatList = flatList;
    }
    console.log("allNodeDataList---", allNodeDataList);
    props.updateState("nodeDataMomList", allNodeDataList);
    props.updateState("nodeId", nodeId);
    props.updateState("type", type);
    props.updateState("loading", false);
    // console.log("here------------------------")
    props.updateState("modelingJexcelLoader", false);
    props.updateState("momJexcelLoader", false);
    props.updateState("message1", "Data updated successfully");
    // treeList = treeList;
    // datasetJson.treeList = treeList;
    // var encryptedDatasetJson = (CryptoJS.AES.encrypt(JSON.stringify(datasetJson), SECRET_KEY)).toString();
    // dataset.programData = encryptedDatasetJson;
}