import axios from 'axios'
import { Online } from "react-detect-offline";
import jwt_decode from 'jwt-decode'
import { API_URL } from '../../Constants.js'
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import bcrypt from 'bcryptjs';

let myDt;
class AuthenticationService {

    isUserLoggedIn(username) {
        var decryptedPassword = "";
        for (var i = 0; i < localStorage.length; i++) {
            var value = localStorage.getItem(localStorage.key(i));
            if (localStorage.key(i).includes("user-")) {
                let user = JSON.parse(CryptoJS.AES.decrypt(value.toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                let decryptedUsername = user.username;
                if (decryptedUsername == username) {
                    localStorage.setItem("tempUser", user.userId);
                    decryptedPassword = user.password;
                }
            }

        }
        return decryptedPassword;
    }

    getLoggedInUsername() {
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
        return decryptedUser.username;
    }

    getLoggedInUserId() {
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        return decryptedCurUser;
    }

    getLanguageId() {
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
        return decryptedUser.language.languageId;
    }

    getRealmId() {
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + decryptedCurUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
        console.log(decryptedUser);
        return decryptedUser.realm.realmId;
    }

    checkTypeOfSession() {
        let typeOfSession = localStorage.getItem('typeOfSession');
        if ((typeOfSession === 'Online' && navigator.onLine) || (typeOfSession === 'Offline' && !navigator.onLine)) {
            return true;
        } else {
            return false;



        }
    }

    checkIfDifferentUserIsLoggedIn(newUsername) {
        let usernameStored = localStorage.getItem('username');
        if (usernameStored !== null && usernameStored !== "") {
            var usernameDecrypted = CryptoJS.AES.decrypt(usernameStored, `${SECRET_KEY}`)
            var originalText = usernameDecrypted.toString(CryptoJS.enc.Utf8);
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

    checkSessionTimeOut() {
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedUser = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem('user-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8))
        return decryptedUser.sessionExpiresOn;
    }

    // refreshToken() {
    //     let token = localStorage.getItem('token');
    //     this.setupAxiosInterceptors();
    //     return axios.get(`${API_URL}/refresh`, {}).then(response => {
    //     }).catch(
    //         error => {
    //         })
    // }

    

    setupAxiosInterceptors() {
        // axios.defaults.headers.common['Authorization'] = '';
        // delete axios.defaults.headers.common['Authorization'];
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let decryptedToken = CryptoJS.AES.decrypt(localStorage.getItem('token-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        let basicAuthHeader = 'Bearer ' + decryptedToken
        axios.defaults.headers.common['Authorization'] = basicAuthHeader;
        // axios.interceptors.request.use(
        //     (config) => {
        //         config.headers.authorization = decryptedToken ? basicAuthHeader : '';
        //         return config;
        //     }
        // )


        // // Add a response interceptor
        // axios.interceptors.response.use(function (response) {
        //     return response;
        // }, function (error) {
        //     return Promise.reject(error);
        // });

    }

    storeTokenInIndexedDb(token, decodedObj) {
        let userObj = {
            token: token,
            typeOfSession: "Online",
            userId: decodedObj.userId
        }
        let userId = {
            userId: decodedObj.userId
        }
        if (!('indexedDB' in window)) {
            alert('This browser does not support IndexedDB');
        } else {
            var db;
            var customerObjectStore;
            var openRequest = indexedDB.open('fasp', 1);

            openRequest.onupgradeneeded = function (e) {
                var db = e.target.result;
                if (!db.objectStoreNames.contains('programData')) {
                    customerObjectStore = db.createObjectStore('programData', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('lastSyncDate')) {
                    customerObjectStore = db.createObjectStore('lastSyncDate', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('language')) {
                    customerObjectStore = db.createObjectStore('language', { keyPath: 'languageId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('country')) {
                    customerObjectStore = db.createObjectStore('country', { keyPath: 'countryId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('currency')) {
                    customerObjectStore = db.createObjectStore('currency', { keyPath: 'currencyId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('unit')) {
                    customerObjectStore = db.createObjectStore('unit', { keyPath: 'unitId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('dimension')) {
                    customerObjectStore = db.createObjectStore('dimension', { keyPath: 'dimensionId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('organisation')) {
                    customerObjectStore = db.createObjectStore('organisation', { keyPath: 'organisationId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('healthArea')) {
                    customerObjectStore = db.createObjectStore('healthArea', { keyPath: 'healthAreaId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('region')) {
                    customerObjectStore = db.createObjectStore('region', { keyPath: 'regionId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('fundingSource')) {
                    customerObjectStore = db.createObjectStore('fundingSource', { keyPath: 'fundingSourceId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('subFundingSource')) {
                    customerObjectStore = db.createObjectStore('subFundingSource', { keyPath: 'subFundingSourceId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('product')) {
                    customerObjectStore = db.createObjectStore('product', { keyPath: 'productId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('productCategory')) {
                    customerObjectStore = db.createObjectStore('productCategory', { keyPath: 'productCategoryId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('dataSource')) {
                    customerObjectStore = db.createObjectStore('dataSource', { keyPath: 'dataSourceId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('dataSourceType')) {
                    customerObjectStore = db.createObjectStore('dataSourceType', { keyPath: 'dataSourceTypeId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('shipmentStatus')) {
                    customerObjectStore = db.createObjectStore('shipmentStatus', { keyPath: 'shipmentStatusId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('shipmentStatusAllowed')) {
                    customerObjectStore = db.createObjectStore('shipmentStatusAllowed', { keyPath: 'shipmentStatusAllowedId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('supplier')) {
                    customerObjectStore = db.createObjectStore('supplier', { keyPath: 'supplierId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('logisticsUnit')) {
                    customerObjectStore = db.createObjectStore('logisticsUnit', { keyPath: 'logisticsUnitId', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('planningUnit')) {
                    customerObjectStore = db.createObjectStore('planningUnit', { keyPath: 'planningUnitId', autoIncrement: true });
                }
            }.bind(this);

            openRequest.onsuccess = function (e) {
                db = e.target.result;
                var transaction = db.transaction(['user'], 'readwrite');
                var user = transaction.objectStore('user');
                var result;
                result = user.delete(decodedObj.userId);

                result.onsuccess = function (event) {
                    result = user.add(userObj);
                    result.onerror = function (event) {
                    };

                    result.onsuccess = function (event) {
                    };
                };
                result.onerror = function (event) {
                };


                var transaction1 = db.transaction(['curuser'], 'readwrite');
                var curuser = transaction1.objectStore('curuser');
                result = curuser.clear();
                result.onsuccess = function (event) {
                    result = curuser.add(userId);
                    result.onerror = function (event) {
                    };

                    result.onsuccess = function (event) {
                    };
                };
                result.onerror = function (event) {
                };

            }.bind(this);

        }
    }
    getLoggedInUserDetails() {
        if (!('indexedDB' in window)) {
            alert('This browser does not support IndexedDB');
        } else {
            var db;
            var customerObjectStore;
            var userObj = 0;
            var openRequest = indexedDB.open('fasp', 1);

            openRequest.onupgradeneeded = function (e) {
                db = e.target.result;
                if (!db.objectStoreNames.contains('user')) {
                    customerObjectStore = db.createObjectStore('user', { keyPath: 'userId', autoIncrement: true });
                    customerObjectStore.createIndex("userId", "userId", { unique: true });
                }
                if (!db.objectStoreNames.contains('curuser')) {
                    customerObjectStore = db.createObjectStore('curuser', { keyPath: 'userId' });
                    customerObjectStore.createIndex("userId", "userId", { unique: true });
                }
            }.bind(this);

            openRequest.onsuccess = function (e) {
                db = e.target.result;
                var result;
                var transaction1 = db.transaction(['curuser'], 'readwrite');
                var curuser = transaction1.objectStore('curuser');
                result = curuser.getAll();
                result.onsuccess = function (event) {
                    var user = db.transaction(['user'], 'readwrite').objectStore('user');
                    result = user.get(result.result[0].userId);
                    result.onerror = function (event) {
                    };

                    result.onsuccess = function (event) {
                        userObj = result.result;
                        return userObj;
                    };
                };
                result.onerror = function (event) {
                };

            }.bind(this);

        }
        return userObj;
    }

}


export default new AuthenticationService()