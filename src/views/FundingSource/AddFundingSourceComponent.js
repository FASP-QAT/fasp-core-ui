import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL, SPECIAL_CHARECTER_WITH_NUM } from '../../Constants.js';
import FundingSourceService from "../../api/FundingSourceService";
import RealmService from "../../api/RealmService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Initial values for form fields
let initialValues = {
  fundingSourceId: [],
  subFundingSource: "",
  fundingSourceCode: "",
}
// Localized entity name
const entityname = i18n.t('static.fundingsource.fundingsource');
/**
 * Defines the validation schema for funding source details.
 * @param {*} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
  return Yup.object().shape({
    realmId: Yup.string()
      .required(i18n.t('static.common.realmtext')),
    fundingSource: Yup.string()
      .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
      .required(i18n.t('static.fundingsource.fundingsourcetext')),
    fundingSourceCode: Yup.string()
      .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
      .required(i18n.t('static.fundingsource.fundingsourceCodeText')),
  })
}
/**
 * Component for adding funding source details.
 */
class AddFundingSourceComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realms: [],
      fundingSource: {
        realm: {
          id: ''
        },
        label: {
          label_en: ''
        },
        fundingSourceCode: '',
        allowedInBudget: true
      },
      message: '',
      lang: localStorage.getItem('lang'),
      loading: true,
    }
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
    this.Capitalize = this.Capitalize.bind(this);
    this.resetClicked = this.resetClicked.bind(this);
    this.hideSecondComponent = this.hideSecondComponent.bind(this);
    this.getDisplayName = this.getDisplayName.bind(this);
  }
  /**
   * Fetch funding source display name on blur event of funding source field
   */
  getDisplayName() {
    let realmId = document.getElementById("realmId").value;
    let fundingSourceValue = document.getElementById("fundingSource").value;
    fundingSourceValue = fundingSourceValue.replace(/[^A-Za-z0-9]/g, "");
    fundingSourceValue = fundingSourceValue.trim().toUpperCase();
    if (realmId != '' && fundingSourceValue.length != 0) {
      if (fundingSourceValue.length >= 7) {
        fundingSourceValue = fundingSourceValue.slice(0, 5);
        //Fetch funding source display name
        FundingSourceService.getFundingSourceDisplayName(realmId, fundingSourceValue)
          .then(response => {
            let { fundingSource } = this.state;
            fundingSource.fundingSourceCode = response.data;
            this.setState({
              fundingSource
            });
          }).catch(
            error => {
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
        //Fetch funding source display name
        FundingSourceService.getFundingSourceDisplayName(realmId, fundingSourceValue)
          .then(response => {
            let { fundingSource } = this.state;
            fundingSource.fundingSourceCode = response.data;
            this.setState({
              fundingSource
            });
          }).catch(
            error => {
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
      }
    }
  }
  /**
   * Handles data change in the funding source form.
   * @param {Event} event - The change event.
   */
  dataChange(event) {
    let { fundingSource } = this.state;
    if (event.target.name == "realmId") {
      fundingSource.realm.id = event.target.value;
    }
    if (event.target.name == "fundingSource") {
      fundingSource.label.label_en = event.target.value;
    }
    if (event.target.name == "fundingSourceCode") {
      fundingSource.fundingSourceCode = event.target.value.toUpperCase();;
    }
    if (event.target.name == "allowedInBudget") {
      fundingSource.allowedInBudget = event.target.id === "allowedInBudget2" ? false : true;
    }
    this.setState({
      fundingSource
    },
      () => { });
  };
  /**
   * Capitalizes the first letter of the funding source & display name.
   * @param {string} str - The funding source/display name.
   * @returns {string} - Capitalized funding source/display name.
   */
  Capitalize(str) {
    var reg = /^[1-9]\d*(\.\d+)?$/
    if (str != null && str != "") {
      return (!(reg.test(str)) ? str.charAt(0).toUpperCase() + str.slice(1) : str)
    } else {
      return "";
    }
  }
  /**
   * Fetches Realm list & RealmId on component mount.
   */
  componentDidMount() {
    //Fetch all realm list 
    RealmService.getRealmListAll()
      .then(response => {
        if (response.status == 200) {
          var listArray = response.data;
          listArray.sort((a, b) => {
            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
            return itemLabelA > itemLabelB ? 1 : -1;
          });
          this.setState({ realms: listArray, loading: false })
        } else {
          this.setState({ message: response.data.messageCode, loading: false })
        }
      }).catch(
        error => {
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
    //Fetch realmId
    let realmId = AuthenticationService.getRealmId();
    if (realmId != -1) {
      let { fundingSource } = this.state;
      fundingSource.realm.id = realmId;
      document.getElementById("realmId").disabled = true;
      this.setState({
        fundingSource
      },
        () => {
        })
    }
  }
  /**
   * Hides the message in div2 after 30 seconds.
   */
  hideSecondComponent() {
    setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 30000);
  }
  /**
   * Renders the funding source details form.
   * @returns {JSX.Element} - funding source details form.
   */
  render() {
    const { realms } = this.state;
    let realmList = realms.length > 0
      && realms.map((item, i) => {
        return (
          <option key={i} value={item.realmId}>
            {getLabelText(item.label, this.state.lang)}
          </option>
        )
      }, this);
    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} />
        <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
        <Row>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              <Formik
                enableReinitialize={true}
                initialValues={{
                  realmId: this.state.fundingSource.realm.id,
                  fundingSource: this.state.fundingSource.label.label_en,
                  fundingSourceCode: this.state.fundingSource.fundingSourceCode
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  this.setState({
                    loading: true
                  })
                  FundingSourceService.addFundingSource(this.state.fundingSource)
                    .then(response => {
                      if (response.status == 200) {
                        this.props.history.push(`/fundingSource/listFundingSource/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                      } else {
                        this.setState({
                          message: response.data.messageCode, loading: false
                        },
                          () => {
                            this.hideSecondComponent();
                          })
                      }
                    }).catch(
                      error => {
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
                }}
                render={
                  ({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                    isValid,
                    setTouched,
                    handleReset
                  }) => (
                    <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='fundingSourceForm' autocomplete="off">
                      <CardBody style={{ display: this.state.loading ? "none" : "block" }}>
                        <FormGroup>
                          <Label htmlFor="realmId">{i18n.t('static.fundingsource.realm')}<span className="red Reqasterisk">*</span></Label><Input
                            type="select"
                            name="realmId"
                            id="realmId"
                            bsSize="sm"
                            valid={!errors.realmId && this.state.fundingSource.realm.id != ''}
                            invalid={touched.realmId && !!errors.realmId}
                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                            onBlur={handleBlur}
                            required
                            value={this.state.fundingSource.realm.id}
                          >
                            <option value="">{i18n.t('static.common.select')}</option>
                            {realmList}
                          </Input>
                          <FormFeedback className="red">{errors.realmId}</FormFeedback>
                        </FormGroup>
                        <FormGroup>
                          <Label for="fundingSource">{i18n.t('static.fundingsource.fundingsource')}<span className="red Reqasterisk">*</span> </Label>
                          <Input type="text"
                            name="fundingSource"
                            id="fundingSource"
                            bsSize="sm"
                            valid={!errors.fundingSource && this.state.fundingSource.label.label_en != ''}
                            invalid={touched.fundingSource && !!errors.fundingSource}
                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                            onBlur={(e) => { handleBlur(e); this.getDisplayName() }}
                            maxLength={255}
                            value={this.Capitalize(this.state.fundingSource.label.label_en)}
                            required />
                          <FormFeedback className="red">{errors.fundingSource}</FormFeedback>
                        </FormGroup>
                        <FormGroup>
                          <Label for="fundingSource">{i18n.t('static.fundingsource.fundingsourceCode')}<span className="red Reqasterisk">*</span> </Label>
                          <Input type="text"
                            name="fundingSourceCode"
                            id="fundingSourceCode"
                            bsSize="sm"
                            valid={!errors.fundingSourceCode && this.state.fundingSource.fundingSourceCode != ''}
                            invalid={touched.fundingSourceCode && !!errors.fundingSourceCode}
                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                            onBlur={handleBlur}
                            value={this.Capitalize(this.state.fundingSource.fundingSourceCode)}
                            required
                            maxLength={7}
                          />
                          <FormFeedback className="red">{errors.fundingSourceCode}</FormFeedback>
                        </FormGroup>
                        <FormGroup>
                          <Label className="P-absltRadio">{i18n.t('static.fundingSource.allowInBudget')}&nbsp;&nbsp;</Label>
                          <FormGroup check inline className="ml-5">
                            <Input
                              className="form-check-input"
                              type="radio"
                              id="allowedInBudget1"
                              name="allowedInBudget"
                              value={true}
                              checked={this.state.fundingSource.allowedInBudget === true}
                              onChange={(e) => { handleChange(e); this.dataChange(e) }}
                            />
                            <Label
                              className="form-check-label"
                              check htmlFor="inline-active1">
                              {i18n.t('static.program.yes')}
                            </Label>
                          </FormGroup>
                          <FormGroup check inline>
                            <Input
                              className="form-check-input"
                              type="radio"
                              id="allowedInBudget2"
                              name="allowedInBudget"
                              value={false}
                              checked={this.state.fundingSource.allowedInBudget === false}
                              onChange={(e) => { handleChange(e); this.dataChange(e) }}
                            />
                            <Label
                              className="form-check-label"
                              check htmlFor="inline-active2">
                              {i18n.t('static.program.no')}
                            </Label>
                          </FormGroup>
                        </FormGroup>
                      </CardBody>
                      <div style={{ display: this.state.loading ? "block" : "none" }}>
                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                          <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status">
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardFooter>
                        <FormGroup>
                          <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                          <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                          <Button type="submit" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                          &nbsp;
                        </FormGroup>
                      </CardFooter>
                    </Form>
                  )} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
  /**
   * Redirects to the list funding source when cancel button is clicked.
   */
  cancelClicked() {
    this.props.history.push(`/fundingSource/listFundingSource/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
  }
  /**
   * Resets the funding source details form when reset button is clicked.
   */
  resetClicked() {
    let { fundingSource } = this.state;
    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
      fundingSource.realm.id = ''
    }
    fundingSource.label.label_en = ''
    fundingSource.fundingSourceCode = ''
    this.setState({
      fundingSource
    },
      () => { });
  }
}
export default AddFundingSourceComponent;
