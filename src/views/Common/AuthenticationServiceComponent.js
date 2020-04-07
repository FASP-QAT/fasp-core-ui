import React, { Component } from 'react';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../Constants.js'
import AuthenticationService from '../Common/AuthenticationService.js';
import axios from 'axios'
import LogoutService from "../../api/LogoutService";

export default class AuthenticationServiceComponent extends Component {
    constructor(props) {
        super(props);
        this.logout = this.logout.bind(this);
    }
    logout() {
        let keysToRemove = ["token-" + AuthenticationService.getLoggedInUserId(), "curUser", "lang", "typeOfSession", "i18nextLng"];
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            LogoutService.logout()
                .then(response => {
                    if (response.status == 200) {
                        keysToRemove.forEach(k => localStorage.removeItem(k))
                    }
                }).catch(
                    error => {
                    }
                );
        } else {
            keysToRemove.forEach(k => localStorage.removeItem(k))
        }
        this.props.history.push(`/login/static.logoutSuccess`)
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        console.log("component did mount called on service component---")

        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        console.log("decryptedCurUser---" + decryptedCurUser);
        if (AuthenticationService.checkTypeOfSession()) {
            if (localStorage.getItem('token-' + decryptedCurUser) != null && localStorage.getItem('token-' + decryptedCurUser) != "") {
                if (AuthenticationService.checkLastActionTaken()) {
                    localStorage.setItem('lastActionTaken', new Date());
                    let decryptedToken = CryptoJS.AES.decrypt(localStorage.getItem('token-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8)

                    let basicAuthHeader = 'Bearer ' + decryptedToken

                    axios.interceptors.request.use(function (config) {
                        console.log("goint to call interceptor request---", config)
                        config.headers.authorization = basicAuthHeader
                        return config;
                    }, function (error) {
                        return Promise.reject(error);
                    }
                    )

                    axios.interceptors.response.use(function (response) {
                        console.log("inside interceptors response---", response);
                        return response;
                    }, function (error) {
                        switch (error.response ? error.response.status : "") {
                            case 401:
                                this.logout();
                                break;
                            case 500:
                                console.log("Internal server error");
                                break;
                            case 404:
                            case 406:
                            case 412:
                                // this.setState({ message: error.response.data.messageCode });
                                break;
                            default:
                                // this.setState({ message: 'static.unkownError' });
                                break;
                        }
                        console.log("inside interceptors response---", error);
                        return Promise.reject(error);
                    });

                } else {
                    this.logout();
                }
            } else {
                this.logout();
            }
        } else {
            this.logout();
        }
    }
    render() {
        console.log("render#########");
        return (
            <div className="animated fadeIn">
                <h1>helloooo</h1>
            </div>
        )
    }
}