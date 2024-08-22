import { INDEXED_DB_NAME, INDEXED_DB_VERSION } from '../Constants.js';
/**
 * This function is used to check if there are any upgrade needed to indexed db
 */
export function getDatabase() {
    var db1;
    var storeOS;
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onupgradeneeded = function (e) {
        db1 = e.target.result;
        if (!db1.objectStoreNames.contains('programData')) {
            storeOS = db1.createObjectStore('programData', { keyPath: 'id' });
        }
        if (!db1.objectStoreNames.contains('downloadedProgramData')) {
            storeOS = db1.createObjectStore('downloadedProgramData', { keyPath: 'id' });
        }
        if (!db1.objectStoreNames.contains('whatIfProgramData')) {
            storeOS = db1.createObjectStore('whatIfProgramData', { keyPath: 'id' });
        }
        if (!db1.objectStoreNames.contains('program')) {
            storeOS = db1.createObjectStore('program', { keyPath: 'programId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('realmCountry')) {
            storeOS = db1.createObjectStore('realmCountry', { keyPath: 'realmCountryId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('realm')) {
            storeOS = db1.createObjectStore('realm', { keyPath: 'realmId', autoIncrement: true });
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
        if (!db1.objectStoreNames.contains('budget')) {
            storeOS = db1.createObjectStore('budget', { keyPath: 'budgetId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('currency')) {
            storeOS = db1.createObjectStore('currency', { keyPath: 'currencyId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('unit')) {
            storeOS = db1.createObjectStore('unit', { keyPath: 'unitId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('organisation')) {
            storeOS = db1.createObjectStore('organisation', { keyPath: 'organisationId', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('organisationType')) {
            storeOS = db1.createObjectStore('organisationType', { keyPath: 'organisationTypeId', autoIncrement: true });
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
        if (!db1.objectStoreNames.contains('problemStatus')) {
            storeOS = db1.createObjectStore('problemStatus', { keyPath: 'id', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('problemCriticality')) {
            storeOS = db1.createObjectStore('problemCriticality', { keyPath: 'id', autoIncrement: true });
        }
        if (!db1.objectStoreNames.contains('problemCategory')) {
            storeOS = db1.createObjectStore('problemCategory', { keyPath: 'id', autoIncrement: true });
        }
        if(!db1.objectStoreNames.contains('programQPLDetails')){
            storeOS = db1.createObjectStore('programQPLDetails', { keyPath: 'id', autoIncrement: true });
        }
        if(!db1.objectStoreNames.contains('usageType')){
            storeOS = db1.createObjectStore('usageType', { keyPath: 'id', autoIncrement: true });
        }
        if(!db1.objectStoreNames.contains('nodeType')){
            storeOS = db1.createObjectStore('nodeType', { keyPath: 'id', autoIncrement: true });
        }
        if(!db1.objectStoreNames.contains('forecastMethodType')){
            storeOS = db1.createObjectStore('forecastMethodType', { keyPath: 'id', autoIncrement: true });
        }
        if(!db1.objectStoreNames.contains('usagePeriod')){
            storeOS = db1.createObjectStore('usagePeriod', { keyPath: 'usagePeriodId', autoIncrement: true });
        }
        if(!db1.objectStoreNames.contains('modelingType')){
            storeOS = db1.createObjectStore('modelingType', { keyPath: 'modelingTypeId', autoIncrement: true });
        }
        if(!db1.objectStoreNames.contains('forecastMethod')){
            storeOS = db1.createObjectStore('forecastMethod', { keyPath: 'forecastMethodId', autoIncrement: true });
        }
        if(!db1.objectStoreNames.contains('datasetData')){
            storeOS = db1.createObjectStore('datasetData', { keyPath: 'id'});
        }
        if(!db1.objectStoreNames.contains('downloadedDatasetData')){
            storeOS = db1.createObjectStore('downloadedDatasetData', { keyPath: 'id'});
        }
        if(!db1.objectStoreNames.contains('datasetDetails')){
            storeOS = db1.createObjectStore('datasetDetails', { keyPath: 'id'});
        }
        if(!db1.objectStoreNames.contains('usageTemplate')){
            storeOS = db1.createObjectStore('usageTemplate', { keyPath: 'usageTemplateId'});
        }
        if(!db1.objectStoreNames.contains('treeTemplate')){
            storeOS = db1.createObjectStore('treeTemplate', { keyPath: 'treeTemplateId'});
        }
        if(!db1.objectStoreNames.contains('versionType')){
            storeOS = db1.createObjectStore('versionType', { keyPath: 'id'});
        }
        if(!db1.objectStoreNames.contains('versionStatus')){
            storeOS = db1.createObjectStore('versionStatus', { keyPath: 'id'});
        }
        if(!db1.objectStoreNames.contains('equivalencyUnit')){
            storeOS = db1.createObjectStore('equivalencyUnit', { keyPath: 'equivalencyUnitMappingId', autoIncrement: true});
        }
        if(!db1.objectStoreNames.contains('extrapolationMethod')){
            storeOS = db1.createObjectStore('extrapolationMethod', { keyPath: 'id', autoIncrement: true});
        }
        if(!db1.objectStoreNames.contains('datasetDataServer')){
            storeOS = db1.createObjectStore('datasetDataServer', { keyPath: 'id'});
        }
        if (!db1.objectStoreNames.contains('fundingSourceType')) {
            storeOS = db1.createObjectStore('fundingSourceType', { keyPath: 'fundingSourceTypeId', autoIncrement: true });
        }
        // console.log('Object stores:', db1.objectStoreNames);
    };    
}