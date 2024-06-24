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
let initialValues = {
  username: "",
  realmId: [],
  emailId: "",
  orgAndCountry: "",
  languageId: [],
  roleId: [],
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
    showRealm: Yup.boolean(),
    realmId: Yup.string().when("showRealm", {
      is: (val) => {
        return document.getElementById("showRealm").value === "true";
      },
      then: Yup.string().required(i18n.t("static.common.realmtext")),
      otherwise: Yup.string().notRequired(),
    }),
    roleId: Yup.string()
      .test(
        "roleValid",
        i18n.t("static.common.roleinvalidtext"),
        function (value) {
          if (document.getElementById("roleValid").value == "false") {
            return true;
          }
        }
      )
      .required(i18n.t("static.user.validrole")),
    languageId: Yup.string().required(i18n.t("static.user.validlanguage")),
    emailId: Yup.string()
      .email(i18n.t("static.user.invalidemail"))
      .required(i18n.t("static.user.validemail")),
    orgAndCountry: Yup.string()
      .matches(
        SPECIAL_CHARECTER_WITH_NUM_NODOUBLESPACE,
        i18n.t("static.validNoDoubleSpace.string")
      )
      .required(i18n.t("static.user.org&CountryText")),
  });
};
/**
 * This component is used to display the user details in a form and allow user to add the user
 */
class AddUserComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRealmValidation: false,
      appAdminRole: false,
      lang: localStorage.getItem("lang"),
      realms: [],
      languages: [],
      user: {
        realm: {
          realmId: "",
        },
        language: {
          languageId: "",
        },
        roles: [],
        username: "",
        emailId: "",
        orgAndCountry: "",
      },
      loading: true,
      roleId: "",
      roleList: [],
      message: "",
      validateRealm: "",
      isValid: false,
      loading1: true,
      programListForFilter: [],
      addUserEL: "",
    };
    this.cancelClicked = this.cancelClicked.bind(this);
    this.resetClicked = this.resetClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
    this.roleChange = this.roleChange.bind(this);
    this.realmChange = this.realmChange.bind(this);
    this.hideSecondComponent = this.hideSecondComponent.bind(this);
    this.getAccessControlData = this.getAccessControlData.bind(this);
    this.addRow = this.addRow.bind(this);
    this.buildJexcel = this.buildJexcel.bind(this);
    this.onPaste = this.onPaste.bind(this);
    this.filterOrganisation = this.filterOrganisation.bind(this);
    this.filterHealthArea = this.filterHealthArea.bind(this);
    this.filterProgram = this.filterProgram.bind(this);
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
   * This function is called when realm dropdown is changed
   */
  realmChange() {
    let count = 0;
    let count1 = 0;
    for (var i = 0; i < this.state.user.roles.length; i++) {
      if (this.state.user.roles[i] != "ROLE_APPLICATION_ADMIN") {
        count++;
      } else {
        count1++;
      }
    }
    if (count > 0) {
      this.setState(
        {
          showRealmValidation:
            this.state.user.realm.realmId != "" ? false : true,
        },
        () => {}
      );
      document.getElementById("showRealm").value = true;
    } else {
      this.setState(
        {
          showRealmValidation: false,
        },
        () => {}
      );
      document.getElementById("showRealm").value = false;
    }
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
    if (event.target.name == "realmId") {
      user.realm.realmId = event.target.value;
    }
    if (event.target.name == "languageId") {
      user.language.languageId = event.target.value;
    }
    this.setState(
      {
        user,
      },
      () => {}
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
      this.setState(
        {
          showRealmValidation:
            this.state.user.realm.realmId != "" ? false : true,
        },
        () => {}
      );
      document.getElementById("showRealm").value = true;
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
      this.setState(
        {
          showRealmValidation: false,
          appAdminRole: false,
        },
        () => {
        }
      );
      document.getElementById("showRealm").value = false;
      document.getElementById("roleValid").value = false;
    }
    user.roles = roleIdArray;
    this.setState(
      {
        user,
        validateRealm: count > 0 ? true : false,
      },
      () => {}
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
                            },()=>{
                              this.hideSecondComponent();
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
                                },()=>{
                                  this.hideSecondComponent();
                                });
                                break;
                              case 412:
                                this.setState({
                                  message: error.response.data.messageCode,
                                  loading: false,
                                },()=>{
                                  this.hideSecondComponent();
                                });
                                break;
                              default:
                                this.setState({
                                  message: "static.unkownError",
                                  loading: false,
                                },()=>{
                                  this.hideSecondComponent();
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
                      },()=>{
                        this.hideSecondComponent();
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
                          },()=>{
                            this.hideSecondComponent();
                          });
                          break;
                        case 412:
                          this.setState({
                            message: error.response.data.messageCode,
                            loading: false,
                          },()=>{
                            this.hideSecondComponent();
                          });
                          break;
                        default:
                          this.setState({
                            message: "static.unkownError",
                            loading: false,
                          },()=>{
                            this.hideSecondComponent();
                          });
                          break;
                      }
                    }
                  });
              } else {
                this.setState({
                  message: response.data.message,
                },()=>{
                  this.hideSecondComponent();
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
                },()=>{
                  this.hideSecondComponent();
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
                    },()=>{
                      this.hideSecondComponent();
                    });
                    break;
                  case 412:
                    this.setState({
                      message: error.response.data.messageCode,
                      loading: false,
                    },()=>{
                      this.hideSecondComponent();
                    });
                    break;
                  default:
                    this.setState({
                      message: "static.unkownError",
                      loading: false,
                    },()=>{
                      this.hideSecondComponent();
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
          },()=>{
            this.hideSecondComponent();
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
              },()=>{
                this.hideSecondComponent();
              });
              break;
            case 412:
              this.setState({
                message: error.response.data.messageCode,
                loading: false,
              },()=>{
                this.hideSecondComponent();
              });
              break;
            default:
              this.setState({
                message: "static.unkownError",
                loading: false,
              },()=>{
                this.hideSecondComponent();
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
    if (x == 1) {
      this.el.setValueFromCoords(4, y, "", true);
      var col = "B".concat(parseInt(y) + 1);
      if (value == "") {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setStyle(col, "background-color", "yellow");
        this.el.setComments(col, i18n.t("static.label.fieldRequired"));
      } else {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setComments(col, "");
      }
    }
    if (x == 2) {
      this.el.setValueFromCoords(4, y, "", true);
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
  }.bind(this);
  /**
   * This function is used to filter the program list based on user's selected realm country, health area and organisation
   */
  filterProgramByCountryId = function (instance, cell, c, r, source) {
    var value = this.state.addUserEL.getJson(null, false)[r][1];
    var healthAreavalue = this.state.addUserEL.getJson(null, false)[r][2];
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
    var orgvalue = this.state.addUserEL.getJson(null, false)[r][3];
    if(orgvalue!=-1){
      proList=proList.filter(c=>c.id==-1 || c.organisation.id==orgvalue)
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
    let programList = [];
    let countryList = [];
    let organisationList = [];
    let healthAreaList = [];
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
          organisation:selProgram[i].organisation
        };
        programList[i] = paJson;
      }
      var paJson = {
        name: "All",
        id: -1,
        active: true,
      };
      programList.unshift(paJson);
    }
    this.setState({
      programListForFilter: programList,
    });
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
    var data = [];
    var papuDataArr = [];
    if (papuDataArr.length == 0) {
      data = [];
      data[0] = this.state.user.username;
      data[1] = -1;
      data[2] = -1;
      data[3] = -1;
      data[4] = -1;
      papuDataArr[0] = data;
    }
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
                  obj.insertRow(data, parseInt(y));
                }else{
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
    var varEL = this.el;
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
  loaded = function (instance, cell, x, y, value) {
    jExcelLoadedFunction(instance);
    var asterisk =
      document.getElementsByClassName("jss")[0].firstChild.nextSibling;
    var tr = asterisk.firstChild;
    tr.children[2].classList.add("AsteriskTheadtrTd");
    tr.children[3].classList.add("AsteriskTheadtrTd");
    tr.children[4].classList.add("AsteriskTheadtrTd");
    tr.children[5].classList.add("AsteriskTheadtrTd");
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
   * This function is used to get the active language list
   */
  componentDidMount() {
    LanguageService.getLanguageListActive()
      .then((response) => {
        if (response.status == 200) {
          var listArray = response.data;
          listArray.sort((a, b) => {
            var itemLabelA = a.label.label_en.toUpperCase(); 
            var itemLabelB = b.label.label_en.toUpperCase(); 
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState(
            {
              languages: listArray,
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
          },()=>{
            this.hideSecondComponent();
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
              },()=>{
                this.hideSecondComponent();
              });
              break;
            case 412:
              this.setState({
                message: error.response.data.messageCode,
                loading: false,
              },()=>{
                this.hideSecondComponent();
              });
              break;
            default:
              this.setState({
                message: "static.unkownError",
                loading: false,
              },()=>{
                this.hideSecondComponent();
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
          },()=>{
            this.hideSecondComponent();
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
              },()=>{
                this.hideSecondComponent();
              });
              break;
            case 412:
              this.setState({
                message: error.response.data.messageCode,
                loading: false,
              },()=>{
                this.hideSecondComponent();
              });
              break;
            default:
              this.setState({
                message: "static.unkownError",
                loading: false,
              },()=>{
                this.hideSecondComponent();
              });
              break;
          }
        }
      });
    UserService.getRoleList()
      .then((response) => {
        if (response.status == 200) {
          var roleList = [{ value: "-1", label: i18n.t("static.common.all") }];
          for (var i = 0; i < response.data.length; i++) {
            roleList[i + 1] = {
              value: response.data[i].roleId,
              label: getLabelText(response.data[i].label, this.state.lang),
            };
          }
          var listArray = roleList;
          listArray.sort((a, b) => {
            var itemLabelA = a.label.toUpperCase(); 
            var itemLabelB = b.label.toUpperCase(); 
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({
            roleList: listArray,
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
          },()=>{
            this.hideSecondComponent();
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
              },()=>{
                this.hideSecondComponent();
              });
              break;
            case 412:
              this.setState({
                message: error.response.data.messageCode,
                loading: false,
              },()=>{
                this.hideSecondComponent();
              });
              break;
            default:
              this.setState({
                message: "static.unkownError",
                loading: false,
              },()=>{
                this.hideSecondComponent();
              });
              break;
          }
        }
      });
    let realmId = AuthenticationService.getRealmId();
    if (realmId != -1) {
      initialValues = {
        realmId: realmId,
      };
      let { user } = this.state;
      user.realm.realmId = realmId;
      document.getElementById("realmId").disabled = true;
      this.setState({
        user,
      });
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
      var col = "B".concat(parseInt(y) + 1);
      var value = this.el.getValueFromCoords(1, y);
      if (value == "") {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setStyle(col, "background-color", "yellow");
        this.el.setComments(col, i18n.t("static.label.fieldRequired"));
        valid = false;
      } else {
        this.el.setStyle(col, "background-color", "transparent");
        this.el.setComments(col, "");
      }
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
    }
    return valid;
  }
  /**
   * This is used to display the content
   * @returns This returns user details form and access control table
   */
  render() {
    jexcel.setDictionary({
      Show: " ",
      entries: " ",
    });
    const { realms } = this.state;
    const { languages } = this.state;
    let realmList =
      realms.length > 0 &&
      realms.map((item, i) => {
        return (
          <option key={i} value={item.realmId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        );
      }, this);
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
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  let isValid = this.checkValidation();
                  if (isValid) {
                    let user = this.state.user;
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
                      loading: true,
                    });
                    this.setState({
                      message: "",
                    },()=>{
                      this.hideSecondComponent();
                    });
                    UserService.addNewUser(user)
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
                          },()=>{
                            this.hideSecondComponent();
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
                              },()=>{
                                this.hideSecondComponent();
                              });
                              break;
                            case 412:
                              this.setState({
                                message: error.response.data.messageCode,
                                loading: false,
                              },()=>{
                                this.hideSecondComponent();
                              });
                              break;
                            default:
                              this.setState({
                                message: "static.unkownError",
                                loading: false,
                              },()=>{
                                this.hideSecondComponent();
                              });
                              break;
                          }
                        }
                      });
                  } else {
                    this.setState({
                      message: "validation fail",
                      loading: false,
                    },()=>{
                      this.hideSecondComponent();
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
                  handleReset,
                  setFieldValue,
                  setFieldTouched,
                }) => (
                  <Form
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    noValidate
                    name="userForm"
                    autocomplete="off"
                  >
                    <CardBody
                      className="pt-2 pb-0"
                      style={{ display: this.state.loading ? "none" : "block" }}
                    >
                      <Input type="hidden" name="showRealm" id="showRealm" />
                      <Input type="hidden" name="roleValid" id="roleValid" />
                      <FormGroup>
                        <Label htmlFor="realmId">
                          {i18n.t("static.realm.realm")}
                          <span class="red Reqasterisk">*</span>
                        </Label>
                        <Input
                          type="select"
                          name="realmId"
                          id="realmId"
                          bsSize="sm"
                          valid={
                            !errors.realmId &&
                            this.state.user.realm.realmId != "" &&
                            this.state.showRealmValidation === false
                          }
                          invalid={
                            (touched.realmId && !!errors.realmId) ||
                            this.state.showRealmValidation === true
                          }
                          onChange={(e) => {
                            handleChange(e);
                            this.dataChange(e);
                            this.realmChange(e);
                          }}
                          onBlur={handleBlur}
                          required
                          value={this.state.user.realm.realmId}
                        >
                          <option value="">
                            {i18n.t("static.common.select")}
                          </option>
                          {realmList}
                        </Input>
                        <FormFeedback className="red">
                          {errors.realmId}
                        </FormFeedback>
                      </FormGroup>
                      <FormGroup>
                        <Label for="username">
                          {i18n.t("static.user.username")}
                          <span class="red Reqasterisk">*</span>
                        </Label>
                        <Input
                          type="text"
                          autocomplete="off"
                          name="username"
                          id="username"
                          bsSize="sm"
                          valid={
                            !errors.username && this.state.user.username != ""
                          }
                          invalid={touched.username && !!errors.username}
                          onChange={(e) => {
                            handleChange(e);
                            this.dataChange(e);
                          }}
                          onBlur={handleBlur}
                          maxLength={50}
                          required
                          value={this.state.user.username}
                        />
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
                          valid={
                            !errors.emailId && this.state.user.emailId != ""
                          }
                          invalid={touched.emailId && !!errors.emailId}
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
                          autocomplete="off"
                          name="orgAndCountry"
                          id="orgAndCountry"
                          bsSize="sm"
                          valid={
                            !errors.orgAndCountry &&
                            this.state.user.orgAndCountry != ""
                          }
                          invalid={
                            touched.orgAndCountry && !!errors.orgAndCountry
                          }
                          onChange={(e) => {
                            handleChange(e);
                            this.dataChange(e);
                          }}
                          onBlur={handleBlur}
                          maxLength={100}
                          required
                          value={this.state.user.orgAndCountry}
                        />
                        <FormFeedback className="red">
                          {errors.orgAndCountry}
                        </FormFeedback>
                      </FormGroup>
                      <FormGroup className="Selectcontrol-bdrNone">
                        <Label htmlFor="roleId">
                          {i18n.t("static.role.role")}
                          <span class="red Reqasterisk">*</span>
                        </Label>
                        <Select
                          className={classNames(
                            "form-control",
                            "d-block",
                            "w-100",
                            "bg-light",
                            {
                              "is-valid":
                                !errors.roleId &&
                                this.state.user.roles.length != 0,
                            },
                            {
                              "is-invalid":
                                (touched.roleId && !!errors.roleId) ||
                                this.state.appAdminRole,
                            }
                          )}
                          bsSize="sm"
                          onChange={(e) => {
                            handleChange(e);
                            setFieldValue("roleId", e);
                            this.roleChange(e);
                          }}
                          onBlur={() => setFieldTouched("roleId", true)}
                          name="roleId"
                          id="roleId"
                          multi
                          required
                          min={1}
                          options={this.state.roleList}
                          value={this.state.roleId}
                          placeholder={i18n.t('static.common.select')}
                        />
                        <FormFeedback className="red">
                          {errors.roleId}
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
                          valid={
                            !errors.languageId &&
                            this.state.user.language.languageId != ""
                          }
                          invalid={touched.languageId && !!errors.languageId}
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
                        </Input>
                        <FormFeedback>{errors.languageId}</FormFeedback>
                      </FormGroup>
                      <FormGroup>
                        <h5>
                          <Label htmlFor="select">
                            {i18n.t("static.user.accessControlText")}
                          </Label>
                        </h5>
                      </FormGroup>
                      <div
                        className=""
                        style={{
                          display: this.state.loading1 ? "none" : "block",
                        }}
                      >
                        <div
                          style={{ width: "100%" }}
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
                    <CardFooter>
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
                    <CardFooter>
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
                          type="reset"
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
                          disabled={!isValid}
                        >
                          <i className="fa fa-check"></i>
                          {i18n.t("static.common.submit")}
                        </Button>
                        &nbsp;
                      </FormGroup>
                    </CardFooter>
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
    let { user } = this.state;
    user.username = "";
    if (
      AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes(
        "ROLE_BF_SHOW_REALM_COLUMN"
      )
    ) {
      user.realm.realmId = "";
    }
    user.emailId = "";
    user.orgAndCountry = "";
    user.language.languageId = "";
    this.state.roleId = "";
    this.setState(
      {
        user,
      },
      () => {
        this.getAccessControlData();
      }
    );
  }
}
export default AddUserComponent;
