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
        var startDate = moment(datasetJson.currentVersion.forecastStartDate).format("YYYY-MM-DD");
        var stopDate = moment(datasetJson.currentVersion.forecastStopDate).format("YYYY-MM-DD");
        var treeList = datasetJson.treeList;
        console.log("Tree List###", treeList);
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
            for (var fl = 0; fl < flatList.length; fl++) {
                var payload = flatList[fl].payload;
                if (payload.nodeType.id != 1) {
                    var nodeDataMap = payload.nodeDataMap;
                    console.log("NodeDataMap###", nodeDataMap);
                    var scenarioList = tree.scenarioList;
                    for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                        console.log("NodeDataMap1###", nodeDataMap[scenarioList[ndm].id]);
                        var nodeDataMapForScenario = (nodeDataMap[scenarioList[ndm].id])[0];
                        console.log("NodeDataMapForScenario###", nodeDataMapForScenario);
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
            console.log("Flat List###", flatList);
            for (var fl = 0; fl < flatList.length; fl++) {
                var payload = flatList[fl].payload;
                if (payload.nodeType.id != 1) {
                    var nodeDataMap = payload.nodeDataMap;
                    var scenarioList = tree.scenarioList;
                    for (var ndm = 0; ndm < scenarioList.length; ndm++) {
                        var nodeDataMapForScenario = (nodeDataMap[scenarioList[ndm].id])[0];
                        console.log("NodeDataMapForScenario###", nodeDataMapForScenario);
                        var nodeDataModelingListUnFiltered = ((nodeDataMap[scenarioList[ndm].id])[0].nodeDataModelingList);
                        var transferNodeList = transferToNodeList.filter(c => c.nodeDataId == nodeDataMapForScenario.nodeDataId);
                        var nodeDataModelingListWithTransfer = nodeDataModelingListUnFiltered.concat(transferNodeList);
                        var curDate = startDate;
                        var nodeDataList = [];
                        for (var i = 0; curDate < stopDate; i++) {
                            console.log("CurDate###", curDate, "i+++", i);
                            curDate = moment(startDate).add(i, 'months').format("YYYY-MM-DD");
                            var nodeDataModelingList = (nodeDataModelingListWithTransfer).filter(c => moment(curDate).format("YYYY-MM-DD") >= moment(c.startDate).format("YYYY-MM-DD") && moment(curDate).format("YYYY-MM-DD") <= moment(c.stopDate).format("YYYY-MM-DD"));
                            // console.log("nodeDatamodelingList>>>>",nodeDataModelingList);
                            console.log("((nodeDataMap[scenarioList[ndm].id])[0]>>>", ((nodeDataMap[scenarioList[ndm].id])[0]));
                            var nodeDataOverrideList = ((nodeDataMap[scenarioList[ndm].id])[0].nodeDataOverrideList);
                            console.log("nodeDataOverrideList>>>", nodeDataOverrideList);
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
                                var nodeDataListPrevMonth = nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).add(-1, 'months').format("YYYY-MM-DD"))[0];
                                startValue = nodeDataMapForScenario.manualChangesEffectFuture ? nodeDataListPrevMonth.endValue : nodeDataListPrevMonth.endValueWMC;
                            }
                            console.log("Start value###", startValue);
                            var difference = 0;
                            var differenceWMC = 0;
                            var transferNodeValue = 0;
                            console.log("nodeDataModelingList###", nodeDataModelingList);
                            for (var ndml = 0; ndml < nodeDataModelingList.length; ndml++) {
                                var nodeDataModeling = nodeDataModelingList[ndml];
                                //Linear number
                                if (nodeDataModeling.modelingType.id == 2 && (nodeDataModeling.transferNodeDataId == null || nodeDataModeling.transferNodeDataId == "")) {
                                    difference += Number(nodeDataModeling.dataValue);
                                    differenceWMC += Number(nodeDataModeling.dataValue);
                                }
                                //Linear %
                                else if (nodeDataModeling.modelingType.id == 3 && (nodeDataModeling.transferNodeDataId == null || nodeDataModeling.transferNodeDataId == "")) {
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
                                        dv = (nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(nodeDataModeling.startDate).add(-1, 'months').format("YYYY-MM-DD"))[0]).endValue;
                                        dvWMC = (nodeDataList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(nodeDataModeling.startDate).add(-1, 'months').format("YYYY-MM-DD"))[0]).endValueWMC;
                                    }
                                    difference += Number((Number(dv) * Number(nodeDataModeling.dataValue)) / 100);
                                    differenceWMC += Number((Number(dvWMC) * Number(nodeDataModeling.dataValue)) / 100);
                                }
                                //Exponential %
                                else if (nodeDataModeling.modelingType.id == 4 && nodeDataModeling.transferNodeDataId == null) {
                                    difference += Number((Number(startValue) * Number(nodeDataModeling.dataValue)) / 100);
                                    differenceWMC += Number((Number(startValue) * Number(nodeDataModeling.dataValue)) / 100);
                                }
                                //Linear % point
                                else if (nodeDataModeling.modelingType.id == 5 && nodeDataModeling.transferNodeDataId == null) {
                                    difference += Number(nodeDataModeling.dataValue);
                                    differenceWMC += Number(nodeDataModeling.dataValue);
                                }

                                //Linear # transfer
                                if (nodeDataModeling.modelingType.id == 2 && nodeDataModeling.transferNodeDataId != null && moment(curDate).format("YYYY-MM-DD") > moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                    transferNodeValue += Number(nodeDataModeling.dataValue);
                                }
                                if (nodeDataModeling.modelingType.id == 5 && nodeDataModeling.transferNodeDataId != null && moment(curDate).format("YYYY-MM-DD") > moment(nodeDataMapForScenario.month).format("YYYY-MM-DD")) {
                                    transferNodeValue += Number(nodeDataModeling.dataValue);
                                }

                            }
                            console.log("Difference###", difference);
                            var endValue = 0;
                            var endValueWMC = 0;
                            endValue = Number(startValue) + Number(difference) + Number(transferNodeValue);
                            endValueWMC = Number(startValue) + Number(differenceWMC) + Number(transferNodeValue);
                            var totalManualChange = 0;
                            var nodeDataOverrideListFiltered = nodeDataOverrideList.length != null ? nodeDataOverrideList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).format("YYYY-MM-DD")) : [];
                            if (nodeDataOverrideListFiltered.length > 0) {
                                var seasonalityNumber = (Number(endValue) * Number(nodeDataOverrideListFiltered[0].seasonalityPerc)) / 100;
                                totalManualChange = Number(seasonalityNumber) + Number(nodeDataOverrideListFiltered[0].manualChange);
                            }

                            endValue = endValue + totalManualChange;

                            console.log("End Value###", endValue);
                            console.log("End Value WMC###", endValueWMC);
                            var calculatedValue = 0;
                            if (payload.nodeType.id == 2) {
                                calculatedValue = endValue;
                            } else if (payload.nodeType.id == 3 || payload.nodeType.id == 4 || payload.nodeType.id == 5) {
                                // Jo uske parent ki calculated value hai Uska endValue %
                                var parent = flatList[fl].parent;
                                var parentFiltered = (flatList.filter(c => c.id == parent))[0];
                                var singleNodeData = (parentFiltered.payload.nodeDataMap[scenarioList[ndm].id])[0];
                                var parentValue = singleNodeData.nodeDataMomList.filter(c => moment(c.month).format("YYYY-MM-DD") == moment(curDate).format("YYYY-MM-DD"))[0].calculatedValue;
                                calculatedValue = (Number(Number(parentValue) * Number(endValue)) / 100);
                            }

                            console.log("Calculated Value###", calculatedValue);

                            //Month For loop
                            nodeDataList.push({
                                month: curDate,
                                startValue: startValue,
                                endValue: endValue,
                                calculatedValue: calculatedValue,
                                endValueWMC: endValueWMC
                            })
                        }
                        console.log("Node MOM List###", nodeDataList);
                        nodeDataMapForScenario.nodeDataMomList = nodeDataList;
                        nodeDataMap[scenarioList[ndm].id] = [nodeDataMapForScenario];
                    }
                    payload.nodeDataMap = nodeDataMap;
                    flatList[fl].payload = payload;
                }
            }

            treeList[tl].tree.flatList = flatList;
        }
        treeList = treeList;
        datasetJson.treeList = treeList;
        console.log("DatasetJson###", datasetJson);
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
                props.updateState("loading", false);
                console.log("Data saved")
            }
        }.bind(this)
    }.bind(this)
}