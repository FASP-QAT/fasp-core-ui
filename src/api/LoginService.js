import axios from "axios"
import {API_URL} from '../Constants.js'

class LoginService {



    authenticate(username, password) {
        return axios.post(`${API_URL}/authenticate`,{username, password},{});
    }

    
}

export default new LoginService()