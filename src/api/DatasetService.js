import axios from "axios"
import { API_URL } from '../Constants.js'

class DatasetService {
    getDatasetList() {
        return axios.get(`${API_URL}/api/dataset/`, {
        });
    }
    loadDataset() {
        return axios.get(`${API_URL}/api/loadDataset/`, {
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
    getDataSetDataById(programId) {
        return axios.get(`${API_URL}/api/dataset/${programId}`, {});
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

    getUsageTypeList() {
        return axios.get(`${API_URL}/api/usageType`, {
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

    getDatasetData(programId,versionId) {
        return axios.get(`${API_URL}/api/datasetData/programId/${programId}/versionId/${versionId}`, {
        });
    }

}
export default new DatasetService()