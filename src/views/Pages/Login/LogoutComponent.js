import axios from 'axios';
import CryptoJS from 'crypto-js';
import React, { Component } from 'react';
import { SECRET_KEY } from '../../../Constants.js';
import LogoutService from "../../../api/LogoutService";
import AuthenticationService from '../../Common/AuthenticationService.js';
/**
 * Component for Logout.
 */
class LogoutComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: ''
        }
    }
    /**
     * Calls the logout api on component mount
     */
    componentDidMount() {
        if (localStorage.getItem('curUser') != null && localStorage.getItem('curUser') != "") {
            let keysToRemove = ["token-" + AuthenticationService.getLoggedInUserId(), "curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken", "sessionType"];
            let decryptedCurUser = CryptoJS.AES.decrypt(localStorage.getItem('curUser').toString(), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8);
            if (localStorage.getItem("sessionType") === 'Online' && localStorage.getItem('token-' + decryptedCurUser) != null && localStorage.getItem('token-' + decryptedCurUser) != "") {
                LogoutService.logout()
                    .then(response => {
                        if (response.status == 200) {
                            keysToRemove.forEach(k => localStorage.removeItem(k));
                            delete axios.defaults.headers.common["Authorization"];
                            this.props.history.push(`/login/${this.props.match.params.message}`)
                        }
                    }).catch(
                        error => {
                            keysToRemove.forEach(k => localStorage.removeItem(k));
                            if (localStorage.getItem("sessionTimedOut") == 1) {
                                this.props.history.push(`/login/static.message.sessionExpired`)
                            } else {
                                this.props.history.push(`/login/static.logoutError`)
                            }
                        }
                    );
            } else {
                keysToRemove.forEach(k => localStorage.removeItem(k));
                this.props.history.push(`/login/${this.props.match.params.message}`)
            }
        } else {
            if (localStorage.getItem("sessionTimedOut") == 1) {
                this.props.history.push(`/login/static.message.sessionExpired`)
            } else {
                this.props.history.push(`/login/static.accessDenied`)
            }
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
        );
    }
}
export default LogoutComponent;