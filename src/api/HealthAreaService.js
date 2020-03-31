import axios from "axios";
import { API_URL } from "../Constants";
class HealthAreaService {
    getRealmList() {
        return axios.get(`${API_URL}/api/realm`, {
        });
    }
    getHealthAreaList() {
        return axios.get(`${API_URL}/api/healthArea/`, {
        });
    }
}
export default new HealthAreaService()