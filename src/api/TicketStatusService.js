import axios from "axios";
import { API_URL } from '../Constants.js';

class TicketStatusService {

    // addUnit(json) {
    //     return axios.post(`${API_URL}/api/unit/`, json, {
    //     });
    // }

    getTicketStatusListAll() {
        return axios.get(`${API_URL}/api/ticketStatus/`, {
        });
    } 

    // updateticket(json) {
    //     return axios.put(`${API_URL}/api/ticket/`, json, {
    //     });
    // }
}

export default new TicketStatusService();