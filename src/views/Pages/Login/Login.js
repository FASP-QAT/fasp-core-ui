import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import React, { Component } from 'react';
import i18n from '../../../i18n';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { Button, CardBody, CardGroup, Col, Container, Form, FormFeedback, Input, InputGroup, InputGroupAddon, InputGroupText, DropdownItem, DropdownMenu, DropdownToggle, ButtonDropdown, Row } from 'reactstrap';
import * as Yup from 'yup';
import InnerBgImg from '../../../../src/assets/img/bg-image/bg-login.jpg';
import LoginService from '../../../api/LoginService';
import image3 from '../../../assets/img/PEPFAR-logo.png';
// routes config
import image1 from '../../../assets/img/QAT-login-logo.png';
import image4 from '../../../assets/img/USAID-presidents-malaria-initiative.png';
import image2 from '../../../assets/img/wordmark.png';
import { SECRET_KEY, APP_VERSION_REACT, JEXCEL_DEFAULT_PAGINATION, INDEXED_DB_VERSION, INDEXED_DB_NAME, polling } from '../../../Constants.js';
import AuthenticationService from '../../Common/AuthenticationService.js';
import '../../Forms/ValidationForms/ValidationForms.css';
import axios from 'axios';
import { Online, Offline } from 'react-detect-offline';
import { isSiteOnline } from '../../../CommonComponent/JavascriptCommonFunctions';
import { getDatabase } from "../../../CommonComponent/IndexedDbFunctions";
import MasterSyncService from '../../../api/MasterSyncService.js';
import getLabelText from '../../../CommonComponent/getLabelText';






const initialValues = {
  emailId: "",
  password: ""
}
const validationSchema = function (values) {
  return Yup.object().shape({
    emailId: Yup.string()
      .email(i18n.t('static.user.invalidemail'))
      .required(i18n.t('static.login.usernametext')),
    password: Yup.string()
      .required(i18n.t('static.login.passwordtext'))
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

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      loading: false,
      apiVersion: '',
      dropdownOpen: new Array(19).fill(false),
      icon: AuthenticationService.getIconAndStaticLabel("icon"),
      staticLabel: AuthenticationService.getIconAndStaticLabel("label"),
      languageList: [],
      updatedSyncDate: '',
      lang: localStorage.getItem('lastLoggedInUsersLanguage')
    }
    this.forgotPassword = this.forgotPassword.bind(this);
    this.incorrectPassmessageHide = this.incorrectPassmessageHide.bind(this);
    this.logoutMessagehide = this.logoutMessagehide.bind(this);
    this.toggle = this.toggle.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
    this.getLanguageList = this.getLanguageList.bind(this);
    this.getAllLanguages = this.getAllLanguages.bind(this);
  }
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
      // var transaction = db1.transaction(['language'], 'readwrite');
      // var program1 = transaction.objectStore('language');
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
        console.log("my language list---", languageList);
        this.setState({
          languageList
        });
        i18n.changeLanguage(AuthenticationService.getDefaultUserLanguage())
      }.bind(this);
    }.bind(this);
  }
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

    console.log("Hey anchal going to get languages for profile section")
    var lastSyncDateRealm = "2020-01-01 00:00:00";
    openRequest.onsuccess = function (e) {
      db1 = e.target.result;
      var transaction = db1.transaction(['language'], 'readwrite');
      var program = transaction.objectStore('language');
      delete axios.defaults.headers.common["Authorization"];
      if (isSiteOnline()) {

        // var transaction1 = db1.transaction(['lastSyncDate'], 'readwrite');
        // var lastSyncDateTransaction = transaction1.objectStore('lastSyncDate');
        // var updatedSyncDate = ((moment(Date.now()).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss')));
        // this.setState({
        //   updatedSyncDate: updatedSyncDate
        // })
        // var lastSyncDateRequest = lastSyncDateTransaction.getAll();
        // lastSyncDateRequest.onsuccess = function (event) {
        //   var lastSyncDate = lastSyncDateRequest.result[0];
        //   console.log("lastsyncDate", lastSyncDate);
        //   var result = lastSyncDateRequest.result;
        //   console.log("Result", result)
        //   var realmId = 1;
        //   console.log("RealmId", realmId)
        //   for (var i = 0; i < result.length; i++) {
        //     if (result[i].id == realmId) {
        //       console.log("in if")
        //       lastSyncDateRealm = lastSyncDateRequest.result[i];
        //       console.log("last sync date in realm", lastSyncDateRealm)
        //     }
        //     if (result[i].id == 0) {
        //       var lastSyncDate = lastSyncDateRequest.result[i];
        //       console.log("last sync date", lastSyncDate)
        //     }
        //   }
        //   if (lastSyncDate == undefined) {
        //     lastSyncDate = "2020-01-01 00:00:00";
        //   } else {
        //     lastSyncDate = lastSyncDate.lastSyncDate;
        //   }
        //   if (lastSyncDateRealm == undefined) {
        //     lastSyncDateRealm = "2020-01-01 00:00:00";
        //   } else {
        //     lastSyncDateRealm = lastSyncDateRealm.lastSyncDate;
        //   }
        //   console.log("Last sync date above", lastSyncDateRealm);
        // }
        // console.log("lastSyncDateRealm---", lastSyncDateRealm);
        MasterSyncService.getLanguageListForSync(lastSyncDateRealm).then(response => {
          console.log("response---", response);
          var transaction = db1.transaction(['language'], 'readwrite');
          var program = transaction.objectStore('language');
          var json = (response.data);
          for (var i = 0; i < json.length; i++) {
            console.log("json[i]---", json[i]);
            var psuccess = program.put(json[i]);

          }
          this.getAllLanguages();

        });
      } else {
        this.getAllLanguages();
      }
    }.bind(this)


  }

  changeLanguage(lang, icon, staticLabel) {
    // localStorage.setItem('lang', lang);
    localStorage.setItem('lastLoggedInUsersLanguage', lang);
    localStorage.setItem('lastLoggedInUsersLanguageChanged', true);
    this.setState({ icon, staticLabel })
    i18n.changeLanguage(lang)
    window.location.reload();
  }

  touchAll(setTouched, errors) {
    setTouched({
      emailId: true,
      password: true
    }
    )
    this.validateForm(errors)
  }
  validateForm(errors) {
    this.findFirstError('loginForm', (fieldName) => {
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
    // console.log("############## Login component did mount #####################");
    delete axios.defaults.headers.common["Authorization"];
    this.logoutMessagehide();
    // console.log("--------Going to call version api-----------")
    AuthenticationService.clearUserDetails()
    if (isSiteOnline()) {
      LoginService.getApiVersion()
        .then(response => {
          // console.log("--------version api success----------->", response)
          if (response != null && response != "") {
            this.setState({
              apiVersion: response.data.app.version

            })
            // console.log("response---", response.data.app.version)
          }
        }).catch(error => {
          // console.log("--------version api error----------->", error)
        })
    } else {
      console.log("############## Offline so can't fetch version #####################");
    }
    AuthenticationService.setRecordCount(JEXCEL_DEFAULT_PAGINATION);
    console.log("timeout going to change language")
    this.getLanguageList();
    i18n.changeLanguage(AuthenticationService.getDefaultUserLanguage())
  }

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

  incorrectPassmessageHide() {
    // console.log("-----------------incorrectPassmessageHide---------------");
    // setTimeout(function () { document.getElementById('div1').style.display = 'none'; }, 8000);
    setTimeout(function () { document.getElementById('div2').style.display = 'none'; }, 8000);
    var incorrectPassword = document.getElementById('div2');
    incorrectPassword.style.color = '#BA0C2F';
    this.setState({
      message: ''
    },
      () => {
        // document.getElementById('div1').style.display = 'block';
        document.getElementById('div2').style.display = 'block';




      });
  }

  logoutMessagehide() {
    // console.log("-----------logoutMessagehide---------------");
    setTimeout(function () { document.getElementById('div1').style.display = 'none'; }, 8000);
    var logoutMessage = document.getElementById('div1');
    var htmlContent = logoutMessage.innerHTML;
    // console.log("htnl content....... ", htmlContent);
    if (htmlContent.includes('Cancelled') || htmlContent.includes('cancelled') || htmlContent.includes('sessionChange') || htmlContent.includes('change your session') || htmlContent.includes('expire') || htmlContent.includes('exceeded the maximum')) {
      logoutMessage.style.color = '#BA0C2F';
    }
    else if (htmlContent.includes('Access Denied')) {
      logoutMessage.style.color = '#BA0C2F';
    }
    else {
      logoutMessage.style.color = 'green';
    }

    // setTimeout(function () {var div2= document.getElementById('div2').style.display = 'none';}, 8000);
    this.setState({
      message: ''
    },
      () => {
        document.getElementById('div1').style.display = 'block';
        document.getElementById('div2').style.display = 'block';
      });
  }
  toggle(i) {
    const newArray = this.state.dropdownOpen.map((element, index) => { return (index === i ? !element : false); });
    this.setState({
      dropdownOpen: newArray,
    });
  }
  render() {
    return (
      <div className="main-content flex-row align-items-center bg-height">

        <div className="Login-component" style={{ backgroundImage: "url(" + InnerBgImg + ")" }}>
          <Container className="container-login">

            <Row className="justify-content-center">
              <Col className="float-right pr-5" style={{ width: '100%' }}>
                <div className="float-right">
                  <ButtonDropdown isOpen={this.state.dropdownOpen[0]} toggle={() => { this.toggle(0); }}>
                    <DropdownToggle caret className="en-btnlogin">
                      {this.state.languageLabel}
                      <i className={this.state.icon}></i>  &nbsp;{i18n.t(this.state.staticLabel)}
                    </DropdownToggle>
                    <DropdownMenu right>
                      {/* <DropdownItem ><i className="flag-icon flag-icon-us"></i>English</DropdownItem> */}
                      {this.state.languageList != null && this.state.languageList != '' && this.state.languageList.filter(c => c.active).map(
                        language =>
                          <>
                            <DropdownItem onClick={this.changeLanguage.bind(this, language.languageCode, "flag-icon flag-icon-" + language.countryCode, getLabelText(language.label, this.state.lang))}>
                              <i className={"flag-icon flag-icon-" + language.countryCode}></i>  {getLabelText(language.label, this.state.lang)}
                            </DropdownItem>
                          </>
                      )}
                      {/* <DropdownItem onClick={this.changeLanguage.bind(this, 'en', "flag-icon flag-icon-us", "static.language.english")}><i className="flag-icon flag-icon-us"></i>  {i18n.t('static.language.english')}</DropdownItem>
                      <DropdownItem onClick={this.changeLanguage.bind(this, 'fr', "flag-icon flag-icon-wf", "static.language.french")}><i className="flag-icon flag-icon-wf "></i>  {i18n.t('static.language.french')}</DropdownItem>
                      <DropdownItem onClick={this.changeLanguage.bind(this, 'sp', "flag-icon flag-icon-es", "static.language.spanish")}><i className="flag-icon flag-icon-es"></i>  {i18n.t('static.language.spanish')} </DropdownItem>
                      <DropdownItem onClick={this.changeLanguage.bind(this, 'pr', "flag-icon flag-icon-pt", "static.language.portuguese")}><i className="flag-icon flag-icon-pt"></i>  {i18n.t('static.language.portuguese')}</DropdownItem> */}
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
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                          var emailId = values.emailId;
                          var password = values.password;

                          AuthenticationService.setRecordCount(JEXCEL_DEFAULT_PAGINATION);
                          localStorage.setItem("sessionTimedOut", 0);
                          localStorage.setItem("sessionChanged", 0)
                          if (isSiteOnline()) {
                            var languageCode = AuthenticationService.getDefaultUserLanguage();
                            var lastLoggedInUsersLanguageChanged = localStorage.getItem('lastLoggedInUsersLanguageChanged');
                            console.log("Language change flag---", lastLoggedInUsersLanguageChanged);
                            LoginService.authenticate(emailId, password, languageCode, lastLoggedInUsersLanguageChanged)
                              .then(response => {
                                var decoded = jwt_decode(response.data.token);
                                // console.log("decoded token---", decoded);

                                let keysToRemove = ["token-" + decoded.userId, "user-" + decoded.userId, "curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken", "lastLoggedInUsersLanguage","sessionType"];
                                keysToRemove.forEach(k => localStorage.removeItem(k))
                                decoded.user.syncExpiresOn = moment().format("YYYY-MM-DD HH:mm:ss");
                                decoded.user.apiVersion = this.state.apiVersion;
                                // decoded.user.syncExpiresOn = moment("2020-04-29 13:13:19").format("YYYY-MM-DD HH:mm:ss");
                                localStorage.setItem('token-' + decoded.userId, CryptoJS.AES.encrypt((response.data.token).toString(), `${SECRET_KEY}`));
                                // localStorage.setItem('user-' + decoded.userId, CryptoJS.AES.encrypt(JSON.stringify(decoded.user), `${SECRET_KEY}`));
                                localStorage.setItem('typeOfSession', "Online");
                                localStorage.setItem('sessionType', "Online");
                                localStorage.setItem('lastActionTaken', CryptoJS.AES.encrypt((moment(new Date()).format("YYYY-MM-DD HH:mm:ss")).toString(), `${SECRET_KEY}`));
                                localStorage.setItem('curUser', CryptoJS.AES.encrypt((decoded.userId).toString(), `${SECRET_KEY}`));
                                localStorage.setItem('lang', decoded.user.language.languageCode);
                                localStorage.setItem('i18nextLng', decoded.user.language.languageCode);
                                localStorage.setItem('lastLoggedInUsersLanguage', decoded.user.language.languageCode);
                                AuthenticationService.setLanguageChangeFlag();
                                i18n.changeLanguage(decoded.user.language.languageCode);


                                AuthenticationService.setupAxiosInterceptors();
                                if (decoded.user.agreementAccepted) {
                                  this.props.history.push(`/masterDataSync`)
                                } else {
                                  this.props.history.push(`/userAgreement`)
                                }
                              })
                              .catch(
                                error => {
                                  if (error.message === "Network Error") {
                                    this.setState({ message: error.message });
                                  } else {
                                    switch (error.response ? error.response.status : "") {
                                      case 500:
                                      case 401:
                                      case 404:
                                      case 412:
                                        // console.log("Login page 401---");
                                        this.setState({ message: error.response.data.messageCode });
                                        break;
                                      case 406:
                                        // console.log("Login page password expired----------->" + emailId)
                                        this.props.history.push({
                                          pathname: "/updateExpiredPassword",
                                          state: {
                                            emailId
                                          }
                                        });
                                        break;
                                      default:
                                        // console.log("Login page unknown error---");
                                        this.setState({ message: 'static.unkownError' });
                                        break;
                                    }
                                  }
                                }
                              );

                          }
                          else {
                            // console.log("offline emailId---", emailId)
                            var decryptedPassword = AuthenticationService.isUserLoggedIn(emailId);
                            // console.log("offline decryptedPassword---", decryptedPassword)
                            if (decryptedPassword != "") {
                              bcrypt.compare(password, decryptedPassword, function (err, res) {
                                if (err) {
                                  // console.log("offline error---", err)
                                  this.setState({ message: 'static.label.labelFail' });
                                }
                                if (res) {
                                  let tempUser = localStorage.getItem("tempUser");
                                  // console.log("offline tempuser---", tempUser)
                                  let user = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + tempUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                                  // console.log("offline user next---", user)
                                  let keysToRemove = ["curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken", "lastLoggedInUsersLanguage","sessionType"];
                                  keysToRemove.forEach(k => localStorage.removeItem(k))

                                  localStorage.setItem('typeOfSession', "Offline");
                                  localStorage.setItem('sessionType', "Offline");
                                  localStorage.setItem('curUser', CryptoJS.AES.encrypt((user.userId).toString(), `${SECRET_KEY}`));
                                  localStorage.setItem('lang', user.language.languageCode);
                                  localStorage.setItem('i18nextLng', user.language.languageCode);
                                  localStorage.setItem('lastLoggedInUsersLanguage', user.language.languageCode);
                                  i18n.changeLanguage(user.language.languageCode);
                                  localStorage.removeItem("tempUser");
                                  if (AuthenticationService.syncExpiresOn() == true) {
                                    this.props.history.push(`/logout/static.message.syncExpiresOn`)
                                  } else {
                                    localStorage.setItem('lastActionTaken', CryptoJS.AES.encrypt((moment(new Date()).format("YYYY-MM-DD HH:mm:ss")).toString(), `${SECRET_KEY}`));
                                    // qatProblemActions();
                                    this.props.history.push(`/ApplicationDashboard`)

                                  }
                                } else {
                                  // console.log("offline invalid credentials---")
                                  this.setState({ message: 'static.message.login.invalidCredentials' });
                                }
                              }.bind(this));
                            }
                            else {
                              // console.log("offline decryptedPassword empty---", decryptedPassword)
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

                                {/* <h1>{i18n.t('static.login.login')}</h1> */}

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
                                <InputGroup className="mb-4">
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
                                <Row>
                                  <Col xs="6">
                                    <Button type="submit" color="primary" className="px-4" onClick={() => { this.touchAll(setTouched, errors); this.incorrectPassmessageHide() }} >{i18n.t('static.login.login')}</Button>
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
                <h5 className="text-right versionColor">{i18n.t('static.common.version')}{APP_VERSION_REACT} | <Online polling={polling}>{this.state.apiVersion}</Online><Offline polling={polling}>Offline</Offline></h5>
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



// incorrectPassmessageHide();

export default Login;
