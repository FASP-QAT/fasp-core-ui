import axios from "axios";
import { API_URL } from '../Constants.js';

class OrganisationService {

    addOrganisation(json) {
        console.log("ORGANISATION-------------------->2" + JSON.stringify(json));
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

    getRealmCountryList(json) {
        return axios.get(`${API_URL}/api/realmCountry/realmId/${json}`, {}
        );
    }

    getOrganisationById(json) {
        return axios.get(`${API_URL}/api/organisation/${json}`, {}
        );
    }

    getOrganisationDisplayName(json1, json2) {
        return axios.get(`${API_URL}/api/organisation/getDisplayName/realmId/${json1}/name/${json2}`, {}
        );
    }

}
export default new OrganisationService();