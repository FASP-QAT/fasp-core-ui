import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { FINAL_VERSION_TYPE, INDEXED_DB_NAME, INDEXED_DB_VERSION, OPEN_PROBLEM_STATUS_ID, PROGRAM_TYPE_SUPPLY_PLAN, SECRET_KEY } from "../../Constants";
import CryptoJS from 'crypto-js';
export function Dashboard(props, programId, reportBy, updateTopPart, updateBottomPart) {
    if (updateTopPart.toString() == "true") {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
            var ppuObjectStore = ppuTransaction.objectStore('programPlanningUnit');
            var ppuRequest = ppuObjectStore.getAll();
            ppuRequest.onsuccess = function (event) {
                var ppuList = ppuRequest.result;
                var pTransaction = db1.transaction(['program'], 'readwrite');
                var pObjectStore = pTransaction.objectStore('program');
                var pRequest = pObjectStore.getAll();
                pRequest.onsuccess = function (event) {
                    var pList = pRequest.result;
                    var pdTransaction = db1.transaction(['programData'], 'readwrite');
                    var pdObjectStore = pdTransaction.objectStore('programData');
                    var pdRequest = pdObjectStore.getAll();
                    pdRequest.onsuccess = function (event) {
                        var pdList = pdRequest.result;
                        var pqdTransaction = db1.transaction(['programQPLDetails'], 'readwrite');
                        var pqdObjectStore = pqdTransaction.objectStore('programQPLDetails');
                        var pqdRequest = pqdObjectStore.getAll();
                        pqdRequest.onsuccess = function (event) {
                            var pqdList = pdRequest.result;
                            var dashboradTopList = [];
                            try {
                                pdList.map(item => {
                                    var pqd=pqdList.filter(c=>c.id==item.id);
                                    var ppu = ppuList.filter(c => c.program.id == item.programId);
                                    var p = pList.filter(c => c.programId == item.programId);
                                    var programDataBytes = CryptoJS.AES.decrypt(item.programData.generalData, SECRET_KEY);
                                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                    var programJson = JSON.parse(programData);
                                    var generalProgramJson = programJson;
                                    var dashboardData = generalProgramJson.dashboardData;
                                    console.log("dashboardData Test@123", dashboardData)
                                    if (dashboardData != undefined) {
                                        var topPuData = dashboardData.topPuData;
                                        var stockedOutCount = 0;
                                        var valueOfExpiredPU = 0;
                                        if (topPuData != "" && topPuData != undefined) {
                                            var puIds = ppu.filter(c => c.active.toString() == "true")
                                            puIds.map(pu => {
                                                var item = topPuData[pu.planningUnit.id];
                                                if (item.stockOut.toString() == "true") {
                                                    stockedOutCount += 1;
                                                }
                                                valueOfExpiredPU += Number(Math.round(item.valueOfExpiredStock))
                                            })
                                        }
                                        var dashboradTop = {
                                            "program": {
                                                "id": item.id,
                                                "label": programJson.label,
                                                "code": programJson.programCode,
                                                "version": item.version
                                            },
                                            "activePlanningUnits": ppu.filter(c => c.active).length,
                                            "disabledPlanningUnits": ppu.filter(c => c.active == false).length,
                                            "countOfStockOutPU": stockedOutCount,
                                            "valueOfExpiredPU": valueOfExpiredPU,
                                            "countOfOpenProblem": programJson.problemReportList.filter(c => c.problemStatus.id == OPEN_PROBLEM_STATUS_ID).length,
                                            "lastModifiedDate": moment(programJson.lastModifiedDate).format("YYYY-MM-DD HH:mm:ss"),
                                            "commitDate": programJson.currentVersion.createdDate,
                                            "versionType": programJson.currentVersion.versionType,
                                            "versionStatus": programJson.currentVersion.versionStatus,
                                            "latestFinalVersion": p[0].versionList.filter(c => c.versionType.id == FINAL_VERSION_TYPE).slice(-1)[0],
                                            "isLatest": p[0].currentVersion.versionId > item.version ? false : true,
                                            "isChanged":pqd[0].programModified
                                        }
                                        dashboradTopList.push(dashboradTop);
                                    }
                                })
                                console.log("dashboradTopList Test@123", dashboradTopList)
                                props.updateStateDashboard("dashboardTopList", dashboradTopList);
                            } catch (err) {
                                console.log("Error Test@123", err)
                            }
                        }.bind(this)
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }
    if (updateBottomPart.toString() == "true") {
        var db1;
        getDatabase();
        var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
        openRequest.onsuccess = function (e) {
            db1 = e.target.result;
            var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
            var ppuObjectStore = ppuTransaction.objectStore('programPlanningUnit');
            var ppuRequest = ppuObjectStore.getAll();
            ppuRequest.onsuccess = function (event) {
                var ppuList = ppuRequest.result;
                var pdTransaction = db1.transaction(['programData'], 'readwrite');
                var pdObjectStore = pdTransaction.objectStore('programData');
                var pdRequest = pdObjectStore.get(programId);
                pdRequest.onsuccess = function (event) {
                    var programData = pdRequest.result;
                    var ppuListForProgram = ppuList.filter(c => c.program.id == programData.programId);
                    var programDataBytes = CryptoJS.AES.decrypt(programData.programData.generalData, SECRET_KEY);
                    var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                    var programJson = JSON.parse(programData);
                    var generalProgramJson = programJson;
                    var dashboardBottomData = {};
                    var dashboardData = generalProgramJson.dashboardData;
                    if (dashboardData != undefined) {
                        var bottomPuData = dashboardData.bottomPuData;
                        var stockOut = 0;
                        var underStock = 0;
                        var adequate = 0;
                        var overStock = 0;
                        var na = 0;
                        var puStockOutList = [];
                        var expiriesList = [];
                        var shipmentDetailsList = [];
                        var shipmentWithFundingSourceTbd = [];
                        var forecastConsumptionQplCount = 0;
                        var actualConsumptionQplCount = 0;
                        var inventoryQplCount = 0;
                        var shipmentQplCount = 0;
                        var totalQpl = 0;
                        var expiryTotal = 0;
                        if (bottomPuData != "" && bottomPuData != undefined) {
                            var puIds = ppuListForProgram.filter(c => c.active.toString() == "true")
                            puIds.map(item => {
                                var value = bottomPuData[item.planningUnit.id];
                                if (value != undefined) {
                                    stockOut += Number(value.stockStatus.stockOut);
                                    underStock += Number(value.stockStatus.underStock);
                                    adequate += Number(value.stockStatus.adequate);
                                    overStock += Number(value.stockStatus.overStock);
                                    na += Number(value.stockStatus.na);
                                    if (Number(value.stockStatus.stockOut)) {
                                        puStockOutList.push({
                                            "planningUnit": item.planningUnit,
                                            "count": Number(value.stockStatus.stockOut)
                                        })
                                    }
                                    var expiryList = value.expiriesList;
                                    expiryList.forEach(expiry => {
                                        expiry.planningUnit = item.planningUnit;
                                        expiryTotal += Number(Math.round(expiry.expiryAmt));
                                    });
                                    expiriesList = expiriesList.concat(expiryList);
                                    if (reportBy == 1) {
                                        shipmentDetailsList = shipmentDetailsList.concat(value.shipmentDetailsByFundingSource)
                                    } else if (reportBy == 2) {
                                        shipmentDetailsList = shipmentDetailsList.concat(value.shipmentDetailsByProcurementAgent)
                                    } else {
                                        shipmentDetailsList = shipmentDetailsList.concat(value.shipmentDetailsByShipmentStatus)
                                    }
                                    if (Number(value.countOfTbdFundingSource) > 0) {
                                        shipmentWithFundingSourceTbd.push({
                                            "planningUnit": item.planningUnit,
                                            "count": Number(value.countOfTbdFundingSource)
                                        })
                                    }
                                    totalQpl += 1;
                                    if (value.forecastConsumptionQplPassed.toString() == "true") {
                                        forecastConsumptionQplCount += 1;
                                    }
                                    if (value.actualConsumptionQplPassed.toString() == "true") {
                                        actualConsumptionQplCount += 1;
                                    }
                                    if (value.inventoryQplPassed.toString() == "true") {
                                        inventoryQplCount += 1;
                                    }
                                    if (value.shipmentQplPassed.toString() == "true") {
                                        shipmentQplCount += 1;
                                    }
                                }
                            });
                            var totalStock = Number(stockOut) + Number(underStock) + Number(adequate) + Number(overStock) + Number(na);
                            var shipmentTotal = 0;
                            shipmentDetailsList.map(item => {
                                shipmentTotal += Number(item.cost)
                            })
                            dashboardBottomData = {
                                "stockStatus": {
                                    "stockOut": stockOut,
                                    "underStock": underStock,
                                    "adequate": adequate,
                                    "overStock": overStock,
                                    "na": na,
                                    "total": totalStock,
                                    "puStockOutList": puStockOutList,
                                    "stockOutPerc": Number(stockOut) / Number(totalStock),
                                    "underStockPerc": Number(underStock) / Number(totalStock),
                                    "adequatePerc": Number(adequate) / Number(totalStock),
                                    "overStockPerc": Number(overStock) / Number(totalStock),
                                    "naPerc": Number(na) / Number(totalStock)
                                },
                                "expiriesList": expiriesList,
                                "shipmentDetailsList": shipmentDetailsList,
                                "shipmentWithFundingSourceTbd": shipmentWithFundingSourceTbd,
                                "forecastErrorList": [],
                                "forecastConsumptionQpl": {
                                    "puCount": totalQpl,
                                    "correctCount": forecastConsumptionQplCount
                                },
                                "actualConsumptionQpl": {
                                    "puCount": totalQpl,
                                    "correctCount": actualConsumptionQplCount
                                },
                                "inventoryQpl": {
                                    "puCount": totalQpl,
                                    "correctCount": inventoryQplCount
                                },
                                "shipmentQpl": {
                                    "puCount": totalQpl,
                                    "correctCount": shipmentQplCount
                                },
                                "expiryTotal": expiryTotal,
                                "shipmentTotal": shipmentTotal
                            }
                            console.log("dashboardBottomData Test@123", dashboardBottomData)
                            props.updateStateDashboard("dashboardStartDateBottom", generalProgramJson.dashboardData.startDateBottom);
                            props.updateStateDashboard("dashboardStopDateBottom", generalProgramJson.dashboardData.stopDateBottom);
                            props.updateStateDashboard("dashboardBottomData", dashboardBottomData);
                        } else {
                            props.updateStateDashboard("dashboardBottomData", "");
                        }
                    } else {
                        props.updateStateDashboard("dashboardBottomData", "");
                    }
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }
}