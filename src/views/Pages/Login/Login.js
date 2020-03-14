import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import navigation from '../../../_nav';
// routes config
import routes from '../../../routes';

import CryptoJS from 'crypto-js'
import AuthenticationService from '../../common/AuthenticationService.js';
import { Online } from "react-detect-offline";
import bcrypt from 'bcryptjs';
import jwt_decode from 'jwt-decode'
import { SECRET_KEY } from '../../../Constants.js'
import LoginService from '../../../api/LoginService'


class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: ''
    }
    this.loginClicked = this.loginClicked.bind(this);
  }
  loginClicked() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    if (navigator.onLine) {
      LoginService.authenticate(username, password)
        .then(response => {
          var decoded = jwt_decode(response.data.token);
          console.log("user id---" + decoded.userId);
          localStorage.removeItem("token-" + decoded.userId);
          localStorage.removeItem('username-' + decoded.userId);
          localStorage.removeItem('password-' + decoded.userId);
          localStorage.removeItem('curUser');

          localStorage.setItem('token-' + decoded.userId, CryptoJS.AES.encrypt((response.data.token).toString(), `${SECRET_KEY}`));
          localStorage.setItem('username-' + decoded.userId, CryptoJS.AES.encrypt((decoded.user.username).toString(), `${SECRET_KEY}`));
          localStorage.setItem('password-' + decoded.userId, CryptoJS.AES.encrypt((decoded.user.password).toString(), `${SECRET_KEY}`));
          localStorage.setItem('typeOfSession', "Online");
          localStorage.setItem('curUser', CryptoJS.AES.encrypt((decoded.userId).toString(), `${SECRET_KEY}`));
          console.log("local storage length---" + localStorage.length);
          console.log("user cur ---" + localStorage.getItem("curUser"));
          AuthenticationService.setupAxiosInterceptors();
          this.props.history.push(`/dashboard`)
        })
        .catch(
          error => {
            if (error.response != null && error.response.status === 401) {
              switch (error.response.data) {
                case "Password expired":
                  this.setState({
                    message: error.response.data
                  })
                  this.props.history.push({
                    pathname: "/updateExpiredPassword",
                    state: {
                      username: username
                    }
                  });
                  break
                default:
                  this.setState({
                    message: error.response.data
                  })
                  break
              }
            } else {
              switch (error.message) {
                case "Network Error":
                  this.setState({
                    message: error.message
                  })
                  break
                default:
                  this.setState({
                    message: error.message
                  })
                  break
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
                    <Form>
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" placeholder="Username" autoComplete="username" name="username" id="username" required />
                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password" placeholder="Password" autoComplete="current-password" name="password" id="password" required />
                      </InputGroup>
                      <Row>
                        <Col xs="6">
                          <Button color="primary" className="px-4" onClick={this.loginClicked}>Login</Button>
                        </Col>
                        <Col xs="6" className="text-right">
                          <Button color="link" className="px-0">Forgot password?</Button>
                        </Col>
                      </Row>
                    </Form>
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
