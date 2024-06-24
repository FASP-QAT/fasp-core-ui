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
    getFundingSourceTypeListAll() {
        return axios.get(`${API_URL}/api/fundingSourceType`, {
        });
    }
    addFundingSourceType(json) {
        return axios.post(`${API_URL}/api/fundingSourceType`, json, {}
        );
    }
    updateFundingSourceType(json) {
        return axios.put(`${API_URL}/api/fundingSourceType`, json, {
        });
    }
    getFundingSourceTypeById(json) {
        return axios.get(`${API_URL}/api/fundingSourceType/${json}`, {}
        );
    }
    getFundingsourceTypeListByRealmId(realmId) {
        return axios.get(`${API_URL}/api/fundingSourceType/realmId/${realmId}`, {
        });
    }
}
export default new FundingSourceService();