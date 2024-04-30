import axios from "axios";
import { API_URL } from '../Constants.js';
class ManualTaggingSerice {
    getShipmentLinkingNotification(programId, versionId) {
        return axios.get(`${API_URL}/api/erpLinking/shipmentLinkingNotification/programId/${programId}/versionId/${versionId}`, {
        });
    }
    updateNotification(json) {
        return axios.put(`${API_URL}/api/erpLinking/updateNotification`, json, {
        });
    }
    getARTMISHistory(roNo, roPrimeLineNo) {
        return axios.get(`${API_URL}/api/erpLinking/artmisHistory/${roNo}/${roPrimeLineNo}`, {
        });
    }
    getNotificationCount() {
        return axios.get(`${API_URL}/api/erpLinking/getNotificationCount`, {
        });
    }
    getNotificationSummary() {
        return axios.get(`${API_URL}/api/erpLinking/getNotificationSummary`, {
        });
    }
    getNotLinkedQatShipments(programId, versionId, json) {
        return axios.post(`${API_URL}/api/erpLinking/notLinkedQatShipments/programId/${programId}/versionId/${versionId}`, json, {
        });
    }
    autocompleteDataOrderNo(json) {
        return axios.post(`${API_URL}/api/erpLinking/autoCompleteOrder`, json, {
        });
    }
    autocompletePlanningUnit(planningUnitId, term, programId, listToExclude) {
        var json = {
            planningUnitId: planningUnitId,
            puName: term,
            programId: programId,
            delinkedList: listToExclude
        }
        return axios.post(`${API_URL}/api/erpLinking/autoCompletePu`, json, {
        });
    }
    getOrderDetails(json) {
        return axios.post(`${API_URL}/api/erpLinking/notLinkedErpShipments`, json, {
        });
    }
    getShipmentListForTab3(json) {
        return axios.post(`${API_URL}/api/erpLinking/notLinkedErpShipments/tab3`, json, {
        });
    }
    getLinkedQatShipments(programId, versionId, json) {
        return axios.post(`${API_URL}/api/erpLinking/linkedShipments/programId/${programId}/versionId/${versionId}`, json, {
        });
    }
    getDataBasedOnRoNoAndRoPrimeLineNo(json) {
        return axios.post(`${API_URL}/api/erpLinking/batchDetails`, json, {
        });
    }
}
export default new ManualTaggingSerice()