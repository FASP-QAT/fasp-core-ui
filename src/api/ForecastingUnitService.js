import axios from "axios";
import {API_URL} from '../Constants.js';

class ForecastingUnitService{

addForecastingUnit(json){
return axios.post(`${API_URL}/api/forecastingUnit/`,json,{}
);
}

getForecastingUnitList() {
    return axios.get(`${API_URL}/api/forecastingUnit/`, {
    });
}

editForecastingUnit(json) {
    return axios.put(`${API_URL}/api/forecastingUnit/`, json, {
    });
}
}
export default new ForecastingUnitService();