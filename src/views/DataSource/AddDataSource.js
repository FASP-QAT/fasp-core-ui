import { Formik } from "formik";
import React, { Component } from "react";
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
import getLabelText from "../../CommonComponent/getLabelText";
import {
  API_URL,
  PROGRAM_TYPE_SUPPLY_PLAN
} from "../../Constants.js";
import DataSourceService from "../../api/DataSourceService";
import DataSourceTypeService from "../../api/DataSourceTypeService";
import DropdownService from "../../api/DropdownService";
import RealmService from "../../api/RealmService";
import i18n from "../../i18n";
import AuthenticationService from "../Common/AuthenticationService.js";
import AuthenticationServiceComponent from "../Common/AuthenticationServiceComponent";
import { Capitalize, hideSecondComponent } from "../../CommonComponent/JavascriptCommonFunctions";
// Initial values for form fields
let initialValues = {
  realmId: [],
  label: "",
  dataSourceTypeId: "",
  dataSourceTypeList: [],
};
// Localized entity name
const entityname = i18n.t("static.datasource.datasource");
/**
 * Defines the validation schema for role details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
  return Yup.object().shape({
    realmId: Yup.string().required(i18n.t("static.common.realmtext")),
    label: Yup.string()
      .matches(/^\S+(?: \S+)*$/, i18n.t("static.validSpace.string"))
      .required(i18n.t("static.datasource.datasourcetext")),
    dataSourceTypeId: Yup.string().required(
      i18n.t("static.datasource.datasourcetypetext")
    ),
  });
};
/**
 * Component for adding data source details.
 */
export default class AddDataSource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realms: [],
      message: "",
      realm: {
        id: "",
      },
      label: {
        label_en: "",
      },
      dataSourceType: {
        id: "",
      },
      program: {
        id: "",
        label: {
          label_en: "",
          label_sp: "",
          label_pr: "",
          label_fr: "",
        },
      },
      dataSourceTypeList: [],
      dataSourceTypeId: "",
      programs: [],
      programId: "",
      loading: true,
    };
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
    this.resetClicked = this.resetClicked.bind(this);
    this.getDataSourceTypeByRealmId =
      this.getDataSourceTypeByRealmId.bind(this);
    this.getProgramByRealmId = this.getProgramByRealmId.bind(this);
  }
  /**
   * Handles data change in the form.
   * @param {Event} event - The change event.
   */
  dataChange(event) {
    if (event.target.name === "label") {
      this.state.label.label_en = event.target.value;
    } else if (event.target.name === "dataSourceTypeId") {
      this.state.dataSourceType.id = event.target.value;
    }
    if (event.target.name === "realmId") {
      this.state.realm.id = event.target.value;
    }
    if (event.target.name === "programId") {
      this.state.program.id = event.target.value;
    }
    let { dataSource } = this.state;
    this.setState({
      dataSource,
    });
  }
  /**
   * Reterives realm list on component mount
   */
  componentDidMount() {
    RealmService.getRealmListAll()
      .then((response) => {
        var listArray = response.data;
        listArray.sort((a, b) => {
          var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
          var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
          return itemLabelA > itemLabelB ? 1 : -1;
        });
        this.setState({
          realms: listArray,
          loading: false,
        });
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
    let realmId = AuthenticationService.getRealmId();
    if (realmId != -1) {
      initialValues = {
        realmId: realmId,
      };
      this.state.realm.id = realmId;
      let { dataSource } = this.state;
      document.getElementById("realmId").disabled = true;
      this.setState(
        {
          dataSource,
        },
        () => {
          this.getDataSourceTypeByRealmId();
          this.getProgramByRealmId();
        }
      );
    }
  }
  /**
   * Retrieves the data source types associated with a specific realm ID.
   * @param {Event} e - The event triggering the function call.
   * @returns {void}
   */
  getDataSourceTypeByRealmId(e) {
    if (this.state.realm.id != 0) {
      DataSourceTypeService.getDataSourceTypeByRealmId(this.state.realm.id)
        .then((response) => {
          var listArray = response.data.filter(c => c.active == true);
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
            dataSourceTypeList: listArray,
            loading: false,
          });
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
    } else {
      this.setState({
        dataSourceTypeList: [],
        loading: false,
      });
    }
  }
  /**
   * Retrieves the programs associated with a specific realm ID.
   * @param {Event} e - The event triggering the function call.
   */
  getProgramByRealmId(e) {
    let realmId = AuthenticationService.getRealmId();
    if (realmId != 0) {
      DropdownService.getSPProgramBasedOnRealmId(realmId)
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
          proList.sort((a, b) => {
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
            programs: proList,
            loading: false,
          });
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
    } else {
      this.setState({
        programs: [],
        loading: false,
      });
    }
  }
  /**
   * Renders the data source details form.
   * @returns {JSX.Element} - Data source details form.
   */
  render() {
    const { realms } = this.state;
    const { programs } = this.state;
    let programList =
      programs.length > 0 &&
      programs.map((item, i) => {
        return (
          <option key={i} value={item.programId}>
            {item.programCode}
          </option>
        );
      }, this);
    let realmList =
      realms.length > 0 &&
      realms.map((item, i) => {
        return (
          <option key={i} value={item.realmId}>
            {item.label.label_en}
          </option>
        );
      }, this);
    const { dataSourceTypeList } = this.state;
    let dataSourceTypes =
      dataSourceTypeList.length > 0 &&
      dataSourceTypeList.map((item, i) => {
        return (
          <option key={i} value={item.dataSourceTypeId}>
            {item.label.label_en}
          </option>
        );
      }, this);
    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent
          history={this.props.history}
        />
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
                  this.setState({
                    loading: true,
                  });
                  DataSourceService.addDataSource(this.state)
                    .then((response) => {
                      if (response.status == 200) {
                        this.props.history.push(
                          `/dataSource/listDataSource/` +
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
                }) => (
                  <Form
                    onSubmit={handleSubmit}
                    onReset={handleReset}
                    noValidate
                    name="dataSourceForm"
                    autocomplete="off"
                  >
                    <CardBody
                      style={{ display: this.state.loading ? "none" : "block" }}
                    >
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
                          valid={!errors.realmId && this.state.realm.id != ""}
                          invalid={touched.realmId && !!errors.realmId}
                          onChange={(e) => {
                            handleChange(e);
                            this.dataChange(e);
                            this.getDataSourceTypeByRealmId(e);
                            this.getProgramByRealmId(e);
                          }}
                          onBlur={handleBlur}
                          required
                          value={this.state.realm.id}
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
                        <Label htmlFor="programId">
                          {i18n.t("static.dataSource.program")}
                        </Label>
                        <Input
                          type="select"
                          name="programId"
                          id="programId"
                          bsSize="sm"
                          valid={
                            !errors.programId && this.state.program.id != ""
                          }
                          invalid={touched.programId && !!errors.programId}
                          onChange={(e) => {
                            handleChange(e);
                            this.dataChange(e);
                          }}
                          onBlur={handleBlur}
                          required
                          value={this.state.program.id}
                        >
                          <option value="">
                            {i18n.t("static.common.select")}
                          </option>
                          {programList}
                        </Input>
                        <FormFeedback className="red">
                          {errors.realmId}
                        </FormFeedback>
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="dataSourceTypeId">
                          {i18n.t("static.datasource.datasourcetype")}
                          <span class="red Reqasterisk">*</span>
                        </Label>
                        <Input
                          type="select"
                          name="dataSourceTypeId"
                          id="dataSourceTypeId"
                          bsSize="sm"
                          valid={
                            !errors.dataSourceTypeId &&
                            this.state.dataSourceType.id != ""
                          }
                          invalid={
                            touched.dataSourceTypeId &&
                            !!errors.dataSourceTypeId
                          }
                          onChange={(e) => {
                            handleChange(e);
                            this.dataChange(e);
                          }}
                          onBlur={handleBlur}
                          value={this.state.dataSourceType.id}
                          required
                        >
                          <option value="">
                            {i18n.t("static.common.select")}
                          </option>
                          {dataSourceTypes}
                        </Input>
                        <FormFeedback className="red">
                          {errors.dataSourceTypeId}
                        </FormFeedback>
                      </FormGroup>
                      <FormGroup>
                        <Label for="label">
                          {i18n.t("static.datasource.datasource")}
                          <span class="red Reqasterisk">*</span>
                        </Label>
                        <Input
                          type="text"
                          name="label"
                          id="label"
                          bsSize="sm"
                          valid={
                            !errors.label && this.state.label.label_en != ""
                          }
                          invalid={touched.label && !!errors.label}
                          onChange={(e) => {
                            handleChange(e);
                            this.dataChange(e);
                            Capitalize(e.target.value);
                          }}
                          onBlur={handleBlur}
                          value={this.state.label.label_en}
                          required
                        />
                        <FormFeedback className="red">
                          {errors.label}
                        </FormFeedback>
                      </FormGroup>
                    </CardBody>
                    <div
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
                    </div>
                    <CardFooter>
                      <FormGroup>
                        <Button
                          type="button"
                          color="danger"
                          className="mr-1 float-right"
                          size="md"
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
                          color="success"
                          className="mr-1 float-right"
                          size="md"
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
   * Redirects to the list data source screen when cancel button is clicked.
   */
  cancelClicked() {
    this.props.history.push(
      `/dataSource/listDataSource/` +
      "red/" +
      i18n.t("static.message.cancelled", { entityname })
    );
  }
  /**
   * Resets the data source details when reset button is clicked.
   */
  resetClicked() {
    this.state.label.label_en = "";
    this.state.dataSourceType.id = "";
    if (
      AuthenticationService.checkUserACL([this.state.program.id],
        "ROLE_BF_SHOW_REALM_COLUMN"
      )
    ) {
      this.state.realm.id = "";
    }
    this.state.program.id = "";
    let { dataSource } = this.state;
    this.setState({
      dataSource,
    });
  }
}
