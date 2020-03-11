import axios from "axios";
import { API_URL } from '../Constants.js';

class RegionService {

    addRegion(json) {
        console.log(json);
        return axios.put(`${API_URL}/api/addRegion/`, json, {}
        );
    }

    getRegionList() {
        return axios.get(`${API_URL}/api/getRegionList/`, {
        });
    }
    editRegion(json) {
        return axios.put(`${API_URL}/api/editRegion/`, json, {}
        );
    }

}
export default new RegionService();