import moment from 'moment';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../../Constants';
export function calculateModelingData(dataset, props, page, nodeId, scenarioId, type, treeId, isTemplate, listPage, autoCalculate) {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
    }.bind(this);
    openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var usagePeriodTransaction = db1.transaction(['usagePeriod'], 'readwrite');
        var usagePeriodOs = usagePeriodTransaction.objectStore('usagePeriod');
        var usagePeriodRequest = usagePeriodOs.getAll();
        usagePeriodRequest.onsuccess = function (e) {
            var usagePeriodList = usagePeriodRequest.result;
            var datasetJson = {};
            if (!isTemplate) {
                datasetJson = dataset.programData;
            } else {
                datasetJson = dataset;
            }
            var allNodeDataList = [];
            var startDate = "";
            var stopDate = "";
            if (!isTemplate) {
                startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
                stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
            } else {
                startDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).subtract(datasetJson.monthsInPast, 'months').startOf('month').format("YYYY-MM-DD");
                stopDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).add(datasetJson.monthsInFuture, 'months').startOf('month').format("YYYY-MM-DD");
            }
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
                if (nodeId != -1 && nodeId != 0) {
                    var curNode = flatList.filter(c => c.id == nodeId)[0];
                    if (curNode != undefined) {
                        var curNodeParent = flatList.filter(c => c.id == curNode.parent)[0];
                        if (curNodeParent != undefined) {
                            flatList = flatList.filter(c => c.sortOrder.startsWith(curNodeParent.sortOrder));
                        }
                    } else {
                        flatList = [];
                    }
                }
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
                var maxLevel = Math.max.apply(Math, flatList.map(function (o) { return o.level; }))
                var sortedFlatList = [];
                var sortedFlatListId = [];
                var sortedFlatListNodeDataId = [];
                for (var ml = 0; ml <= maxLevel; ml++) {
                    var flatListForLevel = flatList.filter(c => c.level == ml && c.payload.nodeType.id != 1);
                    for (var fll = 0; fll < flatListForLevel.length; fll++) {
                        for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                            var filterFlatListWhoseCalculationsAreRemaining = flatListForLevel.filter(c => !sortedFlatListId.includes(c.id));
                            var leaveLoop = false;
                            for (var v = 0; (v < filterFlatListWhoseCalculationsAreRemaining.length && !leaveLoop); v++) {
                                var listOfTransferTo = transferToNodeList.filter(c => (filterFlatListWhoseCalculationsAreRemaining[v].payload.nodeDataMap[scenarioList[ndm].id])[0].nodeDataId == c.nodeDataId);
                                if (listOfTransferTo.length == 0) {
                                    sortedFlatList.push(filterFlatListWhoseCalculationsAreRemaining[v]);
                                    sortedFlatListId.push(filterFlatListWhoseCalculationsAreRemaining[v].id);
                                    sortedFlatListNodeDataId.push((filterFlatListWhoseCalculationsAreRemaining[v].payload.nodeDataMap[scenarioList[ndm].id])[0].nodeDataId);
                                    leaveLoop = true;
                                } else {
                                    var checkIfAllFromCalculationsAreDone = listOfTransferTo.filter(c => sortedFlatListId.includes(c.transferFromNodeDataId));
                                    if (listOfTransferTo.length == checkIfAllFromCalculationsAreDone.length) {
                                        sortedFlatList.push(filterFlatListWhoseCalculationsAreRemaining[v]);
                                        sortedFlatListId.push(filterFlatListWhoseCalculationsAreRemaining[v].id);
                                        sortedFlatListNodeDataId.push((filterFlatListWhoseCalculationsAreRemaining[v].payload.nodeDataMap[scenarioList[ndm].id])[0].nodeDataId);
                                        leaveLoop = true;
                                    }
                                }
                            }
                        }
                    }
                }
                var overallTransferList = [];
                flatList = sortedFlatList.concat(flatList.filter(c => c.payload.nodeType.id == 1)).concat(flatList.filter(c => c.payload.nodeType.id != 1 && !sortedFlatListId.includes(c.id)));
                for (var fl = 0; fl < flatList.length; fl++) {
                    var payload = flatList[fl].payload;
                    if (payload.nodeType.id != 1 && (payload.extrapolation == undefined || payload.extrapolation.toString() == "false")) {
                        var nodeDataMap = payload.nodeDataMap;
                        var scenarioList = tree.scenarioList;
                        if (scenarioId != -1) {
                            scenarioList = scenarioList.filter(c => c.id == scenarioId);
                        }
                        for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                            var nodeDataMapForScenario = (nodeDataMap[scenarioList[ndm].id])[0];
                            if (nodeDataMapForScenario.extrapolation == undefined || nodeDataMapForScenario.extrapolation.toString() == "false") {
                                var nodeDataModelingListUnFiltered = (nodeDataMapForScenario.nodeDataModelingList);
                                var transferNodeList = transferToNodeList.filter(c => c.nodeDataId == nodeDataMapForScenario.nodeDataId);
                                var nodeDataModelingListWithTransfer = nodeDataModelingListUnFiltered.concat(transferNodeList);
                                var curDate = moment(nodeDataMapForScenario.month).startOf('month').format("YYYY-MM-DD");
                                var nodeDataList = [];
                                var calculatedMMdPatients = [];
                                var calculatedValueForLag = [];
                                for (var i = 0; curDate < stopDate; i++) {
                                    curDate = moment(nodeDataMapForScenario.month).add(i, 'months').format("YYYY-MM-DD");
                                    var nodeDataModelingList = (nodeDataModelingListWithTransfer).filter(c => moment(curDate).format("YYYY-MM") >= moment(c.startDate).format("YYYY-MM") && moment(curDate).format("YYYY-MM") <= moment(c.stopDate).format("YYYY-MM"));
                                    nodeDataModelingList = nodeDataModelingList.filter(c => c.dataValue != "" && c.dataValue != "NaN" && c.dataValue != undefined && c.increaseDecrease != "");
                                    var nodeDataOverrideList = (nodeDataMapForScenario.nodeDataOverrideList);
                                    var startValue = 0;
                                    if (moment(curDate).format("YYYY-MM-DD") == moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                        if (nodeDataMapForScenario.calculatedDataValue == null || payload.nodeType.id != 2) {
                                            startValue = nodeDataMapForScenario.dataValue;
                                        } else {
                                            startValue = nodeDataMapForScenario.calculatedDataValue;
                                        }
                                    } else if (moment(curDate).format("YYYY-MM-DD") < moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                        startValue = 0;
                                    } else if (moment(curDate).format("YYYY-MM-DD") > moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                        var nodeDataListPrevMonthFilter = nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).add(-1, 'months').format("YYYY-MM-DD"));
                                        if (nodeDataListPrevMonthFilter.length > 0) {
                                            var nodeDataListPrevMonth = nodeDataListPrevMonthFilter[0];
                                            startValue = nodeDataMapForScenario.manualChangesEffectFuture ? nodeDataListPrevMonth.endValue : nodeDataListPrevMonth.endValueWMC;
                                        } else {
                                            startValue = 0;
                                        }
                                    }
                                    var difference = 0;
                                    var differenceWMC = 0;
                                    var endValue = Number(startValue);
                                    var endValueWMC = Number(startValue);
                                    var transfer = 0;
                                    var transferWMC = 0;
                                    for (var ndml = 0; ndml < nodeDataModelingList.length; ndml++) {
                                        var nodeDataModeling = nodeDataModelingList[ndml];
                                        var nodeDataModelingValue = nodeDataModeling.increaseDecrease == 1 ? nodeDataModeling.dataValue : 0 - nodeDataModeling.dataValue;
                                        if (nodeDataModeling.modelingType.id == 2 || nodeDataModeling.modelingType.id == 5) {
                                            if (nodeDataModeling.transferNodeDataId > 0) {
                                                transfer = Number(nodeDataModelingValue);
                                                transferWMC = Number(nodeDataModelingValue);
                                                if (endValue + Number(nodeDataModelingValue) >= 0) {
                                                    endValue += Number(nodeDataModelingValue);
                                                    endValueWMC += Number(nodeDataModelingValue);
                                                    difference += Number(nodeDataModelingValue);
                                                    differenceWMC += Number(nodeDataModelingValue);
                                                    overallTransferList.push({ month: moment(curDate).format("YYYY-MM-DD"), transfer: Number(transfer), transferWMC: Number(transferWMC), transferFromNodeDataId: flatList[fl].id, transferToNodeDataId: nodeDataModeling.transferNodeDataId, nodeDataModelingId: nodeDataModeling.nodeDataModelingId });
                                                } else {
                                                    difference += Number(nodeDataModelingValue);
                                                    differenceWMC += Number(nodeDataModelingValue);
                                                    overallTransferList.push({ month: moment(curDate).format("YYYY-MM-DD"), transfer: Number(0 - Number(endValue)), transferWMC: Number(0 - Number(endValueWMC)), transferFromNodeDataId: flatList[fl].id, transferToNodeDataId: nodeDataModeling.transferNodeDataId, nodeDataModelingId: nodeDataModeling.nodeDataModelingId });
                                                    endValue = 0;
                                                    endValueWMC = 0;
                                                }
                                            } else if (nodeDataModeling.transferNodeDataId == -1) {
                                                var overallFilter = overallTransferList.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.nodeDataModelingId == nodeDataModeling.nodeDataModelingId && c.transferFromNodeDataId == nodeDataModeling.transferFromNodeDataId && c.transferToNodeDataId == nodeDataModeling.nodeDataId);
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
                                        else if (nodeDataModeling.modelingType.id == 3) {
                                            var dv = 0;
                                            var dvWMC = 0;
                                            if (moment(nodeDataMapForScenario.month).format("YYYY-MM-DD") == moment(nodeDataModeling.startDate).format("YYYY-MM-DD")) {
                                                if (nodeDataMapForScenario.calculatedDataValue == null || payload.nodeType.id != 2) {
                                                    dv = nodeDataMapForScenario.dataValue;
                                                    dvWMC = nodeDataMapForScenario.dataValue;
                                                } else {
                                                    dv = nodeDataMapForScenario.calculatedDataValue;
                                                    dvWMC = nodeDataMapForScenario.calculatedDataValue;
                                                }
                                            } else {
                                                var dataLstFiltered = nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(nodeDataModeling.startDate).add(-1, 'months').format("YYYY-MM-DD"));
                                                if (dataLstFiltered.length > 0) {
                                                    dv = (dataLstFiltered[0]).endValue;
                                                    dvWMC = (dataLstFiltered[0]).endValueWMC;
                                                } else {
                                                    dv = 0;
                                                    dvWMC = 0;
                                                }
                                            }
                                            if (nodeDataModeling.transferNodeDataId > 0) {
                                                transfer = Number((Number(dv) * Number(nodeDataModelingValue)) / 100);
                                                transferWMC = Number((Number(dvWMC) * Number(nodeDataModelingValue)) / 100);
                                                if (endValue + Number((Number(dv) * Number(nodeDataModelingValue)) / 100) >= 0) {
                                                    endValue += Number((Number(dv) * Number(nodeDataModelingValue)) / 100);
                                                    endValueWMC += Number((Number(dvWMC) * Number(nodeDataModelingValue)) / 100);
                                                    difference += Number((Number(dv) * Number(nodeDataModelingValue)) / 100);
                                                    differenceWMC += Number((Number(dvWMC) * Number(nodeDataModelingValue)) / 100);
                                                    overallTransferList.push({ month: moment(curDate).format("YYYY-MM-DD"), transfer: Number(transfer), transferWMC: Number(transferWMC), transferFromNodeDataId: flatList[fl].id, transferToNodeDataId: nodeDataModeling.transferNodeDataId, nodeDataModelingId: nodeDataModeling.nodeDataModelingId });
                                                } else {
                                                    difference += Number((Number(dv) * Number(nodeDataModelingValue)) / 100);
                                                    differenceWMC += Number((Number(dvWMC) * Number(nodeDataModelingValue)) / 100);
                                                    overallTransferList.push({ month: moment(curDate).format("YYYY-MM-DD"), transfer: Number(0 - Number(endValue)), transferWMC: Number(0 - Number(endValueWMC)), transferFromNodeDataId: flatList[fl].id, transferToNodeDataId: nodeDataModeling.transferNodeDataId, nodeDataModelingId: nodeDataModeling.nodeDataModelingId });
                                                    endValue = 0;
                                                    endValueWMC = 0;
                                                }
                                            } else if (nodeDataModeling.transferNodeDataId == -1) {
                                                var overallFilter = overallTransferList.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.nodeDataModelingId == nodeDataModeling.nodeDataModelingId && c.transferFromNodeDataId == nodeDataModeling.transferFromNodeDataId && c.transferToNodeDataId == nodeDataModeling.nodeDataId);
                                                if (overallFilter.length > 0) {
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
                                        else if (nodeDataModeling.modelingType.id == 4) {
                                            if (nodeDataModeling.transferNodeDataId > 0) {
                                                transfer = Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                                transferWMC = Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                                if (endValue + Number((Number(startValue) * Number(nodeDataModelingValue)) / 100) >= 0) {
                                                    endValue += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                                    endValueWMC += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                                    difference += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                                    differenceWMC += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                                    overallTransferList.push({ month: moment(curDate).format("YYYY-MM-DD"), transfer: Number(transfer), transferWMC: Number(transferWMC), transferFromNodeDataId: flatList[fl].id, transferToNodeDataId: nodeDataModeling.transferNodeDataId, nodeDataModelingId: nodeDataModeling.nodeDataModelingId });
                                                } else {
                                                    difference += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                                    differenceWMC += Number((Number(startValue) * Number(nodeDataModelingValue)) / 100);
                                                    overallTransferList.push({ month: moment(curDate).format("YYYY-MM-DD"), transfer: Number(0 - Number(endValue)), transferWMC: Number(0 - Number(endValueWMC)), transferFromNodeDataId: flatList[fl].id, transferToNodeDataId: nodeDataModeling.transferNodeDataId, nodeDataModelingId: nodeDataModeling.nodeDataModelingId });
                                                    endValue = 0;
                                                    endValueWMC = 0;
                                                }
                                            } else if (nodeDataModeling.transferNodeDataId == -1) {
                                                var overallFilter = overallTransferList.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM") && c.nodeDataModelingId == nodeDataModeling.nodeDataModelingId && c.transferFromNodeDataId == nodeDataModeling.transferFromNodeDataId && c.transferToNodeDataId == nodeDataModeling.nodeDataId);
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
                                    var nodeDataOverrideListFiltered = nodeDataOverrideList.length != null ? nodeDataOverrideList.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM")) : [];
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
                                        if (endValueWMC < 0) {
                                            endValueWMC = 0;
                                        }
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
                                        var parent = flatList[fl].parent;
                                        var parentFiltered = (flatListUnsorted.filter(c => c.id == parent))[0];
                                        var singleNodeData = (parentFiltered.payload.nodeDataMap[scenarioList[ndm].id]);
                                        if (singleNodeData != undefined && singleNodeData.length > 0) {
                                            var parentValueFilter = singleNodeData[0].nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).format("YYYY-MM-DD"));
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
                                            var usagePeriodFilter = (usagePeriodList.filter(c => c.usagePeriodId == nodeDataMapForScenario.fuNode.usagePeriod.usagePeriodId));
                                            if (usagePeriodFilter.length > 0) {
                                                convertToMonth = usagePeriodFilter[0].convertToMonth;
                                            } else {
                                                convertToMonth = 0;
                                            }
                                        }
                                        if (nodeDataMapForScenario.fuNode.usageType.id == 2) {
                                            fuPerMonth = ((noOfForecastingUnitsPerPerson / usageFrequency) * convertToMonth);
                                            totalValue = Number(fuPerMonth).toFixed(4) * calculatedValue;
                                        } else {
                                            var usagePeriodId;
                                            var usageTypeId;
                                            var usageFrequency;
                                            var repeatUsagePeriodId;
                                            var oneTimeUsage;
                                            usageTypeId = nodeDataMapForScenario.fuNode.usageType.id;
                                            if (usageTypeId == 1) {
                                                oneTimeUsage = nodeDataMapForScenario.fuNode.oneTimeUsage;
                                            }
                                            if (usageTypeId == 2 || (oneTimeUsage != null && oneTimeUsage !== "" && oneTimeUsage.toString() == "false")) {
                                                usagePeriodId = nodeDataMapForScenario.fuNode.usagePeriod.usagePeriodId;
                                            }
                                            usageFrequency = nodeDataMapForScenario.fuNode.usageFrequency;
                                            var noOfMonthsInUsagePeriod = 0;
                                            var noFURequired = 0;
                                            if ((usagePeriodId != null && usagePeriodId != "") && (usageTypeId == 2 || (oneTimeUsage == "false" || oneTimeUsage == false))) {
                                                var convertToMonth = (usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth;
                                                if (usageTypeId == 2) {
                                                    var div = (convertToMonth * usageFrequency);
                                                    if (div != 0) {
                                                        noOfMonthsInUsagePeriod = usageFrequency / convertToMonth;
                                                    }
                                                } else {
                                                    var noOfFUPatient;
                                                    if (payload.nodeType.id == 4) {
                                                        noOfFUPatient = nodeDataMapForScenario.fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / nodeDataMapForScenario.fuNode.noOfPersons.toString().replaceAll(",", "");
                                                    } else {
                                                        noOfFUPatient = nodeDataMapForScenario.fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / nodeDataMapForScenario.fuNode.noOfPersons.toString().replaceAll(",", "");
                                                    }
                                                    noOfMonthsInUsagePeriod = convertToMonth * usageFrequency * noOfFUPatient;
                                                }
                                                if (oneTimeUsage != "true" && oneTimeUsage != true && usageTypeId == 1) {
                                                    repeatUsagePeriodId = nodeDataMapForScenario.fuNode.repeatUsagePeriod.usagePeriodId;
                                                    if (repeatUsagePeriodId != "") {
                                                        convertToMonth = (usagePeriodList.filter(c => c.usagePeriodId == repeatUsagePeriodId))[0].convertToMonth;
                                                    } else {
                                                        convertToMonth = 0;
                                                    }
                                                }
                                                noFURequired = oneTimeUsage != "true" && oneTimeUsage != true ? (nodeDataMapForScenario.fuNode.repeatCount / convertToMonth) * noOfMonthsInUsagePeriod : noOfFUPatient;
                                            } else if (usageTypeId == 1 && oneTimeUsage != null && (oneTimeUsage == "true" || oneTimeUsage == true)) {
                                                if (payload.nodeType.id == 4) {
                                                    noFURequired = nodeDataMapForScenario.fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / nodeDataMapForScenario.fuNode.noOfPersons.toString().replaceAll(",", "");
                                                } else {
                                                    noFURequired = nodeDataMapForScenario.fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / nodeDataMapForScenario.fuNode.noOfPersons.toString().replaceAll(",", "");
                                                }
                                            }
                                            if (nodeDataMapForScenario.fuNode.usageType.id == 2) {
                                                var noOfPersons = nodeDataMapForScenario.fuNode.noOfPersons;
                                                if (nodeDataMapForScenario.fuNode.oneTimeUsage == "true" || nodeDataMapForScenario.fuNode.oneTimeUsage == true) {
                                                    fuPerMonth = noOfForecastingUnitsPerPerson / noOfPersons;
                                                    totalValue = Number(fuPerMonth).toFixed(4) * calculatedValue;
                                                } else {
                                                    fuPerMonth = ((noOfForecastingUnitsPerPerson / noOfPersons) * usageFrequency * convertToMonth);
                                                    totalValue = Number(fuPerMonth).toFixed(4) * calculatedValue;
                                                }
                                            } else {
                                                totalValue = noFURequired * calculatedValue;
                                            }
                                        }
                                        calculatedValue = totalValue;
                                        calculatedValueForLag.push(calculatedValue);
                                        var lag = nodeDataMapForScenario.fuNode.lagInMonths;
                                        if (i >= lag) {
                                            calculatedValue = calculatedValueForLag[i - lag];
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
                                    if (payload.nodeType.id == 5) {
                                        var parent = (flatList[fl].parent);
                                        var parentFiltered = (flatListUnsorted.filter(c => c.id == parent))[0];
                                        var parentNodeNodeData = (parentFiltered.payload.nodeDataMap[scenarioList[ndm].id])[0];
                                        if (parentNodeNodeData.fuNode.usageType.id == 2
                                        ) {
                                            var grandParent = parentFiltered.parent;
                                            var grandParentFiltered = (flatListUnsorted.filter(c => c.id == grandParent))[0];
                                            var patients = 0;
                                            var grandParentNodeData = (grandParentFiltered.payload.nodeDataMap[scenarioList[ndm].id])[0];
                                            if (grandParentNodeData != undefined) {
                                                var grandParentPrevMonthMMDValue = grandParentNodeData.nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(nodeDataMapForScenario.month).subtract(1, 'months').format("YYYY-MM"));
                                                if (grandParentPrevMonthMMDValue.length > 0) {
                                                    patients = grandParentPrevMonthMMDValue[0].calculatedValue;
                                                } else {
                                                    var grandParentCurMonthMMDValue = grandParentNodeData.nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(nodeDataMapForScenario.month).format("YYYY-MM"));
                                                    if (grandParentCurMonthMMDValue.length > 0) {
                                                        patients = grandParentCurMonthMMDValue[0].calculatedValue;
                                                    } else {
                                                        patients = 0;
                                                    }
                                                }
                                            } else {
                                                patients = 0;
                                            }
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
                                            var monthNo = i;
                                            var cycle = Math.floor(monthNo / monthsPerVisit);
                                            var deltaPatients = 0;
                                            if (i == 0) {
                                                var filter1 = grandParentNodeData.nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM"));
                                                if (filter1.length > 0) {
                                                    deltaPatients = filter1[0].calculatedValue - patients;
                                                }
                                            } else {
                                                var filter1 = grandParentNodeData.nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM"));
                                                var filter2 = grandParentNodeData.nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).add(-1, 'months').format("YYYY-MM-DD"));
                                                if (filter1.length > 0 || filter2.length > 0) {
                                                    var val1 = 0;
                                                    var val2 = 0;
                                                    if (filter1.length > 0) {
                                                        val1 = filter1[0].calculatedValue;
                                                    }
                                                    if (filter2.length > 0) {
                                                        val2 = filter2[0].calculatedValue;
                                                    }
                                                    deltaPatients = val1 - val2;
                                                }
                                            }
                                            var noOfPatients = 0;
                                            if (cycle == 0) {
                                                noOfPatients = (patients / monthsPerVisit) + deltaPatients;
                                                calculatedMMdPatients.push({ month: curDate, value: noOfPatients < 0 ? 0 : noOfPatients });
                                            } else {
                                                var prevCycleValue = calculatedMMdPatients.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).add(-monthsPerVisit, 'months').format("YYYY-MM"))[0].value;
                                                noOfPatients = prevCycleValue + deltaPatients;
                                                calculatedMMdPatients.push({ month: curDate, value: noOfPatients < 0 ? 0 : noOfPatients });
                                            }
                                            var lag = parentNodeNodeData.fuNode.lagInMonths;
                                            var noOfFus = 0;
                                            if (i >= lag) {
                                                var nodeDataMomForParentPerc = parentNodeNodeData.nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).subtract(lag, 'months').format("YYYY-MM"));
                                                var percentageToMultiply = 0;
                                                if (nodeDataMomForParentPerc.length > 0) {
                                                    percentageToMultiply = nodeDataMomForParentPerc[0].endValue;
                                                }
                                                noOfFus = (((calculatedMMdPatients.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).subtract(lag, 'months').format("YYYY-MM-DD"))[0].value * percentageToMultiply / 100) * noOfBottlesInOneVisit) * fuPerPu).toFixed(2);
                                            } else {
                                                noOfFus = 0;
                                            }
                                            if (i >= lag) {
                                                var percentageOfEndValue = (lag == 0 ? endValue : nodeDataList.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).subtract(lag, 'months').format("YYYY-MM"))[0].endValue);
                                                calculatedMmdValue = Number((noOfFus * percentageOfEndValue / 100) / fuPerPu);
                                            } else {
                                                calculatedMmdValue = 0;
                                            }
                                        } else {
                                            var usagePeriodId;
                                            var usageTypeId;
                                            var usageFrequency;
                                            var repeatUsagePeriodId;
                                            var oneTimeUsage;
                                            usageTypeId = parentNodeNodeData.fuNode.usageType.id;
                                            if (usageTypeId == 1) {
                                                oneTimeUsage = parentNodeNodeData.fuNode.oneTimeUsage;
                                            }
                                            if (usageTypeId == 2 || (oneTimeUsage != null && oneTimeUsage !== "" && oneTimeUsage.toString() == "false")) {
                                                usagePeriodId = parentNodeNodeData.fuNode.usagePeriod.usagePeriodId;
                                            }
                                            usageFrequency = parentNodeNodeData.fuNode.usageFrequency;
                                            var noOfMonthsInUsagePeriod = 0;
                                            var noFURequired = 0;
                                            if ((usagePeriodId != null && usagePeriodId != "") && (usageTypeId == 2 || (oneTimeUsage == "false" || oneTimeUsage == false))) {
                                                var convertToMonth = (usagePeriodList.filter(c => c.usagePeriodId == usagePeriodId))[0].convertToMonth;
                                                if (usageTypeId == 2) {
                                                    var div = (convertToMonth * usageFrequency);
                                                    if (div != 0) {
                                                        noOfMonthsInUsagePeriod = usageFrequency / convertToMonth;
                                                    }
                                                } else {
                                                    var noOfFUPatient;
                                                    noOfFUPatient = parentNodeNodeData.fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / parentNodeNodeData.fuNode.noOfPersons.toString().replaceAll(",", "");
                                                    noOfMonthsInUsagePeriod = convertToMonth * usageFrequency * noOfFUPatient;
                                                }
                                                if (oneTimeUsage != "true" && oneTimeUsage != true && usageTypeId == 1) {
                                                    repeatUsagePeriodId = parentNodeNodeData.fuNode.repeatUsagePeriod.usagePeriodId;
                                                    if (repeatUsagePeriodId != "") {
                                                        convertToMonth = (usagePeriodList.filter(c => c.usagePeriodId == repeatUsagePeriodId))[0].convertToMonth;
                                                    } else {
                                                        convertToMonth = 0;
                                                    }
                                                }
                                                noFURequired = oneTimeUsage != "true" && oneTimeUsage != true ? (parentNodeNodeData.fuNode.repeatCount / convertToMonth) * noOfMonthsInUsagePeriod : noOfFUPatient;
                                            } else if (usageTypeId == 1 && oneTimeUsage != null && (oneTimeUsage == "true" || oneTimeUsage == true)) {
                                                noFURequired = parentNodeNodeData.fuNode.noOfForecastingUnitsPerPerson.toString().replaceAll(",", "") / parentNodeNodeData.fuNode.noOfPersons.toString().replaceAll(",", "");
                                            }
                                            var puMultiplier = 0;
                                            if (!isTemplate) {
                                                var puFilter = (datasetJson.planningUnitList).filter(c => c.planningUnit.id == nodeDataMapForScenario.puNode.planningUnit.id);
                                                if (puFilter.length > 0) {
                                                    var pu = puFilter[0];
                                                    puMultiplier = pu.planningUnit.multiplier;
                                                }
                                            } else {
                                                puMultiplier = nodeDataMapForScenario.puNode.planningUnit.multiplier;
                                            }
                                            calculatedValue = (calculatedValue / (noFURequired / puMultiplier)) * nodeDataMapForScenario.puNode.puPerVisit;
                                            calculatedMmdValue = (calculatedMmdValue / (noFURequired / puMultiplier)) * nodeDataMapForScenario.puNode.puPerVisit;
                                        }
                                    }
                                    nodeDataList.push({
                                        month: curDate,
                                        startValue: startValue,
                                        endValue: endValue,
                                        calculatedValue: calculatedValue,
                                        endValueWMC: endValueWMC,
                                        difference: difference,
                                        seasonalityPerc: seasonalityPercTotal,
                                        manualChange: manualChangeTotal,
                                        calculatedMmdValue: calculatedMmdValue < 0 ? 0 : calculatedMmdValue
                                    })
                                }
                                allNodeDataList.push({
                                    nodeId: flatList[fl].id,
                                    nodeDataMomList: nodeDataList
                                })
                                nodeDataMapForScenario.nodeDataMomList = nodeDataList;
                                nodeDataMap[scenarioList[ndm].id] = [nodeDataMapForScenario];
                            }
                        }
                        if (nodeId == -1) {
                            var findIndex = flatListUnsorted.findIndex(c => c.id == flatList[fl].id);
                            payload.nodeDataMap = nodeDataMap;
                            flatListUnsorted[findIndex].payload = payload;
                            var findIndex1 = flatList.findIndex(c => c.id == flatList[fl].id);
                            flatList[findIndex1].payload = payload;
                        }
                    } else {
                    }
                }
                var aggregateNodeList = flatList.filter(c => c.payload.nodeType.id == 1);
                for (var fl = aggregateNodeList.length; fl > 0; fl--) {
                    var payload = aggregateNodeList[fl - 1].payload;
                    if (payload.nodeType.id == 1) {
                        var nodeDataMap = payload.nodeDataMap;
                        var scenarioList = tree.scenarioList;
                        if (scenarioId != -1) {
                            scenarioList = scenarioList.filter(c => c.id == scenarioId);
                        }
                        for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                            var nodeDataMapForScenario = (nodeDataMap[scenarioList[ndm].id])[0];
                            var childNodeFlatList = flatListUnsorted.filter(c => c.parent == aggregateNodeList[fl - 1].id);
                            var monthList = [];
                            childNodeFlatList.map(d => {
                                if (d.payload.nodeDataMap[scenarioList[ndm].id][0].nodeDataMomList != undefined && d.payload.nodeDataMap[scenarioList[ndm].id][0].nodeDataMomList.length > 0) {
                                    monthList.push(moment(d.payload.nodeDataMap[scenarioList[ndm].id][0].nodeDataMomList[0].month).format("YYYY-MM-DD"));
                                } else {
                                    monthList.push(moment(d.payload.nodeDataMap[scenarioList[ndm].id][0].month).format("YYYY-MM-DD"));
                                }
                            })
                            var minMonth = moment.min(monthList.map(d => moment(d)));
                            var curDate = moment(minMonth).startOf('month').format("YYYY-MM-DD");;
                            var nodeDataList = [];
                            for (var i = 0; curDate < stopDate; i++) {
                                curDate = moment(minMonth).add(i, 'months').format("YYYY-MM-DD");
                                var aggregatedStartValue = 0;
                                var aggregatedEndValue = 0;
                                var aggregatedCalculatedValue = 0;
                                var aggregatedDifference = 0;
                                var aggregatedSeasonality = 0;
                                var aggregatedManualChange = 0;
                                for (var cnfl = 0; cnfl < childNodeFlatList.length; cnfl++) {
                                    var childScenario = (childNodeFlatList[cnfl].payload.nodeDataMap[scenarioList[ndm].id]);
                                    if (childScenario != undefined && childScenario.length > 0) {
                                        var childNodeMomData = childScenario[0].nodeDataMomList;
                                        var nodeDataListFilteredFilter = (childNodeMomData.filter(c => moment(c.month).format("YYYY-MM") == moment(curDate).format("YYYY-MM")));
                                        if (nodeDataListFilteredFilter.length > 0) {
                                            var nodeDataListFiltered = nodeDataListFilteredFilter[0];
                                            aggregatedStartValue += Number(nodeDataListFiltered.startValue);
                                            aggregatedEndValue += Number(nodeDataListFiltered.endValue);
                                            aggregatedCalculatedValue += Number(nodeDataListFiltered.calculatedValue);
                                            aggregatedDifference += Number(nodeDataListFiltered.difference);
                                            aggregatedSeasonality += Number(nodeDataListFiltered.seasonalityPerc);
                                            aggregatedManualChange += Number(nodeDataListFiltered.manualChange);
                                        }
                                    }
                                }
                                nodeDataList.push(
                                    {
                                        month: curDate,
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
                            allNodeDataList.push({
                                nodeId: aggregateNodeList[fl - 1].id,
                                nodeDataMomList: nodeDataList
                            })
                            nodeDataMapForScenario.nodeDataMomList = nodeDataList;
                            nodeDataMap[scenarioList[ndm].id] = [nodeDataMapForScenario];
                        }
                        if (nodeId == -1) {
                            var findIndex = flatListUnsorted.findIndex(c => c.id == aggregateNodeList[fl - 1].id);
                            payload.nodeDataMap = nodeDataMap;
                            flatListUnsorted[findIndex].payload = payload;
                            var findIndex1 = flatList.findIndex(c => c.id == aggregateNodeList[fl - 1].id);
                            flatList[findIndex1].payload = payload;
                        }
                    }
                }
            }

            props.updateState("nodeDataMomList", allNodeDataList);
            props.updateState("nodeId", nodeId);
            props.updateState("type", type);
            props.updateState("loading", false);
            props.updateState("modelingJexcelLoader", false);
            props.updateState("momJexcelLoader", false);
            props.updateState("message1", "Data updated successfully");
            if (listPage) {
                props.updateState("tempTreeId", treeId);
                props.updateState("programId", page);
            }
        }.bind(this)
    }.bind(this)
}