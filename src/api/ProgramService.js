import axios from "axios"
import { API_URL } from '../Constants.js'

class ProgramService {
    getProgramData(programId) {
        console.log(programId)
        return axios.get(`${API_URL}/api/getProgramData?programId=${programId}`, {
        });
    }

    getProgramList() {
        return axios.get(`${API_URL}/api/program/`, {
        });
    }

    addProgram(json) {
        return axios.post(`${API_URL}/api/program/`, json, {}
        );
    }

    editProgram(json) {
        return axios.put(`${API_URL}/api/program/`, json, {}
        );
    }
}
export default new ProgramService()