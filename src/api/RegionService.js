import axios from "axios";
import { API_URL } from '../Constants.js';
class RegionService {
    addRegion(json) {
        return axios.put(`${API_URL}/api/region`, json, {}
        );
    }
    getRegionList() {
        return axios.get(`${API_URL}/api/region`, {
        });
    }
    updateRegion(json) {
        return axios.put(`${API_URL}/api/region`, json, {}
        );
    }
    getRegionById(json) {
        return axios.get(`${API_URL}/api/region/${json}`, {}
        );
    }
    getRegionForCountryId(realmCountryId) {
        return axios.get(`${API_URL}/api/region/realmCountryId/${realmCountryId}`, {}
        );
    }
    editRegionsForcountry(json) {
        return axios.put(`${API_URL}/api/region`, json, {});
    }
}
export default new RegionService();