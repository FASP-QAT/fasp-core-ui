import axios from "axios";
import { API_URL } from '../Constants.js';

class EquivalancyUnitService {

    getEquivalancyUnitMappingList() {
        return axios.get(`${API_URL}/api/equivalencyUnit/all`, {
        });
    }

    addUpdateEquivalancyUnitMapping(json) {
        return axios.post(`${API_URL}/api/equivalencyUnit`, json, {});
    }

    getEquivalancyUnitList() {
        return axios.get(`${API_URL}/api/equivalencyUnit/mapping/all`, {
        });
    }

    addUpdateEquivalancyUnit(json) {
        return axios.post(`${API_URL}/api/equivalencyUnit/mapping`, json, {});
    }

}
export default new EquivalancyUnitService();