import axios from "axios";
import { API_URL } from '../Constants.js';
class SubFundingSourceService {
    addSubFundingSource(json) {
        return axios.post(`${API_URL}/api/subFundingSource/`, json, {}
        );
    }
    getSubFundingSourceListAll() {
        return axios.get(`${API_URL}/api/subFundingSource/`, {
        });
    }
    updateSubFundingSource(json) {
        return axios.put(`${API_URL}/api/subFundingSource/`, json, {
        });
    }
    getSubFundingSourceServiceById(json) {
        return axios.get(`${API_URL}/api/subFundingSource/${json}`, {}
        );
    }
}
export default new SubFundingSourceService();