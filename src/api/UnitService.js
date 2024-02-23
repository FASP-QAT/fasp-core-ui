import axios from "axios";
import { API_URL } from '../Constants.js';
class UnitService {
    addUnit(json) {
        return axios.post(`${API_URL}/api/unit`, json, {
        });
    }
    getUnitListAll() {
        return axios.get(`${API_URL}/api/unit`, {
        });
    }
    updateUnit(json) {
        return axios.put(`${API_URL}/api/unit`, json, {
        });
    }
    getUnitById(json) {
        return axios.get(`${API_URL}/api/unit/${json}`, {}
        );
    }
    getUnitListByDimensionId(dimensionId) {
        return axios.get(`${API_URL}/api/unit/dimension/${dimensionId}`, {}
        );
    }
}
export default new UnitService();