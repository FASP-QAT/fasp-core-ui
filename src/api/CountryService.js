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
}
export default new CountryService();