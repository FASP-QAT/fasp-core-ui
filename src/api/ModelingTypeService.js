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
}
export default new ModelingTypeService();