import axios from "axios";
import { API_URL } from '../Constants.js';
class UsagePeriodService {
    getUsagePeriodList() {
        return axios.get(`${API_URL}/api/usagePeriod/all`, {
        });
    }
    getUsagePeriod() {
        return axios.get(`${API_URL}/api/usagePeriod`, {
        });
    }
    addUpdateUsagePeriod(json) {
        return axios.post(`${API_URL}/api/usagePeriod`, json, {});
    }
}
export default new UsagePeriodService();