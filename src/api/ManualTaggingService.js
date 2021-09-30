import axios from "axios";
import { API_URL } from '../Constants.js';

class ManualTaggingSerice {

    getShipmentListForManualTagging(json) {
        return axios.post(`${API_URL}/api/program/manualTagging/`, json, {
        });
    }

    getShipmentLinkingNotification(json) {
        return axios.post(`${API_URL}/api/program/shipmentLinkingNotification/`, json, {
        });
    }

    updateNotification(json) {
        return axios.post(`${API_URL}/api/program/updateNotification/`, json, {
        });
    }

    getNotLinkedShipmentListForManualTagging(programId, linkingType) {
        return axios.get(`${API_URL}/api/program/manualTagging/notLinkedShipments/${programId}/${linkingType}`, {
        });
    }

    getARTMISHistory(orderNo, primeLineNo) {
        return axios.get(`${API_URL}/api/program/artmisHistory/${orderNo}/${primeLineNo}`, {
        });
    }

    getNotificationCount() {
        return axios.get(`${API_URL}/api/program/getNotificationCount`, {
        });
    }
    getOrderDetailsByOrderNoAndPrimeLineNo(roNoOrderNo, programId, erpPlanningUnitId, linkingType, parentShipmentId) {
        console.log("parentShipmentId----", parentShipmentId);
        return axios.get(`${API_URL}/api/program/orderDetails/${roNoOrderNo}/${programId}/${erpPlanningUnitId}/${linkingType}/${parentShipmentId}`, {
        });
    }
    linkShipmentWithARTMIS(json) {
        console.log("my json------", json);
        return axios.post(`${API_URL}/api/program/linkShipmentWithARTMIS/`, json, {}
        );
    }
    delinkShipment(shipmentId, notes, programId) {
        return axios.post(`${API_URL}/api/program/delinkShipment/`, { shipmentId, notes, programId }, {}
        );
    }
    getShipmentListForDelinking(programId, planningUnitId) {
        return axios.get(`${API_URL}/api/program/shipmentListForDelinking/${programId}/${planningUnitId}`, {
        });
    }

    searchErpOrderData(term, programId, erpPlanningUnitId, linkingType) {
        return axios.get(`${API_URL}/api/program/searchErpOrderData/${term}/${programId}/${erpPlanningUnitId}/${linkingType}`, {
        });
    }
    getShipmentDetailsByParentShipmentId(parentShipmentId) {
        return axios.post(`${API_URL}/api/program/getShipmentDetailsByParentShipmentId/`, { parentShipmentId }, {}
        );
    }

    getNotificationSummary() {
        return axios.get(`${API_URL}/api/program/getNotificationSummary/`, {
        });
    }

}

export default new ManualTaggingSerice()