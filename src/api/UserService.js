import axios from "axios";
import { API_URL } from '../Constants.js';


class UserService {
    getLanguageList() {
        return axios.get(`${API_URL}/api/getLanguageList`, {
        });
    }
    getRoleList() {
        return axios.get(`${API_URL}/api/getRoleList`, {
        });
    }
    getBusinessFunctionList() {
        return axios.get(`${API_URL}/api/getBusinessFunctionList`, {
        });
    }
    getRealmList() {
        return axios.get(`${API_URL}/api/getRealmList`, {
        });
    }
    addNewUser(json) {
        console.log(json);
        // var jsonString=JSON.stringify(json);

        return axios.put(`${API_URL}/api/addNewUser/`, json, {
        });
    }
    addNewRole(json) {
        console.log(json);
        // var jsonString=JSON.stringify(json);

        return axios.put(`${API_URL}/api/addNewRole/`, json, {
        });
    }

    getUserList() {
        return axios.get(`${API_URL}/api/getUserList`, {
        });
    }
    getUserByUserId(userId) {
        return axios.get(`${API_URL}/api/getUserByUserId/${userId}`, {
        });
    }
    editUser(json) {
        return axios.put(`${API_URL}/api/editUser/`, json, {
        });
    }

    editRole(json) {
        console.log(json);
        // var jsonString=JSON.stringify(json);

        return axios.put(`${API_URL}/api/editRole/`, json, {
        });
    }
    unlockAccount(userId, emailId) {
        return axios.put(`${API_URL}/api/unlockAccount/${userId}/${emailId}`, {
        });
    }
    updateExpiredPassword(username, oldPassword, newPassword) {
        console.log("api username---" + username);
        return axios.post(`${API_URL}/api/updateExpiredPassword/`, { username, oldPassword, newPassword }, {});
    }

    changePassword(userId, oldPassword, newPassword) {
        console.log("api username---" + userId);
        return axios.post(`${API_URL}/api/changePassword/`, { userId, oldPassword, newPassword }, {});
    }
    forgotPassword(username) {
        return axios.get(`${API_URL}/api/forgotPassword/${username}`, {});
    }
    confirmForgotPasswordToken(username, token) {
        return axios.post(`${API_URL}/api/confirmForgotPasswordToken/`, { username, token }, {});
    }
    updatePassword(username, token, password) {
        return axios.post(`${API_URL}/api/updatePassword/`, { username, token, password }, {});
    }
}

export default new UserService()