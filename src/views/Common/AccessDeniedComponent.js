import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Container, Jumbotron, Row } from 'reactstrap';

export default class AccessDeniedComponent extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col>
                        <Card>
                            <CardHeader>
                               
                            </CardHeader>
                            <CardBody>
                                <Jumbotron fluid>
                                    <Container fluid>
                                        <h1 className="display-3">Access Denied</h1>
                                        <p className="lead">You tried to access a page that is protected and you do not have sufficient rights.</p>
                                    </Container>
                                </Jumbotron>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}