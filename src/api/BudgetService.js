import axios from "axios";
import { API_URL } from '../Constants.js';
class BudgetService {
    addBudget(json) {
        return axios.post(`${API_URL}/api/budget`, json, {}
        );
    }
    getBudgetList() {
        return axios.get(`${API_URL}/api/budget`, {
        });
    }
    editBudget(json) {
        return axios.put(`${API_URL}/api/budget`, json, {}
        );
    }
    getBudgetDataById(json) {
        return axios.get(`${API_URL}/api/budget/${json}`, {}
        );
    }
}
export default new BudgetService();