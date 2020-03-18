import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row, FormFeedback } from 'reactstrap';
import navigation from '../../../_nav';
// routes config
import routes from '../../../routes';

import { Formik } from 'formik';
import * as Yup from 'yup'
import '../../Forms/ValidationForms/ValidationForms.css'

import CryptoJS from 'crypto-js'
import AuthenticationService from '../../common/AuthenticationService.js';
import { Online } from "react-detect-offline";
import bcrypt from 'bcryptjs';
import jwt_decode from 'jwt-decode'
import { SECRET_KEY } from '../../../Constants.js'
import LoginService from '../../../api/LoginService'
import i18n from '../../../i18n'


const initialValues = {
  username: "",
  password: ""
}
const validationSchema = function (values) {
  return Yup.object().shape({
    username: Yup.string()
      .required('Please enter username'),
    password: Yup.string()
      .required('Please enter password')
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
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">

              <CardGroup>
                <Card className="p-4">
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
                              localStorage.removeItem("token-" + decoded.userId);
                              localStorage.removeItem("user-" + decoded.userId);
                              localStorage.removeItem('username-' + decoded.userId);
                              localStorage.removeItem('password-' + decoded.userId);
                              localStorage.removeItem('curUser');
                              localStorage.removeItem('lang');

                              localStorage.setItem('token-' + decoded.userId, CryptoJS.AES.encrypt((response.data.token).toString(), `${SECRET_KEY}`));
                              localStorage.setItem('user-' + decoded.userId, CryptoJS.AES.encrypt((decoded.user).toString(), `${SECRET_KEY}`));
                              localStorage.setItem('username-' + decoded.userId, CryptoJS.AES.encrypt((decoded.user.username).toString(), `${SECRET_KEY}`));
                              localStorage.setItem('password-' + decoded.userId, CryptoJS.AES.encrypt((decoded.user.password).toString(), `${SECRET_KEY}`));
                              localStorage.setItem('typeOfSession', "Online");
                              localStorage.setItem('curUser', CryptoJS.AES.encrypt((decoded.userId).toString(), `${SECRET_KEY}`));
                              localStorage.setItem('lang', decoded.user.language.languageCode);
                              AuthenticationService.setupAxiosInterceptors();
                              this.props.history.push(`/dashboard`)
                            })
                            .catch(
                              error => {
                                console.log(error);
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
                                      console.log("Error code unkown");
                                      break;
                                  }
                                }
                              }
                            );
                        }
                        else {
                          var decryptedPassword = AuthenticationService.isUserLoggedIn(username, password);
                          if (decryptedPassword != "") {
                            bcrypt.compare(password, decryptedPassword, function (err, res) {
                              if (err) {
                                this.setState({ message: 'Error occured' });
                              }
                              if (res) {
                                localStorage.setItem('typeOfSession', "Offline");
                                localStorage.setItem('curUser', CryptoJS.AES.encrypt(localStorage.getItem("tempUser").toString(), `${SECRET_KEY}`));
                                localStorage.removeItem("tempUser");
                                this.props.history.push(`/welcome`)
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
                              <h5>{i18n.t(this.props.match.params.message)}</h5>
                              <h5>{i18n.t(this.state.message)}</h5>
                              <h1>{i18n.t('static.login.login')}</h1>
                              <p className="text-muted">{i18n.t('static.login.signintext')}</p>
                              <InputGroup className="mb-3">
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>
                                    <i className="icon-user"></i>
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
                                    <i className="icon-lock"></i>
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
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;
