import axios from "axios";
import { API_URL } from '../Constants.js';

class CurrencyService {

    addCurrency(json) {
        return axios.put(`${API_URL}/api/addCurrency/`, json, {}
        );
    }

    getCurrencyList() {
        return axios.get(`${API_URL}/api/getCurrencyList/`, {
        });
    }
    
    getCurrencyListActive() {
        return axios.get(`${API_URL}/api/getCurrencyListActive/`, {
        });
    }
    editCurrency(json) {
        return axios.put(`${API_URL}/api/editCurrency/`, json, {}
        );
    }
}
export default new CurrencyService();