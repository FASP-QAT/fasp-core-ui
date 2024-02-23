import axios from "axios";
import { API_URL } from '../Constants.js';
class ForecastingUnitService {
    addForecastingUnit(json) {
        return axios.post(`${API_URL}/api/forecastingUnit`, json, {}
        );
    }
    getForecastingUnitList() {
        return axios.get(`${API_URL}/api/forecastingUnit`, {
        });
    }
    getForecastingUnitListAll() {
        return axios.get(`${API_URL}/api/forecastingUnit/all`, {
        });
    }
    editForecastingUnit(json) {
        return axios.put(`${API_URL}/api/forecastingUnit`, json, {
        });
    }
    getForcastingUnitById(json) {
        return axios.get(`${API_URL}/api/forecastingUnit/${json}`, {}
        );
    }
    getForcastingUnitByRealmId(json) {
        return axios.get(`${API_URL}/api/forecastingUnit/realmId/${json}`, {}
        );
    }
    getForcastingUnitListByTracerCategoryId(tracerCategoryId) {
        return axios.get(`${API_URL}/api/forecastingUnit/tracerCategory/${tracerCategoryId}`, {}
        );
    }
    getForecastingUnitByTracerCategoriesId(json) {
        return axios.post(`${API_URL}/api/forecastingUnit/tracerCategorys`, json, {}
        );
    }
    getForecastingUnitListByProgramVersionIdForSelectedForecastMap(programId, versionId) {
        return axios.get(`${API_URL}/api/forecastingUnit/programId/${programId}/versionId/${versionId}`, {}
        );
    }
    getForecastingUnitByIds(json) {
        return axios.post(`${API_URL}/api/forecastingUnit/byIds`, json, {}
        );
    }
}
export default new ForecastingUnitService();