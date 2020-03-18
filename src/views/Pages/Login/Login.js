import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardGroup, Col, Container,ContainerFluid, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row, Label, FormGroup } from 'reactstrap';

class Login extends Component {
  render() {
    return (
      <div className="main-content flex-row align-items-center">
     
      <div className="Login-component">
        <br></br>
         <div>
            <img src={'assets/img/QAT-logo.png'} className="img-fluid upper-logo" />
         </div>
         <br></br>
         <Col>
         <Row className="justify-content-center">
            <Col md="4">
              <CardGroup>
                <Card className="p-4 Login-card">
                  <CardBody>
                    <Form>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user Loginicon"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" placeholder="Username" autoComplete="username" />
                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock Loginicon"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password" placeholder="Password" autoComplete="current-password" />
                      </InputGroup>
                      <Row>
                        <Col xs="6">
                          <Button className="px-4 Login-btn">Login</Button>
                        </Col>
                        <Col xs="6" className="text-right">
                          <Link to="/ForgotPassword">
                          <Button color="link" className="px-0 Login-fpwd">Forgot password?</Button>
                          </Link>
                         
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
         
              </CardGroup>
            </Col>
          </Row>
    
      < Col className="Login-bttom ">
      <Col xs="12">
          <CardBody>
            <br></br>
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
        </Col>
        <Row className="text-center Login-bttom-logo">
        <Col md="4">
            <CardBody>
            <img src={'assets/img/wordmark.png'} className="img-fluid"  width="420"/>
            </CardBody>
       </Col>
        <Col md="4">
           <CardBody>
            <img src={'assets/img/USAID-presidents-malaria-initiative.png'} className="img-fluid" width="420"/>
            </CardBody>
       </Col>
        <Col md="4">
          <CardBody>
            <img src={'assets/img/PEPFAR-logo.png'} className="img-fluid" width="420"/>
            </CardBody>
       </Col>
       </Row>
       </ Col>
    
      </Col>
      </div>
      </div>
  
      
      
    );
  }
}

export default Login;
