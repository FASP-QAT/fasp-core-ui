import axios from "axios";
import { API_URL } from '../Constants.js';

class UnitTypeSerice {

    addUniType(json) {
        return axios.put(`${API_URL}/api/addUnitType/`, json, {
        });
    }

    getUnitTypeListAll() {
        return axios.get(`${API_URL}/api/unitTypeList/`, {
        });
    } 

    updateUnitType(json) {
        return axios.put(`${API_URL}/api/editUnitType/`, json, {
        });
    }
}

export default new UnitTypeSerice()