import axios from "axios";
import { API_URL } from '../Constants.js';

class TicketService {

    // addUnit(json) {
    //     return axios.post(`${API_URL}/api/unit/`, json, {
    //     });
    // }

    getTicketListAll() {
        return axios.get(`${API_URL}/api/ticket/`, {
        });
    } 

    updateticket(json) {
        return axios.put(`${API_URL}/api/ticket/`, json, {
        });
    }
}

export default new TicketService();