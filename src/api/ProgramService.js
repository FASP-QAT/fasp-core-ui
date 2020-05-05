import axios from "axios"
import { API_URL } from '../Constants.js'

class ProgramService {
    getProgramData(json) {
        console.log("Json",json)
        return axios.get(`${API_URL}/api/programData/programId/${json.programId}/versionId/${json.versionId}`, {
        });
    }

    getProgramList() {
        return axios.get(`${API_URL}/api/program/`, {
        });
    }

    getProgramListForDropDown() {
        return axios.get(`${API_URL}/api/getProgramList/`, {
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

    getProgramProductListByProgramId(json) {
        return axios.get(`${API_URL}/api/programProduct/${json}`, {}
        );
    }
    getProgramPlaningUnitListByProgramId(json) {
        return axios.get(`${API_URL}/api/program/${json}/planningUnit/all/`, {}
        );
    }
    addProgramProductMapping(json) {
        return axios.put(`${API_URL}/api/programProduct/`, json, {}
        );
    }
    addprogramPlanningUnitMapping(json) {
        return axios.put(`${API_URL}/api/program/planningUnit/`, json, {}
        );
    }
    getProgramById(json) {
        return axios.get(`${API_URL}/api/program/${json}`, {}
        );
    }

    getProgramManagerList(json) {
        return axios.get(`${API_URL}/api/user/realmId/${json}`, {}
        );
    }

    getProgramByRealmId(json) {
        return axios.get(`${API_URL}/api/program/realmId/${json}`, {}
        );
    }
    getProgramPlaningUnitListByProgramAndProductCategory(programId,ProductCategoryId) {
        return axios.get(`${API_URL}/api/program/${programId}/${ProductCategoryId}/planningUnit/all/`, {}
        );
    }
}
export default new ProgramService()