import axios from "axios";
import { API_URL } from '../Constants.js';

class TracerCategoryService {

    addTracerCategory(json) {
        //console.log(json);
        return axios.post(`${API_URL}/api/tracerCategory/`, json, {}
        );
    }

    getTracerCategoryListAll() {
        return axios.get(`${API_URL}/api/tracerCategory/`, {
        });
    }
    updateTracerCategory(json) {
        return axios.put(`${API_URL}/api/tracerCategory/`, json, {
        });
    }
    getTracerCategoryById(json) {
        return axios.get(`${API_URL}/api/tracerCategory/${json}`, {}
        );
    }

}

export default new TracerCategoryService();
