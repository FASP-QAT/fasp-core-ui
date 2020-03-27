import axios from "axios";
import { API_URL } from '../Constants.js';

class CountryService {

    addCountry(json) {
        return axios.post(`${API_URL}/api/country/`, json, {}
        );
    }

    getCountryListAll() {
        return axios.get(`${API_URL}/api/country/all/`, {
        });
    }
    getCountryListActive() {
        console.log("call api---")
        return axios.get(`${API_URL}/api/getCountryListActive/`, {
        });
    }

    editCountry(json) {
        return axios.put(`${API_URL}/api/country/`, json, {}
        );
    }
}
export default new CountryService();