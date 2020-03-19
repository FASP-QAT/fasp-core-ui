import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import FundingSourceService from "../../api/FundingSourceService";
import SubFundingSourceService from "../../api/SubFundingSourceService";
import AuthenticationService from '../common/AuthenticationService.js';

const initialValues = {
  fundingSourceId: [],
  subFundingSource: ""
}

const validationSchema = function (values) {
  return Yup.object().shape({
    fundingSourceId: Yup.string()
    .required( i18n.t('static.fundingsource.validfundingsource')),
    subFundingSource: Yup.string()
    .required( i18n.t('static.fundingsource.validsubfundingsource'))
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
  }

  Capitalize(str) {
    console.log("capitalize");
    if (str != null && str != "") {
      console.log("str---" + str)
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
    AuthenticationService.setupAxiosInterceptors();
    FundingSourceService.getFundingSourceListAll()
      .then(response => {
        this.setState({
          fundingSources: response.data
        })
      }).catch(
        error => {
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
        <h5>{i18n.t(this.state.message)}</h5>
        <Row>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              <CardHeader>
                <i className="icon-note"></i><strong>{i18n.t('static.subfundingsource.subfundingsourceadd')}</strong>{' '}
              </CardHeader>
              <Formik
                initialValues={initialValues}
                validate={validate(validationSchema)}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  SubFundingSourceService.addSubFundingSource(this.state.subFundingSource)
                    .then(response => {
                      if (response.data.status == "Success") {
                        this.props.history.push(`/subFundingSource/listSubFundingSource/${response.data.message}`)
                      } else {
                        this.setState({
                          message: response.data.message
                        })
                      }
                    })
                    .catch(
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
                            <Label htmlFor="fundingSourceId">{i18n.t('static.subfundingsource.fundingsource')}</Label>
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
                              value={this.state.fundingSourceId}
                            >
                              <option value="0">{i18n.t('static.common.select')}</option>
                              {fundingSourceList}
                            </Input>
                            <FormFeedback>{errors.fundingSourceId}</FormFeedback>
                          </FormGroup>
                          <FormGroup>
                            <Label for="subFundingSource">{i18n.t('static.subfundingsource.subfundingsource')}</Label>
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
    this.props.history.push(`/subFundingSource/listSubFundingSource/` + "Action Canceled")
  }
}

export default AddSubFundingSourceComponent;
