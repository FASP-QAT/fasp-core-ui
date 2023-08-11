import React from "react";
import { Component } from "react";
import i18n from "../../i18n";
import {
  Card,
  CardBody,
  Label,
  Input,
  FormGroup,
  CardFooter,
  Button,
  Col,
  Form,
  InputGroup,
  Modal,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Dropdown,
} from "reactstrap";
import AuthenticationServiceComponent from "../Common/AuthenticationServiceComponent";
import jexcel from "jspreadsheet";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import ProgramService from "../../api/ProgramService";
import IntegrationService from "../../api/IntegrationService";
import {
  API_URL,
  JEXCEL_PAGINATION_OPTION,
  JEXCEL_PRO_KEY,
  PROGRAM_TYPE_SUPPLY_PLAN,
  SPV_REPORT_DATEPICKER_START_MONTH,
} from "../../Constants";
import {
  checkValidtion,
  jExcelLoadedFunction,
  jExcelLoadedFunctionOnlyHideRow,
  jExcelLoadedFunctionOnlyHideRowOld,
} from "../../CommonComponent/JExcelCommonFunctions";
import moment from "moment";
import AuthenticationService from "../Common/AuthenticationService";
import { Prompt } from "react-router";
import Picker from "react-month-picker";
import MonthBox from "../../CommonComponent/MonthBox.js";
import { MultiSelect } from "react-multi-select-component";
import getLabelText from "../../CommonComponent/getLabelText";
import RealmCountryService from "../../api/RealmCountryService";
import DropdownService from "../../api/DropdownService";

const entityname = i18n.t("static.integration.manualProgramIntegration");
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
    this.handleRangeChange = this.handleRangeChange.bind(this);
    this.handleRangeDissmis = this.handleRangeDissmis.bind(this);
    this.pickRange = React.createRef();
    this.filterProgram = this.filterProgram.bind(this);
    this.getVersions = this.getVersions.bind(this);
  }

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
    // this.el.destroy();
    jexcel.destroy(document.getElementById("tableDiv"), true);
    var options = {
      data: tableData,
      columnDrag: true,
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
      // tableOverflow: true,
      wordWrap: true,
      paginationOptions: false,
      parseFormulas: true,
      position: "top",
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: true,
      onchange: this.changed,
      // onblur: this.blur,
      // onfocus: this.focus,
      // oneditionend: this.onedit,
      copyCompatibility: true,
      // onpaste: this.onPaste,
      allowManualInsertRow: false,
      license: JEXCEL_PRO_KEY,
      editable: true,
      // text: {
      //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
      //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
      //     show: '',
      //     entries: '',
      // },
      onload: this.loadedModal,
      contextMenu: function (obj, x, y, e) {
        var items = [];
        if (y == null) {
        } else {
          // Insert new row before
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
          // after
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
          // Delete a row
          if (obj.options.allowDeleteRow == true) {
            // region id
            // if (obj.getRowData(y)[5] == 0) {
            items.push({
              title: i18n.t("static.common.deleterow"),
              onclick: function () {
                obj.deleteRow(parseInt(y));
              },
            });
            // }
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
            var itemLabelA = a.name.toUpperCase(); // ignore upper and lowercase
            var itemLabelB = b.name.toUpperCase(); // ignore upper and lowercase
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          let realmId = AuthenticationService.getRealmId();
          // let realmId = document.getElementById('realmId').value
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
                ).toUpperCase(); // ignore upper and lowercase
                var itemLabelB = getLabelText(
                  b.label,
                  this.state.lang
                ).toUpperCase(); // ignore upper and lowercase
                return itemLabelA > itemLabelB ? 1 : -1;
              });
              this.setState(
                {
                  // countrys: response.data.map(ele => ele.realmCountry)
                  countrys: listArray,
                  countryValues: countryValues,
                  // programList: plList,
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
                  // message: 'static.unkownError',
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
          //         var data = [];
          //         var tableData = []
          //         data[0] = "";
          //         data[1] = "";
          //         data[2] = "";
          //         tableData[0] = data;
          //         this.el = jexcel(document.getElementById("tableDiv"), '');
          //         // this.el.destroy();
          //         jexcel.destroy(document.getElementById("tableDiv"), true);
          //         var options = {
          //             data: tableData,
          //             columnDrag: true,
          //             colWidths: [100, 100, 100],
          //             columns: [

          //                 {
          //                     title: i18n.t('static.budget.program'),
          //                     type: 'dropdown',
          //                     source: plList
          //                 },
          //                 {
          //                     title: i18n.t('static.report.version'),
          //                     type: 'dropdown',
          //                     source: [],
          //                     filter: this.filterVersion
          //                 },
          //                 {
          //                     title: i18n.t('static.integration.integration'),
          //                     type: 'dropdown',
          //                     source: integrationList,

          //                 }

          //             ],
          //             pagination: localStorage.getItem("sesRecordCount"),
          //             filters: false,
          //             search: true,
          //             columnSorting: false,
          //             // tableOverflow: true,
          //             wordWrap: true,
          //             paginationOptions: false,
          //             parseFormulas: true,
          //             position: 'top',
          //             allowInsertColumn: false,
          //             allowManualInsertColumn: false,
          //             allowDeleteRow: true,
          //             onchange: this.changed,
          //             // onblur: this.blur,
          //             // onfocus: this.focus,
          //             // oneditionend: this.onedit,
          //             copyCompatibility: true,
          //             // onpaste: this.onPaste,
          //             allowManualInsertRow: false,
          //             license: JEXCEL_PRO_KEY,
          //             editable: true,
          //             // text: {
          //             //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
          //             //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
          //             //     show: '',
          //             //     entries: '',
          //             // },
          //             onload: this.loaded,
          //             contextMenu: function (obj, x, y, e) {
          //                 var items = [];
          //                 if (y == null) {

          //                 } else {
          //                     // Insert new row before
          //                     if (obj.options.allowInsertRow == true) {
          //                         items.push({
          //                             title: i18n.t('static.common.insertNewRowBefore'),
          //                             onclick: function () {
          //                                 var data = [];
          //                                 data[0] = "";
          //                                 data[1] = "";
          //                                 data[2] = "";
          //                                 obj.insertRow(data, parseInt(y), 1);
          //                             }.bind(this)
          //                         });
          //                     }
          //                     // after
          //                     if (obj.options.allowInsertRow == true) {
          //                         items.push({
          //                             title: i18n.t('static.common.insertNewRowAfter'),
          //                             onclick: function () {
          //                                 var data = [];
          //                                 data[0] = "";
          //                                 data[1] = "";
          //                                 data[2] = "";
          //                                 obj.insertRow(data, parseInt(y));
          //                             }.bind(this)
          //                         });
          //                     }
          //                     // Delete a row
          //                     if (obj.options.allowDeleteRow == true) {
          //                         // region id
          //                         // if (obj.getRowData(y)[5] == 0) {
          //                         items.push({
          //                             title: i18n.t("static.common.deleterow"),
          //                             onclick: function () {
          //                                 obj.deleteRow(parseInt(y));
          //                             }
          //                         });
          //                         // }
          //                     }
          //                 }
          //                 return items;
          //             }.bind(this)
          //         };
          //         var varEL = ""
          //         this.el = jexcel(document.getElementById("tableDiv"), options);
          //         varEL = this.el
          //         this.setState({
          //             dataEL: varEL,
          //             loading: false,
          //             programList: plList
          //         })
        } else {
          this.setState(
            {
              message: response.data.messageCode,
              color: "red",
              integrationList: [],
              loading: false,
            },
            () => {
              this.hideFirstComponent();
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
            // message: 'static.unkownError',
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

  loaded = function (instance, cell, x, y, value) {
    jExcelLoadedFunction(instance);
  };

  loadedModal = function (instance, cell, x, y, value) {
    jExcelLoadedFunctionOnlyHideRow(instance);
    if(document.getElementsByClassName("jss").length>1){
      var asterisk = document.getElementsByClassName("jss")[1].firstChild.nextSibling;
      var tr = asterisk.firstChild;
      tr.children[1].classList.add("AsteriskTheadtrTd");
      tr.children[2].classList.add("AsteriskTheadtrTd");
      tr.children[3].classList.add("AsteriskTheadtrTd");
    }else{
      var asterisk = document.getElementsByClassName("jss")[0].firstChild.nextSibling;
      var tr = asterisk.firstChild;
      tr.children[1].classList.add("AsteriskTheadtrTd");
      tr.children[2].classList.add("AsteriskTheadtrTd");
      tr.children[3].classList.add("AsteriskTheadtrTd");
    }
  };

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

  addRowClicked() {
    var obj = this.state.dataEL;
    var data = [];
    data[0] = "";
    data[1] = "";
    data[2] = "";
    obj.insertRow(data);
  }

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
        // console.log("List Test@@@123", list);
        IntegrationService.addManualJson(list)
          .then((response) => {
            // console.log(response.data);
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
                  this.hideFirstComponent();
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
                  this.hideFirstComponent();
                }
              );
            }
          })
          .catch((error) => {
            if (error.message === "Network Error") {
              this.setState({
                // message: 'static.unkownError',
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
                    // message: i18n.t('static.message.alreadExists'),
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
            this.hideSecondComponent();
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
          this.hideSecondComponent();
        }
      );
    }
  }

  checkValidations() {
    var valid = true;
    var elInstance = this.state.dataEL;
    var json = elInstance.getJson(null, false);
    // console.log("Json Test@@@123", json);
    var validation = "";
    for (var y = 0; y < json.length; y++) {
      if (json[y][0] != "" || json[y][1] != "" || json[y][2] != "") {
        // console.log("y Test@@@123", y);
        var rowData = elInstance.getRowData(y);
        // console.log("Row Data Test@@@123", rowData);
        validation = checkValidtion("text", "A", y, rowData[0], elInstance);
        // console.log("Validation 1 Test@@@123", validation);
        if (validation == false) {
          valid = false;
        }
        validation = checkValidtion("text", "B", y, rowData[1], elInstance);
        // console.log("Validation 2 Test@@@123", validation);
        if (validation == false) {
          valid = false;
        }
        validation = checkValidtion("text", "C", y, rowData[2], elInstance);
        // console.log("Validation 3 Test@@@123", validation);
        if (validation == false) {
          valid = false;
        }
      }
    }
    // console.log("Valid Test@@@123", valid);
    return valid;
  }

  hideFirstComponent() {
    document.getElementById("div1").style.display = "block";
    this.state.timeout = setTimeout(function () {
      document.getElementById("div1").style.display = "none";
    }, 30000);
  }

  hideSecondComponent() {
    document.getElementById("div2").style.display = "block";
    this.state.timeout = setTimeout(function () {
      document.getElementById("div2").style.display = "none";
    }, 30000);
  }

  handleRangeChange(value, text, listIndex) {
    //
  }
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

  _handleClickRangeBox(e) {
    this.pickRange.current.show();
  }

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
        // this.filterData(this.state.rangeValue)
      }
    );
  }

  filterProgram = () => {
    let countryIds = this.state.countryValues.map((ele) => ele.value);
    // console.log("countryIds", countryIds, "programs", this.state.programs);
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
                // console.log("programList", programList);
                var plList = [];
                programList.map((item) => {
                  plList.push({
                    id: item.id,
                    name: item.code,
                    versionList: [],
                  });
                });
                plList.sort((a, b) => {
                  var itemLabelA = a.name.toUpperCase(); // ignore upper and lowercase
                  var itemLabelB = b.name.toUpperCase(); // ignore upper and lowercase
                  return itemLabelA > itemLabelB ? 1 : -1;
                });
                plList.map((item) => {
                  programValues.push({ value: item.id });
                });

                if (plList.length > 0) {
                  this.setState(
                    {
                      programListBasedOnCountry: plList.sort((a, b) => {
                        var itemLabelA = a.name.toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = b.name.toUpperCase(); // ignore upper and lowercase
                        return itemLabelA > itemLabelB ? 1 : -1;
                      }),
                      programValues: programValues,
                      loading: false,
                    },
                    () => {
                      // console.log("programValues", programValues);

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
                    this.hideFirstComponent();
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
                  // message: 'static.unkownError',
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

  getVersions() {
    this.setState(
      {
        loading: true,
      },
      () => {
        let progList = this.state.programListBasedOnCountry;
        let programValues = this.state.programValues.map((ele) => ele.value);

        if (progList.length != 0) {
          // console.log("Json Test@@@123", this.state.loading);

          var keys = [];
          var values = [];
          let newProgramList = [...new Set(programValues)];

          DropdownService.getVersionListForPrograms(
            PROGRAM_TYPE_SUPPLY_PLAN,
            newProgramList
          )
            .then((versionResponse) => {
              if (versionResponse.status == 200) {
                //to get values
                for (let value of Object.values(versionResponse.data)) {
                  values.push(value);
                }
                //to get keys
                for (let key of Object.keys(versionResponse.data)) {
                  keys.push(key);
                }
                for (var i = 0; i < keys.length; i++) {
                  // verLst[keys[i]] = values[i];
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
                    this.hideFirstComponent();
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
                  // message: 'static.unkownError',
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
        // console.log("Json Test@@@123", json);
        IntegrationService.reportForManualIntegration(json)
          .then((response) => {
            // console.log(response.data);
            var dataForJexcel = [];
            if (realmCountryIds.length > 0 && programIds.length > 0) {
              dataForJexcel = response.data.sort((a, b) => {
                var itemLabelA = a.createdDate;
                var itemLabelB = b.createdDate;
                return itemLabelA < itemLabelB ? 1 : -1;
              });
            }
            if (response.status == "200") {
              // console.log("Response.data Test@@@123", response.data);
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
              // this.el.destroy();
              jexcel.destroy(document.getElementById("tableDivReport"), true);
              var options = {
                data: tableData,
                columnDrag: true,
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
                    // readOnly: true,
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
                // tableOverflow: true,
                wordWrap: true,
                paginationOptions: JEXCEL_PAGINATION_OPTION,
                parseFormulas: true,
                position: "top",
                allowInsertColumn: false,
                allowManualInsertColumn: false,
                allowDeleteRow: false,
                // onchange: this.changed,
                // onblur: this.blur,
                // onfocus: this.focus,
                // oneditionend: this.onedit,
                copyCompatibility: true,
                // onpaste: this.onPaste,
                allowManualInsertRow: false,
                license: JEXCEL_PRO_KEY,
                editable: false,
                // text: {
                //     // showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                //     showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.of')} {1} ${i18n.t('static.jexcel.pages')}`,
                //     show: '',
                //     entries: '',
                // },
                onload: this.loaded,
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
                // dataEL: varEL,
                loading: false,
                // programList: plList
              });
            } else {
              this.setState(
                {
                  message: response.data.messageCode,
                  color: "red",
                },
                () => {
                  this.hideFirstComponent();
                }
              );
            }
          })
          .catch((error) => {
            // console.log("Err Test@@@123", error);
            if (error.message === "Network Error") {
              this.setState({
                // message: 'static.unkownError',
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
                    // message: i18n.t('static.message.alreadExists'),
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
          // { label: getLabelText(item.label, this.state.lang), value: item.programId }
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
        {/* <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5> */}
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
                        //theme="light"
                        onChange={this.handleRangeChange}
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
