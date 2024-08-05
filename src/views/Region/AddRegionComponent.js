import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants';
import RealmCountryService from "../../api/RealmCountryService.js";
import RegionService from "../../api/RegionService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Capitalize } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.region.region');
// Initial values for form fields
const initialValues = {
  realmCountryId: [],
  region: ""
}
/**
 * Defines the validation schema for region details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
  return Yup.object().shape({
    realmCountryId: Yup.string()
      .required(i18n.t('static.region.validcountry')),
    region: Yup.string()
      .required(i18n.t('static.region.validregion'))
  })
}
/**
 * Component for adding region details.
 */
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
    this.resetClicked = this.resetClicked.bind(this);
  }
  /**
   * Handles data change in the form.
   * @param {Event} event - The change event.
   */
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
  /**
   * Fetches realm country list on component mount.
   */
  componentDidMount() {
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
              message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
  /**
   * Renders the region details form.
   * @returns {JSX.Element} - Region details form.
   */
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
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  RegionService.addRegion(this.state.region)
                    .then(response => {
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
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                          <FormFeedback className="red">{errors.realmCountryId}</FormFeedback>
                        </FormGroup>
                        <FormGroup>
                          <Label for="region">{i18n.t('static.region.region')}<span className="red Reqasterisk">*</span></Label>
                          <Input type="text"
                            name="region"
                            id="region"
                            bsSize="sm"
                            valid={!errors.region && this.state.region.label.label_en != ''}
                            invalid={touched.region && !!errors.region}
                            onChange={(e) => { handleChange(e); this.dataChange(e); Capitalize(e.target.value) }}
                            onBlur={handleBlur}
                            value={this.state.region.label.label_en}
                            required />
                          <FormFeedback className="red">{errors.region}</FormFeedback>
                        </FormGroup>
                      </CardBody>
                      <CardFooter>
                        <FormGroup>
                          <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                          <Button type="reset" size="md" color="success" className="float-right mr-1" onClick={this.resetClicked}><i className="fa fa-times"></i> {i18n.t('static.common.reset')}</Button>
                          <Button type="submit" size="md" color="success" className="float-right mr-1" disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
  /**
   * Redirects to the list region screen when cancel button is clicked.
   */
  cancelClicked() {
    this.props.history.push(`/region/listRegion/` + i18n.t('static.message.cancelled', { entityname }))
  }
  /**
   * Resets the region details when reset button is clicked.
   */
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
