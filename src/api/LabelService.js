import axios from "axios";
import { API_URL } from '../Constants.js';

class LabelsService {
    getLabelsListAll() {
        return axios.get(`${API_URL}/api/getLabelsListAll/`, {
        });
    } 

    updateLabels(json) {
        return axios.put(`${API_URL}/api/updateLabels/`, json, {}
        );
    }

}
export default new LabelsService();