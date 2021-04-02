import axios from "axios";
import { API_URL } from '../Constants.js';

class ManualTaggingSerice {

    getShipmentListForManualTagging(json) {
        return axios.post(`${API_URL}/api/manualTagging/`, json, {
        });
    }
    getOrderDetailsByOrderNoAndPrimeLineNo(roNoOrderNo,programId, erpPlanningUnitId) {
        return axios.get(`${API_URL}/api/orderDetails/${roNoOrderNo}/${programId}/${erpPlanningUnitId}`, {
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

    searchErpOrderData(term, programId, erpPlanningUnitId) {
        return axios.get(`${API_URL}/api/searchErpOrderData/${term}/${programId}/${erpPlanningUnitId}`, {
        });
    }

}

export default new ManualTaggingSerice()