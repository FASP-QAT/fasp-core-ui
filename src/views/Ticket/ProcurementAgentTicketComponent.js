import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import RealmService from '../../api/RealmService';

const initialValues = {
    summary: "Add / Update Procurement Agent",
    realmName: "",
    procurementAgentName: '',
    procurementAgentCode: '',
    submittedToApprovedLeadTime: '',
    approvedToShippedLeadTime: '',
    localProcurementAgent: false,
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .required(i18n.t('static.common.summarytext')),
        realmName: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        procurementAgentCode: Yup.string()
            .required(i18n.t('static.procurementagent.codetext')),
        procurementAgentName: Yup.string()
            .required(i18n.t('static.procurementAgent.procurementagentnametext')),
        submittedToApprovedLeadTime: Yup.string()
            .required(i18n.t('static.procurementagent.submitToApproveLeadTime')),
        approvedToShippedLeadTime: Yup.string()
            .required(i18n.t('static.procurementagent.approvedToShippedLeadTime')),
        // notes: Yup.string()
        //     .required(i18n.t('static.common.notestext'))
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

export default class ProcurementAgentTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            procurementAgent: {
                summary: "Add / Update Procurement Agent",
                realmName: "",
                procurementAgentName: "",
                procurementAgentCode: "",
                submittedToApprovedLeadTime: "",
                approvedToShippedLeadTime: "",
                localProcurementAgent: false,
                notes: ""
            },
            message : '',
            realms: [],
            realmId: '',
            loading: false
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }

    dataChange(event) {
        let { procurementAgent } = this.state
        if (event.target.name == "summary") {
            procurementAgent.summary = event.target.value;
        }
        if (event.target.name == "realmName") {            
            procurementAgent.realmName = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                realmId : event.target.value
            })
        }
        if (event.target.name == "procurementAgentCode") {
            procurementAgent.procurementAgentCode = event.target.value.toUpperCase();
        }
        if (event.target.name == "procurementAgentName") {
            procurementAgent.procurementAgentName = event.target.value;
        }
        if (event.target.name == "submittedToApprovedLeadTime") {
            procurementAgent.submittedToApprovedLeadTime = event.target.value;
        }
        if (event.target.name == "approvedToShippedLeadTime") {
            procurementAgent.approvedToShippedLeadTime = event.target.value;
        }
        if (event.target.name === "localProcurementAgent") {
            procurementAgent.localProcurementAgent = event.target.id === "localProcurementAgent2" ? false : true
        }
        if (event.target.name == "notes") {
            procurementAgent.notes = event.target.value;
        }
        this.setState({
            procurementAgent
        }, () => { })
    };

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            realmName: true,
            procurementAgentCode: true,
            procurementAgentName: true,
            submittedToApprovedLeadTime: true,
            approvedToShippedLeadTime: true,
            notes: true
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
        AuthenticationService.setupAxiosInterceptors();
        RealmService.getRealmListAll()
            .then(response => {
                this.setState({
                    realms: response.data
                })
            })
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
        let { procurementAgent } = this.state;
        procurementAgent.summary = '';
        procurementAgent.realmName = '';
        procurementAgent.procurementAgentCode = '';
        procurementAgent.procurementAgentName = '';
        procurementAgent.submittedToApprovedLeadTime = '';
        procurementAgent.approvedToShippedLeadTime = '';
        this.setState({
            procurementAgent
        },
            () => { });
    }

    render() {

        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);

        return (
            <div className="col-md-12">
                <h5 style={{ color: "green" }} id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.procurementagent.procurementagent')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.setState({
                            loading: true
                        })
                        JiraTikcetService.addEmailRequestIssue(this.state.procurementAgent).then(response => {                                         
                            console.log("Response :",response.status, ":" ,JSON.stringify(response.data));
                            if (response.status == 200 || response.status == 201) {
                                var msg = response.data.key;
                                this.setState({
                                    message: msg, loading: false
                                },
                                    () => {
                                        this.resetClicked();
                                        this.hideSecondComponent();
                                    })                                
                            } else {
                                this.setState({
                                    // message: response.data.messageCode
                                    message: 'Error while creating query', loading: false
                                },
                                    () => {
                                        this.resetClicked();
                                        this.hideSecondComponent();
                                    })                                
                            }                            
                            this.props.togglehelp();
                            this.props.toggleSmall(this.state.message);
                        })
                        // .catch(
                        //     error => {
                        //         switch (error.message) {
                        //             case "Network Error":
                        //                 this.setState({
                        //                     message: 'Network Error'
                        //                 })
                        //                 break
                        //             default:
                        //                 this.setState({
                        //                     message: 'Error'
                        //                 })
                        //                 break
                        //         }
                        //         alert(this.state.message);
                        //         this.props.togglehelp();
                        //     }
                        // );  
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
                                            valid={!errors.summary && this.state.procurementAgent.summary != ''}
                                            invalid={touched.summary && !!errors.summary}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.procurementAgent.summary}
                                            required />
                                        <FormFeedback className="red">{errors.summary}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label htmlFor="realmName">{i18n.t('static.realm.realmName')}<span className="red Reqasterisk">*</span></Label>
                                        <Input
                                            type="select"
                                            bsSize="sm"
                                            name="realmName"
                                            id="realmName"
                                            valid={!errors.realmName && this.state.procurementAgent.realmName != ''}
                                            invalid={touched.realmName && !!errors.realmName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            value={this.state.realmId}
                                            required
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmList}
                                        </Input>
                                        {/* </InputGroupAddon> */}
                                        <FormFeedback className="red">{errors.realmName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="procurementAgentName">{i18n.t('static.procurementagent.procurementagentname')}<span className="red Reqasterisk">*</span></Label>
                                        <Input type="text"
                                            bsSize="sm"
                                            name="procurementAgentName"
                                            id="procurementAgentName"
                                            valid={!errors.procurementAgentName && this.state.procurementAgent.procurementAgentName != ''}
                                            invalid={touched.procurementAgentName && !!errors.procurementAgentName}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            required
                                            value={this.state.procurementAgent.procurementAgentName}
                                        />
                                        {/* </InputGroupAddon> */}
                                        <FormFeedback className="red">{errors.procurementAgentName}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="procurementAgentCode">{i18n.t('static.procurementagent.procurementagentcode')}<span className="red Reqasterisk">*</span></Label>
                                        <Input type="text"
                                            bsSize="sm"
                                            name="procurementAgentCode"
                                            id="procurementAgentCode"
                                            valid={!errors.procurementAgentCode && this.state.procurementAgent.procurementAgentCode != ''}
                                            invalid={touched.procurementAgentCode && !!errors.procurementAgentCode}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            required
                                            maxLength={6}
                                            value={this.state.procurementAgent.procurementAgentCode}
                                        />
                                        {/* </InputGroupAddon> */}
                                        <FormFeedback className="red">{errors.procurementAgentCode}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="submittedToApprovedLeadTime">{i18n.t('static.procurementagent.procurementagentsubmittoapprovetime')}<span className="red Reqasterisk">*</span></Label>
                                        <Input type="number"
                                            bsSize="sm"
                                            name="submittedToApprovedLeadTime"
                                            id="submittedToApprovedLeadTime"
                                            valid={!errors.submittedToApprovedLeadTime && this.state.procurementAgent.submittedToApprovedLeadTime != ''}
                                            invalid={touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            required
                                            value={this.state.procurementAgent.submittedToApprovedLeadTime}
                                            min="0"
                                        />
                                        {/* </InputGroupAddon> */}
                                        <FormFeedback className="red">{errors.submittedToApprovedLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="approvedToShippedLeadTime">{i18n.t('static.procurementagent.procurementagentapprovetoshippedtime')}<span className="red Reqasterisk">*</span></Label>
                                        <Input type="number"
                                            bsSize="sm"
                                            name="approvedToShippedLeadTime"
                                            id="approvedToShippedLeadTime"
                                            valid={!errors.approvedToShippedLeadTime && this.state.procurementAgent.approvedToShippedLeadTime != ''}
                                            invalid={touched.approvedToShippedLeadTime && !!errors.approvedToShippedLeadTime}
                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            onBlur={handleBlur}
                                            required
                                            value={this.state.procurementAgent.approvedToShippedLeadTime}
                                            min="1"
                                        />
                                        {/* </InputGroupAddon> */}
                                        <FormFeedback className="red">{errors.approvedToShippedLeadTime}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className="P-absltRadio">{i18n.t('static.procurementAgent.localProcurementAgent')}  </Label>
                                        <FormGroup check inline className="ml-12 ml-procumnentAgentTicket">
                                            <Input
                                                className="form-check-input"
                                                type="radio"
                                                id="localProcurementAgent1"
                                                name="localProcurementAgent"
                                                value={true}
                                                checked={this.state.procurementAgent.localProcurementAgent === true}
                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                check htmlFor="inline-radio1">
                                                {i18n.t('static.program.yes')}
                                            </Label>
                                        </FormGroup>
                                        <FormGroup check inline>
                                            <Input
                                                className="form-check-input"
                                                type="radio"
                                                id="localProcurementAgent2"
                                                name="localProcurementAgent"
                                                value={false}
                                                checked={this.state.procurementAgent.localProcurementAgent === false}
                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                            />
                                            <Label
                                                className="form-check-label"
                                                check htmlFor="inline-radio2">
                                                {i18n.t('static.program.no')}
                                            </Label>
                                        </FormGroup>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                        <Input type="textarea" name="notes" id="notes"
                                            bsSize="sm"
                                            valid={!errors.notes && this.state.procurementAgent.notes != ''}
                                            invalid={touched.notes && !!errors.notes}
                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                            onBlur={handleBlur}
                                            value={this.state.procurementAgent.notes}
                                            // required 
                                            />
                                        <FormFeedback className="red">{errors.notes}</FormFeedback>
                                    </FormGroup>
                                    <ModalFooter className="pb-0 pr-0">
                                        <Button type="button" size="md" color="info" className="mr-1" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                        <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                        <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i> {i18n.t('static.common.submit')}</Button>
                                    </ModalFooter>
                                </Form>
                            )} />
                            </div>
                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                    <div class="align-items-center">
                                        <div ><h4> <strong>Loading...</strong></h4></div>
                                        <div class="spinner-border blue ml-4" role="status"></div>
                                    </div>
                                </div> 
                            </div>
            </div>
        );
    }

}