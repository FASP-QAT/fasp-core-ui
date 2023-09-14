import axios from "axios";
import { API_URL } from '../Constants.js';
class PlanningUnitService {
    addPlanningUnit(json) {
        return axios.post(`${API_URL}/api/planningUnit/`, json, {}
        );
    }
    getActivePlanningUnitList() {
        return axios.get(`${API_URL}/api/planningUnit/`, {
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
        return axios.put(`${API_URL}/api/planningUnit/`, json, {}
        );
    }
    getPlanningUnitById(json) {
        return axios.get(`${API_URL}/api/planningUnit/${json}`, {}
        );
    }
    getPlanningUnitCapacityForId(planningUnitId) {
        return axios.get(`${API_URL}/api/planningUnit/capacity/${planningUnitId}`, {}
        );
    }
    editPlanningUnitCapacity(json) {
        return axios.put(`${API_URL}/api/planningUnit/capacity`, json, {}
        );
    }
    getPlanningUnitByProductCategoryId(json) {
        return axios.get(`${API_URL}/api/planningUnit/productCategory/${json}/all`, {}
        );
    }
    getPlanningUnitByProgramIds(json) {
        return axios.post(`${API_URL}/api/planningUnit/programs`, json, {}
        );
    }
    getPlanningUnitByTracerCategory(planningUnitId, procurementAgentId, term) {
        return axios.get(`${API_URL}/api/getPlanningUnitByTracerCategory/planningUnitId/${planningUnitId}/${procurementAgentId}/${term}`, {}
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
    getPlanningUnitByProgramIdsAndTracerCategorieIds(json) {
        return axios.post(`${API_URL}/api/planningUnit/tracerCategory/program/`, json, {}
        );
    }
    getProcurementAgentPlanningUnitByPlanningUnitIds(json) {
        return axios.post(`${API_URL}/api/procurementAgent/planningUnits`, json, {}
        );
    }
    getPlanningUnitByTracerCategoryIds(json) {
        return axios.post(`${API_URL}/api/planningUnit/tracerCategorys`, json, {}
        );
    }
    getPlanningUnitListByProgramVersionIdForSelectedForecastMap(programId, versionId) {
        return axios.get(`${API_URL}/api/planningUnit/programId/${programId}/versionId/${versionId}`, {}
        );
    }
    getPlanningUnitForProductCategory(productCategoryId) {
        return axios.get(`${API_URL}/api/planningUnit/withPricing/productCategory/${productCategoryId}`, {}
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
}
export default new PlanningUnitService();
