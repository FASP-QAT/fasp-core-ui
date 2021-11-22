import React, { Component } from 'react';
import {
    Card, CardBody,
    Label, Input, FormGroup,
    CardFooter, Button, Col, Form
} from 'reactstrap';
import '../Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import 'react-select/dist/react-select.min.css';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import bsCustomFileInput from 'bs-custom-file-input'
import AuthenticationService from '../Common/AuthenticationService';
import UserManualService from '../../api/UserManualService';

const entityname = i18n.t('static.dashboard.uploadUserManual')
export default class uploadUserManual extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: '',
            color: '',
            loading: true,
        }
        this.formSubmit = this.formSubmit.bind(this)
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }


    componentDidMount() {
        bsCustomFileInput.init()
        this.setState({ loading: false })
    }

    formSubmit() {
        this.setState({ loading: true })
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            if (document.querySelector('input[type=file]').files[0] == undefined) {
                alert(i18n.t('static.program.selectfile'));
                this.setState({
                    loading: false
                })
            } else {
                var file = document.querySelector('input[type=file]').files[0];
                var fileName = file.name;
                var fileExtenstion = fileName.split(".");
                if (fileExtenstion[fileExtenstion.length - 1] == "pdf") {
                    var formData = new FormData();
                    formData.append("file", file);
                    UserManualService.uploadUserManual(formData).then(response => {
                        this.setState({
                            message: 'static.uploadUserManual.uploadUserManualSuccess',
                            color: 'green',
                            loading: false
                        }, () => {
                            this.hideSecondComponent();
                            let id = AuthenticationService.displayDashboardBasedOnRole();
                            this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/green/' + i18n.t('static.uploadUserManual.uploadUserManualSuccess'))
                        });
                    }).catch(error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: 'static.unkownError',
                                color: '#BA0C2F',
                                loading: false
                            }, () => {
                                this.hideSecondComponent();
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {

                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                    break;
                                case 403:
                                    this.props.history.push(`/accessDenied`)
                                    break;
                                case 500:
                                case 404:
                                case 406:
                                    this.setState({
                                        message: i18n.t("static.unkownError"),
                                        loading: false,
                                        color: '#BA0C2F'
                                    }, () => {
                                        this.hideSecondComponent();
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false,
                                        color: '#BA0C2F'
                                    }, () => {
                                        this.hideSecondComponent();
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false,
                                        color: '#BA0C2F',
                                    }, () => {
                                        this.hideSecondComponent();
                                    });
                                    break;
                            }
                        }
                    })

                } else {
                    this.setState({ loading: false })
                    alert(i18n.t('static.program.selectzipfile'))
                }
            }
        }
    }

    render() {
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 id="div2" className={this.state.color}>{this.state.message}</h5>
                <Card className="mt-2">

                    <Form noValidate name='simpleForm'>
                        <CardBody className="pb-lg-2 pt-lg-2" style={{ display: this.state.loading ? "none" : "block" }}>
                            <FormGroup>
                                <Col md="3">
                                    <Label className="uploadfilelable" htmlFor="file-input">{i18n.t('static.userManual.fileinputPdf')}</Label>
                                </Col>
                                <Col xs="12" md="4" className="custom-file">
                                    <Input type="file" className="custom-file-input" id="file-input" name="file-input" accept=".pdf" />
                                    <label className="custom-file-label" id="file-input" data-browse={i18n.t('static.uploadfile.Browse')}>{i18n.t('static.chooseFile.chooseFile')}</label>
                                </Col>
                            </FormGroup>
                        </CardBody>
                        <div style={{ display: this.state.loading ? "block" : "none" }}>
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                <div class="align-items-center">
                                    <div ><h4> <strong>{i18n.t('static.loading.loading')}</strong></h4></div>

                                    <div class="spinner-border blue ml-4" role="status">

                                    </div>
                                </div>
                            </div>
                        </div>

                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                <Button type="button" id="fileImportButton" size="md" color="success" className="float-right mr-1" onClick={() => this.formSubmit()}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                &nbsp;
                                                </FormGroup>
                        </CardFooter>
                    </Form>
                </Card>



            </>
        )

    }

    cancelClicked() {
        let id = AuthenticationService.displayDashboardBasedOnRole();
        this.props.history.push(`/ApplicationDashboard/` + `${id}` + '/red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
    }

}