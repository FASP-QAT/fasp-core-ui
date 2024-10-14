import jexcel from "jspreadsheet";
import moment from "moment";
import React, { Component } from "react";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";
import { Search } from "react-bootstrap-table2-toolkit";
import {
  Button,
  Card,
  CardBody,
  Col,
  FormGroup,
  Input,
  InputGroup,
  Label
} from "reactstrap";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import {
  jExcelLoadedFunction, loadedForNonEditableTables
} from "../../CommonComponent/JExcelCommonFunctions.js";
import getLabelText from "../../CommonComponent/getLabelText";
import {
  API_URL,
  JEXCEL_DATE_FORMAT_SM,
  JEXCEL_PAGINATION_OPTION,
  JEXCEL_PRO_KEY,
  PROGRAM_TYPE_SUPPLY_PLAN
} from "../../Constants";
import DropdownService from "../../api/DropdownService";
import i18n from "../../i18n";
import AuthenticationService from "../Common/AuthenticationService.js";
import AuthenticationServiceComponent from "../Common/AuthenticationServiceComponent";
import { hideFirstComponent, hideSecondComponent } from "../../CommonComponent/JavascriptCommonFunctions";
// Localized entity name
const entityname = i18n.t("static.program.programMaster");
/**
 * Component for list of program details.
 */
export default class ProgramList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      programlist: [],
      lang: "en",
      message: "",
      selProgram: [],
      countryList: [],
      lang: localStorage.getItem("lang"),
      loading: true,
    };
    this.addNewProgram = this.addNewProgram.bind(this);
    this.filterData = this.filterData.bind(this);
    this.buildJExcel = this.buildJExcel.bind(this);
    this.dataChange = this.dataChange.bind(this);
  }
  /**
   * Clears the timeout when the component is unmounted.
   */
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
  /**
   * Handles filter change for country.
   */
  dataChange() {
    localStorage.setItem(
      "SPCountryId",
      document.getElementById("countryId").value
    );
    localStorage.setItem(
      "SPSelStatus",
      document.getElementById("active").value
    );
  }
  /**
   * Handles filter change.
   */
  filterData() {
    let countryId = localStorage.getItem("SPCountryId")
      ? localStorage.getItem("SPCountryId")
      : 0;
    var selStatus = localStorage.getItem("SPSelStatus")
      ? localStorage.getItem("SPSelStatus")
      : localStorage.getItem("SPSelStatus") == ""
        ? ""
        : "true";
    if (countryId != 0 && selStatus != "") {
      let tempSelStatus = selStatus == "true" ? true : false;
      const selProgram = this.state.programList.filter(
        (c) => c.realmCountry.id == countryId && c.active == tempSelStatus
      );
      this.setState(
        {
          selProgram: selProgram,
        },
        () => {
          this.buildJExcel();
        }
      );
    } else if (countryId != 0) {
      const selProgram = this.state.programList.filter(
        (c) => c.realmCountry.id == countryId
      );
      this.setState(
        {
          selProgram: selProgram,
        },
        () => {
          this.buildJExcel();
        }
      );
    } else if (selStatus != "") {
      let tempSelStatus = selStatus == "true" ? true : false;
      const selProgram = this.state.programList.filter(
        (c) => c.active == tempSelStatus
      );
      this.setState(
        {
          selProgram: selProgram,
        },
        () => {
          this.buildJExcel();
        }
      );
    } else {
      this.setState(
        {
          selProgram: this.state.programList,
        },
        () => {
          this.buildJExcel();
        }
      );
    }
  }
  /**
   * Builds the jexcel component to display program list.
   */
  buildJExcel() {
    let programList = this.state.selProgram;
    programList.sort((a, b) => {
      var itemLabelA = getLabelText(
        a.program.label,
        this.state.lang
      ).toUpperCase();
      var itemLabelB = getLabelText(
        b.program.label,
        this.state.lang
      ).toUpperCase();
      return itemLabelA > itemLabelB ? 1 : -1;
    });
    let programArray = [];
    let count = 0;
    for (var j = 0; j < programList.length; j++) {
      data = [];
      data[0] = programList[j].program.id;
      data[1] = getLabelText(programList[j].realm.label, this.state.lang);
      data[2] = getLabelText(programList[j].program.label, this.state.lang);
      data[3] = programList[j].program.code;
      data[4] = getLabelText(
        programList[j].realmCountry.label,
        this.state.lang
      );
      data[5] = getLabelText(
        programList[j].organisation.label,
        this.state.lang
      );
      data[6] = getLabelText(programList[j].healthAreas.label, this.state.lang);
      data[7] = programList[j].lastUpdatedBy.username;
      data[8] = programList[j].lastUpdatedDate
        ? moment(programList[j].lastUpdatedDate).format(`YYYY-MM-DD`)
        : null;
      programArray[count] = data;
      count++;
    }
    this.el = jexcel(document.getElementById("tableDiv"), "");
    jexcel.destroy(document.getElementById("tableDiv"), true);
    var data = programArray;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [100, 100, 200, 100, 100, 100, 100, 100, 100],
      colHeaderClasses: ["Reqasterisk"],
      columns: [
        {
          title: 'programId',
          type: 'hidden',
          // title: 'A',
          // type: 'text',
          // visible: false
        },
        {
          title: i18n.t("static.program.realm"),
          type: "text",
        },
        {
          title: i18n.t("static.program.program"),
          type: "text",
        },
        {
          title: i18n.t("static.program.programDisplayName"),
          type: "text",
        },
        {
          title: i18n.t("static.program.realmcountry"),
          type: "text",
        },
        {
          title: i18n.t("static.program.organisation"),
          type: "text",
        },
        {
          title: i18n.t("static.program.healtharea"),
          type: "text",
        },
        {
          title: i18n.t("static.common.lastModifiedBy"),
          type: "text",
        },
        {
          title: i18n.t("static.common.lastModifiedDate"),
          type: "calendar",
          options: { format: JEXCEL_DATE_FORMAT_SM },
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
        if (AuthenticationService.checkUserACL([this.el.getValueFromCoords(0, y).toString()], 'ROLE_BF_ADD_INTEGRATION_PROGRAM')) {
          var items = [];
          if (y != null) {
            if (obj.options.allowInsertRow == true) {
              if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_ADD_INTEGRATION_PROGRAM')) {
                items.push({
                  title: i18n.t('static.integration.addProgramIntegration'),
                  onclick: function () {
                    this.props.history.push({
                      pathname: `/program/addIntegration/${this.el.getValueFromCoords(0, y)}`,
                    })
                  }.bind(this)
                });
              }
              // if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_MAP_PROCUREMENT_AGENT')) {
              //   items.push({
              //     title: i18n.t('static.procurementAgentProcurementUnit.mapProcurementAgent'),
              //     onclick: function () {
              //       this.props.history.push({
              //         pathname: `/program/mapProcurementAgent/${this.el.getValueFromCoords(0, y)}`,
              //       })
              //     }.bind(this)
              //   });
              // }
            }
          }
          return items;
        } else {
          return false;
        }
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
   * Redirects to the edit program screen on row click.
   */
  selected = function (instance, cell, x, y, value, e) {
    if (e.buttons == 1) {
      if ((x == 0 && value != 0) || y == 0) {
      } else {
        if (AuthenticationService.checkUserACL([this.el.getValueFromCoords(0, x).toString()], 'ROLE_BF_EDIT_PROGRAM')
        ) {
          this.props.history.push({
            pathname: `/program/editProgram/${this.el.getValueFromCoords(
              0,
              x
            )}`,
          });
        }
      }
    }
  }.bind(this);
  /**
   * Retrives the program and realm country list on component mount
   */
  componentDidMount() {
    hideFirstComponent();
    DropdownService.getUpdateProgramInfoDetailsBasedRealmCountryId(
      PROGRAM_TYPE_SUPPLY_PLAN,
      -1,
      -1
    )
      .then((response) => {
        if (response.status == 200) {
          this.setState(
            {
              programList: response.data,
              selProgram: response.data,
            },
            () => {
              this.filterData();
            }
          );
        } else {
          this.setState(
            {
              message: response.data.messageCode,
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
            case 409:
              this.setState({
                message: i18n.t('static.common.accessDenied'),
                loading: false,
                color: "#BA0C2F",
              });
              break;
            case 403:
              this.props.history.push(`/accessDenied`);
              break;
            case 500:
            case 404:
            case 406:
              this.setState({
                message: error.response.data.messageCode,
                loading: false,
              });
              break;
            case 412:
              this.setState({
                message: error.response.data.messageCode,
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
    let realmId = AuthenticationService.getRealmId();
    DropdownService.getRealmCountryDropdownList(realmId)
      .then((response) => {
        if (response.status == 200) {
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
          this.setState({
            countryList: listArray,
            loading: false,
          });
        } else {
          this.setState({ message: response.data.messageCode, loading: false });
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
            loading: false,
          });
        } else {
          switch (error.response ? error.response.status : "") {
            case 401:
              this.props.history.push(`/login/static.message.sessionExpired`);
              break;
            case 409:
              this.setState({
                message: i18n.t('static.common.accessDenied'),
                loading: false,
                color: "#BA0C2F",
              });
              break;
            case 403:
              this.props.history.push(`/accessDenied`);
              break;
            case 500:
            case 404:
            case 406:
              this.setState({
                message: error.response.data.messageCode,
                loading: false,
              });
              break;
            case 412:
              this.setState({
                message: error.response.data.messageCode,
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
  /**
   * Redirects to the add program screen.
   */
  addNewProgram() {
    this.props.history.push({
      pathname: "/program/programOnboarding",
    });
  }
  /**
   * Renders the program list.
   * @returns {JSX.Element} - Program list.
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
    const { countryList } = this.state;
    let countries =
      countryList.length > 0 &&
      countryList.map((item, i) => {
        return (
          <option key={i} value={item.id}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        );
      }, this);
    return (
      <div className="animated">
        <AuthenticationServiceComponent history={this.props.history} />
        <h5 className={this.props.match.params.color} id="div1">
          {i18n.t(this.props.match.params.message, { entityname })}
        </h5>
        <h5 className="red" id="div2">
          {i18n.t(this.state.message, { entityname })}
        </h5>
        <Card>
          <div className="Card-header-addicon">
            <div className="card-header-actions">
              <div className="card-header-action">
                {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes(
                  "ROLE_BF_SET_UP_PROGRAM"
                ) && (
                    <a
                      href="javascript:void();"
                      title={i18n.t("static.common.addEntity", { entityname })}
                      onClick={this.addNewProgram}
                    >
                      <i className="fa fa-plus-square"></i>
                    </a>
                  )}
              </div>
            </div>
          </div>
          <CardBody className="pb-lg-0 pt-lg-0">
            <Col md="6 pl-0">
              <div className="d-md-flex Selectdiv2">
                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                  <Label htmlFor="appendedInputButton">
                    {i18n.t("static.region.country")}
                  </Label>
                  <div className="controls SelectGo">
                    <InputGroup>
                      <Input
                        type="select"
                        name="countryId"
                        id="countryId"
                        bsSize="sm"
                        onChange={() => {
                          this.dataChange();
                          this.filterData();
                        }}
                        value={localStorage.getItem("SPCountryId")}
                      >
                        <option value="0">{i18n.t("static.common.all")}</option>
                        {countries}
                      </Input>
                    </InputGroup>
                  </div>
                </FormGroup>
                <FormGroup className="tab-ml-1 mt-md-2 mb-md-0 ">
                  <Label htmlFor="appendedInputButton">
                    {i18n.t("static.common.status")}
                  </Label>
                  <div className="controls SelectGo">
                    <InputGroup>
                      <Input
                        type="select"
                        name="active"
                        id="active"
                        bsSize="sm"
                        onChange={() => {
                          this.dataChange();
                          this.filterData();
                        }}
                        value={
                          localStorage.getItem("SPSelStatus")
                            ? localStorage.getItem("SPSelStatus")
                            : localStorage.getItem("SPSelStatus") == ""
                              ? ""
                              : true
                        }
                      >
                        <option value="">{i18n.t("static.common.all")}</option>
                        <option value="true">
                          {i18n.t("static.common.active")}
                        </option>
                        <option value="false">
                          {i18n.t("static.dataentry.inactive")}
                        </option>
                      </Input>
                    </InputGroup>
                  </div>
                </FormGroup>
              </div>
            </Col>
            <div className="consumptionDataEntryTable">
              <div
                id="tableDiv"
                className={
                  AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes(
                    "ROLE_BF_EDIT_PROGRAM"
                  )
                    ? "jexcelremoveReadonlybackground RowClickable"
                    : "jexcelremoveReadonlybackground"
                }
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
                      <strong>{i18n.t("static.loading.loading")}</strong>
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
