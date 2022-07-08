import axios from "axios";
import { API_URL } from '../Constants.js';

class ManualTaggingSerice {

    getShipmentListForManualTagging(json) {
        return axios.post(`${API_URL}/api/manualTagging/`, json, {
        });
    }

    getShipmentLinkingNotification(json) {
        return axios.post(`${API_URL}/api/shipmentLinkingNotification/`, json, {
        });
    }

    updateNotification(json) {
        return axios.post(`${API_URL}/api/updateNotification/`, json, {
        });
    }

    getNotLinkedShipmentListForManualTagging(programId, linkingType) {
        return axios.get(`${API_URL}/api/manualTagging/notLinkedShipments/${programId}/${linkingType}`, {
        });
    }

    getARTMISHistory(orderNo, primeLineNo) {
        return axios.get(`${API_URL}/api/erpLinking/artmisHistory/${orderNo}/${primeLineNo}`, {
        });
    }

    getNotificationCount() {
        return axios.get(`${API_URL}/api/getNotificationCount`, {
        });
    }
    getOrderDetailsByOrderNoAndPrimeLineNo(roNoOrderNo, programId, erpPlanningUnitId, linkingType, parentShipmentId) {
        console.log("parentShipmentId----", parentShipmentId);
        return axios.get(`${API_URL}/api/orderDetails/${roNoOrderNo}/${programId}/${erpPlanningUnitId}/${linkingType}/${parentShipmentId}`, {
        });
    }
    linkShipmentWithARTMIS(json) {
        console.log("my json------", json);
        return axios.post(`${API_URL}/api/linkShipmentWithARTMIS/`, json, {}
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

    searchErpOrderData(term, programId, erpPlanningUnitId, linkingType) {
        return axios.get(`${API_URL}/api/searchErpOrderData/${term}/${programId}/${erpPlanningUnitId}/${linkingType}`, {
        });
    }
    getShipmentDetailsByParentShipmentId(parentShipmentId) {
        return axios.post(`${API_URL}/api/getShipmentDetailsByParentShipmentId/`, { parentShipmentId }, {}
        );
    }

    getNotificationSummary() {
        return axios.get(`${API_URL}/api/getNotificationSummary/`, {
        });
    }

    getNotLinkedQatShipments(programId, versionId, json) {
        console.log('Json@@@@@@@@@', json)
        return axios.post(`${API_URL}/api/erpLinking/notLinkedQatShipments/programId/${programId}/versionId/${versionId}`, json, {
        });
    }

    autocompleteDataOrderNo(roNo, programId, erpPlanningUnit) {
        return axios.get(`${API_URL}/api/erpLinking/autoCompleteOrder/${programId}/${erpPlanningUnit}/${roNo}`, {
        });
    }

    autocompletePlanningUnit(planningUnitId, term) {
        var json={
            planningUnitId:planningUnitId,
            puName:term
        }
        return axios.post(`${API_URL}/api/erpLinking/autoCompletePu`, json,{
        });
    }

    getOrderDetails(json) {
        return axios.post(`${API_URL}/api/erpLinking/notLinkedErpShipments/tab1`, json, {
        });
    }

    getShipmentListForTab3(json) {
        return axios.post(`${API_URL}/api/erpLinking/notLinkedErpShipments/tab3`, json, {
        });
    }

    getLinkedQatShipments(programId, versionId, json) {
        console.log('Json@@@@@@@@@', json)
        return axios.post(`${API_URL}/api/erpLinking/linkedShipments/programId/${programId}/versionId/${versionId}`, json, {
        });
    }

    getDataBasedOnRoNoAndRoPrimeLineNo(json) {
        return axios.post(`${API_URL}/api/erpLinking/batchDetails`, json, {
        });
    }

}

export default new ManualTaggingSerice()