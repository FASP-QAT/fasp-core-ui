import axios from "axios";
import { API_URL } from '../Constants.js';

class ReportService {
    getForecastMatricsOverTime(realmCountryId,planningUnitId,startDate,stopDate) {
        return axios.get(`${API_URL}/api/forecastmatrics/${startDate}/${stopDate}/${realmCountryId}/${planningUnitId}`, {
        });
    }

}
export default new ReportService();