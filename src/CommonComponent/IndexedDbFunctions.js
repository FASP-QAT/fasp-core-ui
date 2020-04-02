// const db1="";
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../Constants.js'
export function getDatabase() {
    var db1;
    var storeOS;
    var openRequest = indexedDB.open('fasp', 1);
    openRequest.onupgradeneeded = function (e) {
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
}