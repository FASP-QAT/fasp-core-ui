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
        // let keysToRemove = ["token-" + AuthenticationService.getLoggedInUserId(), "curUser", "lang", "typeOfSession", "i18nextLng"];
        console.log("new component called");
        if (navigator.onLine) {
            AuthenticationService.setupAxiosInterceptors();
            LogoutService.logout()
                .then(response => {
                    console.log("response---", response);
                    if (response.status == 200) {
                        console.log("inside if---" + AuthenticationService.getLoggedInUserId());
                        // //         // keysToRemove.forEach(k => localStorage.removeItem(k))
                        localStorage.removeItem("token-" + AuthenticationService.getLoggedInUserId());
                        localStorage.removeItem("curUser");
                        localStorage.removeItem("lang");
                        localStorage.removeItem("typeOfSession");
                        localStorage.removeItem("i18nextLng");

                        AuthenticationService.clearAxiosInterceptors();
                        // this.axios.setToken(false)
                        // axios.defaults.headers.common['authorization'] = '';
                        // axios.setHeader('Authorization', null)
                        this.props.history.push(`/login/static.logoutSuccess`)
                    }
                    console.log("inside if out---");
                }).catch(
                    error => {
                        AuthenticationService.clearAxiosInterceptors();
                        console.log("logout error---", error);
                    }
                );
        } else {
            //   // keysToRemove.forEach(k => localStorage.removeItem(k))
            localStorage.removeItem("token-" + AuthenticationService.getLoggedInUserId());
            localStorage.removeItem("curUser");
            localStorage.removeItem("lang");
            localStorage.removeItem("typeOfSession");
            localStorage.removeItem("i18nextLng");
            this.props.history.push(`/login/static.logoutSuccess`)
        }
        // this.props.history.push(`/login/static.logoutSuccess`)
    }
    render() {
        return (
            <div className="animated fadeIn">

            </div>
        );
    }
}

export default LogoutComponent;