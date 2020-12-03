import axios from "axios";
import { API_URL } from '../Constants.js';

class ManualTaggingSerice {

    getShipmentListForManualTagging(programId, planningUnitId) {
        return axios.get(`${API_URL}/api/manualTagging/${programId}/${planningUnitId}`, {
        });
    }
    getOrderDetailsByOrderNoAndPrimeLineNo(roNoOrderNo, searchId, programId, erpPlanningUnitId) {
        return axios.get(`${API_URL}/api/orderDetails/${roNoOrderNo}/${searchId}/${programId}/${erpPlanningUnitId}`, {
        });
    }
    linkShipmentWithARTMIS(orderNo, primeLineNo, shipmentId, conversionFactor, programId) {
        return axios.post(`${API_URL}/api/linkShipmentWithARTMIS/`, { orderNo, primeLineNo, shipmentId, conversionFactor, programId }, {}
        );
    }
    delinkShipment(shipmentId, notes, programId) {
        return axios.post(`${API_URL}/api/delinkShipment/`, { shipmentId, notes, programId }, {}
        );
    }
    getShipmentListForDelinking(programId, planningUnitId) {
        return axios.get(`${API_URL}/api/shipmentListForDelinking/${programId}/${planningUnitId}`, {
        });
    }

    searchErpOrderData(term, searchId, programId, erpPlanningUnitId) {
        return axios.get(`${API_URL}/api/searchErpOrderData/${term}/${searchId}/${programId}/${erpPlanningUnitId}`, {
        });
    }

}

export default new ManualTaggingSerice()