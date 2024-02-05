import axios from "axios";
import { API_URL } from '../Constants.js';
class PlanningUnitService {
    addPlanningUnit(json) {
        return axios.post(`${API_URL}/api/planningUnit`, json, {}
        );
    }
    getActivePlanningUnitList() {
        return axios.get(`${API_URL}/api/planningUnit`, {
        });
    }
    getAllPlanningUnitList() {
        return axios.get(`${API_URL}/api/planningUnit/all`, {
        });
    }
    getPlanningUnitByRealmId(json) {
        return axios.get(`${API_URL}/api/planningUnit/realmId/${json}`, {}
        );
    }
    editPlanningUnit(json) {
        return axios.put(`${API_URL}/api/planningUnit`, json, {}
        );
    }
    getPlanningUnitById(json) {
        return axios.get(`${API_URL}/api/planningUnit/${json}`, {}
        );
    }
    getPlanningUnitByProgramIds(json) {
        return axios.post(`${API_URL}/api/planningUnit/programs`, json, {}
        );
    }
    getActivePlanningUnitByProductCategoryId(json) {
        return axios.get(`${API_URL}/api/planningUnit/productCategory/${json}/active`, {}
        );
    }
    getActivePlanningUnitByProductCategoryIds(json) {
        return axios.post(`${API_URL}/api/planningUnit/productCategoryList/active`, json, {}
        );
    }
    getActivePlanningUnitByRealmCountryId(realmCountryId) {
        return axios.get(`${API_URL}/api/planningUnit/realmCountry/${realmCountryId}`, {}
        );
    }
    getActivePlanningUnitListByFUId(forecastingUnitId) {
        return axios.get(`${API_URL}/api/planningUnit/forecastingUnit/${forecastingUnitId}`, {}
        );
    }
    getPlanningUnitListByProgramVersionIdForSelectedForecastMap(programId, versionId) {
        return axios.get(`${API_URL}/api/planningUnit/programId/${programId}/versionId/${versionId}`, {}
        );
    }
    getPlanningUnitListBasic() {
        return axios.get(`${API_URL}/api/planningUnit/basic`, {});
    }
    getPlanningUnitByIds(json) {
        return axios.post(`${API_URL}/api/planningUnit/byIds`, json, {}
        );
    }
    getPlanningUnitWithPricesByIds(json) {
        return axios.post(`${API_URL}/api/planningUnit/withPrices/byIds`, json, {});
    }
    editPlanningUnitCapacity(json) {
        return axios.put(`${API_URL}/api/planningUnit/capacity`, json, {}
        );
    }
    getPlanningUnitCapacityForId(planningUnitId) {
        return axios.get(`${API_URL}/api/planningUnit/capacity/${planningUnitId}`, {}
        );
    }
}
export default new PlanningUnitService();
