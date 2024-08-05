import axios from "axios";
import { API_URL } from '../Constants.js';
class CurrencyService {
    addCurrency(json) {
        return axios.post(`${API_URL}/api/currency`, json, {}
        );
    }
    getCurrencyList() {
        return axios.get(`${API_URL}/api/currency/all`, {
        });
    }
    getCurrencyListActive() {
        return axios.get(`${API_URL}/api/currency`, {
        });
    }
    editCurrency(json) {
        return axios.put(`${API_URL}/api/currency`, json, {}
        );
    }
    getCurrencyById(json) {
        return axios.get(`${API_URL}/api/currency/${json}`, {}
        );
    }
}
export default new CurrencyService();