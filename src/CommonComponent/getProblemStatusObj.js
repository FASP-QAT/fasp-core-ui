import { INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../Constants.js'
export default function getProblemStatusObj(problemStatusId) {

    var db1;
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    var obj = undefined;
    openRequest.onsuccess = function (e) {

        db1 = e.target.result;
        var problemStatusTransaction = db1.transaction(['problemStatus'], 'readwrite');
        var problemStatusOs = problemStatusTransaction.objectStore('problemStatus');
        var problemStatusGetRequest = problemStatusOs.getAll();
        problemStatusGetRequest.onerror = function (event) {

        }.bind(this);
        problemStatusGetRequest.onsuccess = function (event) {
            var problemStatusList = [];
            problemStatusList = problemStatusGetRequest.result;
            var currentProblemStatusObj = problemStatusList.filter(c => c.id == problemStatusId)[0];
            console.log("currentProblemStatusObj+++", currentProblemStatusObj);
            return currentProblemStatusObj;

        }

    }



}