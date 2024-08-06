import axios from "axios";
import { API_URL } from '../Constants.js';
class UserManualService {
    uploadUserManual(formData) {
        return axios.post(`${API_URL}/api/userManual/uploadUserManual`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
}
export default new UserManualService()