import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Button, ButtonDropdown, CardBody, CardGroup, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Form, FormFeedback, Input, InputGroup, InputGroupAddon, InputGroupText, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import InnerBgImg from '../../../../src/assets/img/bg-image/bg-login.jpg';
import LoginService from '../../../api/LoginService';
import image3 from '../../../assets/img/PEPFAR-logo.png';
import imageHelp from '../../../assets/img/help-icon.png';
import i18n from '../../../i18n';
import axios from 'axios';
import { getDatabase } from "../../../CommonComponent/IndexedDbFunctions";
import { isSiteOnline } from '../../../CommonComponent/JavascriptCommonFunctions';
import getLabelText from '../../../CommonComponent/getLabelText';
import { API_URL, APP_VERSION_REACT, INDEXED_DB_NAME, INDEXED_DB_VERSION, JEXCEL_DEFAULT_PAGINATION, SECRET_KEY, QAT_HELPDESK_CUSTOMER_PORTAL_URL } from '../../../Constants.js';
import MasterSyncService from '../../../api/MasterSyncService.js';
import image1 from '../../../assets/img/QAT-login-logo.png';
import image4 from '../../../assets/img/USAID-presidents-malaria-initiative.png';
import image2 from '../../../assets/img/wordmark.png';
import AuthenticationService from '../../Common/AuthenticationService.js';
// Initial values for form fields
const initialValues = {
  emailId: "",
  password: ""
}
/**
 * Defines the validation schema for login page.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
  return Yup.object().shape({
    emailId: Yup.string()
      .email(i18n.t('static.user.invalidemail'))
      .required(i18n.t('static.login.usernametext')),
    password: Yup.string()
      .required(i18n.t('static.login.passwordtext'))
  })
}
/**
 * Component for Login screen.
 */
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      loading: false,
      apiVersion: '',
      apiVersionForDisplay: '',
      dropdownOpen: new Array(19).fill(false),
      icon: AuthenticationService.getIconAndStaticLabel("icon"),
      staticLabel: AuthenticationService.getIconAndStaticLabel("label"),
      languageList: [],
      updatedSyncDate: '',
      lang: localStorage.getItem('lastLoggedInUsersLanguage'),
      loginOnline: true,
      popupShown: 0
    }
    this.forgotPassword = this.forgotPassword.bind(this);
    this.incorrectPassmessageHide = this.incorrectPassmessageHide.bind(this);
    this.logoutMessagehide = this.logoutMessagehide.bind(this);
    this.toggle = this.toggle.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
    this.getLanguageList = this.getLanguageList.bind(this);
    this.getAllLanguages = this.getAllLanguages.bind(this);
    this.dataChangeCheckbox = this.dataChangeCheckbox.bind(this);
  }
  /**
   * Reterives language list from indexed db
   */
  getAllLanguages() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: '#BA0C2F'
      })
    }.bind(this);
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['language'], 'readwrite');
      var program = transaction.objectStore('language');
      var getRequest1 = program.getAll();
      getRequest1.onerror = function (event) {
        this.setState({
          message: i18n.t('static.program.errortext'),
          color: '#BA0C2F',
          loading: false
        })
      }.bind(this);
      getRequest1.onsuccess = function (event) {
        var languageList = [];
        languageList = getRequest1.result;
        this.setState({
          languageList
        });
        i18n.changeLanguage(AuthenticationService.getDefaultUserLanguage())
      }.bind(this);
    }.bind(this);
  }
  /**
   * Sync language from server
   */
  getLanguageList() {
    var db1;
    getDatabase();
    var openRequest = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);
    openRequest.onerror = function (event) {
      this.setState({
        message: i18n.t('static.program.errortext'),
        color: '#BA0C2F'
      })
    }.bind(this);
    var lastSyncDateRealm = "2020-01-01 00:00:00";
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['language'], 'readwrite');
      var program = transaction.objectStore('language');
      delete axios.defaults.headers.common["Authorization"];
        MasterSyncService.getLanguageListForSync(lastSyncDateRealm).then(response => {
          var transaction = db1.transaction(['language'], 'readwrite');
          var program = transaction.objectStore('language');
          var json = (response.data);
          for (var i = 0; i < json.length; i++) {
            var psuccess = program.put(json[i]);
          }
          this.getAllLanguages();
        }).catch(error=>{
          this.getAllLanguages();  
        });
    }.bind(this)
  }
  /**
   * Changes the language of the application.
   * Sets the selected language in local storage for persistence.
   * @param {*} lang The selected language code.
   * @param {*} icon The icon representing the selected language.
   * @param {*} staticLabel The static labels in the selected language.
   */
  changeLanguage(lang, icon, staticLabel) {
    localStorage.setItem('lastLoggedInUsersLanguage', lang);
    localStorage.setItem('lastLoggedInUsersLanguageChanged', true);
    this.setState({ icon, staticLabel })
    i18n.changeLanguage(lang)
    window.location.reload();
  }
  /**
   * Calls getLanguageList and other functions on component mount
   */
  componentDidMount() {
    localStorage.setItem("loginOnline", this.state.loginOnline);
    delete axios.defaults.headers.common["Authorization"];
    this.logoutMessagehide();
    AuthenticationService.clearUserDetails()
    AuthenticationService.setRecordCount(JEXCEL_DEFAULT_PAGINATION);
    this.getLanguageList();
    i18n.changeLanguage(AuthenticationService.getDefaultUserLanguage())
    this.checkIfApiIsActive();
  }
  /**
   * Function to check if API server is online
   */
  checkIfApiIsActive() {
    var apiVersionForDisplay = "";
    LoginService.getApiVersion()
      .then(response => {
        if (response != null && response != "") {
          this.setState({
            apiVersionForDisplay: response.data.app.version,
            apiVersion: response.data.app.version,
          }, () => {
            if (this.state.popupShown == 0 && response.data.app.frontEndVersion != APP_VERSION_REACT) {
              this.setState({
                popupShown: 1
              })
              confirmAlert({
                message: i18n.t('static.coreui.oldVersion'),
                buttons: [
                  {
                    label: i18n.t('static.report.ok')
                  }
                ]
              });
            }
            setTimeout(function () {
              this.checkIfApiIsActive();
            }.bind(this), 180000);
          })
        } else {
        }
      }).catch(error => {
        apiVersionForDisplay = "Offline"
        this.setState({
          apiVersionForDisplay: apiVersionForDisplay
        })
        setTimeout(function () {
          this.checkIfApiIsActive();
        }.bind(this), 180000);
      })
    this.setState({
      apiVersionForDisplay: apiVersionForDisplay
    })
  }
  /**
   * Redirect to forgot password screen after click on forgot password
   */
  forgotPassword() {
    if (isSiteOnline()) {
      this.props.history.push(`/forgotPassword`)
    } else {
      confirmAlert({
        message: i18n.t('static.forgotPassword.offline'),
        buttons: [
          {
            label: i18n.t('static.common.close')
          }
        ]
      });
    }
  }
  /**
   * Hides message after 30 seconds
   */
  incorrectPassmessageHide() {
    setTimeout(function () { document.getElementById('div2').style.display = 'none'; }, 30000);
    var incorrectPassword = document.getElementById('div2');
    incorrectPassword.style.color = '#BA0C2F';
    this.setState({
      message: ''
    },
      () => {
        document.getElementById('div2').style.display = 'block';
      });
  }
  /**
   * Handles data change in the form.
   * @param {Event} event - The change event.
   */
  dataChangeCheckbox(event) {
    this.setState({
      loginOnline: (event.target.checked ? true : false)
    })
  }
  /**
   * Hides message after 30 seconds
   */
  logoutMessagehide() {
    setTimeout(function () { document.getElementById('div1').style.display = 'none'; }, 30000);
    var logoutMessage = document.getElementById('div1');
    var htmlContent = logoutMessage.innerHTML;
    if (htmlContent.includes('Cancelled') || htmlContent.includes('cancelled') || htmlContent.includes('sessionChange') || htmlContent.includes('change your session') || htmlContent.includes('expire') || htmlContent.includes('exceeded the maximum')) {
      logoutMessage.style.color = '#BA0C2F';
    }
    else if (htmlContent.includes('Access Denied')) {
      logoutMessage.style.color = '#BA0C2F';
    }
    else {
      logoutMessage.style.color = 'green';
    }
    this.setState({
      message: ''
    },
      () => {
        document.getElementById('div1').style.display = 'block';
        document.getElementById('div2').style.display = 'block';
      });
  }
  /**
   * Toggles the dropdown state at the specified index in the component's state.
   * @param {number} i - The index of the dropdown to toggle.
   */
  toggle(i) {
    const newArray = this.state.dropdownOpen.map((element, index) => { return (index === i ? !element : false); });
    this.setState({
      dropdownOpen: newArray,
    });
  }
  /**
   * Renders the login form.
   * @returns {JSX.Element} - Login form.
   */
  render() {
    return (
      <div className="main-content flex-row align-items-center bg-height">
        <div className="Login-component" style={{ backgroundImage: "url(" + InnerBgImg + ")" }}>
          <Container className="container-login">
            <Row className="justify-content-center">
              <Col className="float-right pr-5">
                <div className='row align-items-center pt-1 pr-3 float-right'>
                  <div className='col-md-12 col-sm-12'>
                    <a href={QAT_HELPDESK_CUSTOMER_PORTAL_URL} target="_blank" title={i18n.t('static.ticket.help')}>
                      <img src={imageHelp} className="HelpIcon" title={i18n.t('static.user.usermanual')} style={{ width: '30px', height: '30px' }} /> 
                      {i18n.t('static.ticket.header')}
                    </a>
                  </div>
                </div>
              </Col>
              <Col className="col-md-1 float-right pr-5">
                <div className="float-right">
                  <ButtonDropdown isOpen={this.state.dropdownOpen[0]} toggle={() => { this.toggle(0); }}>
                    <DropdownToggle caret className="en-btnlogin">
                      {this.state.languageLabel}
                      <i className={this.state.icon}></i>  &nbsp;{i18n.t(this.state.staticLabel)}
                    </DropdownToggle>
                    <DropdownMenu right>
                                            {this.state.languageList != null && this.state.languageList != '' && this.state.languageList.filter(c => c.active).map(
                        language =>
                          <>
                            <DropdownItem onClick={this.changeLanguage.bind(this, language.languageCode, "flag-icon flag-icon-" + language.countryCode, getLabelText(language.label, this.state.lang))}>
                              <i className={"flag-icon flag-icon-" + language.countryCode}></i>  {getLabelText(language.label, this.state.lang)}
                            </DropdownItem>
                          </>
                      )}
                                          </DropdownMenu>
                  </ButtonDropdown>
                </div>
              </Col>
              <Col md="12">
                <div className="upper-logo logo-MarginTop">
                  <img src={image1} className="img-fluid " />
                </div>
              </Col>
              <Col lg="5" md="7" xl="4">
                <CardGroup>
                  <div className="p-4 Login-card card-marginTop" >
                    <CardBody>
                      <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                          var emailId = values.emailId;
                          var password = values.password;
                          AuthenticationService.setRecordCount(JEXCEL_DEFAULT_PAGINATION);
                          localStorage.setItem("sessionTimedOut", 0);
                          localStorage.setItem("sessionChanged", 0)
                          localStorage.setItem("loginOnline", this.state.loginOnline);
                          if (this.state.loginOnline == true && isSiteOnline()) {
                            var languageCode = AuthenticationService.getDefaultUserLanguage();
                            var lastLoggedInUsersLanguageChanged = localStorage.getItem('lastLoggedInUsersLanguageChanged');
                            LoginService.authenticate(emailId, password, languageCode, lastLoggedInUsersLanguageChanged)
                              .then(response => {
                                var decoded = jwt_decode(response.data.token);
                                let keysToRemove = ["token-" + decoded.userId, "user-" + decoded.userId, "curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken", "lastLoggedInUsersLanguage", "sessionType"];
                                keysToRemove.forEach(k => localStorage.removeItem(k))
                                decoded.user.syncExpiresOn = moment().format("YYYY-MM-DD HH:mm:ss");
                                decoded.user.apiVersion = this.state.apiVersion;
                                localStorage.setItem('token-' + decoded.userId, CryptoJS.AES.encrypt((response.data.token).toString(), `${SECRET_KEY}`));
                                localStorage.setItem('typeOfSession', "Online");
                                localStorage.setItem('sessionType', "Online");
                                localStorage.setItem('lastActionTaken', CryptoJS.AES.encrypt((moment(new Date()).format("YYYY-MM-DD HH:mm:ss")).toString(), `${SECRET_KEY}`));
                                localStorage.setItem('curUser', CryptoJS.AES.encrypt((decoded.userId).toString(), `${SECRET_KEY}`));
                                localStorage.setItem('lang', decoded.user.language.languageCode);
                                localStorage.setItem('i18nextLng', decoded.user.language.languageCode);
                                localStorage.setItem('lastLoggedInUsersLanguage', decoded.user.language.languageCode);
                                localStorage.setItem("lastFocus", new Date());
                                localStorage.setItem("tokenSetTime", new Date());
                                AuthenticationService.setLanguageChangeFlag();
                                i18n.changeLanguage(decoded.user.language.languageCode);
                                AuthenticationService.setupAxiosInterceptors();
                                if (decoded.user.agreementAccepted) {
                                  this.props.history.push(`/syncProgram`)
                                } else {
                                  this.props.history.push(`/userAgreement`)
                                }
                              })
                              .catch(
                                error => {
                                  if (error.message === "Network Error") {
                                    this.setState({
                                      message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                    });
                                  } else {
                                    switch (error.response ? error.response.status : "") {
                                      case 500:
                                      case 401:
                                      case 404:
                                      case 412:
                                        this.setState({ message: error.response.data.messageCode });
                                        break;
                                      case 406:
                                        this.props.history.push({
                                          pathname: "/updateExpiredPassword",
                                          state: {
                                            emailId
                                          }
                                        });
                                        break;
                                      default:
                                        this.setState({ message: 'static.unkownError' });
                                        break;
                                    }
                                  }
                                }
                              );
                          }
                          else {
                            var decryptedPassword = AuthenticationService.isUserLoggedIn(emailId);
                            if (decryptedPassword != "") {
                              bcrypt.compare(password, decryptedPassword, function (err, res) {
                                if (err) {
                                  this.setState({ message: 'static.label.labelFail' });
                                }
                                if (res) {
                                  let tempUser = localStorage.getItem("tempUser");
                                  let user = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + tempUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                                  let keysToRemove = ["curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken", "lastLoggedInUsersLanguage", "sessionType"];
                                  keysToRemove.forEach(k => localStorage.removeItem(k))
                                  localStorage.setItem('typeOfSession', "Offline");
                                  localStorage.setItem('sessionType', "Offline");
                                  localStorage.setItem('curUser', CryptoJS.AES.encrypt((user.userId).toString(), `${SECRET_KEY}`));
                                  localStorage.setItem('lang', user.language.languageCode);
                                  localStorage.setItem('i18nextLng', user.language.languageCode);
                                  localStorage.setItem('lastLoggedInUsersLanguage', user.language.languageCode);
                                  localStorage.setItem("lastFocus", new Date());
                                  i18n.changeLanguage(user.language.languageCode);
                                  localStorage.removeItem("tempUser");
                                  if (AuthenticationService.syncExpiresOn() == true) {
                                    this.props.history.push(`/logout/static.message.syncExpiresOn`)
                                  } else {
                                    localStorage.setItem('lastActionTaken', CryptoJS.AES.encrypt((moment(new Date()).format("YYYY-MM-DD HH:mm:ss")).toString(), `${SECRET_KEY}`));
                                    this.props.history.push(`/ApplicationDashboard`)
                                  }
                                } else {
                                  this.setState({ message: 'static.message.login.invalidCredentials' });
                                }
                              }.bind(this));
                            }
                            else {
                              this.setState({ message: 'static.message.login.invalidCredentials' });
                            }
                          }
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
                            <Form onSubmit={handleSubmit} noValidate name="loginForm">
                              <h5 id="div1">{i18n.t(this.props.match.params.message)}</h5>
                              <h5 id="div2">{i18n.t(this.state.message)}</h5>
                              <p className="text-muted login-text">{i18n.t('static.login.signintext')}</p>
                              <InputGroup className="mb-3">
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>
                                    <i className="cui-user Loginicon"></i>
                                  </InputGroupText>
                                </InputGroupAddon>
                                <Input
                                  type="text"
                                  placeholder={i18n.t('static.login.emailId')}
                                  autoComplete="emailId"
                                  name="emailId"
                                  id="emailId"
                                  valid={!errors.emailId}
                                  invalid={touched.emailId && !!errors.emailId}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  required />
                                <FormFeedback>{errors.emailId}</FormFeedback>
                              </InputGroup>
                              <InputGroup className="mb-3">
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>
                                    <i className="cui-lock-locked Loginicon"></i>
                                  </InputGroupText>
                                </InputGroupAddon>
                                <Input
                                  type="password"
                                  placeholder={i18n.t('static.login.password')}
                                  autoComplete="current-password"
                                  name="password"
                                  id="password"
                                  valid={!errors.password}
                                  invalid={touched.password && !!errors.password}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  required />
                                <FormFeedback>{errors.password}</FormFeedback>
                              </InputGroup>
                              {this.state.apiVersionForDisplay!="Offline" && <Row>
                                <InputGroup check inline className="mb-4 ml-3">
                                  <Input
                                    type="checkbox"
                                    id="loginOnline"
                                    name="loginOnline"
                                    style={{
                                      position: "relative",
                                      marginTop: "0.2rem",
                                      marginLeft: "0rem"
                                    }}
                                    checked={this.state.loginOnline}
                                    onChange={(e) => { this.dataChangeCheckbox(e) }}
                                  />
                                  <Label
                                    className="form-check-label ml-2"
                                    check htmlFor="inline-radio2">
                                    <b>{i18n.t('static.login.loginOnline')}</b>
                                  </Label>
                                </InputGroup>
                              </Row>}
                              <Row>
                                <Col xs="6">
                                  <Button type="submit" color="primary" className="px-4" onClick={() => {this.incorrectPassmessageHide() }} >{i18n.t('static.login.login')}</Button>
                                </Col>
                                <Col xs="6" className="text-right">
                                  <Button type="button" color="link" className="px-0" onClick={this.forgotPassword}>{i18n.t('static.login.forgotpassword')}?</Button>
                                </Col>
                              </Row>
                            </Form>
                          )} />
                    </CardBody>
                  </div>
                </CardGroup>
                <div className='row align-items-center'>
                  <div className='col-md-6 col-sm-6'>
                    <a href={QAT_HELPDESK_CUSTOMER_PORTAL_URL} target="_blank" title={i18n.t('static.ticket.help')}>
                      <img src={imageHelp} className="HelpIcon" title={i18n.t('static.user.usermanual')} style={{ width: '30px', height: '30px' }} /> 
                      {i18n.t('static.ticket.header')}
                    </a>
                  </div>
                  <div className='col-md-6 col-sm-12'>
                    <h5 className="text-right versionColor">{i18n.t('static.common.version')}{APP_VERSION_REACT} | {this.state.apiVersionForDisplay}</h5>
                  </div>
                </div>
              </Col>
              <Col xs="12" className="Login-bttom ">
                <CardBody>
                  <p className="Login-p">The USAID Global Health Supply Chain Program-Procurement and Supply
                    Management (GHSC-PSM) project is funded under USAID Contract No. AID-OAA-I-15-0004. GHSC-PSM connects
                    technical solutions and proven commercial processes to promote efficient and cost-effective
                    health supply chains worldwide. Our goal is to ensure uninterrupted supplies of health
                    commodities to save lives and create a healthier future for all. The project purchases
                    and delivers health commodities, offers comprehensive technical assistance to strengthen
                    national supply chain systems, and provides global supply chain leadership. For more
                    information, visit <a href="https://www.ghsupplychain.org/" target="_blank">ghsupplychain.org</a>. The information provided in this tool is not
                    official U.S. government information and does not represent the views or positions of the
                    Agency for International Development or the U.S. government.
                  </p>
                </CardBody>
                <Row className="text-center Login-bttom-logo">
                  <Col md="4">
                    <CardBody>
                      <img src={image2} className="img-fluid bottom-logo-img" />
                    </CardBody>
                  </Col>
                  <Col md="4">
                    <CardBody>
                      <img src={image3} className="img-fluid bottom-logo-img" />
                    </CardBody>
                  </Col>
                  <Col md="4">
                    <CardBody>
                      <img src={image4} className="img-fluid bottom-logo-img" />
                    </CardBody>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}
export default Login;