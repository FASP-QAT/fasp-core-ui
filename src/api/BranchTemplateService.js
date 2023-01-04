import axios from "axios"
import { API_URL } from '../Constants.js'
class BranchTemplateService {
    getBranchTemplateList() {
        return axios.get(`${API_URL}/api/treeTemplate/branch/`, {
        });
    }
}
export default new BranchTemplateService()