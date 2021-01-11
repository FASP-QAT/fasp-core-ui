import axios from "axios";
import { API_URL } from '../Constants.js';

class RealmCountryService {

    addRealmCountry(json) {
        return axios.post(`${API_URL}/api/realmCountry/`, json, {}
        );
    }

    getRealmCountryListAll() {
        return axios.get(`${API_URL}/api/realmCountry/`, {
        });
    }

    getRealmCountryById(realmCountryId) {
        return axios.get(`${API_URL}/api/realmCountry/${realmCountryId}`, {
        });
    }
    getRealmCountryrealmIdById(realmId) {
        return axios.get(`${API_URL}/api/realmCountry/realmId/${realmId}`, {
        });
    }

    updateRealmCountry(json) {
        return axios.put(`${API_URL}/api/realmCountry/`, json, {
        });
    }
    getPlanningUnitCountryForId(realmCountryId) {
        return axios.get(`${API_URL}/api/realmCountry/${realmCountryId}/planningUnit`, {}
        );
    }
    editPlanningUnitCountry(json) {
        return axios.put(`${API_URL}/api/realmCountry/planningUnit`, json, {}
        );
    }
    getRealmCountryPlanningUnitAllByrealmCountryId(realmCountryId) {
        return axios.get(`${API_URL}/api/realmCountry/${realmCountryId}/planningUnit/all`, {}
        );
    }
    getRealmCountryPlanningUnitByProgramId(json) {
        return axios.put(`${API_URL}/api/realmCountry/programIds/planningUnit`, json, {}
        );
    }

    getRealmCountryForProgram(json) {
        console.log("json realm id------------------------------------", json);
        return axios.get(`${API_URL}/api/realmCountry/program/realmId/${json}`, {
        });
    }

    getRealmCountryProgram() {
        return axios.get(`${API_URL}/api/realmCountry/program`, {
        });
    }


}
export default new RealmCountryService();
