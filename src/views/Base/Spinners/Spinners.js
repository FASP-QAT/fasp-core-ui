import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Button, Row, Spinner } from 'reactstrap';

class SpinnersB4 extends Component {
  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" md="6">
            <Card>
              <CardHeader>
                Spinner border
                <div className="card-header-actions">
                  <a href="https://getbootstrap.com/docs/4.2/components/spinners/" rel="noreferrer noopener" target="_blank" className="card-header-action">
                    <small className="text-muted">docs</small>
                  </a>
                </div>
              </CardHeader>
              <CardBody>
                <Spinner color="primary" />
                <Spinner color="secondary" />
                <Spinner color="success" />
                <Spinner color="danger" />
                <Spinner color="warning" />
                <Spinner color="info" />
                <Spinner color="light" />
                <Spinner color="dark" />
              </CardBody>
            </Card>
          </Col>
          <Col xs="12" md="6">
            <Card>
              <CardHeader>
                Spinner grow
              </CardHeader>
              <CardBody>
                <Spinner type="grow" color="primary" />
                <Spinner type="grow" color="secondary" />
                <Spinner type="grow" color="success" />
                <Spinner type="grow" color="danger" />
                <Spinner type="grow" color="warning" />
                <Spinner type="grow" color="info" />
                <Spinner type="grow" color="light" />
                <Spinner type="grow" color="dark" />
              </CardBody>
            </Card>
          </Col>
          <Col xs="12" md="6">
            <Card>
              <CardHeader>
                Spinner size
              </CardHeader>
              <CardBody>
                <Spinner size="sm" />
                <Spinner size="sm" type="grow"/>
                <Spinner style={{ width: '3rem', height: '3rem' }} />
                <Spinner style={{ width: '3rem', height: '3rem' }} type="grow" />
              </CardBody>
            </Card>
          </Col>
          <Col xs="12" md="6">
            <Card>
              <CardHeader>
                Spinner buttons
              </CardHeader>
              <CardBody>
                <Button color="primary" disabled className="mr-1 mb-1">
                  <Spinner size="sm"/>
                  <span className="sr-only">Loading...</span>
                </Button>
                <Button color="primary" className="mr-1 mb-1">
                  <Spinner size="sm" className="mr-1"/>
                  Loading...
                </Button>
                <br/>
                <Button color="primary" disabled className="mr-1 mb-1">
                  <Spinner size="sm" type="grow"/>
                  <span className="sr-only">Loading...</span>
                </Button>
                <Button color="primary" disabled className="mr-1 mb-1">
                  <Spinner size="sm" className="mr-1" type="grow"/>
                  Loading...
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default SpinnersB4;
