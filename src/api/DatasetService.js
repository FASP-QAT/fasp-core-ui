import axios from "axios"
import { API_URL } from '../Constants.js'

class DatasetService {
    getDatasetList() {
        return axios.get(`${API_URL}/api/dataset/`, {
        });
    }
    getDataSetDataById(programId){
        return axios.get(`${API_URL}/api/dataset/${programId}`,{});
    }
}
export default new DatasetService()