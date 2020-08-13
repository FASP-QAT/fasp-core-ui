import axios from "axios";
import { API_URL } from '../Constants.js';

class ManualTaggingSerice {

    getShipmentListForManualTagging(programId, planningUnitId) {
        return axios.get(`${API_URL}/api/manualTagging/${programId}/${planningUnitId}`, {
        });
    }
    getOrderDetailsByOrderNoAndPrimeLineNo(orderNo, primeLineNo) {
        return axios.get(`${API_URL}/api/orderDetails/${orderNo}/${primeLineNo}`, {
        });
    }
    linkShipmentWithARTMIS(orderNo, primeLineNo, shipmentId) {
        return axios.post(`${API_URL}/api/linkShipmentWithARTMIS/`, { orderNo, primeLineNo, shipmentId }, {}
        );
    }
    delinkShipment(shipmentId) {
        return axios.post(`${API_URL}/api/delinkShipment/`, { shipmentId }, {}
        );
    }
    getShipmentListForDelinking(programId, planningUnitId) {
        return axios.get(`${API_URL}/api/shipmentListForDelinking/${programId}/${planningUnitId}`, {
        });
    }

}

export default new ManualTaggingSerice()