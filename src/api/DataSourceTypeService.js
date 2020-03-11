import axios from "axios";
import {API_URL} from '../Constants.js';

class DataSourceTypeService{

addDataSourceType(json){
return axios.put(`${API_URL}/api/addDataSourceType/`,json,{}
);
}

getDataSourceTypeList() {
    return axios.get(`${API_URL}/api/getDataSourceTypeList/`, {
    });
}

getDataSourceTypeListActive() {
    return axios.get(`${API_URL}/api/getDataSourceTypeListActive/`, {
    });
}

editDataSourceType(json) {
    return axios.put(`${API_URL}/api/editDataSourceType/`, json, {
    });
}
}
export default new DataSourceTypeService();