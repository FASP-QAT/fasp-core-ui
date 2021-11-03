import axios from "axios";
import { API_URL } from '../Constants.js';

class ModelingTypeService {

    getModelingTypeList() {
        return axios.get(`${API_URL}/api/modelingType/all`, {
        });
    }

    getModelingTypeListActive() {
        return axios.get(`${API_URL}/api/modelingType`, {
        });
    }

    addUpdateModelingType(json) {
        return axios.post(`${API_URL}/api/modelingType`, json, {});
    }

}
export default new ModelingTypeService();