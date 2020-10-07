import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import FundingSourceService from "../../api/FundingSourceService";
import SubFundingSourceService from "../../api/SubFundingSourceService";
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'

const initialValues = {
  fundingSourceId: [],
  subFundingSource: ""
}
const entityname = i18n.t('static.subfundingsource.subfundingsource');
const validationSchema = function (values) {
  return Yup.object().shape({
    fundingSourceId: Yup.string()
      .required(i18n.t('static.fundingsource.validfundingsource')),
    subFundingSource: Yup.string()
      .required(i18n.t('static.fundingsource.validsubfundingsource'))
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
class AddSubFundingSourceComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fundingSources: [],
      subFundingSource: {
        fundingSource: {
        },
        label: {

        }
      },
      message: ''
    }
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
    this.Capitalize = this.Capitalize.bind(this);
    this.resetClicked = this.resetClicked.bind(this);
  }

  Capitalize(str) {
    if (str != null && str != "") {
      return str.charAt(0).toUpperCase() + str.slice(1);
    } else {
      return "";
    }
  }


  dataChange(event) {
    let { subFundingSource } = this.state;
    if (event.target.name == "fundingSourceId") {
      subFundingSource.fundingSource.fundingSourceId = event.target.value;
    }
    if (event.target.name == "subFundingSource") {
      subFundingSource.label.label_en = event.target.value;
    }
    this.setState({
      subFundingSource
    },
      () => { });
  };

  touchAll(setTouched, errors) {
    setTouched({
      fundingSourceId: true,
      subFundingSource: true
    }
    )
    this.validateForm(errors)
  }
  validateForm(errors) {
    this.findFirstError('subFundingSourceForm', (fieldName) => {
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
    FundingSourceService.getFundingSourceListAll()
      .then(response => {
        if (response.status == 200) {
          this.setState({
            fundingSources: response.data
          })
        }
      })
      .catch(
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

  render() {
    const { fundingSources } = this.state;
    let fundingSourceList = fundingSources.length > 0
      && fundingSources.map((item, i) => {
        return (
          <option key={i} value={item.fundingSourceId}>
            {item.label.label_en}
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
                  SubFundingSourceService.addSubFundingSource(this.state.subFundingSource)
                    .then(response => {
                      if (response.status == 200) {
                        this.props.history.push(`/subFundingSource/listSubFundingSource/` + i18n.t(response.data.messageCode, { entityname }))
                      }
                    })
                    .catch(
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
                    setTouched
                  }) => (
                      <Form onSubmit={handleSubmit} noValidate name='subFundingSourceForm'>
                        <CardBody>
                          <FormGroup>
                            <Label htmlFor="fundingSourceId">{i18n.t('static.subfundingsource.fundingsource')}<span className="red Reqasterisk">*</span></Label>
                            <Input
                              type="select"
                              name="fundingSourceId"
                              id="fundingSourceId"
                              bsSize="sm"
                              valid={!errors.fundingSourceId}
                              invalid={touched.fundingSourceId && !!errors.fundingSourceId}
                              onChange={(e) => { handleChange(e); this.dataChange(e) }}
                              onBlur={handleBlur}
                              required
                              value={this.state.subFundingSource.fundingSource.fundingSourceId}
                            >
                              <option value="">{i18n.t('static.common.select')}</option>
                              {fundingSourceList}
                            </Input>
                            <FormFeedback>{errors.fundingSourceId}</FormFeedback>
                          </FormGroup>
                          <FormGroup>
                            <Label for="subFundingSource">{i18n.t('static.subfundingsource.subfundingsource')}<span className="red Reqasterisk">*</span></Label>
                            <Input type="text"
                              name="subFundingSource"
                              id="subFundingSource"
                              bsSize="sm"
                              valid={!errors.subFundingSource}
                              invalid={touched.subFundingSource && !!errors.subFundingSource}
                              onChange={(e) => { handleChange(e); this.dataChange(e) }}
                              onBlur={handleBlur}
                              required
                              value={this.Capitalize(this.state.subFundingSource.label.label_en)}
                            />
                            <FormFeedback>{errors.subFundingSource}</FormFeedback>
                          </FormGroup>
                        </CardBody>
                        <CardFooter>
                          <FormGroup>
                            <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                            <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.resetClicked}><i className="fa fa-times"></i> {i18n.t('static.common.reset')}</Button>
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
    this.props.history.push(`/subFundingSource/listSubFundingSource/` + i18n.t('static.message.cancelled', { entityname }))
  }
  resetClicked() {
    let { subFundingSource } = this.state;

    subFundingSource.fundingSource.fundingSourceId = ''
    subFundingSource.label.label_en = ''

    this.setState({
      subFundingSource
    },
      () => { });
  }
}

export default AddSubFundingSourceComponent;
