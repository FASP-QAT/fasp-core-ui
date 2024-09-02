import jexcel from "jspreadsheet";
import React, { Component } from "react";
import { Search } from "react-bootstrap-table2-toolkit";
import { MultiSelect } from "react-multi-select-component";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Form,
  FormGroup,
  Label
} from "reactstrap";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import {
  checkValidation,
  changed,
  jExcelLoadedFunction,
  jExcelLoadedFunctionOnlyHideRow,
} from "../../CommonComponent/JExcelCommonFunctions.js";
import getLabelText from "../../CommonComponent/getLabelText";
import {
  API_URL,
  JEXCEL_DECIMAL_NO_REGEX_FOR_MULTIPLIER,
  JEXCEL_PAGINATION_OPTION,
  JEXCEL_PRO_KEY,
  PROGRAM_TYPE_SUPPLY_PLAN
} from "../../Constants";
import DropdownService from "../../api/DropdownService";
import PlanningUnitService from "../../api/PlanningUnitService";
import RealmCountryService from "../../api/RealmCountryService";
import UnitService from "../../api/UnitService";
import i18n from "../../i18n";
import AuthenticationService from "../Common/AuthenticationService.js";
import AuthenticationServiceComponent from "../Common/AuthenticationServiceComponent";
import { filterOptions, hideSecondComponent } from "../../CommonComponent/JavascriptCommonFunctions";
// Localized entity name
const entityname = i18n.t("static.dashboad.planningunitcountry");
/**
 * Component for creating realm country planning units(Alternate Reporting Units).
 */
export default class RealmCountryPlanningUnitList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realmCountrys: [],
      realmCountryPlanningUnitList: [],
      message: "",
      selSource: [],
      loading: true,
      allowAdd: false,
      units: [],
      lang: localStorage.getItem("lang"),
      planningUnitCountry: {},
      planningUnits: [],
      realmCountryPlanningUnitId: "",
      realmCountry: {
        realmCountryId: "",
        country: {
          countryId: "",
          label: {
            label_en: "",
          },
        },
        realm: {
          realmId: "",
          label: {
            label_en: "",
          },
        },
      },
      realmCountryName: "",
      label: {
        label_en: "",
      },
      skuCode: "",
      multiplier: "",
      rows: [],
      planningUnit: {
        planningUnitId: "",
        label: {
          label_en: "",
        },
      },
      unit: {
        unitId: "",
        label: {
          label_en: "",
        },
      },
      isNew: true,
      updateRowStatus: 0,
      programs: [],
      offlinePrograms: [],
      programValues: [],
      programLabels: [],
    };
    this.filterData = this.filterData.bind(this);
    this.buildJexcel = this.buildJexcel.bind(this);
    this.cancelClicked = this.cancelClicked.bind(this);
    this.addRow = this.addRow.bind(this);
    this.formSubmit = this.formSubmit.bind(this);
    this.checkValidation = this.checkValidation.bind(this);
    this.changed = this.changed.bind(this);
    this.onPaste = this.onPaste.bind(this);
    this.handleChangeProgram = this.handleChangeProgram.bind(this);
    this.oneditionend = this.oneditionend.bind(this);
  }
  /**
   * Redirects to the application dashboard screen when cancel button is clicked.
   */
  cancelClicked() {
    let id = AuthenticationService.displayDashboardBasedOnRole();
    this.props.history.push(
      `/ApplicationDashboard/` +
      `${id}` +
      "/red/" +
      i18n.t("static.message.cancelled", { entityname })
    );
  }
  /**
   * Function to add a new row to the jexcel table.
   */
  addRow = function () {
    var data = [];
    data[0] = "";
    data[1] = "";
    data[2] = "";
    data[3] = "";
    data[4] = "";
    data[5] = "";
    data[6] = "";
    data[7] = true;
    data[8] = "";
    data[9] = 0;
    data[10] = 1;
    data[11] = "";
    this.el.insertRow(data, 0, 1);
  };
  /**
   * Callback function called when editing of a cell in the jexcel table ends.
   * @param {object} instance - The jexcel instance.
   * @param {object} cell - The cell object.
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @param {any} value - The new value of the cell.
   */
  oneditionend = function (instance, cell, x, y, value) {
    var elInstance = instance;
    var rowData = elInstance.getRowData(y);
    if (
      x == 6 &&
      !isNaN(rowData[6]) &&
      rowData[6].toString().indexOf(".") != -1
    ) {
      elInstance.setValueFromCoords(6, y, parseFloat(rowData[6]), true);
    }
    this.el.setValueFromCoords(10, y, 1, true);
  };
  /**
   * Function to handle paste events in the jexcel table.
   * @param {Object} instance - The jexcel instance.
   * @param {Array} data - The data being pasted.
   */
  onPaste(instance, data) {
    var z = -1;
    for (var i = 0; i < data.length; i++) {
      if (z != data[i].y) {
        var index = instance.getValue(`J${parseInt(data[i].y) + 1}`, true);
        if (index === "" || index == null || index == undefined) {
          instance.setValueFromCoords(7, data[i].y, true, true);
          instance.setValueFromCoords(9, data[i].y, 0, true);
          instance.setValueFromCoords(10, data[i].y, 1, true);
          z = data[i].y;
        }
      }
    }
  }
  /**
   * Handles the change event for program selection.
   * @param {array} programIds - The array of selected program IDs.
   */
  handleChangeProgram(programId) {
    programId = programId.sort(function (a, b) {
      return parseInt(a.value) - parseInt(b.value);
    });
    this.setState(
      {
        programValues: programId.map((ele) => ele),
        programLabels: programId.map((ele) => ele.label),
        loading: true,
      },
      () => {
        this.filterData();
      }
    );
  }
  /**
   * Function to handle form submission and save the data on server.
   */
  formSubmit = function () {
    var validation = this.checkValidation();
    if (validation == true) {
      this.setState({
        loading: true,
      });
      var tableJson = this.el.getJson(null, false);
      let changedpapuList = [];
      var isMultiplierChanged = 0;
      for (var i = 0; i < tableJson.length; i++) {
        var value = this.el
          .getValue(`G${parseInt(i) + 1}`, true)
          .toString()
          .replaceAll(",", "");
        var map1 = new Map(Object.entries(tableJson[i]));        
        var oldValue = map1.get("11");
        if (value != oldValue && map1.get("9") > 0) {
          isMultiplierChanged = 1;
        }
        if (parseInt(map1.get("10")) === 1) {
          let json = {
            planningUnit: {
              id: parseInt(map1.get("1")),
            },
            label: {
              label_en: map1.get("2").toString().trim(),
            },
            skuCode: map1.get("3"),
            unit: {
              unitId: parseInt(map1.get("4")),
            },
            conversionMethod: parseInt(map1.get("5")),
            conversionNumber: this.el
              .getValue(`G${parseInt(i) + 1}`, true)
              .toString()
              .replaceAll(",", ""),
            active: map1.get("7"),
            realmCountry: {
              id: parseInt(map1.get("0")),
            },
            realmCountryPlanningUnitId: parseInt(map1.get("9")),
          };
          changedpapuList.push(json);
        }
      }
      var submitChanges = true;
      if (isMultiplierChanged) {
        var cf = window.confirm(
          i18n.t("static.realmCountryPlanningUnitList.warningMultiplierChange")
        );
        if (cf == true) {
        } else {
          submitChanges = false;
        }
      }
      if (submitChanges) {
        RealmCountryService.editPlanningUnitCountry(changedpapuList)
          .then((response) => {
            if (response.status == "200") {
              this.filterData();
              this.setState(
                {
                  message: i18n.t(response.data.messageCode, { entityname }),
                  color: "green",
                  loading: false,
                },
                () => {
                  hideSecondComponent();
                }
              );
            } else {
              this.setState(
                {
                  message: response.data.messageCode,
                  color: "#BA0C2F",
                  loading: false,
                },
                () => {
                  hideSecondComponent();
                }
              );
            }
          })
          .catch((error) => {
            if (error.message === "Network Error") {
              this.setState(
                {
                  message: API_URL.includes("uat")
                    ? i18n.t("static.common.uatNetworkErrorMessage")
                    : API_URL.includes("demo")
                      ? i18n.t("static.common.demoNetworkErrorMessage")
                      : i18n.t("static.common.prodNetworkErrorMessage"),
                  color: "#BA0C2F",
                  loading: false,
                },
                () => {
                  hideSecondComponent();
                }
              );
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
                  this.setState(
                    {
                      message: error.response.data.messageCode,
                      color: "#BA0C2F",
                      loading: false,
                    },
                    () => {
                      hideSecondComponent();
                    }
                  );
                  break;
                case 406:
                  this.setState(
                    {
                      message: "static.realmCountryPlanningUnit.duplicateSKU",
                      color: "red",
                      loading: false,
                    },
                    () => {
                      hideSecondComponent();
                    }
                  );
                  break;
                case 412:
                  this.setState(
                    {
                      message: "static.realmCountryPlanningUnit.failedToUpdate",
                      color: "red",
                      loading: false,
                    },
                    () => {
                      hideSecondComponent();
                      var json = this.el.getJson(null, false);
                      for (var j = 0; j < json.length; j++) {
                        if (json[j][9] == 1 && json[j][6].toString() == "false" && json[j][10] == 1) {
                          var col = "G".concat(parseInt(j) + 1);
                          this.el.setStyle(col, "background-color", "transparent");
                          this.el.setStyle(col, "background-color", "yellow");
                          this.el.setComments(col, i18n.t("static.realmCountryPlanningUnit.failedToUpdate"));
                        }
                      }
                    }
                  );
                  break;
                default:
                  this.setState(
                    {
                      message: "static.unkownError",
                      color: "#BA0C2F",
                      loading: false,
                    },
                    () => {
                      hideSecondComponent();
                    }
                  );
                  break;
              }
            }
          });
      } else {
        this.setState({
          loading: false,
        });
      }
    } else {
    }
  };
  /**
   * Function to check validation of the jexcel table.
   * @returns {boolean} - True if validation passes, false otherwise.
   */
  checkValidation = function () {
    var valid = true;
    var json = this.el.getJson(null, false);
    for (var y = 0; y < json.length; y++) {
      var value = this.el.getValueFromCoords(10, y);
      if (parseInt(value) == 1) {
        valid = checkValidation(this.el);
        if(!valid){
          this.setState({
                  message: i18n.t('static.supplyPlan.validationFailed'),
                  color: 'red'
              },
              () => {
                  hideSecondComponent();
              })
      }
        var value = this.el
          .getValue(`G${parseInt(y) + 1}`, true)
          .toString()
          .replaceAll(",", "");

      }
    }
    return valid;
  };
  /**
   * Function to handle changes in jexcel cells.
   * @param {Object} instance - The jexcel instance.
   * @param {Object} cell - The cell object that changed.
   * @param {number} x - The x-coordinate of the changed cell.
   * @param {number} y - The y-coordinate of the changed cell.
   * @param {any} value - The new value of the changed cell.
   */
  changed = function (instance, cell, x, y, value) {

    changed(instance, cell, x, y, value)
    
    //Active
    if (x != 10) {
      this.el.setValueFromCoords(10, y, 1, true);
    }
  }.bind(this);
  /**
   * Function to build a jexcel table.
   * Constructs and initializes a jexcel table using the provided data and options.
   */
  buildJexcel() {
    const { planningUnits } = this.state;
    const { units } = this.state;
    const { realmCountrys } = this.state;
    let planningUnitArr = [];
    let unitArr = [];
    let realmCountryArr = [];
    let convMethodArr = [];
    if (realmCountrys.length > 0) {
      for (var i = 0; i < realmCountrys.length; i++) {
        var paJson = {
          name: getLabelText(realmCountrys[i].country.label, this.state.lang),
          id: parseInt(realmCountrys[i].realmCountryId),
        };
        realmCountryArr[i] = paJson;
      }
    }
    if (planningUnits.length > 0) {
      for (var i = 0; i < planningUnits.length; i++) {
        var paJson = {
          name:
            getLabelText(planningUnits[i].label, this.state.lang) +
            " | " +
            parseInt(planningUnits[i].id),
          id: parseInt(planningUnits[i].id),
        };
        planningUnitArr[i] = paJson;
      }
    }
    if (units.length > 0) {
      for (var i = 0; i < units.length; i++) {
        var paJson = {
          name: getLabelText(units[i].label, this.state.lang),
          id: parseInt(units[i].unitId),
        };
        unitArr[i] = paJson;
      }
    }
    //Create json for Conversion method dropdown    
    convMethodArr[0] = {
      name: i18n.t("static.alternateReportingUnit.multiply"),
      id: parseInt(1)//Multiply
    };

    convMethodArr[1] = {
      name: i18n.t("static.alternateReportingUnit.divide"),
      id: parseInt(2)//Divide
    };

    var papuList = this.state.rows;
    var data = [];
    var papuDataArr = [];
    var count = 0;
    if (papuList.length != 0) {
      for (var j = 0; j < papuList.length; j++) {
        data = [];
        data[0] = parseInt(papuList[j].realmCountry.id);
        data[1] = parseInt(papuList[j].planningUnit.id);
        data[2] = papuList[j].label.label_en;
        data[3] = papuList[j].skuCode;
        data[4] = parseInt(papuList[j].unit.unitId);
        data[5] = papuList[j].conversionMethod;
        data[6] = papuList[j].conversionNumber;
        data[7] = papuList[j].active;
        data[8] = papuList[j].realmCountry.id;
        data[9] = papuList[j].realmCountryPlanningUnitId;
        data[10] = 0;
        data[11] = papuList[j].conversionNumber;
        papuDataArr[count] = data;
        count++;
      }
    }
    if (papuDataArr.length == 0) {
      data = [];
      data[0] = "";
      data[1] = "";
      data[2] = "";
      data[3] = "";
      data[4] = "";
      data[5] = "";
      data[6] = "";
      data[7] = true;
      data[8] = "";
      data[9] = 0;
      data[10] = 1;
      data[11] = "";
      papuDataArr[0] = data;
    }
    this.el = jexcel(document.getElementById("tableDiv"), "");
    jexcel.destroy(document.getElementById("tableDiv"), true);
    var data = papuDataArr;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [100, 100, 100, 100, 100, 100, 100],
      columns: [
        {
          title: i18n.t("static.dashboard.realmcountry"),
          type: "autocomplete",
          source: realmCountryArr,
          required: true
        },
        {
          title: i18n.t("static.planningunit.planningunit"),
          type: "autocomplete",
          source: planningUnitArr,
          required: true
        },
        {
          title: i18n.t("static.planningunit.countrysku"),
          type: "text",
          required: true
        },
        {
          title: i18n.t("static.procurementAgentProcurementUnit.skuCode"),
          type: "text",
          required: true
        },
        {
          title: i18n.t("static.unit.unit"),
          type: "autocomplete",
          source: unitArr,
          required: true
        },
        {
          title: i18n.t("static.unit.conversionMethod"),
          type: "autocomplete",
          source: convMethodArr,
          required: true
        },
        {
          title: i18n.t("static.unit.multiplierFromARUTOPU"),
          type: "numeric",
          textEditor: true,
          decimal: ".",
          mask: "#,##0.000000",
          disabledMaskOnEdition: true,
          required: true,
          regex: {
            ex: JEXCEL_DECIMAL_NO_REGEX_FOR_MULTIPLIER,
            text: i18n.t("static.message.invalidnumber")
          }
        },
        {
          title: i18n.t("static.checkbox.active"),
          type: "checkbox",
        },
        {
          title: "realmCountryId",
          type: "hidden",
        },
        {
          title: "realmCountryPlanningUnitId",
          type: "hidden",
        },
        {
          title: "isChange",
          type: "hidden",
        },
        {
          title: "multiplier",
          type: "hidden",
        },
      ],
      updateTable: function (el, cell, x, y, source, value, id) {
        var elInstance = el;
        var rowData = elInstance.getRowData(y);
        var realmCountryPlanningUnitId = rowData[8];
        if (realmCountryPlanningUnitId == 0) {
          var cell = elInstance.getCell(`B${parseInt(y) + 1}`);
          var cellA = elInstance.getCell(`A${parseInt(y) + 1}`);
          var cellG = elInstance.getCell(`G${parseInt(y) + 1}`);
          var cellF = elInstance.getCell(`F${parseInt(y) + 1}`);
          cell.classList.remove("readonly");
          cellA.classList.remove("readonly");
          cellG.classList.remove("readonly");
          cellF.classList.remove("readonly");
        } else {
          var cell = elInstance.getCell(`B${parseInt(y) + 1}`);
          var cellA = elInstance.getCell(`A${parseInt(y) + 1}`);
          var cellG = elInstance.getCell(`G${parseInt(y) + 1}`);
          var cellF = elInstance.getCell(`F${parseInt(y) + 1}`);
          cell.classList.add("readonly");
          cellA.classList.add("readonly");
          cellG.classList.add("readonly");
          cellF.classList.add("readonly");
        }
      },
      onsearch: function (el) {
      },
      onfilter: function (el) {
      },
      pagination: localStorage.getItem("sesRecordCount"),
      filters: true,
      search: true,
      columnSorting: true,
      wordWrap: true,
      paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: "top",
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: true,
      onchange: this.changed,
      copyCompatibility: true,
      allowManualInsertRow: false,
      parseFormulas: true,
      onpaste: this.onPaste,
      oneditionend: this.oneditionend,
      filters: true,
      license: JEXCEL_PRO_KEY,
      onload: this.loaded,
      license: JEXCEL_PRO_KEY,
      contextMenu: function (obj, x, y, e) {
        var items = [];
        if (y == null) {
          if (obj.options.allowInsertColumn == true) {
            items.push({
              title: obj.options.text.insertANewColumnBefore,
              onclick: function () {
                obj.insertColumn(1, parseInt(x), 1);
              },
            });
          }
          if (obj.options.allowInsertColumn == true) {
            items.push({
              title: obj.options.text.insertANewColumnAfter,
              onclick: function () {
                obj.insertColumn(1, parseInt(x), 0);
              },
            });
          }
          if (obj.options.columnSorting == true) {
            items.push({ type: "line" });
            items.push({
              title: obj.options.text.orderAscending,
              onclick: function () {
                obj.orderBy(x, 0);
              },
            });
            items.push({
              title: obj.options.text.orderDescending,
              onclick: function () {
                obj.orderBy(x, 1);
              },
            });
          }
        } else {
          if (obj.options.allowInsertRow == true) {
            items.push({
              title: i18n.t("static.common.insertNewRowBefore"),
              onclick: function () {
                var data = [];
                data[0] = "";
                data[1] = "";
                data[2] = "";
                data[3] = "";
                data[4] = "";
                data[5] = "";
                data[6] = "";
                data[7] = true;
                data[8] = "";
                data[9] = 0;
                data[10] = 1;
                data[11] = "";
                obj.insertRow(data, parseInt(y), 1);
              }.bind(this),
            });
          }
          if (obj.options.allowInsertRow == true) {
            items.push({
              title: i18n.t("static.common.insertNewRowAfter"),
              onclick: function () {
                var data = [];
                data[0] = "";
                data[1] = "";
                data[2] = "";
                data[3] = "";
                data[4] = "";
                data[5] = "";
                data[6] = "";
                data[7] = true;
                data[8] = "";
                data[9] = 0;
                data[10] = 1;
                data[11] = "";
                obj.insertRow(data, parseInt(y));
              }.bind(this),
            });
          }
          if (obj.options.allowDeleteRow == true) {
            if (obj.getRowData(y)[9] == 0) {
              items.push({
                title: i18n.t("static.common.deleterow"),
                onclick: function () {
                  obj.deleteRow(parseInt(y));
                },
              });
            }
          }
          if (x) {
          }
        }
        items.push({ type: "line" });
        return items;
      }.bind(this),
    };
    this.el = jexcel(document.getElementById("tableDiv"), options);
    this.setState({
      loading: false,
    });
  }
  /**
   * Function to filter and fetch data based on selected programs from server.
   */
  filterData() {
    if (this.state.programValues.length > 0) {
      let programIds = this.state.programValues.map((ele) =>
        ele.value.toString()
      );
      const { programs } = this.state;
      let realmCountryList = [];
      for (var i = 0; i < programIds.length; i++) {
        for (var j = 0; j < programs.length; j++) {
          if (programIds[i] == programs[j].program.id) {
            let json = {
              realmCountryId: programs[j].realmCountry.id,
              country: programs[j].realmCountry,
              realm: programs[j].realm,
            };
            realmCountryList.push(json);
          }
        }
      }
      if (realmCountryList.length != 0) {
        realmCountryList.sort((a, b) => {
          var itemLabelA = getLabelText(
            a.country.label,
            this.state.lang
          ).toUpperCase();
          var itemLabelB = getLabelText(
            b.country.label,
            this.state.lang
          ).toUpperCase();
          return itemLabelA > itemLabelB ? 1 : -1;
        });
      }
      const realmCountrys = [
        ...new Map(
          realmCountryList.map((item) => [item.realmCountryId, item])
        ).values(),
      ];
      RealmCountryService.getRealmCountryPlanningUnitByProgramId(programIds)
        .then((response1) => {
          UnitService.getUnitListAll()
            .then((response2) => {
              PlanningUnitService.getPlanningUnitByProgramIds(programIds)
                .then((response3) => {
                  this.setState(
                    {
                      rows: response1.data.sort((a, b) => {
                        var itemLabelA = getLabelText(
                          a.planningUnit.label,
                          this.state.lang
                        ).toUpperCase();
                        var itemLabelB = getLabelText(
                          b.planningUnit.label,
                          this.state.lang
                        ).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                      }),
                      units: response2.data.sort((a, b) => {
                        var itemLabelA = getLabelText(
                          a.label,
                          this.state.lang
                        ).toUpperCase();
                        var itemLabelB = getLabelText(
                          b.label,
                          this.state.lang
                        ).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                      }),
                      planningUnits: response3.data.sort((a, b) => {
                        var itemLabelA = getLabelText(
                          a.label,
                          this.state.lang
                        ).toUpperCase();
                        var itemLabelB = getLabelText(
                          b.label,
                          this.state.lang
                        ).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                      }),
                      allowAdd: true,
                      realmCountrys,
                    },
                    () => {
                      this.buildJexcel();
                    }
                  );
                })
                .catch((error) => {
                  if (error.message === "Network Error") {
                    this.setState(
                      {
                        message: API_URL.includes("uat")
                          ? i18n.t("static.common.uatNetworkErrorMessage")
                          : API_URL.includes("demo")
                            ? i18n.t("static.common.demoNetworkErrorMessage")
                            : i18n.t("static.common.prodNetworkErrorMessage"),
                        loading: false,
                      },
                      () => {
                        hideSecondComponent();
                      }
                    );
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
                        this.setState(
                          {
                            message: error.response.data.messageCode,
                            loading: false,
                          },
                          () => {
                            hideSecondComponent();
                          }
                        );
                        break;
                      case 412:
                        this.setState(
                          {
                            message: error.response.data.messageCode,
                            loading: false,
                          },
                          () => {
                            hideSecondComponent();
                          }
                        );
                        break;
                      default:
                        this.setState(
                          {
                            message: "static.unkownError",
                            loading: false,
                          },
                          () => {
                            hideSecondComponent();
                          }
                        );
                        break;
                    }
                  }
                });
            })
            .catch((error) => {
              if (error.message === "Network Error") {
                this.setState(
                  {
                    message: API_URL.includes("uat")
                      ? i18n.t("static.common.uatNetworkErrorMessage")
                      : API_URL.includes("demo")
                        ? i18n.t("static.common.demoNetworkErrorMessage")
                        : i18n.t("static.common.prodNetworkErrorMessage"),
                    loading: false,
                  },
                  () => {
                    hideSecondComponent();
                  }
                );
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
                    this.setState(
                      {
                        message: error.response.data.messageCode,
                        loading: false,
                      },
                      () => {
                        hideSecondComponent();
                      }
                    );
                    break;
                  case 412:
                    this.setState(
                      {
                        message: error.response.data.messageCode,
                        loading: false,
                      },
                      () => {
                        hideSecondComponent();
                      }
                    );
                    break;
                  default:
                    this.setState(
                      {
                        message: "static.unkownError",
                        loading: false,
                      },
                      () => {
                        hideSecondComponent();
                      }
                    );
                    break;
                }
              }
            });
        })
        .catch((error) => {
          if (error.message === "Network Error") {
            this.setState(
              {
                message: API_URL.includes("uat")
                  ? i18n.t("static.common.uatNetworkErrorMessage")
                  : API_URL.includes("demo")
                    ? i18n.t("static.common.demoNetworkErrorMessage")
                    : i18n.t("static.common.prodNetworkErrorMessage"),
                loading: false,
              },
              () => {
                hideSecondComponent();
              }
            );
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
                this.setState(
                  {
                    message: error.response.data.messageCode,
                    loading: false,
                  },
                  () => {
                    hideSecondComponent();
                  }
                );
                break;
              case 412:
                this.setState(
                  {
                    message: error.response.data.messageCode,
                    loading: false,
                  },
                  () => {
                    hideSecondComponent();
                  }
                );
                break;
              default:
                this.setState(
                  {
                    message: "static.unkownError",
                    loading: false,
                  },
                  () => {
                    hideSecondComponent();
                  }
                );
                break;
            }
          }
        });
    } else {
      this.setState(
        {
          allowAdd: false,
          loading: false,
        },
        () => {
          this.el = jexcel(document.getElementById("tableDiv"), "");
          jexcel.destroy(document.getElementById("tableDiv"), true);
        }
      );
    }
  }
  /**
   * This function is used to format the table like add asterisk or info to the table headers
   * @param {*} instance This is the DOM Element where sheet is created
   * @param {*} cell This is the object of the DOM element
   */
  loaded = function (instance, cell) {
    jExcelLoadedFunction(instance);
    var asterisk =
      document.getElementsByClassName("jss")[0].firstChild.nextSibling;
    var tr = asterisk.firstChild;
    tr.children[1].classList.add("AsteriskTheadtrTd");
    tr.children[2].classList.add("AsteriskTheadtrTd");
    tr.children[3].classList.add("AsteriskTheadtrTd");
    tr.children[4].classList.add("AsteriskTheadtrTd");
    tr.children[5].classList.add("AsteriskTheadtrTd");
    tr.children[6].classList.add("AsteriskTheadtrTd");
    tr.children[7].classList.add("InfoTrAsteriskTheadtrTdImageARU");
    tr.children[7].title = i18n.t("static.tooltip.conversionfactorARU");
  };
  /**
   * Function to handle cell edits in jexcel.
   * @param {Object} instance - The jexcel instance.
   * @param {Object} cell - The cell object being edited.
   * @param {number} x - The x-coordinate of the edited cell.
   * @param {number} y - The y-coordinate of the edited cell.
   * @param {any} value - The new value of the edited cell.
   */
  onedit = function (instance, cell, x, y, value) {
    this.el.setValueFromCoords(10, y, 1, true);
  }.bind(this);
  /**
   * Calls the get programs function on page load
   */
  componentDidMount() {
    this.getPrograms();
  }
  /**
   * Retrieves the list of programs.
   */
  getPrograms = () => {
    DropdownService.getUpdateProgramInfoDetailsBasedRealmCountryId(
      PROGRAM_TYPE_SUPPLY_PLAN,
      -1,
      1
    )
      .then((response) => {
        this.setState({
          programs: response.data.sort(function (a, b) {
            a = a.program.code.toLowerCase();
            b = b.program.code.toLowerCase();
            return a < b ? -1 : a > b ? 1 : 0;
          }),
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          programs: [],
          loading: false,
        });
        if (error.message === "Network Error") {
          this.setState(
            {
              message: API_URL.includes("uat")
                ? i18n.t("static.common.uatNetworkErrorMessage")
                : API_URL.includes("demo")
                  ? i18n.t("static.common.demoNetworkErrorMessage")
                  : i18n.t("static.common.prodNetworkErrorMessage"),
              loading: false,
            },
            () => {
              hideSecondComponent();
            }
          );
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
              this.setState(
                {
                  message: i18n.t(error.response.data.messageCode, {
                    entityname: i18n.t("static.dashboard.program"),
                  }),
                  loading: false,
                },
                () => {
                  hideSecondComponent();
                }
              );
              break;
            case 412:
              this.setState(
                {
                  message: i18n.t(error.response.data.messageCode, {
                    entityname: i18n.t("static.dashboard.program"),
                  }),
                  loading: false,
                },
                () => {
                  hideSecondComponent();
                }
              );
              break;
            default:
              this.setState(
                {
                  message: "static.unkownError",
                  loading: false,
                },
                () => {
                  hideSecondComponent();
                }
              );
              break;
          }
        }
      });
  };
  /**
   * Renders the realm country planning unit(Alternate Reporting Unit) list.
   * @returns {JSX.Element} - Realm country planning unit(Alternate Reporting Unit) list.
   */
  render() {
    jexcel.setDictionary({
      Show: " ",
      entries: " ",
    });
    const { realmCountrys } = this.state;
    const { programs } = this.state;
    let programList =
      programs.length > 0 &&
      programs.map((item, i) => {
        return { label: item.program.code, value: item.program.id };
      }, this);
    const { SearchBar, ClearSearchButton } = Search;
    const customTotal = (from, to, size) => (
      <span className="react-bootstrap-table-pagination-total">
        {i18n.t("static.common.result", { from, to, size })}
      </span>
    );
    return (
      <div className="animated">
        <AuthenticationServiceComponent history={this.props.history} />
        <h5 className={this.props.match.params.color} id="div1">
          {i18n.t(this.props.match.params.message, { entityname })}
        </h5>
        <h5 className={this.state.color} id="div2">
          {i18n.t(this.state.message, { entityname })}
        </h5>
        <Card>
          <CardBody className="pb-lg-2 pt-lg-1">
            <Form>
              <div className="pl-0">
                <div className="row">
                  <FormGroup className="col-md-3 pt-2">
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
                      filterOptions={filterOptions}
                    />
                    {!!this.props.error && this.props.touched && (
                      <div style={{ color: "#BA0C2F", marginTop: ".5rem" }}>
                        {this.props.error}
                      </div>
                    )}
                  </FormGroup>
                </div>
              </div>
            </Form>
            <div className="consumptionDataEntryTable ARUMarginTop">
              <div
                id="tableDiv"
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
          {this.state.allowAdd && (
            <CardFooter>
              {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes(
                "ROLE_BF_MANAGE_REALM_COUNTRY_PLANNING_UNIT"
              ) && (
                  <FormGroup>
                    <Button
                      type="button"
                      size="md"
                      color="danger"
                      className="float-right mr-1"
                      onClick={this.cancelClicked}
                    >
                      <i className="fa fa-times"></i>{" "}
                      {i18n.t("static.common.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      size="md"
                      color="success"
                      onClick={this.formSubmit}
                      className="float-right mr-1"
                    >
                      <i className="fa fa-check"></i>
                      {i18n.t("static.common.submit")}
                    </Button>
                    <Button
                      color="info"
                      size="md"
                      className="float-right mr-1"
                      type="button"
                      onClick={() => this.addRow()}
                    >
                      {" "}
                      <i className="fa fa-plus"></i>{" "}
                      {i18n.t("static.common.addRow")}
                    </Button>
                    &nbsp;
                  </FormGroup>
                )}
            </CardFooter>
          )}
        </Card>
      </div>
    );
  }
}
