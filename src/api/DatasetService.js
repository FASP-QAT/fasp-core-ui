import axios from "axios";
import { API_URL } from '../Constants.js';
class DatasetService {
    loadDataset() {
        return axios.get(`${API_URL}/api/loadDataset`, {
        });
    }
    loadMoreDatasetList(programId, page) {
        return axios.get(`${API_URL}/api/loadDataset/programId/${programId}/page/${page}`, {
        });
    }
    getAllDatasetData(json) {
        return axios.post(`${API_URL}/api/datasetData`, json, {
        });
    }
    getTreeTemplateList() {
        return axios.get(`${API_URL}/api/treeTemplate`, {
        });
    }
    getTreeTemplateById(treeTemplateId) {
        return axios.get(`${API_URL}/api/treeTemplate/${treeTemplateId}`, {
        });
    }
    getUsageTypeList() {
        return axios.get(`${API_URL}/api/master/usageType`, {
        });
    }
    addTreeTemplate(json) {
        return axios.post(`${API_URL}/api/treeTemplate`, json, {
        });
    }
    updateTreeTemplate(json) {
        return axios.put(`${API_URL}/api/treeTemplate`, json, {
        });
    }
    saveDatasetData(json, comparedVersionId) {
        return axios.put(`${API_URL}/api/datasetData/${comparedVersionId}`, json, {}
        );
    }
    getDatasetData(programId, versionId) {
        return axios.get(`${API_URL}/api/datasetData/programId/${programId}/versionId/${versionId}`, {
        });
    }
    getDatasetDataWithoutTree(programId, versionId) {
        return axios.get(`${API_URL}/api/datasetData/programId/${programId}/versionId/${versionId}/withoutTree`, {
        });
    }
}
export default new DatasetService()