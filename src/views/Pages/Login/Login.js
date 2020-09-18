import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import { Formik } from 'formik';
import jwt_decode from 'jwt-decode';
import moment from 'moment';
import React, { Component } from 'react';
import i18n from '../../../i18n';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { Button, CardBody, CardGroup, Col, Container, Form, FormFeedback, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import * as Yup from 'yup';
import InnerBgImg from '../../../../src/assets/img/bg-image/bg-login.jpg';
import LoginService from '../../../api/LoginService';
import image3 from '../../../assets/img/PEPFAR-logo.png';
// routes config
import image1 from '../../../assets/img/QAT-login-logo.png';
import image4 from '../../../assets/img/USAID-presidents-malaria-initiative.png';
import image2 from '../../../assets/img/wordmark.png';
import { SECRET_KEY } from '../../../Constants.js';
import AuthenticationService from '../../Common/AuthenticationService.js';
import '../../Forms/ValidationForms/ValidationForms.css';






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
      loading: false
    }
    this.forgotPassword = this.forgotPassword.bind(this);
    this.incorrectPassmessageHide = this.incorrectPassmessageHide.bind(this);
    this.logoutMessagehide = this.logoutMessagehide.bind(this);
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
    console.log("------componentDidMount------------");
    this.logoutMessagehide();
  }

  forgotPassword() {
    if (navigator.onLine) {
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
    console.log("-----------------incorrectPassmessageHide---------------");
    // setTimeout(function () { document.getElementById('div1').style.display = 'none'; }, 8000);
    setTimeout(function () { document.getElementById('div2').style.display = 'none'; }, 8000);
    var incorrectPassword = document.getElementById('div2');
    incorrectPassword.style.color = 'red';
    this.setState({
      message: ''
    },
      () => {
        // document.getElementById('div1').style.display = 'block';
        document.getElementById('div2').style.display = 'block';




      });
  }

  logoutMessagehide() {
    console.log("-----------logoutMessagehide---------------");
    setTimeout(function () { document.getElementById('div1').style.display = 'none'; }, 8000);
    var logoutMessage = document.getElementById('div1');
    var htmlContent = logoutMessage.innerHTML;
    console.log("htnl content....... ", htmlContent);
    if (htmlContent.includes('Cancelled') || htmlContent.includes('cancelled') || htmlContent.includes('sessionChange') || htmlContent.includes('change your session') || htmlContent.includes('expire') || htmlContent.includes('exceeded the maximum')) {
      logoutMessage.style.color = 'red';
    }
    else if (htmlContent.includes('Access Denied')) {
      logoutMessage.style.color = 'red';
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

  render() {
    return (
      <div className="main-content flex-row align-items-center">

        <div className="Login-component" style={{ backgroundImage: "url(" + InnerBgImg + ")" }}>
          <Container className="container-login">

            <Row className="justify-content-center">
              <Col md="12">
                <div className="upper-logo mt-1">
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
                          if (navigator.onLine) {
                            LoginService.authenticate(emailId, password)
                              .then(response => {
                                var decoded = jwt_decode(response.data.token);
                                console.log("decoded token---", decoded);

                                let keysToRemove = ["token-" + decoded.userId, "user-" + decoded.userId, "curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken"];
                                keysToRemove.forEach(k => localStorage.removeItem(k))
                                decoded.user.syncExpiresOn = moment().format("YYYY-MM-DD HH:mm:ss");
                                // decoded.user.syncExpiresOn = moment("2020-04-29 13:13:19").format("YYYY-MM-DD HH:mm:ss");
                                localStorage.setItem('token-' + decoded.userId, CryptoJS.AES.encrypt((response.data.token).toString(), `${SECRET_KEY}`));
                                // localStorage.setItem('user-' + decoded.userId, CryptoJS.AES.encrypt(JSON.stringify(decoded.user), `${SECRET_KEY}`));
                                localStorage.setItem('typeOfSession', "Online");
                                localStorage.setItem('lastActionTaken', CryptoJS.AES.encrypt((moment(new Date()).format("YYYY-MM-DD HH:mm:ss")).toString(), `${SECRET_KEY}`));
                                localStorage.setItem('curUser', CryptoJS.AES.encrypt((decoded.userId).toString(), `${SECRET_KEY}`));
                                localStorage.setItem('lang', decoded.user.language.languageCode);
                                localStorage.setItem('i18nextLng', decoded.user.language.languageCode);
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
                                        console.log("Login page 401---");
                                        this.setState({ message: error.response.data.messageCode });
                                        break;
                                      case 406:
                                        console.log("Login page password expired----------->"+emailId)
                                        this.props.history.push({
                                          pathname: "/updateExpiredPassword",
                                          state: {
                                            emailId
                                          }
                                        });
                                        break;
                                      default:
                                        console.log("Login page unknown error---");
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
                                  let keysToRemove = ["curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken"];
                                  keysToRemove.forEach(k => localStorage.removeItem(k))

                                  localStorage.setItem('typeOfSession', "Offline");
                                  localStorage.setItem('curUser', CryptoJS.AES.encrypt((user.userId).toString(), `${SECRET_KEY}`));
                                  localStorage.setItem('lang', user.language.languageCode);
                                  localStorage.setItem('i18nextLng', user.language.languageCode);
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