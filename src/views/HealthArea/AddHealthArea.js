import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
// React select
import states from '../Forms/AdvancedForms/data/states';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';

import HealthAreaService from "../../api/HealthAreaService";
import RealmService from "../../api/RealmService";
import RealmCountryService from "../../api/RealmCountryService";

import AuthenticationService from '../common/AuthenticationService.js';

const initialValues = {
  realmId: [],
  countryId: [],
  healthAreaName: ""
}

const validationSchema = function (values) {
  return Yup.object().shape({
    realmId: Yup.string()
    .required(i18n.t('static.healtharea.realmtext')),
     countryId: Yup.string()
      .required(i18n.t('static.healtharea.countrytext')),
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

const onSubmit = (values, { setSubmitting, setErrors }) => {
  console.log("submit called---", values);
  setTimeout(() => {
    alert(JSON.stringify(values, null, 2))
    // console.log('User has been successfully saved!', values)
    setSubmitting(false)
  }, 2000)
}

class AddHealthArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      countries: [],
      realms: [],
      healthArea: {
        label: {

        },
        realm: {

        },
        realmCountryArray: {

        }
      },
      selCountries: [],
      message: ''
    }
    this.submitClicked = this.submitClicked.bind(this);
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
    // this.handleChange = this.handleChange.bind(this);
    this.getCountryListByRealmId = this.getCountryListByRealmId.bind(this);
  }
  // handleChange(values) {
  //   console.log("handle change called===" , values);
  // }
  dataChange(event) {
    // let { healthArea } = this.state.healthArea
    console.log("handle change called===", event.target.name);
    console.log("handle change called===", event.target.value);
    if (event.target.name === "realmId") {
      //   realmId = event.target.value
      this.getCountryListByRealmId(event.target.value);
    }
    // this.setState({
    //   healthArea
    // }, (
    // ) => {
    //   console.log("state after update---", this.state.healthArea)
    // })
    //   console.log("length---"+event.target.options.length);
    //   for (let i = 0, len = event.target.options.length; i < len; i++) {
    //     // opt = event.target.options[i];

    //     if (event.target.options[i].selected) {
    //         console.log("value----",event.target.options[i].value);
    //     }
    // }
    // const { name, value } = event.target;
    // this.setState({
    //   [name]: value,
    // });
    console.log("handle change works");
  };

  touchAll(setTouched, errors) {
    setTouched({
      'realmId': true,
      countryId: true,
      healthAreaName: true
    }
    )
    this.validateForm(errors)
  }
  validateForm(errors) {
    this.findFirstError('simpleForm', (fieldName) => {
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
        // console.log("country list---", response.data);
        this.setState({
          countries: response.data.data
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
    // AuthenticationService.setupAxiosInterceptors();
    RealmService.getRealmListAll()
      .then(response => {
        this.setState({
          realms: response.data.data
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

  render() {
    const { selCountries } = this.state;
    const { realms } = this.state;
    let realmList = realms.length > 0
      && realms.map((item, i) => {
        return (
          <option key={i} value={item.realmId}>
            {item.label.label_en}
          </option>
        )
      }, this);

    let countryList = selCountries.length > 0
      && selCountries.map((item, i) => {
        return (
          <option key={i} value={item.realmCountryId}>
            {item.country.label.label_en}
          </option>
        )
      }, this);
    return (
      <div className="animated fadeIn">
        <Row>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardHeader>
                <i className="icon-note"></i><strong>Add Health Area</strong>{' '}
              </CardHeader>
              <CardBody>
                <Formik
                  initialValues={initialValues}
                  validate={validate(validationSchema)}
                  onSubmit={onSubmit}
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
                        <Form onSubmit={handleSubmit} noValidate name='simpleForm'>
                          <FormGroup>
                            <Label htmlFor="realmId">{i18n.t('static.healtharea.realm')}</Label>

                            <Input
                              type="select"
                              name="realmId"
                              id="realmId"
                              bsSize="lg"
                              valid={!errors.realmId}
                              invalid={touched.realmId && !!errors.realmId}
                              onChange={(e) => { handleChange(e); this.dataChange(e) }}
                              onBlur={handleBlur}
                              required
                              value={this.state.realmId}
                            >
                              <option value="0">Please select</option>
                              {realmList}
                            </Input>
                            <FormFeedback>{errors.realmId}</FormFeedback>
                          </FormGroup>
                          <FormGroup>
                            <Label>Country</Label>
                            <Input type="select"
                              name="countryId"
                              id="countryId"
                              bsSize="lg"
                              valid={!errors.countryId}
                              invalid={touched.countryId && !!errors.countryId}
                              onChange={this.handleChange}
                              onBlur={handleBlur}
                              required
                              multiple
                            >
                            <option value="0">Please select</option>
                            {countryList}
                            </Input>
                            <FormFeedback>{errors.countryId}</FormFeedback>
                          </FormGroup>
                          <FormGroup>
                            <Label for="healthArea">Health Area</Label>
                            <Input type="text"
                              name="healthAreaName"
                              id="healthAreaName"
                              valid={!errors.healthAreaName}
                              invalid={touched.healthAreaName && !!errors.healthAreaName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              required />
                            <FormFeedback>{errors.healthAreaName}</FormFeedback>
                          </FormGroup>

                          <FormGroup>
                            {/* <Button type="submit" color="primary" className="mr-1" disabled={isSubmitting || !isValid}>{isSubmitting ? 'Wait...' : 'Submit'}</Button> */}
                            <Button type="submit" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}>Submit</Button>
                            <Button type="reset" color="danger" className="mr-1">Cancel</Button>
                          </FormGroup>
                        </Form>
                      )} />
              </CardBody>
              <CardFooter>
                {/* <Button type="submit" size="md" color="primary"><i className="fa fa-dot-circle-o"></i> Submit</Button> */}
                {/* <Button type="reset" size="md" color="danger"><i className="fa fa-ban"></i> Cancel</Button> */}
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
  getCountryListByRealmId(realmId) {
    // let realmId = event.target.value;
    const selCountries = this.state.countries.filter(c => c.realm.realmId == realmId)
    console.log("selected values---", selCountries);
    this.setState({
      selCountries: selCountries
    });
  }
  submitClicked() {
    // if (navigator.onLine) {
    //   if (AuthenticationService.checkTypeOfSession()) {
    //     if ($("#healthAreaForm").valid()) {
    //       HealthAreaService.addHealthArea(this.state.healthArea)
    //         .then(response => {
    //           if (response.data.message != "Failed") {
    //             this.props.history.push(`/healthAreaList/${response.data.message}`)
    //           } else {
    //             this.setState({
    //               message: response.data.message
    //             })
    //           }
    //         })
    //         .catch(
    //           error => {
    //             switch (error.message) {
    //               case "Network Error":
    //                 this.setState({
    //                   message: error.message
    //                 })
    //                 break
    //               default:
    //                 this.setState({
    //                   message: error.response.data.message
    //                 })
    //                 break
    //             }
    //           }
    //         );
    //     }
    //   } else {
    //     alert("You can't change your session from online to offline or vice versa.");
    //   }
    // } else {
    //   alert("You must be Online.")
    // }
  }
  cancelClicked() {
    this.props.history.push(`/healthAreaList/` + "Action Canceled")
  }
}

export default AddHealthArea;
