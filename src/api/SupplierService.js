import axios from "axios";
import { API_URL } from '../Constants.js';

class ManufaturerService {

    addSupplier(json) {
        return axios.post(`${API_URL}/api/supplier/`, json, {}
        );
    }

    getSupplierListAll() {
        return axios.get(`${API_URL}/api/supplier/`, {
        });
    } 

    updateSupplier(json) {
        return axios.put(`${API_URL}/api/supplier/`, json, {
        });
    }

}
export default new ManufaturerService();