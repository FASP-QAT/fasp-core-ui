import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, FormFeedback, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import i18n from '../../i18n'
import AuthenticationService from '../Common/AuthenticationService.js';
import UserService from '../../api/UserService'
export default class UserAgreementComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            message: ""
        }
        this.accept = this.accept.bind(this);
        this.decline = this.decline.bind(this);
    }
    accept() {
        AuthenticationService.setupAxiosInterceptors();
        UserService.acceptUserAgreement().then(response => {
            this.props.history.push(`/masterDataSync`)
        }).catch(
            error => {
                if (error.message === "Network Error") {
                    this.setState({ message: error.message });
                } else {
                    switch (error.response ? error.response.status : "") {
                        case 500:
                        case 401:
                        case 404:
                        case 412:
                        case 406:
                            this.setState({ message: error.response.data.messageCode });
                            break;
                        default:
                            this.setState({ message: 'static.unkownError' });
                            break;
                    }
                }
            }
        );
    }
    decline() {
        let keysToRemove = ["token-" + AuthenticationService.getLoggedInUserId(), "user-" + AuthenticationService.getLoggedInUserId(), "curUser", "lang", "typeOfSession", "i18nextLng", "lastActionTaken"];
        keysToRemove.forEach(k => localStorage.removeItem(k));
        this.props.history.push(`/login`)
    }
    render() {
        return (
            <div className="animated fadeIn">
                <h5 id="div2">{i18n.t(this.state.message)}</h5>
                <div className="col-md-12">
                    <Col xs="12" sm="12">
                        <Card>
                            <CardHeader>
                                <strong>{i18n.t('static.user.agreement')}</strong>
                            </CardHeader>
                            <CardBody>
                                <div className="text-center">User agreement</div>
                            </CardBody>

                            <CardFooter id="retryButtonDiv">
                                <FormGroup>
                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.decline}><i className="fa fa-times"></i> {i18n.t('static.common.decline')}</Button>
                                    <Button type="submit" size="md" color="success" onClick={this.accept} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.accept')}</Button>
                                    &nbsp;
                        </FormGroup>
                            </CardFooter>
                        </Card>
                    </Col>
                </div>
                {/* </Container>
            </div> */}
            </div>
        )
    }
}