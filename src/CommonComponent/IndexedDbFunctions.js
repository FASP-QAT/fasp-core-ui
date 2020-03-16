// const db1="";
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../Constants.js'
export function getDatabase() {
    console.log("in function")
    var db1;
    var storeOS;
    var openRequest = indexedDB.open('fasp', 1);
    console.log("in open request", openRequest);
    openRequest.onupgradeneeded = function (e) {
        console.log("in on upgrade needed");
        db1 = e.target.result;
        if (!db1.objectStoreNames.contains('programData')) {
            storeOS = db1.createObjectStore('programData', { keyPath: 'id'});
        }
        if (!db1.objectStoreNames.contains('lastSyncDate')) {
            storeOS = db1.createObjectStore('lastSyncDate', { keyPath: 'id', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('language')) {
            storeOS = db1.createObjectStore('language', { keyPath: 'languageId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('country')) {
            storeOS = db1.createObjectStore('country', { keyPath: 'countryId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('currency')) {
            storeOS = db1.createObjectStore('currency', { keyPath: 'currencyId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('unit')) {
            storeOS = db1.createObjectStore('unit', { keyPath: 'unitId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('unitType')) {
            storeOS = db1.createObjectStore('unitType', { keyPath: 'unitTypeId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('organisation')) {
            storeOS = db1.createObjectStore('organisation', { keyPath: 'organisationId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('healthArea')) {
            storeOS = db1.createObjectStore('healthArea', { keyPath: 'healthAreaId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('region')) {
            storeOS = db1.createObjectStore('region', { keyPath: 'regionId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('fundingSource')) {
            storeOS = db1.createObjectStore('fundingSource', { keyPath: 'fundingSourceId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('subFundingSource')) {
            storeOS = db1.createObjectStore('subFundingSource', { keyPath: 'subFundingSourceId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('product')) {
            storeOS = db1.createObjectStore('product', { keyPath: 'productId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('productCategory')) {
            storeOS = db1.createObjectStore('productCategory', { keyPath: 'productCategoryId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('dataSource')) {
            storeOS = db1.createObjectStore('dataSource', { keyPath: 'dataSourceId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('dataSourceType')) {
            storeOS = db1.createObjectStore('dataSourceType', { keyPath: 'dataSourceTypeId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('shipmentStatus')) {
            storeOS = db1.createObjectStore('shipmentStatus', { keyPath: 'shipmentStatusId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('shipmentStatusAllowed')) {
            storeOS = db1.createObjectStore('shipmentStatusAllowed', { keyPath: 'shipmentStatusAllowedId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('manufacturer')) {
            storeOS = db1.createObjectStore('manufacturer', { keyPath: 'manufacturerId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('logisticsUnit')) {
            storeOS = db1.createObjectStore('logisticsUnit', { keyPath: 'logisticsUnitId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('planningUnit')) {
            storeOS = db1.createObjectStore('planningUnit', { keyPath: 'planningUnitId', autoIncrement: true });
        }
    };
    openRequest.onsuccess = function (e) {
        console.log("in success")
        db1 = e.target.result;
        return db1;
    }
}

export function saveProgram(json) {
    console.log("in save program")
    var db1;
    var openRequest = indexedDB.open('fasp', 1);
    openRequest.onsuccess = function (e) {
        db1 = e.target.result;
        var transaction = db1.transaction(['programData'], 'readwrite');
        var program = transaction.objectStore('programData');
        console.log("in program",program)
        for (var i = 0; i < json.length; i++) {
            console.log("in for")
            var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(json[i]), SECRET_KEY);
            var userBytes = CryptoJS.AES.decrypt(localStorage.getItem('curUser'), SECRET_KEY);
            var userId = userBytes.toString(CryptoJS.enc.Utf8);
            var item = {
                id: json[i].programId + "_v" + json[i].programVersion + "_uId_" + userId,
                programId: json[i].programId,
                version: json[i].programVersion,
                programName: (CryptoJS.AES.encrypt(JSON.stringify((json[i].label)), SECRET_KEY)).toString(),
                programData: encryptedText.toString(),
                userId: userId
            };
            var putRequest = program.put(item);
            console.log("afyer put")
        }

        transaction.oncomplete = function (event) {
            console.log("in trans complete");
            let promise = new Promise(function (resolve, reject) {
                setTimeout(() => resolve("done!"), 0);
            });
            console.log("promise",promise)
            return promise;
        }
    }
}