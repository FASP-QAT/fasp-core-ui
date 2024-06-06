import jexcel from "jspreadsheet";
import moment from "moment";
import React, { Component } from "react";
import Picker from "react-month-picker";
import { MultiSelect } from "react-multi-select-component";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Col,
  FormGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from "reactstrap";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import {
  checkValidtion,
  jExcelLoadedFunction,
  jExcelLoadedFunctionOnlyHideRow,
  loadedForNonEditableTables
} from "../../CommonComponent/JExcelCommonFunctions";
import MonthBox from "../../CommonComponent/MonthBox.js";
import getLabelText from "../../CommonComponent/getLabelText";
import {
  API_URL,
  JEXCEL_PAGINATION_OPTION,
  JEXCEL_PRO_KEY,
  PROGRAM_TYPE_SUPPLY_PLAN,
  SPV_REPORT_DATEPICKER_START_MONTH,
} from "../../Constants";
import DropdownService from "../../api/DropdownService";
import IntegrationService from "../../api/IntegrationService";
import RealmCountryService from "../../api/RealmCountryService";
import i18n from "../../i18n";
import AuthenticationService from "../Common/AuthenticationService";
import AuthenticationServiceComponent from "../Common/AuthenticationServiceComponent";
import { hideFirstComponent, hideSecondComponent } from "../../CommonComponent/JavascriptCommonFunctions";
// Localized entity name
const entityname = i18n.t("static.integration.manualProgramIntegration");
/**
 * Component to trigger jsons manually
 */
export default class ConsumptionDetails extends Component {
  constructor(props) {
    super(props);
    var dt = new Date();
    dt.setMonth(dt.getMonth() - SPV_REPORT_DATEPICKER_START_MONTH);
    var dt1 = new Date();
    dt1.setMonth(dt1.getMonth());
    this.state = {
      integrationList: [],
      programList: [],
      loading: false,
      dataEL: "",
      changedFlag: false,
      message: "",
      color: "",
      isModalOpen: false,
      rangeValue:
        localStorage.getItem("sesRangeValueManualJson") != "" &&
          localStorage.getItem("sesRangeValueManualJson") != undefined &&
          localStorage.getItem("sesRangeValueManualJson") != null
          ? JSON.parse(localStorage.getItem("sesRangeValueManualJson"))
          : {
            from: { year: dt.getFullYear(), month: dt.getMonth() + 1 },
            to: { year: dt1.getFullYear(), month: dt1.getMonth() + 1 },
          },
      minDate: {
        year: new Date().getFullYear() - 10,
        month: new Date().getMonth() + 1,
      },
      maxDate: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      },
      integrationList: [],
      countrys: [],
      countryValues: [],
      programListBasedOnCountry: [],
      programValues: [],
      lang: localStorage.getItem("lang"),
      messageModal: "",
    };
    this.addRowClicked = this.addRowClicked.bind(this);
    this.changed = this.changed.bind(this);
    this.submitClicked = this.submitClicked.bind(this);
    this.checkValidations = this.checkValidations.bind(this);
    this._handleClickRangeBox = this._handleClickRangeBox.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.pickRange = React.createRef();
    this.filterProgram = this.filterProgram.bind(this);
    this.getVersions = this.getVersions.bind(this);
  }
  /**
   * Toggle manual json creation modal
   */
  modelOpenClose() {
    this.setState({}, () => {
      if (!this.state.isModalOpen) {
        this.setState(
          {
            isModalOpen: !this.state.isModalOpen,
          },
          () => {
            this.test();
          }
        );
      } else {
        var cont = false;
        if (this.state.changedFlag) {
          var cf = window.confirm(i18n.t("static.dataentry.confirmmsg"));
          if (cf == true) {
            cont = true;
          } else {
          }
        } else {
          cont = true;
        }
        if (cont == true) {
          this.setState(
            {
              changedFlag: false,
              messageModal: "",
              isModalOpen: !this.state.isModalOpen,
            },
            () => {
              this.setState({
                message: i18n.t("static.message.cancelled", { entityname }),
                color: "red",
              });
            }
          );
        }
      }
    });
  }
  /**
   * Calls showModal function
   */
  test() {
    this.setState(
      {
        test: 1,
      },
      () => {
        this.showModal();
      }
    );
  }
  /**
   * Builds jexcel table to add manual integration
   */
  showModal() {
    var data = [];
    var tableData = [];
    for (var i = 0; i < 5; i++) {
      data[0] = "";
      data[1] = "";
      data[2] = "";
      tableData.push(data);
      data = [];
    }
    this.el = jexcel(document.getElementById("tableDiv"), "");
    jexcel.destroy(document.getElementById("tableDiv"), true);
    var options = {
      data: tableData,
      columnDrag: false,
      colWidths: [100, 100, 100],
      columns: [
        {
          title: i18n.t("static.budget.program"),
          type: "dropdown",
          source: this.state.programList,
        },
        {
          title: i18n.t("static.report.versionFinal*"),
          type: "dropdown",
          source: [],
          filter: this.filterVersion,
        },
        {
          title: i18n.t("static.integration.integration"),
          type: "dropdown",
          source: this.state.integrationList,
        },
      ],
      pagination: localStorage.getItem("sesRecordCount"),
      filters: false,
      search: false,
      columnSorting: false,
      wordWrap: true,
      paginationOptions: false,
      parseFormulas: true,
      position: "top",
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: true,
      onchange: this.changed,
      copyCompatibility: true,
      allowManualInsertRow: false,
      license: JEXCEL_PRO_KEY,
      editable: true,
      onload: this.loadedModal,
      contextMenu: function (obj, x, y, e) {
        var items = [];
        if (y == null) {
        } else {
          if (obj.options.allowInsertRow == true) {
            items.push({
              title: i18n.t("static.common.insertNewRowBefore"),
              onclick: function () {
                this.setState({
                  changedFlag: true,
                });
                var data = [];
                data[0] = "";
                data[1] = "";
                data[2] = "";
                obj.insertRow(data, parseInt(y), 1);
              }.bind(this),
            });
          }
          if (obj.options.allowInsertRow == true) {
            items.push({
              title: i18n.t("static.common.insertNewRowAfter"),
              onclick: function () {
                this.setState({
                  changedFlag: true,
                });
                var data = [];
                data[0] = "";
                data[1] = "";
                data[2] = "";
                obj.insertRow(data, parseInt(y));
              }.bind(this),
            });
          }
          if (obj.options.allowDeleteRow == true) {
            items.push({
              title: i18n.t("static.common.deleterow"),
              onclick: function () {
                obj.deleteRow(parseInt(y));
              },
            });
          }
        }
        return items;
      }.bind(this),
    };
    var varEL = "";
    this.el = jexcel(document.getElementById("tableDiv"), options);
    varEL = this.el;
    this.setState({
      dataEL: varEL,
    });
  }
  /**
   * Reterives integration list on component mount
   */
  componentDidMount() {
    this.setState({
      loading: true,
    });
    IntegrationService.getIntegrationListAll()
      .then((response) => {
        if (response.status == 200) {
          var listArray = response.data;
          var integrationList = [];
          listArray.map((item) => {
            integrationList.push({
              id: item.integrationId,
              name: item.integrationName.toUpperCase(),
            });
          });
          integrationList.sort((a, b) => {
            var itemLabelA = a.name.toUpperCase();
            var itemLabelB = b.name.toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          let realmId = AuthenticationService.getRealmId();
          RealmCountryService.getRealmCountryForProgram(realmId)
            .then((countryResponse) => {
              var countryValues = [];
              var listArray = countryResponse.data.map(
                (ele) => ele.realmCountry
              );
              listArray.map((ele1) => {
                countryValues.push({
                  label: getLabelText(ele1.label, this.state.lang),
                  value: ele1.id,
                });
              });
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
                  countrys: listArray,
                  countryValues: countryValues,
                  integrationList: integrationList,
                  loading: false,
                },
                () => {
                  this.filterProgram();
                }
              );
            })
            .catch((error) => {
              this.setState({
                countrys: [],
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
                        entityname: i18n.t("static.dashboard.Country"),
                      }),
                      loading: false,
                    });
                    break;
                  case 412:
                    this.setState({
                      message: i18n.t(error.response.data.messageCode, {
                        entityname: i18n.t("static.dashboard.Country"),
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
          this.setState(
            {
              message: response.data.messageCode,
              color: "red",
              integrationList: [],
              loading: false,
            },
            () => {
              hideFirstComponent();
            }
          );
        }
      })
      .catch((error) => {
        this.setState({
          integrationList: [],
          loading: false,
        });
        if (error.message === "Network Error") {
          this.setState({
            message: API_URL.includes("uat")
              ? i18n.t("static.common.uatNetworkErrorMessage")
              : API_URL.includes("demo")
                ? i18n.t("static.common.demoNetworkErrorMessage")
                : i18n.t("static.common.prodNetworkErrorMessage"),
            color: "red",
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
                message: error.response.data.messageCode,
                color: "red",
                loading: false,
              });
              break;
            case 412:
              this.setState({
                message: error.response.data.messageCode,
                color: "red",
                loading: false,
              });
              break;
            default:
              this.setState({
                message: "static.unkownError",
                color: "red",
                loading: false,
              });
              break;
          }
        }
      });
  }
  /**
   * This function is used to format the table like add asterisk or info to the table headers
   * @param {*} instance This is the DOM Element where sheet is created
   * @param {*} cell This is the object of the DOM element
   */
  loadedModal = function (instance, cell, x, y, value) {
    jExcelLoadedFunctionOnlyHideRow(instance);
    if (document.getElementsByClassName("jss").length > 1) {
      var asterisk = document.getElementsByClassName("jss")[1].firstChild.nextSibling;
      var tr = asterisk.firstChild;
      tr.children[1].classList.add("AsteriskTheadtrTd");
      tr.children[2].classList.add("AsteriskTheadtrTd");
      tr.children[3].classList.add("AsteriskTheadtrTd");
    } else {
      var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
      var tr = asterisk.firstChild;
      tr.children[1].classList.add("AsteriskTheadtrTd");
      tr.children[2].classList.add("AsteriskTheadtrTd");
      tr.children[3].classList.add("AsteriskTheadtrTd");
    }
  };
  /**
   * Filter version based on program
   */
  filterVersion = function (instance, cell, c, r, source) {
    var value = this.state.dataEL.getJson(null, false)[r][0];
    var versionList = this.state.programList.filter((c) => c.id == value)[0]
      .versionList;
    var vlList = [];
    versionList.map((item) => {
      var name =
        (item.versionStatus.id == 2 && item.versionType.id == 2
          ? item.versionId + "*"
          : item.versionId) +
        " (" +
        moment(item.createdDate).format(`MMM DD YYYY`) +
        ")";
      vlList.push({ id: item.versionId, name: name });
    });
    return vlList.reverse();
  }.bind(this);
  /**
   * Function to add a new row to the jexcel table.
   */
  addRowClicked() {
    var obj = this.state.dataEL;
    var data = [];
    data[0] = "";
    data[1] = "";
    data[2] = "";
    obj.insertRow(data);
  }
  /**
   * Function to handle changes in jexcel cells.
   * @param {Object} instance - The jexcel instance.
   * @param {Object} cell - The cell object that changed.
   * @param {number} x - The x-coordinate of the changed cell.
   * @param {number} y - The y-coordinate of the changed cell.
   * @param {any} value - The new value of the changed cell.
   */
  changed = function (instance, cell, x, y, value) {
    if (this.state.changedFlag == false) {
      this.setState({
        changedFlag: true,
      });
    }
    var elInstance = this.state.dataEL;
    var rowData = elInstance.getRowData(y);
    if (x == 0) {
      checkValidtion("text", "A", y, rowData[0], elInstance);
    }
    if (x == 1) {
      checkValidtion("text", "B", y, rowData[1], elInstance);
    }
    if (x == 2) {
      checkValidtion("text", "C", y, rowData[2], elInstance);
    }
  };
  /**
   * Function to handle form submission and save the data on server.
   */
  submitClicked() {
    var validation = this.checkValidations();
    if (validation == true) {
      var json = this.state.dataEL
        .getJson(null, false)
        .filter((c) => c[0] != "" || c[1] != "" || c[2] != "");
      if (json.length > 0) {
        var list = [];
        json.map((item) => {
          list.push({
            program: {
              id: item[0],
            },
            versionId: item[1],
            integrationId: item[2],
          });
        });
        IntegrationService.addManualJson(list)
          .then((response) => {
            if (response.status == "200") {
              this.setState(
                {
                  changedFlag: false,
                  message: i18n.t("static.message.updateSuccess", {
                    entityname,
                  }),
                  color: "green",
                  messageModal: "",
                  isModalOpen: !this.state.isModalOpen,
                },
                () => {
                  hideFirstComponent();
                  this.showReport();
                }
              );
            } else {
              this.setState(
                {
                  message: response.data.messageCode,
                  color: "red",
                },
                () => {
                  hideFirstComponent();
                }
              );
            }
          })
          .catch((error) => {
            if (error.message === "Network Error") {
              this.setState({
                message: API_URL.includes("uat")
                  ? i18n.t("static.common.uatNetworkErrorMessage")
                  : API_URL.includes("demo")
                    ? i18n.t("static.common.demoNetworkErrorMessage")
                    : i18n.t("static.common.prodNetworkErrorMessage"),
                color: "red",
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
                    message: "static.unkownError",
                    color: "red",
                    loading: false,
                  });
                  break;
                case 412:
                  this.setState({
                    message: error.response.data.messageCode,
                    color: "red",
                    loading: false,
                  });
                  break;
                default:
                  this.setState({
                    message: "static.unkownError",
                    color: "red",
                    loading: false,
                  });
                  break;
              }
            }
          });
      } else {
        this.setState(
          {
            messageModal: "No data found",
            color: "red",
          },
          () => {
            hideSecondComponent();
          }
        );
      }
    } else {
      this.setState(
        {
          messageModal: "static.supplyPlan.validationFailed",
          color: "red",
        },
        () => {
          hideSecondComponent();
        }
      );
    }
  }
  /**
   * Function to check validation of the jexcel table.
   * @returns {boolean} - True if validation passes, false otherwise.
   */
  checkValidations() {
    var valid = true;
    var elInstance = this.state.dataEL;
    var json = elInstance.getJson(null, false);
    var validation = "";
    for (var y = 0; y < json.length; y++) {
      if (json[y][0] != "" || json[y][1] != "" || json[y][2] != "") {
        var rowData = elInstance.getRowData(y);
        validation = checkValidtion("text", "A", y, rowData[0], elInstance);
        if (validation == false) {
          valid = false;
        }
        validation = checkValidtion("text", "B", y, rowData[1], elInstance);
        if (validation == false) {
          valid = false;
        }
        validation = checkValidtion("text", "C", y, rowData[2], elInstance);
        if (validation == false) {
          valid = false;
        }
      }
    }
    return valid;
  }
  /**
   * Handles the dismiss of the range picker component.
   * Updates the component state with the new range value and triggers a data fetch.
   * @param {object} value - The new range value selected by the user.
   */
  handleRangeDissmis(value) {
    localStorage.setItem("sesRangeValueManualJson", JSON.stringify(value));
    this.setState(
      {
        rangeValue: value,
      },
      () => {
        this.showReport();
      }
    );
  }
  /**
   * Handles the click event on the range picker box.
   * Shows the range picker component.
   * @param {object} e - The event object containing information about the click event.
   */
  _handleClickRangeBox(e) {
    this.pickRange.current.show();
  }
  /**
   * Handles the change event for countries.
   * @param {Array} countrysId - An array containing the selected country IDs.
   */
  handleChange(countrysId) {
    countrysId = countrysId.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    });
    this.setState(
      {
        countryValues: countrysId.map((ele) => ele),
      },
      () => {
        this.filterProgram();
      }
    );
  }
  /**
   * Filters programs based on selected countries.
   */
  filterProgram = () => {
    let countryIds = this.state.countryValues.map((ele) => ele.value);
    this.setState(
      {
        programListBasedOnCountry: [],
        programValues: [],
        loading: true,
      },
      () => {
        if (countryIds.length != 0) {
          var programValues = [];
          let newCountryList = [...new Set(countryIds)];
          DropdownService.getProgramWithFilterForMultipleRealmCountryForDropdown(
            PROGRAM_TYPE_SUPPLY_PLAN,
            newCountryList
          )
            .then((programResponse) => {
              if (programResponse.status == 200) {
                var programList = programResponse.data;
                var plList = [];
                programList.map((item) => {
                  plList.push({
                    id: item.id,
                    name: item.code,
                    versionList: [],
                  });
                });
                plList.sort((a, b) => {
                  var itemLabelA = a.name.toUpperCase();
                  var itemLabelB = b.name.toUpperCase();
                  return itemLabelA > itemLabelB ? 1 : -1;
                });
                plList.map((item) => {
                  programValues.push({ value: item.id });
                });
                if (plList.length > 0) {
                  this.setState(
                    {
                      programListBasedOnCountry: plList.sort((a, b) => {
                        var itemLabelA = a.name.toUpperCase();
                        var itemLabelB = b.name.toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                      }),
                      programValues: programValues,
                      loading: false,
                    },
                    () => {
                      this.getVersions();
                    }
                  );
                } else {
                  this.setState(
                    {
                      programListBasedOnCountry: [],
                      loading: false,
                    },
                    () => {
                      this.showReport();
                    }
                  );
                }
                this.setState({
                  programList: plList,
                  loading: false,
                });
              } else {
                this.setState(
                  {
                    message: programResponse.data.messageCode,
                    color: "red",
                    programList: [],
                  },
                  () => {
                    hideFirstComponent();
                  }
                );
              }
            })
            .catch((error) => {
              this.setState({
                programList: [],
              });
              if (error.message === "Network Error") {
                this.setState({
                  message: API_URL.includes("uat")
                    ? i18n.t("static.common.uatNetworkErrorMessage")
                    : API_URL.includes("demo")
                      ? i18n.t("static.common.demoNetworkErrorMessage")
                      : i18n.t("static.common.prodNetworkErrorMessage"),
                  color: "red",
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
                      message: error.response.data.messageCode,
                      color: "red",
                      loading: false,
                    });
                    break;
                  case 412:
                    this.setState({
                      message: error.response.data.messageCode,
                      color: "red",
                      loading: false,
                    });
                    break;
                  default:
                    this.setState({
                      message: "static.unkownError",
                      color: "red",
                      loading: false,
                    });
                    break;
                }
              }
            });
        } else {
          this.setState(
            {
              programListBasedOnCountry: [],
            },
            () => {
              this.showReport();
            }
          );
        }
      }
    );
  };
  /**
   * Retrieves version lists for programs based on the country.
   * Updates the programListBasedOnCountry state with version information.
   * Displays the report after fetching the versions.
   */
  getVersions() {
    this.setState(
      {
        loading: true,
      },
      () => {
        let progList = this.state.programListBasedOnCountry;
        let programValues = this.state.programValues.map((ele) => ele.value);
        if (progList.length != 0) {
          var keys = [];
          var values = [];
          let newProgramList = [...new Set(programValues)];
          DropdownService.getVersionListForPrograms(
            PROGRAM_TYPE_SUPPLY_PLAN,
            newProgramList
          )
            .then((versionResponse) => {
              if (versionResponse.status == 200) {
                for (let value of Object.values(versionResponse.data)) {
                  values.push(value);
                }
                for (let key of Object.keys(versionResponse.data)) {
                  keys.push(key);
                }
                for (var i = 0; i < keys.length; i++) {
                  progList.filter((c) => c.id == keys[i])[0].versionList =
                    values[i];
                }
                this.setState(
                  {
                    programListBasedOnCountry: progList,
                    loading: false,
                  },
                  () => {
                    this.showReport();
                  }
                );
              } else {
                this.setState(
                  {
                    message: versionResponse.data.messageCode,
                    color: "red",
                    programList: [],
                    loading: false,
                  },
                  () => {
                    hideFirstComponent();
                  }
                );
              }
            })
            .catch((error) => {
              this.setState({
                programList: [],
                loading: false,
              });
              if (error.message === "Network Error") {
                this.setState({
                  message: API_URL.includes("uat")
                    ? i18n.t("static.common.uatNetworkErrorMessage")
                    : API_URL.includes("demo")
                      ? i18n.t("static.common.demoNetworkErrorMessage")
                      : i18n.t("static.common.prodNetworkErrorMessage"),
                  color: "red",
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
                      message: error.response.data.messageCode,
                      color: "red",
                      loading: false,
                    });
                    break;
                  case 412:
                    this.setState({
                      message: error.response.data.messageCode,
                      color: "red",
                      loading: false,
                    });
                    break;
                  default:
                    this.setState({
                      message: "static.unkownError",
                      color: "red",
                      loading: false,
                    });
                    break;
                }
              }
            });
        } else {
          this.setState(
            {
              programListBasedOnCountry: [],
            },
            () => {
              this.showReport();
            }
          );
        }
      }
    );
  }
  /**
   * Handles the change event for program selection.
   * @param {array} programIds - The array of selected program IDs.
   */
  handleChangeProgram(programIds) {
    programIds = programIds.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    });
    this.setState(
      {
        programValues: programIds.map((ele) => ele),
      },
      () => {
        this.showReport();
      }
    );
  }
  /**
   * Displays the integration report.
   * Retrieves integration data based on the selected date range, country, and program.
   * Populates the report table with integration data.
   */
  showReport() {
    this.setState(
      {
        loading: true,
      },
      () => {
        let rangeValue = this.state.rangeValue;
        let startDate =
          rangeValue.from.year + "-" + rangeValue.from.month + "-01";
        let stopDate =
          rangeValue.to.year +
          "-" +
          rangeValue.to.month +
          "-" +
          new Date(rangeValue.to.year, rangeValue.to.month, 0).getDate();
        let realmCountryIds = this.state.countryValues.map((ele) => ele.value);
        let programIds = this.state.programValues.map((ele) => ele.value);
        var json = {
          startDate: startDate,
          stopDate: stopDate,
          realmCountryIds: realmCountryIds,
          programIds: programIds,
        };
        IntegrationService.reportForManualIntegration(json)
          .then((response) => {
            var dataForJexcel = [];
            if (realmCountryIds.length > 0 && programIds.length > 0) {
              dataForJexcel = response.data.sort((a, b) => {
                var itemLabelA = a.createdDate;
                var itemLabelB = b.createdDate;
                return itemLabelA < itemLabelB ? 1 : -1;
              });
            }
            if (response.status == "200") {
              var data = [];
              var tableData = [];
              for (var i = 0; i < dataForJexcel.length; i++) {
                var version = this.state.programList
                  .filter((c) => c.id == dataForJexcel[i].program.id)[0]
                  .versionList.filter(
                    (c) => c.versionId == dataForJexcel[i].versionId
                  )[0];
                var name =
                  (version.versionStatus.id == 2 && version.versionType.id == 2
                    ? version.versionId + "*"
                    : version.versionId) +
                  " (" +
                  moment(version.createdDate).format(`MMM DD YYYY`) +
                  ")";
                data = [];
                data[0] = dataForJexcel[i].program.code;
                data[1] = name;
                data[2] = dataForJexcel[i].integrationName.toUpperCase();
                data[3] = dataForJexcel[i].createdBy.username;
                data[4] = moment(dataForJexcel[i].createdDate).format(
                  `YYYY-MM-DD HH:mm:ss`
                );
                data[5] =
                  dataForJexcel[i].completedDate != null
                    ? i18n.t("static.manualIntegration.completed")
                    : i18n.t("static.manualIntegration.requested");
                tableData.push(data);
              }
              this.el = jexcel(document.getElementById("tableDivReport"), "");
              jexcel.destroy(document.getElementById("tableDivReport"), true);
              var options = {
                data: tableData,
                columnDrag: false,
                colWidths: [100, 100, 100],
                columns: [
                  {
                    title: i18n.t("static.budget.program"),
                    type: "text",
                  },
                  {
                    title: i18n.t("static.report.versionFinal*"),
                    type: "text",
                  },
                  {
                    title: i18n.t("static.integration.integration"),
                    type: "text",
                  },
                  {
                    title: i18n.t("static.manualIntegration.requester"),
                    type: "text",
                  },
                  {
                    title: i18n.t("static.manualIntegration.jsonCreationDate"),
                    options: { isTime: 1, format: "DD-Mon-YY HH24:MI" },
                    type: "calendar",
                  },
                  {
                    title: i18n.t("static.shipmentDataEntry.shipmentStatus"),
                    type: "text",
                  },
                ],
                pagination: localStorage.getItem("sesRecordCount"),
                filters: true,
                search: true,
                columnSorting: true,
                wordWrap: true,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                parseFormulas: true,
                position: "top",
                allowInsertColumn: false,
                allowManualInsertColumn: false,
                allowDeleteRow: false,
                copyCompatibility: true,
                allowManualInsertRow: false,
                license: JEXCEL_PRO_KEY,
                editable: false,
                onload: loadedForNonEditableTables,
                contextMenu: function (obj, x, y, e) {
                  var items = [];
                  return items;
                }.bind(this),
              };
              var varEL = "";
              this.el = jexcel(
                document.getElementById("tableDivReport"),
                options
              );
              varEL = this.el;
              this.setState({
                loading: false,
              });
            } else {
              this.setState(
                {
                  message: response.data.messageCode,
                  color: "red",
                },
                () => {
                  hideFirstComponent();
                }
              );
            }
          })
          .catch((error) => {
            if (error.message === "Network Error") {
              this.setState({
                message: API_URL.includes("uat")
                  ? i18n.t("static.common.uatNetworkErrorMessage")
                  : API_URL.includes("demo")
                    ? i18n.t("static.common.demoNetworkErrorMessage")
                    : i18n.t("static.common.prodNetworkErrorMessage"),
                color: "red",
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
                    message: "static.unkownError",
                    color: "red",
                    loading: false,
                  });
                  break;
                case 412:
                  this.setState({
                    message: error.response.data.messageCode,
                    color: "red",
                    loading: false,
                  });
                  break;
                default:
                  this.setState({
                    message: "static.unkownError",
                    color: "red",
                    loading: false,
                  });
                  break;
              }
            }
          });
      }
    );
  }
  /**
   * Renders the manual json trigger report.
   * @returns {JSX.Element} - Manual json trigger report.
   */
  render() {
    jexcel.setDictionary({
      Show: " ",
      entries: " ",
    });
    const { countrys } = this.state;
    let countryList =
      countrys.length > 0 &&
      countrys.map((item, i) => {
        return {
          label: getLabelText(item.label, this.state.lang),
          value: item.id,
        };
      }, this);
    const { programListBasedOnCountry } = this.state;
    let programList = [];
    programList =
      programListBasedOnCountry.length > 0 &&
      programListBasedOnCountry.map((item, i) => {
        return (
          { label: item.name, value: item.id }
        );
      }, this);
    const pickerLang = {
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      from: "From",
      to: "To",
    };
    const makeText = (m) => {
      if (m && m.year && m.month)
        return pickerLang.months[m.month - 1] + ". " + m.year;
      return "?";
    };
    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} />
        <h5 className={this.state.color} id="div1">
          {i18n.t(this.state.message)}
        </h5>
        <div>
          <Card>
            <div className="Card-header-reporticon">
              <Button
                color="info"
                size="md"
                className="float-right mr-1"
                type="button"
                onClick={() => this.modelOpenClose()}
                disabled={this.state.loading ? true : false}
              >
                {i18n.t("static.manualIntegration.addManualIntegration")}
              </Button>
            </div>
            <CardBody className="p-0">
              <Col xs="12" sm="12">
                <div className="row">
                  <FormGroup className="col-md-3">
                    <Label htmlFor="appendedInputButton">
                      {i18n.t("static.report.dateRange")}
                      <span className="stock-box-icon  fa fa-sort-desc ml-1"></span>
                    </Label>
                    <div className="controls edit">
                      <Picker
                        years={{
                          min: this.state.minDate,
                          max: this.state.maxDate,
                        }}
                        ref={this.pickRange}
                        value={this.state.rangeValue}
                        lang={pickerLang}
                        onDismiss={this.handleRangeDissmis}
                      >
                        <MonthBox
                          value={
                            makeText(this.state.rangeValue.from) +
                            " ~ " +
                            makeText(this.state.rangeValue.to)
                          }
                          onClick={this._handleClickRangeBox}
                        />
                      </Picker>
                    </div>
                  </FormGroup>
                  <FormGroup className="col-md-3">
                    <Label htmlFor="countrysId">
                      {i18n.t("static.program.realmcountry")}
                    </Label>
                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                    <div className="controls edit">
                      <MultiSelect
                        bsSize="sm"
                        name="countrysId"
                        id="countrysId"
                        value={this.state.countryValues}
                        onChange={(e) => {
                          this.handleChange(e);
                        }}
                        options={
                          countryList && countryList.length > 0
                            ? countryList
                            : []
                        }
                        filterOptions={this.filterOptions}
                        disabled={this.state.loading}
                        overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                        selectSomeItems: i18n.t('static.common.select')}}
                      />
                      {!!this.props.error && this.props.touched && (
                        <div style={{ color: "#BA0C2F", marginTop: ".5rem" }}>
                          {this.props.error}
                        </div>
                      )}
                    </div>
                  </FormGroup>
                  <FormGroup className="col-md-3">
                    <Label htmlFor="programIds">
                      {i18n.t("static.program.program")}
                    </Label>
                    <span className="reportdown-box-icon  fa fa-sort-desc ml-1"></span>
                    <MultiSelect
                      bsSize="sm"
                      name="programIds"
                      id="programIds"
                      value={this.state.programValues}
                      onChange={(e) => {
                        this.handleChangeProgram(e);
                      }}
                      options={
                        programList && programList.length > 0 ? programList : []
                      }
                      filterOptions={this.filterOptions}
                      disabled={this.state.loading}
                      overrideStrings={{ allItemsAreSelected: i18n.t('static.common.allitemsselected'),
                      selectSomeItems: i18n.t('static.common.select')}}
                    />
                    {!!this.props.error && this.props.touched && (
                      <div style={{ color: "#BA0C2F", marginTop: ".5rem" }}>
                        {this.props.error}
                      </div>
                    )}
                  </FormGroup>
                </div>
                <div className="">
                  <div
                    id="tableDivReport"
                    style={{ display: this.state.loading ? "none" : "block" }}
                  />
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
                          <strong>{i18n.t("static.loading.loading")}</strong>
                        </h4>
                      </div>
                      <div class="spinner-border blue ml-4" role="status"></div>
                    </div>
                  </div>
                </div>
              </Col>
            </CardBody>
            <CardFooter>
              <FormGroup>
                <FormGroup></FormGroup>
              </FormGroup>
            </CardFooter>
          </Card>
          <Modal
            isOpen={this.state.isModalOpen}
            className={("modal-lg " + this.props.className, "modalWidth")}
          >
            <ModalHeader
              toggle={() => this.modelOpenClose()}
              className="modalHeaderSupplyPlan"
            >
              <strong>
                {i18n.t("static.manualIntegration.addManualIntegration")}
              </strong>
            </ModalHeader>
            <ModalBody>
              <div className="">
                <h5 className={this.state.color} id="div2">
                  {i18n.t(this.state.messageModal)}
                </h5>
                <div id="tableDiv" className="AddListbatchtrHeight" />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="info"
                id="addRowButtonId"
                size="md"
                className="float-right mr-1"
                type="button"
                onClick={this.addRowClicked}
              >
                {" "}
                <i className="fa fa-plus"></i> {i18n.t("static.common.addRow")}
              </Button>
              {this.state.changedFlag && (
                <Button
                  type="submit"
                  size="md"
                  color="success"
                  className="submitBtn float-right mr-1"
                  onClick={this.submitClicked}
                >
                  {" "}
                  <i className="fa fa-check"></i>{" "}
                  {i18n.t("static.manualIntegration.addManualIntegration")}
                </Button>
              )}
              <Button
                type="button"
                size="md"
                color="danger"
                className="float-right mr-1"
                onClick={() => this.modelOpenClose()}
              >
                <i className="fa fa-times"></i> {i18n.t("static.common.cancel")}
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    );
  }
}
