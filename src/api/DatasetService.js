import axios from "axios"
import { API_URL } from '../Constants.js'

class DatasetService {
    getDatasetList() {
        return axios.get(`${API_URL}/api/dataset/`, {
        });
    }
    loadDataset(){
        return axios.get(`${API_URL}/api/loadDataset/`, {
        });
    }
    loadMoreDatasetList(programId, page){
        return axios.get(`${API_URL}/api/loadDataset/programId/${programId}/page/${page}`, {
        });
    }
    getAllDatasetData(json) {
        return axios.post(`${API_URL}/api/datasetData`, json, {
        });
    }
    getDataSetDataById(programId){
        return axios.get(`${API_URL}/api/dataset/${programId}`,{});
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