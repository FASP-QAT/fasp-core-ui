import axios from "axios"
import { API_URL } from '../Constants.js'

class DatasetService {
    getDatasetList() {
        return axios.get(`${API_URL}/api/dataset/`, {
        });
    }
    getTreeTemplateList() {
        return axios.get(`${API_URL}/api/treeTemplate/`, {
        });
    }
    getTreeTemplateById(treeTemplateId) {
        return axios.get(`${API_URL}/api/treeTemplate/${treeTemplateId}`, {
        });
    }
    getNodeTypeList() {
        return axios.get(`${API_URL}/api/nodeType`, {
        });
    }
    
}
export default new DatasetService()