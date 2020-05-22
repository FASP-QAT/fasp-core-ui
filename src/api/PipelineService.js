import axios from "axios"
import { API_URL } from '../Constants.js'

class PipelineService {
    savePipelineJson(json) {
        return axios.post(`${API_URL}/api/pipelineJson/`, json, {}
        );
    }
    getPipelineProgramList() {
        return axios.get(`${API_URL}/api/pipeline/`, {
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

    getPipelineProductListById(json){
        return axios.get(`${API_URL}/api/pipeline/product/${json}`, {}
        );
    }
    
    getShipmentDataById(json) {
        return axios.get(`${API_URL}/api/pipeline/shipment/${json}`, {}
        );
    }
}

export default new PipelineService();