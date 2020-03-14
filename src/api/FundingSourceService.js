import axios from "axios";
import { API_URL } from '../Constants.js';

class FundingSourceService {

    addFundingSource(json) {
        //console.log(json);
        return axios.post(`${API_URL}/api/fundingSource/`, json, {}
        );
    }

    getFundingSourceListAll() {
        return axios.get(`${API_URL}/api/fundingSource/`, {
        });
    }

    updateFundingSource(json) {
        return axios.put(`${API_URL}/api/fundingSource/`, json, {
        });
    }
    addSubFundingSource(json) {
        //console.log(json);
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

}

export default new FundingSourceService();