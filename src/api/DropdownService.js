import axios from "axios";
import { API_URL } from "../Constants.js";
class DropdownService {
  getProgramForDropdown(realmId, programTypeId) {
    return axios.get(
      `${API_URL}/api/dropdown/program/realm/${realmId}/programType/${programTypeId}`,
      {}
    );
  }
  getProgramWithFilterForMultipleRealmCountryForDropdown(programTypeId, json) {
    return axios.post(
      `${API_URL}/api/dropdown/program/programType/${programTypeId}/filter/multipleRealmCountry`,
      json,
      {}
    );
  }
  // Below 2 methods are replacement of api/dropdown/program/programType/${programTypeId}/filter/multipleRealmCountry

  getSPProgramWithFilterForMultipleRealmCountryForDropdown(json) {
    return axios.post(
      `${API_URL}/api/dropdown/program/sp/filter/multipleRealmCountry`,
      json,
      {}
    );
  }
  getFCProgramWithFilterForMultipleRealmCountryForDropdown(json) {
    return axios.post(
      `${API_URL}/api/dropdown/program/fc/filter/multipleRealmCountry`,
      json,
      {}
    );
  }
  getPlanningUnitDropDownList() {
    return axios.get(`${API_URL}/api/dropdown/planningUnit`, {});
  }
  getForecastingUnitDropDownList() {
    return axios.get(`${API_URL}/api/dropdown/forecastingUnit`, {});
  }
  getRealmCountryDropdownList(realmId) {
    return axios.get(
      `${API_URL}/api/dropdown/realmCountry/realm/${realmId}`,
      {}
    );
  }
  getHealthAreaDropdownList(realmId) {
    return axios.get(
      `${API_URL}/api/dropdown/healthArea/realm/${realmId}`,
      {}
    );
  }
  getOrganisationDropdownList(realmId) {
    return axios.get(
      `${API_URL}/api/dropdown/organisation/realm/${realmId}`,
      {}
    );
  }
  getTracerCategoryDropdownList() {
    return axios.get(`${API_URL}/api/dropdown/tracerCategory`, {});
  }
  getTracerCategoryForMultipleProgramsDropdownList(json) {
    return axios.post(
      `${API_URL}/api/dropdown/tracerCategory/filter/multiplePrograms`,
      json,
      {}
    );
  }
  getFundingSourceDropdownList() {
    return axios.get(`${API_URL}/api/dropdown/fundingSource`, {});
  }
  getProcurementAgentDropdownListForFilterMultiplePrograms(json) {
    return axios.post(
      `${API_URL}/api/dropdown/procurementAgent/filter/multiplePrograms`,
      json,
      {}
    );
  }
  getProcurementAgentDropdownList() {
    return axios.get(`${API_URL}/api/dropdown/procurementAgent`, {});
  }
  getProgramPlanningUnitDropdownList(json) {
    return axios.post(
      `${API_URL}/api/dropdown/planningUnit/program/filter/multipleProgramAndTracerCategory`,
      json,
      {}
    );
  }
  getBudgetDropdownFilterMultipleFundingSources(json) {
    return axios.post(
      `${API_URL}/api/dropdown/budget/filter/multipleFundingSources`,
      json,
      {}
    );
  }
  getVersionListForProgram(programTypeId, programId) {
    return axios.get(
      `${API_URL}/api/dropdown/version/filter/programTypeId/${programTypeId}/programId/${programId}`,
      {}
    );
  }
  getVersionListForSPProgram(programId) {
    return axios.get(
      `${API_URL}/api/dropdown/version/filter/sp/programId/${programId}`,
      {}
    );
  }
  getVersionListForFCProgram(programId) {
    return axios.get(
      `${API_URL}/api/dropdown/version/filter/fc/programId/${programId}`,
      {}
    );
  }
  getBudgetDropdownBasedOnProgram(programId) {
    return axios.get(
      `${API_URL}/api/dropdown/budget/program/${programId}`,
      {}
    );
  }
  getUpdateProgramInfoDetailsBasedRealmCountryId(
    programTypeId,
    realmCountryId,
    statusId
  ) {
    return axios.get(
      `${API_URL}/api/report/updateProgramInfo/programTypeId/${programTypeId}/realmCountryId/${realmCountryId}/active/${statusId}`,
      {}
    );
  }
  getVersionListForSPPrograms(json) {
    return axios.post(
      `${API_URL}/api/dropdown/version/filter/sp/programs`,
      json,
      {}
    );
  }
  getVersionListForFCPrograms(json) {
    return axios.post(
      `${API_URL}/api/dropdown/version/filter/fc/programs`,
      json,
      {}
    );
  }
  getOrganisationListByRealmCountryId(realmCountryId) {
    return axios.get(
      `${API_URL}/api/dropdown/organisation/realmCountryId/${realmCountryId}`,
      {}
    );
  }
  // Below 2 methods are replacement of api/dropdown/program/realm/{realmId}/programType/{programTypeId}/expanded
  getSPProgramBasedOnRealmId(realmId) {
    return axios.get(
      `${API_URL}/api/dropdown/program/sp/expanded/realm/${realmId}`,
      {}
    );
  }

  getFCProgramBasedOnRealmId(realmId) {
    return axios.get(
      `${API_URL}/api/dropdown/program/fc/expanded/realm/${realmId}`,
      {}
    );
  }

  getTreeTemplateListForDropdown() {
    return axios.get(
      `${API_URL}/api/dropdown/treeTemplate`,
      {}
    );
  }
  getAutocompleteForecastingUnit(json) {
    return axios.post(
      `${API_URL}/api/dropdown/forecastingUnit/autocomplete`,
      json,
      {}
    );
  }
  getProgramListBasedOnVersionStatusAndVersionType(versionStatusId, versionTypeId) {
    return axios.get(`${API_URL}/api/dropdown/program/versionStatus/${versionStatusId}/versionType/${versionTypeId}`, {});
  }
  getFundingSourceForProgramsDropdownList(json) {
    return axios.post(`${API_URL}/api/dropdown/fundingSource/programs`, json, {}
    );
  }
  getFundingSourceTypeForProgramsDropdownList(json) {
    return axios.post(`${API_URL}/api/dropdown/fundingSourceType/programs`, json, {}
    );
  }
  getAllProgramListByRealmId(realmId) {
    return axios.get(`${API_URL}/api/dropdown/program/all/expanded/realm/${realmId}`, {}
    );
  }
}
export default new DropdownService();
