import axios from "axios";
import { API_URL } from '../Constants.js';


class UserService {
    getLanguageList() {
        return axios.get(`${API_URL}/api/getLanguageList`, {
        });
    }
    getRoleList() {
        return axios.get(`${API_URL}/api/role`, {
        });
    }
    getBusinessFunctionList() {
        return axios.get(`${API_URL}/api/businessFunction`, {
        });
    }
    getRealmList() {
        return axios.get(`${API_URL}/api/realm`, {
        });
    }
    addNewUser(json) {
        return axios.post(`${API_URL}/api/user/`, json, {
        });
    }
    addNewRole(json) {
        return axios.post(`${API_URL}/api/role/`, json, {
        });
    }

    getUserList() {
        return axios.get(`${API_URL}/api/user`, {
        });
    }
    getUserByUserId(userId) {
        console.log("decryptedCurUser sync data api---",userId)
        return axios.get(`${API_URL}/api/user/${userId}`, {
        });
    }
    getUserDetailsByUserId(userId) {
        return axios.get(`${API_URL}/api/user/${userId}`, {
        });
    }
    editUser(json) {
        return axios.put(`${API_URL}/api/user/`, json, {
        });
    }

    editRole(json) {
        return axios.put(`${API_URL}/api/role/`, json, {
        });
    }
    unlockAccount(userId, emailId) {
        return axios.put(`${API_URL}/api/unlockAccount/${userId}/${emailId}`, {
        });
    }
    updateExpiredPassword(emailId, oldPassword, newPassword) {
        return axios.post(`${API_URL}/api/updateExpiredPassword/`, { emailId, oldPassword, newPassword }, {});
    }

    changePassword(userId, oldPassword, newPassword) {
        return axios.post(`${API_URL}/api/changePassword/`, { userId, oldPassword, newPassword }, {});
    }
    forgotPassword(emailId) {
        return axios.post(`${API_URL}/api/forgotPassword/`, { emailId });
    }
    confirmForgotPasswordToken(emailId, token) {
        return axios.post(`${API_URL}/api/confirmForgotPasswordToken/`, { emailId, token }, {});
    }
    updatePassword(emailId, token, password) {
        return axios.post(`${API_URL}/api/updatePassword/`, { emailId, token, password }, {});
    }
    accessControls(json) {
        return axios.put(`${API_URL}/api/accessControls/`, json, {
        });
    }
    getRoleById(json) {
        return axios.get(`${API_URL}/api/role/${json}`, {}
        );
    }
    updateUserLanguage(languageCode) {
        return axios.post(`${API_URL}/api/user/language/`, { languageCode }, {})
    };
    acceptUserAgreement() {
        return axios.post(`${API_URL}/api/user/agreement/`, {}, {})
    }
    updateUserModule(json) {
        return axios.post(`${API_URL}/api/user/module/${json}`, {}
        );
    }
}

export default new UserService()