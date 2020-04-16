import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import getLabelText from '../../CommonComponent/getLabelText'
import FundingSourceService from "../../api/FundingSourceService";
import RealmService from "../../api/RealmService";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n'
const initialValues = {
  fundingSourceId: [],
  subFundingSource: ""
}
const entityname = i18n.t('static.fundingsource.fundingsource');
const validationSchema = function (values) {
  return Yup.object().shape({
    realmId: Yup.string()
      .required(i18n.t('static.common.realmtext')),
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
      message: '',
      lang: localStorage.getItem('lang')
    }
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
    this.Capitalize = this.Capitalize.bind(this);
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
  Capitalize(str) {
    if (str != null && str != "") {
      return str.charAt(0).toUpperCase() + str.slice(1);
    } else {
      return "";
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
            {getLabelText(item.label,this.state.lang)}
          </option>
        )
      }, this);
    return (
      <div className="animated fadeIn">
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
                  console.log("Submit clicked");
                  FundingSourceService.addFundingSource(this.state.fundingSource)
                    .then(response => {
                      console.log("Response->", response);
                      if (response.status == 200) {
                        this.props.history.push(`/fundingSource/listFundingSource/` + i18n.t(response.data.messageCode, { entityname }))
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
                            <Label htmlFor="realmId">{i18n.t('static.fundingsource.realm')}</Label><Input
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
                              valid={!errors.fundingSource}
                              invalid={touched.fundingSource && !!errors.fundingSource}
                              onChange={(e) => { handleChange(e); this.dataChange(e) }}
                              onBlur={handleBlur}
                              value={this.Capitalize(this.state.fundingSource.label.label_en)}
                              required />
                            <FormFeedback className="red">{errors.fundingSource}</FormFeedback>
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
    this.props.history.push(`/fundingSource/listFundingSource/` + i18n.t('static.message.cancelled', { entityname }))
  }
}

export default AddFundingSourceComponent;
