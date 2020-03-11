import axios from "axios";
import { API_URL } from '../Constants.js';

class CountryService {

    addCountry(json) {
        return axios.put(`${API_URL}/api/addCountry/`, json, {}
        );
    }

    getCountryListAll() {
        return axios.get(`${API_URL}/api/getCountryListAll/`, {
        });
    }
    getCountryListActive() {
        return axios.get(`${API_URL}/api/getCountryListActive/`, {
        });
    }

    editCountry(json) {
        return axios.put(`${API_URL}/api/editCountry/`, json, {}
        );
    }

    getRealmCountryList() {
        return axios.get(`${API_URL}/api/getRealmCountryList/`, {
        });
    }
    getRealmCountryListByRealmId(realmId) {
        return axios.get(`${API_URL}/api/getRealmCountryListByRealmId/${realmId}`, {
        });
    }

}
export default new CountryService();