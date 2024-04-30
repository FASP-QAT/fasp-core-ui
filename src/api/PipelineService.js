import axios from "axios";
import { API_URL } from '../Constants.js';
class PipelineService {
    savePipelineJson(json, fileName) {
        return axios.post(`${API_URL}/api/pipelineJson/${fileName}`, json, {}
        );
    }
    getPipelineProgramList() {
        return axios.get(`${API_URL}/api/pipeline`, {
        });
    }
    getPipelineProgramDataById(json) {
        return axios.get(`${API_URL}/api/pipeline/programInfo/${json}`, {}
        );
    }
    addProgramToQatTempTable(json, pipelineId) {
        return axios.post(`${API_URL}/api/qatTemp/program/${pipelineId}`, json, {}
        );
    }
    getQatTempPorgramByPipelineId(json) {
        return axios.get(`${API_URL}/api/qatTemp/program/${json}`, {}
        );
    }
    getShipmentDataById(json) {
        return axios.get(`${API_URL}/api/pipeline/shipment/${json}`, {}
        );
    }
    addProgramToQatTempPlanningUnits(json, pipelineId) {
        return axios.put(`${API_URL}/api/pipeline/planningUnit/${pipelineId}`, json, {}
        );
    }
    getQatTempPlanningUnitList(json) {
        return axios.get(`${API_URL}/api/qatTemp/planningUnitList/${json}`, {}
        );
    }
    getQatTempProgramregion(json) {
        return axios.get(`${API_URL}/api/qatTemp/regions/${json}`, {}
        );
    }
    addQatTempConsumption(json, pipelineId) {
        return axios.put(`${API_URL}/api/pipeline/consumption/${pipelineId}`, json, {}
        );
    }
    getQatTempConsumptionById(json) {
        return axios.get(`${API_URL}/api/qatTemp/consumption/${json}`, {}
        );
    }
    submitShipmentData(pipelineId, json) {
        return axios.post(`${API_URL}/api/pipeline/shipment/${pipelineId}`, json, {}
        );
    }
    getPipelineProgramInventory(json) {
        return axios.get(`${API_URL}/api/pipeline/inventory/${json}`, {}
        );
    }
    addQatTempInventory(json, pipelineId) {
        return axios.put(`${API_URL}/api/pipeline/inventory/${pipelineId}`, json, {}
        );
    }
    getPlanningUnitListWithFinalInventry(json) {
        return axios.get(`${API_URL}/api/qatTemp/planningUnitListFinalInventry/${json}`, {}
        );
    }
    submitProgram(pipelineId) {
        return axios.post(`${API_URL}/api/pipeline/programdata/${pipelineId}`, {}
        );
    }
    getQatTempDataSourceList(json) {
        return axios.get(`${API_URL}/api/qatTemp/datasource/${json}`, {}
        );
    }
    addProgramToQatTempDataSource(json, pipelineId) {
        return axios.put(`${API_URL}/api/pipeline/datasource/${pipelineId}`, json, {}
        );
    }
    getQatTempFundingSourceList(json) {
        return axios.get(`${API_URL}/api/qatTemp/fundingsource/${json}`, {}
        );
    }
    addQatTempFundingSource(json, pipelineId) {
        return axios.put(`${API_URL}/api/pipeline/fundingsource/${pipelineId}`, json, {}
        );
    }
    getQatTempProcurementAgentList(json) {
        return axios.get(`${API_URL}/api/qatTemp/procurementagent/${json}`, {}
        );
    }
    addQatTempProcurementAgent(json, pipelineId) {
        return axios.put(`${API_URL}/api/pipeline/procurementagent/${pipelineId}`, json, {}
        );
    }
    createRealmCountryPlanningUnits(pipelineId, realmCountryId) {
        return axios.put(`${API_URL}/api/pipeline/realmCountryPlanningUnit/${pipelineId}/${realmCountryId}`, {}
        );
    }
}
export default new PipelineService();
