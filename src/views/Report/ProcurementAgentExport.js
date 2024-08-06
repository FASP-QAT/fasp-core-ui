import CryptoJS from "crypto-js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import jexcel from "jspreadsheet";
import moment from "moment";
import React, { Component } from "react";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import { Search } from "react-bootstrap-table2-toolkit";
import Picker from "react-month-picker";
import { MultiSelect } from "react-multi-select-component";
import {
  Card,
  CardBody,
  FormGroup,
  Input,
  InputGroup,
  Label
} from "reactstrap";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { getDatabase } from "../../CommonComponent/IndexedDbFunctions";
import {
  loadedForNonEditableTables
} from "../../CommonComponent/JExcelCommonFunctions.js";
import { LOGO } from "../../CommonComponent/Logo.js";
import MonthBox from "../../CommonComponent/MonthBox.js";
import getLabelText from "../../CommonComponent/getLabelText";
import {
  API_URL,
  INDEXED_DB_NAME,
  INDEXED_DB_VERSION,
  JEXCEL_PAGINATION_OPTION,
  JEXCEL_PRO_KEY,
  MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS,
  PROGRAM_TYPE_SUPPLY_PLAN,
  REPORT_DATEPICKER_END_MONTH,
  REPORT_DATEPICKER_START_MONTH,
  SECRET_KEY
} from "../../Constants.js";
import DropdownService from "../../api/DropdownService";
import FundingSourceService from "../../api/FundingSourceService";
import ReportService from "../../api/ReportService";
import csvicon from "../../assets/img/csv.png";
import pdfIcon from "../../assets/img/pdf.png";
import i18n from "../../i18n";
import AuthenticationService from "../Common/AuthenticationService.js";
import AuthenticationServiceComponent from "../Common/AuthenticationServiceComponent";
import SupplyPlanFormulas from "../SupplyPlan/SupplyPlanFormulas";
import { addDoubleQuoteToRowContent, filterOptions, makeText } from "../../CommonComponent/JavascriptCommonFunctions";
const pickerLang = {
  months: [
    i18n.t("static.month.jan"),
    i18n.t("static.month.feb"),
    i18n.t("static.month.mar"),
    i18n.t("static.month.apr"),
    i18n.t("static.month.may"),
    i18n.t("static.month.jun"),
    i18n.t("static.month.jul"),
    i18n.t("static.month.aug"),
    i18n.t("static.month.sep"),
    i18n.t("static.month.oct"),
    i18n.t("static.month.nov"),
    i18n.t("static.month.dec"),
  ],
  from: "From",
  to: "To",
};
/**
 * Component for Procurement Agent Export Report.
 */
class ProcurementAgentExport extends Component {
  constructor(props) {
    super(props);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth() + REPORT_DATEPICKER_END_MONTH);
    this.state = {
      regionList: [],
      message: "",
      selRegion: [],
      realmCountryList: [],
      procurementAgents: [],
      fundingSources: [],
      fundingSourcesFiltered: [],
      viewby: "",
      programs: [],
      versions: [],
      planningUnits: [],
      planningUnitValues: [],
      planningUnitLabels: [],
      procurementAgentValues: [],
      procurementAgentLabels: [],
      fundingSourceValues: [],
      fundingSourceLabels: [],
      data: [],
      lang: localStorage.getItem("lang"),
      rangeValue: {
        from: { year: dt.getFullYear(), month: dt.getMonth() + 1 },
        to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 },
      },
      minDate: {
        year: new Date().getFullYear() - 10,
        month: new Date().getMonth() + 1,
      },
      maxDate: {
        year: new Date().getFullYear() + MONTHS_IN_FUTURE_FOR_DATE_PICKER_FOR_SHIPMENTS,
        month: new Date().getMonth() + 1,
      },
      loading: true,
      programId: "",
      versionId: "",
      fundingSourceTypes: [],
      fundingSourceTypeValues: [],
      fundingSourceTypeLabels: [],
    };
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.buildJExcel = this.buildJExcel.bind(this);
    this.setProgramId = this.setProgramId.bind(this);
    this.setVersionId = this.setVersionId.bind(this);
    this.getFundingSourceType = this.getFundingSourceType.bind(this);
  }
  /**
   * Retrieves the list of programs.
   */
  getPrograms = () => {
    this.setState({ loading: true });
    if (localStorage.getItem("sessionType") === 'Online') {
      let realmId = AuthenticationService.getRealmId();
      DropdownService.getProgramForDropdown(realmId, PROGRAM_TYPE_SUPPLY_PLAN)
        .then((response) => {
          var proList = [];
          for (var i = 0; i < response.data.length; i++) {
            var programJson = {
              programId: response.data[i].id,
              label: response.data[i].label,
              programCode: response.data[i].code,
            };
            proList[i] = programJson;
          }
          this.setState(
            {
              programs: proList,
              loading: false,
            },
            () => {
              this.consolidatedProgramList();
            }
          );
        })
        .catch((error) => {
          this.setState(
            {
              programs: [],
              loading: false,
            },
            () => {
              this.consolidatedProgramList();
            }
          );
          if (error.message === "Network Error") {
            this.setState({
              message: API_URL.includes("uat")
                ? i18n.t("static.common.uatNetworkErrorMessage")
                : API_URL.includes("demo")
                  ? i18n.t("static.common.demoNetworkErrorMessage")
                  : i18n.t("static.common.prodNetworkErrorMessage"),
              loading: false,
            });
          } else {
            switch (error.response ? error.response.status : "") {
              case 401:
                this.props.history.push(`/login/static.message.sessionExpired`);
                break;
              case 403:
                this.props.history.push(`/accessDenied`);
                break;
              case 500:
              case 404:
              case 406:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, {
                    entityname: i18n.t("static.dashboard.program"),
                  }),
                  loading: false,
                });
                break;
              case 412:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, {
                    entityname: i18n.t("static.dashboard.program"),
                  }),
                  loading: false,
                });
                break;
              default:
                this.setState({
                  message: "static.unkownError",
                  loading: false,
                });
                break;
            }
          }
        });
    } else {
      this.consolidatedProgramList();
      this.setState({ loading: false });
    }
  };
  /**
   * Consolidates the list of programs obtained from Server and local programs.
   */
  consolidatedProgramList = () => {
    const { programs } = this.state;
    var proList = programs;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(["programData"], "readwrite");
      var program = transaction.objectStore("programData");
      var getRequest = program.getAll();
      getRequest.onerror = function (event) {
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(
          localStorage.getItem("curUser"),
          SECRET_KEY
        );
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (myResult[i].userId == userId) {
            var databytes = CryptoJS.AES.decrypt(
              myResult[i].programData.generalData,
              SECRET_KEY
            );
            var programData = JSON.parse(databytes.toString(CryptoJS.enc.Utf8));
            var f = 0;
            for (var k = 0; k < this.state.programs.length; k++) {
              if (this.state.programs[k].programId == programData.programId) {
                f = 1;
              }
            }
            if (f == 0) {
              proList.push(programData);
            }
          }
        }
        if (
          localStorage.getItem("sesProgramIdReport") != "" &&
          localStorage.getItem("sesProgramIdReport") != undefined
        ) {
          this.setState(
            {
              programs: proList.sort(function (a, b) {
                a = a.programCode.toLowerCase();
                b = b.programCode.toLowerCase();
                return a < b ? -1 : a > b ? 1 : 0;
              }),
              programId: localStorage.getItem("sesProgramIdReport"),
            },
            () => {
              this.getProcurementAgent();
              this.filterVersion();
            }
          );
        } else {
          this.setState({
            programs: proList.sort(function (a, b) {
              a = a.programCode.toLowerCase();
              b = b.programCode.toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            }),
          });
        }
      }.bind(this);
    }.bind(this);
  };
  /**
   * Retrieves the list of procurement agents for a selected program.
   */
  getProcurementAgent = () => {
    let programId = document.getElementById("programId").value;
    this.setState({ loading: true });
    if (localStorage.getItem("sessionType") === 'Online') {
      var programJson = [programId];
      DropdownService.getProcurementAgentDropdownListForFilterMultiplePrograms(
        programJson
      )
        .then((response) => {
          var listArray = response.data;
          var listArrays = [];
          for (var i = 0; i < listArray.length; i++) {
            var arr = {
              procurementAgentId: listArray[i].id,
              procurementAgentCode: listArray[i].code,
              label: listArray[i].label,
            };
            listArray[i] = arr;
          }
          listArrays.sort((a, b) => {
            var itemLabelA = a.procurementAgentCode.toUpperCase();
            var itemLabelB = b.procurementAgentCode.toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState(
            {
              procurementAgents: listArray,
              loading: false,
            },
            () => {
              this.consolidatedProcurementAgentList();
            }
          );
        })
        .catch((error) => {
          this.setState(
            {
              procurementAgents: [],
              loading: false,
            },
            () => {
              this.consolidatedProcurementAgentList();
            }
          );
          if (error.message === "Network Error") {
            this.setState({
              message: API_URL.includes("uat")
                ? i18n.t("static.common.uatNetworkErrorMessage")
                : API_URL.includes("demo")
                  ? i18n.t("static.common.demoNetworkErrorMessage")
                  : i18n.t("static.common.prodNetworkErrorMessage"),
              loading: false,
            });
          } else {
            switch (error.response ? error.response.status : "") {
              case 401:
                this.props.history.push(`/login/static.message.sessionExpired`);
                break;
              case 403:
                this.props.history.push(`/accessDenied`);
                break;
              case 500:
              case 404:
              case 406:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, {
                    entityname: i18n.t("static.dashboard.program"),
                  }),
                  loading: false,
                });
                break;
              case 412:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, {
                    entityname: i18n.t("static.dashboard.program"),
                  }),
                  loading: false,
                });
                break;
              default:
                this.setState({
                  message: "static.unkownError",
                  loading: false,
                });
                break;
            }
          }
        });
    } else {
      this.consolidatedProcurementAgentList();
      this.setState({ loading: false });
    }
  };
  /**
   * Consolidates the list of procurement agents obtained from server and local.
   */
  consolidatedProcurementAgentList = () => {
    const { procurementAgents } = this.state;
    var proList = procurementAgents;
    let programId = document.getElementById("programId").value;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(["procurementAgent"], "readwrite");
      var procuremntAgent = transaction.objectStore("procurementAgent");
      var getRequest = procuremntAgent.getAll();
      getRequest.onerror = function (event) {
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        for (var i = 0; i < myResult.length; i++) {
          var f = 0;
          for (var k = 0; k < this.state.procurementAgents.length; k++) {
            if (
              this.state.procurementAgents[k].procurementAgentId ==
              myResult[i].procurementAgentId
            ) {
              f = 1;
            }
          }
          if (f == 0) {
            for (var j = 0; j < myResult[i].programList.length; j++) {
              if (myResult[i].programList[j].id == programId) {
                var programData = myResult[i];
                proList.push(programData);
              }
            }
          }
          var listArray = proList;
        }
        this.setState({
          procurementAgents: listArray.sort(function (a, b) {
            a = a.procurementAgentCode.toLowerCase();
            b = b.procurementAgentCode.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
          }),
        });
        let viewby = document.getElementById("viewById").value;
        if (viewby == 1) {
          if (listArray.length > 0) {
            document.getElementById("procurementAgentDiv").style.display =
              "block";
          } else {
            this.setState({
              viewby: 2,
            });
            document.getElementById("procurementAgentDiv").style.display =
              "none";
            document.getElementById("fundingSourceDiv").style.display = "block";
          }
        }
      }.bind(this);
    }.bind(this);
  };
  /**
   * Filters versions based on the selected program ID and updates the state accordingly.
   * Sets the selected program ID in local storage.
   * Fetches version list for the selected program and updates the state with the fetched versions.
   * Handles error cases including network errors, session expiry, access denial, and other status codes.
   */
  filterVersion = () => {
    let programId = this.state.programId;
    if (programId != 0) {
      localStorage.setItem("sesProgramIdReport", programId);
      const program = this.state.programs.filter(
        (c) => c.programId == programId
      );
      if (program.length == 1) {
        if (localStorage.getItem("sessionType") === 'Online') {
          this.setState(
            {
              versions: [],
            },
            () => {
              DropdownService.getVersionListForProgram(
                PROGRAM_TYPE_SUPPLY_PLAN,
                programId
              )
                .then((response) => {
                  this.setState(
                    {
                      versions: [],
                    },
                    () => {
                      this.setState(
                        {
                          versions: response.data,
                        },
                        () => {
                          this.consolidatedVersionList(programId);
                        }
                      );
                    }
                  );
                })
                .catch((error) => {
                  this.setState({
                    programs: [],
                    loading: false,
                  });
                  if (error.message === "Network Error") {
                    this.setState({
                      message: API_URL.includes("uat")
                        ? i18n.t("static.common.uatNetworkErrorMessage")
                        : API_URL.includes("demo")
                          ? i18n.t("static.common.demoNetworkErrorMessage")
                          : i18n.t("static.common.prodNetworkErrorMessage"),
                      loading: false,
                    });
                  } else {
                    switch (error.response ? error.response.status : "") {
                      case 401:
                        this.props.history.push(
                          `/login/static.message.sessionExpired`
                        );
                        break;
                      case 403:
                        this.props.history.push(`/accessDenied`);
                        break;
                      case 500:
                      case 404:
                      case 406:
                        this.setState({
                          message: i18n.t(error.response.data.messageCode, {
                            entityname: i18n.t("static.dashboard.program"),
                          }),
                          loading: false,
                        });
                        break;
                      case 412:
                        this.setState({
                          message: i18n.t(error.response.data.messageCode, {
                            entityname: i18n.t("static.dashboard.program"),
                          }),
                          loading: false,
                        });
                        break;
                      default:
                        this.setState({
                          message: "static.unkownError",
                          loading: false,
                        });
                        break;
                    }
                  }
                });
            }
          );
        } else {
          this.setState(
            {
              versions: [],
            },
            () => {
              this.consolidatedVersionList(programId);
            }
          );
        }
      } else {
        this.setState({
          versions: [],
        });
      }
    } else {
      this.setState({
        versions: [],
      });
    }
    this.fetchData();
  };
  /**
   * Retrieves data from IndexedDB and combines it with fetched versions to create a consolidated version list.
   * Filters out duplicate versions and reverses the list.
   * Sets the version list in the state and triggers fetching of planning units.
   * Handles cases where a version is selected from local storage or the default version is selected.
   * @param {number} programId - The ID of the selected program
   */
  consolidatedVersionList = (programId) => {
    const { versions } = this.state;
    var verList = versions;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(["programData"], "readwrite");
      var program = transaction.objectStore("programData");
      var getRequest = program.getAll();
      getRequest.onerror = function (event) {
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(
          localStorage.getItem("curUser"),
          SECRET_KEY
        );
        var userId = userBytes.toString(CryptoJS.enc.Utf8);
        for (var i = 0; i < myResult.length; i++) {
          if (
            myResult[i].userId == userId &&
            myResult[i].programId == programId
          ) {
            var databytes = CryptoJS.AES.decrypt(
              myResult[i].programData.generalData,
              SECRET_KEY
            );
            var programData = databytes.toString(CryptoJS.enc.Utf8);
            var version = JSON.parse(programData).currentVersion;
            version.versionId = `${version.versionId} (Local)`;
            verList.push(version);
          }
        }
        let versionList = verList.filter(function (x, i, a) {
          return a.indexOf(x) === i;
        });
        versionList.reverse();
        if (
          localStorage.getItem("sesVersionIdReport") != "" &&
          localStorage.getItem("sesVersionIdReport") != undefined
        ) {
          let versionVar = versionList.filter(
            (c) => c.versionId == localStorage.getItem("sesVersionIdReport")
          );
          if (versionVar != "" && versionVar != undefined) {
            this.setState(
              {
                versions: versionList,
                versionId: localStorage.getItem("sesVersionIdReport"),
              },
              () => {
                this.getPlanningUnit();
              }
            );
          } else {
            this.setState(
              {
                versions: versionList,
                versionId: versionList[0].versionId,
              },
              () => {
                this.getPlanningUnit();
              }
            );
          }
        } else {
          this.setState(
            {
              versions: versionList,
              versionId: versionList[0].versionId,
            },
            () => {
              this.getPlanningUnit();
            }
          );
        }
      }.bind(this);
    }.bind(this);
  };
  /**
   * Retrieves the list of planning units for a selected program and version.
   */
  getPlanningUnit = () => {
    let programId = document.getElementById("programId").value;
    let versionId = document.getElementById("versionId").value;
    this.setState(
      {
        planningUnits: [],
        planningUnitLabels: [],
        planningUnitValues: [],
      },
      () => {
        if (versionId == 0) {
          this.setState(
            { message: i18n.t("static.program.validversion"), data: [] },
            () => {
              this.el = jexcel(document.getElementById("tableDiv"), "");
              jexcel.destroy(document.getElementById("tableDiv"), true);
            }
          );
        } else {
          localStorage.setItem("sesVersionIdReport", versionId);
          if (versionId.includes("Local")) {
            var db1;
            getDatabase();
            var openRequest = indexedDB.open(
              INDEXED_DB_NAME,
              INDEXED_DB_VERSION
            );
            openRequest.onsuccess = function (e) {
              db1 = e.target.result;
              var planningunitTransaction = db1.transaction(
                ["programPlanningUnit"],
                "readwrite"
              );
              var planningunitOs = planningunitTransaction.objectStore(
                "programPlanningUnit"
              );
              var planningunitRequest = planningunitOs.getAll();
              planningunitRequest.onerror = function (event) {
              };
              planningunitRequest.onsuccess = function (e) {
                var myResult = [];
                myResult = planningunitRequest.result;
                var programId = document
                  .getElementById("programId")
                  .value.split("_")[0];
                var proList = [];
                for (var i = 0; i < myResult.length; i++) {
                  if (
                    myResult[i].program.id == programId &&
                    myResult[i].active == true
                  ) {
                    proList[i] = myResult[i].planningUnit;
                  }
                }
                var lang = this.state.lang;
                this.setState(
                  {
                    planningUnits: proList.sort(function (a, b) {
                      a = getLabelText(a.label, lang).toLowerCase();
                      b = getLabelText(b.label, lang).toLowerCase();
                      return a < b ? -1 : a > b ? 1 : 0;
                    }),
                    message: "",
                  },
                  () => {
                    this.fetchData();
                  }
                );
              }.bind(this);
            }.bind(this);
          } else {
            this.setState({ loading: true });
            var programJson = {
              tracerCategoryIds: [],
              programIds: [programId],
            };
            DropdownService.getProgramPlanningUnitDropdownList(programJson)
              .then((response) => {
                var listArray = response.data;
                listArray.sort((a, b) => {
                  var itemLabelA = getLabelText(
                    a.label,
                    this.state.lang
                  ).toUpperCase();
                  var itemLabelB = getLabelText(
                    b.label,
                    this.state.lang
                  ).toUpperCase();
                  return itemLabelA > itemLabelB ? 1 : -1;
                });
                this.setState(
                  {
                    planningUnits: listArray,
                    message: "",
                    loading: false,
                  },
                  () => {
                    this.fetchData();
                  }
                );
              })
              .catch((error) => {
                this.setState({
                  planningUnits: [],
                  loading: false,
                });
                if (error.message === "Network Error") {
                  this.setState({
                    message: API_URL.includes("uat")
                      ? i18n.t("static.common.uatNetworkErrorMessage")
                      : API_URL.includes("demo")
                        ? i18n.t("static.common.demoNetworkErrorMessage")
                        : i18n.t("static.common.prodNetworkErrorMessage"),
                    loading: false,
                  });
                } else {
                  switch (error.response ? error.response.status : "") {
                    case 401:
                      this.props.history.push(
                        `/login/static.message.sessionExpired`
                      );
                      break;
                    case 403:
                      this.props.history.push(`/accessDenied`);
                      break;
                    case 500:
                    case 404:
                    case 406:
                      this.setState({
                        message: i18n.t(error.response.data.messageCode, {
                          entityname: i18n.t(
                            "static.planningunit.planningunit"
                          ),
                        }),
                        loading: false,
                      });
                      break;
                    case 412:
                      this.setState({
                        message: i18n.t(error.response.data.messageCode, {
                          entityname: i18n.t(
                            "static.planningunit.planningunit"
                          ),
                        }),
                        loading: false,
                      });
                      break;
                    default:
                      this.setState({
                        message: "static.unkownError",
                        loading: false,
                      });
                      break;
                  }
                }
              });
          }
        }
      }
    );
  };
  /**
   * Handles the change event for planning units.
   * @param {array} planningUnitIds - The selected planning unit IDs.
   */
  handlePlanningUnitChange = (planningUnitIds) => {
    planningUnitIds = planningUnitIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    });
    this.setState(
      {
        planningUnitValues: planningUnitIds.map((ele) => ele),
        planningUnitLabels: planningUnitIds.map((ele) => ele.label),
      },
      () => {
        this.fetchData();
      }
    );
  };
  /**
   * Handles the change event for procurement agents.
   * @param {array} procurementAgentIds - The selected procurement agent IDs.
   */
  handleProcurementAgentChange = (procurementAgentIds) => {
    procurementAgentIds = procurementAgentIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    });
    this.setState(
      {
        procurementAgentValues: procurementAgentIds.map((ele) => ele),
        procurementAgentLabels: procurementAgentIds.map((ele) => ele.label),
      },
      () => {
        this.fetchData();
      }
    );
  };
  /**
   * Handles the change event for funding sources.
   * @param {array} fundingSourceIds - The selected funding source IDs.
   */
  handleFundingSourceChange = (fundingSourceIds) => {
    fundingSourceIds = fundingSourceIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    });
    this.setState(
      {
        fundingSourceValues: fundingSourceIds.map((ele) => ele),
        fundingSourceLabels: fundingSourceIds.map((ele) => ele.label),
      },
      () => {
        this.fetchData();
      }
    );
  };
  /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
  handleRangeDissmis(value) {
    this.setState({ rangeValue: value }, () => {
      this.fetchData();
    });
  }
  /**
   * Handles the click event on the range picker box.
   * Shows the range picker component.
   * @param {object} e - The event object containing information about the click event.
   */
  _handleClickRangeBox(e) {
    this.refs.pickRange.show();
  }
  /**
   * Exports the data to a CSV file.
   * @param {array} columns - The columns to be exported.
   */
  exportCSV(columns) {
    let viewby = document.getElementById("viewById").value;
    var csvRow = [];
    csvRow.push(
      '"' +
      (
        i18n.t("static.report.dateRange") +
        " : " +
        makeText(this.state.rangeValue.from) +
        " ~ " +
        makeText(this.state.rangeValue.to)
      ).replaceAll(" ", "%20") +
      '"'
    );
    if (viewby == 1) {
      csvRow.push("");
      this.state.procurementAgentLabels.map((ele) =>
        csvRow.push(
          '"' +
          (
            i18n.t("static.procurementagent.procurementagent") +
            " : " +
            ele.toString()
          ).replaceAll(" ", "%20") +
          '"'
        )
      );
    } else if (viewby == 2) {
      csvRow.push("");
      this.state.fundingSourceTypeLabels.map((ele) =>
        csvRow.push(
          '"' +
          (
            i18n.t("static.funderTypeHead.funderType") +
            " : " +
            ele.toString()
          ).replaceAll(" ", "%20") +
          '"'
        )
      );
      csvRow.push("");
      this.state.fundingSourceLabels.map((ele) =>
        csvRow.push(
          '"' +
          (
            i18n.t("static.budget.fundingsource") +
            " : " +
            ele.toString()
          ).replaceAll(" ", "%20") +
          '"'
        )
      );
    }
    csvRow.push("");
    csvRow.push(
      '"' +
      (
        i18n.t("static.program.program") +
        " : " +
        document.getElementById("programId").selectedOptions[0].text
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    csvRow.push(
      '"' +
      (
        i18n.t("static.report.versionFinal*") +
        "  :  " +
        document.getElementById("versionId").selectedOptions[0].text
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    this.state.planningUnitValues.map((ele) =>
      csvRow.push(
        '"' +
        (
          i18n.t("static.planningunit.planningunit") +
          " : " +
          ele.label.toString()
        ).replaceAll(" ", "%20") +
        '"'
      )
    );
    csvRow.push("");
    csvRow.push(
      '"' +
      (
        i18n.t("static.program.isincludeplannedshipment") +
        " : " +
        document.getElementById("isPlannedShipmentId").selectedOptions[0].text
      ).replaceAll(" ", "%20") +
      '"'
    );
    csvRow.push("");
    csvRow.push("");
    csvRow.push("");
    csvRow.push(
      '"' + i18n.t("static.common.youdatastart").replaceAll(" ", "%20") + '"'
    );
    csvRow.push("");
    const headers = [];
    if (viewby == 3) {
      columns.splice(0, 2);
      columns.map((item, idx) => {
        headers[idx] = item.text;
      });
    } else {
      columns.map((item, idx) => {
        headers[idx] = item.text.replaceAll(" ", "%20");
      });
    }
    var A = [addDoubleQuoteToRowContent(headers)];
    if (viewby == 1) {
      this.state.data.map((ele) =>
        A.push(
          addDoubleQuoteToRowContent([
            getLabelText(ele.procurementAgent.label, this.state.lang)
              .replaceAll(",", " ")
              .replaceAll(" ", "%20"),
            ele.procurementAgent.code
              .replaceAll(",", " ")
              .replaceAll(" ", "%20"),
            ele.planningUnit.id,
            getLabelText(ele.planningUnit.label, this.state.lang)
              .replaceAll(",", " ")
              .replaceAll(" ", "%20"),
            ele.qty,
            Number(ele.productCost).toFixed(2),
            ele.freightPerc,
            ele.freightCost,
            Number(ele.totalCost).toFixed(2),
          ])
        )
      );
    } else if (viewby == 2) {
      this.state.data.map((ele) =>
        A.push(
          addDoubleQuoteToRowContent([
            getLabelText(ele.fundingSource.label, this.state.lang)
              .replaceAll(",", " ")
              .replaceAll(" ", "%20"),
            getLabelText(ele.fundingSourceType.label, this.state.lang).replaceAll(",", " ").replaceAll(" ", "%20"),
            ele.planningUnit.id,
            getLabelText(ele.planningUnit.label, this.state.lang)
              .replaceAll(",", " ")
              .replaceAll(" ", "%20"),
            ele.qty,
            Number(ele.productCost).toFixed(2),
            ele.freightPerc,
            ele.freightCost,
            Number(ele.totalCost).toFixed(2),
          ])
        )
      );
    } else {
      this.state.data.map((ele) =>
        A.push(
          addDoubleQuoteToRowContent([
            ele.planningUnit.id,
            getLabelText(ele.planningUnit.label, this.state.lang)
              .replaceAll(",", " ")
              .replaceAll(" ", "%20"),
            ele.qty,
            Number(ele.productCost).toFixed(2),
            ele.freightPerc,
            ele.freightCost,
            Number(ele.totalCost).toFixed(2),
          ])
        )
      );
    }
    for (var i = 0; i < A.length; i++) {
      csvRow.push(A[i].join(","));
    }
    var csvString = csvRow.join("%0A");
    var a = document.createElement("a");
    a.href = "data:attachment/csv," + csvString;
    a.target = "_Blank";
    a.download =
      i18n.t("static.report.shipmentCostReport") +
      " " +
      i18n.t("static.program.savedBy") +
      document.getElementById("viewById").selectedOptions[0].text +
      "-" +
      this.state.rangeValue.from.year +
      this.state.rangeValue.from.month +
      i18n.t("static.report.consumptionTo") +
      this.state.rangeValue.to.year +
      this.state.rangeValue.to.month +
      ".csv";
    document.body.appendChild(a);
    a.click();
  }
  /**
   * Exports the data to a PDF file.
   * @param {array} columns - The columns to be exported.
   */
  exportPDF = (columns) => {
    const addFooters = (doc) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setPage(i);
        doc.text(
          "Page " + String(i) + " of " + String(pageCount),
          doc.internal.pageSize.width / 9,
          doc.internal.pageSize.height - 30,
          {
            align: "center",
          }
        );
        doc.text(
          "Copyright © 2020 " + i18n.t("static.footer"),
          (doc.internal.pageSize.width * 6) / 7,
          doc.internal.pageSize.height - 30,
          {
            align: "center",
          }
        );
      }
    };
    const addHeaders = (doc) => {
      const pageCount = doc.internal.getNumberOfPages();
      var viewby = document.getElementById("viewById").value;
      for (var i = 1; i <= pageCount; i++) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setPage(i);
        doc.addImage(LOGO, "png", 0, 10, 180, 50, "FAST");
        doc.setTextColor("#002f6c");
        doc.text(
          i18n.t("static.report.shipmentCostReport") +
          " " +
          i18n.t("static.program.savedBy") +
          " " +
          document.getElementById("viewById").selectedOptions[0].text,
          doc.internal.pageSize.width / 2,
          60,
          {
            align: "center",
          }
        );
        if (i == 1) {
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(
            i18n.t("static.report.dateRange") +
            " : " +
            makeText(this.state.rangeValue.from) +
            " ~ " +
            makeText(this.state.rangeValue.to),
            doc.internal.pageSize.width / 8,
            90,
            {
              align: "left",
            }
          );
          let poslen = 0;
          if (viewby == 1) {
            var procurementAgentText = doc.splitTextToSize(
              i18n.t("static.procurementagent.procurementagent") +
              " : " +
              this.state.procurementAgentLabels.join("; "),
              (doc.internal.pageSize.width * 3) / 4
            );
            doc.text(
              doc.internal.pageSize.width / 8,
              110,
              procurementAgentText
            );
            poslen = 110 + procurementAgentText.length;
          } else if (viewby == 2) {
            var fundingSourceTypeText = doc.splitTextToSize((i18n.t('static.funderTypeHead.funderType') + ' : ' + this.state.fundingSourceTypeLabels.join('; ')), doc.internal.pageSize.width * 3 / 4);
            doc.text(doc.internal.pageSize.width / 8, 110, fundingSourceTypeText);
            poslen = 110 + fundingSourceTypeText.length + 20;

            var fundingSourceText = doc.splitTextToSize(
              i18n.t("static.budget.fundingsource") +
              " : " +
              this.state.fundingSourceLabels.join("; "),
              (doc.internal.pageSize.width * 3) / 4
            );
            doc.text(doc.internal.pageSize.width / 8, poslen, fundingSourceText);
            poslen = poslen + fundingSourceText.length;
          } else {
            poslen = 90;
          }
          poslen = poslen + 20;
          doc.text(
            i18n.t("static.program.program") +
            " : " +
            document.getElementById("programId").selectedOptions[0].text,
            doc.internal.pageSize.width / 8,
            poslen,
            {
              align: "left",
            }
          );
          poslen = poslen + 20;
          doc.text(
            i18n.t("static.report.versionFinal*") +
            " : " +
            document.getElementById("versionId").selectedOptions[0].text,
            doc.internal.pageSize.width / 8,
            poslen,
            {
              align: "left",
            }
          );
          poslen = poslen + 20;
          doc.text(
            i18n.t("static.program.isincludeplannedshipment") +
            " : " +
            document.getElementById("isPlannedShipmentId").selectedOptions[0]
              .text,
            doc.internal.pageSize.width / 8,
            poslen,
            {
              align: "left",
            }
          );
          poslen = poslen + 20;
          var planningText = doc.splitTextToSize(
            i18n.t("static.planningunit.planningunit") +
            " : " +
            this.state.planningUnitLabels.join("; "),
            (doc.internal.pageSize.width * 3) / 4
          );
          doc.text(doc.internal.pageSize.width / 8, poslen, planningText);
        }
      }
    };
    const unit = "pt";
    const size = "A4";
    const orientation = "landscape";
    const marginLeft = 10;
    const doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(8);
    var viewby = document.getElementById("viewById").value;
    const headers = [];
    let data = [];
    if (viewby == 1) {
      columns.map((item, idx) => {
        headers[idx] = item.text;
      });
      data = this.state.data.map((ele) => [
        getLabelText(ele.procurementAgent.label, this.state.lang),
        ele.procurementAgent.code,
        ele.planningUnit.id,
        getLabelText(ele.planningUnit.label, this.state.lang),
        ele.qty.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        Number(ele.productCost)
          .toFixed(2)
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        Number(ele.freightPerc)
          .toFixed(2)
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        ele.freightCost
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        Number(ele.totalCost)
          .toFixed(2)
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
      ]);
    } else if (viewby == 2) {
      columns.map((item, idx) => {
        headers[idx] = item.text;
      });
      data = this.state.data.map((ele) => [
        getLabelText(ele.fundingSource.label, this.state.lang),
        getLabelText(ele.fundingSourceType.label, this.state.lang),
        ele.planningUnit.id,
        getLabelText(ele.planningUnit.label, this.state.lang),
        ele.qty.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        Number(ele.productCost)
          .toFixed(2)
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        Number(ele.freightPerc)
          .toFixed(2)
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        ele.freightCost
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        Number(ele.totalCost)
          .toFixed(2)
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
      ]);
    } else {
      columns.splice(0, 2);
      columns.map((item, idx) => {
        headers[idx] = item.text;
      });
      data = this.state.data.map((ele) => [
        ele.planningUnit.id,
        getLabelText(ele.planningUnit.label, this.state.lang),
        ele.qty.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        Number(ele.productCost)
          .toFixed(2)
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        Number(ele.freightPerc)
          .toFixed(2)
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        ele.freightCost
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        Number(ele.totalCost)
          .toFixed(2)
          .toString()
          .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
      ]);
    }
    let startY = 220 + this.state.planningUnitValues.length * 3;
    let content = {
      margin: { top: 80, bottom: 70 },
      startY: startY,
      head: [headers],
      body: data,
      styles: { lineWidth: 1, fontSize: 8, cellWidth: 65, halign: "center" },
      columnStyles: {
        0: { cellWidth: 149 },
        3: { cellWidth: 157.89 },
      },
    };
    if (viewby != 2 && viewby != 1) {
      content = {
        margin: { top: 80, bottom: 70 },
        startY: startY,
        head: [headers],
        body: data,
        styles: { lineWidth: 1, fontSize: 8, cellWidth: 90, halign: "center" },
        columnStyles: {
          1: { cellWidth: 221.89 },
        },
      };
    }
    doc.autoTable(content);
    addHeaders(doc);
    addFooters(doc);
    doc.save(
      i18n.t("static.report.shipmentCostReport") +
      " " +
      i18n.t("static.program.savedBy") +
      document.getElementById("viewById").selectedOptions[0].text +
      ".pdf"
    );
  };
  /**
   * Builds the jexcel table based on the data list.
   */
  buildJExcel() {
    let shipmentCosttList = this.state.data;
    let shipmentCostArray = [];
    let count = 0;
    let viewby = this.state.viewby;
    for (var j = 0; j < shipmentCosttList.length; j++) {
      data = [];
      data[0] =
        viewby == 1
          ? getLabelText(
            shipmentCosttList[j].procurementAgent.label,
            this.state.lang
          )
          : viewby == 2
            ? getLabelText(
              shipmentCosttList[j].fundingSource.label,
              this.state.lang
            )
            : {};
      data[1] =
        viewby == 1
          ? shipmentCosttList[j].procurementAgent.code
          : viewby == 2
            ? getLabelText(
              shipmentCosttList[j].fundingSourceType.label,
              this.state.lang
            )
            : {};
      data[2] = getLabelText(
        shipmentCosttList[j].planningUnit.label,
        this.state.lang
      );
      data[3] = shipmentCosttList[j].qty;
      data[4] = shipmentCosttList[j].productCost.toFixed(2);
      data[5] = shipmentCosttList[j].freightPerc.toFixed(2);
      data[6] = shipmentCosttList[j].freightCost;
      data[7] = shipmentCosttList[j].totalCost.toFixed(2);
      shipmentCostArray[count] = data;
      count++;
    }
    this.el = jexcel(document.getElementById("tableDiv"), "");
    jexcel.destroy(document.getElementById("tableDiv"), true);
    var data = shipmentCostArray;
    let obj1 = {};
    let obj2 = {};
    if (viewby == 1) {
      obj1 = {
        title: i18n.t("static.procurementagent.procurementagent"),
        type: "text",
      };
      obj2 = {
        title: i18n.t("static.report.procurementagentcode"),
        type: "text",
      };
    } else if (viewby == 2) {
      obj1 = {
        title: i18n.t("static.budget.fundingsource"),
        type: "text",
      };
      obj2 = {
        title: i18n.t("static.funderTypeHead.funderType"),
        type: "text",
      };
    } else {
      obj1 = {
        type: "hidden",
      };
      obj2 = {
        type: "hidden",
      };
    }
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [150, 80, 150, 80, 80, 80, 80, 80],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        obj1,
        obj2,
        {
          title: i18n.t("static.report.planningUnit"),
          type: "text",
        },
        {
          title: i18n.t("static.report.qty"),
          type: "numeric",
          mask: "#,##",
        },
        {
          title: i18n.t("static.report.productCost"),
          type: "numeric",
          mask: "#,##.00",
          decimal: ".",
        },
        {
          title: i18n.t("static.report.freightPer"),
          type: "numeric",
          mask: "#,##.00",
          decimal: ".",
        },
        {
          title: i18n.t("static.report.freightCost"),
          type: "numeric",
          mask: "#,##.00",
          decimal: ".",
        },
        {
          title: i18n.t("static.report.totalCost"),
          type: "numeric",
          mask: "#,##.00",
          decimal: ".",
        },
      ],
      editable: false,
      onload: loadedForNonEditableTables,
      pagination: localStorage.getItem("sesRecordCount"),
      search: true,
      columnSorting: true,
      wordWrap: true,
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: false,
      onselection: this.selected,
      oneditionend: this.onedit,
      copyCompatibility: true,
      allowExport: false,
      paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: "top",
      filters: true,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        return false;
      }.bind(this),
    };
    var languageEl = jexcel(document.getElementById("tableDiv"), options);
    this.el = languageEl;
    this.setState({
      languageEl: languageEl,
      loading: false,
    });
  }
  /**
   * Fetches data based on selected programs, planning units, and procurement agents.
   */
  fetchData = () => {
    let versionId = document.getElementById("versionId").value;
    let programId = document.getElementById("programId").value;
    let viewby = document.getElementById("viewById").value;
    let procurementAgentIds =
      this.state.procurementAgentValues.length ==
        this.state.procurementAgents.length
        ? []
        : this.state.procurementAgentValues.map((ele) => ele.value.toString());
    let fundingSourceIds =
      this.state.fundingSourceValues.length == this.state.fundingSources.length
        ? []
        : this.state.fundingSourceValues.map((ele) => ele.value.toString());
    let isPlannedShipmentId = document.getElementById(
      "isPlannedShipmentId"
    ).value;
    let planningUnitIds =
      this.state.planningUnitValues.length == this.state.planningUnits.length
        ? []
        : this.state.planningUnitValues.map((ele) => ele.value.toString());
    let startDate =
      this.state.rangeValue.from.year +
      "-" +
      this.state.rangeValue.from.month +
      "-01";
    let endDate =
      this.state.rangeValue.to.year +
      "-" +
      this.state.rangeValue.to.month +
      "-" +
      new Date(
        this.state.rangeValue.to.year,
        this.state.rangeValue.to.month,
        0
      ).getDate();
    if (viewby == 1) {
      if (
        programId > 0 &&
        versionId != 0 &&
        this.state.planningUnitValues.length > 0 &&
        this.state.procurementAgentValues.length > 0
      ) {
        if (versionId.includes("Local")) {
          planningUnitIds = this.state.planningUnitValues.map(
            (ele) => ele.value
          );
          var db1;
          getDatabase();
          this.setState({ loading: true });
          var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
          openRequest.onerror = function (event) {
            this.setState({
              message: i18n.t("static.program.errortext"),
              loading: false,
            });
          }.bind(this);
          openRequest.onsuccess = function (e) {
            var version = versionId.split("(")[0].trim();
            var userBytes = CryptoJS.AES.decrypt(
              localStorage.getItem("curUser"),
              SECRET_KEY
            );
            var userId = userBytes.toString(CryptoJS.enc.Utf8);
            var program = `${programId}_v${version}_uId_${userId}`;
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(
              ["programData"],
              "readwrite"
            );
            var programDataOs =
              programDataTransaction.objectStore("programData");
            var programRequest = programDataOs.get(program);
            programRequest.onerror = function (event) {
              this.setState({
                message: i18n.t("static.program.errortext"),
                loading: false,
              });
            }.bind(this);
            programRequest.onsuccess = function (e) {
              var planningUnitDataList =
                programRequest.result.programData.planningUnitDataList;
              var shipmentList = [];
              for (var pu = 0; pu < planningUnitDataList.length; pu++) {
                var planningUnitData = planningUnitDataList[pu];
                var programDataBytes = CryptoJS.AES.decrypt(
                  planningUnitData.planningUnitData,
                  SECRET_KEY
                );
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var sList = programJson.shipmentList;
                shipmentList = shipmentList.concat(sList);
              }
              var programTransaction = db1.transaction(
                ["program"],
                "readwrite"
              );
              var programOs = programTransaction.objectStore("program");
              var program1Request = programOs.getAll();
              program1Request.onerror = function (event) {
                this.setState({
                  loading: false,
                });
              }.bind(this);
              program1Request.onsuccess = function (event) {
                var programResult = [];
                programResult = program1Request.result;
                let airFreight = 0;
                let seaFreight = 0;
                for (var k = 0; k < programResult.length; k++) {
                  if (programId == programResult[k].programId) {
                    airFreight = programResult[k].airFreightPerc;
                    seaFreight = programResult[k].seaFreightPerc;
                  }
                }
                const activeFilter = shipmentList.filter(
                  (c) =>
                    (c.active == true || c.active == "true") &&
                    (c.accountFlag == true || c.accountFlag == "true")
                );
                let isPlannedShipment = [];
                if (isPlannedShipmentId == 1) {
                  isPlannedShipment = activeFilter.filter(
                    (c) => c.shipmentStatus.id != 8
                  );
                } else {
                  isPlannedShipment = activeFilter.filter(
                    (c) =>
                      c.shipmentStatus.id == 3 ||
                      c.shipmentStatus.id == 4 ||
                      c.shipmentStatus.id == 5 ||
                      c.shipmentStatus.id == 6 ||
                      c.shipmentStatus.id == 7
                  );
                }
                let data = [];
                this.state.procurementAgentValues.map((p) => {
                  var procurementAgentId = p.value;
                  const procurementAgentFilter = isPlannedShipment.filter(
                    (c) => c.procurementAgent.id == procurementAgentId
                  );
                  const dateFilter = procurementAgentFilter.filter((c) =>
                    moment(
                      c.receivedDate == null || c.receivedDate == ""
                        ? c.expectedDeliveryDate
                        : c.receivedDate
                    ).isBetween(startDate, endDate, null, "[]")
                  );
                  let planningUnitFilter = [];
                  for (let i = 0; i < planningUnitIds.length; i++) {
                    for (let j = 0; j < dateFilter.length; j++) {
                      if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
                        planningUnitFilter.push(dateFilter[j]);
                      }
                    }
                  }
                  for (let j = 0; j < planningUnitFilter.length; j++) {
                    let freight = 0;
                    if (planningUnitFilter[j].shipmentMode === "Air") {
                      freight = airFreight;
                    } else {
                      freight = seaFreight;
                    }
                    var planningUnit = this.state.planningUnits.filter(
                      (c) => c.id == planningUnitFilter[j].id
                    );
                    var procurementAgent = this.state.procurementAgents.filter(
                      (c) =>
                        c.procurementAgentId ==
                        planningUnitFilter[j].procurementAgent.id
                    );
                    if (procurementAgent.length > 0) {
                      var simplePAObject = {
                        id: procurementAgent[0].procurementAgentId,
                        label: procurementAgent[0].label,
                        code: procurementAgent[0].procurementAgentCode,
                      };
                    }
                    // var fundingSource = this.state.fundingSources.filter(
                    var fundingSource = this.state.fundingSourcesFiltered.filter(
                      (c) =>
                        c.fundingSourceId ==
                        planningUnitFilter[j].fundingSource.id
                    );
                    if (fundingSource.length > 0) {
                      var simpleFSObject = {
                        id: fundingSource[0].fundingSourceId,
                        label: fundingSource[0].label,
                        code: fundingSource[0].fundingSourceCode,
                      };
                    }
                    let json = {
                      active: true,
                      shipmentId: planningUnitFilter[j].shipmentId,
                      procurementAgent:
                        procurementAgent.length > 0
                          ? simplePAObject
                          : planningUnitFilter[j].procurementAgent,
                      fundingSource:
                        fundingSource.length > 0
                          ? simpleFSObject
                          : planningUnitFilter[j].fundingSource,
                      planningUnit:
                        planningUnit.length > 0
                          ? planningUnit[0].planningUnit
                          : planningUnitFilter[j].planningUnit,
                      qty: planningUnitFilter[j].shipmentQty,
                      productCost:
                        planningUnitFilter[j].productCost *
                        planningUnitFilter[j].currency.conversionRateToUsd,
                      freightCost:
                        planningUnitFilter[j].freightCost *
                        planningUnitFilter[j].currency.conversionRateToUsd,
                      totalCost:
                        planningUnitFilter[j].productCost *
                        planningUnitFilter[j].currency.conversionRateToUsd +
                        planningUnitFilter[j].freightCost *
                        planningUnitFilter[j].currency.conversionRateToUsd,
                      currency: planningUnitFilter[j].currency,
                    };
                    data.push(json);
                  }
                });
                var planningUnitsinData = data.map((q) =>
                  parseInt(q.planningUnit.id)
                );
                var useFilter = planningUnitsinData.filter(
                  (q, idx) => planningUnitsinData.indexOf(q) === idx
                );
                var filteredData = [];
                var myJson = [];
                for (var uf = 0; uf < useFilter.length; uf++) {
                  var planningUnitFilterdata = data.filter(
                    (c) => c.planningUnit.id == useFilter[uf]
                  );
                  var procurementAgentIds = planningUnitFilterdata.map((q) =>
                    parseInt(q.procurementAgent.id)
                  );
                  var uniqueProcurementAgentIds = procurementAgentIds.filter(
                    (q, idx) => procurementAgentIds.indexOf(q) === idx
                  );
                  for (var u = 0; u < uniqueProcurementAgentIds.length; u++) {
                    var pupaFilterdata = planningUnitFilterdata.filter(
                      (c) =>
                        c.procurementAgent.id == uniqueProcurementAgentIds[u]
                    );
                    var qty = 0;
                    var productCost = 0;
                    var freightCost = 0;
                    var totalCost = 0;
                    for (var pf = 0; pf < pupaFilterdata.length; pf++) {
                      qty = Number(qty) + Number(pupaFilterdata[pf].qty);
                      productCost =
                        Number(productCost) +
                        Number(pupaFilterdata[pf].productCost);
                      freightCost =
                        Number(freightCost) +
                        Number(pupaFilterdata[pf].freightCost) *
                        Number(
                          pupaFilterdata[pf].currency.conversionRateToUsd
                        );
                      totalCost =
                        Number(totalCost) +
                        Number(pupaFilterdata[pf].productCost) *
                        Number(
                          pupaFilterdata[pf].currency.conversionRateToUsd
                        ) +
                        Number(pupaFilterdata[pf].freightCost) *
                        Number(
                          pupaFilterdata[pf].currency.conversionRateToUsd
                        );
                    }
                    myJson = {
                      active: true,
                      shipmentId: pupaFilterdata[0].shipmentId,
                      procurementAgent: pupaFilterdata[0].procurementAgent,
                      fundingSource: pupaFilterdata[0].fundingSource,
                      planningUnit: pupaFilterdata[0].planningUnit,
                      qty: qty,
                      productCost: productCost,
                      freightPerc: Number(
                        (Number(freightCost) / Number(productCost)) * 100
                      ),
                      freightCost: freightCost,
                      totalCost: totalCost,
                    };
                    filteredData.push(myJson);
                  }
                }
                this.setState(
                  {
                    data: filteredData,
                    message: "",
                  },
                  () => {
                    this.buildJExcel();
                  }
                );
              }.bind(this);
            }.bind(this);
          }.bind(this);
        } else {
          this.setState({
            message: "",
            loading: true,
          });
          let includePlannedShipments = true;
          if (isPlannedShipmentId == 1) {
            includePlannedShipments = true;
          } else {
            includePlannedShipments = false;
          }
          var inputjson = {
            procurementAgentIds: procurementAgentIds,
            programId: programId,
            versionId: versionId,
            startDate: startDate,
            stopDate: endDate,
            planningUnitIds: planningUnitIds,
            includePlannedShipments: includePlannedShipments,
          };
          this.setState({ loading: true });
          ReportService.procurementAgentExporttList(inputjson)
            .then((response) => {
              this.setState(
                {
                  data: response.data,
                  loading: false,
                },
                () => {
                  this.buildJExcel();
                }
              );
            })
            .catch((error) => {
              this.setState(
                {
                  data: [],
                  loading: false,
                },
                () => {
                  this.consolidatedProcurementAgentList();
                  this.el = jexcel(document.getElementById("tableDiv"), "");
                  jexcel.destroy(document.getElementById("tableDiv"), true);
                }
              );
              if (error.message === "Network Error") {
                this.setState({
                  message: API_URL.includes("uat")
                    ? i18n.t("static.common.uatNetworkErrorMessage")
                    : API_URL.includes("demo")
                      ? i18n.t("static.common.demoNetworkErrorMessage")
                      : i18n.t("static.common.prodNetworkErrorMessage"),
                  loading: false,
                });
              } else {
                switch (error.response ? error.response.status : "") {
                  case 401:
                    this.props.history.push(
                      `/login/static.message.sessionExpired`
                    );
                    break;
                  case 403:
                    this.props.history.push(`/accessDenied`);
                    break;
                  case 500:
                  case 404:
                  case 406:
                    this.setState({
                      message: i18n.t(error.response.data.messageCode),
                      loading: false,
                    });
                    break;
                  case 412:
                    this.setState({
                      message: i18n.t(error.response.data.messageCode),
                      loading: false,
                    });
                    break;
                  default:
                    this.setState({
                      message: "static.unkownError",
                      loading: false,
                    });
                    break;
                }
              }
            });
        }
      } else if (programId == 0) {
        this.setState(
          { message: i18n.t("static.report.selectProgram"), data: [] },
          () => {
            this.el = jexcel(document.getElementById("tableDiv"), "");
            jexcel.destroy(document.getElementById("tableDiv"), true);
          }
        );
      } else if (versionId == 0) {
        this.setState(
          { message: i18n.t("static.program.validversion"), data: [] },
          () => {
            this.el = jexcel(document.getElementById("tableDiv"), "");
            jexcel.destroy(document.getElementById("tableDiv"), true);
          }
        );
      } else if (this.state.planningUnitValues.length == 0) {
        this.setState(
          {
            message: i18n.t("static.procurementUnit.validPlanningUnitText"),
            data: [],
          },
          () => {
            this.el = jexcel(document.getElementById("tableDiv"), "");
            jexcel.destroy(document.getElementById("tableDiv"), true);
          }
        );
      } else if (this.state.procurementAgentValues.length == 0) {
        this.setState(
          {
            message: i18n.t("static.procurementAgent.selectProcurementAgent"),
            data: [],
          },
          () => {
            this.el = jexcel(document.getElementById("tableDiv"), "");
            jexcel.destroy(document.getElementById("tableDiv"), true);
          }
        );
      }
    } else if (viewby == 2) {
      if (
        programId > 0 &&
        versionId != 0 &&
        this.state.planningUnitValues.length > 0 &&
        this.state.fundingSourceValues.length > 0
      ) {
        if (versionId.includes("Local")) {
          planningUnitIds = this.state.planningUnitValues.map(
            (ele) => ele.value
          );
          var db1;
          getDatabase();
          this.setState({ loading: true });
          var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
          openRequest.onerror = function (event) {
            this.setState({
              message: i18n.t("static.program.errortext"),
              loading: false,
            });
          }.bind(this);
          openRequest.onsuccess = function (e) {
            var version = versionId.split("(")[0].trim();
            var userBytes = CryptoJS.AES.decrypt(
              localStorage.getItem("curUser"),
              SECRET_KEY
            );
            var userId = userBytes.toString(CryptoJS.enc.Utf8);
            var program = `${programId}_v${version}_uId_${userId}`;
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(
              ["programData"],
              "readwrite"
            );
            var programDataOs =
              programDataTransaction.objectStore("programData");
            var programRequest = programDataOs.get(program);
            programRequest.onerror = function (event) {
              this.setState({
                message: i18n.t("static.program.errortext"),
                loading: false,
              });
            }.bind(this);
            programRequest.onsuccess = function (e) {
              var planningUnitDataList =
                programRequest.result.programData.planningUnitDataList;
              var shipmentList = [];
              for (var pu = 0; pu < planningUnitDataList.length; pu++) {
                var planningUnitData = planningUnitDataList[pu];
                var programDataBytes = CryptoJS.AES.decrypt(
                  planningUnitData.planningUnitData,
                  SECRET_KEY
                );
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var sList = programJson.shipmentList;
                shipmentList = shipmentList.concat(sList);
              }
              var programTransaction = db1.transaction(
                ["program"],
                "readwrite"
              );
              var programOs = programTransaction.objectStore("program");
              var program1Request = programOs.getAll();
              program1Request.onerror = function (event) {
                this.setState({
                  loading: false,
                });
              }.bind(this);
              program1Request.onsuccess = function (event) {
                var programResult = [];
                programResult = program1Request.result;
                let airFreight = 0;
                let seaFreight = 0;
                for (var k = 0; k < programResult.length; k++) {
                  if (programId == programResult[k].programId) {
                    airFreight = programResult[k].airFreightPerc;
                    seaFreight = programResult[k].seaFreightPerc;
                  }
                }
                const activeFilter = shipmentList.filter(
                  (c) =>
                    (c.active == true || c.active == "true") &&
                    (c.accountFlag == true || c.accountFlag == "true")
                );
                let isPlannedShipment = [];
                if (isPlannedShipmentId == 1) {
                  isPlannedShipment = activeFilter.filter(
                    (c) => c.shipmentStatus.id != 8
                  );
                } else {
                  isPlannedShipment = activeFilter.filter(
                    (c) =>
                      c.shipmentStatus.id == 3 ||
                      c.shipmentStatus.id == 4 ||
                      c.shipmentStatus.id == 5 ||
                      c.shipmentStatus.id == 6 ||
                      c.shipmentStatus.id == 7
                  );
                }
                let data = [];
                this.state.fundingSourceValues.map((f) => {
                  var fundingSourceId = f.value;
                  const fundingSourceFilter = isPlannedShipment.filter(
                    (c) => c.fundingSource.id == fundingSourceId
                  );
                  const dateFilter = fundingSourceFilter.filter((c) =>
                    moment(
                      c.receivedDate == null || c.receivedDate == ""
                        ? c.expectedDeliveryDate
                        : c.receivedDate
                    ).isBetween(startDate, endDate, null, "[]")
                  );
                  let planningUnitFilter = [];
                  for (let i = 0; i < planningUnitIds.length; i++) {
                    for (let j = 0; j < dateFilter.length; j++) {
                      if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
                        planningUnitFilter.push(dateFilter[j]);
                      }
                    }
                  }
                  for (let j = 0; j < planningUnitFilter.length; j++) {
                    let freight = 0;
                    if (planningUnitFilter[j].shipmentMode === "Air") {
                      freight = airFreight;
                    } else {
                      freight = seaFreight;
                    }
                    var planningUnit = this.state.planningUnits.filter(
                      (c) => c.id == planningUnitFilter[j].id
                    );
                    // var fundingSource = this.state.fundingSources.filter(//old
                    var fundingSource = this.state.fundingSourcesFiltered.filter(//change here
                      (c) =>
                        c.fundingSourceId ==
                        planningUnitFilter[j].fundingSource.id
                    );
                    if (fundingSource.length > 0) {
                      var simpleFSObject = {
                        id: fundingSource[0].fundingSourceId,
                        label: fundingSource[0].label,
                        code: fundingSource[0].fundingSourceCode,                        
                      };
                    }
                    let json = {
                      active: true,
                      shipmentId: planningUnitFilter[j].shipmentId,
                      fundingSource:
                        fundingSource.length > 0
                          ? simpleFSObject
                          : planningUnitFilter[j].fundingSource,
                      fundingSourceType: fundingSource[0].fundingSourceType,
                      planningUnit:
                        planningUnit.length > 0
                          ? planningUnit[0].planningUnit
                          : planningUnitFilter[j].planningUnit,
                      qty: planningUnitFilter[j].shipmentQty,
                      productCost:
                        planningUnitFilter[j].productCost *
                        planningUnitFilter[j].currency.conversionRateToUsd,
                      freightCost:
                        planningUnitFilter[j].freightCost *
                        planningUnitFilter[j].currency.conversionRateToUsd,
                      totalCost:
                        planningUnitFilter[j].productCost *
                        planningUnitFilter[j].currency.conversionRateToUsd +
                        planningUnitFilter[j].freightCost *
                        planningUnitFilter[j].currency.conversionRateToUsd,
                      currency: planningUnitFilter[j].currency,
                    };
                    data.push(json);
                  }
                });
                var planningUnitsinData = data.map((q) => parseInt(q.planningUnit.id));
                var useFilter = planningUnitsinData.filter(
                  (q, idx) => planningUnitsinData.indexOf(q) === idx
                );
                var filteredData = [];
                var myJson = [];
                for (var uf = 0; uf < useFilter.length; uf++) {
                  var planningUnitFilterdata = data.filter(
                    (c) => c.planningUnit.id == useFilter[uf]
                  );
                  var fundingSourceIds = planningUnitFilterdata.map((q) =>
                    parseInt(q.fundingSource.id)
                  );
                  var uniqueFundingSourceIds = fundingSourceIds.filter(
                    (q, idx) => fundingSourceIds.indexOf(q) === idx
                  );
                  for (var u = 0; u < uniqueFundingSourceIds.length; u++) {
                    var pupaFilterdata = planningUnitFilterdata.filter(
                      (c) => c.fundingSource.id == uniqueFundingSourceIds[u]
                    );
                    var qty = 0;
                    var productCost = 0;
                    var freightCost = 0;
                    var totalCost = 0;
                    for (var pf = 0; pf < pupaFilterdata.length; pf++) {
                      qty = Number(qty) + Number(pupaFilterdata[pf].qty);
                      productCost =
                        Number(productCost) +
                        Number(pupaFilterdata[pf].productCost);
                      freightCost =
                        Number(freightCost) +
                        Number(pupaFilterdata[pf].freightCost) *
                        Number(
                          pupaFilterdata[pf].currency.conversionRateToUsd
                        );
                      totalCost =
                        Number(totalCost) +
                        Number(pupaFilterdata[pf].productCost) *
                        Number(
                          pupaFilterdata[pf].currency.conversionRateToUsd
                        ) +
                        Number(pupaFilterdata[pf].freightCost) *
                        Number(
                          pupaFilterdata[pf].currency.conversionRateToUsd
                        );
                    }
                    myJson = {
                      active: true,
                      shipmentId: pupaFilterdata[0].shipmentId,
                      procurementAgent: pupaFilterdata[0].procurementAgent,
                      fundingSource: pupaFilterdata[0].fundingSource,
                      fundingSourceType: pupaFilterdata[0].fundingSourceType,
                      planningUnit: pupaFilterdata[0].planningUnit,
                      qty: qty,
                      productCost: productCost,
                      freightPerc: Number(
                        (Number(freightCost) / Number(productCost)) * 100
                      ),
                      freightCost: freightCost,
                      totalCost: totalCost,
                    };
                    filteredData.push(myJson);
                  }
                }
                this.setState(
                  {
                    data: filteredData,
                    message: "",
                  },
                  () => {
                    this.buildJExcel();
                  }
                );
              }.bind(this);
            }.bind(this);
          }.bind(this);
        } else {
          this.setState({
            message: "",
            loading: true,
          });
          let includePlannedShipments = true;
          if (isPlannedShipmentId == 1) {
            includePlannedShipments = true;
          } else {
            includePlannedShipments = false;
          }
          var inputjson = {
            fundingSourceIds: fundingSourceIds,
            programId: programId,
            versionId: versionId,
            startDate: startDate,
            stopDate: endDate,
            planningUnitIds: planningUnitIds,
            includePlannedShipments: includePlannedShipments,
          };
          this.setState({ loading: true });
          ReportService.fundingSourceExportList(inputjson)
            .then((response) => {
              this.setState(
                {
                  data: response.data,
                  loading: false,
                },
                () => {
                  // this.consolidatedFundingSourceList();
                  this.buildJExcel();
                }
              );
            })
            .catch((error) => {
              this.setState(
                {
                  data: [],
                  loading: false,
                },
                () => {
                  // this.consolidatedFundingSourceList();
                  this.el = jexcel(document.getElementById("tableDiv"), "");
                  jexcel.destroy(document.getElementById("tableDiv"), true);
                }
              );
              if (error.message === "Network Error") {
                this.setState({
                  message: API_URL.includes("uat")
                    ? i18n.t("static.common.uatNetworkErrorMessage")
                    : API_URL.includes("demo")
                      ? i18n.t("static.common.demoNetworkErrorMessage")
                      : i18n.t("static.common.prodNetworkErrorMessage"),
                  loading: false,
                });
              } else {
                switch (error.response ? error.response.status : "") {
                  case 401:
                    this.props.history.push(
                      `/login/static.message.sessionExpired`
                    );
                    break;
                  case 403:
                    this.props.history.push(`/accessDenied`);
                    break;
                  case 500:
                  case 404:
                  case 406:
                    this.setState({
                      message: i18n.t(error.response.data.messageCode),
                      loading: false,
                    });
                    break;
                  case 412:
                    this.setState({
                      message: i18n.t(error.response.data.messageCode),
                      loading: false,
                    });
                    break;
                  default:
                    this.setState({
                      message: "static.unkownError",
                      loading: false,
                    });
                    break;
                }
              }
            });
        }
      } else if (programId == 0) {
        this.setState(
          { message: i18n.t("static.report.selectProgram"), data: [] },
          () => {
            this.el = jexcel(document.getElementById("tableDiv"), "");
            jexcel.destroy(document.getElementById("tableDiv"), true);
          }
        );
      } else if (versionId == 0) {
        this.setState(
          { message: i18n.t("static.program.validversion"), data: [] },
          () => {
            this.el = jexcel(document.getElementById("tableDiv"), "");
            jexcel.destroy(document.getElementById("tableDiv"), true);
          }
        );
      } else if (this.state.planningUnitValues.length == 0) {
        this.setState(
          {
            message: i18n.t("static.procurementUnit.validPlanningUnitText"),
            data: [],
          },
          () => {
            this.el = jexcel(document.getElementById("tableDiv"), "");
            jexcel.destroy(document.getElementById("tableDiv"), true);
          }
        );
      } else if (this.state.fundingSourceValues.length == 0) {
        this.setState(
          {
            message: i18n.t("static.fundingSource.selectFundingSource"),
            data: [],
          },
          () => {
            this.el = jexcel(document.getElementById("tableDiv"), "");
            jexcel.destroy(document.getElementById("tableDiv"), true);
          }
        );
      }
    } else {
      if (
        programId > 0 &&
        versionId != 0 &&
        this.state.planningUnitValues.length > 0
      ) {
        if (versionId.includes("Local")) {
          planningUnitIds = this.state.planningUnitValues.map(
            (ele) => ele.value
          );
          var db1;
          getDatabase();
          this.setState({ loading: true });
          var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
          openRequest.onerror = function (event) {
            this.setState({
              message: i18n.t("static.program.errortext"),
              loading: false,
            });
          }.bind(this);
          openRequest.onsuccess = function (e) {
            var version = versionId.split("(")[0].trim();
            var userBytes = CryptoJS.AES.decrypt(
              localStorage.getItem("curUser"),
              SECRET_KEY
            );
            var userId = userBytes.toString(CryptoJS.enc.Utf8);
            var program = `${programId}_v${version}_uId_${userId}`;
            db1 = e.target.result;
            var programDataTransaction = db1.transaction(
              ["programData"],
              "readwrite"
            );
            var programDataOs =
              programDataTransaction.objectStore("programData");
            var programRequest = programDataOs.get(program);
            programRequest.onerror = function (event) {
              this.setState({
                message: i18n.t("static.program.errortext"),
                loading: false,
              });
            }.bind(this);
            programRequest.onsuccess = function (e) {
              var planningUnitDataList =
                programRequest.result.programData.planningUnitDataList;
              var shipmentList = [];
              for (var pu = 0; pu < planningUnitDataList.length; pu++) {
                var planningUnitData = planningUnitDataList[pu];
                var programDataBytes = CryptoJS.AES.decrypt(
                  planningUnitData.planningUnitData,
                  SECRET_KEY
                );
                var programData = programDataBytes.toString(CryptoJS.enc.Utf8);
                var programJson = JSON.parse(programData);
                var sList = programJson.shipmentList;
                shipmentList = shipmentList.concat(sList);
              }
              var programTransaction = db1.transaction(
                ["program"],
                "readwrite"
              );
              var programOs = programTransaction.objectStore("program");
              var program1Request = programOs.getAll();
              program1Request.onerror = function (event) {
                this.setState({
                  loading: false,
                });
              }.bind(this);
              program1Request.onsuccess = function (event) {
                var programResult = [];
                programResult = program1Request.result;
                let airFreight = 0;
                let seaFreight = 0;
                for (var k = 0; k < programResult.length; k++) {
                  if (programId == programResult[k].programId) {
                    airFreight = programResult[k].airFreightPerc;
                    seaFreight = programResult[k].seaFreightPerc;
                  }
                }
                const activeFilter = shipmentList.filter(
                  (c) =>
                    (c.active == true || c.active == "true") &&
                    (c.accountFlag == true || c.accountFlag == "true")
                );
                let isPlannedShipment = [];
                if (isPlannedShipmentId == 1) {
                  isPlannedShipment = activeFilter.filter(
                    (c) => c.shipmentStatus.id != 8
                  );
                } else {
                  isPlannedShipment = activeFilter.filter(
                    (c) =>
                      c.shipmentStatus.id == 3 ||
                      c.shipmentStatus.id == 4 ||
                      c.shipmentStatus.id == 5 ||
                      c.shipmentStatus.id == 6 ||
                      c.shipmentStatus.id == 7
                  );
                }
                const dateFilter = isPlannedShipment.filter((c) =>
                  moment(
                    c.receivedDate == null || c.receivedDate == ""
                      ? c.expectedDeliveryDate
                      : c.receivedDate
                  ).isBetween(startDate, endDate, null, "[]")
                );
                let data = [];
                let planningUnitFilter = [];
                for (let i = 0; i < planningUnitIds.length; i++) {
                  for (let j = 0; j < dateFilter.length; j++) {
                    if (dateFilter[j].planningUnit.id == planningUnitIds[i]) {
                      planningUnitFilter.push(dateFilter[j]);
                    }
                  }
                }
                for (let j = 0; j < planningUnitFilter.length; j++) {
                  let freight = 0;
                  if (planningUnitFilter[j].shipmentMode === "Air") {
                    freight = airFreight;
                  } else {
                    freight = seaFreight;
                  }
                  var planningUnit = this.state.planningUnits.filter(
                    (c) => c.id == planningUnitFilter[j].id
                  );
                  let json = {
                    active: true,
                    shipmentId: planningUnitFilter[j].shipmentId,
                    planningUnit:
                      planningUnit.length > 0
                        ? planningUnit[0].planningUnit
                        : planningUnitFilter[j].planningUnit,
                    qty: planningUnitFilter[j].shipmentQty,
                    productCost:
                      planningUnitFilter[j].productCost *
                      planningUnitFilter[j].currency.conversionRateToUsd,
                    freightCost:
                      planningUnitFilter[j].freightCost *
                      planningUnitFilter[j].currency.conversionRateToUsd,
                    totalCost:
                      planningUnitFilter[j].productCost *
                      planningUnitFilter[j].currency.conversionRateToUsd +
                      planningUnitFilter[j].freightCost *
                      planningUnitFilter[j].currency.conversionRateToUsd,
                    currency: planningUnitFilter[j].currency,
                  };
                  data.push(json);
                }
                var planningUnitsinData = data.map((q) => parseInt(q.planningUnit.id));
                var useFilter = planningUnitsinData.filter(
                  (q, idx) => planningUnitsinData.indexOf(q) === idx
                );
                var filteredData = [];
                var myJson = [];
                for (var uf = 0; uf < useFilter.length; uf++) {
                  var planningUnitFilterdata = data.filter(
                    (c) => c.planningUnit.id == useFilter[uf]
                  );
                  var qty = 0;
                  var productCost = 0;
                  var freightCost = 0;
                  var totalCost = 0;
                  for (var pf = 0; pf < planningUnitFilterdata.length; pf++) {
                    qty = Number(qty) + Number(planningUnitFilterdata[pf].qty);
                    productCost =
                      Number(productCost) +
                      Number(planningUnitFilterdata[pf].productCost);
                    freightCost =
                      Number(freightCost) +
                      Number(planningUnitFilterdata[pf].freightCost) *
                      Number(
                        planningUnitFilterdata[pf].currency
                          .conversionRateToUsd
                      );
                    totalCost =
                      Number(totalCost) +
                      Number(planningUnitFilterdata[pf].productCost) *
                      Number(
                        planningUnitFilterdata[pf].currency
                          .conversionRateToUsd
                      ) +
                      Number(planningUnitFilterdata[pf].freightCost) *
                      Number(
                        planningUnitFilterdata[pf].currency
                          .conversionRateToUsd
                      );
                  }
                  myJson = {
                    active: true,
                    shipmentId: planningUnitFilterdata[0].shipmentId,
                    procurementAgent:
                      planningUnitFilterdata[0].procurementAgent,
                    fundingSource: planningUnitFilterdata[0].fundingSource,
                    planningUnit: planningUnitFilterdata[0].planningUnit,
                    qty: qty,
                    productCost: productCost,
                    freightPerc: Number(
                      (Number(freightCost) / Number(productCost)) * 100
                    ),
                    freightCost: freightCost,
                    totalCost: totalCost,
                  };
                  filteredData.push(myJson);
                }
                this.setState(
                  {
                    data: filteredData,
                    message: "",
                  },
                  () => {
                    this.buildJExcel();
                  }
                );
              }.bind(this);
            }.bind(this);
          }.bind(this);
        } else {
          this.setState({
            message: "",
            loading: true,
          });
          let includePlannedShipments = true;
          if (isPlannedShipmentId == 1) {
            includePlannedShipments = true;
          } else {
            includePlannedShipments = false;
          }
          var inputjson = {
            programId: programId,
            versionId: versionId,
            startDate: startDate,
            stopDate: endDate,
            planningUnitIds: planningUnitIds,
            includePlannedShipments: includePlannedShipments,
          };
          this.setState({ loading: true });
          ReportService.AggregateShipmentByProduct(inputjson)
            .then((response) => {
              this.setState(
                {
                  data: response.data,
                  loading: false,
                },
                () => {
                  this.buildJExcel();
                }
              );
            })
            .catch((error) => {
              this.setState(
                {
                  data: [],
                  loading: false,
                },
                () => {
                  this.consolidatedProcurementAgentList();
                  this.el = jexcel(document.getElementById("tableDiv"), "");
                  jexcel.destroy(document.getElementById("tableDiv"), true);
                }
              );
              if (error.message === "Network Error") {
                this.setState({
                  message: API_URL.includes("uat")
                    ? i18n.t("static.common.uatNetworkErrorMessage")
                    : API_URL.includes("demo")
                      ? i18n.t("static.common.demoNetworkErrorMessage")
                      : i18n.t("static.common.prodNetworkErrorMessage"),
                  loading: false,
                });
              } else {
                switch (error.response ? error.response.status : "") {
                  case 401:
                    this.props.history.push(
                      `/login/static.message.sessionExpired`
                    );
                    break;
                  case 403:
                    this.props.history.push(`/accessDenied`);
                    break;
                  case 500:
                  case 404:
                  case 406:
                    this.setState({
                      message: i18n.t(error.response.data.messageCode),
                      loading: false,
                    });
                    break;
                  case 412:
                    this.setState({
                      message: i18n.t(error.response.data.messageCode),
                      loading: false,
                    });
                    break;
                  default:
                    this.setState({
                      message: "static.unkownError",
                      loading: false,
                    });
                    break;
                }
              }
            });
        }
      } else if (programId == 0) {
        this.setState(
          { message: i18n.t("static.report.selectProgram"), data: [] },
          () => {
            this.el = jexcel(document.getElementById("tableDiv"), "");
            jexcel.destroy(document.getElementById("tableDiv"), true);
          }
        );
      } else if (versionId == 0) {
        this.setState(
          { message: i18n.t("static.program.validversion"), data: [] },
          () => {
            this.el = jexcel(document.getElementById("tableDiv"), "");
            jexcel.destroy(document.getElementById("tableDiv"), true);
          }
        );
      } else if (this.state.planningUnitValues.length == 0) {
        this.setState(
          {
            message: i18n.t("static.procurementUnit.validPlanningUnitText"),
            data: [],
          },
          () => {
            this.el = jexcel(document.getElementById("tableDiv"), "");
            jexcel.destroy(document.getElementById("tableDiv"), true);
          }
        );
      }
    }
  };
  /**
   * Toggles the view based on the selected option.
   */
  toggleView = () => {
    let viewby = document.getElementById("viewById").value;
    this.setState({
      viewby: viewby,
    });
    if (viewby == 1) {
      document.getElementById("fundingSourceDiv").style.display = "none";
      document.getElementById("fundingSourceTypeDiv").style.display = "none";
      document.getElementById("procurementAgentDiv").style.display = "block";
      this.setState(
        {
          data: [],
        },
        () => {
          this.fetchData();
          this.el = jexcel(document.getElementById("tableDiv"), "");
          jexcel.destroy(document.getElementById("tableDiv"), true);
        }
      );
    } else if (viewby == 2) {
      document.getElementById("procurementAgentDiv").style.display = "none";
      document.getElementById("fundingSourceDiv").style.display = "block";
      document.getElementById("fundingSourceTypeDiv").style.display = "block";
      this.setState(
        {
          data: [],
        },
        () => {
          this.fetchData();
          this.el = jexcel(document.getElementById("tableDiv"), "");
          jexcel.destroy(document.getElementById("tableDiv"), true);
        }
      );
    } else {
      document.getElementById("procurementAgentDiv").style.display = "none";
      document.getElementById("fundingSourceDiv").style.display = "none";
      document.getElementById("fundingSourceTypeDiv").style.display = "none";
      this.setState(
        {
          data: [],
        },
        () => {
          this.fetchData();
          this.el = jexcel(document.getElementById("tableDiv"), "");
          jexcel.destroy(document.getElementById("tableDiv"), true);
        }
      );
    }
  };
  /**
   * Calls the get programs and funding source function on page load
   */
  componentDidMount() {
    this.getFundingSourceType();
    this.getFundingSource();
    this.getPrograms();
    document.getElementById("procurementAgentDiv").style.display = "none";
    let viewby = document.getElementById("viewById").value;
    this.setState({
      viewby: viewby,
    });
  }
  /**
   * Sets the selected program ID and triggers fetching of procurement agents and filter versions.
   * @param {object} event - The event object containing information about the program selection.
   */
  setProgramId(event) {
    this.setState(
      {
        programId: event.target.value,
        versionId: "",
      },
      () => {
        localStorage.setItem("sesVersionIdReport", "");
        this.getProcurementAgent();
        this.filterVersion();
      }
    );
  }
  /**
   * Sets the version ID and calls the fetch data function.
   * @param {Object} event - The event object containing the version ID value.
   */
  setVersionId(event) {
    if (this.state.versionId != "" || this.state.versionId != undefined) {
      this.setState(
        {
          versionId: event.target.value,
        },
        () => {
          localStorage.setItem("sesVersionIdReport", this.state.versionId);
          this.fetchData();
        }
      );
    } else {
      this.setState(
        {
          versionId: event.target.value,
        },
        () => {
          this.getPlanningUnit();
        }
      );
    }
  }

  /**
   * Retrieves the list of funding sources types.
   */
  getFundingSourceType = () => {
    //Fetch realmId
    let realmId = AuthenticationService.getRealmId();
    this.setState({ loading: true });
    if (localStorage.getItem("sessionType") === 'Online') {
      //Fetch all funding source type list
      FundingSourceService.getFundingsourceTypeListByRealmId(realmId)
        .then(response => {
          if (response.status == 200) {
            var fundingSourceTypes = response.data;
            fundingSourceTypes.sort(function (a, b) {
              a = a.fundingSourceTypeCode.toLowerCase();
              b = b.fundingSourceTypeCode.toLowerCase();
              return a < b ? -1 : a > b ? 1 : 0;
            })

            this.setState({
              fundingSourceTypes: fundingSourceTypes, loading: false,
              // fundingSourceTypeValues: fundingSourceTypeValues,
              // fundingSourceTypeLabels: fundingSourceTypeValues.map(ele => ele.label)
            }, () => {
              this.consolidatedFundingSourceTypeList();
            })
          } else {
            this.setState({
              message: response.data.messageCode, loading: false
            },
              () => {
                this.consolidatedFundingSourceTypeList();
              })
          }
        }).catch(
          error => {
            this.setState({
              fundingSourceTypes: [], loading: false
            }, () => {
              this.consolidatedFundingSourceTypeList();
            })
            if (error.message === "Network Error") {
              this.setState({
                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                loading: false
              });
            } else {
              switch (error.response ? error.response.status : "") {
                case 401:
                  this.props.history.push(`/login/static.message.sessionExpired`)
                  break;
                case 403:
                  this.props.history.push(`/accessDenied`)
                  break;
                case 500:
                case 404:
                case 406:
                  this.setState({
                    message: error.response.data.messageCode,
                    loading: false
                  });
                  break;
                case 412:
                  this.setState({
                    message: error.response.data.messageCode,
                    loading: false
                  });
                  break;
                default:
                  this.setState({
                    message: 'static.unkownError',
                    loading: false
                  });
                  break;
              }
            }
          }
        );
    } else {
      //Offline
      this.consolidatedFundingSourceTypeList();
      this.setState({ loading: false });
    }
  }

  /**
   * Consolidates the list of funding source type obtained from Server and local programs.
   */
  consolidatedFundingSourceTypeList = () => {
    let realmId = AuthenticationService.getRealmId();
    const { fundingSourceTypes } = this.state;
    var fstList = fundingSourceTypes;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(["fundingSourceType"], "readwrite");
      var fundingSourceType = transaction.objectStore("fundingSourceType");
      var getRequest = fundingSourceType.getAll();
      getRequest.onerror = function (event) {
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result.filter(c => c.realm.id == realmId);
        var userBytes = CryptoJS.AES.decrypt(
          localStorage.getItem("curUser"),
          SECRET_KEY
        );
        for (var i = 0; i < myResult.length; i++) {
          var f = 0;
          for (var k = 0; k < this.state.fundingSourceTypes.length; k++) {
            if (
              this.state.fundingSourceTypes[k].fundingSourceTypeId ==
              myResult[i].fundingSourceTypeId
            ) {
              f = 1;
            }
          }
          var fstData = myResult[i];
          if (f == 0) {
            fstList.push(fstData);
          }
        }
        var lang = this.state.lang;
        var fundingSourceTypesCombined = fstList.sort(function (a, b) {
          a = a.fundingSourceTypeCode.toLowerCase();
          b = b.fundingSourceTypeCode.toLowerCase();
          return a < b ? -1 : a > b ? 1 : 0;
        });
        this.setState({
          fundingSourceTypes: fundingSourceTypesCombined,
        });
      }.bind(this);
    }.bind(this);
  };

  handleFundingSourceTypeChange = (fundingSourceTypeIds) => {

    fundingSourceTypeIds = fundingSourceTypeIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    })
    this.setState({
      fundingSourceTypeValues: fundingSourceTypeIds.map(ele => ele),
      fundingSourceTypeLabels: fundingSourceTypeIds.map(ele => ele.label)
    }, () => {
      var filteredFundingSourceArr = [];
      var fundingSources = this.state.fundingSources;
      for (var i = 0; i < fundingSourceTypeIds.length; i++) {
        for (var j = 0; j < fundingSources.length; j++) {
          if (fundingSources[j].fundingSourceType.id == fundingSourceTypeIds[i].value) {
            filteredFundingSourceArr.push(fundingSources[j]);
          }
        }
      }

      if (filteredFundingSourceArr.length > 0) {
        filteredFundingSourceArr = filteredFundingSourceArr.sort(function (a, b) {
          a = a.fundingSourceCode.toLowerCase();
          b = b.fundingSourceCode.toLowerCase();
          return a < b ? -1 : a > b ? 1 : 0;
        });
      }
      this.setState({
        fundingSourcesFiltered: filteredFundingSourceArr,
        fundingSourceValues: [],
        fundingSourceLabels: [],
      }, () => {
        this.fetchData();
      });
    })
  }

  /**
   * Retrieves the list of funding sources.
   */
  getFundingSource = () => {
    this.setState({ loading: true });
    if (localStorage.getItem("sessionType") === 'Online') {
      FundingSourceService.getFundingSourceListAll()
        .then((response) => {
          this.setState(
            {
              fundingSources: response.data,
              loading: false,
            },
            () => {
              this.consolidatedFundingSourceList();
            }
          );
        })
        .catch((error) => {
          this.setState(
            {
              fundingSources: [],
              loading: false,
            },
            () => {
              this.consolidatedFundingSourceList();
            }
          );
          if (error.message === "Network Error") {
            this.setState({
              message: API_URL.includes("uat")
                ? i18n.t("static.common.uatNetworkErrorMessage")
                : API_URL.includes("demo")
                  ? i18n.t("static.common.demoNetworkErrorMessage")
                  : i18n.t("static.common.prodNetworkErrorMessage"),
              loading: false,
            });
          } else {
            switch (error.response ? error.response.status : "") {
              case 401:
                this.props.history.push(`/login/static.message.sessionExpired`);
                break;
              case 403:
                this.props.history.push(`/accessDenied`);
                break;
              case 500:
              case 404:
              case 406:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, {
                    entityname: i18n.t("static.dashboard.program"),
                  }),
                  loading: false,
                });
                break;
              case 412:
                this.setState({
                  message: i18n.t(error.response.data.messageCode, {
                    entityname: i18n.t("static.dashboard.program"),
                  }),
                  loading: false,
                });
                break;
              default:
                this.setState({
                  message: "static.unkownError",
                  loading: false,
                });
                break;
            }
          }
        });
    } else {
      this.consolidatedFundingSourceList();
      this.setState({ loading: false });
    }
  };
  /**
   * Consolidates the list of funding source obtained from Server and local programs.
   */
  consolidatedFundingSourceList = () => {
    const { fundingSources } = this.state;
    var proList = fundingSources;
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(["fundingSource"], "readwrite");
      var fundingSource = transaction.objectStore("fundingSource");
      var getRequest = fundingSource.getAll();
      getRequest.onerror = function (event) {
      };
      getRequest.onsuccess = function (event) {
        var myResult = [];
        myResult = getRequest.result;
        var userBytes = CryptoJS.AES.decrypt(
          localStorage.getItem("curUser"),
          SECRET_KEY
        );
        for (var i = 0; i < myResult.length; i++) {
          var f = 0;
          for (var k = 0; k < this.state.fundingSources.length; k++) {
            if (
              this.state.fundingSources[k].fundingSourceId ==
              myResult[i].fundingSourceId
            ) {
              f = 1;
            }
          }
          var programData = myResult[i];
          if (f == 0) {
            proList.push(programData);
          }
        }
        var lang = this.state.lang;
        var fundingSourcesCombined = proList.sort(function (a, b) {
          a = a.fundingSourceCode.toLowerCase();
          b = b.fundingSourceCode.toLowerCase();
          return a < b ? -1 : a > b ? 1 : 0;
        });
        this.setState({
          fundingSources: fundingSourcesCombined,
          // fundingSourcesFiltered: fundingSourcesCombined
        });
      }.bind(this);
    }.bind(this);
  };
  /**
   * Renders the Procurement agent export table.
   * @returns {JSX.Element} - Procurement agent export table.
   */
  render() {
    jexcel.setDictionary({
      Show: " ",
      entries: " ",
    });
    const { SearchBar, ClearSearchButton } = Search;
    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        {i18n.t("static.common.result", { from, to, size })}
      </span>
    );
    const { procurementAgents } = this.state;
    const { fundingSourceTypes } = this.state;
    const { fundingSourcesFiltered } = this.state;
    const { programs } = this.state;
    const { versions } = this.state;
    let versionList =
      versions.length > 0 &&
      versions.map((item, i) => {
        return (
          <option key={i} value={item.versionId}>
            {item.versionStatus.id == 2 && item.versionType.id == 2
              ? item.versionId + "*"
              : item.versionId}{" "}
            ({moment(item.createdDate).format(`MMM DD YYYY`)})
          </option>
        );
      }, this);
    const { planningUnits } = this.state;
    let planningUnitList =
      planningUnits.length > 0 &&
      planningUnits.map((item, i) => {
        return {
          label: getLabelText(item.label, this.state.lang),
          value: item.id,
        };
      }, this);

    let fundingSourceList = fundingSourcesFiltered.length > 0 &&
      fundingSourcesFiltered.map((item, i) => {
        return {
          label: item.fundingSourceCode,
          value: item.fundingSourceId,
        };
      }, this)

    const { rangeValue } = this.state;
    let viewby = this.state.viewby;
    let obj1 = {};
    let obj2 = {};
    if (viewby == 1) {
      obj1 = {
        text: "Procurement Agent",
      };
      obj2 = {
        text: "Procurement Agent Code",
      };
    } else if (viewby == 2) {
      obj1 = {
        text: i18n.t("static.budget.fundingsource"),
      };
      obj2 = {
        text: i18n.t("static.funderTypeHead.funderType"),
      };
    } else {
      obj1 = {
        hidden: true,
      };
      obj2 = {
        hidden: true,
      };
    }
    const columns = [
      obj1,
      obj2,
      {
        text: i18n.t("static.report.qatPID"),
      },
      {
        text: i18n.t("static.report.planningUnit"),
      },
      {
        text: i18n.t("static.report.qty"),
      },
      {
        text: i18n.t("static.report.productCost"),
      },
      {
        text: i18n.t("static.report.freightPer"),
      },
      {
        text: i18n.t("static.report.freightCost"),
      },
      {
        text: i18n.t("static.report.totalCost"),
      },
    ];

    const checkOnline = localStorage.getItem("sessionType");
    return (
      <div className="animated">
        <AuthenticationServiceComponent history={this.props.history} />
        <h5>{i18n.t(this.props.match.params.message)}</h5>
        <h5 className="red">{i18n.t(this.state.message)}</h5>
        <SupplyPlanFormulas ref="formulaeChild" />
        <Card>
          <div className="Card-header-reporticon">
            {checkOnline === "Online" && this.state.data.length > 0 && (
              <div className="card-header-actions">
                <a className="card-header-action">
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      this.refs.formulaeChild.toggleShippmentCost();
                    }}
                  >
                    <small className="supplyplanformulas">
                      {i18n.t("static.supplyplan.supplyplanformula")}
                    </small>
                  </span>
                </a>
                <a className="card-header-action">
                  <img
                    style={{ height: "25px", width: "25px", cursor: "pointer" }}
                    src={pdfIcon}
                    title="Export PDF"
                    onClick={() => this.exportPDF(columns)}
                  />
                </a>
                <img
                  style={{ height: "25px", width: "25px", cursor: "pointer" }}
                  src={csvicon}
                  title={i18n.t("static.report.exportCsv")}
                  onClick={() => this.exportCSV(columns)}
                />
              </div>
            )}
            {checkOnline === "Offline" && this.state.data.length > 0 && (
              <div className="card-header-actions">
                <a className="card-header-action">
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      this.refs.formulaeChild.toggleShippmentCost();
                    }}
                  >
                    <small className="supplyplanformulas">
                      {i18n.t("static.supplyplan.supplyplanformula")}
                    </small>
                  </span>
                </a>
                <a className="card-header-action">
                  <img
                    style={{ height: "25px", width: "25px", cursor: "pointer" }}
                    src={pdfIcon}
                    title={i18n.t("static.report.exportPdf")}
                    onClick={() => this.exportPDF(columns)}
                  />
                </a>
                <img
                  style={{ height: "25px", width: "25px", cursor: "pointer" }}
                  src={csvicon}
                  title={i18n.t("static.report.exportCsv")}
                  onClick={() => this.exportCSV(columns)}
                />
              </div>
            )}
          </div>
          <CardBody className="pt-lg-2 pb-lg-5">
            <div className="pl-0">
              <div className="row ">
                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">
                    {i18n.t("static.report.dateRange")}
                    <span className="stock-box-icon fa fa-sort-desc"></span>
                  </Label>
                  <div className="controls  Regioncalender">
                    <Picker
                      ref="pickRange"
                      years={{
                        min: this.state.minDate,
                        max: this.state.maxDate,
                      }}
                      value={rangeValue}
                      lang={pickerLang}
                      onDismiss={this.handleRangeDissmis}
                    >
                      <MonthBox
                        value={
                          makeText(rangeValue.from) +
                          " ~ " +
                          makeText(rangeValue.to)
                        }
                        onClick={this._handleClickRangeBox}
                      />
                    </Picker>
                  </div>
                </FormGroup>
                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">
                    {i18n.t("static.program.program")}
                  </Label>
                  <div className="controls ">
                    <InputGroup>
                      <Input
                        type="select"
                        name="programId"
                        id="programId"
                        bsSize="sm"
                        onChange={(e) => {
                          this.setProgramId(e);
                        }}
                        value={this.state.programId}
                      >
                        <option value="0">
                          {i18n.t("static.common.select")}
                        </option>
                        {programs.length > 0 &&
                          programs.map((item, i) => {
                            return (
                              <option key={i} value={item.programId}>
                                {item.programCode}
                              </option>
                            );
                          }, this)}
                      </Input>
                    </InputGroup>
                  </div>
                </FormGroup>
                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">
                    {i18n.t("static.report.versionFinal*")}
                  </Label>
                  <div className="controls">
                    <InputGroup>
                      <Input
                        type="select"
                        name="versionId"
                        id="versionId"
                        bsSize="sm"
                        onChange={(e) => {
                          this.setVersionId(e);
                        }}
                        value={this.state.versionId}
                      >
                        <option value="0">
                          {i18n.t("static.common.select")}
                        </option>
                        {versionList}
                      </Input>
                    </InputGroup>
                  </div>
                </FormGroup>
                <FormGroup className="col-md-3">
                  <Label htmlFor="appendedInputButton">
                    {i18n.t("static.report.planningUnit")}
                  </Label>
                  <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                  <div className="controls">
                    <MultiSelect
                      name="planningUnitId"
                      id="planningUnitId"
                      bsSize="md"
                      value={this.state.planningUnitValues}
                      filterOptions={filterOptions}
                      onChange={(e) => {
                        this.handlePlanningUnitChange(e);
                      }}
                      options={
                        planningUnitList && planningUnitList.length > 0
                          ? planningUnitList
                          : []
                      }
                      disabled={this.state.loading}
                      overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                      selectSomeItems: i18n.t('static.common.select')}}
                    />
                  </div>
                </FormGroup>
                <FormGroup className="col-md-3" style={{ zIndex: "1" }}>
                  <Label htmlFor="appendedInputButton">
                    {i18n.t("static.program.isincludeplannedshipment")}
                  </Label>
                  <div className="controls ">
                    <InputGroup>
                      <Input
                        type="select"
                        name="isPlannedShipmentId"
                        id="isPlannedShipmentId"
                        bsSize="sm"
                        onChange={this.fetchData}
                      >
                        <option value="1">
                          {i18n.t("static.program.yes")}
                        </option>
                        <option value="2">{i18n.t("static.program.no")}</option>
                      </Input>
                    </InputGroup>
                  </div>
                </FormGroup>
                <FormGroup className="col-md-3" style={{ zIndex: "1" }}>
                  <Label htmlFor="appendedInputButton">
                    {i18n.t("static.common.display")}
                  </Label>
                  <div className="controls ">
                    <InputGroup>
                      <Input
                        type="select"
                        name="viewById"
                        id="viewById"
                        bsSize="sm"
                        onChange={this.toggleView}
                        value={this.state.viewby}
                      >
                        <option value="2">
                          {i18n.t("static.dashboard.fundingsource")}
                        </option>
                        <option
                          style={
                            procurementAgents.length > 0
                              ? { display: "block" }
                              : { display: "none" }
                          }
                          value="1"
                        >
                          {i18n.t("static.procurementagent.procurementagent")}
                        </option>
                        <option value="3">
                          {i18n.t("static.planningunit.planningunit")}
                        </option>
                      </Input>
                    </InputGroup>
                  </div>
                </FormGroup>
                <FormGroup
                  className="col-md-3"
                  id="procurementAgentDiv"
                  style={{ zIndex: "1" }}
                >
                  <Label htmlFor="appendedInputButton">
                    {i18n.t("static.procurementagent.procurementagent")}
                  </Label>
                  <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                  <div className="controls">
                    <MultiSelect
                      name="procurementAgentId"
                      id="planningUnitId"
                      bsSize="procurementAgentId"
                      filterOptions={filterOptions}
                      value={this.state.procurementAgentValues}
                      onChange={(e) => {
                        this.handleProcurementAgentChange(e);
                      }}
                      options={
                        procurementAgents.length > 0 &&
                        procurementAgents.map((item, i) => {
                          return {
                            label: item.procurementAgentCode,
                            value: item.procurementAgentId,
                          };
                        }, this)
                      }
                      disabled={this.state.loading}
                      overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                      selectSomeItems: i18n.t('static.common.select')}}
                    />
                  </div>
                </FormGroup>
                <FormGroup id="fundingSourceTypeDiv" className="col-md-3" style={{ zIndex: "1" }} >
                  <Label htmlFor="fundingSourceTypeId">{i18n.t('static.funderTypeHead.funderType')}</Label>
                  <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                  <div className="controls">
                    <MultiSelect
                      name="fundingSourceTypeId"
                      id="fundingSourceTypeId"
                      bsSize="md"
                      filterOptions={filterOptions}
                      value={this.state.fundingSourceTypeValues}
                      onChange={(e) => { this.handleFundingSourceTypeChange(e) }}
                      options={fundingSourceTypes.length > 0
                        && fundingSourceTypes.map((item, i) => {
                          return (
                            { label: item.fundingSourceTypeCode, value: item.fundingSourceTypeId }
                          )
                        }, this)}
                      disabled={this.state.loading}
                    />
                  </div>
                </FormGroup>
                <FormGroup
                  className="col-md-3"
                  id="fundingSourceDiv"
                // style={{ zIndex: "1" }}
                >
                  <Label htmlFor="appendedInputButton">
                    {i18n.t("static.budget.fundingsource")}
                  </Label>
                  <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                  <div className="controls">
                    <MultiSelect
                      name="fundingSourceId"
                      id="fundingSourceId"
                      filterOptions={filterOptions}
                      bsSize="md"
                      value={this.state.fundingSourceValues}
                      onChange={(e) => {
                        this.handleFundingSourceChange(e);
                      }}
                      options={
                        fundingSourceList && fundingSourceList.length > 0
                          ? fundingSourceList
                          : []
                      }
                      overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                      selectSomeItems: i18n.t('static.common.select')}}
                    />
                  </div>
                </FormGroup>
              </div>
            </div>
            {/* <div className="ReportSearchMarginTop"> */}
            <div className="">
              <div
                id="tableDiv"
                className="jexcelremoveReadonlybackground consumptionDataEntryTable"
                style={{ display: this.state.loading ? "none" : "block" }}
              ></div>
            </div>
            <div style={{ display: this.state.loading ? "block" : "none" }}>
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ height: "500px" }}
              >
                <div class="align-items-center">
                  <div>
                    <h4>
                      {" "}
                      <strong>{i18n.t("static.common.loading")}</strong>
                    </h4>
                  </div>
                  <div class="spinner-border blue ml-4" role="status"></div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
}
export default ProcurementAgentExport;
