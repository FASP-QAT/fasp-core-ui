import axios from "axios";
import { API_URL } from '../Constants.js';

class ReportService {
    getForecastMatricsOverTime(json) {
        return axios.post(`${API_URL}/api/report/forecastError`,json, {
        });
    }
    getGlobalConsumptiondata(json) {
        return axios.post(`${API_URL}/api/report/globalConsumption`, json,{}
        );
    }
    getForecastError(json) {
        return axios.post(`${API_URL}/api/report/forecastMetrics`, json,{}
        );
    }
    getFunderExportData(programIds) {
        return axios.post(`${API_URL}/api/budget/programIds`,programIds,{}
        );
    }
    getProcurementAgentExportData(programIds) {
        return axios.post(`${API_URL}/api/program/programIds`,programIds,{}
        );
    }

}
export default new ReportService();