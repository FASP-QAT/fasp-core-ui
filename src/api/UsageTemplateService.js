import axios from "axios";
import { API_URL } from '../Constants.js';
class UsageTemplateService {
    getUsageTemplateListAll() {
        return axios.get(`${API_URL}/api/usageTemplate/all`, {
        });
    }
    addUpdateUsageTemplateMapping(json) {
        return axios.post(`${API_URL}/api/usageTemplate`, json, {});
    }
    getUsageTemplateListForTree(tracerCategoryId) {
        return axios.get(`${API_URL}/api/usageTemplate/tracerCategory/${tracerCategoryId}`, {
        });
    }
}
export default new UsageTemplateService();