import CryptoJS from 'crypto-js'
import moment from 'moment';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions.js';
import { SECRET_KEY, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS, FIRST_DATA_ENTRY_DATE, TBD_PROCUREMENT_AGENT_ID, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, INDEXED_DB_NAME, INDEXED_DB_VERSION, QAT_DATA_SOURCE_ID, NOTES_FOR_QAT_ADJUSTMENTS, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, BATCH_PREFIX } from '../../Constants.js'

export function calculateModelingData(dataset, props, page, nodeId, scenarioId, type, treeId, isTemplate) {
    console.log("modelling dataset---", dataset);
    console.log("modelling scenarioId---", scenarioId);

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
    console.log("datasetJson modeling--->", datasetJson.treeList);
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
                scenarioList: {
                    id: 0
                }
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
        if (nodeId != -1) {
            flatList = flatList.filter(c => c.id == nodeId);
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
                    var nodeDataModelingListUnFiltered = ((nodeDataMap[scenarioList[ndm].id])[0].nodeDataModelingList);
                    var hasTransferNodeIdList = nodeDataModelingListUnFiltered.filter(c => c.transferNodeDataId != null);

                    for (var tnl = 0; tnl < hasTransferNodeIdList.length; tnl++) {
                        console.log("modeling datavalue 5---", hasTransferNodeIdList[tnl].dataValue)
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
                            nodeDataId: hasTransferNodeIdList[tnl].transferNodeDataId
                        })
                    }


                }
            }


        }
        for (var fl = 0; fl < flatList.length; fl++) {
            console.log("FlatList", flatList);
            console.log("FlatList$$$", flatList[fl]);
            var payload = flatList[fl].payload;
            if (payload.nodeType.id != 1) {
                var nodeDataMap = payload.nodeDataMap;
                var scenarioList = tree.scenarioList;
                if (scenarioId != -1) {
                    scenarioList = scenarioList.filter(c => c.id == scenarioId);
                }
                console.log("start date---", startDate);
                console.log("stop date---", stopDate);
                console.log("scenarioList---", scenarioList);
                for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                    var nodeDataMapForScenario = (nodeDataMap[scenarioList[ndm].id])[0];
                    var nodeDataModelingListUnFiltered = ((nodeDataMap[scenarioList[ndm].id])[0].nodeDataModelingList);
                    var transferNodeList = transferToNodeList.filter(c => c.nodeDataId == nodeDataMapForScenario.nodeDataId);
                    var nodeDataModelingListWithTransfer = nodeDataModelingListUnFiltered.concat(transferNodeList);
                    var curDate = startDate;
                    var nodeDataList = [];
                    for (var i = 0; curDate < stopDate; i++) {
                        console.log("curDate---", curDate);
                        curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                        var nodeDataModelingList = (nodeDataModelingListWithTransfer).filter(c => moment(curDate).format("YYYY-MM-DD") >= moment(c.startDate).format("YYYY-MM-DD") && moment(curDate).format("YYYY-MM-DD") <= moment(c.stopDate).format("YYYY-MM-DD"));
                        var nodeDataOverrideList = ((nodeDataMap[scenarioList[ndm].id])[0].nodeDataOverrideList);
                        var startValue = 0;
                        console.log("nodeDataMapForScenario---", nodeDataMapForScenario)
                        if (moment(curDate).format("YYYY-MM-DD") == moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                            if (nodeDataMapForScenario.calculatedDataValue == null || payload.nodeType.id != 2) {
                                console.log("modeling datavalue 1---", nodeDataMapForScenario.dataValue)
                                startValue = nodeDataMapForScenario.dataValue;
                            } else {
                                startValue = nodeDataMapForScenario.calculatedDataValue;
                            }
                        } else if (moment(curDate).format("YYYY-MM-DD") < moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                            startValue = 0;
                        } else if (moment(curDate).format("YYYY-MM-DD") > moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                            var nodeDataListPrevMonth = nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).add(-1, 'months').format("YYYY-MM-DD"))[0];
                            startValue = nodeDataMapForScenario.manualChangesEffectFuture ? nodeDataListPrevMonth.endValue : nodeDataListPrevMonth.endValueWMC;
                        }
                        console.log("startValue---", startValue);
                        var difference = 0;
                        var differenceWMC = 0;
                        var transferNodeValue = 0;
                        for (var ndml = 0; ndml < nodeDataModelingList.length; ndml++) {
                            var nodeDataModeling = nodeDataModelingList[ndml];
                            //Linear number
                            if (nodeDataModeling.modelingType.id == 2 && (nodeDataModeling.transferNodeDataId == null || nodeDataModeling.transferNodeDataId == "")) {
                                console.log("modeling datavalue 2---", nodeDataModeling.dataValue)
                                difference += Number(nodeDataModeling.dataValue);
                                differenceWMC += Number(nodeDataModeling.dataValue);
                            }
                            //Linear %
                            else if (nodeDataModeling.modelingType.id == 3 && (nodeDataModeling.transferNodeDataId == null || nodeDataModeling.transferNodeDataId == "")) {
                                var dv = 0;
                                var dvWMC = 0;
                                if (moment(nodeDataMapForScenario.month).format("YYYY-MM-DD") == moment(nodeDataModeling.startDate).format("YYYY-MM-DD")) {
                                    if (nodeDataMapForScenario.calculatedDataValue == null || payload.nodeType.id != 2) {
                                        console.log("modeling datavalue 3---", nodeDataMapForScenario.dataValue)
                                        dv = nodeDataMapForScenario.dataValue;
                                        dvWMC = nodeDataMapForScenario.dataValue;
                                    } else {
                                        dv = nodeDataMapForScenario.calculatedDataValue;
                                        dvWMC = nodeDataMapForScenario.calculatedDataValue;
                                    }
                                } else {
                                    dv = (nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(nodeDataModeling.startDate).add(-1, 'months').format("YYYY-MM-DD"))[0]).endValue;
                                    dvWMC = (nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(nodeDataModeling.startDate).add(-1, 'months').format("YYYY-MM-DD"))[0]).endValueWMC;
                                }
                                difference += Number((Number(dv) * Number(nodeDataModeling.dataValue)) / 100);
                                differenceWMC += Number((Number(dvWMC) * Number(nodeDataModeling.dataValue)) / 100);
                            }
                            //Exponential %
                            else if (nodeDataModeling.modelingType.id == 4 && (nodeDataModeling.transferNodeDataId == null || nodeDataModeling.transferNodeDataId == "")) {
                                difference += Number((Number(startValue) * Number(nodeDataModeling.dataValue)) / 100);
                                differenceWMC += Number((Number(startValue) * Number(nodeDataModeling.dataValue)) / 100);
                            }
                            //Linear % point

                            else if (nodeDataModeling.modelingType.id == 5 && (nodeDataModeling.transferNodeDataId == null || nodeDataModeling.transferNodeDataId == "")) {
                                console.log("nodeDataModeling---", nodeDataModeling);
                                difference += Number(nodeDataModeling.dataValue);
                                differenceWMC += Number(nodeDataModeling.dataValue);
                            }
                            console.log("nodeDataModeling 1---", nodeDataModeling);

                            //Linear # transfer
                            if (nodeDataModeling.modelingType.id == 2 && nodeDataModeling.transferNodeDataId != null && moment(curDate).format("YYYY-MM-DD") > moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                transferNodeValue += Number(nodeDataModeling.dataValue);
                            }
                            if (nodeDataModeling.modelingType.id == 5 && nodeDataModeling.transferNodeDataId != null && moment(curDate).format("YYYY-MM-DD") > moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                transferNodeValue += Number(nodeDataModeling.dataValue);
                            }

                        }
                        var endValue = 0;
                        var endValueWMC = 0;
                        endValue = Number(startValue) + Number(difference) + Number(transferNodeValue);
                        endValueWMC = Number(startValue) + Number(differenceWMC) + Number(transferNodeValue);
                        var totalManualChange = 0;
                        var seasonalityPercTotal = 0;
                        var manualChangeTotal = 0;
                        var nodeDataOverrideListFiltered = nodeDataOverrideList.length != null ? nodeDataOverrideList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).format("YYYY-MM-DD")) : [];
                        if (nodeDataOverrideListFiltered.length > 0) {
                            var seasonalityNumber = (Number(endValue) * Number(nodeDataOverrideListFiltered[0].seasonalityPerc)) / 100;
                            seasonalityPercTotal += Number(nodeDataOverrideListFiltered[0].seasonalityPerc);
                            totalManualChange = Number(seasonalityNumber) + Number(nodeDataOverrideListFiltered[0].manualChange);
                            manualChangeTotal += Number(nodeDataOverrideListFiltered[0].manualChange);
                        }

                        endValue = endValue + totalManualChange;

                        var calculatedValue = 0;
                        if (payload.nodeType.id == 2) {
                            calculatedValue = endValue;
                        } else if (payload.nodeType.id == 3 || payload.nodeType.id == 4 || payload.nodeType.id == 5) {
                            // Jo uske parent ki calculated value hai Uska endValue %
                            var parent = flatList[fl].parent;
                            console.log("parent---", parent);
                            console.log("flatList---", flatList);
                            var parentFiltered = (flatListUnsorted.filter(c => c.id == parent))[0];
                            console.log("parentFiltered---", parentFiltered);
                            var singleNodeData = (parentFiltered.payload.nodeDataMap[scenarioList[ndm].id])[0];
                            var parentValue = singleNodeData.nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).format("YYYY-MM-DD"))[0].calculatedValue;
                            calculatedValue = (Number(Number(parentValue) * Number(endValue)) / 100);
                        }


                        //Month For loop
                        nodeDataList.push({
                            month: curDate,
                            startValue: startValue,
                            endValue: endValue,
                            calculatedValue: calculatedValue,
                            endValueWMC: endValueWMC,
                            difference: difference,
                            seasonalityPerc: seasonalityPercTotal,
                            manualChange: manualChangeTotal
                        })
                        console.log("Node MOM List%%%", nodeDataList);
                    }

                    console.log("Node MOM List$$$", nodeDataList);

                    allNodeDataList.push({
                        nodeId: flatList[fl].id,
                        nodeDataMomList: nodeDataList
                    })


                    // nodeDataMapForScenario.nodeDataMomList = nodeDataList;
                    // nodeDataMap[scenarioList[ndm].id] = [nodeDataMapForScenario];
                }
                // payload.nodeDataMap = nodeDataMap;
                // flatList[fl].payload = payload;
            } else {

            }
        }

        var aggregateNodeList = flatList.filter(c => c.payload.nodeType.id == 1);
        console.log("aggregateNodeList---", aggregateNodeList);
        for (var fl = aggregateNodeList.length; fl > 0; fl--) {
            console.log("fl---", fl)
            console.log("agg flatList[fl]---", aggregateNodeList[fl - 1])
            var payload = aggregateNodeList[fl - 1].payload;
            console.log("agg payload---", payload);
            if (payload.nodeType.id == 1) {
                console.log("agg nodeDataMap---", nodeDataMap);
                var nodeDataMap = payload.nodeDataMap;
                console.log("agg nodeDataMap---", nodeDataMap);
                var scenarioList = tree.scenarioList;
                console.log("agg scenario---", scenarioList);
                for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                    var nodeDataMapForScenario = (nodeDataMap[scenarioList[ndm].id])[0];
                    console.log("agg node data---", nodeDataMapForScenario);
                    var childNodeFlatList = flatListUnsorted.filter(c => c.parent == aggregateNodeList[fl - 1].id);
                    console.log("agg child---", childNodeFlatList);
                    var curDate = startDate;
                    var nodeDataList = [];
                    for (var i = 0; curDate < stopDate; i++) {
                        curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                        var aggregatedStartValue = 0;
                        var aggregatedEndValue = 0;
                        var aggregatedCalculatedValue = 0;
                        var aggregatedDifference = 0;
                        for (var cnfl = 0; cnfl < childNodeFlatList.length; cnfl++) {
                            var childNodeMomData = (childNodeFlatList[cnfl].payload.nodeDataMap[scenarioList[ndm].id])[0].nodeDataMomList;
                            var nodeDataListFiltered = (childNodeMomData.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).format("YYYY-MM-DD"))[0]);
                            aggregatedStartValue += Number(nodeDataListFiltered.startValue);
                            aggregatedEndValue += Number(nodeDataListFiltered.endValue);
                            aggregatedCalculatedValue += Number(nodeDataListFiltered.calculatedValue);
                            aggregatedDifference += Number(nodeDataListFiltered.difference);
                        }
                        console.log("agg data---", aggregatedStartValue)
                        nodeDataList.push(
                            {
                                month: curDate,
                                startValue: aggregatedStartValue,
                                endValue: aggregatedEndValue,
                                calculatedValue: aggregatedCalculatedValue,
                                difference: aggregatedDifference,
                                seasonalityPerc: 0,
                                manualChange: 0,
                            }
                        );
                    }
                    allNodeDataList.push({
                        nodeId: aggregateNodeList[fl - 1],
                        nodeDataMomList: nodeDataList
                    })
                }
            }
        }

        // treeList[tl].tree.flatList = flatList;
    }
    props.updateState("nodeDataMomList", allNodeDataList);
    props.updateState("nodeId", nodeId);
    props.updateState("type", type);
    props.updateState("loading", false);
    props.updateState("modelingJexcelLoader", false);
    props.updateState("momJexcelLoader", false);
    // treeList = treeList;
    // datasetJson.treeList = treeList;
    // var encryptedDatasetJson = (CryptoJS.AES.encrypt(JSON.stringify(datasetJson), SECRET_KEY)).toString();
    // dataset.programData = encryptedDatasetJson;
}