import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardGroup, Col, Container, ContainerFluid, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row, FormFeedback, Label, FormGroup } from 'reactstrap';
import navigation from '../../../_nav';
// routes config


import { Formik } from 'formik';
import * as Yup from 'yup'
import '../../Forms/ValidationForms/ValidationForms.css'

import CryptoJS from 'crypto-js'
import AuthenticationService from '../../Common/AuthenticationService.js';
import { Online } from "react-detect-offline";
import bcrypt from 'bcryptjs';
import jwt_decode from 'jwt-decode'
import { SECRET_KEY } from '../../../Constants.js'
import LoginService from '../../../api/LoginService'
import i18n from '../../../i18n'
import axios from 'axios';

const initialValues = {
  username: "",
  password: ""
}
const validationSchema = function (values) {
  return Yup.object().shape({
    username: Yup.string()
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
      message: ''
    }
    this.forgotPassword = this.forgotPassword.bind(this);
  }

  touchAll(setTouched, errors) {
    setTouched({
      username: true,
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

  forgotPassword() {
    this.props.history.push(`/forgotPassword`)
  }
  render() {
    return (
      <div className="main-content flex-row align-items-center">

        <div className="Login-component">
          <Container className="container-login">

            <Row className="justify-content-center">
              <Col md="12">
                <div className="upper-logo mt-1">
                  <img src={'assets/img/QAT-login-logo.png'} className="img-fluid " />
                </div>
              </Col>
              <Col lg="5" md="7" xl="4">
                <CardGroup>
                  <Card className="p-4 Login-card mt-2">
                    <CardBody>
                      <Formik
                        initialValues={initialValues}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                          var username = values.username;
                          var password = values.password;
                          if (navigator.onLine) {
                            LoginService.authenticate(username, password)
                              .then(response => {
                                var decoded = jwt_decode(response.data.token);
                                let keysToRemove = ["token-" + decoded.userId, "user-" + decoded.userId, "curUser", "lang", "typeOfSession", "i18nextLng"];
                                keysToRemove.forEach(k => localStorage.removeItem(k))


                                // localStorage.removeItem("token-" + decoded.userId);
                                // localStorage.removeItem("user-" + decoded.userId);
                                // localStorage.removeItem("curUser");
                                // localStorage.removeItem("lang");
                                // localStorage.removeItem("typeOfSession");
                                // localStorage.removeItem("i18nextLng");

                                localStorage.setItem('token-' + decoded.userId, CryptoJS.AES.encrypt((response.data.token).toString(), `${SECRET_KEY}`));
                                localStorage.setItem('user-' + decoded.userId, CryptoJS.AES.encrypt(JSON.stringify(decoded.user), `${SECRET_KEY}`));
                                localStorage.setItem('typeOfSession', "Online");
                                localStorage.setItem('curUser', CryptoJS.AES.encrypt((decoded.userId).toString(), `${SECRET_KEY}`));
                                localStorage.setItem('lang', decoded.user.language.languageCode);
                                // AuthenticationService.setupAxiosInterceptors();
                                let basicAuthHeader = 'Bearer ' + response.data.token
                                console.log("basicAuthHeader---", basicAuthHeader);
                                AuthenticationService.setupAxiosInterceptors();
                                this.props.history.push(`/ApplicationDashboard`)
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
                                      case 412:
                                        this.setState({ message: error.response.data.messageCode });
                                        break;
                                      case 406:
                                        this.props.history.push({
                                          pathname: "/updateExpiredPassword",
                                          state: {
                                            username
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
                            var decryptedPassword = AuthenticationService.isUserLoggedIn(username);
                            if (decryptedPassword != "") {
                              bcrypt.compare(password, decryptedPassword, function (err, res) {
                                if (err) {
                                  this.setState({ message: 'Error occured' });
                                }
                                if (res) {
                                  let tempUser = localStorage.getItem("tempUser");
                                  let user = JSON.parse(CryptoJS.AES.decrypt(localStorage.getItem("user-" + tempUser), `${SECRET_KEY}`).toString(CryptoJS.enc.Utf8));
                                  let keysToRemove = ["curUser", "lang", "typeOfSession", "i18nextLng"];
                                  keysToRemove.forEach(k => localStorage.removeItem(k))

                                  localStorage.setItem('typeOfSession', "Offline");
                                  localStorage.setItem('curUser', CryptoJS.AES.encrypt((user.userId).toString(), `${SECRET_KEY}`));
                                  localStorage.setItem('lang', user.language.languageCode);
                                  localStorage.removeItem("tempUser");
                                  this.props.history.push(`/ApplicationDashboard`)
                                } else {
                                  this.setState({ message: 'Bad credentials.' });
                                }
                              }.bind(this));
                            }
                            else {
                              this.setState({ message: 'User not found.' });
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
                                <h5 >{i18n.t(this.props.match.params.message)}</h5>
                                <h5 >{i18n.t(this.state.message)}</h5>

                                {/* <h1>{i18n.t('static.login.login')}</h1> */}

                                <p className="text-muted">{i18n.t('static.login.signintext')}</p>

                                <InputGroup className="mb-3">
                                  <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                      <i className="icon-user Loginicon"></i>
                                    </InputGroupText>
                                  </InputGroupAddon>
                                  <Input
                                    type="text"
                                    placeholder={i18n.t('static.login.username')}
                                    autoComplete="username"
                                    name="username"
                                    id="username"
                                    valid={!errors.username}
                                    invalid={touched.username && !!errors.username}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required />
                                  <FormFeedback>{errors.username}</FormFeedback>
                                </InputGroup>
                                <InputGroup className="mb-4">
                                  <InputGroupAddon addonType="prepend">
                                    <InputGroupText>
                                      <i className="icon-lock Loginicon"></i>
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
                                    <Button type="submit" color="primary" className="px-4" onClick={() => this.touchAll(setTouched, errors)} >{i18n.t('static.login.login')}</Button>
                                  </Col>
                                  <Col xs="6" className="text-right">
                                    <Online><Button type="button" color="link" className="px-0" onClick={this.forgotPassword}>{i18n.t('static.login.forgotpassword')}?</Button></Online>
                                  </Col>

                                </Row>
                              </Form>
                            )} />
                    </CardBody>
                  </Card>

                </CardGroup>
              </Col>


              <Col xs="12" className="Login-bttom ">
                <CardBody>

                  <p className="Login-p">The USAID Global Health Supply Chain Program-Procurement and Supply Management
                  (GHSC-PSM) project is funded under USAID Contract No. AID-OAA-I-15-0004.
                  GHSC-PSM connects technical solutions and proven commercial processes to
                  promote efficient and cost-effective health supply chains worldwide.
                  Our goal is to ensure uninterrupted supplies of health commodities to save
                  lives and create a healthier future for all. The project purchases and delivers
                  health commodities, offers comprehensive technical assistance to strengthen
                  national supply chain systems, and provides global supply chain leadership.For more
                  information,visit ghsupplychain.org.The information provided in this tool is not official
                  U.S. government information and does not represent the views or positions of the Agency for International
                  Development or the U.S. government.
              </p>
                </CardBody>
                <Row className="text-center Login-bttom-logo">
                  <Col md="4">
                    <CardBody>
                      <img src={'assets/img/wordmark.png'} className="img-fluid bottom-logo-img" />
                    </CardBody>
                  </Col>

                  <Col md="4">
                    <CardBody>
                      <img src={'assets/img/PEPFAR-logo.png'} className="img-fluid bottom-logo-img" />
                    </CardBody>
                  </Col>
                  <Col md="4">
                    <CardBody>
                      <img src={'assets/img/USAID-presidents-malaria-initiative.png'} className="img-fluid bottom-logo-img" />
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
