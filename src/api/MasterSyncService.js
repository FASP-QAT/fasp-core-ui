import axios from "axios";
import { API_URL } from '../Constants.js';
class MasterSyncService {
    getLanguageListForSync(lastSyncDate) {
        return axios.get(`${API_URL}/api/sync/language/${lastSyncDate}`, {
        });
    }
    syncProgram(programId, versionId, userId, lastSyncDate) {
        return axios.get(`${API_URL}/api/programData/shipmentSync/programId/${programId}/versionId/${versionId}/userId/${userId}/lastSyncDate/${lastSyncDate}`, {
        });
    }
    getSyncAllMastersForProgram(lastSyncDate, programIds) {
        return axios.post(`${API_URL}/api/sync/allMasters/forPrograms/${lastSyncDate}`, programIds, {
        });
    }
    getNewShipmentSyncApi(json){
        return axios.post(`${API_URL}/api/erpLinking/shipmentSync`,json, {
        });
    }
}
export default new MasterSyncService()