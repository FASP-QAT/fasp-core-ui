import React, { Component } from 'react';
import AuthenticationService from '../../Common/AuthenticationService.js';
import LogoutService from "../../../api/LogoutService";
import axios from 'axios';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../../Constants.js'



class LogoutComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: ''
        }
    }


    componentDidMount() {
        console.log("########### Logout component did mount start ####################")
        let keysToRemove = ["token-" + AuthenticationService.getLoggedInUserId(), "curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken"];
        let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
        if (navigator.onLine && localStorage.getItem('token-' + decryptedCurUser) != null && localStorage.getItem('token-' + decryptedCurUser) != "") {
            AuthenticationService.setupAxiosInterceptors();
            LogoutService.logout()
                .then(response => {
                    if (response.status == 200) {
                        // this.props.history.push(`/login/static.logoutSuccess`)
                    }
                }).catch(
                    error => {
                        this.props.history.push(`/login/static.logoutSuccess`)
                    }
                );
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        console.log("########### Logout component did mount end ####################")
        this.props.history.push(`/login/${this.props.match.params.message}`)
    }
    render() {
        return (
            <div className="animated fadeIn">

            </div>
        );
    }
}

export default LogoutComponent;