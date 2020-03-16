import * as JsStore from 'jsstore';
import { IDataBase, DATA_TYPE, ITable } from 'jsstore';
import * as SqlWeb from "sqlweb";
import {
    Query
} from "sqlweb";
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../Constants.js'
import moment from "moment";
// This will ensure that we are using only one instance. 
// Otherwise due to multiple instance multiple worker will be created.
JsStore.useSqlWeb(SqlWeb);
export const idbCon = new JsStore.Instance();
export const dbname = 'fasp';

const getDatabase = () => {
    const tblStudent = {
        name: 'programData',
        columns: {
            id: {
                primaryKey: true
            },
            programId: {
                notNull: true,
                dataType: DATA_TYPE.Number
            },
            version: {
                notNull: true,
                dataType: DATA_TYPE.Number
            },
            programName: {
                notNull: true,
                dataType: DATA_TYPE.String
            },
            programData: {
                dataType: DATA_TYPE.String,
                notNull: true
            },
            userId: {
                notNull: true,
                dataType: DATA_TYPE.Number
            }
        }
    };
    const dataBase = {
        name: dbname,
        tables: [tblStudent]
    };
    return dataBase;
};

export const getDbQuery = () => {
    const db = `DEFINE DB fasp;`;
    const tblStudentQry = `DEFINE TABLE programData(
        id PRIMARYKEY,
        programId NUMBER NOTNULL ,
        version NOTNULL NUMBER,
        programName NOTNULL STRING,
        programData STRING NOTNULL,
        userId NUMBER NOTNULL
    );`
    const lastSyncDate = `DEFINE TABLE lastSyncDate(
        id PRIMARYKEY,
        lastSyncDate STRING
    );`
    const currency = `DEFINE TABLE currency (
    currencyId PRIMARYKEY,
    conversionRateToUsd number,
    currencyCode STRING,
    currencySymbol STRING,
    label object
     );`
    const dataSource = `DEFINE TABLE dataSource (
        dataSourceId PRIMARYKEY,
        active STRING,
        dataSourceType object,
        label object
         );`
    const dataSourceType = `DEFINE TABLE dataSourceType (
            dataSourceTypeId PRIMARYKEY,
            active STRING,
            label object
             );`

    const fundingSource = `DEFINE TABLE fundingSource (
                fundingSourceId PRIMARYKEY,
                active STRING,
                label object,
                realmId number
                 );`

    const healthArea = `DEFINE TABLE healthArea (
                    healthAreaId PRIMARYKEY,
                    active STRING,
                    label object,
                    realmId number
                     );`

    const lu = `DEFINE TABLE logisticsUnit (
        logisticsUnitId PRIMARYKEY,
        active STRING,
        heightQty number,
        heightUnit object,
        lengthQty number,
        lengthUnit object,
        manufacturer object,
        planningUnit object,
        qtyInEuroOne number,
        qtyInEuroTwo number,
        qtyOfPlanningUnits number,
        unit object,
        weightQty number,
        weightUnit object,
        widthQty number,
        widthUnit object,
        label object,
        realmId number
         );`

    const manufacturer = `DEFINE TABLE manufacturer (
        manufacturerId PRIMARYKEY,
        active STRING,
        label object,
        realmId number
         );`

    const organisation = `DEFINE TABLE organisation (
        organisationId PRIMARYKEY,
        active STRING,
        label object,
        realmId number
         );`

    const planningUnit = `DEFINE TABLE planningUnit (
        planningUnitId PRIMARYKEY,
        active STRING,
        label object,
        realmId number,
        price number,
        productId number,
        qtyOfForecastingUnits number,
        unit object
         );`

    const product = `DEFINE TABLE product (
        productId PRIMARYKEY,
        active STRING,
        label object,
        realmId number,
        forecastUnit object,
        genericLabel object,
        productCategory object
         );`

    const productCategory = `DEFINE TABLE productCategory (
        productCategoryId PRIMARYKEY,
        active STRING,
        label object
         );`

    const region = `DEFINE TABLE region (
        regionId PRIMARYKEY,
        active STRING,
        label object,
        realmId number,
        capacityCbm number
         );`

    const shipmentStatus = `DEFINE TABLE shipmentStatus (
        shipmentStatusId PRIMARYKEY,
        active STRING,
        label object
         );`

    const shipmentStatusAllowed = `DEFINE TABLE shipmentStatusAllowed (
        shipmentStatusAllowedId PRIMARYKEY,
        nextShipmentStatusId number,
        shipmentStatusId number
         );`

    const unit = `DEFINE TABLE unit (
        unitId PRIMARYKEY,
        active STRING,
        label object,
        unitCode string,
        unitType object
         );`

    const unitType = `DEFINE TABLE unitType (
        unitTypeId PRIMARYKEY,
        label object
         );`

    const subFundingSource = `DEFINE TABLE subFundingSource (
        subFundingSourceId PRIMARYKEY,
        label object,
        active STRING,
        fundingSource object,
        realmId number
         );`

    const country = `DEFINE TABLE country (
        countryId PRIMARYKEY,
        label object,
        active STRING,
        currency object,
        language object
         );`

    const language = `DEFINE TABLE language (
        languageId PRIMARYKEY,
        active STRING,
        languageName string
         );`

    const dbCreatequery = db + tblStudentQry + lastSyncDate + currency + dataSource +
        dataSourceType + fundingSource + healthArea
        + lu
        + manufacturer + organisation + planningUnit
        + product
        + productCategory
        + region
        + shipmentStatus + shipmentStatusAllowed
        + unit
        + unitType
        + subFundingSource + country + language;
    return dbCreatequery;
}

export const initJsStore = () => {
    const qry = getDbQuery();
    idbCon.runSql(qry).then(function () {
    }).catch(function (ex) {
        console.error(ex);
    })
};

export function saveProgram(programJson) {
    var curUser = 1;
    for (var i = 0; i < programJson.length; i++) {
        var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(programJson[i]), SECRET_KEY);
        var programName = CryptoJS.AES.encrypt(JSON.stringify(programJson[i].label), SECRET_KEY);
        const qry = new Query(`insert into programData 
    values ({id:'@id',programId:'@programId',version:'@version',programName:'@programName',programData:'@programData',userId:'@userId'}) return
    `);
        qry.map("@id", programJson[i].programId + "_v" + programJson[i].programVersion + "_uId_" + curUser);
        qry.map("@programId", programJson[i].programId);
        qry.map("@version", programJson[i].programVersion);
        qry.map("@programName", programName.toString());
        qry.map("@programData", encryptedText.toString());
        qry.map("@userId", curUser);
        idbCon.runSql(qry);
    }
    return 1;
}

export function getProgramDataByprogramIds(programIds) {
    const qry = new Query(`select * from programData where id In (${programIds})`);
    return idbCon.runSql(qry);
}

export function getProgramDataList() {
    console.log("in jsstore function program")
    var curUser = 1;
    const qry = new Query(`select * from programData where userId=${curUser}`);
    console.log("after query build");
    var result= idbCon.runSql(qry);
    console.log("result",result+"Moment"+new Date());
    return result;
}

export function importProgram(programJson) {
    var curUser = 1;
    const qry = new Query(`insert into programData 
    values ({id:'@id',programId:'@programId',version:'@version',programName:'@programName',programData:'@programData',userId:'@userId'}) return
    `);
    qry.map("@id", programJson.programId + "_v" + programJson.version + "_uId_" + curUser);
    qry.map("@programId", programJson.programId);
    qry.map("@version", programJson.version);
    qry.map("@programName", programJson.programName);
    qry.map("@programData", programJson.programData);
    qry.map("@userId", curUser);
    idbCon.runSql(qry);
    return 1;
}

export function getLastSyncDateForApplicationMaster() {
    const qry = new Query(`select * from lastSyncDate where id=0`);
    return idbCon.runSql(qry);
}

export function syncCurrency(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].currencyId).concat(",");
        data[i] = {
            currencyId: json[i].currencyId,
            conversionRateToUsd: json[i].conversionRateToUsd,
            label: json[i].label,
            currencyCode: json[i].currencyCode,
            currencySymbol: json[i].currencySymbol
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM currency WHERE currencyId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into currency Values='@values'");
    qry.map("@values", data);
    return idbCon.runSql(qry);
}

export function syncDataSource(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].dataSourceId).concat(",");
        data[i] = {
            dataSourceId: json[i].dataSourceId,
            active: (json[i].active).toString(),
            label: json[i].label,
            dataSourceType: json[i].dataSourceType
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM dataSource WHERE dataSourceId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into dataSource Values='@values'");
    qry.map("@values", data);
    return idbCon.runSql(qry);
}


export function syncDataSourceType(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].dataSourceTypeId).concat(",");
        data[i] = {
            dataSourceTypeId: json[i].dataSourceTypeId,
            active: (json[i].active).toString(),
            label: json[i].label
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM dataSourceType WHERE dataSourceTypeId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into dataSourceType Values='@values'");
    qry.map("@values", data);
    return idbCon.runSql(qry);
}


export function getLastSyncDateForRealm(realmId) {
    const qry = new Query(`select * from lastSyncDate where id=${realmId}`);
    return idbCon.runSql(qry);
}

export function syncFundingSource(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].fundingSourceId).concat(",");
        data[i] = {
            fundingSourceId: json[i].fundingSourceId,
            active: (json[i].active).toString(),
            label: json[i].label,
            realmId: json[i].realmId
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM fundingSource WHERE fundingSourceId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into fundingSource Values='@values'");
    qry.map("@values", data);
    return idbCon.runSql(qry);
}

export function syncHealthArea(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].healthAreaId).concat(",");
        data[i] = {
            healthAreaId: json[i].healthAreaId,
            active: (json[i].active).toString(),
            label: json[i].label,
            realmId: json[i].realmId
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM healthArea WHERE healthAreaId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into healthArea Values='@values'");
    qry.map("@values", data);
    return idbCon.runSql(qry);
}

export function syncLogisticsUnit(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].logisticsUnitId).concat(",");
        data[i] = {
            logisticsUnitId: json[i].logisticsUnitId,
            active: (json[i].active).toString(),
            heightQty: json[i].heightQty,
            heightUnit: json[i].heightUnit,
            lengthQty: json[i].lengthQty,
            lengthUnit: json[i].lengthUnit,
            manufacturer: json[i].manufacturer,
            planningUnit: json[i].planningUnit,
            qtyInEuroOne: json[i].qtyInEuro1,
            qtyInEuroTwo: json[i].qtyInEuro2,
            qtyOfPlanningUnits: json[i].qtyOfPlanningUnits,
            unit: json[i].unit,
            weightQty: json[i].weightQty,
            weightUnit: json[i].weightUnit,
            widthQty: json[i].widthQty,
            widthUnit: json[i].widthUnit,
            label: json[i].label,
            realmId: json[i].realmId
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM logisticsUnit WHERE logisticsUnitId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into logisticsUnit Values='@values'");
    qry.map("@values", data);
    return idbCon.runSql(qry);
}

export function syncManufacturer(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].manufacturerId).concat(",");
        data[i] = {
            manufacturerId: json[i].manufacturerId,
            active: (json[i].active).toString(),
            label: json[i].label,
            realmId: json[i].realmId
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM manufacturer WHERE manufacturerId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into manufacturer Values='@values'");
    qry.map("@values", data);
    return idbCon.runSql(qry);
}

export function syncOrganisation(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].organisationId).concat(",");
        data[i] = {
            organisationId: json[i].organisationId,
            active: (json[i].active).toString(),
            label: json[i].label,
            realmId: json[i].realmId
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        console.log("delete in str org", deleteInStr);
        var qry1 = new SqlWeb.Query(`DELETE FROM organisation WHERE organisationId IN (${deleteInStr})`)
        console.log("qry1", qry1);
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into organisation Values='@values'");
    console.log("Organisation qry", qry)
    qry.map("@values", data);
    return idbCon.runSql(qry);
}

export function syncPlanningUnit(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].planningUnitId).concat(",");
        data[i] = {
            planningUnitId: json[i].planningUnitId,
            active: (json[i].active).toString(),
            label: json[i].label,
            realmId: json[i].realmId,
            productId: json[i].productId,
            price: json[i].price,
            qtyOfForecastingUnits: json[i].qtyOfForecastingUnits,
            unit: json[i].unit
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM planningUnit WHERE planningUnitId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into planningUnit Values='@values'");
    qry.map("@values", data);
    console.log("before planning unit")
    var result = idbCon.runSql(qry);
    console.log("result", result);
    return result;
}

export function syncProduct(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].productId).concat(",");
        data[i] = {
            productId: json[i].productId,
            active: (json[i].active).toString(),
            label: json[i].label,
            realmId: json[i].realmId,
            forecastUnit: json[i].forecastUnit,
            genericLabel: json[i].genericLabel,
            productCategory: json[i].productCategory
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM product WHERE productId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into product Values='@values'");
    qry.map("@values", data);
    console.log("before product")
    return idbCon.runSql(qry);
}


export function syncProductCategory(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].productCategoryId).concat(",");
        data[i] = {
            productCategoryId: json[i].productCategoryId,
            active: (json[i].active).toString(),
            label: json[i].label
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM productCategory WHERE productCategoryId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into productCategory Values='@values'");
    qry.map("@values", data);
    console.log("before pc")
    return idbCon.runSql(qry);
}


export function syncRegion(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].regionId).concat(",");
        data[i] = {
            regionId: json[i].regionId,
            active: (json[i].active).toString(),
            label: json[i].label,
            realmId: json[i].realmId,
            capacityCbm: json[i].capacityCbm
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM region WHERE regionId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into region Values='@values'");
    qry.map("@values", data);
    console.log("before region")
    return idbCon.runSql(qry);
}

export function syncShipmentStatus(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].shipmentStatusId).concat(",");
        data[i] = {
            shipmentStatusId: json[i].shipmentStatusId,
            active: (json[i].active).toString(),
            label: json[i].label
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM shipmentStatus WHERE shipmentStatusId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into shipmentStatus Values='@values'");
    qry.map("@values", data);
    console.log("before ss")
    return idbCon.runSql(qry);
}

export function syncShipmentStatusAllowed(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].shipmentStatusAllowedId).concat(",");
        data[i] = {
            nextShipmentStatusId: json[i].nextShipmentStatusId,
            shipmentStatusAllowedId: json[i].shipmentStatusAllowedId,
            shipmentStatusId: json[i].shipmentStatusId
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM shipmentStatusAllowed WHERE shipmentStatusAllowedId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into shipmentStatusAllowed Values='@values'");
    qry.map("@values", data);
    return idbCon.runSql(qry);
}

export function syncUnit(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].unitId).concat(",");
        data[i] = {
            unitId: json[i].unitId,
            active: (json[i].active).toString(),
            label: json[i].label,
            unitCode: json[i].unitCode,
            unitType: json[i].unitType
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM unit WHERE unitId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into unit Values='@values'");
    qry.map("@values", data);
    return idbCon.runSql(qry);
}


export function syncUnitType(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].unitTypeId).concat(",");
        data[i] = {
            unitTypeId: json[i].unitTypeId,
            label: json[i].label
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM unitType WHERE unitTypeId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into unitType Values='@values'");
    qry.map("@values", data);
    return idbCon.runSql(qry);
}


export function syncSubFundingSource(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].subFundingSourceId).concat(",");
        data[i] = {
            subFundingSourceId: json[i].subFundingSourceId,
            label: json[i].label,
            active: (json[i].active).toString(),
            fundingSource: json[i].fundingSource,
            realmId: json[i].realmId
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM subFundingSource WHERE subFundingSourceId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into subFundingSource Values='@values'");
    qry.map("@values", data);
    return idbCon.runSql(qry);
}

export function syncCountry(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].countryId).concat(",");
        data[i] = {
            countryId: json[i].countryId,
            label: json[i].label,
            active: (json[i].active).toString(),
            currency: json[i].currency,
            language: json[i].language
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM country WHERE countryId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into country Values='@values'");
    qry.map("@values", data);
    return idbCon.runSql(qry);
}

export function syncLanguage(json) {
    var data = []
    var deleteInStr = "";
    for (var i = 0; i < json.length; i++) {
        deleteInStr = deleteInStr.concat(json[i].languageId).concat(",");
        data[i] = {
            languageId: json[i].languageId,
            languageName: json[i].languageName,
            active: (json[i].active).toString()
        }
    }
    if (json.length > 0) {
        var deleteInStr = (deleteInStr.substring(0, deleteInStr.length - 1)).toString();
        var qry1 = new SqlWeb.Query(`DELETE FROM language WHERE languageId IN (${deleteInStr})`)
        idbCon.runSql(qry1);
    }
    var qry = new SqlWeb.Query("insert into language Values='@values'");
    qry.map("@values", data);
    return idbCon.runSql(qry);
}

export function updateLastSyncDate(lastSyncDate, realmId) {
    var qry = new SqlWeb.Query(`DELETE FROM lastSyncDate WHERE id IN (0,${realmId})`);
    idbCon.runSql(qry);
    var data = []
    data[0] = {
        id: 0,
        lastSyncDate: lastSyncDate
    }
    data[1] = {
        id: realmId,
        lastSyncDate: lastSyncDate
    }
    var qry1 = new SqlWeb.Query("insert into lastSyncDate Values='@values'");
    qry1.map("@values", data);
    return idbCon.runSql(qry1);
}

export function getProductCategoryList() {
    const qry = new Query(`select * from productCategory where active='true'`);
    // console.log
    var result = idbCon.runSql(qry);
    console.log("Result=======", result);
    return result;
}

export function getProductListByProductCategory(categoryId) {
    const qry = new Query(`select * from product where active='true'`);
    console.log(qry)
    var result = idbCon.runSql(qry);
    console.log("Result=======", result);
    return result;
}