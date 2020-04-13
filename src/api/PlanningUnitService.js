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
        return axios.put(`${API_URL}/api/planningUnit/`, json, {}
        );
    }
    getPlanningUnitById(json) {
        return axios.get(`${API_URL}/api/planningUnit/${json}`, {}
        );
    }

    getPlanningUnitCapacityForId(planningUnitId) {
        return axios.get(`${API_URL}/api/planningUnit/${planningUnitId}/capacity/`, {}
        );
<<<<<<< HEAD
=======

>>>>>>> planning unit capacity
    }

    editPlanningUnitCapacity(json){
        return axios.put(`${API_URL}/api/planningUnit/capacity`, json, {}
        );
    }
}
export default new PlanningUnitService();
