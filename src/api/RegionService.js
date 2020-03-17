import axios from "axios";
import { API_URL } from '../Constants.js';

class RegionService {

    addRegion(json) {
        return axios.post(`${API_URL}/api/region/`, json, {}
        );
    }

    getRegionList() {
        return axios.get(`${API_URL}/api/region/`, {
        });
    }
    
    updateRegion(json) {
        return axios.put(`${API_URL}/api/region/`, json, {}
        );
    }

}
export default new RegionService();