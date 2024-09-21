import moment from "moment";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, OPEN_PROBLEM_STATUS_ID, PROGRAM_TYPE_SUPPLY_PLAN, SECRET_KEY } from "../../Constants";
import CryptoJS from 'crypto-js';
export function DashboardTop(props, rebuild) {
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
            var pdRequest = pdObjectStore.getAll();
            pdRequest.onsuccess = function (event) {
                var pdList = pdRequest.result;
                if (rebuild) {
                    var dashboradTopList = [];
                    try {
                        pdList.map(item => {
                            var ppu = ppuList.filter(c => c.program.id == item.programId);
                            var programDataBytes = CryptoJS.AES.decrypt(item.programData.generalData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);
                            var generalProgramJson = programJson;
                            var planningUnitDataList = item.programData.planningUnitDataList;
                            var consumptionList = [];
                            var inventoryList = [];
                            var shipmentList = [];
                            var batchInfoList = [];
                            var supplyPlan = [];
                            for (var pu = 0; pu < planningUnitDataList.length; pu++) {
                                var planningUnitData = planningUnitDataList[pu];
                                var programDataBytes = CryptoJS.AES.decrypt(planningUnitData.planningUnitData, SECRET_KEY);
                                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                var planningUnitDataJson = JSON.parse(programData);
                                consumptionList = consumptionList.concat(planningUnitDataJson.consumptionList);
                                inventoryList = inventoryList.concat(planningUnitDataJson.inventoryList);
                                shipmentList = shipmentList.concat(planningUnitDataJson.shipmentList);
                                batchInfoList = batchInfoList.concat(planningUnitDataJson.batchInfoList);
                                supplyPlan = supplyPlan.concat(planningUnitDataJson.supplyPlan);
                            }
                            programJson.consumptionList = consumptionList;
                            programJson.inventoryList = inventoryList;
                            programJson.shipmentList = shipmentList;
                            programJson.batchInfoList = batchInfoList;
                            programJson.supplyPlan = supplyPlan;
                            var startDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).format("YYYY-MM");
                            var endDate = moment(new Date().toLocaleString("en-US", { timeZone: "America/New_York" })).add(17, 'months').format("YYYY-MM");
                            var stockedOutCount = [...new Set(programJson.supplyPlan.filter(c => c.mos != null && parseFloat(Number(c.mos)).toFixed(1) == 0 && moment(c.transDate).format("YYYY-MM") >= moment(startDate).format("YYYY-MM") && moment(c.transDate).format("YYYY-MM") <= moment(endDate).format("YYYY-MM")).map(item => item.planningUnitId))].length;
                            var expiredCount = [...new Set(programJson.supplyPlan.filter(c => c.expiredStock > 0 && moment(c.transDate).format("YYYY-MM") >= moment(startDate).format("YYYY-MM") && moment(c.transDate).format("YYYY-MM") <= moment(endDate).format("YYYY-MM")).map(item => item.planningUnitId))].length;
                            const allDates = [
                                ...consumptionList.map(item => moment(item.lastModifiedDate)),
                                ...inventoryList.map(item => moment(item.lastModifiedDate)),
                                ...shipmentList.map(item => moment(item.lastModifiedDate)),
                                ...programJson.problemReportList.map(item => moment(item.lastModifiedDate))
                            ];
                            // Find the maximum date
                            const maxDate = moment.max(allDates);
                            var dashboradTop = {
                                "program": {
                                    "id": item.id,
                                    "label": programJson.label
                                },
                                "activePlanningUnits": ppu.filter(c => c.active).length,
                                "disabledPlanningUnits": ppu.filter(c => c.active == false).length,
                                "countOfStockOutPU": stockedOutCount,
                                "countOfExpiredPU": expiredCount,
                                "countOfOpenProblem": programJson.problemReportList.filter(c => c.problemStatus.id == OPEN_PROBLEM_STATUS_ID).length,
                                "lastModifiedDate": moment(maxDate).format("YYYY-MM-DD HH:mm:ss"),
                                "commitDate": programJson.currentVersion.createdDate,
                                "versionType": programJson.currentVersion.versionType,
                                "versionStatus": programJson.currentVersion.versionStatus
                            }
                            dashboradTopList.push(dashboradTop);
                            generalProgramJson.dashboradTop = dashboradTop;
                            item.programData.generalData = (CryptoJS.AES.encrypt(JSON.stringify(generalProgramJson), SECRET_KEY)).toString()
                            var programTransaction = db1.transaction(['programData'], 'readwrite');
                            var programObjectStore = programTransaction.objectStore('programData');
                            programObjectStore.put(item);
                        })
                        props.updateStateDashboard("dashboardTopList", dashboradTopList);
                    } catch (err) {
                    }
                } else {
                    var dashboradTopList = [];
                    try {
                        pdList.map(item => {
                            var ppu = ppuList.filter(c => c.program.id == item.programId);
                            var programDataBytes = CryptoJS.AES.decrypt(item.programData.generalData, SECRET_KEY);
                            var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                            var programJson = JSON.parse(programData);
                            dashboradTopList.push(programJson.dashboradTop)
                            programJson.dashboradTop.activePlanningUnits = ppu.filter(c => c.active).length;
                            programJson.dashboradTop.disabledPlanningUnits = ppu.filter(c => c.active == false).length;
                        })
                        props.updateStateDashboard("dashboardTopList", dashboradTopList);
                    } catch (err) {
                    }
                }
            }.bind(this)
        }.bind(this)
    }.bind(this)
}