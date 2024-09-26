import classNames from "classnames";
import { Formik } from "formik";
import jexcel from "jspreadsheet";
import React, { Component } from "react";
import Select from "react-select";
import "react-select/dist/react-select.min.css";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row
} from "reactstrap";
import * as Yup from "yup";
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction } from "../../CommonComponent/JExcelCommonFunctions.js";
import getLabelText from "../../CommonComponent/getLabelText";
import { JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from "../../Constants";
import {
  API_URL,
  SPECIAL_CHARECTER_WITH_NUM_NODOUBLESPACE
} from "../../Constants.js";
import DropdownService from "../../api/DropdownService";
import LanguageService from "../../api/LanguageService";
import RealmService from "../../api/RealmService";
import UserService from "../../api/UserService";
import i18n from "../../i18n";
import AuthenticationService from "../Common/AuthenticationService.js";
import AuthenticationServiceComponent from "../Common/AuthenticationServiceComponent";
const initialValues = {
  username: "",
  realmId: [],
  emailId: "",
  orgAndCountry: "",
  languageId: [],
};
const entityname = i18n.t("static.user.user");
/**
 * This const is used to define the validation schema for user details
 * @param {*} values 
 * @returns 
 */

const validationSchema = function (values) {
  return Yup.object().shape({
    username: Yup.string()
      .matches(/^\S+(?: \S+)*$/, i18n.t("static.validSpace.string"))
      .required(i18n.t("static.user.validusername")),
    languageId: Yup.string().required(i18n.t("static.user.validlanguage")),
    emailId: Yup.string()
      .email(i18n.t("static.user.invalidemail"))
      .required(i18n.t("static.user.validemail")),
    // roleId: Yup.string()
    //   .test(
    //     "roleValid",
    //     i18n.t("static.common.roleinvalidtext"),
    //     function (value) {
    //       if (document.getElementById("roleValid").value == "false") {
    //         return true;
    //       }
    //     }
    //   )
    //   .required(i18n.t("static.user.validrole")),
    orgAndCountry: Yup.string()
      .matches(
        SPECIAL_CHARECTER_WITH_NUM_NODOUBLESPACE,
        i18n.t("static.validNoDoubleSpace.string")
      )
      .required(i18n.t("static.user.org&CountryText")),
  });
};

/**
 * This component is used to display the user details in a form and allow user to edit the details
 */
class EditUserComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appAdminRole: false,
      lang: localStorage.getItem("lang"),
      realms: [],
      languages: [],
      roles: [],
      user: {
        realm: {
          realmId: "",
          label: {
            label_en: "",
          },
        },
        language: {
          languageId: "",
        },
        roles: [],
        username: "",
        emailId: "",
        orgAndCountry: "",
        roleList: [],
      },
      message: "",
      roleId: "",
      roleList: [],
      loading: true,
      rows: [],
      loading1: true,
      programListForFilter: [],
      addUserEL: "",
    };
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
    this.roleChange = this.roleChange.bind(this);
    this.resetClicked = this.resetClicked.bind(this);
    this.hideSecondComponent = this.hideSecondComponent.bind(this);
    this.getAccessControlData = this.getAccessControlData.bind(this);
    this.addRow = this.addRow.bind(this);
    this.buildJexcel = this.buildJexcel.bind(this);
    this.onPaste = this.onPaste.bind(this);
    this.filterOrganisation = this.filterOrganisation.bind(this);
    this.filterHealthArea = this.filterHealthArea.bind(this);
    this.filterProgram = this.filterProgram.bind(this);
    this.filterData = this.filterData.bind(this);
  }
  /**
   * This function is used to hide the messages that are there in div2 after 30 seconds
   */
  hideSecondComponent() {
    document.getElementById("div2").style.display = "block";
    setTimeout(function () {
      document.getElementById("div2").style.display = "none";
    }, 30000);
  }
  /**
   * This function is called when some data in the form is changed
   * @param {*} event This is the on change event
   */
  dataChange(event) {
    let { user } = this.state;
    if (event.target.name == "username") {
      user.username = event.target.value;
    }
    if (event.target.name == "emailId") {
      user.emailId = event.target.value.replace(
        /[\u200B-\u200D\u2060\uFEFF]/g,
        ""
      );
    }
    if (event.target.name == "orgAndCountry") {
      user.orgAndCountry = event.target.value;
    }
    // if (event.target.name == "roleId") {
    //   user.roles = Array.from(
    //     event.target.selectedOptions,
    //     (item) => item.value
    //   );
    // }
    if (event.target.name == "realmId") {
      user.realm.realmId = event.target.value;
    }
    if (event.target.name == "languageId") {
      user.language.languageId = event.target.value;
    }
    if (event.target.name == "active") {
      user.active = event.target.id === "active2" ? false : true;
    }
    this.setState(
      {
        user,
      },
      () => { }
    );
  }
  /**
   * This function is called when role is changed
   * @param {*} roleId This is the value role Ids selected by the user
   */
  roleChange(roleId) {
    var selectedArray = [];
    for (var p = 0; p < roleId.length; p++) {
      selectedArray.push(roleId[p].value);
    }
    if (selectedArray.includes("-1")) {
      this.setState({ roleId: [] });
      var list = this.state.roleList.filter((c) => c.value != -1);
      this.setState({ roleId: list });
      var roleId = list;
    } else {
      this.setState({ roleId: roleId });
      var roleId = roleId;
    }
    let { user } = this.state;
    let count = 0;
    let count1 = 0;
    var roleIdArray = [];
    for (var i = 0; i < roleId.length; i++) {
      roleIdArray[i] = roleId[i].value;
      if (roleId[i].value != "ROLE_APPLICATION_ADMIN") {
        count++;
      } else {
        count1++;
      }
    }
    if (count > 0) {
      if (count1 > 0) {
        this.setState({
          appAdminRole: true,
        });
        document.getElementById("roleValid").value = true;
      } else {
        this.setState({
          appAdminRole: false,
        });
        document.getElementById("roleValid").value = false;
      }
    } else {
      this.setState({
        appAdminRole: false,
      });
      document.getElementById("roleValid").value = false;
    }
    user.roles = roleIdArray;
    this.setState(
      {
        user,
        validateRealm: count > 0 ? true : false,
      },
      () => { }
    );
  }
  /**
   * This function is used to filter the program based on realm Id and realm country Id
   */
  filterProgram() {
    let realmId = this.state.user.realm.realmId;
    if (realmId != 0 && realmId != null) {
      const selProgram = this.state.programs.filter(
        (c) => c.realmCountry.id == realmId
      );
      this.setState({
        selProgram,
      });
    } else {
      this.setState({
        selProgram: this.state.programs,
      });
    }
  }
  /**
   * This function is used to filter the health area based on realm Id
   */
  filterHealthArea() {
    let realmId = this.state.user.realm.realmId;
    let selHealthArea;
    if (realmId != 0 && realmId != null) {
      selHealthArea = this.state.healthAreas;
    } else {
      selHealthArea = this.state.healthAreas;
    }
  }
  /**
   * This function is used to filter the organisation based on realm Id
   */
  filterOrganisation() {
    let realmId = this.state.user.realm.realmId;
    if (realmId != 0 && realmId != null) {
      const selOrganisation = this.state.organisations;
      this.setState({
        selOrganisation,
      });
    } else {
      this.setState({
        selOrganisation: this.state.organisations,
      });
    }
  }
  /**
   * This function is used to filter the realm country based on realm Id
   */
  filterData() {
    let realmId = this.state.user.realm.realmId;
    if (realmId != 0 && realmId != null) {
      const selRealmCountry = this.state.realmCountryList;
      this.setState({
        selRealmCountry,
      });
    } else {
      this.setState({
        selRealmCountry: this.state.realmCountryList,
      });
    }
  }
  /**
   * This function is used to get the list of realm country, health area, organisation and program for access control
   */
  getAccessControlData() {
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
            realmCountryList: listArray,
            selRealmCountry: listArray,
          });
          DropdownService.getOrganisationDropdownList(realmId)
            .then((response) => {
              if (response.status == "200") {
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
                  organisations: listArray,
                  selOrganisation: listArray,
                });
                DropdownService.getHealthAreaDropdownList(realmId)
                  .then((response) => {
                    if (response.status == "200") {
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
                        healthAreas: listArray,
                        selHealthArea: listArray,
                      });
                      DropdownService.getProgramBasedOnRealmIdAndProgramTypeId(
                        realmId,
                        0
                      )
                        .then((response1) => {
                          if (response1.status == "200") {
                            var listArray = response1.data;
                            listArray.sort((a, b) => {
                              var itemLabelA = a.code.toUpperCase();
                              var itemLabelB = b.code.toUpperCase();
                              return itemLabelA > itemLabelB ? 1 : -1;
                            });
                            this.setState(
                              {
                                programs: listArray,
                                selProgram: listArray,
                              },
                              () => {
                                this.filterData();
                                this.filterOrganisation();
                                this.filterHealthArea();
                                this.filterProgram();
                                this.buildJexcel();
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
                                  ? i18n.t(
                                    "static.common.demoNetworkErrorMessage"
                                  )
                                  : i18n.t(
                                    "static.common.prodNetworkErrorMessage"
                                  ),
                              loading: false,
                            });
                          } else {
                            switch (
                            error.response ? error.response.status : ""
                            ) {
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
                    } else {
                      this.setState(
                        {
                          message: response.data.messageCode,
                        },
                        () => {
                          this.hideSecondComponent();
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
              } else {
                this.setState({
                  message: response.data.message,
                });
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
        } else {
          this.setState(
            {
              message: response.data.messageCode,
            },
            () => {
              this.hideSecondComponent();
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
   * This function is called when something in the access control table is changed to add the validation and set values of other cell
   */
  changed = function (instance, cell, x, y, value) {
    if (x == 2) {
      this.el.setValueFromCoords(5, y, "", true);
      var col = "C".concat(parseInt(y) + 1);
      if (value == "") {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setStyle(col, "background-color", "yellow");
        this.el.setComments(col, i18n.t("static.label.fieldRequired"));
      } else {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setComments(col, "");
      }
    }
    if (x == 3) {
      this.el.setValueFromCoords(5, y, "", true);
      var col = "D".concat(parseInt(y) + 1);
      if (value == "") {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setStyle(col, "background-color", "yellow");
        this.el.setComments(col, i18n.t("static.label.fieldRequired"));
      } else {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setComments(col, "");
      }
    }
    if (x == 4) {
      var col = "E".concat(parseInt(y) + 1);
      if (value == "") {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setStyle(col, "background-color", "yellow");
        this.el.setComments(col, i18n.t("static.label.fieldRequired"));
      } else {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setComments(col, "");
      }
    }
    if (x == 5) {
      var col = "F".concat(parseInt(y) + 1);
      if (value == "") {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setStyle(col, "background-color", "yellow");
        this.el.setComments(col, i18n.t("static.label.fieldRequired"));
      } else {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setComments(col, "");
      }
    }
  }.bind(this);
  /**
   * This function is used to filter the program list based on user's selected realm country, health area and organisation
   */
  filterProgramByCountryId = function (instance, cell, c, r, source) {
    var value = this.state.addUserEL.getJson(null, false)[r][2];
    var healthAreavalue = this.state.addUserEL.getJson(null, false)[r][3];
    var proList = [];
    var proListByCountryId = [];
    var proListByHealthAreaId = [];
    if (value != -1) {
      proListByCountryId = this.state.programListForFilter.filter(
        (c) => c.id == -1 || c.realmCountryId == value
      );
      if (healthAreavalue != -1) {
        var programListWithAll = proListByCountryId.filter(
          (c) => c.id == -1
        )[0];
        proList.push(programListWithAll);
        for (var i = 1; i < proListByCountryId.length; i++) {
          proListByHealthAreaId = [];
          proListByHealthAreaId = proListByCountryId[i].healthAreaList.filter(
            (c) => c.id == healthAreavalue
          );
          if (proListByHealthAreaId.length != 0) {
            proList.push(proListByCountryId[i]);
          }
        }
      } else {
        proList = proListByCountryId;
      }
    } else if (healthAreavalue != -1) {
      proListByCountryId = this.state.programListForFilter;
      var programListWithAll = proListByCountryId.filter((c) => c.id == -1)[0];
      proList.push(programListWithAll);
      for (var i = 1; i < proListByCountryId.length; i++) {
        proListByHealthAreaId = [];
        proListByHealthAreaId = proListByCountryId[i].healthAreaList.filter(
          (c) => c.id == healthAreavalue
        );
        if (proListByHealthAreaId.length != 0) {
          proList.push(proListByCountryId[i]);
        }
      }
    } else {
      proList = this.state.programListForFilter;
    }
    var orgvalue = this.state.addUserEL.getJson(null, false)[r][4];
    if (orgvalue != -1) {
      proList = proList.filter(c => c.id == -1 || c.organisation.id == orgvalue)
    }
    return proList;
  }.bind(this);
  /**
   * This function is used to build the table the access control
   */
  buildJexcel() {
    const { selProgram } = this.state;
    const { selRealmCountry } = this.state;
    const { selOrganisation } = this.state;
    const { selHealthArea } = this.state;
    const { selRoleList } = this.state;

    let programList = [];
    let countryList = [];
    let organisationList = [];
    let healthAreaList = [];
    let roleList = [];

    var varEL = "";
    if (selProgram.length > 0) {
      for (var i = 0; i < selProgram.length; i++) {
        var name =
          selProgram[i].code +
          " (" +
          (selProgram[i].programTypeId == 1
            ? "SP"
            : selProgram[i].programTypeId == 2
              ? "FC"
              : "") +
          ")";
        var paJson = {
          name: name,
          id: parseInt(selProgram[i].id),
          realmCountryId: selProgram[i].realmCountry.id,
          healthAreaList: selProgram[i].healthAreaList,
          organisation: selProgram[i].organisation
        };
        programList[i] = paJson;
      }
      this.setState({
        programListForFilter: programList,
      });
      var paJson = {
        name: "All",
        id: -1,
        active: true,
      };
      programList.unshift(paJson);
    }
    if (selRealmCountry.length > 0) {
      for (var i = 0; i < selRealmCountry.length; i++) {
        var paJson = {
          name: getLabelText(selRealmCountry[i].label, this.state.lang),
          id: parseInt(selRealmCountry[i].id),
        };
        countryList[i] = paJson;
      }
      var paJson = {
        name: "All",
        id: -1,
        active: true,
      };
      countryList.unshift(paJson);
    }
    if (selOrganisation.length > 0) {
      for (var i = 0; i < selOrganisation.length; i++) {
        var paJson = {
          name: getLabelText(selOrganisation[i].label, this.state.lang),
          id: parseInt(selOrganisation[i].id),
        };
        organisationList[i] = paJson;
      }
      var paJson = {
        name: "All",
        id: -1,
        active: true,
      };
      organisationList.unshift(paJson);
    }
    if (selHealthArea.length > 0) {
      for (var i = 0; i < selHealthArea.length; i++) {
        var paJson = {
          name: getLabelText(selHealthArea[i].label, this.state.lang),
          id: parseInt(selHealthArea[i].id),
        };
        healthAreaList[i] = paJson;
      }
      var paJson = {
        name: "All",
        id: -1,
        active: true,
      };
      healthAreaList.unshift(paJson);
    }
    if (selRoleList.length > 0) {
      for (var i = 0; i < selRoleList.length; i++) {
        if (selRoleList[i] != undefined) {
          var paJson = {
            name: selRoleList[i].label,
            id: selRoleList[i].value,
          };
          roleList[i] = paJson;
        }
      }
      var paJson = {
        name: "Select",
        id: "",
        active: true,
      };
      roleList.unshift(paJson);
    }
    var papuList = this.state.rows;
    var data = [];
    var papuDataArr = [];
    var count = 0;
    if (papuList.length != 0) {
      for (var j = 0; j < papuList.length; j++) {
        data = [];
        data[0] = this.state.user.username;
        data[1] = papuList[j].roleId;
        data[2] = papuList[j].realmCountryId;
        data[3] = papuList[j].healthAreaId;
        data[4] = papuList[j].organisationId;
        data[5] = papuList[j].programId;
        papuDataArr[count] = data;
        count++;
      }
    }
    if (papuDataArr.length == 0) {
      data = [];
      data[0] = this.state.user.username;
      data[1] = "";
      data[2] = -1;
      data[3] = -1;
      data[4] = -1;
      data[5] = -1;
      papuDataArr[0] = data;
    }
    this.el = jexcel(document.getElementById("paputableDiv"), "");
    jexcel.destroy(document.getElementById("paputableDiv"), true);
    var data = papuDataArr;
    var options = {
      data: data,
      columnDrag: false,
      colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
      columns: [
        {
          title: i18n.t("static.username.username"),
          type: "hidden",
          readOnly: true,
        },
        {
          title: i18n.t("static.role.role"),
          type: "dropdown",
          source: roleList,
        },
        {
          title: i18n.t("static.program.realmcountry"),
          type: "autocomplete",
          source: countryList,
        },
        {
          title: i18n.t("static.dashboard.healthareaheader"),
          type: "autocomplete",
          source: healthAreaList,
        },
        {
          title: i18n.t("static.organisation.organisation"),
          type: "autocomplete",
          source: organisationList,
        },
        {
          title: i18n.t("static.dashboard.programheader"),
          type: "autocomplete",
          source: programList,
          filter: this.filterProgramByCountryId,
        },
      ],
      pagination: localStorage.getItem("sesRecordCount"),
      filters: true,
      search: true,
      columnSorting: true,
      editable: true,
      wordWrap: true,
      paginationOptions: JEXCEL_PAGINATION_OPTION,
      position: "top",
      allowInsertColumn: false,
      allowManualInsertColumn: false,
      allowDeleteRow: true,
      onchange: this.changed,
      oneditionend: this.onedit,
      copyCompatibility: true,
      parseFormulas: true,
      onpaste: this.onPaste,
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
                data[0] = this.state.user.username;
                data[1] = "";
                data[2] = "";
                data[3] = "";
                data[4] = "";
                data[5] = "";
                obj.insertRow(data, parseInt(y), 1);
              }.bind(this),
            });
          }
          if (obj.options.allowInsertRow == true) {
            items.push({
              title: i18n.t("static.common.insertNewRowAfter"),
              onclick: function () {
                var data = [];
                data[0] = this.state.user.username;
                data[1] = "";
                data[2] = "";
                data[3] = "";
                data[4] = "";
                data[5] = "";
                obj.insertRow(data, parseInt(y));
              }.bind(this),
            });
          }
          if (obj.options.allowDeleteRow == true) {
            items.push({
              title: i18n.t("static.common.deleterow"),
              onclick: function () {
                if (obj.getJson(null, false).length == 1) {
                  obj.deleteRow(parseInt(y));
                  var data = [];
                  data[0] = this.state.user.username;
                  data[1] = "";
                  data[2] = "";
                  data[3] = "";
                  data[4] = "";
                  data[5] = "";
                  obj.insertRow(data, parseInt(y));
                } else {
                  obj.deleteRow(parseInt(y));
                }
              }.bind(this),
            });
          }
          if (x) {
          }
        }
        items.push({ type: "line" });
        return items;
      }.bind(this),
    };
    this.el = jexcel(document.getElementById("paputableDiv"), options);
    varEL = this.el;
    this.setState({
      addUserEL: varEL,
      loading: false,
      loading1: false,
    });
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
    tr.children[3].classList.add("AsteriskTheadtrTd");
    tr.children[4].classList.add("AsteriskTheadtrTd");
    tr.children[5].classList.add("AsteriskTheadtrTd");
    tr.children[6].classList.add("AsteriskTheadtrTd");
  };
  /**
   * This function is called when user clicks on add row in access control table to add the access control
   */
  addRow() {
    var data = [];
    data[0] = this.state.user.username;
    data[1] = "";
    data[2] = "";
    data[3] = "";
    data[4] = "";
    data[5] = "";
    this.el.insertRow(data, 0, 1);
  }
  /**
   * This function is called when user pastes some data into the sheet
   * @param {*} instance This is the sheet where the data is being placed
   * @param {*} data This is the data that is being pasted
   */
  onPaste(instance, data) {
    var z = -1;
    for (var i = 0; i < data.length; i++) {
      if (z != data[i].y) {
        instance.setValueFromCoords(
          0,
          data[i].y,
          this.state.user.username,
          true
        );
        z = data[i].y;
      }
    }
  }
  /**
   * This function is called before saving the user access control to check validations for all the rows that are available in the table
   * @returns This functions return true or false. It returns true if all the data is sucessfully validated. It returns false if some validation fails.
   */
  checkValidation() {
    var valid = true;
    var json = this.el.getJson(null, false);
    for (var y = 0; y < json.length; y++) {
      var col = "C".concat(parseInt(y) + 1);
      var value = this.el.getValueFromCoords(2, y);
      if (value == "") {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setStyle(col, "background-color", "yellow");
        this.el.setComments(col, i18n.t("static.label.fieldRequired"));
        valid = false;
      } else {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setComments(col, "");
      }
      var col = "D".concat(parseInt(y) + 1);
      var value = this.el.getValueFromCoords(3, y);
      if (value == "") {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setStyle(col, "background-color", "yellow");
        this.el.setComments(col, i18n.t("static.label.fieldRequired"));
        valid = false;
      } else {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setComments(col, "");
      }
      var col = "E".concat(parseInt(y) + 1);
      var value = this.el.getValueFromCoords(4, y);
      if (value == "") {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setStyle(col, "background-color", "yellow");
        this.el.setComments(col, i18n.t("static.label.fieldRequired"));
        valid = false;
      } else {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setComments(col, "");
      }
      var col = "F".concat(parseInt(y) + 1);
      var value = this.el.getValueFromCoords(5, y);
      if (value == "") {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setStyle(col, "background-color", "yellow");
        this.el.setComments(col, i18n.t("static.label.fieldRequired"));
        valid = false;
      } else {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setComments(col, "");
      }
    }
    return valid;
  }
  /**
   * This function is used to get the user details
   */
  componentDidMount() {
    // document.getElementById("roleValid").value = false;
    UserService.getUserByUserId(this.props.match.params.userId)
      .then((response) => {
        if (response.status == 200) {
          this.setState(
            {
              user: response.data,
              rows: response.data.userAclList,
              loading: false,
            },
            () => {
              this.getAccessControlData();
            }
          );
        } else {
          this.setState(
            {
              message: response.data.messageCode,
              loading: false,
            },
            () => {
              this.hideSecondComponent();
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
    LanguageService.getLanguageListActive()
      .then((response) => {
        if (response.status == 200) {
          var listArray = response.data;
          listArray.sort((a, b) => {
            var itemLabelA = a.label.label_en.toUpperCase();
            var itemLabelB = b.label.label_en.toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({
            languages: listArray,
            loading: false,
          });
        } else {
          this.setState(
            {
              message: response.data.messageCode,
              loading: false,
            },
            () => {
              this.hideSecondComponent();
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
    RealmService.getRealmListAll()
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
            realms: listArray,
            loading: false,
          });
        } else {
          this.setState(
            {
              message: response.data.messageCode,
              loading: false,
            },
            () => {
              this.hideSecondComponent();
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
    UserService.getRoleList()
      .then((response) => {
        if (response.status == 200) {
          var roleList = [];
          for (var i = 0; i < response.data.length; i++) {
            roleList[i + 1] = {
              value: response.data[i].roleId,
              label: getLabelText(response.data[i].label, this.state.lang),
            };
          }
          this.setState({
            selRoleList: roleList,
            loading: false,
          });
        } else {
          this.setState(
            {
              message: response.data.messageCode,
              loading: false,
            },
            () => {
              this.hideSecondComponent();
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
   * This is used to display the content
   * @returns This returns user details form and show access control data in tabular format
   */
  render() {
    jexcel.setDictionary({
      Show: " ",
      entries: " ",
    });
    const { languages } = this.state;
    let languageList =
      languages.length > 0 &&
      languages.map((item, i) => {
        return (
          <option key={i} value={item.languageId}>
            {item.label.label_en}
          </option>
        );
      }, this);
    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} />
        <h5 className="red" id="div2">
          {i18n.t(this.state.message, { entityname })}
        </h5>
        <Row>
          <Col sm={12} md={6} style={{ flexBasis: "auto" }}>
            <Card>
              <Formik
                enableReinitialize={true}
                initialValues={{
                  username: this.state.user.username,
                  realmId: this.state.user.realm.realmId,
                  emailId: this.state.user.emailId,
                  orgAndCountry: this.state.user.orgAndCountry,
                  roles: this.state.user.roleList,
                  languageId: this.state.user.language.languageId,
                  // roleId: this.state.user.roleList,
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  let isValid = this.checkValidation();
                  if (isValid) {
                    let user = this.state.user;
                    user.emailId = user.emailId.replace(
                      /[\u200B-\u200D\u2060\uFEFF]/g,
                      ""
                    );
                    var tableJson = this.el.getJson(null, false);
                    let userAcls = [];
                    for (var i = 0; i < tableJson.length; i++) {
                      var map1 = new Map(Object.entries(tableJson[i]));
                      let json = {
                        userId: "",
                        realmCountryId: parseInt(map1.get("1")),
                        countryName: {
                          createdBy: null,
                          createdDate: null,
                          lastModifiedBy: null,
                          lastModifiedDate: null,
                          active: true,
                          labelId: 0,
                          label_en: null,
                          label_sp: null,
                          label_fr: null,
                          label_pr: null,
                        },
                        healthAreaId: parseInt(map1.get("2")),
                        healthAreaName: {
                          createdBy: null,
                          createdDate: null,
                          lastModifiedBy: null,
                          lastModifiedDate: null,
                          active: true,
                          labelId: 0,
                          label_en: null,
                          label_sp: null,
                          label_fr: null,
                          label_pr: null,
                        },
                        organisationId: parseInt(map1.get("3")),
                        organisationName: {
                          createdBy: null,
                          createdDate: null,
                          lastModifiedBy: null,
                          lastModifiedDate: null,
                          active: true,
                          labelId: 0,
                          label_en: null,
                          label_sp: null,
                          label_fr: null,
                          label_pr: null,
                        },
                        programId: parseInt(map1.get("4")),
                        programName: {
                          createdBy: null,
                          createdDate: null,
                          lastModifiedBy: null,
                          lastModifiedDate: null,
                          active: true,
                          labelId: 0,
                          label_en: null,
                          label_sp: null,
                          label_fr: null,
                          label_pr: null,
                        },
                        lastModifiedDate: "2020-12-02 12:10:15",
                      };
                      userAcls.push(json);
                    }
                    user.userAcls = userAcls;
                    this.setState({
                      message: "",
                      loading: true,
                    });
                    UserService.editUser(user)
                      .then((response) => {
                        if (response.status == 200) {
                          this.props.history.push(
                            `/user/listUser/` +
                            "green/" +
                            i18n.t(response.data.messageCode, { entityname })
                          );
                        } else {
                          this.setState(
                            {
                              message: response.data.messageCode,
                              loading: false,
                            },
                            () => {
                              this.hideSecondComponent();
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
                                message: i18n.t(
                                  "static.accesscontrol.duplicateAccessControl"
                                ),
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
                  } else {
                    this.setState({
                      message: "validation fail",
                      loading: false,
                    });
                  }
                }}
                render={({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting,
                  isValid,
                  setTouched,
                  setFieldValue,
                  setFieldTouched,
                }) => (
                  <Form
                    onSubmit={handleSubmit}
                    noValidate
                    name="userForm"
                    autocomplete="off"
                  >
                    <CardBody
                      className="pt-2 pb-0"
                      style={{ display: this.state.loading ? "none" : "block" }}
                    >
                      <Input type="hidden" name="roleValid" id="roleValid" />
                      <FormGroup>
                        <Label htmlFor="realmId">
                          {i18n.t("static.realm.realm")}
                          <span class="red Reqasterisk">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="realmId"
                          id="realmId"
                          bsSize="sm"
                          readOnly={true}
                          value={this.state.user.realm.label.label_en}
                        ></Input>
                      </FormGroup>
                      <FormGroup>
                        <Label for="username">
                          {i18n.t("static.user.username")}
                          <span class="red Reqasterisk">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="username"
                          id="username"
                          bsSize="sm"
                          valid={!errors.username}
                          invalid={
                            (touched.username && !!errors.username) ||
                            !!errors.username
                          }
                          onChange={(e) => {
                            handleChange(e);
                            this.dataChange(e);
                          }}
                          onBlur={handleBlur}
                          maxLength={50}
                          required
                          value={this.state.user.username}
                        />{" "}
                        <FormFeedback className="red">
                          {errors.username}
                        </FormFeedback>
                      </FormGroup>
                      <FormGroup>
                        <Label for="emailId">
                          {i18n.t("static.user.emailid")}
                          <span class="red Reqasterisk">*</span>
                        </Label>
                        <Input
                          type="search"
                          name="emailId"
                          id="emailId"
                          bsSize="sm"
                          valid={!errors.emailId}
                          invalid={
                            (touched.emailId && !!errors.emailId) ||
                            !!errors.emailId
                          }
                          onChange={(e) => {
                            handleChange(e);
                            this.dataChange(e);
                          }}
                          onBlur={handleBlur}
                          maxLength={50}
                          required
                          value={this.state.user.emailId}
                        />
                        <FormFeedback className="red">
                          {errors.emailId}
                        </FormFeedback>
                      </FormGroup>
                      <FormGroup>
                        <Label for="orgAndCountry">
                          {i18n.t("static.user.orgAndCountry")}
                          <span class="red Reqasterisk">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="orgAndCountry"
                          id="orgAndCountry"
                          bsSize="sm"
                          valid={!errors.orgAndCountry}
                          invalid={
                            (touched.orgAndCountry && !!errors.orgAndCountry) ||
                            !!errors.orgAndCountry
                          }
                          onChange={(e) => {
                            handleChange(e);
                            this.dataChange(e);
                          }}
                          onBlur={handleBlur}
                          maxLength={100}
                          required
                          value={this.state.user.orgAndCountry}
                        />{" "}
                        <FormFeedback className="red">
                          {errors.orgAndCountry}
                        </FormFeedback>
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="languageId">
                          {i18n.t("static.language.language")}
                          <span class="red Reqasterisk">*</span>
                        </Label>
                        <Input
                          type="select"
                          name="languageId"
                          id="languageId"
                          bsSize="sm"
                          valid={!errors.languageId}
                          invalid={
                            (touched.languageId && !!errors.languageId) ||
                            !!errors.languageId
                          }
                          onChange={(e) => {
                            handleChange(e);
                            this.dataChange(e);
                          }}
                          onBlur={handleBlur}
                          required
                          value={this.state.user.language.languageId}
                        >
                          <option value="">
                            {i18n.t("static.common.select")}
                          </option>
                          {languageList}
                        </Input>{" "}
                        <FormFeedback className="red">
                          {errors.languageId}
                        </FormFeedback>
                      </FormGroup>
                      <FormGroup>
                        <Label className="P-absltRadio">
                          {i18n.t("static.common.status")}
                        </Label>
                        <FormGroup check inline>
                          <Input
                            className="form-check-input"
                            type="radio"
                            id="active1"
                            name="active"
                            value={true}
                            checked={this.state.user.active === true}
                            onChange={(e) => {
                              handleChange(e);
                              this.dataChange(e);
                            }}
                          />
                          <Label
                            className="form-check-label"
                            check
                            htmlFor="inline-radio1"
                          >
                            {i18n.t("static.common.active")}
                          </Label>
                        </FormGroup>
                        <FormGroup check inline>
                          <Input
                            className="form-check-input"
                            type="radio"
                            id="active2"
                            name="active"
                            value={false}
                            checked={this.state.user.active === false}
                            onChange={(e) => {
                              handleChange(e);
                              this.dataChange(e);
                            }}
                          />
                          <Label
                            className="form-check-label"
                            check
                            htmlFor="inline-radio2"
                          >
                            {i18n.t("static.dataentry.inactive")}
                          </Label>
                        </FormGroup>
                      </FormGroup>
                      <FormGroup>
                        <h5>
                          <Label htmlFor="select">{"Access control"}</Label>
                        </h5>
                      </FormGroup>
                      <div
                        className=""
                        style={{
                          display: this.state.loading1 ? "none" : "block",
                        }}
                      >
                        <div
                          id="paputableDiv"
                          className="RowheightForjexceladdRow consumptionDataEntryTable"
                        ></div>
                      </div>
                      <div
                        style={{
                          display: this.state.loading1 ? "block" : "none",
                        }}
                      >
                        <div
                          className="d-flex align-items-center justify-content-center"
                          style={{ height: "500px" }}
                        >
                          <div class="align-items-center">
                            <div>
                              <h4>
                                {" "}
                                <strong>
                                  {i18n.t("static.common.loading")}
                                </strong>
                              </h4>
                            </div>
                            <div
                              class="spinner-border blue ml-4"
                              role="status"
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                    <CardFooter
                      style={{ display: this.state.loading ? "none" : "block" }}
                    >
                      <FormGroup>
                        <Button
                          color="info"
                          size="md"
                          className="float-right mr-1"
                          type="button"
                          onClick={() => this.addRow()}
                        >
                          {" "}
                          <i className="fa fa-plus"></i>
                          {i18n.t("static.common.addRow")}
                        </Button>
                        &nbsp;
                      </FormGroup>
                    </CardFooter>
                    <CardFooter
                      style={{ display: this.state.loading ? "none" : "block" }}
                    >
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
                          type="button"
                          size="md"
                          color="warning"
                          className="float-right mr-1 text-white"
                          onClick={this.resetClicked}
                        >
                          <i className="fa fa-refresh"></i>{" "}
                          {i18n.t("static.common.reset")}
                        </Button>
                        <Button
                          type="submit"
                          size="md"
                          color="success"
                          className="float-right mr-1"
                        >
                          <i className="fa fa-check"></i>
                          {i18n.t("static.common.update")}
                        </Button>
                        &nbsp;
                      </FormGroup>
                    </CardFooter>
                    <Row
                      style={{ display: this.state.loading ? "block" : "none" }}
                    >
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
                          <div
                            class="spinner-border blue ml-4"
                            role="status"
                          ></div>
                        </div>
                      </div>
                    </Row>
                  </Form>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
  /**
   * This function is called when cancel button is clicked and is redirected to list user screen
   */
  cancelClicked() {
    this.props.history.push(
      `/user/listUser/` +
      "red/" +
      i18n.t("static.message.cancelled", { entityname })
    );
  }
  /**
   * This function is called when reset button is clicked to reset the user details
   */
  resetClicked() {
    UserService.getUserByUserId(this.props.match.params.userId)
      .then((response) => {
        this.setState(
          {
            user: response.data,
            rows: response.data.userAclList,
          },
          () => {
            this.getAccessControlData();
          }
        );
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
}
export default EditUserComponent;
