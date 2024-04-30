import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { Button, Col, Container, FormGroup, Input, InputGroup, InputGroupAddon, Row } from 'reactstrap';
import { API_URL } from '../../../Constants';
import JiraTikcetService from '../../../api/JiraTikcetService';
import i18n from '../../../i18n';
import AuthenticationService from '../../Common/AuthenticationService';
import ErrorMessageBg from '../../../../src/assets/img/E1.png';
import ErrorMessageImg from '../../../../src/assets/img/errorImg.png';
/**
 * Component to display any unknown error
 */
class PageError extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bugReport: {
        summary: "",
        description: '',
        file: '',
        attachFile: '',
        userComments: ''
      },
      message: '',
      loading: false
    }
    this.submitBug = this.submitBug.bind(this);
    this.toggleSmall = this.toggleSmall.bind(this);
  }
  /**
   * Toggle popup to display ticket created msg
   * @param {String} msg Ticket code
   */
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
  /**
   * Submits a bug report to the Jira system.
   * @param {Event} e - The event object.
   */
  submitBug(e) {
    let userComments = document.getElementById("userComments").value;
    let desc = "\nUser Comments - " + userComments + "\nError Page - " + e.location.state.errorPage + "\nError Stack - " + e.location.state.errorStack;
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
  /**
   * Renders the Error page.
   * @returns {JSX.Element} - Error page.
   */
  render() {
    return (
      <div className="app flex-row align-items-center ErrorBg" style={{ backgroundImage: "url(" + ErrorMessageBg + ")" }}>
        <Container>
          <Row className="justify-content-left">
            <Col md="7" lg="7">
              <span className="clearfix">
                <h1 className="float-left display-3 mr-4 err_text">{i18n.t('static.errorPage.error') + " "} <img style={{ width: "150px" }} className='img-fluid' src={ErrorMessageImg}></img></h1>
              </span>
              <span>
                <h3 className=''>{i18n.t('static.errorPage.errorMessage')}</h3>
                <h4 className="pt-3">{i18n.t("static.errorPage.errorReason") + " "} {this.props.location.state.errorMessage}</h4>
              </span>
              <InputGroup className="input-prepend">
                <InputGroupAddon addonType="append">
                  <Button color="primary" onClick={() => this.props.history.push(`/ApplicationDashboard/` + AuthenticationService.displayDashboardBasedOnRole())}>{i18n.t('static.errorPage.returnToDashboard')}</Button>
                </InputGroupAddon>
              </InputGroup>
              <FormGroup className='mt-4'>
                <InputGroup>
                  <Input type="textarea" id="userComments" name="userComments" placeholder={i18n.t('static.errorPage.userCommentPlaceholder')} />
                </InputGroup>
              </FormGroup>
              <Button color="primary" onClick={() => this.submitBug(this.props)} className='mt-2'>{i18n.t('static.errorPage.raiseATicket')}</Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
export default PageError;
