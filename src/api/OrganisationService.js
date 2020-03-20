import axios from "axios";
import { API_URL } from '../Constants.js';

class OrganisationService {

    addOrganisation(json) {
        console.log(json);
        return axios.post(`${API_URL}/api/organisation/`, json, {}
        );
    }

    getOrganisationList() {
        return axios.get(`${API_URL}/api/organisation/`, {
        });
    }
    editOrganisation(json) {
        return axios.put(`${API_URL}/api/organisation/`, json, {}
        );
    }

}
export default new OrganisationService();