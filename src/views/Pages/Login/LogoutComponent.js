import React, { Component } from 'react';
import AuthenticationService from '../../Common/AuthenticationService.js';
import LogoutService from "../../../api/LogoutService";
import axios from 'axios';



class LogoutComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: ''
        }
    }


    componentDidMount() {
        let keysToRemove = ["token-" + AuthenticationService.getLoggedInUserId(), "curUser", "lang", "typeOfSession", "i18nextLng"];

        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            LogoutService.logout()
                .then(response => {
                    if (response.status == 200) {
                        // this.props.history.push(`/login/static.logoutSuccess`)
                    }
                }).catch(
                    error => {

                    }
                );
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        this.props.history.push(`/login/static.logoutSuccess`)
    }
    render() {
        return (
            <div className="animated fadeIn">

            </div>
        );
    }
}

export default LogoutComponent;