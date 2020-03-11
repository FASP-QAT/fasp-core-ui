import axios from "axios";
import { API_URL } from '../Constants.js';

class TicketTypeService {

    // addUnit(json) {
    //     return axios.post(`${API_URL}/api/unit/`, json, {
    //     });
    // }

    getTicketTypeListAll() {
        return axios.get(`${API_URL}/api/ticketType/`, {
        });
    } 

    // updateticket(json) {
    //     return axios.put(`${API_URL}/api/ticketType/`, json, {
    //     });
    // }
}

export default new TicketTypeService();