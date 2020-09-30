// const db1="";
import CryptoJS from 'crypto-js'
import { SECRET_KEY, INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../Constants.js'

export function getDatabase() {
    console.log("inside get databases----------------------")
    var db1;
    var storeOS;
    var openRequest = indexedDB.open(INDEXED_DB_NAME,INDEXED_DB_VERSION );
    openRequest.onupgradeneeded = function (e) {
        console.log("indexed db 1----------------------")
        db1 = e.target.result;
        if (!db1.objectStoreNames.contains('programData')) {
            storeOS = db1.createObjectStore('programData', { keyPath: 'id' });
        }
        console.log("indexed db 2----------------------")
        if (!db1.objectStoreNames.contains('downloadedProgramData')) {
            storeOS = db1.createObjectStore('downloadedProgramData', { keyPath: 'id' });
        }
        console.log("indexed db 3----------------------")
        if (!db1.objectStoreNames.contains('whatIfProgramData')) {
            storeOS = db1.createObjectStore('whatIfProgramData', { keyPath: 'id' });
        }
        console.log("indexed db 4----------------------")
        if (!db1.objectStoreNames.contains('program')) {
            storeOS = db1.createObjectStore('program', { keyPath: 'programId', autoIncrement: true });
        }
        console.log("indexed db 5----------------------")
        if (!db1.objectStoreNames.contains('realmCountry')) {
            storeOS = db1.createObjectStore('realmCountry', { keyPath: 'realmCountryId', autoIncrement: true });
        }
        console.log("indexed db 6----------------------")
        if (!db1.objectStoreNames.contains('realm')) {
            storeOS = db1.createObjectStore('realm', { keyPath: 'realmId', autoIncrement: true });
        }
        console.log("indexed db 7----------------------")
        if (!db1.objectStoreNames.contains('lastSyncDate')) {
            storeOS = db1.createObjectStore('lastSyncDate', { keyPath: 'id', autoIncrement: true });
        }
        console.log("indexed db 8----------------------")
        if (!db1.objectStoreNames.contains('language')) {
            storeOS = db1.createObjectStore('language', { keyPath: 'languageId', autoIncrement: true });
        }
        console.log("indexed db 9----------------------")
        if (!db1.objectStoreNames.contains('country')) {
            storeOS = db1.createObjectStore('country', { keyPath: 'countryId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('budget')) {
            storeOS = db1.createObjectStore('budget', { keyPath: 'budgetId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('currency')) {
            storeOS = db1.createObjectStore('currency', { keyPath: 'currencyId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('unit')) {
            storeOS = db1.createObjectStore('unit', { keyPath: 'unitId', autoIncrement: true });
        }
        console.log("indexed db 10----------------------")
        if (!db1.objectStoreNames.contains('organisation')) {
            storeOS = db1.createObjectStore('organisation', { keyPath: 'organisationId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('healthArea')) {
            storeOS = db1.createObjectStore('healthArea', { keyPath: 'healthAreaId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('procurementAgent')) {
            storeOS = db1.createObjectStore('procurementAgent', { keyPath: 'procurementAgentId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('supplier')) {
            storeOS = db1.createObjectStore('supplier', { keyPath: 'supplierId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('tracerCategory')) {
            storeOS = db1.createObjectStore('tracerCategory', { keyPath: 'tracerCategoryId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('region')) {
            storeOS = db1.createObjectStore('region', { keyPath: 'regionId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('fundingSource')) {
            storeOS = db1.createObjectStore('fundingSource', { keyPath: 'fundingSourceId', autoIncrement: true });
        }
        console.log("indexed db 11----------------------")
        if (!db1.objectStoreNames.contains('subFundingSource')) {
            storeOS = db1.createObjectStore('subFundingSource', { keyPath: 'subFundingSourceId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('product')) {
            storeOS = db1.createObjectStore('product', { keyPath: 'productId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('productCategory')) {
            storeOS = db1.createObjectStore('productCategory', { keyPath: 'productCategoryId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('dimension')) {
            storeOS = db1.createObjectStore('dimension', { keyPath: 'dimensionId', autoIncrement: true });
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
        console.log("indexed db 13----------------------")
        if (!db1.objectStoreNames.contains('planningUnit')) {
            storeOS = db1.createObjectStore('planningUnit', { keyPath: 'planningUnitId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('forecastingUnit')) {
            storeOS = db1.createObjectStore('forecastingUnit', { keyPath: 'forecastingUnitId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('procurementUnit')) {
            storeOS = db1.createObjectStore('procurementUnit', { keyPath: 'procurementUnitId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('realmCountryPlanningUnit')) {
            storeOS = db1.createObjectStore('realmCountryPlanningUnit', { keyPath: 'realmCountryPlanningUnitId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('programPlanningUnit')) {
            storeOS = db1.createObjectStore('programPlanningUnit', { keyPath: 'programPlanningUnitId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('procurementAgentPlanningUnit')) {
            storeOS = db1.createObjectStore('procurementAgentPlanningUnit', { keyPath: 'procurementAgentPlanningUnitId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('procurementAgentProcurementUnit')) {
            storeOS = db1.createObjectStore('procurementAgentProcurementUnit', { keyPath: 'procurementAgentProcurementUnitId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('problem')) {
            storeOS = db1.createObjectStore('problem', { keyPath: 'realmProblemId', autoIncrement: true });
        }
        console.log("indexed db 14----------------------")
        if (!db1.objectStoreNames.contains('problemStatus')) {
            storeOS = db1.createObjectStore('problemStatus', { keyPath: 'id', autoIncrement: true });
        }
        console.log("indexed db completed----------------------")
    };
}

export function getEnLabel() {
    var json = {
        "static.procurementagent.realmtext": "Please select realm",
        "static.healtharea.realmtext": "Please select realm",
        "static.datasource.datasourceedit": "Update Data Source",
        "static.program.programwithsameversion": "Program with same version already exists in the local machine you want to overwirte that program with the new data?",
        "static.dashboard.subfundingsource": "Sub Funding Source",
        "static.region.regionedit": "Update Region",
        "static.common.select": "Please Select",
        "static.procurementagent.procurementagentlist": "Procurement Agent List"
    }
    return json;
}