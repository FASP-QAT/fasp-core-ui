import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, InputGroupAddon, InputGroupText, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import RegionService from "../../api/RegionService";
import RealmCountryService from "../../api/RealmCountryService.js";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'

const entityname = i18n.t('static.region.region');

const initialValues = {
  realmCountryId: [],
  region: ""
}

const validationSchema = function (values) {
  return Yup.object().shape({
    realmCountryId: Yup.string()
      .required(i18n.t('static.region.validcountry')),
    region: Yup.string()
      .required(i18n.t('static.region.validregion'))
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
class AddRegionComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realmCountries: [],
      region: {
        realmCountry: {
          realmCountryId: ''
        },
        label: {
          label_en: '',
          label_fr: '',
          label_sp: '',
          label_pr: ''
        }
      },
      message: '',
      lang: localStorage.getItem('lang')
    }
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
    this.Capitalize = this.Capitalize.bind(this);
    this.resetClicked = this.resetClicked.bind(this);
  }

  dataChange(event) {
    let { region } = this.state;
    if (event.target.name == "realmCountryId") {
      region.realmCountry.realmCountryId = event.target.value;
    }
    if (event.target.name == "region") {
      region.label.label_en = event.target.value;
    }
    this.setState({
      region
    },
      () => { });
  };

  touchAll(setTouched, errors) {
    setTouched({
      realmCountryId: true,
      region: true
    }
    );
    this.validateForm(errors);
  }
  validateForm(errors) {
    this.findFirstError('regionForm', (fieldName) => {
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
    // AuthenticationService.setupAxiosInterceptors();
    RealmCountryService.getRealmCountryListAll()
      .then(response => {
        if (response.status == 200) {
          this.setState({
            realmCountries: response.data
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
  }

  Capitalize(str) {
    // console.log("in method");
    this.state.region.label.label_en = str.charAt(0).toUpperCase() + str.slice(1);
    // return str.charAt(0).toUpperCase() + str.slice(1);
  }
  render() {
    const { realmCountries } = this.state;
    let realmCountryList = realmCountries.length > 0
      && realmCountries.map((item, i) => {
        return (
          <option key={i} value={item.realmCountryId}>
            {getLabelText(item.country.label, this.state.lang)}
          </option>
        )
      }, this);
    return (
      <div className="animated fadeIn">
        <AuthenticationServiceComponent history={this.props.history} />
        <h5>{i18n.t(this.state.message, { entityname })}</h5>
        <Row>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardHeader>
                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
              </CardHeader>
              <Formik
                initialValues={initialValues}
                validate={validate(validationSchema)}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  console.log("Submit clicked-----------", this.state.region);
                  RegionService.addRegion(this.state.region)
                    .then(response => {
                      console.log("Response->", response);
                      if (response.status == 200) {
                        this.props.history.push(`/region/listRegion/` + i18n.t(response.data.messageCode, { entityname }))
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
                      <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='regionForm'>
                        <CardBody>
                          <FormGroup>
                            <Label htmlFor="realmCountryId">{i18n.t('static.region.country')}<span className="red Reqasterisk">*</span></Label>
                            {/* <InputGroupAddon addonType="prepend"> */}
                            {/* <InputGroupText><i className="fa fa-globe"></i></InputGroupText> */}
                            <Input
                              type="select"
                              name="realmCountryId"
                              id="realmCountryId"
                              bsSize="sm"
                              valid={!errors.realmCountryId && this.state.region.realmCountry.realmCountryId != ''}
                              invalid={touched.realmCountryId && !!errors.realmCountryId}
                              onChange={(e) => { handleChange(e); this.dataChange(e) }}
                              onBlur={handleBlur}
                              required
                              value={this.state.region.realmCountry.realmCountryId}
                            >
                              <option value="">{i18n.t('static.common.select')}</option>
                              {realmCountryList}
                            </Input>
                            {/* </InputGroupAddon> */}
                            <FormFeedback className="red">{errors.realmCountryId}</FormFeedback>
                          </FormGroup>

                          <FormGroup>

                            <Label for="region">{i18n.t('static.region.region')}<span className="red Reqasterisk">*</span></Label>
                            {/* <InputGroupAddon addonType="prepend"> */}
                            {/* <InputGroupText><i className="fa fa-pie-chart"></i></InputGroupText> */}
                            <Input type="text"
                              name="region"
                              id="region"
                              bsSize="sm"
                              valid={!errors.region && this.state.region.label.label_en != ''}
                              invalid={touched.region && !!errors.region}
                              onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                              onBlur={handleBlur}
                              value={this.state.region.label.label_en}
                              required />
                            {/* </InputGroupAddon> */}
                            <FormFeedback className="red">{errors.region}</FormFeedback>

                          </FormGroup>
                        </CardBody>
                        <CardFooter>
                          <FormGroup>
                            {/* <Button type="reset" size="sm" color="warning" className="float-right mr-1"><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button> */}
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="reset" size="md" color="success" className="float-right mr-1" onClick={this.resetClicked}><i className="fa fa-times"></i> {i18n.t('static.common.reset')}</Button>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
  cancelClicked() {
    this.props.history.push(`/region/listRegion/` + i18n.t('static.message.cancelled', { entityname }))
  }

  resetClicked() {
    let { region } = this.state;

    region.realmCountry.realmCountryId = ''
    region.label.label_en = ''

    this.setState({
      region
    },
      () => { });
  }
}

export default AddRegionComponent;
