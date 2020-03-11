import axios from "axios";
import { API_URL } from '../Constants.js';

class ManufacturerService {

    addManufacturer(json) {
        //console.log(json);
        return axios.post(`${API_URL}/api/manufacturer/`, json, {}
        );
    }

    getManufacturerListAll() {
        return axios.get(`${API_URL}/api/manufacturer/`, {
        });
    } 

    updateManufacturer(json) {
        return axios.put(`${API_URL}/api/manufacturer/`, json, {
        });
    }


}
export default new ManufacturerService();