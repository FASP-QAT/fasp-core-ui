import axios from "axios";
import {API_URL} from '../Constants.js'
class LanguageService{

addLanguage(json){
    return axios.put(`${API_URL}/api/addLanguage/`, json, {
    });
}

getLanguageList() {
    return axios.get(`${API_URL}/api/getLanguageListAll/`, {
    });
}
getLanguageListActive() {
    return axios.get(`${API_URL}/api/getLanguageList/`, {
    });
}
editLanguage(json) {
    return axios.put(`${API_URL}/api/editLanguage/`, json, {
    });
}

}

export default new LanguageService()