import axios from "axios";
import { API_URL } from '../Constants.js';
class DataSourceTypeService {
    addDataSourceType(json) {
        return axios.post(`${API_URL}/api/dataSourceType`, json, {}
        );
    }
    getDataSourceTypeList() {
        return axios.get(`${API_URL}/api/dataSourceType/all`, {
        });
    }
    getDataSourceTypeListActive() {
        return axios.get(`${API_URL}/api/dataSourceType`, {
        });
    }
    editDataSourceType(json) {
        return axios.put(`${API_URL}/api/dataSourceType`, json, {
        });
    }
    getDataSourceTypeById(json) {
        return axios.get(`${API_URL}/api/dataSourceType/${json}`, {}
        );
    }
    getDataSourceTypeByRealmId(json) {
        return axios.get(`${API_URL}/api/dataSourceType/realmId/${json}`, {}
        );
    }
}
export default new DataSourceTypeService();