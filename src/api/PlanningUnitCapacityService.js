import axios from "axios";
import { API_URL } from '../Constants.js';
class PlanningUnitCapacityService {
    getPlanningUnitCapacityList(json) {
        return axios.get(`${API_URL}/api/planningUnit/capacity/all`, {}
        );
    }
}
export default new PlanningUnitCapacityService();
