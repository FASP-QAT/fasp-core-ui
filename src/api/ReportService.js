import axios from "axios";
import { API_URL } from '../Constants.js';
class ReportService {
    getForecastMatricsOverTime(json) {
        return axios.post(`${API_URL}/api/report/forecastMetricsMonthly`, json, {
        });
    }
    getGlobalConsumptiondata(json) {
        return axios.post(`${API_URL}/api/report/globalConsumption`, json, {}
        );
    }
    getForecastError(json) {
        return axios.post(`${API_URL}/api/report/forecastMetricsComparision`, json, {}
        );
    }
    getAnnualShipmentCost(json) {
        return axios.post(`${API_URL}/api/report/annualShipmentCost`, json, {}
        );
    }
    getStockOverTime(json) {
        return axios.post(`${API_URL}/api/report/stockStatusOverTime`, json, {}
        );
    }
    getProgramVersionList(programId, realmCountryId, versionStatusId, versionTypeId, startDate, stopDate) {
        return axios.get(`${API_URL}/api/programVersion/programId/${programId}/versionId/-1/realmCountryId/${realmCountryId}/healthAreaId/-1/organisationId/-1/versionTypeId/${versionTypeId}/versionStatusId/${versionStatusId}/dates/${startDate}/${stopDate}`, {}
        );
    }
    costOfInventory(json) {
        return axios.post(`${API_URL}/api/report/costOfInventory`, json, {}
        );
    }
    getStockStatusData(json) {
        return axios.post(`${API_URL}/api/report/stockStatusVertical`, json, {}
        );
    }
    inventoryTurns(json) {
        return axios.post(`${API_URL}/api/report/inventoryTurns`, json, {}
        );
    }
    stockAdjustmentList(json) {
        return axios.post(`${API_URL}/api/report/stockAdjustmentReport`, json, {}
        );
    }
    procurementAgentExporttList(json) {
        return axios.post(`${API_URL}/api/report/procurementAgentShipmentReport`, json, {}
        );
    }
    fundingSourceExportList(json) {
        return axios.post(`${API_URL}/api/report/fundingSourceShipmentReport`, json, {}
        );
    }
    AggregateShipmentByProduct(json) {
        return axios.post(`${API_URL}/api/report/aggregateShipmentByProduct`, json, {}
        );
    }
    wareHouseCapacityExporttList(json) {
        return axios.post(`${API_URL}/api/report/warehouseCapacityReport`, json, {}
        );
    }
    stockStatusForProgram(json) {
        return axios.post(`${API_URL}/api/report/stockStatusForProgram`, json, {}
        );
    }
    programProductCatalog(json) {
        return axios.post(`${API_URL}/api/report/programProductCatalog`, json, {}
        );
    }
    ShipmentGlobalView(json) {
        return axios.post(`${API_URL}/api/report/shipmentGlobalDemand`, json, {}
        );
    }
    programLeadTimes(json) {
        return axios.post(`${API_URL}/api/report/programLeadTimes`, json, {}
        );
    }
    ShipmentSummery(json) {
        return axios.post(`${API_URL}/api/report/shipmentDetails`, json, {}
        );
    }
    shipmentOverview(json) {
        return axios.post(`${API_URL}/api/report/shipmentOverview`, json, {}
        );
    }
    budgetReport(json) {
        return axios.post(`${API_URL}/api/report/budgetReport`, json, {}
        );
    }
    stockStatusAcrossProducts(json) {
        return axios.post(`${API_URL}/api/report/stockStatusAcrossProducts`, json, {}
        );
    }
    getExpiredStock(json) {
        return axios.post(`${API_URL}/api/report/expiredStock`, json, {}
        );
    }
    wareHouseCapacityByCountry(json) {
        return axios.post(`${API_URL}/api/report/warehouseByCountry`, json, {}
        );
    }
    forecastOutput(inputjson) {
        return axios.post(`${API_URL}/api/report/monthlyForecast`, inputjson, {});
    }
    forecastSummary(inputjson) {
        return axios.post(`${API_URL}/api/report/forecastSummary`, inputjson, {});
    }
    forecastError(inputjson) {
        return axios.post(`${API_URL}/api/report/forecastError`, inputjson, {});
    }
    forecastErrorNew(inputjson) {
        return axios.post(`${API_URL}/api/report/forecastErrorNew`, inputjson, {});
    }
    getUpdateProgramInfoDetailsBasedRealmCountryId(programTypeId, realmCountryId,statusId) {
        return axios.get(`${API_URL}/api/report/updateProgramInfo/programTypeId/${programTypeId}/realmCountryId/${realmCountryId}/active/${statusId}`, {}
        );
    }
}
export default new ReportService();
