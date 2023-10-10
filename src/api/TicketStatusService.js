import axios from "axios";
import { API_URL } from '../Constants.js';
class TicketStatusService {
    getTicketStatusListAll() {
        return axios.get(`${API_URL}/api/ticketStatus/`, {
        });
    }
}
export default new TicketStatusService();