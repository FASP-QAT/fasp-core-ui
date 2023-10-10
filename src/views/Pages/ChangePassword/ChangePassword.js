import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
class ChangePassword extends Component {
  render() {
    return (
      <div className="main-content flex-row align-items-center">
        <div className="" >
          <img src={'assets/img/QAT-logo.png'} className="img-fluid" />
        </div>
        <Col>
          <Row className="justify-content-center">
            <Col md="6" lg="5" xl="4" >
              <Card className="mx-4">
                <CardBody className="p-4">
                  <Form>
                    <h3 className="text-center">Change Password</h3>
                    <br></br>
                    <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" placeholder="Old Password" autoComplete="current-password" />
                    </InputGroup>
                    <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" placeholder="New Password" autoComplete="current-password" />
                    </InputGroup>
                    <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" placeholder="Confirm Password" autoComplete="current-password" />
                    </InputGroup>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Button type="submit" size="md" color="primary" className="float-right fwd-btn"> Submit</Button>
                  <Button type="reset" size="md" color="danger" className="float-right"> cancel</Button>
                </CardFooter>
              </Card>
            </Col>
          </Row>
          <br></br>
          <Row className="text-center">
            <Col md="4">
              <CardBody>
                <img src={'assets/img/wordmark.png'} className="img-fluid" width="420" />
              </CardBody>
            </Col>
            <Col md="4">
              <CardBody>
                <img src={'assets/img/USAID-presidents-malaria-initiative.png'} className="img-fluid" width="420" />
              </CardBody>
            </Col>
            <Col md="4">
              <CardBody>
                <img src={'assets/img/PEPFAR-logo.png'} className="img-fluid" width="420" />
              </CardBody>
            </Col>
          </Row>
        </Col>
      </div>
    );
  }
}
export default ChangePassword;
