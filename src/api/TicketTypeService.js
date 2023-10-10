import axios from "axios";
import { API_URL } from '../Constants.js';
class TicketTypeService {
    getTicketTypeListAll() {
        return axios.get(`${API_URL}/api/ticketType/`, {
        });
    }
}
export default new TicketTypeService();