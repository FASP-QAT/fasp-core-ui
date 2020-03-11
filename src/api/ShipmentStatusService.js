import axios from "axios";
import { API_URL } from '../Constants.js';

class ShipmentStatusService{

    addShipmentStatus(json) {
        return axios.put(`${API_URL}/api/addShipmentStatus/`, json, {}
        );
    }

    getShipmentStatusListAll(){
        return axios.get(`${API_URL}/api/getShipmentStatusListAll/`, {
        });
    }
    getShipmentStatusListActive(){
        return axios.get(`${API_URL}/api/getShipmentStatusListActive/`, {
        });
    }
    editShipmentStatus(json) {
        return axios.put(`${API_URL}/api/editShipmentStatus/`, json, {
        });
    }

}
export default new ShipmentStatusService();