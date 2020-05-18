import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormFeedback, FormGroup, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'

import RealmService from "../../api/RealmService";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'

import getLabelText from '../../CommonComponent/getLabelText';
const entityname = i18n.t('static.procurementagent.procurementagent')

const initialValues = {
    realmId: [],
    procurementAgentCode: "",
    procurementAgentName: "",
    submittedToApprovedLeadTime: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),
        procurementAgentCode: Yup.string()
            .required(i18n.t('static.procurementagent.codetext')),
        procurementAgentName: Yup.string()
            .required(i18n.t('static.procurementAgent.procurementagentnametext')),
        submittedToApprovedLeadTime: Yup.string()
            .matches(/^[0-9]*$/, i18n.t('static.procurementagent.onlynumberText'))
            .required(i18n.t('static.procurementagent.submitToApproveLeadTime'))
        // submittedToApprovedLeadTime: Yup.number()
        //     .typeError(i18n.t('static.procurementUnit.validNumberText'))
        //     .required(i18n.t('static.procurementagent.submitToApproveLeadTime'))
        //     .min(0, i18n.t('static.program.validvaluetext'))

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
class AddProcurementAgentComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            procurementAgent: {
                realm: {
                    id: ''
                },
                label: {
                    label_en: ''

                },
                procurementAgentCode: '',
                submittedToApprovedLeadTime: ''
            },
            message: '',
            lang: localStorage.getItem('lang')
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
    }

    Capitalize(str) {
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }


    dataChange(event) {
        let { procurementAgent } = this.state;
        if (event.target.name == "realmId") {
            procurementAgent.realm.id = event.target.value;
        }
        if (event.target.name == "procurementAgentCode") {
            procurementAgent.procurementAgentCode = event.target.value;
        }
        if (event.target.name == "procurementAgentName") {
            procurementAgent.label.label_en = event.target.value;
        }
        if (event.target.name == "submittedToApprovedLeadTime") {
            procurementAgent.submittedToApprovedLeadTime = event.target.value;
        }


        this.setState({
            procurementAgent
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            realmId: true,
            procurementAgentCode: true,
            procurementAgentName: true,
            submittedToApprovedLeadTime: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('procurementAgentForm', (fieldName) => {
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
                if (response.status == 200) {
                    this.setState({
                        realms: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
    }

    render() {
        const { realms } = this.state;
        let realmList = realms.length > 0
            && realms.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} />
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>

                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    ProcurementAgentService.addProcurementAgent(this.state.procurementAgent)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/procurementAgent/listProcurementAgent/` + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                })
                                            }
                                        })
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
                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='procurementAgentForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.realm.realmName')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                        <Input
                                                            type="select"
                                                            bsSize="sm"
                                                            name="realmId"
                                                            id="realmId"
                                                            valid={!errors.realmId && this.state.procurementAgent.realm.id != ''}
                                                            invalid={touched.realmId && !!errors.realmId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementAgent.realm.id}
                                                            required
                                                        >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {realmList}
                                                        </Input>
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="procurementAgentCode">{i18n.t('static.procurementagent.procurementagentcode')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText> */}
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
                                                            value={this.Capitalize(this.state.procurementAgent.procurementAgentCode)}
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.procurementAgentCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="procurementAgentName">{i18n.t('static.procurementagent.procurementagentname')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            bsSize="sm"
                                                            name="procurementAgentName"
                                                            id="procurementAgentName"
                                                            valid={!errors.procurementAgentName && this.state.procurementAgent.label.label_en != ''}
                                                            invalid={touched.procurementAgentName && !!errors.procurementAgentName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.Capitalize(this.state.procurementAgent.label.label_en)}
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        {/* <FormFeedback className="red">{errors.procurementAgentName}</FormFeedback> */}
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="submittedToApprovedLeadTime">{i18n.t('static.procurementagent.procurementagentsubmittoapprovetime')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-clock-o"></i></InputGroupText> */}
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
                                                            min={1}
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.submittedToApprovedLeadTime}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

                                                        &nbsp;
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>

                                        )} />

                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/procurementAgent/listProcurementAgent/` + i18n.t('static.message.cancelled', { entityname }))
    }
    resetClicked() {
        let { procurementAgent } = this.state;

        procurementAgent.realm.id = ''
        procurementAgent.procurementAgentCode = ''
        procurementAgent.label.label_en = ''
        procurementAgent.submittedToApprovedLeadTime = ''

        this.setState({
            procurementAgent
        },
            () => { });
    }
}

export default AddProcurementAgentComponent;
