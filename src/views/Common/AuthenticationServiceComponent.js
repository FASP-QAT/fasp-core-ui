import axios from 'axios';
import CryptoJS from 'crypto-js';
import React, { Component } from 'react';
import { SECRET_KEY } from '../../Constants.js';
import AuthenticationService from '../Common/AuthenticationService.js';
/**
 * Component responsible for handling authentication related tasks.
 */
export default class AuthenticationServiceComponent extends Component {
    constructor(props) {
        super(props);
    }
    /**
     * Handles the session and language change and validates request on component mount
     */
    componentDidMount = () => {
        var result = AuthenticationService.validateRequest();
        if (result != "") {
            if (result == '/login/static.message.sessionChange' && localStorage.getItem("isOfflinePage") == 1) {
            } else {
                this.props.history.push(result)
            }
        } else if (localStorage.getItem("sessionType") === 'Online') {
            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
            let decryptedToken = CryptoJS.AES.decrypt(localStorage.getItem('token-' + decryptedCurUser).toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8)
            let basicAuthHeader = 'Bearer ' + decryptedToken
            axios.defaults.headers.common['Authorization'] = basicAuthHeader;
            axios.interceptors.request.use((config) => {
                var result1 = AuthenticationService.validateRequest();
                let url = config.url;
                if (result1 != null && result1 != "") {
                    if (result1 == '/login/static.message.sessionChange' && localStorage.getItem("isOfflinePage") == 1) {
                    }
                    else if (!url.includes("api/sync/language") && !url.includes("/actuator/info") && !url.includes("/authenticate") && !url.includes("/api/updateExpiredPassword") && !url.includes("/api/forgotPassword") && !url.includes("/api/confirmForgotPasswordToken") && !url.includes("/api/updatePassword")) {
                        this.props.history.push(result1)
                    }
                }
                return config;
            }, (error) => {
                return Promise.reject(error);
            });
        }
    }
    /**
     * Renders the component.
     * @returns {JSX.Element} - The rendered component.
     */
    render() {
        return (
            <div className="animated fadeIn">
            </div>
        )
    }
}
