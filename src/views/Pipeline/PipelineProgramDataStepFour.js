import React, { Component } from 'react';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import ProgramService from "../../api/ProgramService";
import { Formik } from 'formik';
import * as Yup from 'yup'
import {
    Button, FormFeedback, CardBody,
    Form, FormGroup, Label, Input,
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants';
/**
 * Defines the validation schema for program organisation details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchemaFour = function (values) {
    return Yup.object().shape({
        organisationId: Yup.string()
            .required(i18n.t('static.program.validorganisationtext')),
    })
}
/**
 * Component for pipeline program import organisation details
 */
export default class PipelineProgramDataStepFour extends Component {
    constructor(props) {
        super(props);
        this.state = {
            organisationList: []
        }
    }
    /**
     * Reterives organisation list
     */
    componentDidMount() {
        var realmId = AuthenticationService.getRealmId();
        ProgramService.getOrganisationList(realmId)
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        organisationList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
            .catch(
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
     * Renders the pipeline program import organisation details screen.
     * @returns {JSX.Element} - Pipeline program import organisation details screen.
     */
    render() {
        const { organisationList } = this.state;
        let realmOrganisation = organisationList.length > 0
            && organisationList.map((item, i) => {
                return (
                    <option key={i} value={item.organisationId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <Formik
                    enableReinitialize={true}
                    initialValues={{ organisationId: this.props.items.program.organisation.id }}
                    validationSchema={validationSchemaFour}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.props.endProgramInfoStepThree && this.props.endProgramInfoStepThree();
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
                            <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='organisationForm'>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.program.organisation')}<span class="red Reqasterisk">*</span></Label>
                                    <Input
                                        valid={!errors.organisationId && this.props.items.program.organisation.id != ''}
                                        invalid={touched.organisationId && !!errors.organisationId}
                                        onBlur={handleBlur}
                                        bsSize="sm"
                                        type="select"
                                        name="organisationId"
                                        id="organisationId"
                                        className="col-md-4"
                                        value={this.props.items.program.organisation.id}
                                        onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                    >
                                        <option value="">{i18n.t('static.common.select')}</option>
                                        {realmOrganisation}
                                    </Input>
                                    <FormFeedback className="red">{errors.organisationId}</FormFeedback>
                                </FormGroup>
                                <FormGroup>
                                    <Button color="info" size="md" className="float-left mr-1" type="button" name="organizationPrevious" id="organizationPrevious" onClick={this.props.backToprogramInfoStepTwo} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                    &nbsp;
                                    <Button color="info" size="md" className="float-left mr-1" type="submit" name="organizationSub" id="organizationSub" >{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                    &nbsp;
                                </FormGroup>
                            </Form>
                        )} />
            </>
        );
    }
}