import * as JsStore from 'jsstore';
import { IDataBase, DATA_TYPE, ITable } from 'jsstore';
import * as SqlWeb from "sqlweb";
import {
    Query
} from "sqlweb";
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../Constants.js'
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
    )`
    const dbCreatequery = db + tblStudentQry;
    return dbCreatequery;
}

export const initJsStore = () => {
    const qry = getDbQuery();
    console.log("this", this);
    idbCon.runSql(qry).then(function () {
        console.log('db initiated');
    }).catch(function (ex) {
        console.error(ex);
    })
};

export function saveProgram(programJson) {
    for (var i = 0; i < programJson.length; i++) {
        var encryptedText = CryptoJS.AES.encrypt(JSON.stringify(programJson[i]), SECRET_KEY);
        var programName = CryptoJS.AES.encrypt(JSON.stringify(programJson[i].label), SECRET_KEY);
        const qry = new Query(`insert into programData 
    values ({id:'@id',programId:'@programId',version:'@version',programName:'@programName',programData:'@programData',userId:'@userId'}) return
    `);
        qry.map("@id", programJson[i].programId + "_v" + programJson[i].programVersion + "_uId_" + 1);
        qry.map("@programId", programJson[i].programId);
        qry.map("@version", programJson[i].programVersion);
        qry.map("@programName", programName.toString());
        qry.map("@programData", encryptedText.toString());
        qry.map("@userId", 1);
        idbCon.runSql(qry);
    }
    return 1;
}

export function checkIfProgramExists(programIds) {
    const qry = new Query(`select * from programData where id In (${programIds})`);
    return idbCon.runSql(qry);
}