import axios from "axios";
import { API_URL } from '../Constants.js';
class PlanningUnitDraftService {
    getDraftPlanningUnits(json) {
        return axios.get(`${API_URL}/api/planningUnit/draft`, json, {}
        );
    }
}
export default new PlanningUnitDraftService();
