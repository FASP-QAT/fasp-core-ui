import axios from "axios";
import { API_URL } from '../Constants.js';
class ForecastMethodService {
    getForecastMethodList() {
        return axios.get(`${API_URL}/api/forecastMethod/all`, {
        });
    }
    getActiveForecastMethodList() {
        return axios.get(`${API_URL}/api/forecastMethod`, {
        });
    }
    addUpdateForecastMethod(json) {
        return axios.post(`${API_URL}/api/forecastMethod`, json, {});
    }
    getForecastMethodTypeList() {
        return axios.get(`${API_URL}/api/forecastMethodType`, {
        });
    }
}
export default new ForecastMethodService();