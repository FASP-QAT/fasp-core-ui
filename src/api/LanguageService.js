import axios from "axios";
import { API_URL } from '../Constants.js';
class LanguageService {
    addLanguage(json) {
        return axios.post(`${API_URL}/api/language`, json, {
        });
    }
    getLanguageList() {
        return axios.get(`${API_URL}/api/language/all`, {
        });
    }
    getLanguageListActive() {
        return axios.get(`${API_URL}/api/language`, {
        });
    }
    editLanguage(json) {
        return axios.put(`${API_URL}/api/language`, json, {
        });
    }
    getLanguageById(json) {
        return axios.get(`${API_URL}/api/language/${json}`, {}
        );
    }
}
export default new LanguageService()