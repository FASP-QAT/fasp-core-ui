import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, InputGroupAddon, InputGroupText, Input } from 'reactstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import CountryService from "../../api/CountryService";
import HealthAreaService from "../../api/HealthAreaService";
import UserService from "../../api/UserService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import classNames from 'classnames';
import { SPECIAL_CHARECTER_WITH_NUM, ALPHABET_NUMBER_REGEX, SPACE_REGEX } from '../../Constants.js';

const entityname = i18n.t('static.healtharea.healtharea');

let initialValues = {
  realmId: '',
  healthAreaName: '',
  realmCountryId: [],
}

const validationSchema = function (values) {
  return Yup.object().shape({
    realmId: Yup.string()
      .required(i18n.t('static.common.realmtext')),
    healthAreaName: Yup.string()
      // .matches(/^([a-zA-Z]+\s)*[a-zA-Z]+$/, i18n.t('static.message.rolenamevalidtext'))
      // .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
      .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
      .required(i18n.t('static.healtharea.healthareatext')),
    healthAreaCode: Yup.string()
      // .matches(ALPHABET_NUMBER_REGEX, i18n.t('static.message.alphabetnumerallowed'))
      // .matches(/^[a-zA-Z0-9_'\/-]*$/, i18n.t('static.common.alphabetNumericCharOnly'))
      .matches(SPECIAL_CHARECTER_WITH_NUM, i18n.t('static.validNoSpace.string'))
      .max(6, i18n.t('static.organisation.organisationcodemax6digittext'))
      .required(i18n.t('static.common.displayName')),
    realmCountryId: Yup.string()
      .required(i18n.t('static.program.validcountrytext'))

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

export default class AddHealthAreaComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      countries: [],
      realms: [],
      healthArea: {
        label: {
          label_en: ''
        },
        realm: {
          id: ''
        },
        realmCountryArray: [],
        healthAreaCode: '',

      },
      lang: localStorage.getItem('lang'),
      realmCountryId: '',
      realmCountryList: [],
      //   realmCountryList: [{ value: '1', label: 'R1' },
      //   { value: '2', label: 'R2' },
      //   { value: '3', label: 'R3' }
      // ],
      message: '',
      selCountries: [],
      loading: true,
    }
    this.Capitalize = this.Capitalize.bind(this);
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
    this.updateFieldData = this.updateFieldData.bind(this);
    this.getRealmCountryList = this.getRealmCountryList.bind(this);
    this.resetClicked = this.resetClicked.bind(this);
    this.hideSecondComponent = this.hideSecondComponent.bind(this);
    this.getDisplayName = this.getDisplayName.bind(this);
  }

  getDisplayName() {
    let realmId = document.getElementById("realmId").value;
    // let realmId = 1;
    let healthAreaValue = document.getElementById("healthAreaName").value;
    // let healthAreaValue = "USAID"
    healthAreaValue = healthAreaValue.replace(/[^A-Za-z0-9]/g, "");
    healthAreaValue = healthAreaValue.trim().toUpperCase();
    if (realmId != 0 && healthAreaValue.length != 0) {

      if (healthAreaValue.length >= 6) {//minus 2
        healthAreaValue = healthAreaValue.slice(0, 4);
        console.log("DISPLAYNAME-BEF----->", healthAreaValue);
        HealthAreaService.getHealthAreaDisplayName(realmId, healthAreaValue)
          .then(response => {
            console.log("DISPLAYNAME-RESP----->", response);
            let { healthArea } = this.state
            healthArea.healthAreaCode = response.data;
            this.setState({
              healthArea
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
        console.log("DISPLAYNAME-BEF-else----->", healthAreaValue);
        HealthAreaService.getHealthAreaDisplayName(realmId, healthAreaValue)
          .then(response => {
            console.log("DISPLAYNAME-RESP-else----->", response);
            let { healthArea } = this.state
            healthArea.healthAreaCode = response.data;
            this.setState({
              healthArea
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
    let { healthArea } = this.state
    console.log(event.target.name)
    console.log(event.target.value)
    if (event.target.name === "healthAreaName") {
      healthArea.label.label_en = event.target.value
    } else if (event.target.name === "realmId") {
      healthArea.realm.id = event.target.value
    } else if (event.target.name === "healthAreaCode") {
      healthArea.healthAreaCode = event.target.value.toUpperCase();
    }
    this.setState({
      healthArea
    }, (
    ) => {
      console.log("state after update---", this.state.healthArea)
    })
  }

  touchAll(setTouched, errors) {
    setTouched({
      realmId: true,
      healthAreaName: true,
      healthAreaCode: true,
      realmCountryId: true
    }
    )
    this.validateForm(errors)
  }

  validateForm(errors) {
    this.findFirstError('healthAreaForm', (fieldName) => {
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

  componentDidMount() {
    // console.log("check---" + AuthenticationService.checkTypeOfSession());
    // if (!AuthenticationService.checkTypeOfSession()) {
    //   alert("You can't change your session from online to offline or vice versa.");
    //   this.props.history.push(`/`)
    // }
    // AuthenticationService.setupAxiosInterceptors();
    CountryService.getCountryListAll()
      .then(response => {
        if (response.status == 200) {
          console.log("country list---", response.data);
          this.setState({
            countries: response.data, loading: false
          })
        }
        else {

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

    UserService.getRealmList()
      .then(response => {
        console.log("realm list---", response.data);
        var listArray = response.data;
        listArray.sort((a, b) => {
          var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
          var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
          return itemLabelA > itemLabelB ? 1 : -1;
        });
        this.setState({
          realms: listArray, loading: false,
        })
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

      let { healthArea } = this.state
      healthArea.realm.id = realmId;
      document.getElementById("realmId").disabled = true;
      this.setState({
        healthArea
      },
        () => {
          this.getRealmCountryList()
        })
    }
  }

  hideSecondComponent() {
    setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 8000);
  }

  updateFieldData(value) {
    // console.log("------->1", value);
    var selectedArray = [];
    for (var p = 0; p < value.length; p++) {
      selectedArray.push(value[p].value);
    }
    if (selectedArray.includes("-1")) {
      // console.log("------->2 in if");
      this.setState({ realmCountryId: [] });
      var list = this.state.realmCountryList.filter(c => c.value != -1)
      this.setState({ realmCountryId: list });
      var realmCountryId = list;
    } else {
      // console.log("------->3 in else");
      this.setState({ realmCountryId: value });
      var realmCountryId = value;

    }

    let { healthArea } = this.state;
    var realmCountryIdArray = [];
    for (var i = 0; i < realmCountryId.length; i++) {
      realmCountryIdArray[i] = realmCountryId[i].value;
    }
    healthArea.realmCountryArray = realmCountryIdArray;
    this.setState({ healthArea: healthArea });
  }

  getRealmCountryList(e) {
    let realmId = this.state.healthArea.realm.id;
    if (realmId != "") {
      HealthAreaService.getRealmCountryList(realmId)
        .then(response => {
          console.log("Realm Country List list---", response.data);
          if (response.status == 200) {
            var json = response.data;
            var regList = [{ value: "-1", label: i18n.t("static.common.all") }];
            for (var i = 0; i < json.length; i++) {
              regList[i + 1] = { value: json[i].realmCountryId, label: json[i].country.label.label_en }
            }
            var listArray = regList;
            listArray.sort((a, b) => {
              var itemLabelA = a.label.toUpperCase(); // ignore upper and lowercase
              var itemLabelB = b.label.toUpperCase(); // ignore upper and lowercase                   
              return itemLabelA > itemLabelB ? 1 : -1;
            });
            this.setState({
              realmCountryId: '',
              realmCountryList: listArray,
              loading: false
            })
          } else {
            this.setState({
              message: response.data.messageCode
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
    } else {
      this.setState({
        realmCountryId: '',
        realmCountryList: [],
        loading: false,
      })
    }
  }

  Capitalize(str) {
    this.state.healthArea.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
  }

  render() {
    const { countries } = this.state;
    const { realms } = this.state;

    let realmList = realms.length > 0
      && realms.map((item, i) => {
        return (
          <option key={i} value={item.realmId}>
            {(() => {
              switch (this.state.languageId) {
                case 2: return (item.label.label_pr !== null && item.label.label_pr !== "" ? item.label.label_pr : item.label.label_en);
                case 3: return (item.label.label_fr !== null && item.label.label_fr !== "" ? item.label.label_fr : item.label.label_en);
                case 4: return (item.label.label_sp !== null && item.label.label_sp !== "" ? item.label.label_sp : item.label.label_en);
                default: return item.label.label_en;
              }
            })()}
          </option>
        )
      }, this);

    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} />
        <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
        <Row style={{ display: this.state.loading ? "none" : "block" }}>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              {/* <CardHeader>
                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
              </CardHeader> */}
              <Formik
                enableReinitialize={true}
                // initialValues={initialValues}
                initialValues={{
                  healthAreaName: this.state.healthArea.label.label_en,
                  healthAreaCode: this.state.healthArea.healthAreaCode,
                  realmId: this.state.healthArea.realm.id,
                  realmCountryId: this.state.realmCountryId
                }}
                validate={validate(validationSchema)}
                onSubmit={(values, { setSubmitting, setErrors }) => {

                  console.log("-------------------->" + this.state.healthArea);
                  if (this.state.healthArea.label.label_en != '') {
                    this.setState({
                      loading: true
                    })
                    HealthAreaService.addHealthArea(this.state.healthArea)
                      .then(response => {
                        if (response.status == 200) {
                          this.props.history.push(`/healthArea/listHealthArea/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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
                  }


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
                    handleReset,
                    setFieldValue,
                    setFieldTouched
                  }) => (
                      <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='healthAreaForm' autocomplete="off">
                        <CardBody>

                          <FormGroup>
                            <Label htmlFor="select">{i18n.t('static.healtharea.realm')}<span class="red Reqasterisk">*</span></Label>
                            <Input
                              bsSize="sm"
                              value={this.state.healthArea.realm.id}
                              valid={!errors.realmId && this.state.healthArea.realm.id != ''}
                              invalid={touched.realmId && !!errors.realmId}
                              onChange={(e) => { handleChange(e); this.dataChange(e); this.getRealmCountryList(e) }}
                              onBlur={handleBlur}
                              type="select" name="realmId" id="realmId">
                              <option value="">{i18n.t('static.common.select')}</option>
                              {realmList}
                            </Input>
                            <FormFeedback>{errors.realmId}</FormFeedback>
                          </FormGroup>

                          <FormGroup className="Selectcontrol-bdrNone">
                            <Label htmlFor="realmCountryId">{i18n.t('static.healtharea.realmcountry')}<span class="red Reqasterisk">*</span></Label>
                            <Select
                              className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                { 'is-valid': !errors.realmCountryId && this.state.healthArea.realmCountryArray.length != 0 },
                                { 'is-invalid': (touched.realmCountryId && !!errors.realmCountryId) }
                              )}
                              bsSize="sm"
                              name="realmCountryId"
                              id="realmCountryId"
                              onChange={(e) => {
                                handleChange(e);
                                setFieldValue("realmCountryId", e);
                                this.updateFieldData(e);
                              }}
                              onBlur={() => setFieldTouched("realmCountryId", true)}
                              multi
                              options={this.state.realmCountryList}
                              value={this.state.realmCountryId}
                            // value={this.state.healthArea.realmCountryArray}
                            />
                            <FormFeedback>{errors.realmCountryId}</FormFeedback>
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="company">{i18n.t('static.healthArea.healthAreaName')}<span class="red Reqasterisk">*</span> </Label>
                            <Input
                              bsSize="sm"
                              type="text" name="healthAreaName" valid={!errors.healthAreaName && this.state.healthArea.label.label_en != ''}
                              invalid={touched.healthAreaName && !!errors.healthAreaName}
                              onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                              // onBlur={handleBlur}
                              onBlur={(e) => { handleBlur(e); this.getDisplayName() }}
                              value={this.state.healthArea.label.label_en}
                              id="healthAreaName" />
                            <FormFeedback className="red">{errors.healthAreaName}</FormFeedback>
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="company">{i18n.t('static.technicalArea.technicalAreaDisplayName')}<span class="red Reqasterisk">*</span> </Label>
                            <Input
                              bsSize="sm"
                              type="text" name="healthAreaCode" valid={!errors.healthAreaCode && this.state.healthArea.healthAreaCode != ''}
                              invalid={touched.healthAreaCode && !!errors.healthAreaCode}
                              onChange={(e) => { handleChange(e); this.dataChange(e); }}
                              onBlur={handleBlur}
                              maxLength={6}
                              value={this.state.healthArea.healthAreaCode}
                              id="healthAreaCode" />
                            <FormFeedback className="red">{errors.healthAreaCode}</FormFeedback>
                          </FormGroup>

                        </CardBody>

                        <CardFooter>
                          <FormGroup>
                            <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                            <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                            {/* <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button> */}
                            <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

                            &nbsp;
                                                  </FormGroup>
                        </CardFooter>
                      </Form>

                    )} />

            </Card>
          </Col>
        </Row>
        <div style={{ display: this.state.loading ? "block" : "none" }}>
          <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
            <div class="align-items-center">
              <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

              <div class="spinner-border blue ml-4" role="status">

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  getCountryListByRealmId(event) {
    let realmId = event.target.value;
    const selCountries = this.state.countries.filter(c => c.realm.realmId == realmId)
    this.setState({
      selCountries: selCountries
    });
  }

  cancelClicked() {
    this.props.history.push(`/healthArea/listHealthArea/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
  }

  resetClicked() {
    let { healthArea } = this.state;

    healthArea.label.label_en = ''
    healthArea.realm.id = ''
    this.state.realmCountryId = ''
    healthArea.healthAreaCode = ''
    healthArea.realmCountryArray = []

    this.setState({
      healthArea
    }, (
    ) => {
      console.log("state after update---", this.state.healthArea)
    })

  }

}
