import axios from "axios";
import { API_URL } from "../Constants";
class HealthAreaService {
    getRealmList() {
        return axios.get(`${API_URL}/api/realm`, {
        });
    }
    addHealthArea(json) {
        return axios.post(`${API_URL}/api/healthArea`, json, {}
        );
    }
    getHealthAreaList() {
        return axios.get(`${API_URL}/api/healthArea`, {
        });
    }
    getRealmCountryList(json) {
        return axios.get(`${API_URL}/api/realmCountry/realmId/${json}`, {}
        );
    }
    editHealthArea(json) {
        return axios.put(`${API_URL}/api/healthArea`, json, {
        });
    }
    getHealthAreaById(json) {
        return axios.get(`${API_URL}/api/healthArea/${json}`, {}
        );
    }
    getHealthAreaDisplayName(json1, json2) {
        return axios.get(`${API_URL}/api/healthArea/getDisplayName/realmId/${json1}/name/${json2}`, {}
        );
    }
}
export default new HealthAreaService()