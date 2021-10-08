import axios from "axios";
import { API_URL } from '../Constants.js';

class UsageTemplateService {

    getUsageTemplateListAll() {
        return axios.get(`${API_URL}/api/usageTemplate/all`, {
        });
    }

    getUsageTemplateList() {
        return axios.get(`${API_URL}/api/usageTemplate`, {
        });
    }

    addUpdateUsageTemplateMapping(json) {
        return axios.post(`${API_URL}/api/usageTemplate`, json, {});
    }
    getUsageTemplateListForTree(tracerCategoryId, forecastingUnitId, usageTypeId) {
        return axios.get(`${API_URL}/api/usageTemplate/tracerCategory/${tracerCategoryId}/usageType/${usageTypeId}/forecastingUnit/${forecastingUnitId}`, {
        });
    }

}
export default new UsageTemplateService();