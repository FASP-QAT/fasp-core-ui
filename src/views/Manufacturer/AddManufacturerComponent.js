import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button,FormText ,FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import ManufacturerService from "../../api/ManufacturerService";
import RealmService from "../../api/RealmService";
import AuthenticationService from '../Common/AuthenticationService.js';

const initialValues = {
  realmId: [],
  manufacturer: ""
}
const entityname=i18n.t('static.manufacturer.manufacturer');
const validationSchema = function (values) {
  return Yup.object().shape({
    realmId: Yup.string()
      .required(i18n.t('static.manufaturer.realmtext')),
    manufacturer: Yup.string()
      .required(i18n.t('static.manufaturer.manufaturertext'))

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
class AddManufacturerComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realms: [],
      manufacturer: {
        realm: {
        },
        label: {
        }
      },
      message: ''
    }
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
  }

  dataChange(event) {
    let { manufacturer } = this.state;
    if (event.target.name == "realmId") {
      manufacturer.realm.realmId = event.target.value;
    }
    if (event.target.name == "manufacturer") {
      manufacturer.label.label_en = event.target.value;
    }
    this.setState({
      manufacturer
    },
      () => { });
  };

  touchAll(setTouched, errors) {
    setTouched({
      realmId: true,
      manufacturer: true
    }
    );
    this.validateForm(errors);
  }
  validateForm(errors) {
    this.findFirstError('manufacturerForm', (fieldName) => {
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
    RealmService.getRealmListAll()
      .then(response => {
        this.setState({
          realms: response.data
        })
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
                      break;
              }
          }
      }
  );
  }

  render() {
    const { realms } = this.state;
    let realmList = realms.length > 0
      && realms.map((item, i) => {
        return (
          <option key={i} value={item.realmId}>
            {item.label.label_en}
          </option>
        )
      }, this);
    return (
      <div className="animated fadeIn">
        <Row>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardHeader>
                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity',{entityname})}</strong>{' '}
              </CardHeader>
              <Formik
                initialValues={initialValues}
                validate={validate(validationSchema)}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  console.log("Submit clicked");
                  ManufacturerService.addManufacturer(this.state.manufacturer)
                    .then(response => {
                      console.log("Response->", response);
                      if (response.status ==200) {
                        this.props.history.push(`/manufacturer/listManufacturer/`+i18n.t(response.data.messageCode,{entityname}))
                      } else {
                        this.setState({
                          message: response.data.messagCodee
                        })
                      }
                    })
                    .catch(
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
                      <Form onSubmit={handleSubmit} noValidate name='manufacturerForm'>
                        <CardBody>
                          <FormGroup>
                            <Label htmlFor="realmId">{i18n.t('static.manufacturer.realm')}</Label>
                              <Input
                                type="select"
                                name="realmId"
                                id="realmId"
                                bsSize="sm"
                                valid={!errors.realmId}
                                invalid={touched.realmId && !!errors.realmId}
                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                onBlur={handleBlur}
                                required
                                value={this.state.realmId}
                              >
                                <option value="0">{i18n.t('static.common.select')}</option>
                                {realmList}
                              </Input>
                               <FormText className="red">{errors.realmId}</FormText>
                          </FormGroup>
                          <FormGroup>
                            <Label for="manufacturer">{i18n.t('static.manufacturer.manufacturer')}</Label>
                              <Input type="text"
                                name="manufacturer"
                                id="manufacturer"
                                bsSize="sm"
                                valid={!errors.manufacturer}
                                invalid={touched.manufacturer && !!errors.manufacturer}
                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                onBlur={handleBlur}
                                required />
                            <FormText className="red">{errors.manufacturer}</FormText>
                          </FormGroup>
                        </CardBody>
                        <CardFooter>
                          <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;
                          </FormGroup>
                        </CardFooter>
                      </Form>

                    )} />

            </Card>
          </Col>
        </Row>
        <div>
        <h6>{i18n.t(this.state.message)}</h6>
       <h6>{i18n.t(this.props.match.params.message)}</h6>
        </div>
      </div>
    );
  }
  cancelClicked() {
    this.props.history.push(`/manufacturer/listManufacturer/`+i18n.t('static.message.cancelled',{entityname}))
  }
}

export default AddManufacturerComponent;
