import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import { SPACE_REGEX } from '../../Constants';

// let summaryText_1 = (i18n.t('static.common.bugreport'))
// let summaryText_2 = "Report a bug"
const initialValues = {
    summary: "",
    description: ""
}
const entityname = i18n.t('static.program.realmcountry');
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

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
}

const getErrorsFromValidationError = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}

export default class BugReportTicketComponent extends Component {

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
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    dataChange(event) {
        let { bugReport } = this.state
        if (event.target.name == "summary") {
            bugReport.summary = event.target.value;
        }
        if (event.target.name == "description") {
            bugReport.description = event.target.value;
        }
        if (event.target.name == "attachFile") {
            bugReport.file = event.target.files[0];
            bugReport.attachFile = event.target.files[0].name;
        }
        this.setState({
            bugReport
        }, () => { })
    };

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            description: true
        })
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstError(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { bugReport } = this.state;
        bugReport.summary = '';
        bugReport.description = '';
        bugReport.file = '';
        bugReport.attachFile = '';
        this.setState({
            bugReport
        },
            () => { });
    }

    render() {

        return (
            <div className="col-md-12">
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.common.bugreport')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        initialValues={initialValues}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            // this.state.bugReport.summary = summaryText_2;
                            JiraTikcetService.addBugReportIssue(this.state.bugReport).then(response => {
                                console.log("Response :", response.status, ":", JSON.stringify(response.data));
                                if (response.status == 200 || response.status == 201) {
                                    var msg = response.data.key;
                                    JiraTikcetService.addIssueAttachment(this.state.bugReport, response.data.id).then(response => {

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
                                            message: 'static.unkownError',
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
                                                valid={!errors.summary && this.state.bugReport.summary != ''}
                                                invalid={touched.summary && !!errors.summary}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}                                                
                                                maxLength={100}
                                                value={this.state.bugReport.summary}
                                                required />
                                            <FormFeedback className="red">{errors.summary}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="description">{i18n.t('static.common.description')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="textarea" name="description" id="description"
                                                bsSize="sm"
                                                valid={!errors.description && this.state.bugReport.description != ''}
                                                invalid={touched.description && !!errors.description}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                maxLength={600}
                                                value={this.state.bugReport.description}
                                                required />
                                            <FormFeedback className="red">{errors.description}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup >
                                            <Col>
                                                <Label className="uploadfilelable" htmlFor="attachFile">{i18n.t('static.ticket.uploadScreenshot')}<span class="red Reqasterisk">*</span></Label>
                                            </Col>
                                            <div className="custom-file">
                                                <Input type="file" className="custom-file-input" id="attachFile" name="attachFile"  accept=".zip,.png,.jpg,.jpeg"
                                                    valid={!errors.attachFile && this.state.bugReport.attachFile != ''}
                                                    invalid={touched.attachFile && !!errors.attachFile}
                                                    onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                    onBlur={handleBlur}
                                                />
                                    
                                                <label className="custom-file-label" id="attachFile" data-browse={i18n.t('static.uploadfile.Browse')} >{this.state.bugReport.attachFile}</label>
                                                <FormFeedback className="red">{errors.attachFile}</FormFeedback>
                                            </div>
                                            <br></br><br></br>
                                            <div>
                                                <p>{i18n.t('static.ticket.filesuploadnote')}</p>
                                            </div>
                                        </FormGroup>
                                       
                                        <ModalFooter className="pr-0 pb-0">

                                            <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMain}><i className="fa fa-angle-double-left "></i> {i18n.t('static.common.back')}</Button>
                                            <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                            <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>

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