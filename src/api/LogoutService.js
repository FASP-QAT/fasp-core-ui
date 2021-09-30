import axios from "axios";
import { API_URL } from '../Constants.js';

class LogoutService {

    logout() {
        return axios.get(`${API_URL}/api/user/logout/`, {}
        );
    }    

}
export default new LogoutService();