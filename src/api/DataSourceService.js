import axios from "axios";
import { API_URL } from '../Constants.js';

class DataSourceService {

    addDataSource(json) {
        return axios.put(`${API_URL}/api/addDataSource/`, json, {}
        );
    }

    getDataSourceList() {
        return axios.get(`${API_URL}/api/getDataSourceList/`, {
        });
    }

    editDataSource(json) {
        return axios.put(`${API_URL}/api/editDataSource/`,json,{}
            );
        }
    
}
export default new DataSourceService();