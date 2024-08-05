import axios from "axios";
import { API_URL } from '../Constants.js';
class IntegrationSerice {
    addIntegration(json) {
        return axios.post(`${API_URL}/api/integration`, json, {
        });
    }
    getIntegrationListAll() {
        return axios.get(`${API_URL}/api/integration`, {
        });
    }
    getIntegrationViewListAll() {
        return axios.get(`${API_URL}/api/integration/viewList`, {
        });
    }
    editIntegration(json) {
        return axios.put(`${API_URL}/api/integration`, json, {
        });
    }
    getIntegrationById(json) {
        return axios.get(`${API_URL}/api/integration/${json}`, {}
        );
    }
    addprogramIntegration(json) {
        return axios.put(`${API_URL}/api/integrationProgram`, json, {}
        );
    }
    getProgramIntegrationByProgramId(programId) {
        return axios.get(`${API_URL}/api/integrationProgram/program/${programId}`, {
        });
    }
    addManualJson(json) {
        return axios.post(`${API_URL}/api/integrationProgram/manualJson`, json, {
        });
    }
    reportForManualIntegration(json) {
        return axios.post(`${API_URL}/api/report/manualJson`, json, {
        });
    }
}
export default new IntegrationSerice()