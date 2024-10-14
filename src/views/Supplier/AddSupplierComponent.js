import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants';
import RealmService from "../../api/RealmService";
import SupplierService from "../../api/SupplierService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
let initialValues = {
  realmId: [],
  supplier: ""
}
const entityname = i18n.t('static.supplier.supplier');
/**
 * This const is used to define the validation schema for supplier details
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
  return Yup.object().shape({
    realmId: Yup.string()
      .required(i18n.t('static.common.realmtext')),
    supplier: Yup.string()
      .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
      .required(i18n.t('static.supplier.suppliertext'))
  })
}
/**
 * This component is used to display the supplier details in a form and allow user to add the details
 */
class AddSupplierComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      realms: [],
      supplier: {
        realm: {
          id: ''
        },
        label: {
          label_en: ''
        }
      },
      message: '',
      loading: true,
    }
    this.cancelClicked = this.cancelClicked.bind(this);
    this.dataChange = this.dataChange.bind(this);
    this.Capitalize = this.Capitalize.bind(this);
    this.resetClicked = this.resetClicked.bind(this);
    this.hideSecondComponent = this.hideSecondComponent.bind(this);
  }
  /**
   * This function is used to hide the messages that are there in div2 after 30 seconds
   */
  hideSecondComponent() {
    setTimeout(function () {
      document.getElementById('div2').style.display = 'none';
    }, 30000);
  }
  /**
   * This function is used to capitalize the first letter of the unit name
   * @param {*} str This is the name of the unit
   */
  Capitalize(str) {
    if (str != null && str != "") {
      return str.charAt(0).toUpperCase() + str.slice(1);
    } else {
      return "";
    }
  }
  /**
   * This function is called when some data in the form is changed
   * @param {*} event This is the on change event
   */
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
  /**
   * This function is used to get the realm list on page load
   */
  componentDidMount() {
    RealmService.getRealmListAll()
      .then(response => {
        var listArray = response.data;
        listArray.sort((a, b) => {
          var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
          var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
          return itemLabelA > itemLabelB ? 1 : -1;
        });
        this.setState({
          realms: listArray, loading: false
        })
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
              case 409:
                this.setState({
                  message: i18n.t('static.common.accessDenied'),
                  loading: false,
                  color: "#BA0C2F",
                });
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
    let realmId = AuthenticationService.getRealmId();
    if (realmId != -1) {
      initialValues = {
        realmId: realmId
      }
      let { supplier } = this.state;
      supplier.realm.id = realmId;
      document.getElementById("realmId").disabled = true;
      this.setState({
        supplier
      },
        () => {
        })
    }
  }
  /**
   * This is used to display the content
   * @returns This returns supplier details form
   */
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
        <AuthenticationServiceComponent history={this.props.history} />
        <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
        <Row>
          <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
            <Card>
              <Formik
                enableReinitialize={true}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting, setErrors }) => {
                  this.setState({
                    loading: true
                  })
                  SupplierService.addSupplier(this.state.supplier)
                    .then(response => {
                      if (response.status == 200) {
                        this.props.history.push(`/supplier/listSupplier/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                      } else {
                        this.setState({
                          message: response.data.messageCode, loading: false
                        },
                          () => {
                            this.hideSecondComponent();
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
                            case 409:
                              this.setState({
                                message: i18n.t('static.common.accessDenied'),
                                loading: false,
                                color: "#BA0C2F",
                              });
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
                    <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='supplierForm' autocomplete="off">
                      <CardBody style={{ display: this.state.loading ? "none" : "block" }}>
                        <FormGroup>
                          <Label htmlFor="realmId">{i18n.t('static.supplier.realm')}<span className="red Reqasterisk">*</span></Label>
                          <Input
                            type="select"
                            name="realmId"
                            id="realmId"
                            bsSize="sm"
                            valid={!errors.realmId && this.state.supplier.realm.id != ''}
                            invalid={touched.realmId && !!errors.realmId}
                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                            onBlur={handleBlur}
                            required
                            value={this.state.supplier.realm.id}
                          >
                            <option value="">{i18n.t('static.common.select')}</option>
                            {realmList}
                          </Input>
                          <FormFeedback className="red">{errors.realmId}</FormFeedback>
                        </FormGroup>
                        <FormGroup>
                          <Label for="supplier">{i18n.t('static.supplier.supplier')}<span className="red Reqasterisk">*</span></Label>
                          <Input type="text"
                            name="supplier"
                            id="supplier"
                            bsSize="sm"
                            valid={!errors.supplier && this.state.supplier.label.label_en != ''}
                            invalid={touched.supplier && !!errors.supplier}
                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                            onBlur={handleBlur}
                            required
                            value={this.Capitalize(this.state.supplier.label.label_en)}
                          />
                          <FormFeedback className="red">{errors.supplier}</FormFeedback>
                        </FormGroup>
                      </CardBody>
                      <div style={{ display: this.state.loading ? "block" : "none" }}>
                        <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                          <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status">
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardFooter>
                        <FormGroup>
                          <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                          <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
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
   * This function is called when cancel button is clicked and is redirected to list supplier screen
   */
  cancelClicked() {
    this.props.history.push(`/supplier/listSupplier/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
  }
  /**
   * This function is called when reset button is clicked to reset the supplier details
   */
  resetClicked() {
    let { supplier } = this.state;
    if (AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_SHOW_REALM_COLUMN')) {
      supplier.realm.id = ''
    }
    supplier.label.label_en = ''
    this.setState({
      supplier
    },
      () => { });
  }
}
export default AddSupplierComponent;
