import axios from "axios";
import { API_URL } from '../Constants.js';

class RealmService {

    addRealm(json) {
        console.log(json);
        return axios.post(`${API_URL}/api/realm/`, json, {}
        );
    }

    getRealmListAll() {
        return axios.get(`${API_URL}/api/realm/`, {
        });
    } 

    updateRealm(json) {
        return axios.put(`${API_URL}/api/realm/`, json, {
        });
    }


}
export default new RealmService();