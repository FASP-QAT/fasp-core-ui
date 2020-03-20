import axios from "axios";
import { API_URL } from '../Constants.js';

class RealmCountryService {

    addRealmCountry(json) {
        return axios.post(`${API_URL}/api/realmCountry/`, json, {}
        );
    }

    getRealmCountryListAll() {
        return axios.get(`${API_URL}/api/realmCountry/`, {
        });
    }
    
    getRealmCountryById(realmCountryId) {
        return axios.get(`${API_URL}/api/realmCountry/{realmCountryId}`, {
        });
    }

    updateRealmCountry(json) {
        return axios.put(`${API_URL}/api/realmCountry/`, json, {
        });
    }

}
export default new RealmCountryService();
