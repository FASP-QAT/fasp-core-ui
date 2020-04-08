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

const entityname = i18n.t('static.healtharea.healtharea');

const initialValues = {
  realmId: '',
  healthAreaName: ''
}

const validationSchema = function (values) {
  return Yup.object().shape({
    realmId: Yup.string()
      .required(i18n.t('static.common.realmtext')),
    healthAreaName: Yup.string()
      .required(i18n.t('static.healtharea.healthareatext'))
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
          realmId: ''
        },
        realmCountryArray: []

      },
      lang: localStorage.getItem('lang'),
      realmCountryId: '',
      realmCountryList: [],
      //   realmCountryList: [{ value: '1', label: 'R1' },
      //   { value: '2', label: 'R2' },
      //   { value: '3', label: 'R3' }
      // ],
      message: '',
      selCountries: []
    }
    this.Capitalize = this.Capitalize.bind(this);
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
    this.updateFieldData = this.updateFieldData.bind(this);
    this.getRealmCountryList = this.getRealmCountryList.bind(this);
  }

  dataChange(event) {
    let { healthArea } = this.state
    console.log(event.target.name)
    console.log(event.target.value)
    if (event.target.name === "healthAreaName") {
      healthArea.label.label_en = event.target.value
    } else if (event.target.name === "realmId") {
      healthArea.realm.realmId = event.target.value
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
      healthAreaName: true
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
    if (!AuthenticationService.checkTypeOfSession()) {
      alert("You can't change your session from online to offline or vice versa.");
      this.props.history.push(`/`)
    }
    AuthenticationService.setupAxiosInterceptors();
    CountryService.getCountryListAll()
      .then(response => {
        console.log("country list---", response.data);
        this.setState({
          countries: response.data
        })
      }).catch(
        error => {
          switch (error.message) {
            case "Network Error":
              this.setState({
                message: error.message
              })
              break
            default:
              this.setState({
                message: error.response.data.message
              })
              break
          }
        }
      );
    UserService.getRealmList()
      .then(response => {
        console.log("realm list---", response.data);
        this.setState({
          realms: response.data
        })
      }).catch(
        error => {
          switch (error.message) {
            case "Network Error":
              this.setState({
                message: error.message
              })
              break
            default:
              this.setState({
                message: error.response.data.message
              })
              break
          }
        }
      );
  }
  updateFieldData(value) {
    let { healthArea } = this.state;
    this.setState({ realmCountryId: value });
    var realmCountryId = value;
    var realmCountryIdArray = [];
    for (var i = 0; i < realmCountryId.length; i++) {
      realmCountryIdArray[i] = realmCountryId[i].value;
    }
    healthArea.realmCountryArray = realmCountryIdArray;
    this.setState({ healthArea: healthArea });
  }

  getRealmCountryList(e) {
    AuthenticationService.setupAxiosInterceptors();
    HealthAreaService.getRealmCountryList(e.target.value)
      .then(response => {
        console.log("Realm Country List list---", response.data);
        if (response.status == 200) {
          var json = response.data;
          var regList = [];
          for (var i = 0; i < json.length; i++) {
            regList[i] = { value: json[i].realmCountryId, label: json[i].country.label.label_en }
          }
          this.setState({
            realmCountryId: '',
            realmCountryList: regList
          })
        } else {
          this.setState({
            message: response.data.messageCode
          })
        }
      }).catch(
        error => {
          if (error.message === "Network Error") {
            this.setState({ message: error.message });
          } else {
            switch (error.response.status) {
              case 500:
              case 401:
              case 404:
              case 406:
              case 412:
                this.setState({ message: error.response.data.messageCode });
                break;
              default:
                this.setState({ message: 'static.unkownError' });
                console.log("Error code unkown");
                break;
            }
          }
        }
      );

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
                  console.log("-------------------->" + this.state.healthArea);
                  HealthAreaService.addHealthArea(this.state.healthArea)
                    .then(response => {
                      if (response.status == 200) {
                        this.props.history.push(`/healthArea/listHealthArea/` + i18n.t(response.data.messageCode, { entityname }))
                      } else {
                        this.setState({
                          message: response.data.messageCode
                        })
                      }
                    })
                    .catch(
                      error => {
                        if (error.message === "Network Error") {
                          this.setState({ message: error.message });
                        } else {
                          switch (error.response ? error.response.status : "") {
                            case 500:
                            case 401:
                            case 404:
                            case 406:
                            case 412:
                              this.setState({ message: error.response.data.messageCode });
                              break;
                            default:
                              this.setState({ message: 'static.unkownError' });
                              console.log("Error code unkown");
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
                    setTouched
                  }) => (
                      <Form onSubmit={handleSubmit} noValidate name='healthAreaForm'>
                        <CardBody>

                          <FormGroup>
                            <Label htmlFor="company">{i18n.t('static.healthArea.healthAreaName')} </Label>
                            <Input
                            bsSize="sm"
                              type="text" name="healthAreaName" valid={!errors.healthAreaName}
                              invalid={touched.healthAreaName && !!errors.healthAreaName}
                              onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                              onBlur={handleBlur}
                              id="healthAreaName" />
                            <FormFeedback className="red">{errors.healthAreaName}</FormFeedback>
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="select">{i18n.t('static.healtharea.realm')}</Label>
                            <Input
                            bsSize="sm"
                              value={this.state.healthArea.realm.realmId}
                              valid={!errors.realmId}
                              invalid={touched.realmId && !!errors.realmId}
                              onChange={(e) => { handleChange(e); this.dataChange(e); this.getRealmCountryList(e) }}
                              onBlur={handleBlur}
                              type="select" name="realmId" id="realmId">
                              <option value="0">{i18n.t('static.common.select')}</option>
                              {realmList}
                            </Input>
                            <FormFeedback>{errors.realmId}</FormFeedback>
                          </FormGroup>

                          <FormGroup>
                            <Label htmlFor="select">{i18n.t('static.healtharea.realmcountry')}</Label>
                            <Select
                            bsSize="sm"
                              valid={!errors.realmCountryId}
                              invalid={touched.realmCountryId && !!errors.realmCountryId}
                              onChange={(e) => { handleChange(e); this.updateFieldData(e) }}
                              onBlur={handleBlur} name="realmCountryId" id="realmCountryId"
                              multi
                              options={this.state.realmCountryList}
                              value={this.state.realmCountryId}
                            />
                            <FormFeedback>{errors.realmCountryId}</FormFeedback>
                          </FormGroup>

                        </CardBody>

                        <CardFooter>
                          <FormGroup>
                            <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-check"></i>{i18n.t('static.common.cancel')}</Button>
                            <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

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


  getCountryListByRealmId(event) {
    let realmId = event.target.value;
    const selCountries = this.state.countries.filter(c => c.realm.realmId == realmId)
    this.setState({
      selCountries: selCountries
    });
  }

  cancelClicked() {
    this.props.history.push(`/healthArea/listHealthArea/` + i18n.t('static.message.cancelled', { entityname }))
  }

}
