import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'

import FundingSourceService from "../../api/FundingSourceService";
import RealmService from "../../api/RealmService";
import AuthenticationService from '../common/AuthenticationService.js';
import i18n from '../../i18n'
const initialValues = {
  fundingSourceId: [],
  subFundingSource: ""
}

const validationSchema = function (values) {
  return Yup.object().shape({
    realmId: Yup.string()
      .required(i18n.t('static.fundingsource.realmtext')),
    fundingSource: Yup.string()
      .required(i18n.t('static.fundingsource.fundingsourcetext'))
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
    let { fundingSource } = this.state;
    if (event.target.name == "realmId") {
      fundingSource.realm.realmId = event.target.value;
    }
    if (event.target.name == "fundingSource") {
      fundingSource.label.label_en = event.target.value;
    }
    this.setState({
      fundingSource
    },
      () => { });
  };

  touchAll(setTouched, errors) {
    setTouched({
      realmId: true,
      fundingSource: true
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

  componentDidMount() {
    AuthenticationService.setupAxiosInterceptors();
    RealmService.getRealmListAll()
      .then(response => {
        if (response.status == 200) {
          this.setState({ realms: response.data })
        } else {
          this.setState({ message: response.data.messageCode })
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
                <i className="icon-note"></i><strong>{i18n.t('static.fundingsource.fundingsourceaddttext')}</strong>{' '}
              </CardHeader>
              <Formik
                initialValues={initialValues}
                validate={validate(validationSchema)}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  console.log("Submit clicked");
                  FundingSourceService.addFundingSource(this.state.fundingSource)
                    .then(response => {
                      console.log("Response->", response);
                      if (response.status == 200) {
                        this.props.history.push(`/fundingSource/listFundingSource/${response.data.messageCode}`)
                      } else {
                        this.setState({ message: response.data.messageCode })
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
                      <Form onSubmit={handleSubmit} noValidate name='fundingSourceForm'>
                        <CardBody>
                          <FormGroup>
                            <Label htmlFor="realmId">{i18n.t('static.fundingsource.realm')}</Label>
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
                            <FormFeedback>{errors.realmId}</FormFeedback>
                          </FormGroup>
                          <FormGroup>
                            <Label for="fundingSource">{i18n.t('static.fundingsource.fundingsource')}</Label>
                            <Input type="text"
                              name="fundingSource"
                              id="fundingSource"
                              bsSize="sm"
                              valid={!errors.fundingSource}
                              invalid={touched.fundingSource && !!errors.fundingSource}
                              onChange={(e) => { handleChange(e); this.dataChange(e) }}
                              onBlur={handleBlur}
                              required />
                            <FormFeedback>{errors.fundingSource}</FormFeedback>
                          </FormGroup>
                        </CardBody>
                        <CardFooter>
                          <FormGroup>

                            <Button type="submit" size="sm" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            
                                                        &nbsp;
                          </FormGroup>
                        </CardFooter>
                      </Form>

                    )} />

            </Card>
          </Col>
        </Row>
        <div>
          <h6>{this.state.message}</h6>
          <h6>{this.props.match.params.messageCode}</h6>
        </div>
      </div>
    );
  }
  cancelClicked() {
    this.props.history.push(`/fundingSource/listFundingSource/` + "static.actionCancelled")
  }
}

export default AddFundingSourceComponent;
