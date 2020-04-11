import axios from "axios";
import { API_URL } from '../Constants.js';

class PlanningUnitService {

    addPlanningUnit(json) {
        return axios.post(`${API_URL}/api/planningUnit/`, json, {}
        );
    }

    getActivePlanningUnitList() {
        return axios.get(`${API_URL}/api/planningUnit/`, {
        });
    }
    getAllPlanningUnitList() {
        return axios.get(`${API_URL}/api/planningUnit/all`, {
        });
    }

    editPlanningUnit(json) {
        return axios.put(`${API_URL}/api/planningUnit/`,json,{}
            );
        }
    
}
export default new PlanningUnitService();