import axios from "axios";
import { API_URL } from '../Constants.js';
class ShipmentStatusService {
    getShipmentStatusListActive() {
        return axios.get(`${API_URL}/api/getShipmentStatusListActive`, {
        });
    }
}
export default new ShipmentStatusService();