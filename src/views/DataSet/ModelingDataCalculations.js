import CryptoJS from 'crypto-js'
import moment from 'moment';
import { getDatabase } from '../../CommonComponent/IndexedDbFunctions.js';
import { SECRET_KEY, CANCELLED_SHIPMENT_STATUS, PLANNED_SHIPMENT_STATUS, SUBMITTED_SHIPMENT_STATUS, APPROVED_SHIPMENT_STATUS, SHIPPED_SHIPMENT_STATUS, ARRIVED_SHIPMENT_STATUS, DELIVERED_SHIPMENT_STATUS, ON_HOLD_SHIPMENT_STATUS, FIRST_DATA_ENTRY_DATE, TBD_PROCUREMENT_AGENT_ID, ACTUAL_CONSUMPTION_TYPE, FORCASTED_CONSUMPTION_TYPE, INDEXED_DB_NAME, INDEXED_DB_VERSION, QAT_DATA_SOURCE_ID, NOTES_FOR_QAT_ADJUSTMENTS, ACTUAL_CONSUMPTION_DATA_SOURCE_TYPE, BATCH_PREFIX } from '../../Constants.js'
export function calculateModelingData(dataset, props) {
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
                console.log("Tree###", tree);
                var flatList = tree.tree.flatList.sort(function (a, b) {
                    a = a.sortOrder;
                    b = b.sortOrder;
                    return a < b ? -1 : a > b ? 1 : 0;
                });
                console.log("FlatList###", flatList);
                var transferToNodeList = [];

                for (var fl = 0; fl < flatList.length; fl++) {
                    var payload = flatList[fl].payload;
                    if (payload.nodeType.id != 1) {
                        console.log("Payload###", payload)
                        var nodeDataMap = payload.nodeDataMap;
                        console.log("NodeDataMap###", nodeDataMap);
                        var scenarioList = tree.scenarioList;
                        for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                            console.log("Nodedatamap###", nodeDataMap[scenarioList[ndm].id]);
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
                        console.log("Payload###", payload)
                        var nodeDataMap = payload.nodeDataMap;
                        console.log("NodeDataMap###", nodeDataMap);
                        var scenarioList = tree.scenarioList;
                        for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                            console.log("Nodedatamap###", nodeDataMap[scenarioList[ndm].id]);
                            var nodeDataMapForScenario = (nodeDataMap[scenarioList[ndm].id])[0];
                            var nodeDataModelingListUnFiltered = ((nodeDataMap[scenarioList[ndm].id])[0].nodeDataModelingList);
                            var transferNodeList = transferToNodeList.filter(c => c.nodeDataId == nodeDataMapForScenario.nodeDataId);
                            var nodeDataModelingListWithTransfer = nodeDataModelingListUnFiltered.concat(transferNodeList);
                            var nodeDataModelingList = (nodeDataModelingListWithTransfer).filter(c => moment(curDate).format("YYYY-MM-DD") >= moment(c.startDate).format("YYYY-MM-DD") && moment(curDate).format("YYYY-MM-DD") <= moment(c.stopDate).format("YYYY-MM-DD"));
                            console.log("NodeDataModelingList###", nodeDataModelingList);
                            var startValue = 0;
                            if (moment(curDate).format("YYYY-MM-DD") == moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                if (nodeDataMapForScenario.calculatedDataValue == null) {
                                    startValue = nodeDataMapForScenario.dataValue;
                                } else {
                                    startValue = nodeDataMapForScenario.calculatedDataValue;
                                }
                            } else if (moment(curDate).format("YYYY-MM-DD") < moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                startValue = 0;
                            } else if (moment(curDate).format("YYYY-MM-DD") > moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                startValue = nodeDataList.filter(c => c.id == nodeDataMapForScenario.nodeDataId && moment(c.month).format("YYYY-MM-DD") == moment(curDate).add(-1, 'months').format("YYYY-MM-DD"))[0].endValue;
                            }
                            var endValue = 0;
                            var difference = 0;
                            var transferNodeValue = 0;
                            for (var ndml = 0; ndml < nodeDataModelingList.length; ndml++) {
                                var nodeDataModeling = nodeDataModelingList[ndml];
                                //Linear number
                                if (nodeDataModeling.modelingType.id == 2 && nodeDataModeling.transferNodeDataId == null) {
                                    difference += Number(nodeDataModeling.dataValue);
                                }
                                //Linear %
                                else if (nodeDataModeling.modelingType.id == 3 && nodeDataModeling.transferNodeDataId == null) {
                                    var dv = 0;
                                    if (moment(nodeDataMapForScenario.month).format("YYYY-MM-DD") == moment(nodeDataModeling.startDate).format("YYYY-MM-DD")) {
                                        if (nodeDataMapForScenario.calculatedDataValue == null) {
                                            dv = nodeDataMapForScenario.dataValue;
                                        } else {
                                            dv = nodeDataMapForScenario.calculatedDataValue;
                                        }
                                    } else {
                                        dv = (nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(nodeDataModeling.startDate).add(-1, 'months').format("YYYY-MM-DD") && c.id == nodeDataMapForScenario.nodeDataId)[0]).calculatedValue;
                                    }
                                    difference += Number((Number(dv) * Number(nodeDataModeling.dataValue)) / 100);
                                }
                                //Exponential %
                                else if (nodeDataModeling.modelingType.id == 4) {
                                    difference += Number((Number(startValue) * Number(nodeDataModeling.dataValue)) / 100);
                                }
                                //Linear % point
                                else if (nodeDataModeling.modelingType.id == 5) {
                                    difference += Number(nodeDataModeling.dataValue);
                                }
                                //Linear # transfer
                                if (nodeDataModeling.modelingType.id == 2 && nodeDataModeling.transferNodeDataId != null) {
                                    transferNodeValue += Number(nodeDataModeling.dataValue);
                                }
                            }
                            var endValue = 0;
                            if (moment(curDate).format("YYYY-MM-DD") == moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                endValue = startValue
                                difference=0;
                            } else {
                                endValue = startValue + difference;
                            }
                            var calculatedValue = 0;
                            if (payload.nodeType.id == 2) {
                                calculatedValue = endValue;
                            } else if (payload.nodeType.id == 3 || payload.nodeType.id == 4 || payload.nodeType.id == 5) {
                                // Jo uske parent ki calculated value hai Uska endValue %
                                var parent = flatList[fl].parent;
                                var parentNodeDataId = (flatList.filter(c => c.id == parent)[0].payload.nodeDataMap[scenarioList[ndm].id])[0].nodeDataId;
                                console.log("ParentNodeDataId$$$$", parentNodeDataId);
                                var parentValue = nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).format("YYYY-MM-DD") && c.id == parentNodeDataId)[0].calculatedValue;
                                console.log("ParentNodeDataId$$$$", parentValue);
                                calculatedValue = (Number(Number(parentValue) * Number(endValue)) / 100);
                            }
                            // calculatedValue = Number(calculatedValue)
                            if (moment(curDate).format("YYYY-MM-DD") == moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                calculatedValue = Number(calculatedValue);
                            } else {
                                calculatedValue = Number(calculatedValue) + Number(transferNodeValue);
                            }
                            nodeDataList.push(
                                {
                                    month: curDate,
                                    id: nodeDataMapForScenario.nodeDataId,
                                    startValue: startValue,
                                    endValue: endValue,
                                    calculatedValue: calculatedValue,
                                    difference: difference
                                }
                            );
                            console.log("NodeDataListAfter pushing###", nodeDataList)
                        }
                    }
                }
            }
        }
        console.log("DatasetJson###", datasetJson);
        console.log("NodeDataList###1", nodeDataList.filter(c => c.id == 1));
        console.log("NodeDataList###2", nodeDataList.filter(c => c.id == 2));
        console.log("NodeDataList###3", nodeDataList.filter(c => c.id == 3));
        console.log("NodeDataList###4", nodeDataList.filter(c => c.id == 4));
        console.log("NodeDataList###5", nodeDataList.filter(c => c.id == 5));
        console.log("NodeDataList###6", nodeDataList.filter(c => c.id == 6));
        console.log("NodeDataList###7", nodeDataList.filter(c => c.id == 7));
        console.log("NodeDataList###8", nodeDataList.filter(c => c.id == 8));
        console.log("NodeDataList###9", nodeDataList.filter(c => c.id == 9));
        datasetJson.nodeDataModelingList = nodeDataList;
        var encryptedDatasetJson = (CryptoJS.AES.encrypt(JSON.stringify(datasetJson), SECRET_KEY)).toString();
        dataset.programData = encryptedDatasetJson;
        var datasetTransaction = db1.transaction(['datasetData'], 'readwrite');
        var datasetOs = datasetTransaction.objectStore('datasetData');
        var putRequest = datasetOs.put(dataset);
        putRequest.onerror = function (event) {
        }.bind(this);
        putRequest.onsuccess = function (event) {
            props.fetchData(1, dataset.id);
        }.bind(this)
    }.bind(this)
}