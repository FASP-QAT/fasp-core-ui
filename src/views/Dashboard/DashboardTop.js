import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, PROGRAM_TYPE_SUPPLY_PLAN, SECRET_KEY } from "../../Constants";
import CryptoJS from 'crypto-js';
export function DashboardTop(props) {
    console.log("In function Test@123")
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
        console.log("In open request Test@123")
        db1 = e.target.result;
        var programQPLTransaction = db1.transaction(['programQPLDetails'], 'readwrite');
        var programQPLObjectStore = programQPLTransaction.objectStore('programQPLDetails');
        var programQPLRequest = programQPLObjectStore.getAll();
        programQPLRequest.onsuccess = function (event) {
            console.log("In open request 1 Test@123")
            var programQPLList = programQPLRequest.result;
            console.log("In open request 2 Test@123",programQPLList)
            var programTransaction = db1.transaction(['program'], 'readwrite');
            var programObjectStore = programTransaction.objectStore('program');
            var programRequest = programObjectStore.getAll();
            programRequest.onsuccess = function (event) {
                var programList = programRequest.result;
                console.log("In open request 3 Test@123",programList)
                var ppuTransaction = db1.transaction(['programPlanningUnit'], 'readwrite');
                var ppuObjectStore = ppuTransaction.objectStore('programPlanningUnit');
                var ppuRequest = ppuObjectStore.getAll();
                ppuRequest.onsuccess = function (event) {
                    var ppuList = ppuRequest.result;
                    console.log("In open request 4 Test@123",ppuList)
                    var pdTransaction = db1.transaction(['programData'], 'readwrite');
                    var pdObjectStore = pdTransaction.objectStore('programData');
                    var pdRequest = pdObjectStore.getAll();
                    pdRequest.onsuccess = function (event) {
                        var pdList = pdRequest.result;
                        console.log("In open request 5 Test@123",pdList)
                        var dashboradTopList=[];
                        try{
                        programQPLList.map(item => {
                            var program = programList.filter(c => c.programId == item.programId);
                            var ppu = ppuList.filter(c => c.program.id == item.programId);
                            var pd = pdList.filter(c => c.id == item.id);
                            if (program.length > 0) {
                                var programDataBytes = CryptoJS.AES.decrypt(pd[0].programData.generalData, SECRET_KEY);
                                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                                var programJson = JSON.parse(programData);
                                console.log("ProgramJson Test@123",programJson.problemReportList.filter(c=>c.realmProblem.problem.problemId==24))
                                var dashboradTop = {
                                    "program": {
                                        "id": item.id,
                                        "label": program[0].label
                                    },
                                    "activePlanningUnits": ppu.filter(c => c.active).length,
                                    "disabledPlanningUnits": ppu.filter(c => c.active == false).length,
                                    "countOfStockOutPU": 1,
                                    "countOfExpiredPU": 3,
                                    "countOfOpenProblem": item.openCount,
                                    "lastModifiedDate": "2023-07-13",
                                    "commitDate": "2024-08-20",
                                    "versionType": program[0].currentVersion.versionType,
                                    "versionStatus": program[0].currentVersion.versionStatus
                                }
                                console.log("dashboradTop Test@123",dashboradTop)
                                dashboradTopList.push(dashboradTop);
                            }
                        })
                        console.log("dashboradTopList Test@123",dashboradTopList)
                    }catch(err){
                        console.log("Err Test@123",err);
                    }
                    }.bind(this)
                }.bind(this)
            }.bind(this)
        }.bind(this)
    }.bind(this)
}