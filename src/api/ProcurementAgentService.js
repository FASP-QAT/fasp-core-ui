import axios from "axios";
import { API_URL } from '../Constants.js';
class ProcurementAgentService {
    addProcurementAgent(json) {
        return axios.post(`${API_URL}/api/procurementAgent`, json, {}
        );
    }
    getProcurementAgentListAll() {
        return axios.get(`${API_URL}/api/procurementAgent`, {
        });
    }
    updateProcurementAgent(json) {
        return axios.put(`${API_URL}/api/procurementAgent`, json, {
        });
    }
    getProcurementAgentPlaningUnitList(json) {
        return axios.get(`${API_URL}/api/procurementAgent/${json}/planningUnit/all`, {}
        );
    }
    getCountrySpecificPricesList(json) {
        return axios.get(`${API_URL}/api/program/planningUnit/procurementAgent/${json}`, {}
        );
    }
    addprocurementAgentPlanningUnitMapping(json) {
        return axios.put(`${API_URL}/api/procurementAgent/planningUnit`, json, {}
        );
    }
    savePlanningUnitProgramPriceForProcurementAgent(json) {
        return axios.put(`${API_URL}/api/program/planningingUnit/procurementAgent`, json, {}
        );
    }
    getProcurementAgentById(json) {
        return axios.get(`${API_URL}/api/procurementAgent/${json}`, {}
        );
    }
    addprocurementAgentProcurementUnitMapping(json) {
        return axios.put(`${API_URL}/api/procurementAgent/procurementUnit`, json, {}
        );
    }
    getProcurementAgentProcurementUnitList(json) {
        return axios.get(`${API_URL}/api/procurementAgent/${json}/procurementUnit/all`, {}
        );
    }
    getProcurementAgentDisplayName(json1, json2) {
        return axios.get(`${API_URL}/api/procurementAgent/getDisplayName/realmId/${json1}/name/${json2}`, {}
        );
    }
    addProcurementAgentType(json) {
        return axios.post(`${API_URL}/api/procurementAgentType`, json, {}
        );
    }
    getProcurementAgentTypeListAll() {
        return axios.get(`${API_URL}/api/procurementAgentType`, {
        });
    }
    getProcurementAgentTypeById(json) {
        return axios.get(`${API_URL}/api/procurementAgentType/${json}`, {}
        );
    }
    updateProcurementAgentType(json) {
        return axios.put(`${API_URL}/api/procurementAgentType`, json, {
        });
    }
    getProcurementAgentForProgram(json) {
        return axios.get(`${API_URL}/api/program/${json}/updateProcurementAgents`, {}
        );
    }
    updateProcurementAgentsForProgram(json, json1) {
        return axios.post(`${API_URL}/api/program/${json}/updateProcurementAgents`, json1, {
        });
    }
}
export default new ProcurementAgentService();
