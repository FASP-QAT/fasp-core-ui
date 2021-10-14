import axios from "axios"
import { API_URL } from '../Constants.js'

class ProgramService {
    getProgramData(json) {
        console.log("Json", json)
        return axios.get(`${API_URL}/api/programData/programId/${json.programId}/versionId/${json.versionId}`, {
        });
    }

    getAllProgramData(json) {
        return axios.post(`${API_URL}/api/programData`, json, {
        });
    }

    getProgramList() {
        return axios.get(`${API_URL}/api/program/`, {
        });
    }
    getProgramListAll() {
        return axios.get(`${API_URL}/api/program/all`, {
        });
    }
    loadProgramList() {
        return axios.get(`${API_URL}/api/loadProgram/`, {
        });
    }
    loadMoreProgramList(programId, page) {
        return axios.get(`${API_URL}/api/loadProgram/programId/${programId}/page/${page}`, {
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

    saveProgramData(json) {
        return axios.put(`${API_URL}/api/programData/`, json, {}
        );
    }

    getProgramPlaningUnitListByProgramAndProductCategory(programId, ProductCategoryId) {
        return axios.get(`${API_URL}/api/program/${programId}/${ProductCategoryId}/planningUnit/all/`, {}
        );
    }

    programInitialize(json) {
        return axios.post(`${API_URL}/api/program/initialize/`, json, {}
        );
    }

    pipelineProgramDataImport() {
        return axios.post(`${API_URL}/api/pipeline/programsetup`, {}
        );
    }
    getVersionStatusList() {
        return axios.get(`${API_URL}/api/versionStatus`, {}
        );
    }
    updateProgramStatus(json, reviewedProblemList) {

        var obj = {
            reviewedProblemList: reviewedProblemList,
            notes: json.currentVersion.notes
        }

        return axios.put(`${API_URL}/api/programVersion/programId/${json.programId}/versionId/${json.currentVersion.versionId}/versionStatusId/${json.currentVersion.versionStatus.id}/`, obj, {}
        );
    }

    getVersionTypeList() {
        return axios.get(`${API_URL}/api/versionType`, {}
        );
    }

    checkOrderNumberAndLineNumber(orderNo, primeLineNo, realmCountryId, planningUnitId) {
        return axios.get(`${API_URL}/api/programData/checkErpOrder/orderNo/${orderNo}/primeLineNo/${primeLineNo}/realmCountryId/${realmCountryId}/planningUnitId/${planningUnitId}`, {}
        );

    }

    getProgramDisplayNameUniqueStatus(realmId, programId, programCode) {
        return axios.get(`${API_URL}/api/program/validate/realmId/${realmId}/programId/${programId}/programCode/${programCode}`, {}
        );
    }
    checkNewerVersions(json) {
        console.log("json----------------------------", json);
        return axios.post(`${API_URL}/api/programData/checkNewerVersions/`, json, {}
        );

    }
    getHealthAreaListByRealmCountryId(json) {
        return axios.get(`${API_URL}/api/healthArea/realmCountryId/${json}`, {}
        );
    }

    getOrganisationListByRealmCountryId(json) {
        return axios.get(`${API_URL}/api/organisation/realmCountryId/${json}`, {}
        );
    }

    getProblemStatusList() {
        return axios.get(`${API_URL}/api/problemStatus`, {}
        );
    }

    getActiveProgramPlaningUnitListByProgramId(json) {
        return axios.get(`${API_URL}/api/program/${json}/planningUnit/`, {}
        );
    }

    getPlanningUnitByProgramTracerCategory(programId, json) {
        return axios.post(`${API_URL}/api/program/${programId}/tracerCategory/planningUnit`, json, {}
        );
    }

    getLatestVersionForProgram(programId) {
        return axios.get(`${API_URL}/api/programData/getLatestVersionForProgram/${programId}`, {}
        );
    }

    getLastModifiedDateForProgram(programId, versionId) {
        return axios.get(`${API_URL}/api/programData/getLastModifiedDateForProgram/${programId}/${versionId}`, {}
        );
    }

    checkIfCommitRequestExists(programId){
        return axios.get(`${API_URL}/api/programData/checkIfCommitRequestExistsForProgram/${programId}`, {}
        );
    }

    getCommitRequests(json,requestStatus){
        return axios.post(`${API_URL}/api/getCommitRequest/${requestStatus}`, json, {}
        );
    }

    sendNotificationAsync(commitRequestId) {
        return axios.get(`${API_URL}/api/sendNotification/${commitRequestId}`, {}
        );
    }

}
export default new ProgramService()