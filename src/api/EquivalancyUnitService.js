import axios from "axios";
import { API_URL } from '../Constants.js';
class EquivalancyUnitService {
    getEquivalancyUnitMappingList() {
        return axios.get(`${API_URL}/api/equivalencyUnit/mapping/all`, {
        });
    }
    addUpdateEquivalancyUnitMapping(json) {
        return axios.post(`${API_URL}/api/equivalencyUnit/mapping`, json, {});
    }
    getEquivalancyUnitList() {
        return axios.get(`${API_URL}/api/equivalencyUnit/all`, {
        });
    }
    addUpdateEquivalancyUnit(json) {
        return axios.post(`${API_URL}/api/equivalencyUnit`, json, {});
    }
    getEquivalencyUnitMappingForForecastingUnit(json1, json2) {
        return axios.get(`${API_URL}/api/equivalencyUnit/forecastingUnitId/${json1}/programId/${json2}`, {
        });
    }
}
export default new EquivalancyUnitService();