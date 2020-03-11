import axios from "axios"
import {API_URL} from '../Constants.js'

class LoginService {



    authenticate(username, password) {
        console.log("username---"+username);
        console.log("password---"+password);
        return axios.post(`${API_URL}/authenticate`,{username, password},{});
    }

    
}

export default new LoginService()