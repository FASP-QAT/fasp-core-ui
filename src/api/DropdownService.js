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
  getVersionListForPrograms(programTypeId, json) {
    return axios.post(
      `${API_URL}/api/dropdown/version/filter/programTypeId/${programTypeId}/programs`,
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
  getProgramBasedOnRealmIdAndProgramTypeId(realmId, programTypeId) {
    return axios.get(
      `${API_URL}/api/dropdown/program/realm/${realmId}/programType/${programTypeId}/expanded`,
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
}
export default new DropdownService();
