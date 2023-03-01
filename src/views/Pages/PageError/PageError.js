import React, { Component } from 'react';
import { Button, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import AuthenticationService from '../../Common/AuthenticationService';
import JiraTikcetService from '../../../api/JiraTikcetService';
import i18n from '../../../i18n';
import { API_URL, SPACE_REGEX } from '../../../Constants';
import { confirmAlert } from 'react-confirm-alert'; // Import

import ErrorMessageImg from '../../../../src/assets/img/errorImg.png'
import ErrorMessageBg from '../../../../src/assets/img/E1.png'
import { size } from 'mathjs';
class PageError extends Component {
  constructor(props) {
      super(props);
      this.state = {
        bugReport: {
            summary: "",
            description: '',
            file: '',
            attachFile: ''
        },
        message: '',
        loading: false
    }
    this.submitBug = this.submitBug.bind(this);
    this.toggleSmall = this.toggleSmall.bind(this);
  }

  toggleSmall(msg) {
    confirmAlert({
      message: i18n.t('static.ticket.ticketcreated') + " " + i18n.t('static.ticket.ticketcode') + ": " + msg,
      buttons: [
        {
          label: i18n.t('static.common.close')
        }
      ]
    });
  }

  submitBug(e){
    let desc = "\nError Page - "+e.location.state.errorPage+"\nError Stack - "+e.location.state.errorStack;
    let { bugReport } = this.state;
        bugReport.summary = e.location.state.errorMessage;
        bugReport.description = desc;
        bugReport.file = '';
        bugReport.attachFile = '';
        this.setState({
            bugReport
        },
            () => { });

      JiraTikcetService.addBugReportIssue(this.state.bugReport).then(response => {
        console.log("Response :", response.status, ":", JSON.stringify(response.data));
        if (response.status == 200 || response.status == 201) {
            var msg = response.data.key;
            JiraTikcetService.addIssueAttachment(this.state.bugReport, response.data.id).then(response => {

            });

            this.setState({
                message: msg, loading: false
            })
            e.history.push(`/ApplicationDashboard/` + AuthenticationService.displayDashboardBasedOnRole())
        } else {
            this.setState({
                message: i18n.t('static.unkownError'), loading: false
            })
        }
        this.toggleSmall(this.state.message);
    }).catch(
        error => {
            if (error.message === "Network Error") {
                this.setState({
                    // message: 'static.unkownError',
                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                    loading: false
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
                            message: error.response.data.messageCode,
                            loading: false
                        });
                        break;
                    case 412:
                        this.setState({
                            message: error.response.data.messageCode,
                            loading: false
                        });
                        break;
                    default:
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                        break;
                }
            }
        }
    );
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
                <h4 className="pt-3">Error reason - {this.props.location.state.errorMessage}</h4>
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
              <Button color="primary" onClick={()=>this.submitBug(this.props)} className='mt-2'>Raise a Ticket</Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default PageError;
