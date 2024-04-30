import axios from "axios";
import { API_URL } from '../Constants.js';
class DimensionSerice {
    addDimension(json) {
        return axios.post(`${API_URL}/api/dimension`, json, {
        });
    }
    getDimensionListAll() {
        return axios.get(`${API_URL}/api/dimension/all`, {
        });
    }
    updateDimension(json) {
        return axios.put(`${API_URL}/api/dimension`, json, {
        });
    }
    getDiamensionById(json) {
        return axios.get(`${API_URL}/api/dimension/${json}`, {}
        );
    }
}
export default new DimensionSerice()