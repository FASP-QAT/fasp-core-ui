import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, InputGroupAddon, InputGroupText, Input} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import RegionService from "../../api/RegionService";
import RealmCountryService from "../../api/RealmCountryService.js";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';

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
        },
        label: {
          label_en:'',
          label_fr:'',
          label_sp:'',
          label_pr:''
        }
      },
      message: '',
      lang: localStorage.getItem('lang')
    }
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
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
    AuthenticationService.setupAxiosInterceptors();
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

  render() {
    const { realmCountries } = this.state;
    let realmCountryList = realmCountries.length > 0
      && realmCountries.map((item, i) => {
        return (
          <option key={i} value={item.realmCountryId}>
            {getLabelText(item.country.label,this.state.lang)}
          </option>
        )
      }, this);
    return (
      <div className="animated fadeIn">
        <Row>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardHeader>
                <i className="icon-note"></i><strong>{i18n.t('static.region.regionadd')}</strong>{' '}
              </CardHeader>
              <Formik
                initialValues={initialValues}
                validate={validate(validationSchema)}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  console.log("Submit clicked");
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
                      <Form onSubmit={handleSubmit} noValidate name='regionForm'>
                        <CardBody>
                          <FormGroup>
                            <Label htmlFor="realmCountryId">{i18n.t('static.region.country')}</Label>
                            {/* <InputGroupAddon addonType="prepend"> */}
                              {/* <InputGroupText><i className="fa fa-globe"></i></InputGroupText> */}
                              <Input
                                type="select"
                                name="realmCountryId"
                                id="realmCountryId"
                                bsSize="sm"
                                valid={!errors.realmCountryId}
                                invalid={touched.realmCountryId && !!errors.realmCountryId}
                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                onBlur={handleBlur}
                                required
                                value={this.state.realmCountryId}
                              >
                                <option value="0">{i18n.t('static.common.select')}</option>
                                {realmCountryList}
                              </Input>
                            {/* </InputGroupAddon> */}
                            <FormFeedback className="red">{errors.realmCountryId}</FormFeedback>
                          </FormGroup>

                          <FormGroup>

                            <Label for="region">{i18n.t('static.region.region')}</Label>
                            {/* <InputGroupAddon addonType="prepend"> */}
                              {/* <InputGroupText><i className="fa fa-pie-chart"></i></InputGroupText> */}
                              <Input type="text"
                                name="region"
                                id="region"
                                bsSize="sm"
                                valid={!errors.region}
                                invalid={touched.region && !!errors.region}
                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                onBlur={handleBlur}
                                required />
                            {/* </InputGroupAddon> */}
                            <FormFeedback className="red">{errors.region}</FormFeedback>

                          </FormGroup>
                        </CardBody>
                        <CardFooter>
                          <FormGroup>
                            {/* <Button type="reset" size="sm" color="warning" className="float-right mr-1"><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button> */}
                            <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="submit" size="sm" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
}

export default AddRegionComponent;
