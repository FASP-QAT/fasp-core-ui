import React, { Component } from 'react';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import AuthenticationService from '../Common/AuthenticationService.js';
import axios from 'axios'
import LogoutService from "../../api/LogoutService";
import moment from 'moment';
import i18n from '../../i18n'

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
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        if (AuthenticationService.checkTypeOfSession()) {
            if (navigator.onLine) {
                if (localStorage.getItem('token-' + decryptedCurUser) != null && localStorage.getItem('token-' + decryptedCurUser) != "") {
                    if (AuthenticationService.checkLastActionTaken()) {
                        localStorage.removeItem('lastActionTaken');
                        localStorage.setItem('lastActionTaken', CryptoJS.AES.encrypt((moment(new Date()).format("YYYY-MM-DD HH:mm:ss")).toString(), `${SECRET_KEY}`));
                        let decryptedToken = CryptoJS.AES.decrypt(localStorage.getItem('token-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8)
                        let basicAuthHeader = 'Bearer ' + decryptedToken
                        axios.defaults.headers.common['Authorization'] = basicAuthHeader;

                        axios.interceptors.response.use((response) => {
                            if (response != null && response != "") {
                                console.log("common component success");
                                return response;
                            } else {
                                this.props.message("Network Error")
                                this.props.loading(false)
                                return "";
                            }
                        }, (error) => {
                            if (error.message === "Network Error") {
                                this.props.message("Network Error")
                                this.props.loading(false)
                            } else {
                                switch (error.response ? error.response.status : "") {
                                    case 403:
                                        this.props.history.push(`/accessDenied`)
                                        break;
                                    case 401:
                                        this.props.history.push(`/login/static.message.sessionExpired`)
                                        break;
                                    case 500:
                                    case 404:
                                    case 406:
                                        console.log("error.response.data.messageCode-------------", error.response.data.messageCode);
                                        this.props.message(error.response.data.messageCode);
                                        this.props.loading(false)
                                        break;
                                    case 412:
                                        console.log("error.response.data.messageCode-------------", error.response.data.messageCode);
                                        this.props.message(error.response.data.messageCode);
                                        console.log("Common component called---------");
                                        this.props.loading(false)
                                        console.log("Common component loading---------");
                                        break;
                                    default:
                                        this.props.message('static.unkownError');
                                        this.props.loading(false)
                                        break;
                                }
                                return Promise.reject(error);
                            }
                        });

                    } else {
                        this.props.history.push(`/logout/static.message.sessionExpired`)
                    }
                } else {
                    this.props.history.push(`/logout/static.message.tokenError`)
                }
            } else {
                if (AuthenticationService.checkLastActionTaken()) {
                    localStorage.removeItem('lastActionTaken');
                    localStorage.setItem('lastActionTaken', CryptoJS.AES.encrypt((moment(new Date()).format("YYYY-MM-DD HH:mm:ss")).toString(), `${SECRET_KEY}`));
                } else {
                    this.props.history.push(`/logout/static.message.sessionExpired`)
                }
            }
        } else {
            this.props.history.push(`/logout/static.message.sessionChange`)
        }
    }
    render() {
        return (
            <div className="animated fadeIn">

            </div>
        )
    }
}