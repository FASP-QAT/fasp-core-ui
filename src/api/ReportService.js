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

}
export default new ReportService();