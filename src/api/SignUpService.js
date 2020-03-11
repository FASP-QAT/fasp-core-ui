import axios from "axios";
import {API_URL} from '../Constants.js' 

class SignUpService {
    getCountryList() {
        return axios.get(`${API_URL}/api/getCountryList`, {
        });
    }

    getStateListByCountryId(countryId) {
        return axios.get(`${API_URL}/api/getStateListByCountryId/${countryId}`, {
        });
    }
    getStateList() {
        return axios.get(`${API_URL}/api/getStateList`, {
        });
    }

    getCityListByStateIdAndCountryId(countryId, stateId) {
        return axios.get(`${API_URL}/api/getCityList/${countryId}/${stateId}`, {
        });
    }
    getCityList() {
        return axios.get(`${API_URL}/api/getCityList`, {
        });
    }

    saveRegistration(json) {
        console.log(json);
        // var jsonString=JSON.stringify(json);

        return axios.put(`${API_URL}/api/saveRegistration/`, json, {
        });
    }
}

export default new SignUpService()