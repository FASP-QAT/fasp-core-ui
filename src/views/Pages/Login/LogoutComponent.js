import React, { Component } from 'react';
import AuthenticationService from '../../Common/AuthenticationService.js';
import LogoutService from "../../../api/LogoutService";
import axios from 'axios';
import CryptoJS from 'crypto-js'
import { SECRET_KEY } from '../../../Constants.js'
import { isSiteOnline } from '../../../CommonComponent/JavascriptCommonFunctions.js';



class LogoutComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: ''
        }
    }


    componentDidMount() {
        console.log("########### Logout component did mount start ####################")
        if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != "") {
            let keysToRemove = ["token-" + AuthenticationService.getLoggedInUserId(), "curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken","sessionType"];
            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
            if (isSiteOnline() && localStorage.getItem('token-' + decryptedCurUser) != null && localStorage.getItem('token-' + decryptedCurUser) != "") {
                // AuthenticationService.setupAxiosInterceptors();
                console.log("########### Going to call Logout api####################")
                LogoutService.logout()
                    .then(response => {
                        console.log("logout component success");
                        if (response.status == 200) {
                            keysToRemove.forEach(k => localStorage.removeItem(k));
                            console.log("########### Logout component did mount end ####################")
                            // Newly added code below
                            delete axios.defaults.headers.common["Authorization"];
                            this.props.history.push(`/login/${this.props.match.params.message}`)
                        }
                    }).catch(
                        error => {
                            console.log("logout component error");
                            keysToRemove.forEach(k => localStorage.removeItem(k));
                            if(localStorage.getItem("sessionTimedOut")==1){
                                this.props.history.push(`/login/static.message.sessionExpired`)
                            }else{
                            this.props.history.push(`/login/static.logoutError`)
                            }
                        }
                    );
            } else {
                keysToRemove.forEach(k => localStorage.removeItem(k));
                this.props.history.push(`/login/${this.props.match.params.message}`)
            }
        } else {
            console.log("logout access denied error-------------");
            if(localStorage.getItem("sessionTimedOut")==1){
                this.props.history.push(`/login/static.message.sessionExpired`)
            }else{
            this.props.history.push(`/login/static.accessDenied`)
            }
        }

    }
    render() {
        return (
            <div className="animated fadeIn">

            </div>
        );
    }
}

export default LogoutComponent;