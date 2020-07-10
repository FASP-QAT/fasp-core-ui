import axios from "axios";
import { API_URL } from '../Constants.js';

class ReportService {
    getForecastMatricsOverTime(json) {
        return axios.post(`${API_URL}/api/report/forecastError`, json, {
        });
    }
    getGlobalConsumptiondata(json) {
        return axios.post(`${API_URL}/api/report/globalConsumption`, json, {}
        );
    }
    getForecastError(json) {
        return axios.post(`${API_URL}/api/report/forecastMetrics`, json, {}
        );
    }

    getFunderExportData(programIds) {
        return axios.post(`${API_URL}/api/budget/programIds`, programIds, {}
        );
    }
    getProcurementAgentExportData(programIds) {
        return axios.post(`${API_URL}/api/program/programIds`, programIds, {});
    }
    getAnnualShipmentCost(json) {
        return axios.post(`${API_URL}/api/report/annualShipmentCost`, json, {}
        );
    }
    getProgramVersionList(programId,realmCountryId,versionStatusId,startDate,stopDate) {
        return axios.get(`${API_URL}/api/programVersion/programId/${programId}/versionId/-1/realmCountryId/${realmCountryId}/healthAreaId/-1/organisationId/-1/versionTypeId/-1/versionStatusId/${versionStatusId}/dates/${startDate}/${stopDate}`,{}
        );
    }

    getStockOverTime(json) {
        return axios.post(`${API_URL}/api/report/stockOverTime`,json,{}
        );
    }
    getProgramVersionList(programId,realmCountryId,versionStatusId,startDate,stopDate) {
        return axios.get(`${API_URL}/api/programVersion/programId/${programId}/versionId/-1/realmCountryId/${realmCountryId}/healthAreaId/-1/organisationId/-1/versionTypeId/-1/versionStatusId/${versionStatusId}/dates/${startDate}/${stopDate}`,{}
        );
    }

    getStockOverTime(json) {
        return axios.post(`${API_URL}/api/report/stockOverTime`,json,{}
        );
    }
    costOfInventory(json){
        return axios.post(`${API_URL}/api/report/costOfInventory`,json,{}
        );
    }

    getStockStatusData(json) {
        return axios.post(`${API_URL}/api/report/stockStatus`,json,{}
        );
    }
    inventoryTurns(json){
        return axios.post(`${API_URL}/api/report/inventoryTurns`,json,{}
        );
    }
    stockAdjustmentList(json){
        return axios.post(`${API_URL}/api/report/stockAdjustmentList`,json,{}
        );
    }
    procurementAgentExporttList(json){
        return axios.post(`${API_URL}/api/report/procurementAgentShipmentReport`,json,{}
        );
    }
    fundingSourceExportList(json){
        return axios.post(`${API_URL}/api/report/fundingSourceShipmentReport`,json,{}
        );
    }
    stockStatusForProgram(json){
        return axios.post(`${API_URL}/api/report/stockStatusForProgram`,json,{}
        );
    }
    programProductCatalog(json){
        return axios.post(`${API_URL}/api/report/programProductCatalog`,json,{}
        );
    }

}
export default new ReportService();