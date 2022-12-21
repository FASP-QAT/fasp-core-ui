import React, { Component } from 'react';
import { Button, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import AuthenticationService from '../../Common/AuthenticationService';

class PageError extends Component {
  constructor(props) {
    super(props);
  }
 
  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              <span className="clearfix">
                <h1 className="float-left display-3 mr-4">Error</h1>
                {/* <h4 className="pt-3">Houston, we have a problem!</h4>
                <p className="text-muted float-left">The page you are looking for is temporarily unavailable.</p> */}
              </span>
              <span>
                <h4 className="pt-3">{this.props.match.params.message}</h4>
              </span>
              <InputGroup className="input-prepend">
                {/* <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="fa fa-search"></i>
                  </InputGroupText>
                </InputGroupAddon>
                <Input size="16" type="text" placeholder="What are you looking for?" /> */}
                <InputGroupAddon addonType="append">
                  <Button color="info" onClick={()=>this.props.history.push(`/ApplicationDashboard/` + AuthenticationService.displayDashboardBasedOnRole())}>Return to Dashboard</Button>
                </InputGroupAddon>
              </InputGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default PageError;
