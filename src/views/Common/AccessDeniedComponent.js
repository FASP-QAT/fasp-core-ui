import React, { Component } from 'react';
import { Card, CardBody, Col, Container, Jumbotron, Row } from 'reactstrap';
import i18n from '../../i18n';
/**
 * Component for showing access denied page.
 */
export default class AccessDeniedComponent extends Component {
    constructor(props) {
        super(props);
    }
    /**
     * Function to redirect to login page if user is not logged in on component mount
     */
    componentDidMount() {
        if (localStorage.getItem('curUser') == null || localStorage.getItem('curUser') == '') {
            this.props.history.push(`/login/static.accessDenied`)
        }
    }
    /**
     * Renders the access denied page.
     * @returns {JSX.Element} - Access denied page.
     */
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
                                            <h1 className="display-5" style={{color:'#20a8d8'}}><i class="fa fa-lock" aria-hidden="true"></i> {i18n.t('static.accessDenied')}</h1>
                                            <p className="lead">{i18n.t('static.notsufficientaccess')}</p>
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