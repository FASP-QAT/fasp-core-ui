import axios from "axios";
import { API_URL } from '../Constants.js';
class ManufaturerService {
    getSupplierListAll() {
        return axios.get(`${API_URL}/api/supplier`, {
        });
    }
    addSupplier(json) {
        return axios.post(`${API_URL}/api/supplier`, json, {}
        );
    }
    updateSupplier(json) {
        return axios.put(`${API_URL}/api/supplier`, json, {
        });
    }
    getSupplierById(json) {
        return axios.get(`${API_URL}/api/supplier/${json}`, {}
        );
    }
}
export default new ManufaturerService();