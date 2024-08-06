import axios from "axios";
import { API_URL } from '../Constants.js';
class OrganisationTypeService {
    addOrganisationType(json) {
        return axios.post(`${API_URL}/api/organisationType`, json, {}
        );
    }
    getOrganisationTypeList() {
        return axios.get(`${API_URL}/api/organisationType/all`, {
        });
    }
    editOrganisationType(json) {
        return axios.put(`${API_URL}/api/organisationType`, json, {}
        );
    }
    getOrganisationTypeByRealmId(json) {
        return axios.get(`${API_URL}/api/organisationType/realmId/${json}`, {}
        );
    }
    getOrganisationTypeById(json) {
        return axios.get(`${API_URL}/api/organisationType/${json}`, {}
        );
    }
}
export default new OrganisationTypeService();