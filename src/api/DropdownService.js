import axios from "axios";
import { API_URL } from "../Constants.js";
class DropdownService {
  getProgramForDropdown(realmId, programTypeId) {
    return axios.get(
      `${API_URL}/api/dropdown/program/realm/${realmId}/programType/${programTypeId}/`,
      {}
    );
  }

  getProgramWithFilterForHealthAreaAndRealmCountryForDropdown(
    realmId,
    programTypeId,
    json
  ) {
    return axios.post(
      `${API_URL}/api/dropdown/program/realm/${realmId}/programType/${programTypeId}/filter/healthAreaAndRealmCountry/`,
      json,
      {}
    );
  }

  getProgramWithFilterForMultipleRealmCountryForDropdown(programTypeId, json) {
    return axios.post(
      `${API_URL}/api/dropdown/program/programType/${programTypeId}/filter/multipleRealmCountry/`,
      json,
      {}
    );
  }

  getPlanningUnitByAutoComplete(json) {
    return axios.post(
      `${API_URL}/api/dropdown/planningUnit/autocomplete/`,
      json,
      {}
    );
  }

  getPlanningUnitByAutoCompleteFilterForProductCategory(json) {
    return axios.post(
      `${API_URL}/api/dropdown/planningUnit/autocomplete/filter/productCategory/`,
      json,
      {}
    );
  }

  getPlanningUnitDropDownList() {
    return axios.get(`${API_URL}/api/dropdown/planningUnit/`, {});
  }

  getPlanningUnitFilterForProductCategory(json) {
    return axios.post(
      `${API_URL}/api/dropdown/planningUnit/filter/productCategory/`,
      json,
      {}
    );
  }

  getForecastingUnitByAutoComplete(json) {
    return axios.post(
      `${API_URL}/api/dropdown/forecastingUnit/autocomplete/`,
      json,
      {}
    );
  }

  getForecastingUnitByAutoCompleteWithFilterTracerCategory(json) {
    return axios.post(
      `${API_URL}/api/dropdown/forecastingUnit/autocomplete/filter/tracerCategory/`,
      json,
      {}
    );
  }

  getForecastingUnitDropdownList() {
    return axios.get(`${API_URL}/api/dropdown/forecastingUnit/`, {});
  }

  getForecastingUnitDropdownListWithFilterForPcAndTc(json) {
    return axios.post(
      `${API_URL}/api/dropdown/forecastingUnit/filter/pcAndTc/`,
      json,
      {}
    );
  }

  getRealmCountryDropdownList(realmId) {
    return axios.get(
      `${API_URL}/api/dropdown/realmCountry/realm/${realmId}/`,
      {}
    );
  }

  getHealthAreaDropdownList(realmId) {
    return axios.get(
      `${API_URL}/api/dropdown/healthArea/realm/${realmId}/`,
      {}
    );
  }

  getOrganisationDropdownList(realmId) {
    return axios.get(
      `${API_URL}/api/dropdown/organisation/realm/${realmId}/`,
      {}
    );
  }

  getTracerCategoryDropdownList() {
    return axios.get(`${API_URL}/api/dropdown/tracerCategory/`, {});
  }

  getTracerCategoryForMultipleProgramsDropdownList(json) {
    return axios.post(
      `${API_URL}/api/dropdown/tracerCategory/filter/multiplePrograms/`,
      json,
      {}
    );
  }

  getFundingSourceDropdownList() {
    return axios.get(`${API_URL}/api/dropdown/fundingSource/`, {});
  }

  getProcurementAgentDropdownList() {
    return axios.get(`${API_URL}/api/dropdown/procurementAgent/`, {});
  }

  getProcurementAgentDropdownListForFilterMultiplePrograms(json) {
    return axios.post(
      `${API_URL}/api/dropdown/procurementAgent/filter/multiplePrograms/`,
      json,
      {}
    );
  }

  getEquivalencyUnitDropdownList() {
    return axios.get(`${API_URL}/api/dropdown/equivalencyUnit/`, {});
  }

  getUserDropdownList() {
    return axios.get(`${API_URL}/api/dropdown/user/`, {});
  }

  getProgramPlanningUnitDropdownList(json) {
    return axios.post(
      `${API_URL}/api/dropdown/planningUnit/program/filter/multipleProgramAndTracerCategory/`,
      json,
      {}
    );
  }

  getDatasetPlanningUnitDropdownList(json) {
    return axios.post(
      `${API_URL}/api/dropdown/planningUnit/dataset/filter/programAndVersion/`,
      json,
      {}
    );
  }

  getBudgetDropdownFilterMultipleFundingSources(json) {
    return axios.post(
      `${API_URL}/api/dropdown/budget/filter/multipleFundingSources/`,
      json,
      {}
    );
  }

  getVersionListForProgram(programTypeId, programId) {
    return axios.get(
      `${API_URL}/api/dropdown/version/filter/programTypeId/${programTypeId}/programId/${programId}/`,
      {}
    );
  }

  getBudgetDropdownBasedOnProgram(programId) {
    return axios.get(
      `${API_URL}/api/dropdown/budget/program/${programId}/`,
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
}

export default new DropdownService();
