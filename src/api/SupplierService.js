import axios from "axios";
import { API_URL } from '../Constants.js';
class ManufaturerService {
    getSupplierListAll() {
        return axios.get(`${API_URL}/api/supplier/`, {
        });
    }
}
export default new ManufaturerService();