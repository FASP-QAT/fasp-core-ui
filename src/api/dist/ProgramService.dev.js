"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _Constants = require("../Constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ProgramService =
/*#__PURE__*/
function () {
  function ProgramService() {
    _classCallCheck(this, ProgramService);
  }

  _createClass(ProgramService, [{
    key: "getProgramData",
    value: function getProgramData(json) {
      console.log("Json", json);
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/programData/programId/").concat(json.programId, "/versionId/").concat(json.versionId), {});
    }
  }, {
    key: "getAllProgramData",
    value: function getAllProgramData(json) {
      return _axios["default"].post("".concat(_Constants.API_URL, "/api/programData"), json, {});
    }
  }, {
    key: "getProgramList",
    value: function getProgramList() {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/program/"), {});
    }
  }, {
    key: "getDataSetList",
    value: function getDataSetList() {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/dataset/"), {});
    }
  }, {
    key: "getProgramListAll",
    value: function getProgramListAll() {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/program/all"), {});
    }
  }, {
    key: "getDataSetListAll",
    value: function getDataSetListAll() {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/dataset/all"), {});
    }
  }, {
    key: "loadProgramList",
    value: function loadProgramList() {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/loadProgram/"), {});
    }
  }, {
    key: "loadMoreProgramList",
    value: function loadMoreProgramList(programId, page) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/loadProgram/programId/").concat(programId, "/page/").concat(page), {});
    }
  }, {
    key: "getProgramListForDropDown",
    value: function getProgramListForDropDown() {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/getProgramList/"), {});
    }
  }, {
    key: "addProgram",
    value: function addProgram(json) {
      return _axios["default"].post("".concat(_Constants.API_URL, "/api/program/"), json, {});
    }
  }, {
    key: "editProgram",
    value: function editProgram(json) {
      return _axios["default"].put("".concat(_Constants.API_URL, "/api/program/"), json, {});
    }
  }, {
    key: "getRealmCountryList",
    value: function getRealmCountryList(json) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/realmCountry/realmId/").concat(json), {});
    }
  }, {
    key: "getOrganisationList",
    value: function getOrganisationList(json) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/organisation/realmId/").concat(json), {});
    }
  }, {
    key: "getHealthAreaList",
    value: function getHealthAreaList(json) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/healthArea/realmId/").concat(json), {});
    }
  }, {
    key: "getRegionList",
    value: function getRegionList(json) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/region/realmCountryId/").concat(json), {});
    }
  }, {
    key: "getProgramProductListByProgramId",
    value: function getProgramProductListByProgramId(json) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/programProduct/").concat(json), {});
    }
  }, {
    key: "getProgramPlaningUnitListByProgramId",
    value: function getProgramPlaningUnitListByProgramId(json) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/program/").concat(json, "/planningUnit/all/"), {});
    }
  }, {
    key: "addProgramProductMapping",
    value: function addProgramProductMapping(json) {
      return _axios["default"].put("".concat(_Constants.API_URL, "/api/programProduct/"), json, {});
    }
  }, {
    key: "addprogramPlanningUnitMapping",
    value: function addprogramPlanningUnitMapping(json) {
      return _axios["default"].put("".concat(_Constants.API_URL, "/api/program/planningUnit/"), json, {});
    }
  }, {
    key: "getProgramById",
    value: function getProgramById(json) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/program/").concat(json), {});
    }
  }, {
    key: "getProgramManagerList",
    value: function getProgramManagerList(json) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/user/realmId/").concat(json), {});
    }
  }, {
    key: "getProgramByRealmId",
    value: function getProgramByRealmId(json) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/program/realmId/").concat(json), {});
    }
  }, {
    key: "saveProgramData",
    value: function saveProgramData(json, comparedVersionId) {
      return _axios["default"].put("".concat(_Constants.API_URL, "/api/programData/").concat(comparedVersionId), json, {});
    }
  }, {
    key: "getProgramPlaningUnitListByProgramAndProductCategory",
    value: function getProgramPlaningUnitListByProgramAndProductCategory(programId, ProductCategoryId) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/program/").concat(programId, "/").concat(ProductCategoryId, "/planningUnit/all/"), {});
    }
  }, {
    key: "programInitialize",
    value: function programInitialize(json) {
      return _axios["default"].post("".concat(_Constants.API_URL, "/api/program/initialize/"), json, {});
    }
  }, {
    key: "pipelineProgramDataImport",
    value: function pipelineProgramDataImport() {
      return _axios["default"].post("".concat(_Constants.API_URL, "/api/pipeline/programsetup"), {});
    }
  }, {
    key: "getVersionStatusList",
    value: function getVersionStatusList() {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/versionStatus"), {});
    }
  }, {
    key: "updateProgramStatus",
    value: function updateProgramStatus(json, reviewedProblemList) {
      var obj = {
        reviewedProblemList: reviewedProblemList,
        notes: json.currentVersion.notes
      };
      return _axios["default"].put("".concat(_Constants.API_URL, "/api/programVersion/programId/").concat(json.programId, "/versionId/").concat(json.currentVersion.versionId, "/versionStatusId/").concat(json.currentVersion.versionStatus.id, "/"), obj, {});
    }
  }, {
    key: "getVersionTypeList",
    value: function getVersionTypeList() {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/versionType"), {});
    }
  }, {
    key: "checkOrderNumberAndLineNumber",
    value: function checkOrderNumberAndLineNumber(orderNo, primeLineNo, realmCountryId, planningUnitId) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/programData/checkErpOrder/orderNo/").concat(orderNo, "/primeLineNo/").concat(primeLineNo, "/realmCountryId/").concat(realmCountryId, "/planningUnitId/").concat(planningUnitId), {});
    }
  }, {
    key: "getProgramDisplayNameUniqueStatus",
    value: function getProgramDisplayNameUniqueStatus(realmId, programId, programCode) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/program/validate/realmId/").concat(realmId, "/programId/").concat(programId, "/programCode/").concat(programCode), {});
    }
  }, {
    key: "checkNewerVersions",
    value: function checkNewerVersions(json) {
      console.log("json----------------------------", json);
      return _axios["default"].post("".concat(_Constants.API_URL, "/api/programData/checkNewerVersions/"), json, {});
    }
  }, {
    key: "getHealthAreaListByRealmCountryId",
    value: function getHealthAreaListByRealmCountryId(json) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/healthArea/realmCountryId/").concat(json), {});
    }
  }, {
    key: "getOrganisationListByRealmCountryId",
    value: function getOrganisationListByRealmCountryId(json) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/organisation/realmCountryId/").concat(json), {});
    }
  }, {
    key: "getProblemStatusList",
    value: function getProblemStatusList() {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/problemStatus"), {});
    }
  }, {
    key: "getActiveProgramPlaningUnitListByProgramId",
    value: function getActiveProgramPlaningUnitListByProgramId(json) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/program/").concat(json, "/planningUnit/"), {});
    }
  }, {
    key: "getPlanningUnitByProgramTracerCategory",
    value: function getPlanningUnitByProgramTracerCategory(programId, json) {
      return _axios["default"].post("".concat(_Constants.API_URL, "/api/program/").concat(programId, "/tracerCategory/planningUnit"), json, {});
    }
  }, {
    key: "getLatestVersionForProgram",
    value: function getLatestVersionForProgram(programId) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/programData/getLatestVersionForProgram/").concat(programId), {});
    }
  }, {
    key: "getLatestVersionsForPrograms",
    value: function getLatestVersionsForPrograms(programIds) {
      return _axios["default"].post("".concat(_Constants.API_URL, "/api/programData/getLatestVersionForPrograms/"), programIds, {});
    }
  }, {
    key: "getLastModifiedDateForProgram",
    value: function getLastModifiedDateForProgram(programId, versionId) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/programData/getLastModifiedDateForProgram/").concat(programId, "/").concat(versionId), {});
    }
  }, {
    key: "addDataset",
    value: function addDataset(json) {
      return _axios["default"].post("".concat(_Constants.API_URL, "/api/dataset/"), json, {});
    }
  }, {
    key: "getDatasetById",
    value: function getDatasetById(json) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/dataset/").concat(json), {});
    }
  }, {
    key: "editDataset",
    value: function editDataset(json) {
      return _axios["default"].put("".concat(_Constants.API_URL, "/api/dataset/"), json, {});
    }
  }, {
    key: "getActualConsumptionData",
    value: function getActualConsumptionData(json) {
      return _axios["default"].post("".concat(_Constants.API_URL, "/api/program/actualConsumptionReport"), json, {});
    }
  }, {
    key: "checkIfCommitRequestExists",
    value: function checkIfCommitRequestExists(programId) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/programData/checkIfCommitRequestExistsForProgram/").concat(programId), {});
    }
  }, {
    key: "getCommitRequests",
    value: function getCommitRequests(json, requestStatus) {
      return _axios["default"].post("".concat(_Constants.API_URL, "/api/getCommitRequest/").concat(requestStatus), json, {});
    }
  }, {
    key: "sendNotificationAsync",
    value: function sendNotificationAsync(commitRequestId) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/sendNotification/").concat(commitRequestId), {});
    }
  }, {
    key: "getPlanningUnitByProgramId",
    value: function getPlanningUnitByProgramId(programId, json) {
      return _axios["default"].post("".concat(_Constants.API_URL, "/api/program/").concat(programId, "/tracerCategory/simple/planningUnit"), json, {});
    }
  }, {
    key: "getProgramManagerListByProgramId",
    value: function getProgramManagerListByProgramId(programId) {
      return _axios["default"].get("".concat(_Constants.API_URL, "/api/user/programId/").concat(programId), {});
    }
  }, {
    key: "checkIfLinkingExistsWithOtherProgram",
    value: function checkIfLinkingExistsWithOtherProgram(json) {
      return _axios["default"].post("".concat(_Constants.API_URL, "/api/erpLinking/otherProgramCheck"), json, {});
    }
  }, {
    key: "getDatasetVersions",
    value: function getDatasetVersions(json) {
      return _axios["default"].post("".concat(_Constants.API_URL, "/api/dataset/versions/"), json, {});
    }
  }]);

  return ProgramService;
}();

var _default = new ProgramService();

exports["default"] = _default;