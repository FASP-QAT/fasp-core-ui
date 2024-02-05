import axios from "axios";
import { API_URL } from '../Constants.js';
class LabelsService {
    getDatabaseLabelsList() {
        return axios.get(`${API_URL}/api/getDatabaseLabelsListAll`, {
        });
    }
    getStaticLabelsList(){
        return axios.get(`${API_URL}/api/getStaticLabelsListAll`, {
        });
    }
    saveDatabaseLabels(json) {
        return axios.put(`${API_URL}/api/saveDatabaseLabels`, json, {}
        );
    }
    saveStaticLabels(json) {
        return axios.put(`${API_URL}/api/saveStaticLabels`, json, {}
        );
    }
}
export default new LabelsService();