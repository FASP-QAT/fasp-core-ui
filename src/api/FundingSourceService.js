import axios from "axios";
import { API_URL } from '../Constants.js';
class FundingSourceService {
    addFundingSource(json) {
        return axios.post(`${API_URL}/api/fundingSource`, json, {}
        );
    }
    getFundingSourceListAll() {
        return axios.get(`${API_URL}/api/fundingSource`, {
        });
    }
    updateFundingSource(json) {
        return axios.put(`${API_URL}/api/fundingSource`, json, {
        });
    }
    getFundingSourceById(json) {
        return axios.get(`${API_URL}/api/fundingSource/${json}`, {}
        );
    }
    getFundingSourceDisplayName(json1, json2) {
        return axios.get(`${API_URL}/api/fundingSource/getDisplayName/realmId/${json1}/name/${json2}`, {}
        );
    }
}
export default new FundingSourceService();