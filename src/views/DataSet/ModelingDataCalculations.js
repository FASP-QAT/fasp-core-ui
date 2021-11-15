import CryptoJS from 'crypto-js'
import moment from 'moment';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions.js';
import { SECRET_KEY, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS, FIRST_DATA_ENTRY_DATE, TBD_PROCUREMENT_AGENT_ID, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, INDEXED_DB_NAME, INDEXED_DB_VERSION, QAT_DATA_SOURCE_ID, NOTES_FOR_QAT_ADJUSTMENTS, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, BATCH_PREFIX } from '../../Constants.js'
export function calculateModelingData(dataset, props, page) {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
    }.bind(this);
    openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        console.log("In calculate function###", dataset);
        var datasetDataBytes = CryptoJS.AES.decrypt(dataset.programData, SECRET_KEY);
        var datasetData = datasetDataBytes.toString(CryptoJS.enc.Utf8);
        var datasetJson = JSON.parse(datasetData);
        console.log("DatasetJson###", datasetJson);
        var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
        var stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
        var treeList = datasetJson.treeList;
        var curDate = startDate;
        var nodeDataList = [];
        for (var i = 0; curDate < stopDate; i++) {
            curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
            for (var tl = 0; tl < treeList.length; tl++) {
                var tree = treeList[tl];
                var flatList = tree.tree.flatList.sort(function (a, b) {
                    a = a.sortOrder;
                    b = b.sortOrder;
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                var transferToNodeList = [];

                for (var fl = 0; fl < flatList.length; fl++) {
                    var payload = flatList[fl].payload;
                    if (payload.nodeType.id != 1) {
                        var nodeDataMap = payload.nodeDataMap;
                        var scenarioList = tree.scenarioList;
                        for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                            var nodeDataMapForScenario = (nodeDataMap[scenarioList[ndm].id])[0];
                            var nodeDataModelingListUnFiltered = ((nodeDataMap[scenarioList[ndm].id])[0].nodeDataModelingList);
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
                                    nodeDataId: hasTransferNodeIdList[tnl].transferNodeDataId
                                })
                            }

                        }
                    }
                }

                for (var fl = 0; fl < flatList.length; fl++) {
                    var payload = flatList[fl].payload;
                    if (payload.nodeType.id != 1) {
                        var nodeDataMap = payload.nodeDataMap;
                        var scenarioList = tree.scenarioList;
                        for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                            var nodeDataMapForScenario = (nodeDataMap[scenarioList[ndm].id])[0];
                            var nodeDataModelingListUnFiltered = ((nodeDataMap[scenarioList[ndm].id])[0].nodeDataModelingList);
                            var transferNodeList = transferToNodeList.filter(c => c.nodeDataId == nodeDataMapForScenario.nodeDataId);
                            var nodeDataModelingListWithTransfer = nodeDataModelingListUnFiltered.concat(transferNodeList);
                            var nodeDataModelingList = (nodeDataModelingListWithTransfer).filter(c => moment(curDate).format("YYYY-MM-DD") >= moment(c.startDate).format("YYYY-MM-DD") && moment(curDate).format("YYYY-MM-DD") <= moment(c.stopDate).format("YYYY-MM-DD"));
                            var nodeDataOverrideList = ((nodeDataMap[scenarioList[ndm].id])[0].nodeDataOverrideList);
                            // console.log("nodeDataOverrideList>>>", nodeDataOverrideList);
                            var startValue = 0;
                            var startValueWMC = 0;
                            if (moment(curDate).format("YYYY-MM-DD") == moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                if (nodeDataMapForScenario.calculatedDataValue == null || payload.nodeType.id != 2) {
                                    startValue = nodeDataMapForScenario.dataValue;
                                    startValueWMC = nodeDataMapForScenario.dataValue;
                                } else {
                                    startValue = nodeDataMapForScenario.calculatedDataValue;
                                    startValueWMC = nodeDataMapForScenario.calculatedDataValue;
                                }
                            } else if (moment(curDate).format("YYYY-MM-DD") < moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                startValue = 0;
                                startValueWMC = 0;
                            } else if (moment(curDate).format("YYYY-MM-DD") > moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                startValue = nodeDataList.filter(c => c.nodeDataId == nodeDataMapForScenario.nodeDataId && moment(c.month).format("YYYY-MM-DD") == moment(curDate).add(-1, 'months').format("YYYY-MM-DD"))[0].endValue;
                                startValueWMC = nodeDataList.filter(c => c.nodeDataId == nodeDataMapForScenario.nodeDataId && moment(c.month).format("YYYY-MM-DD") == moment(curDate).add(-1, 'months').format("YYYY-MM-DD"))[0].endValueWMC;
                            }
                            var difference = 0;
                            var differenceWMC = 0;
                            var transferNodeValue = 0;
                            for (var ndml = 0; ndml < nodeDataModelingList.length; ndml++) {
                                var nodeDataModeling = nodeDataModelingList[ndml];
                                //Linear number
                                if (nodeDataModeling.modelingType.id == 2 && nodeDataModeling.transferNodeDataId == null) {
                                    difference += Number(nodeDataModeling.dataValue);
                                    differenceWMC += Number(nodeDataModeling.dataValue);
                                }
                                //Linear %
                                else if (nodeDataModeling.modelingType.id == 3 && nodeDataModeling.transferNodeDataId == null) {
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
                                        dv = (nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(nodeDataModeling.startDate).add(-1, 'months').format("YYYY-MM-DD") && c.nodeDataId == nodeDataMapForScenario.nodeDataId)[0]).calculatedValue;
                                        dvWMC = (nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(nodeDataModeling.startDate).add(-1, 'months').format("YYYY-MM-DD") && c.nodeDataId == nodeDataMapForScenario.nodeDataId)[0]).calculatedValueWMC;
                                    }
                                    difference += Number((Number(dv) * Number(nodeDataModeling.dataValue)) / 100);
                                    differenceWMC += Number((Number(dvWMC) * Number(nodeDataModeling.dataValue)) / 100);
                                }
                                //Exponential %
                                else if (nodeDataModeling.modelingType.id == 4) {
                                    difference += Number((Number(startValue) * Number(nodeDataModeling.dataValue)) / 100);
                                    differenceWMC += Number((Number(startValueWMC) * Number(nodeDataModeling.dataValue)) / 100);
                                }
                                //Linear % point
                                else if (nodeDataModeling.modelingType.id == 5) {
                                    difference += Number(nodeDataModeling.dataValue);
                                    differenceWMC += Number(nodeDataModeling.dataValue);
                                }
                                //Linear # transfer
                                if (nodeDataModeling.modelingType.id == 2 && nodeDataModeling.transferNodeDataId != null) {
                                    transferNodeValue += Number(nodeDataModeling.dataValue);
                                }
                            }
                            // console.log("Difference+++", difference)
                            var endValue = 0;
                            var endValueWMC = 0;
                            if (moment(curDate).format("YYYY-MM-DD") == moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                endValue = Number(startValue)
                                endValueWMC = Number(startValueWMC)
                                difference = 0;
                                differenceWMC = 0;
                            } else {
                                endValue = Number(startValue) + Number(difference);
                                endValueWMC = Number(startValueWMC) + Number(differenceWMC);
                            }
                            // console.log("Start Value+++", startValue)
                            // console.log("Start Value WMC+++", startValueWMC)
                            var nodeDataOverrideListFiltered = nodeDataOverrideList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).format("YYYY-MM-DD"));
                            var endValueWithoutManualChange = endValue;
                            var endValueWithoutManualChangeWMC = endValueWMC;
                            var totalManualChange = 0;
                            var totalManualChangeWMC = 0;
                            if (nodeDataOverrideListFiltered.length > 0) {
                                // console.log("nodeDataOverrideListFiltered>>>", nodeDataOverrideListFiltered);
                                // console.log("seasonalityNumber>>>", nodeDataOverrideListFiltered[0].seasonalityPerc, ">>>", endValueWMC)

                                var seasonalityNumber = (Number(endValue) * Number(nodeDataOverrideListFiltered[0].seasonalityPerc)) / 100;
                                totalManualChange = Number(seasonalityNumber) + Number(nodeDataOverrideListFiltered[0].manualChange);

                                var seasonalityNumberWMC = (Number(endValueWithoutManualChangeWMC) * Number(nodeDataOverrideListFiltered[0].seasonalityPerc)) / 100;
                                totalManualChangeWMC = Number(seasonalityNumberWMC) + Number(nodeDataOverrideListFiltered[0].manualChange);
                            }
                            // console.log("End Value+++", endValue)
                            // console.log("End Value WMC+++", endValueWMC)

                            // console.log("totalManualChange+++", totalManualChange)
                            endValue += Number(totalManualChange);
                            var endValueWithManualChangeWMC = endValueWMC + Number(totalManualChangeWMC);
                            // console.log("End Value without manual change+++", endValueWithoutManualChange)
                            // console.log("End Value+++", endValue)
                            // console.log("End Value WMC+++", endValueWMC)
                            var calculatedValue = 0;
                            var calculatedValueWMC = 0;
                            if (payload.nodeType.id == 2) {
                                calculatedValue = endValue;
                                calculatedValueWMC = endValueWMC;
                            } else if (payload.nodeType.id == 3 || payload.nodeType.id == 4 || payload.nodeType.id == 5) {
                                // Jo uske parent ki calculated value hai Uska endValue %
                                var parent = flatList[fl].parent;
                                var parentFiltered = (flatList.filter(c => c.id == parent))[0];
                                var singleNodeData = (parentFiltered.payload.nodeDataMap[scenarioList[ndm].id])[0];
                                var parentNodeDataId = singleNodeData.nodeDataId;
                                var parentValue = nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).format("YYYY-MM-DD") && c.nodeDataId == parentNodeDataId)[0].calculatedValue;
                                calculatedValue = (Number(Number(parentValue) * Number(endValue)) / 100);
                                var parentValueWMC = 0;
                                var parentNodeValueForWMC = nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).format("YYYY-MM-DD") && c.nodeDataId == parentNodeDataId)[0];
                                var parentValueWMC = parentFiltered.payload.nodeType.id == 2 ? parentNodeValueForWMC.endValueWithManualChangeWMC : parentNodeValueForWMC.calculatedValueWMC;
                                calculatedValueWMC = (Number(Number(parentValueWMC) * Number(endValueWithManualChangeWMC)) / 100);
                            }
                            // calculatedValue = Number(calculatedValue)
                            if (moment(curDate).format("YYYY-MM-DD") == moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                calculatedValue = Number(calculatedValue);
                                calculatedValueWMC = Number(calculatedValueWMC);
                            } else {
                                calculatedValue = Number(calculatedValue) + Number(transferNodeValue);
                                calculatedValueWMC = Number(calculatedValueWMC) + Number(transferNodeValue);
                            }
                            nodeDataList.push(
                                {
                                    month: curDate,
                                    nodeDataId: nodeDataMapForScenario.nodeDataId,
                                    startValue: startValue,
                                    endValue: endValue,
                                    calculatedValue: calculatedValue,
                                    difference: difference,
                                    differenceWMC: differenceWMC,
                                    scenarioId: scenarioList[ndm].id,
                                    id: flatList[fl].id,
                                    treeId: treeList[tl].treeId,
                                    startValueWMC: startValueWMC,
                                    endValueWMC: endValueWMC,
                                    calculatedValueWMC: calculatedValueWMC,
                                    endValueWithoutAddingManualChange: endValueWithoutManualChange,
                                    endValueWithoutAddingManualChangeWMC: endValueWithoutManualChangeWMC,
                                    endValueWithManualChangeWMC: endValueWithManualChangeWMC,
                                    seasonalityPerc: nodeDataOverrideListFiltered.length > 0 ? Number(nodeDataOverrideListFiltered[0].seasonalityPerc) : 0,
                                    manualChange: nodeDataOverrideListFiltered.length > 0 ? Number(nodeDataOverrideListFiltered[0].manualChange) : 0
                                }
                            );
                            console.log("nodeDataList@@@", nodeDataList);
                        }
                    }
                }
                var aggregateNodeList = flatList.filter(c => c.payload.nodeType.id == 1);
                for (var fl = aggregateNodeList.length; fl < 0; fl--) {
                    var payload = flatList[fl].payload;
                    if (payload.nodeType.id == 1) {
                        var nodeDataMap = payload.nodeDataMap;
                        var scenarioList = tree.scenarioList;
                        for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                            var nodeDataMapForScenario = (nodeDataMap[scenarioList[ndm].id])[0];
                            var childNodeFlatList = flatList.filter(c => c.parent == aggregateNodeList[fl].id);
                            var aggregatedStartValue = 0;
                            var aggregatedEndValue = 0;
                            var aggregatedCalculatedValue = 0;
                            var aggregatedDifference = 0;
                            var aggregatedStartValueWMC = 0;
                            var aggregatedEndValueWMC = 0;
                            var aggregatedCalculatedValueWMC = 0;
                            var aggregatedDifferenceWMC = 0;
                            var aggregatedEndValueWithoutAddingManualChange = 0;
                            var aggregatedEndValueWithoutAddingManualChangeWMC = 0;
                            var aggregatedEndValueWithManualChangeWMC = 0;
                            for (var cnfl = 0; cnfl < childNodeFlatList.length; cnfl++) {
                                var childNodeDataId = (childNodeFlatList[cnfl].payload.nodeDataMap[scenarioList[ndm].id])[0].nodeDataId;
                                var nodeDataListFiltered = (nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).format("YYYY-MM-DD") && c.nodeDataId == childNodeDataId)[0]);
                                aggregatedStartValue += Number(nodeDataListFiltered.startValue);
                                aggregatedEndValue += Number(nodeDataListFiltered.endValue);
                                aggregatedCalculatedValue += Number(nodeDataListFiltered.calculatedValue);
                                aggregatedDifference += Number(nodeDataListFiltered.difference);
                                aggregatedStartValueWMC += Number(nodeDataListFiltered.startValueWMC);
                                aggregatedEndValueWMC += Number(nodeDataListFiltered.endValueWMC);
                                aggregatedCalculatedValueWMC += Number(nodeDataListFiltered.calculatedValue);
                                aggregatedDifferenceWMC += Number(nodeDataListFiltered.differenceWMC);
                                aggregatedEndValueWithoutAddingManualChange += Number(nodeDataListFiltered.endValueWithoutAddingManualChange);
                                aggregatedEndValueWithoutAddingManualChangeWMC += Number(nodeDataListFiltered.endValueWithoutAddingManualChangeWMC);
                                aggregatedEndValueWithManualChangeWMC += Number(nodeDataListFiltered.endValueWithManualChangeWMC);
                            }
                            nodeDataList.push(
                                {
                                    month: curDate,
                                    nodeDataId: nodeDataMapForScenario.nodeDataId,
                                    startValue: aggregatedStartValue,
                                    endValue: aggregatedEndValue,
                                    calculatedValue: aggregatedCalculatedValue,
                                    difference: aggregatedDifference,
                                    scenarioId: scenarioList[ndm].id,
                                    id: flatList[fl].id,
                                    treeId: treeList[tl].treeId,
                                    startValueWMC: aggregatedStartValueWMC,
                                    endValueWMC: aggregatedEndValueWMC,
                                    calculatedValueWMC: aggregatedCalculatedValueWMC,
                                    seasonalityPerc: 0,
                                    manualChange: 0,
                                    differenceWMC: aggregatedDifferenceWMC,
                                    endValueWithoutAddingManualChange: aggregatedEndValueWithoutAddingManualChange,
                                    endValueWithoutAddingManualChangeWMC: aggregatedEndValueWithoutAddingManualChangeWMC,
                                    endValueWithManualChangeWMC: aggregatedEndValueWithManualChangeWMC,
                                }
                            );

                        }
                    }
                }
            }
        }
        // console.log("NodeDataModelingList###", nodeDataList.filter(c => c.nodeDataId == 1));
        datasetJson.nodeDataModelingList = nodeDataList;
        var encryptedDatasetJson = (CryptoJS.AES.encrypt(JSON.stringify(datasetJson), SECRET_KEY)).toString();
        dataset.programData = encryptedDatasetJson;
        var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
        var datasetOs = datasetTransaction.objectStore('datasetData');
        var putRequest = datasetOs.put(dataset);
        putRequest.onerror = function (event) {
        }.bind(this);
        putRequest.onsuccess = function (event) {
            if (page == "syncPage") {
                props.fetchData(1, dataset.id);
            } else {
                // props.upadteState("loading", false);
                console.log("Data saved")
            }
        }.bind(this)
    }.bind(this)
}