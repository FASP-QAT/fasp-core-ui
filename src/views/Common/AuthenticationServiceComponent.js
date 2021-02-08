import React, { Component } from 'react';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import AuthenticationService from '../Common/AuthenticationService.js';
import axios from 'axios'
import LogoutService from "../../api/LogoutService";
import moment from 'moment';
import i18n from '../../i18n'
import { isSiteOnline } from '../../CommonComponent/JavascriptCommonFunctions.js';

export default class AuthenticationServiceComponent extends Component {
    constructor(props) {
        super(props);
        // this.logout = this.logout.bind(this);
    }
    // logout(message) {
    //     let keysToRemove = ["token-" + AuthenticationService.getLoggedInUserId(), "curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken"];
    //     if (navigator.onLine) {
    //         AuthenticationService.setupAxiosInterceptors();
    //         LogoutService.logout()
    //             .then(response => {
    //                 if (response.status == 200) {
    //                     keysToRemove.forEach(k => localStorage.removeItem(k))
    //                 }
    //             }).catch(
    //                 error => {
    //                 }
    //             );
    //     } else {
    //         keysToRemove.forEach(k => localStorage.removeItem(k))
    //     }
    //     this.props.history.push(`/login/${message != "" ? message : "static.logoutSuccess"}`)
    // }
    componentDidMount = () => {
        console.log("Common component component did mount called-------------");
        var result = AuthenticationService.validateRequest();
        console.log("result----" + result);
        isSiteOnline(function (found) {
        if (result != "") {
            this.props.history.push(result)
        } else if (found) {
            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
            let decryptedToken = CryptoJS.AES.decrypt(localStorage.getItem('token-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8)
            let basicAuthHeader = 'Bearer ' + decryptedToken
            axios.defaults.headers.common['Authorization'] = basicAuthHeader;

            // Add a request interceptor
            axios.interceptors.request.use((config) => {
                console.log("common request axios interceptors--->", config);
                // Do something before request is sent
                var result1 = AuthenticationService.validateRequest();
                console.log("result1----" + result1);
                let url = config.url;
                console.log("url---", url);
                if (result1 != null && result1 != "" && !url.includes("/actuator/info/") && !url.includes("/authenticate") && !url.includes("/api/updateExpiredPassword/") && !url.includes("/api/forgotPassword/") && !url.includes("/api/confirmForgotPasswordToken/") && !url.includes("/api/updatePassword/")) {
                    this.props.history.push(result1)
                }
                return config;
            }, (error) => {
                console.log("common request axios interceptors error--->", error);
                // Do something with request error
                return Promise.reject(error);
            });

            // axios.interceptors.response.use((response) => {
            //     if (response != null && response != "") {
            //         console.log("common component success");
            //         return response;
            //     } else {
            //         this.props.message("Network Error")
            //         // this.props.loading(false)
            //         return "";
            //     }
            // }, (error) => {
            //     console.log("Common component error--->", error);
            //     if (error.message === "Network Error") {
            //         this.props.message("Network Error")
            //         // this.props.loading(false)
            //     } else {
            //         switch (error.response ? error.response.status : "") {
            //             case 403:
            //                 console.log("common component 403--->", error);
            //                 this.props.history.push(`/accessDenied`)
            //                 break;
            //             case 401:
            //                 console.log("common component 401 session expired--->", error);
            //                 this.props.history.push(`/login/static.message.sessionExpired`)
            //                 break;
            //             case 500:
            //             case 404:
            //             case 406:
            //                 console.log("common component 404,406,500--->", error);
            //                 console.log("error.response.data.messageCode-------------", error.response.data.messageCode);
            //                 this.props.message(error.response.data.messageCode);
            //                 this.props.loading(false)
            //                 break;
            //             case 412:
            //                 console.log("common component 412--->", error);
            //                 console.log("error.response.data.messageCode-------------", error.response.data.messageCode);
            //                 this.props.message(error.response.data.messageCode);
            //                 console.log("Common component called---------");
            //                 this.props.loading(false)
            //                 console.log("Common component loading---------");
            //                 break;
            //             default:
            //                 console.log("common component default--->", error);
            //                 this.props.message('static.unkownError');
            //                 this.props.loading(false)
            //                 break;
            //         }
            //         return Promise.reject(error);
            //     }
            // });
        }
    }.bind(this))
    }
    render() {
        return (
            <div className="animated fadeIn">

            </div>
        )
    }
}
