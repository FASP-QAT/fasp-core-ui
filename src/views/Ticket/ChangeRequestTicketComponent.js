import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, ModalFooter } from 'reactstrap';
import * as Yup from 'yup';
import { API_URL, SPACE_REGEX } from '../../Constants';
import JiraTikcetService from '../../api/JiraTikcetService';
import i18n from '../../i18n';
import TicketPriorityComponent from './TicketPriorityComponent';
const initialValues = {
    summary: "",
    description: "",
    priority: 3
}
const entityname = i18n.t('static.program.realmcountry');
/**
 * This const is used to define the validation schema for change request ticket component
 * @param {*} values 
 * @returns 
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        description: Yup.string()
            .required(i18n.t('static.common.descriptiontext')),
        attachFile: Yup.string()
            .required(i18n.t('static.program.selectfile'))
    })
}
/**
 * This component is used to display the change request form and allow user to submit the change request in jira
 */
export default class ChangeRequestTicketComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            changeRequest: {
                summary: '',
                description: '',
                file: '',
                attachFile: '',
                priority: 3
            },
            message: '',
            loading: false
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.updatePriority = this.updatePriority.bind(this);
    }
    /**
     * This function is called when some data in the form is changed
     * @param {*} event This is the on change event
     */
    dataChange(event) {
        let { changeRequest } = this.state
        if (event.target.name == "summary") {
            changeRequest.summary = event.target.value;
        }
        if (event.target.name == "description") {
            changeRequest.description = event.target.value;
        }
        if (event.target.name == "attachFile") {
            changeRequest.file = event.target.files[0];
            changeRequest.attachFile = event.target.files[0].name;
        }
        this.setState({
            changeRequest
        }, () => { })
    };
    /**
     * This function is used to hide the messages that are there in div2 after 30 seconds
     */
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }
    /**
     * This function is called when reset button is clicked to reset the change request details
     */
    resetClicked() {
        let { changeRequest } = this.state;
        changeRequest.summary = '';
        changeRequest.description = '';
        changeRequest.file = '';
        changeRequest.attachFile = '';
        changeRequest.priority = 3;
        this.setState({
            changeRequest
        },
            () => { });
    }
    /**
     * This function is used to update the ticket priority in state
     * @param {*} newState - This the selected priority
     */
    updatePriority(newState){
        // console.log('priority - : '+newState);
        let { changeRequest } = this.state;
        changeRequest.priority = newState;
        this.setState(
            {
                changeRequest
            }, () => {

                // console.log('priority - state : '+this.state.changeRequest.priority);
            }
        );
    }

    /**
     * This is used to display the content
     * @returns This returns change request details form
     */
    render() {
        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.ticket.changeRequest')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            JiraTikcetService.addChangeRequest(this.state.changeRequest).then(response => {
                                if (response.status == 200 || response.status == 201) {
                                    var msg = response.data.key;
                                    JiraTikcetService.addIssueAttachment(this.state.changeRequest, response.data.id).then(response => {
                                    });
                                    this.setState({
                                        message: msg, loading: false
                                    },
                                        () => {
                                            this.resetClicked();
                                            this.hideSecondComponent();
                                        })
                                } else {
                                    this.setState({
                                        message: i18n.t('static.unkownError'), loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }
                                this.props.togglehelp();
                                this.props.toggleSmall(this.state.message);
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
                        }}
                        render={
                            ({
                                values,
                                errors,
                                touched,
                                handleChange,
                                handleBlur,
                                handleSubmit,
                                isSubmitting,
                                isValid,
                                setTouched,
                                handleReset
                            }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm'>
                                    < FormGroup >
                                        <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="text" name="summary" id="summary"
                                            bsSize="sm"
                                            valid={!errors.summary && this.state.changeRequest.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={100}
                                            value={this.state.changeRequest.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="description">{i18n.t('static.common.description')}<span class="red Reqasterisk">*</span></Label>
                                        <Input type="textarea" name="description" id="description"
                                            bsSize="sm"
                                            valid={!errors.description && this.state.changeRequest.description != ''}
                                            invalid={touched.description && !!errors.description}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            maxLength={600}
                                            value={this.state.changeRequest.description}
                                            required />
                                        <FormFeedback className="red">{errors.description}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup >
                                        <Col>
                                            <Label className="uploadfilelable" htmlFor="attachFile">{i18n.t('static.ticket.uploadScreenshot')}<span class="red Reqasterisk">*</span></Label>
                                        </Col>
                                        <div className="custom-file">
                                            <Input type="file" className="custom-file-input" id="attachFile" name="attachFile" accept=".zip,.png,.jpg,.jpeg"
                                                valid={!errors.attachFile && this.state.changeRequest.attachFile != ''}
                                                invalid={touched.attachFile && !!errors.attachFile}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                            />
                                            <label className="custom-file-label" id="attachFile" data-browse={i18n.t('static.uploadfile.Browse')} >{this.state.changeRequest.attachFile}</label>
                                            <FormFeedback className="red">{errors.attachFile}</FormFeedback>
                                        </div>
                                        <br></br><br></br>
                                        <div>
                                            <p>{i18n.t('static.ticket.filesuploadnote')}</p>
                                        </div>
                                    </FormGroup>
                                    <FormGroup>
                                        <TicketPriorityComponent priority={this.state.changeRequest.priority} updatePriority={this.updatePriority}/>
                                    </FormGroup>
                                    <ModalFooter className="pr-0 pb-0">
                                        <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMain}><i className="fa fa-angle-double-left "></i> {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" disabled={!isValid}><i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                </Form>
                            )} />
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}