import axios from "axios";
import { API_URL } from '../Constants.js';
class ExtrapolationService {
    tes(json) {
        return axios.post(`${API_URL}/api/forecastStats/tes`, json, {}
        );
    }
    arima(json) {
        return axios.post(`${API_URL}/api/forecastStats/arima`, json, {}
        );
    }
}
export default new ExtrapolationService();