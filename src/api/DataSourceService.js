import axios from "axios";
import { API_URL } from '../Constants.js';

class DataSourceService {

    addDataSource(json) {
        return axios.post(`${API_URL}/api/dataSource/`, json, {}
        );
    }

    getDataSourceList() {
        return axios.get(`${API_URL}/api/dataSource/`, {
        });
    }

    editDataSource(json) {
        return axios.put(`${API_URL}/api/dataSource/`,json,{}
            );
        }
    
}
export default new DataSourceService();