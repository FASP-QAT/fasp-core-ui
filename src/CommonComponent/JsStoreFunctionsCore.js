// import * as JsStore from 'jsstore';
// import { IDataBase, DATA_TYPE, ITable } from 'jsstore';
// import CryptoJS from 'crypto-js'
// import { SECRET_KEY } from '../Constants.js'
// // This will ensure that we are using only one instance. 
// // Otherwise due to multiple instance multiple worker will be created.
// export const idbCon = new JsStore.Connection();
// export const dbname = 'fasp';

// function getDbSchema() {
//     var tblDataSource = {
//         name: 'dataSource',
//         columns: {
//             // Here "Id" is name of column 
//             dataSourceId: { primaryKey: true },
//             active: { notNull: true, dataType: "boolean" },
//             dataSourceType: { notNull: true, dataType: "object" },
//             label: { notNull: true, dataType: "object" }
//         }
//     };
//     var tblCurrency = {
//         name: 'currency',
//         columns: {
//             // Here "Id" is name of column 
//             currencyId: { primaryKey: true, dataType: "number" },
//             conversionRateToUsd: { notNull: true, dataType: "number" },
//             currencyCode: { notNull: true, dataType: "string" },
//             currencySymbol: { notNull: true, dataType: "string" },
//             label: { notNull: true, dataType: "object" }
//         }
//     };
//     var db = {
//         name: dbname,
//         tables: [tblDataSource, tblCurrency]
//     }
//     return db;
// }

// export function syncDataSource(json) {
//     var database = getDbSchema();
//     var isDbCreated = idbCon.initDb(database);
//     for (var i = 0; i < json.length; i++) {
//         console.log("in loop")
//         var newData = {
//             dataSourceId: json[i].dataSourceId,
//             active: json[i].active,
//             dataSourceType: json[i].dataSourceType,
//             label: json[i].label
//         }
//         console.log("datasource",newData)
//         idbCon.insert({
//             into: "dataSource",
//             upsert: true,
//             values: [newData], //you can insert multiple values at a time
//         })
//     }
// }

// export function syncCurrency(json) {
//     var database = getDbSchema();
//     var isDbCreated = idbCon.initDb(database);
//     for (var i = 0; i < json.length; i++) {
//         console.log("in loop")
//         var newData = {
//             currencyId: json[i].currencyId,
//             conversionRateToUsd: json[i].conversionRateToUsd,
//             currencyCode: json[i].currencyCode,
//             currencySymbol: json[i].currencySymbol,
//             label: json[i].label
//         }
//         idbCon.insert({
//             into: "currency",
//             upsert: true,
//             values: [newData], //you can insert multiple values at a time
//         })
//     }
// }