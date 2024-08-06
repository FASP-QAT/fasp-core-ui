import axios from "axios";
import { API_URL } from '../Constants.js';
class LoginService {
    authenticate(username, password, languageCode, languageChanged) {
        return axios.post(`${API_URL}/authenticate`, { username, password, languageCode, languageChanged }, {});
    }
    getApiVersion() {
        return axios.get(`${API_URL}/actuator/info`, {
        });
    }
}
export default new LoginService()