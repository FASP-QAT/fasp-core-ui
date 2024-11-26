import axios from "axios";
import { API_URL } from '../Constants.js';
class ProgramService {
    getProgramData(json) {
        return axios.get(`${API_URL}/api/programData/programId/${json.programId}/versionId/${json.versionId}`, {
        });
    }
    getAllProgramData(json) {
        return axios.post(`${API_URL}/api/programData`, json, {
        });
    }
    getProgramList() {
        return axios.get(`${API_URL}/api/program`, {
        });
    }
    getDataSetList() {
        return axios.get(`${API_URL}/api/dataset`, {
        });
    }
    loadProgramList() {
        return axios.get(`${API_URL}/api/loadProgram`, {
        });
    }
    loadMoreProgramList(programId, page) {
        return axios.get(`${API_URL}/api/loadProgram/programId/${programId}/page/${page}`, {
        });
    }
    addProgram(json) {
        return axios.post(`${API_URL}/api/program`, json, {}
        );
    }
    editProgram(json) {
        return axios.put(`${API_URL}/api/program`, json, {}
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
    getProgramPlaningUnitListByProgramId(json) {
        return axios.get(`${API_URL}/api/program/${json}/planningUnit/all`, {}
        );
    }
    addprogramPlanningUnitMapping(json) {
        return axios.put(`${API_URL}/api/program/planningUnit`, json, {}
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
    saveProgramData(json, comparedVersionId) {
        return axios.put(`${API_URL}/api/commit/programData/${comparedVersionId}`, json, {}
        );
    }
    programInitialize(json) {
        return axios.post(`${API_URL}/api/program/initialize`, json, {}
        );
    }
    getVersionStatusList() {
        return axios.get(`${API_URL}/api/master/versionStatus`, {}
        );
    }
    updateProgramStatus(json, reviewedProblemList) {
        var obj = {
            reviewedProblemList: reviewedProblemList,
            notes: json.currentVersion.notes
        }
        return axios.put(`${API_URL}/api/programVersion/programId/${json.programId}/versionId/${json.currentVersion.versionId}/versionStatusId/${json.currentVersion.versionStatus.id}`, obj, {}
        );
    }
    getVersionTypeList() {
        return axios.get(`${API_URL}/api/master/versionType`, {}
        );
    }
    checkNewerVersions(json) {
        return axios.post(`${API_URL}/api/programData/checkNewerVersions`, json, {}
        );
    }
    getHealthAreaListByRealmCountryId(json) {
        return axios.get(`${API_URL}/api/healthArea/realmCountryId/${json}`, {}
        );
    }
    getProblemStatusList() {
        return axios.get(`${API_URL}/api/problemStatus`, {}
        );
    }
    getActiveProgramPlaningUnitListByProgramId(json) {
        return axios.get(`${API_URL}/api/program/${json}/planningUnit`, {}
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
    getLatestVersionsForPrograms(programIds) {
        return axios.post(`${API_URL}/api/programData/getLatestVersionForPrograms`, programIds, {}
        );
    }
    getLastModifiedDateForProgram(programId, versionId) {
        return axios.get(`${API_URL}/api/programData/getLastModifiedDateForProgram/${programId}/${versionId}`, {}
        );
    }
    addDataset(json) {
        return axios.post(`${API_URL}/api/dataset`, json, {}
        );
    }
    getDatasetById(json) {
        return axios.get(`${API_URL}/api/dataset/${json}`, {}
        );
    }
    editDataset(json) {
        return axios.put(`${API_URL}/api/dataset`, json, {}
        );
    }
    getActualConsumptionData(json) {
        return axios.post(`${API_URL}/api/program/actualConsumptionReport`, json, {}
        );
    }
    getCommitRequests(json, requestStatus) {
        return axios.post(`${API_URL}/api/commit/getCommitRequest/${requestStatus}`, json, {}
        );
    }
    sendNotificationAsync(commitRequestId) {
        return axios.get(`${API_URL}/api/commit/sendNotification/${commitRequestId}`, {}
        );
    }
    getPlanningUnitByProgramId(programId, json) {
        return axios.post(`${API_URL}/api/program/${programId}/tracerCategory/simple/planningUnit`, json, {}
        );
    }
    checkIfLinkingExistsWithOtherProgram(json) {
        return axios.post(`${API_URL}/api/erpLinking/otherProgramCheck`, json, {}
        );
    }
    getProgramManagerListByProgramId(programId) {
        return axios.get(`${API_URL}/api/user/programId/${programId}`, {});
    }
    createManualProblem(json) {
        return axios.post(`${API_URL}/api/problemReport/createManualProblem`, json, {}
        );
    }
    getDatasetVersions(json) {
        return axios.post(`${API_URL}/api/dataset/versions`, json, {});
    }
    getProgramListByRealmCountryIdList(realmCountryIds) {
        return axios.post(`${API_URL}/api/program/realmCountryList`, realmCountryIds, {});
    }
    getProgramListByProductCategoryIdList(productCategoryIds) {
        return axios.post(`${API_URL}/api/program/productCategoryList`, productCategoryIds, {});
    }
    getProgramListAll() {
        return axios.get(`${API_URL}/api/program/all`, {});
    }
    getNotesHistory(programId) {
        return axios.get(`${API_URL}/api/program/data/version/trans/programId/${programId}/versionId/0`, {});
    }
    resetQPL(json) {
        return axios.put(`${API_URL}/api/programVersion/resetProblem`, json, {}
        );
    }
}
export default new ProgramService()