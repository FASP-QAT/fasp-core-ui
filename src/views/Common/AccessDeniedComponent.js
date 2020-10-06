import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Container, Jumbotron, Row } from 'reactstrap';

export default class AccessDeniedComponent extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        console.log("Component did mount access denied called");
        if (localStorage.getItem('curUser') == null || localStorage.getItem('curUser') == '') {
            this.props.history.push(`/login/static.accessDenied`)
        }
    }

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col>
                        <Card className="mt-1">
                            <CardBody>
                                <Jumbotron>
                                    <Container>
                                        <div className="col-md-12">
                                            <h1 className="display-5" style={{color:'#20a8d8'}}><i class="fa fa-lock" aria-hidden="true"></i> Access Denied</h1>
                                            <p className="lead">You tried to access a page that is protected and you do not have sufficient rights.</p>
                                        </div>
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