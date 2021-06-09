import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import getLabelText from '../../CommonComponent/getLabelText'
import FundingSourceService from "../../api/FundingSourceService";
import RealmService from "../../api/RealmService";
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { SPECIAL_CHARECTER_WITH_NUM, LABEL_REGEX } from '../../Constants.js';

import i18n from '../../i18n'
let initialValues = {
  fundingSourceId: [],
  subFundingSource: "",
  fundingSourceCode: "",
}
const entityname = i18n.t('static.fundingsource.fundingsource');
const validationSchema = function (values) {
  return Yup.object().shape({
    realmId: Yup.string()
      .required(i18n.t('static.common.realmtext')),
    // fundingSource: Yup.string()
    //   .matches(LABEL_REGEX, i18n.t('static.message.rolenamevalidtext'))
    //   .required(i18n.t('static.fundingsource.fundingsourcetext')),
    fundingSource: Yup.string()
      .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
      .required(i18n.t('static.fundingsource.fundingsourcetext')),
    fundingSourceCode: Yup.string()
      // .max(6, i18n.t('static.common.max6digittext'))
      // .matches(/^[a-zA-Z]+$/, i18n.t('static.common.alphabetsOnly'))
      // .matches(/^[a-zA-Z0-9_'\/-]*$/, i18n.t('static.common.alphabetNumericCharOnly'))
      .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
      .required(i18n.t('static.fundingsource.fundingsourceCodeText')),
  })
}

const validate = (getValidationSchema) => {
  return (values) => {
    const validationSchema = getValidationSchema(values)
    try {
      validationSchema.validateSync(values, { abortEarly: false })
      return {}
    } catch (error) {
      return getErrorsFromValidationError(error)
    }
  }
}

const getErrorsFromValidationError = (validationError) => {
  const FIRST_ERROR = 0
  return validationError.inner.reduce((errors, error) => {
    return {
      ...errors,
      [error.path]: error.errors[FIRST_ERROR],
    }
  }, {})
}
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

  getDisplayName() {
    let realmId = document.getElementById("realmId").value;
    // let realmId = 1;
    let fundingSourceValue = document.getElementById("fundingSource").value;
    // let fundingSourceValue = "USAID"
    fundingSourceValue = fundingSourceValue.replace(/[^A-Za-z0-9]/g, "");
    fundingSourceValue = fundingSourceValue.trim().toUpperCase();
    if (realmId != '' && fundingSourceValue.length != 0) {

      if (fundingSourceValue.length >= 7) {//minus 2
        fundingSourceValue = fundingSourceValue.slice(0, 5);
        console.log("DISPLAYNAME-BEF----->", fundingSourceValue);
        FundingSourceService.getFundingSourceDisplayName(realmId, fundingSourceValue)
          .then(response => {
            console.log("DISPLAYNAME-RESP----->", response);
            let { fundingSource } = this.state;
            fundingSource.fundingSourceCode = response.data;
            this.setState({
              fundingSource
            });

          }).catch(
            error => {
              if (error.message === "Network Error") {
                this.setState({
                  message: 'static.unkownError',
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

      } else {// not need to minus
        console.log("DISPLAYNAME-BEF-else----->", fundingSourceValue);
        FundingSourceService.getFundingSourceDisplayName(realmId, fundingSourceValue)
          .then(response => {
            console.log("DISPLAYNAME-RESP-else----->", response);
            let { fundingSource } = this.state;
            fundingSource.fundingSourceCode = response.data;
            this.setState({
              fundingSource
            });

          }).catch(
            error => {
              if (error.message === "Network Error") {
                this.setState({
                  message: 'static.unkownError',
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

  touchAll(setTouched, errors) {
    setTouched({
      realmId: true,
      fundingSource: true,
      fundingSourceCode: true,
    }
    );
    this.validateForm(errors);
  }
  validateForm(errors) {
    this.findFirstError('fundingSourceForm', (fieldName) => {
      return Boolean(errors[fieldName])
    })
  }
  findFirstError(formName, hasError) {
    const form = document.forms[formName]
    for (let i = 0; i < form.length; i++) {
      if (hasError(form[i].name)) {
        form[i].focus()
        break
      }
    }
  }
  Capitalize(str) {
    var reg = /^[1-9]\d*(\.\d+)?$/
    if (str != null && str != "") {
      // return str.charAt(0).toUpperCase() + str.slice(1);
      return (!(reg.test(str)) ? str.charAt(0).toUpperCase() + str.slice(1) : str)
    } else {
      return "";
    }
  }
  componentDidMount() {
    // AuthenticationService.setupAxiosInterceptors();
    // this.getDisplayName();
    RealmService.getRealmListAll()
      .then(response => {
        if (response.status == 200) {
          var listArray = response.data;
          listArray.sort((a, b) => {
            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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
              message: 'static.unkownError',
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
    let realmId = AuthenticationService.getRealmId();
    if (realmId != -1) {
      // document.getElementById('realmId').value = realmId;
      // initialValues = {
      //   realmId: realmId
      // }

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
  hideSecondComponent() {
    setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 8000);
  }

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
        <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
        <Row>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              {/* <CardHeader>
                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
              </CardHeader> */}
              <Formik
                // initialValues={initialValues}
                enableReinitialize={true}
                initialValues={{
                  realmId: this.state.fundingSource.realm.id,
                  fundingSource: this.state.fundingSource.label.label_en,
                  fundingSourceCode: this.state.fundingSource.fundingSourceCode
                }}
                validate={validate(validationSchema)}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  this.setState({
                    loading: true
                  })
                  console.log("Submit clicked");
                  FundingSourceService.addFundingSource(this.state.fundingSource)
                    .then(response => {
                      console.log("Response->", response);
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
                            message: 'static.unkownError',
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
                              // onBlur={handleBlur}
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
                            {/* <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button> */}
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

                            &nbsp;
                          </FormGroup>
                        </CardFooter>
                      </Form>

                    )} />

            </Card>
          </Col>
        </Row>

        {/* <div>
          <h6>{i18n.t(this.state.message)}</h6>
          <h6>{i18n.t(this.props.match.params.message)}</h6>
        </div> */}
      </div>
    );
  }
  cancelClicked() {
    this.props.history.push(`/fundingSource/listFundingSource/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
  }
  resetClicked() {
    let { fundingSource } = this.state;

    fundingSource.realm.id = ''
    fundingSource.label.label_en = ''
    fundingSource.fundingSourceCode = ''

    this.setState({
      fundingSource
    },
      () => { });
  }
}

export default AddFundingSourceComponent;
