import axios from 'axios';
import CryptoJS from 'crypto-js';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';
import { INDEXED_DB_NAME, INDEXED_DB_VERSION, MONTHS_IN_PAST_FOR_SUPPLY_PLAN, SECRET_KEY, SPV_REPORT_DATEPICKER_START_MONTH } from '../../Constants.js';
import i18n from '../../i18n';
let myDt;
class AuthenticationService {
    isUserLoggedIn(emailId) {
        var decryptedPassword = "";
        for (var i = 0; i < localStorage.length; i++) {
            var value = localStorage.getItem(localStorage.key(i));
            if (localStorage.key(i).includes("user-")) {
                let user = JSON.parse(CryptoJS.AES.decrypt(value.toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                let decryptedEmailId = user.emailId;
                if (decryptedEmailId.toUpperCase() == emailId.toUpperCase()) {
                    localStorage.setItem("tempUser", user.userId);
                    decryptedPassword = user.password;
                }
            }
        }
        return decryptedPassword;
    }
    syncExpiresOn() {
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
        let syncExpiresOn = moment(decryptedUser.syncExpiresOn);
        var curDate = moment(new Date());
        const diff = curDate.diff(syncExpiresOn, 'days');
        if (diff < 30) {
            return false;
        }
        return true;
    }
    getLoggedInUsername() {
        if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != '') {
            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
            let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
            return decryptedUser.username;
        }
        return "";
    }
    getLoggedInUserRole() {
        if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != '') {
            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
            let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
            let roleList = "";
            for (let i = 0; i <= decryptedUser.roleList.length; i++) {
                let role = decryptedUser.roleList[i];
            }
            return decryptedUser.roleList;
        }
    }
    displayDashboardBasedOnRole() {
        if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != '') {
            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
            let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
            let roleList = [];
            for (let i = 0; i <= decryptedUser.roleList.length; i++) {
                let role = decryptedUser.roleList[i];
                if (role != null && role != "") {
                    roleList.push(role.roleId);
                }
            }
            if (roleList.includes("ROLE_APPLICATION_ADMIN"))
                return 1;
            if (roleList.includes("ROLE_REALM_ADMIN"))
                return 2;
            if (roleList.includes("ROLE_PROGRAM_ADMIN"))
                return 3;
            return 4;
        }
    }
    getLoggedInUserId() {
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        return decryptedCurUser;
    }
    getRealmId() {
        try{
            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
            let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
            return decryptedUser.realm.realmId;
        }catch{
            return "";
        }
    }
    getLoggedInUserRealm() {
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
        return decryptedUser.realm;
    }
    checkTypeOfSession(url) {
        let sessionType = localStorage.getItem('sessionType');
        let typeOfSession = localStorage.getItem('typeOfSession');
        let checkSite = isSiteOnline();
        if (checkSite && sessionType === 'Offline' && typeOfSession === 'Online') {
            localStorage.setItem("sessionType", 'Online')
        } else if (!checkSite && sessionType === 'Online') {
            localStorage.setItem("sessionType", 'Offline')
        }
        var urlarr = ["/consumptionDetails", "/inventory/addInventory", "/inventory/addInventory/:programId/:versionId/:planningUnitId", "/shipment/shipmentDetails", "/shipment/shipmentDetails/:message", "/shipment/shipmentDetails/:programId/:versionId/:planningUnitId", "/program/importProgram", "/program/exportProgram", "/program/deleteLocalProgram", "/supplyPlan", "/supplyPlanFormulas", "/supplyPlan/:programId/:versionId/:planningUnitId", "/report/whatIf", "/report/stockStatus", "/report/problemList","/report/problemList/:programId/:calculate/:color/:message","/report/problemList/:color/:message","/report/problemList/1/:programId/:calculate", "/report/productCatalog", "/report/stockStatusOverTime", "/report/stockStatusMatrix", "/report/stockStatusAcrossPlanningUnits", "/report/consumption", "/report/forecastOverTheTime", "/report/consumptionForecastErrorSupplyPlan", "/report/shipmentSummery", "/report/procurementAgentExport", "/report/annualShipmentCost", "/report/budgets", "/report/supplierLeadTimes", "/report/expiredInventory", "/report/costOfInventory", "/report/inventoryTurns", "/report/stockAdjustment", "/report/warehouseCapacity", "/supplyPlan/:programId/:planningUnitId/:expiryNo/:expiryDate", "/ApplicationDashboard/:id", "/ApplicationDashboard", "/ApplicationDashboard/:color/:message", "/ApplicationDashboard/:id/:color/:message", "/planningUnitSetting/listPlanningUnitSetting", "/dataset/versionSettings", "/dataset/importDataset", "/dataset/exportDataset", "/dataentry/consumptionDataEntryAndAdjustment", "/dataentry/consumptionDataEntryAndAdjustment/:color/:message", "/dataentry/consumptionDataEntryAndAdjustment/:planningUnitId", "/extrapolation/extrapolateData","/extrapolation/extrapolateData/:planningUnitId", "/dataset/listTree", "/validation/modelingValidation", "/validation/productValidation", "/report/compareAndSelectScenario", "/report/compareAndSelectScenario/:programId/:planningUnitId/:regionId", "/forecastReport/forecastOutput", "/forecastReport/forecastOutput/:programId/:versionId", "/forecastReport/forecastSummary", "/forecastReport/forecastSummary/:programId/:versionId", "/report/compareVersion", "/dataSet/buildTree/tree/:treeId/:programId", "/dataSet/buildTree/tree/:treeId/:programId/:scenarioId", "/dataSet/buildTree/", "/dataSet/buildTree/template/:templateId"];
        if ((typeOfSession === 'Online' && checkSite) || (typeOfSession === 'Offline' && !checkSite) || (typeOfSession === 'Online' && !checkSite && urlarr.includes(url)) || (typeOfSession === 'Offline' && urlarr.includes(url))) {
            return true;
        } else {
            return false;
        }
    }
    checkIfDifferentUserIsLoggedIn(newUsername) {
        let usernameStored = localStorage.getItem('username');
        if (usernameStored !== null && usernameStored !== "") {
            var originalText;
            try{
                var usernameDecrypted = CryptoJS.AES.decrypt(usernameStored, `${SECRET_KEY}`)
                originalText = usernameDecrypted.toString(CryptoJS.enc.Utf8);
            }catch{
                originalText = ""
            }
            if (originalText !== newUsername) {
                if (window.confirm("Are you sure you want to overrride already logged in user's details?")) {
                    return true;
                } else {
                    return false;
                }
            }
            return false;
        } else {
            return true;
        }
    }
    checkIfTokenExpired() {
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedToken = CryptoJS.AES.decrypt(localStorage.getItem('token-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8)
        var decoded = jwt_decode(decryptedToken);
        let tokenExpiryTime = new Date(decoded.exp * 1000);
        var curDate = new Date();
        if (new Date(decoded.exp * 1000) > new Date()) {
            return true;
        } else {
            return false;
        }
    }
    updateUserLanguage(languageCode) {
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem('user-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8))
        decryptedUser.language.languageCode = languageCode;
        localStorage.removeItem('user-' + decryptedCurUser);
        localStorage.setItem('user-' + decryptedCurUser, CryptoJS.AES.encrypt(JSON.stringify(decryptedUser), `${SECRET_KEY}`));
    }
    setupAxiosInterceptors() {
        if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != "") {
            var tokenSetTime = localStorage.getItem("tokenSetTime") ? localStorage.getItem("tokenSetTime") : new Date();
            var temp_time_token = tokenSetTime == 0 ? 0 : (new Date().getTime() - new Date(tokenSetTime).getTime());            
            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
            let decryptedToken;
            if(temp_time_token > 21000000){
                axios.get(`${API_URL}/refresh`, {}).then(response => {
                    var decoded = jwt_decode(response.data.token.toString().replaceAll("Bearer ",""));
                    localStorage.setItem('token-' + decoded.userId, CryptoJS.AES.encrypt((response.data.token.toString().replaceAll("Bearer ","")).toString(), `${SECRET_KEY}`));
                    localStorage.setItem("tokenSetTime", new Date());
                    decryptedToken = CryptoJS.AES.decrypt(response.data.token.toString().replaceAll("Bearer ",""), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                }).catch(error => {
                    console.log("Error ",error);
                })
            }else{
                decryptedToken = CryptoJS.AES.decrypt(localStorage.getItem('token-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
            }
            let basicAuthHeader = 'Bearer ' + decryptedToken
            axios.defaults.headers.common['Authorization'] = basicAuthHeader;
        }
    }
    getLoggedInUserRoleBusinessFunction() {
        if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != '') {
            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
            let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
            let businessFunctions = decryptedUser.businessFunctionList;
            return businessFunctions;
        }
        return "";
    }
    getLoggedInUserRoleBusinessFunctionArray() {
        if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != '') {
            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
            try {
                let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                let businessFunctionList = decryptedUser.businessFunctionList;
                var bfunction = [];
                for (let i = 0; i < businessFunctionList.length; i++) {
                    bfunction.push(businessFunctionList[i]);
                }
                return bfunction;
            } catch (err) {
                localStorage.setItem('curUser', '')
                return [];
            }
        } else {
            return [];
        }
    }
    authenticatedRoute(route, url) {
        if (url == "") {
            localStorage.setItem("isOfflinePage", 0);
            var urlarr = ["/consumptionDetails", "/inventory/addInventory", "/inventory/addInventory/:programId/:versionId/:planningUnitId", "/shipment/shipmentDetails", "/shipment/shipmentDetails/:message", "/shipment/shipmentDetails/:programId/:versionId/:planningUnitId", "/program/importProgram", "/program/exportProgram", "/program/deleteLocalProgram", "/supplyPlan", "/supplyPlanFormulas", "/supplyPlan/:programId/:versionId/:planningUnitId", "/report/whatIf", "/report/stockStatus", "/report/problemList","/report/problemList/:programId/:calculate/:color/:message","/report/problemList/:color/:message","/report/problemList/1/:programId/:calculate", "/report/productCatalog", "/report/stockStatusOverTime", "/report/stockStatusMatrix", "/report/stockStatusAcrossPlanningUnits", "/report/consumption", "/report/forecastOverTheTime", "/report/consumptionForecastErrorSupplyPlan", "/report/shipmentSummery", "/report/procurementAgentExport", "/report/annualShipmentCost", "/report/budgets", "/report/supplierLeadTimes", "/report/expiredInventory", "/report/costOfInventory", "/report/inventoryTurns", "/report/stockAdjustment", "/report/warehouseCapacity", "/supplyPlan/:programId/:planningUnitId/:expiryNo/:expiryDate"];
            if (urlarr.includes(route)) {
                localStorage.setItem("isOfflinePage", 1);
            }
            if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != '') {
                let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
                if (localStorage.getItem("sessionType") === 'Online' && (localStorage.getItem('token-' + decryptedCurUser) == null || localStorage.getItem('token-' + decryptedCurUser) == "")) {
                    return true;
                }
                var bfunction = this.getLoggedInUserRoleBusinessFunctionArray();
                switch (route) {
                    case "/user/addUser":
                        if (bfunction.includes("ROLE_BF_ADD_USER")) {
                            return true;
                        }
                        break;
                    case "/user/editUser/:userId":
                        if (bfunction.includes("ROLE_BF_EDIT_USER")) {
                            return true;
                        }
                        break;
                    case "/user/accessControl/:userId":
                        if (bfunction.includes("ROLE_BF_MAP_ACCESS_CONTROL")) {
                            return true;
                        }
                        break;
                    case "/user/listUser":
                    case "/user/listUser/:message":
                    case "/user/listUser/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_USER")) {
                            return true;
                        }
                        break;
                    case "/role/addRole":
                        if (bfunction.includes("ROLE_BF_ADD_ROLE")) {
                            return true;
                        }
                        break;
                    case "/role/editRole/:roleId":
                        if (bfunction.includes("ROLE_BF_EDIT_ROLE")) {
                            return true;
                        }
                        break;
                    case "/role/listRole":
                    case "/role/listRole/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_ROLE")) {
                            return true;
                        }
                        break;
                    case "/language/addLanguage":
                        if (bfunction.includes("ROLE_BF_ADD_LANGUAGE")) {
                            return true;
                        }
                        break;
                    case "/language/editLanguage/:languageId":
                        if (bfunction.includes("ROLE_BF_EDIT_LANGUAGE")) {
                            return true;
                        }
                        break;
                    case "/language/listLanguage":
                    case "/language/listLanguage/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_LANGUAGE")) {
                            return true;
                        }
                        break;
                    case "/country/addCountry":
                        if (bfunction.includes("ROLE_BF_ADD_COUNTRY")) {
                            return true;
                        }
                        break;
                    case "/country/editCountry/:countryId":
                        if (bfunction.includes("ROLE_BF_EDIT_COUNTRY")) {
                            return true;
                        }
                        break;
                    case "/country/listCountry":
                    case "/country/listCountry/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_COUNTRY")) {
                            return true;
                        }
                        break;
                    case "/currency/addCurrency":
                        if (bfunction.includes("ROLE_BF_ADD_CURRENCY")) {
                            return true;
                        }
                        break;
                    case "/currency/editCurrency/:currencyId":
                        if (bfunction.includes("ROLE_BF_EDIT_CURRENCY")) {
                            return true;
                        }
                        break;
                    case "/currency/listCurrency":
                    case "/currency/listCurrency/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_CURRENCY")) {
                            return true;
                        }
                        break;
                    case "/diamension/AddDiamension":
                        if (bfunction.includes("ROLE_BF_ADD_DIMENSION")) {
                            return true;
                        }
                        break;
                    case "/diamension/editDiamension/:dimensionId":
                        if (bfunction.includes("ROLE_BF_EDIT_DIMENSION")) {
                            return true;
                        }
                        break;
                    case "/dimension/listDimension":
                    case "/dimension/listDimension/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_DIMENSION")) {
                            return true;
                        }
                        break;
                    case "/unit/addUnit":
                        if (bfunction.includes("ROLE_BF_ADD_UNIT")) {
                            return true;
                        }
                        break;
                    case "/unit/editUnit/:unitId":
                        if (bfunction.includes("ROLE_BF_EDIT_UNIT")) {
                            return true;
                        }
                        break;
                    case "/unit/listUnit":
                    case "/unit/listUnit/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_UNIT")) {
                            return true;
                        }
                        break;
                    case "/integration/AddIntegration":
                        if (bfunction.includes("ROLE_BF_ADD_INTEGRATION")) {
                            return true;
                        }
                        break;
                    case "/integration/editIntegration/:integrationId":
                        if (bfunction.includes("ROLE_BF_EDIT_INTEGRATION")) {
                            return true;
                        }
                        break;
                    case "/integration/listIntegration":
                    case "/integration/listIntegration/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_INTEGRATION")) {
                            return true;
                        }
                        break;
                    case "/program/addManualIntegration":
                        if (bfunction.includes("ROLE_BF_MANUAL_INTEGRATION")) {
                            return true;
                        }
                        break;
                    case "/realm/addrealm":
                        if (bfunction.includes("ROLE_BF_CREATE_REALM")) {
                            return true;
                        }
                        break;
                    case "/realm/updateRealm/:realmId":
                        if (bfunction.includes("ROLE_BF_EDIT_REALM")) {
                            return true;
                        }
                        break;
                    case "/realm/listRealm":
                    case "/realm/listRealm/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_REALM")) {
                            return true;
                        }
                        break;
                    case "/realmCountry/listRealmCountry":
                    case "/realmCountry/listRealmCountry/:message":
                    case "/realmCountry/listRealmCountry/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_REALM_COUNTRY")) {
                            return true;
                        }
                        break;
                    case "/realmCountry/listRealmCountryPlanningUnit":
                    case "/realmCountry/listRealmCountryPlanningUnit/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_ALTERNATE_REPORTING_UNIT")) {
                            return true;
                        }
                        break;
                    case "/dataSourceType/addDataSourceType":
                        if (bfunction.includes("ROLE_BF_ADD_DATA_SOURCE_TYPE")) {
                            return true;
                        }
                        break;
                    case "/dataSourceType/editDataSourceType/:dataSourceTypeId":
                        if (bfunction.includes("ROLE_BF_EDIT_DATA_SOURCE_TYPE")) {
                            return true;
                        }
                        break;
                    case "/dataSourceType/listDataSourceType":
                    case "/dataSourceType/listDataSourceType/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_DATA_SOURCE_TYPE")) {
                            return true;
                        }
                        break;
                    case "/dataSource/addDataSource":
                        if (bfunction.includes("ROLE_BF_ADD_DATA_SOURCE")) {
                            return true;
                        }
                        break;
                    case "/dataSource/editDataSource/:dataSourceId":
                        if (bfunction.includes("ROLE_BF_EDIT_DATA_SOURCE")) {
                            return true;
                        }
                        break;
                    case "/dataSource/listDataSource":
                    case "/dataSource/listDataSource/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_DATA_SOURCE")) {
                            return true;
                        }
                        break;
                    case "/fundingSource/addFundingSource":
                        if (bfunction.includes("ROLE_BF_ADD_FUNDING_SOURCE")) {
                            return true;
                        }
                        break;
                    case "/fundingSource/editFundingSource/:fundingSourceId":
                        if (bfunction.includes("ROLE_BF_EDIT_FUNDING_SOURCE")) {
                            return true;
                        }
                        break;
                    case "/fundingSource/listFundingSource":
                    case "/fundingSource/listFundingSource/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_FUNDING_SOURCE")) {
                            return true;
                        }
                        break;
                    case "/procurementAgent/addProcurementAgent":
                        if (bfunction.includes("ROLE_BF_ADD_PROCUREMENT_AGENT")) {
                            return true;
                        }
                        break;
                    case "/procurementAgent/editProcurementAgent/:procurementAgentId":
                        if (bfunction.includes("ROLE_BF_EDIT_PROCUREMENT_AGENT")) {
                            return true;
                        }
                        break;
                    case "/procurementAgent/listProcurementAgent":
                    case "/procurementAgent/listProcurementAgent/:message":
                    case "/procurementAgent/listProcurementAgent/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_PROCUREMENT_AGENT")) {
                            return true;
                        }
                        break;
                    case "/procurementAgentType/addProcurementAgentType":
                        if (bfunction.includes("ROLE_BF_ADD_PROCUREMENT_AGENT")) {
                            return true;
                        }
                        break;
                    case "/procurementAgentType/editProcurementAgentType/:procurementAgentTypeId":
                        if (bfunction.includes("ROLE_BF_EDIT_PROCUREMENT_AGENT")) {
                            return true;
                        }
                        break;
                    case "/procurementAgentType/listProcurementAgentType":
                    case "/procurementAgentType/listProcurementAgentType/:message":
                    case "/procurementAgentType/listProcurementAgentType/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_PROCUREMENT_AGENT")) {
                            return true;
                        }
                        break;
                    case "/budget/addBudget":
                        if (bfunction.includes("ROLE_BF_ADD_BUDGET")) {
                            return true;
                        }
                        break;
                    case "/budget/editBudget/:budgetId":
                        if (bfunction.includes("ROLE_BF_EDIT_BUDGET")) {
                            return true;
                        }
                        break;
                    case "/budget/listBudget":
                    case "/budget/listBudget/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_BUDGET")) {
                            return true;
                        }
                        break;
                    case "/supplier/addSupplier":
                        if (bfunction.includes("ROLE_BF_ADD_SUPPLIER")) {
                            return true;
                        }
                        break;
                    case "/supplier/editSupplier/:supplierId":
                        if (bfunction.includes("ROLE_BF_EDIT_SUPPLIER")) {
                            return true;
                        }
                        break;
                    case "/supplier/listSupplier":
                    case "/supplier/listSupplier/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_SUPPLIER")) {
                            return true;
                        }
                        break;
                    case "/region/listRegion":
                    case "/region/listRegion/:message":
                        if (bfunction.includes("ROLE_BF_REGION")) {
                            return true;
                        }
                        break;
                    case "/healthArea/addHealthArea":
                        if (bfunction.includes("ROLE_BF_ADD_HEALTH_AREA")) {
                            return true;
                        }
                        break;
                    case "/healthArea/editHealthArea/:healthAreaId":
                        if (bfunction.includes("ROLE_BF_EDIT_HEALTH_AREA")) {
                            return true;
                        }
                        break;
                    case "/healthArea/listHealthArea":
                    case "/healthArea/listHealthArea/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_HEALTH_AREA")) {
                            return true;
                        }
                        break;
                    case "/organisation/addOrganisation":
                        if (bfunction.includes("ROLE_BF_ADD_ORGANIZATION")) {
                            return true;
                        }
                        break;
                    case "/organisation/editOrganisation/:organisationId":
                        if (bfunction.includes("ROLE_BF_EDIT_ORGANIZATION")) {
                            return true;
                        }
                        break;
                    case "/organisation/listOrganisation":
                    case "/organisation/listOrganisation/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_ORGANIZATION")) {
                            return true;
                        }
                        break;
                    case "/organisationType/addOrganisationType":
                        if (bfunction.includes("ROLE_BF_ADD_ORGANIZATION_TYPE")) {
                            return true;
                        }
                        break;
                    case "/organisationType/editOrganisationType/:organisationTypeId":
                        if (bfunction.includes("ROLE_BF_EDIT_ORGANIZATION_TYPE")) {
                            return true;
                        }
                        break;
                    case "/organisationType/listOrganisationType":
                    case "/organisationType/listOrganisationType/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_ORGANIZATION_TYPE")) {
                            return true;
                        }
                        break;
                    case "/program/addProgram":
                        if (bfunction.includes("ROLE_BF_CREATE_A_PROGRAM")) {
                            return true;
                        }
                        break;
                    case "/program/editProgram/:programId":
                        if (bfunction.includes("ROLE_BF_EDIT_PROGRAM")) {
                            return true;
                        }
                        break;
                    case "/program/listProgram":
                    case "/program/listProgram/:message":
                    case "/program/listProgram/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_PROGRAM")) {
                            return true;
                        }
                        break;
                    case "/tracerCategory/addTracerCategory":
                        if (bfunction.includes("ROLE_BF_ADD_TRACER_CATEGORY")) {
                            return true;
                        }
                        break;
                    case "/tracerCategory/editTracerCategory/:tracerCategoryId":
                        if (bfunction.includes("ROLE_BF_EDIT_TRACER_CATEGORY")) {
                            return true;
                        }
                        break;
                    case "/tracerCategory/listTracerCategory":
                    case "/tracerCategory/listTracerCategory/:message":
                    case "/tracerCategory/listTracerCategory/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_TRACER_CATEGORY")) {
                            return true;
                        }
                        break;
                    case "/productCategory/productCategoryTree/:color/:message":
                    case "/productCategory/productCategoryTree":
                        if (bfunction.includes("ROLE_BF_LIST_PRODUCT_CATEGORY")) {
                            return true;
                        }
                        break;
                    case "/forecastingUnit/addForecastingUnit":
                        if (bfunction.includes("ROLE_BF_ADD_FORECASTING_UNIT")) {
                            return true;
                        }
                        break;
                    case "/forecastingUnit/editForecastingUnit/:forecastingUnitId":
                        if (bfunction.includes("ROLE_BF_EDIT_FORECASTING_UNIT")) {
                            return true;
                        }
                        break;
                    case "/forecastingUnit/listForecastingUnit":
                    case "/forecastingUnit/listForecastingUnit/:message":
                    case "/forecastingUnit/listForecastingUnit/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_FORECASTING_UNIT")) {
                            return true;
                        }
                        break;
                    case "/planningUnit/addPlanningUnit":
                        if (bfunction.includes("ROLE_BF_ADD_PLANNING_UNIT")) {
                            return true;
                        }
                        break;
                    case "/planningUnit/editPlanningUnit/:planningUnitId":
                        if (bfunction.includes("ROLE_BF_EDIT_PLANNING_UNIT")) {
                            return true;
                        }
                        break;
                    case "/planningUnit/listPlanningUnit":
                    case "/planningUnit/listPlanningUnit/:message":
                    case "/planningUnit/listPlanningUnit/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_PLANNING_UNIT")) {
                            return true;
                        }
                        break;
                    case "/planningUnitCapacity/planningUnitCapacity/:planningUnitId":
                        if (bfunction.includes("ROLE_BF_MAP_PLANNING_UNIT_CAPACITY")) {
                            return true;
                        }
                        break;
                    case "/planningUnitCapacity/listPlanningUnitCapacity":
                        if (bfunction.includes("ROLE_BF_LIST_PLANNING_UNIT_CAPACITY")) {
                            return true;
                        }
                        break;
                    case "/procurementUnit/addProcurementUnit":
                        if (bfunction.includes("ROLE_BF_ADD_PROCUREMENT_UNIT")) {
                            return true;
                        }
                        break;
                    case "/procurementUnit/editProcurementUnit/:procurementUnitId":
                        if (bfunction.includes("ROLE_BF_EDIT_PROCUREMENT_UNIT")) {
                            return true;
                        }
                        break;
                    case "/procurementUnit/listProcurementUnit":
                    case "/procurementUnit/listProcurementUnit/:message":
                    case "/procurementUnit/listProcurementUnit/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_PROCUREMENT_UNIT")) {
                            return true;
                        }
                        break;
                    case "/program/programOnboarding":
                        if (bfunction.includes("ROLE_BF_SET_UP_PROGRAM")) {
                            return true;
                        }
                        break;
                    case "/program/syncPage":
                    case "/program/commitRequest":
                        if (bfunction.includes("ROLE_BF_COMMIT_VERSION")) {
                            return true;
                        }
                        break;
                    case "/realmCountry/realmCountry/:realmId":
                        if (bfunction.includes("ROLE_BF_MAP_REALM_COUNTRY")) {
                            return true;
                        }
                        break;
                    case "/program/addIntegration/:programId":
                        if (bfunction.includes("ROLE_BF_ADD_INTEGRATION_PROGRAM")) {
                            return true;
                        }
                        break;
                    case "/program/mapProcurementAgent/:programId":
                        if (bfunction.includes("ROLE_BF_MAP_PROCUREMENT_AGENT")) {
                            return true;
                        }
                        break;
                    case "/programProduct/addCountrySpecificPrice/:programPlanningUnitId/:programId":
                        if (bfunction.includes("ROLE_BF_MAP_COUNTRY_SPECIFIC_PRICES")) {
                            return true;
                        }
                        break;
                    case "/consumptionDetails":
                    case "/consumptionDetails/:programId/:versionId/:planningUnitId":
                        if (bfunction.includes("ROLE_BF_CONSUMPTION_DATA")) {
                            localStorage.setItem("isOfflinePage", 1);
                            return true;
                        }
                        break;
                    case "/inventory/addInventory":
                    case "/inventory/addInventory/:programId/:versionId/:planningUnitId":
                        if (bfunction.includes("ROLE_BF_INVENTORY_DATA")) {
                            localStorage.setItem("isOfflinePage", 1);
                            return true;
                        }
                        break;
                    case "/shipment/manualTagging":
                    case "/shipment/manualTagging/:tab":
                    case "/shipmentLinkingNotification":
                        if (bfunction.includes("ROLE_BF_MANUAL_TAGGING")) {
                            return true;
                        }
                        break;
                    case "/shipment/delinking":
                        if (bfunction.includes("ROLE_BF_DELINKING")) {
                            return true;
                        }
                        break;
                    case "/shipment/shipmentDetails":
                    case "/shipment/shipmentDetails/:message":
                    case "/shipment/shipmentDetails/:programId/:versionId/:planningUnitId":
                        if (bfunction.includes("ROLE_BF_SHIPMENT_DATA")) {
                            localStorage.setItem("isOfflinePage", 1);
                            return true;
                        }
                        break;
                    case "/realmCountry/realmCountryPlanningUnit/:realmCountryId":
                        if (bfunction.includes("ROLE_BF_MANAGE_REALM_COUNTRY_PLANNING_UNIT")) {
                            return true;
                        }
                        break;
                    case "/procurementAgent/addProcurementAgentProcurementUnit/:procurementAgentId":
                        if (bfunction.includes("ROLE_BF_MAP_PROCUREMENT_UNIT")) {
                            return true;
                        }
                        break;
                    case "/procurementAgent/addProcurementAgentPlanningUnit/:procurementAgentId":
                        if (bfunction.includes("ROLE_BF_MAP_PLANNING_UNIT")) {
                            return true;
                        }
                        break;
                    case "/programProduct/addProgramProduct":
                    case "/programProduct/addProgramProduct/:programId/:color/:message":
                        if (bfunction.includes("ROLE_BF_ADD_PROGRAM_PRODUCT")) {
                            return true;
                        }
                        break;
                    case "/realmCountry/realmCountryRegion/:realmCountryId":
                        if (bfunction.includes("ROLE_BF_MAP_REGION")) {
                            return true;
                        }
                        break;
                    case "/supplyPlan":
                    case "/supplyPlanFormulas":
                    case "/supplyPlan/:programId/:versionId/:planningUnitId":
                    case "/supplyPlan/:programId/:planningUnitId/:batchNo/:expiryDate":
                        if (bfunction.includes("ROLE_BF_SUPPLY_PLAN")) {
                            localStorage.setItem("isOfflinePage", 1);
                            return true;
                        }
                        break;
                    case "/report/whatIf":
                        if (bfunction.includes("ROLE_BF_SCENARIO_PLANNING")) {
                            return true;
                        }
                        break;
                    case "/report/productCatalog":
                        if (bfunction.includes("ROLE_BF_PRODUCT_CATALOG_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/consumption":
                        if (bfunction.includes("ROLE_BF_CONSUMPTION_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/globalConsumption":
                        if (bfunction.includes("ROLE_BF_CONSUMPTION_GLOBAL_VIEW_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/forecastOverTheTime":
                        if (bfunction.includes("ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/consumptionForecastErrorSupplyPlan":
                        if (bfunction.includes("ROLE_BF_FORECAST_ERROR_OVER_TIME_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/forecastMetrics":
                        if (bfunction.includes("ROLE_BF_FORECAST_MATRIX_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/stockStatusOverTime":
                        if (bfunction.includes("ROLE_BF_STOCK_STATUS_OVER_TIME_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/stockStatusMatrix":
                        if (bfunction.includes("ROLE_BF_STOCK_STATUS_MATRIX_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/stockStatus":
                        if (bfunction.includes("ROLE_BF_SUPPLY_PLAN_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/stockStatusAcrossPlanningUnits":
                        if (bfunction.includes("ROLE_BF_STOCK_STATUS_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/problemList":
                        if (bfunction.includes("ROLE_BF_PROBLEM_AND_ACTION_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/addProblem":
                        if (bfunction.includes("ROLE_BF_ADD_PROBLEM")) {
                            return true;
                        }
                        break;
                    case "/report/editProblem/:problemReportId/:programId/:index/:problemStatusId/:problemTypeId":
                        if (bfunction.includes("ROLE_BF_EDIT_PROBLEM")) {
                            return true;
                        }
                        break;
                    case "/report/qatProblemPlusActionReport":
                        if (bfunction.includes("ROLE_BF_PROBLEM_AND_ACTION_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/funderExport":
                        if (bfunction.includes("ROLE_BF_FUNDER_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/procurementAgentExport":
                        if (bfunction.includes("ROLE_BF_SHIPMENT_COST_DETAILS_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/supplierLeadTimes":
                        if (bfunction.includes("ROLE_BF_PROCUREMENT_AGENT_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/shipmentGlobalDemandView":
                        if (bfunction.includes("ROLE_BF_SHIPMENT_OVERVIEW_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/shipmentGlobalView":
                        if (bfunction.includes("ROLE_BF_GLOBAL_DEMAND_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/warehouseCapacity":
                        if (bfunction.includes("ROLE_BF_WAREHOUSE_CAPACITY_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/stockStatusAccrossPlanningUnitGlobalView":
                        if (bfunction.includes("ROLE_BF_STOCK_STATUS_GLOBAL_VIEW_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/stockAdjustment":
                        if (bfunction.includes("ROLE_BF_STOCK_ADJUSTMENT_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/annualShipmentCost":
                        if (bfunction.includes("ROLE_BF_ANNUAL_SHIPMENT_COST_REPORT")) {
                            return true;
                        }
                        break;
                    case "/ApplicationDashboard/:color/:message":
                    case "/ApplicationDashboard/:id":
                    case "/ApplicationDashboard/:id/:color/:message":
                    case "/ApplicationDashboard":
                        if (bfunction.includes("ROLE_BF_APPLICATION_DASHBOARD")) {
                            return true;
                        }
                        break;
                    case "/report/stockStatusMatrix":
                        if (bfunction.includes("ROLE_BF_VIEW_STOCK_STATUS_MATRIX")) {
                            return true;
                        }
                        break;
                    case "/program/downloadProgram":
                        if (bfunction.includes("ROLE_BF_DOWNLOAD_PROGARM")) {
                            return true;
                        }
                        break;
                    case "/program/deleteLocalProgram":
                        if (bfunction.includes("ROLE_BF_DELETE_LOCAL_PROGRAM")) {
                            return true;
                        }
                        break;
                    case "/program/importProgram":
                        if (bfunction.includes("ROLE_BF_IMPORT_PROGARM")) {
                            return true;
                        }
                        break;
                    case "/program/exportProgram":
                        if (bfunction.includes("ROLE_BF_EXPORT_PROGARM")) {
                            return true;
                        }
                        break;
                    case "/report/costOfInventory":
                        if (bfunction.includes("ROLE_BF_COST_OF_INVENTORY_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/inventoryTurns":
                        if (bfunction.includes("ROLE_BF_INVENTORY_TURNS_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/budgets":
                        if (bfunction.includes("ROLE_BF_BUDGET_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/supplyPlanVersionAndReview":
                    case "/report/editStatus/:programId/:versionId":
                    case "/report/supplyPlanVersionAndReview/:color/:message":
                    case "/report/supplyPlanVersionAndReview/:statusId":
                        if (bfunction.includes("ROLE_BF_SUPPLY_PLAN_VERSION_AND_REVIEW")) {
                            return true;
                        }
                        break;
                    case "/report/shipmentSummery":
                    case "/report/shipmentSummery/:message":
                    case "/report/shipmentSummery/:budgetId/:budgetCode":
                        if (bfunction.includes("ROLE_BF_SHIPMENT_DETAILS_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/expiredInventory":
                        if (bfunction.includes("ROLE_BF_EXPIRIES_REPORT")) {
                            return true;
                        }
                        break;
                    case "/dashboard/:message":
                    case "/dashboard/:color/:message":
                        if (bfunction.includes("ROLE_BF_APPLICATION_DASHBOARD")) {
                            return true;
                        }
                        break;
                    case "/translations/labelTranslations":
                        if (bfunction.includes("ROLE_BF_LABEL_TRANSLATIONS")) {
                            return true;
                        }
                        break;
                    case "/translations/databaseTranslations":
                        if (bfunction.includes("ROLE_BUSINESS_FUNCTION_EDIT_APPLICATION_LABELS") || bfunction.includes("ROLE_BUSINESS_FUNCTION_EDIT_REALM_LABELS") || bfunction.includes("ROLE_BUSINESS_FUNCTION_EDIT_PROGRAM_LABELS")) {
                            return true;
                        }
                        break;
                    case "/pipeline/pieplineProgramList":
                    case "/pipeline/pipelineProgramImport":
                    case "/pipeline/planningUnitListFinalInventory/:pipelineId":
                    case "/pipeline/pieplineProgramList/:color/:message":
                    case "/pipeline/pieplineProgramSetup/:pipelineId":
                        if (bfunction.includes("ROLE_BF_PIPELINE_PROGRAM_IMPORT")) {
                            return true;
                        }
                        break;
                    case "/changePassword":
                        return true;
                        break;
                    case "/logout/:message":
                    case "/logout":
                    case "/accessDenied":
                        return true;
                        break;
                    case "/problem/editProblem":
                        if (bfunction.includes("ROLE_BF_EDIT_PROBLEM")) {
                            return true;
                        }
                        break;
                    case "/report/problemList/:programId/:calculate/:color/:message":
                    case "/report/problemList/:color/:message":
                    case "/report/problemList/1/:programId/:calculate":
                        if (bfunction.includes("ROLE_BF_PROBLEM_AND_ACTION_REPORT")) {
                            return true;
                        }
                        break;
                    case "/report/addProblem/:color/:message":
                        if (bfunction.includes("ROLE_BF_ADD_PROBLEM")) {
                            return true;
                        }
                        break;
                    case "/quantimed/quantimedImport":
                        if (bfunction.includes("ROLE_BF_QUANTIMED_IMPORT")) {
                            return true;
                        }
                        break;
                    case "/importIntoQATSupplyPlan/listImportIntoQATSupplyPlan":
                        if (bfunction.includes("ROLE_BF_SUPPLY_PLAN_IMPORT")) {
                            return true;
                        }
                        break;
                    case "/userManual/uploadUserManual":
                        if (bfunction.includes("ROLE_BF_UPLOAD_USER_MANUAL")) {
                            return true;
                        }
                        break;
                    case "/usagePeriod/listUsagePeriod":
                    case "/usagePeriod/listUsagePeriod/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_USAGE_PERIOD")) {
                            return true;
                        }
                        break;
                    case "/forecastMethod/listForecastMethod":
                    case "/forecastMethod/listForecastMethod/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_FORECAST_METHOD")) {
                            return true;
                        }
                        break;
                    case "/modelingType/listModelingType":
                    case "/modelingType/listModelingType/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_MODELING_TYPE")) {
                            return true;
                        }
                        break;
                    case "/planningUnitSetting/listPlanningUnitSetting":
                    case "/planningUnitSetting/listPlanningUnitSetting/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_PLANNING_UNIT_SETTING")) {
                            return true;
                        }
                        break;
                    case "/equivalancyUnit/listEquivalancyUnit":
                    case "/equivalancyUnit/listEquivalancyUnit/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_EQUIVALENCY_UNIT_MAPPING")) {
                            return true;
                        }
                        break;
                    case "/extrapolation/extrapolateData":
                    case "/extrapolation/extrapolateData/:planningUnitId":
                        if (bfunction.includes("ROLE_BF_EXTRAPOLATION") || bfunction.includes("ROLE_BF_VIEW_EXTRAPOLATION")) {
                            return true;
                        }
                        break;
                    case "/importFromQATSupplyPlan/listImportFromQATSupplyPlan":
                    case "/importFromQATSupplyPlan/listImportFromQATSupplyPlan/:color/:message":
                    case "/importIntoQATSupplyPlan/listImportIntoQATSupplyPlan":
                    case "/importIntoQATSupplyPlan/listImportIntoQATSupplyPlan/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_IMPORT_FROM_QAT_SUPPLY_PLAN")) {
                            return true;
                        }
                        break;
                    case "/report/compareAndSelectScenario":
                    case "/report/compareAndSelectScenario/:programId/:planningUnitId/:regionId":
                        if (bfunction.includes("ROLE_BF_COMPARE_AND_SELECT") || bfunction.includes("ROLE_BF_VIEW_COMPARE_AND_SELECT")) {
                            return true;
                        }
                        break;
                    case "/validation/productValidation":
                        if (bfunction.includes("ROLE_BF_PRODUCT_VALIDATION")) {
                            return true;
                        }
                        break;
                    case "/validation/modelingValidation":
                        if (bfunction.includes("ROLE_BF_MODELING_VALIDATION")) {
                            return true;
                        }
                        break;
                    case "/report/compareVersion":
                        if (bfunction.includes("ROLE_BF_COMPARE_VERSION")) {
                            return true;
                        }
                        break;
                    case "/dataset/commitTree":
                        if (bfunction.includes("ROLE_BF_COMMIT_DATASET")) {
                            return true;
                        }
                        break;
                    case "/dataentry/consumptionDataEntryAndAdjustment":
                    case "/dataentry/consumptionDataEntryAndAdjustment/:color/:message":
                    case "/dataentry/consumptionDataEntryAndAdjustment/:planningUnitId":
                        if (bfunction.includes("ROLE_BF_CONSUMPTION_DATA_ENTRY_ADJUSTMENT") || bfunction.includes("ROLE_BF_VIEW_CONSUMPTION_DATA_ENTRY_ADJUSTMENT")) {
                            return true;
                        }
                        break;
                    case "/dataset/listTree":
                        if (bfunction.includes("ROLE_BF_LIST_TREE")) {
                            return true;
                        }
                        break;
                    case "/dataset/loadDeleteDataSet/:message":
                    case "/dataset/loadDeleteDataSet":
                        if (bfunction.includes("ROLE_BF_LOAD_DELETE_DATASET")) {
                            return true;
                        }
                        break;
                    case "/dataset/exportDataset":
                        if (bfunction.includes("ROLE_BF_EXPORT_DATASET")) {
                            return true;
                        }
                        break;
                    case "/dataset/importDataset":
                        if (bfunction.includes("ROLE_BF_IMPORT_DATASET")) {
                            return true;
                        }
                        break;
                    case "/dataSet/buildTree/tree/:treeId/:programId":
                    case "/dataSet/buildTree/tree/:treeId/:programId/:scenarioId":
                    case "/dataSet/buildTree/":
                    case "/dataSet/buildTree/treeServer/:treeId/:programId/:isLocal":
                    case "/dataSet/buildTree/template/:templateId":
                        if (bfunction.includes("ROLE_BF_ADD_TREE") || bfunction.includes("ROLE_BF_VIEW_TREE") || bfunction.includes("ROLE_BF_EDIT_TREE")) {
                            return true;
                        }
                        break;
                    case "/dataset/createTreeTemplate/:templateId":
                        if (bfunction.includes("ROLE_BF_EDIT_TREE_TEMPLATE") || bfunction.includes("ROLE_BF_ADD_TREE_TEMPLATE") || bfunction.includes("ROLE_BF_VIEW_TREE_TEMPLATES")) {
                            return true;
                        }
                        break;
                    case "/dataset/listTreeTemplate/":
                    case "/dataset/listTreeTemplate/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_TREE_TEMPLATE")) {
                            return true;
                        }
                        break;
                    case "/dataset/listTree/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_TREE")) {
                            return true;
                        }
                        break;
                    case "/dataset/versionSettings":
                        if (bfunction.includes("ROLE_BF_VERSION_SETTINGS")) {
                            return true;
                        }
                        break;
                    case "/usageTemplate/listUsageTemplate":
                    case "/usageTemplate/listUsageTemplate/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_USAGE_TEMPLATE")) {
                            return true;
                        }
                        break;
                    case "/dataset/addDataSet":
                        if (bfunction.includes("ROLE_BF_ADD_DATASET")) {
                            return true;
                        }
                        break;
                    case "/dataset/editDataSet/:dataSetId":
                        if (bfunction.includes("ROLE_BF_EDIT_DATASET")) {
                            return true;
                        }
                        break;
                    case "/dataset/listDataSet":
                    case "/dataset/listDataSet/:color/:message":
                        if (bfunction.includes("ROLE_BF_LIST_DATASET")) {
                            return true;
                        }
                        break;
                    case "/forecastReport/forecastOutput":
                    case "/forecastReport/forecastOutput/:programId/:versionId":
                        if (bfunction.includes("ROLE_BF_LIST_MONTHLY_FORECAST")) {
                            return true;
                        }
                        break;
                    case "/forecastReport/forecastSummary":
                    case "/forecastReport/forecastSummary/:programId/:versionId":
                        if (bfunction.includes("ROLE_BF_LIST_FORECAST_SUMMARY") || bfunction.includes("ROLE_BF_VIEW_FORECAST_SUMMARY")) {
                            return true;
                        }
                        break;
                    case "/forecastReport/consumptionForecastError":
                        if (bfunction.includes("ROLE_BF_CONSUMPTION_FORECAST_ERROR")) {
                            return true;
                        }
                        break;
                    case "/forecastReport/compareScenario":
                        return true;
                    default:
                        return false;
                }
            } else {
                return true;
            }
            return false;
        } else {
            localStorage.setItem("sessionChanged", 1)
            return "/login/static.message.sessionChange";
        }
    }
    hexToRgbA(hex) {
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',1)';
        }
        throw new Error('Bad Hex');
    }
    validateRequest() {
        if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != "") {
            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
            if (localStorage.getItem("sessionType") === 'Online') {
                if (localStorage.getItem('token-' + decryptedCurUser) != null && localStorage.getItem('token-' + decryptedCurUser) != "") {
                    return "";
                } else {
                    return "/logout/static.message.tokenError";
                }
            } else {
                return "";
            }
        } else {
            if (localStorage.getItem("sessionChanged") == 1) {
                return "/login/static.message.sessionChange";
            } else {
                return "/accessDenied";
            }
        }
    }
    clearUserDetails() {
        let keysToRemove;
        if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != "") {
            keysToRemove = ["token-" + this.getLoggedInUserId(), "curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken", "sesRecordCount", "sesRangeValue", "sesProgramId", "sesPlanningUnitId", "sesLocalVersionChange", "sesLatestProgram", "sesProblemStatus", "sesProblemType", "sesProblemCategory", "sesReviewed", "sesStartDate", "sesProgramIdReport", "sesVersionIdReport", "sessionType", "sesBudPro", "sesBudFs", "sesBudStatus", "sesForecastProgramIds", "sesDatasetId", "sesDatasetPlanningUnitId", "sesDatasetRegionId", "sesLiveDatasetId", "sesDatasetVersionId", "sesTreeId", "sesScenarioId", "sesLevelId", "sesDatasetCompareVersionId", "sesForecastProgramIdReport", "sesForecastVersionIdReport", "sesShipmentType", "sesCountryId", "sesPlanningUnitIdMulti","sesAutoCalculate", "sesRangeValueManualJson","sesLatestDataset","sesCountryIdSPVR","sesProgramIdSPVR","sesVersionTypeSPVR","sesVersionStatusSPVR","sesReportRangeSPVR"];
        } else {
            keysToRemove = ["curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken", "sesRecordCount", "sesRangeValue", "sesProgramId", "sesPlanningUnitId", "sesLocalVersionChange", "sesLatestProgram", "sesProblemStatus", "sesProblemType", "sesProblemCategory", "sesReviewed", "sesStartDate", "sesProgramIdReport", "sesVersionIdReport", "sessionType", "sesBudPro", "sesBudFs", "sesBudStatus", "sesForecastProgramIds", "sesDatasetId", "sesDatasetPlanningUnitId", "sesDatasetRegionId", "sesLiveDatasetId", "sesDatasetVersionId", "sesTreeId", "sesScenarioId", "sesLevelId", "sesDatasetCompareVersionId", "sesForecastProgramIdReport", "sesForecastVersionIdReport", "sesShipmentType", "sesCountryId", "sesPlanningUnitIdMulti","sesAutoCalculate", "sesRangeValueManualJson","sesLatestDataset","sesCountryIdSPVR","sesProgramIdSPVR","sesVersionTypeSPVR","sesVersionStatusSPVR","sesReportRangeSPVR"];
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
    }
    getDefaultUserLanguage() {
        let lang = localStorage.getItem('lastLoggedInUsersLanguage');
        if (lang != null && lang != "") {
            return lang;
        } else {
            return "en";
        }
    }
    setLanguageChangeFlag() {
        localStorage.setItem('lastLoggedInUsersLanguageChanged', false);
    }
    setRecordCount(count) {
        var startDate = moment(Date.now()).subtract(6, 'months').startOf('month').format("YYYY-MM-DD");
        var endDate = moment(Date.now()).add(18, 'months').startOf('month').format("YYYY-MM-DD");
        var dt = new Date();
        dt.setMonth(dt.getMonth() - SPV_REPORT_DATEPICKER_START_MONTH);
        var dt1 = new Date();
        dt1.setMonth(dt1.getMonth());
        localStorage.setItem('sesRecordCount', count);
        localStorage.setItem('sesRangeValue', JSON.stringify({ from: { year: new Date(startDate).getFullYear(), month: new Date(startDate).getMonth() + 1 }, to: { year: new Date(endDate).getFullYear(), month: new Date(endDate).getMonth() + 1 } }));
        localStorage.setItem('sesRangeValueManualJson', JSON.stringify({ from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } }));
        localStorage.setItem('sesShipmentType', JSON.stringify([{ value: 1, label: i18n.t('static.shipment.manualShipments') }, { value: 2, label: i18n.t('static.shipment.erpShipment') }]));
        localStorage.setItem('sesProgramId', "");
        localStorage.setItem('sesCountryId', "");
        localStorage.setItem('sesDatasetId', "");
        localStorage.setItem('sesLevelId', "");
        localStorage.setItem('sesLiveDatasetId', "");
        localStorage.setItem('sesTreeId', "");
        localStorage.setItem('sesScenarioId', "");
        localStorage.setItem('sesDatasetVersionId', "");
        localStorage.setItem('sesDatasetCompareVersionId', "");
        localStorage.setItem('sesDatasetPlanningUnitId', "");
        localStorage.setItem('sesDataentryDateRange', "");
        localStorage.setItem('sesDataentryStartDateRange', "");
        localStorage.setItem('sesDatasetRegionId', "");
        localStorage.setItem('sesPlanningUnitId', "");
        localStorage.setItem('sesPlanningUnitIdMulti', "");
        localStorage.setItem("sesLatestProgram", false);
        localStorage.setItem("sesLatestDataset", false);
        localStorage.setItem('sesReportRangeSPVR', JSON.stringify({ from: { year: dt.getFullYear(), month: dt.getMonth() + 1 }, to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 } }))
        localStorage.setItem("sesCountryIdSPVR", -1);
        localStorage.setItem("sesProgramIdSPVR", -1);
        localStorage.setItem("sesVersionTypeSPVR", -1);
        localStorage.setItem("sesVersionStatusSPVR", -1);
        localStorage.setItem("sesProblemStatus", JSON.stringify([{ label: "Open", value: 1 }, { label: "Addressed", value: 3 }]));
        localStorage.setItem('sesProblemType', "-1");
        localStorage.setItem('sesProblemCategory', "-1");
        localStorage.setItem('sesReviewed', "-1");
        localStorage.setItem('sesProgramIdReport', "");
        localStorage.setItem('sesVersionIdReport', "");
        localStorage.setItem('sesForecastProgramIdReport', "");
        localStorage.setItem('sesForecastVersionIdReport', "");
        localStorage.setItem('sesBudPro', "");
        localStorage.setItem('sesBudFs', "");
        localStorage.setItem('sesBudStatus', "");
        localStorage.setItem('sesForecastProgramIds', "");
        var currentDate = moment(Date.now()).utcOffset('-0500');
        var curDate = moment(currentDate).startOf('month').subtract(MONTHS_IN_PAST_FOR_SUPPLY_PLAN, 'months').format("YYYY-MM-DD");
        localStorage.setItem('sesStartDate', JSON.stringify({ year: parseInt(moment(curDate).format("YYYY")), month: parseInt(moment(curDate).format("M")) }))
        localStorage.setItem('sesStartDate', JSON.stringify({ year: parseInt(moment(curDate).format("YYYY")), month: parseInt(moment(curDate).format("M")) }))
        localStorage.setItem('sesAutoCalculate',true)
    }
    getIconAndStaticLabel(val) {
        let lang = this.getDefaultUserLanguage();
        if (val == "icon") {
            switch (lang) {
                case "en":
                    return "flag-icon flag-icon-us";
                case "fr":
                    return "flag-icon flag-icon-wf";
                case "sp":
                    return "flag-icon flag-icon-es";
                case "pr":
                    return "flag-icon flag-icon-pt";
                default:
                    return "flag-icon flag-icon-us";
            }
        }
        else if (val == "label") {
            switch (lang) {
                case "en":
                    return "static.language.english";
                case "fr":
                    return "static.language.french";
                case "sp":
                    return "static.language.spanish";
                case "pr":
                    return "static.language.portuguese";
                default:
                    return "static.language.english";
            }
        }
    }
}
export default new AuthenticationService()
