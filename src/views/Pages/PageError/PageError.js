import React, { Component } from 'react';
import { Button, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import AuthenticationService from '../../Common/AuthenticationService';

import ErrorMessageImg from '../../../../src/assets/img/errorImg.png'
import ErrorMessageBg from '../../../../src/assets/img/E1.png'
import { size } from 'mathjs';
class PageError extends Component {
  constructor(props) {
    super(props);
  }
 
  render() {
    return (
      <div className="app flex-row align-items-center ErrorBg" style={{ backgroundImage: "url(" + ErrorMessageBg + ")"}}>
        <Container>
          <Row className="justify-content-left">
            <Col md="7" lg="7">
              <span className="clearfix">
                <h1 className="float-left display-3 mr-4 err_text">Error <img style={{width:"150px"}} className='img-fluid' src={ErrorMessageImg}></img></h1>
                {/* <h4 className="pt-3">Houston, we have a problem!</h4>
                <p className="text-muted float-left">The page you are looking for is temporarily unavailable.</p> */}
              </span>
              <span>
                <h3 className=''>We seem to have encountered an unexpected error. Please show this to one of our engineers so we can get someone working on this right away.</h3>
                <h4 className="pt-3">Error reason - {this.props.match.params.message}</h4>
              </span>
              <InputGroup className="input-prepend">
                {/* <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="fa fa-search"></i>
                  </InputGroupText>
                </InputGroupAddon>
                <Input size="16" type="text" placeholder="What are you looking for?" /> */}
                <InputGroupAddon addonType="append">
                  <Button color="primary" onClick={()=>this.props.history.push(`/ApplicationDashboard/` + AuthenticationService.displayDashboardBasedOnRole())}>Return to Dashboard</Button>
                </InputGroupAddon>
              </InputGroup>
              <Button color="primary" className='mt-2'>Raise a Ticket</Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default PageError;
