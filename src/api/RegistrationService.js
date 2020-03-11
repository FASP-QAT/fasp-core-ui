import axios from "axios"
import {API_URL} from '../Constants.js' 

class RegistrationService {
    getCountryList() {
        return axios.get(`${API_URL}/api/getCountryList`, {
        });
    }

    getStateList(countryId) {
        return axios.get(`${API_URL}/api/getStateList/${countryId}`, {
        });
    }

    getCityList(countryId, stateId) {
        return axios.get(`${API_URL}/api/getCityList/${countryId}/${stateId}`, {
        });
    }

    saveRegistration(json) {
        console.log(json);
        // var jsonString=JSON.stringify(json);

        return axios.put(`${API_URL}/api/saveRegistration/`, json, {
        });
    }

    getUserApprovalList() {
        return axios.get(`${API_URL}/api/getUserApprovalList`, {
        });
    }

    saveApproval(json) {
        return axios.put(`${API_URL}/api/saveApproval`, json, {
        });
    }
}

export default new RegistrationService()