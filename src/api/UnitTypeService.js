import axios from "axios";
import { API_URL } from '../Constants.js';

class UnitTypeSerice {

    addUniType(json) {
        return axios.post(`${API_URL}/api/unitType/`, json, {
        });
    }

    getUnitTypeListAll() {
        return axios.get(`${API_URL}/api/unitType/`, {
        });
    } 

    updateUnitType(json) {
        return axios.put(`${API_URL}/api/unitType/`, json, {
        });
    }
}

export default new UnitTypeSerice()