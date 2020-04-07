import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, FormFeedback, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';
import RealmService from "../../api/RealmService";
import ProcurementAgentService from "../../api/ProcurementAgentService";
import AuthenticationService from '../Common/AuthenticationService.js';

import getLabelText from '../../CommonComponent/getLabelText';
const entityname = i18n.t('static.procurementagent.procurementagent');

const initialValues = {
    procurementAgentName: "",
    submittedToApprovedLeadTime: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        procurementAgentName: Yup.string()
            .required(i18n.t('static.procurementAgent.procurementagentnametext')),
        submittedToApprovedLeadTime: Yup.string()
            .matches(/^[0-9]*$/, i18n.t('static.procurementagent.onlynumberText'))
            .required(i18n.t('static.procurementagent.submitToApproveLeadTime'))
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
class EditProcurementAgentComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            procurementAgent: this.props.location.state.procurementAgent,
            message: '',
            lang: localStorage.getItem('lang')
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
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
            procurementAgent.realm.realmId = event.target.value;
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
        if (event.target.name == "active") {
            procurementAgent.active = event.target.id === "active2" ? false : true;
        }


        this.setState({
            procurementAgent
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
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

    render() {
        return (
            <div className="animated fadeIn">
                <h5>{this.state.message}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>

                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity',{entityname})}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={
                                    {
                                        procurementAgentCode: this.state.procurementAgent.procurementAgentCode,
                                        procurementAgentName: this.state.procurementAgent.label.label_en,
                                        submittedToApprovedLeadTime: this.state.procurementAgent.submittedToApprovedLeadTime
                                    }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    ProcurementAgentService.updateProcurementAgent(this.state.procurementAgent)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/procurementAgent/listProcurementAgent/` + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                })
                                            }
                                        })
                                        .catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({ message: error.message });
                                                } else {
                                                    switch (error.response ? error.response.status : "") {
                                                        case 500:
                                                        case 401:
                                                        case 404:
                                                        case 406:
                                                        case 412:
                                                            this.setState({ message: error.response.data.messageCode });
                                                            break;
                                                        default:
                                                            this.setState({ message: 'static.unkownError' });
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
                                        setTouched
                                    }) => (
                                            <Form onSubmit={handleSubmit} noValidate name='procurementAgentForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.realm.realmName')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                        <Input
                                                            type="text"
                                                            name="realmId"
                                                            id="realmId"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={getLabelText(this.state.procurementAgent.realm.label, this.state.lang)}
                                                        >
                                                        </Input>
                                                        {/* </InputGroupAddon> */}
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="procurementAgentCode">{i18n.t('static.procurementagent.procurementagentcode')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            bsSize="sm"
                                                            name="procurementAgentCode"
                                                            id="procurementAgentCode"
                                                            readOnly={true}
                                                            value={this.Capitalize(this.state.procurementAgent.procurementAgentCode)}
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.procurementAgentCode}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="procurementAgentName">{i18n.t('static.procurementagent.procurementagentname')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            bsSize="sm"
                                                            name="procurementAgentName"
                                                            id="procurementAgentName"
                                                            valid={!errors.procurementAgentName}
                                                            invalid={touched.procurementAgentName && !!errors.procurementAgentName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={this.Capitalize(getLabelText(this.state.procurementAgent.label, this.state.lang))}
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.procurementAgentName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="submittedToApprovedLeadTime">{i18n.t('static.procurementagent.procurementagentsubmittoapprovetime')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-clock-o"></i></InputGroupText> */}
                                                        <Input type="number"
                                                            bsSize="sm"
                                                            name="submittedToApprovedLeadTime"
                                                            id="submittedToApprovedLeadTime"
                                                            valid={!errors.submittedToApprovedLeadTime}
                                                            invalid={touched.submittedToApprovedLeadTime && !!errors.submittedToApprovedLeadTime}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            min={1}
                                                            value={this.state.procurementAgent.submittedToApprovedLeadTime}
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.submittedToApprovedLeadTime}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label className="P-absltRadio">{i18n.t('static.common.status')}  </Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.procurementAgent.active === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio1">
                                                                {i18n.t('static.common.active')}
                                                            </Label>
                                                        </FormGroup>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active2"
                                                                name="active"
                                                                value={false}
                                                                checked={this.state.procurementAgent.active === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2">
                                                                {i18n.t('static.common.disabled')}
                                                            </Label>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
}

export default EditProcurementAgentComponent;
