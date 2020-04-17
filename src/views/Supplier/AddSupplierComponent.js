import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button,FormText ,FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import SupplierService from "../../api/SupplierService";
import RealmService from "../../api/RealmService";
import AuthenticationService from '../Common/AuthenticationService.js';

const initialValues = {
  realmId: [],
  supplier: ""
}
const entityname=i18n.t('static.supplier.supplier');
const validationSchema = function (values) {
  return Yup.object().shape({
    realmId: Yup.string()
      .required(i18n.t('static.common.realmtext')),
    supplier: Yup.string()
      .required(i18n.t('static.supplier.suppliertext'))

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
class AddSupplierComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realms: [],
      supplier: {
        realm: {
        },
        label: {
        }
      },
      message: ''
    }
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
    this.Capitalize = this.Capitalize.bind(this);
  }
  Capitalize(str) {
    if (str != null && str != "") {
        return str.charAt(0).toUpperCase() + str.slice(1);
    } else {
        return "";
    }
}

  dataChange(event) {
    let { supplier } = this.state;
    if (event.target.name == "realmId") {
      supplier.realm.id = event.target.value;
    }
    if (event.target.name == "supplier") {
      supplier.label.label_en = event.target.value;
    }
    this.setState({
      supplier
    },
      () => { });
  };

  touchAll(setTouched, errors) {
    setTouched({
      realmId: true,
      supplier: true
    }
    );
    this.validateForm(errors);
  }
  validateForm(errors) {
    this.findFirstError('supplierForm', (fieldName) => {
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
                  SupplierService.addSupplier(this.state.supplier)
                    .then(response => {
                      console.log("Response->", response);
                      if (response.status ==200) {
                        this.props.history.push(`/supplier/listSupplier/`+i18n.t(response.data.messageCode,{entityname}))
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
                      <Form onSubmit={handleSubmit} noValidate name='supplierForm'>
                        <CardBody>
                          <FormGroup>
                            <Label htmlFor="realmId">{i18n.t('static.supplier.realm')}</Label>
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
                                value={this.state.id}
                              >
                                <option value="0">{i18n.t('static.common.select')}</option>
                                {realmList}
                              </Input>
                               <FormText className="red">{errors.realmId}</FormText>
                          </FormGroup>
                          <FormGroup>
                            <Label for="supplier">{i18n.t('static.supplier.supplier')}</Label>
                              <Input type="text"
                                name="supplier"
                                id="supplier"
                                bsSize="sm"
                                valid={!errors.supplier}
                                invalid={touched.supplier && !!errors.supplier}
                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                onBlur={handleBlur}
                                required
                                value={this.Capitalize(this.state.supplier.label.label_en)}
                                />
                            <FormText className="red">{errors.supplier}</FormText>
                          </FormGroup>
                        </CardBody>
                        <CardFooter>
                          <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
    this.props.history.push(`/supplier/listSupplier/`+i18n.t('static.message.cancelled',{entityname}))
  }
}

export default AddSupplierComponent;
