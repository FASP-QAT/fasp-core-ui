import axios from "axios";
import { API_URL } from '../Constants.js';
class TracerCategoryService {
    addTracerCategory(json) {
        return axios.post(`${API_URL}/api/tracerCategory`, json, {}
        );
    }
    getTracerCategoryListAll() {
        return axios.get(`${API_URL}/api/tracerCategory`, {
        });
    }
    updateTracerCategory(json) {
        return axios.put(`${API_URL}/api/tracerCategory`, json, {
        });
    }
    getTracerCategoryById(json) {
        return axios.get(`${API_URL}/api/tracerCategory/${json}`, {}
        );
    }
    getTracerCategoryByRealmId(json) {
        return axios.get(`${API_URL}/api/tracerCategory/realmId/${json}`, {}
        );
    }
    getTracerCategoryByProgramIds(realmId, programIds) {
        return axios.post(`${API_URL}/api/tracerCategory/realmId/${realmId}/programIds`, programIds, {}
        );
    }
}
export default new TracerCategoryService();
