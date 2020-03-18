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

    getRealmCountryList(json) {
        return axios.get(`${API_URL}/api/realmCountry/realmId/${json}`, {}
        );
        
    }
    getOrganisationList(json) {
        return axios.get(`${API_URL}/api/organisation/realmId/${json}`, {}
        );
    }
    getHealthAreaList(json) {
        return axios.get(`${API_URL}/api/healthArea/realmId/${json}`, {}
        );
    }
    getRegionList(json) {
        return axios.get(`${API_URL}/api/region/realmCountryId/${json}`, {}
        );
    }
}
export default new ProgramService()