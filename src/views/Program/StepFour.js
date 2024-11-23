import { Formik } from 'formik';
import React, { Component } from 'react';
import {
    Button,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label
} from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants';
import DropdownService from '../../api/DropdownService';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Initial values for form fields
const initialValuesFour = {
    organisationId: ''
}
/**
 * Defines the validation schema for step four of program onboarding.
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
 * Component for program Onboarding step six for taking the organisation details for program
 */
export default class StepFour extends Component {
    constructor(props) {
        super(props);
        this.state = {
            organisationList: []
        }
        this.generateOrganisationCode = this.generateOrganisationCode.bind(this);
    }
    /**
     * Generates a organisation code based on the selected organisation ID.
     * @param {Event} event - The change event containing the selected organisation ID.
     */
    generateOrganisationCode(event) {
        let organisationCode = this.state.organisationList.filter(c => (c.id == event.target.value))[0].code;
        this.props.generateOrganisationCode(organisationCode);
    }
    /**
     * Reterives organisation list from server
     */
    getOrganisationList() {
        DropdownService.getOrganisationListByRealmCountryId(this.props.items.program.realmCountry.realmCountryId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        organisationList: listArray
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
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
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
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
     * Renders the program onboarding step four screen.
     * @returns {JSX.Element} - Program onboarding step four screen.
     */
    render() {
        const { organisationList } = this.state;
        let realmOrganisation = organisationList.length > 0
            && organisationList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <Formik
                    initialValues={initialValuesFour}
                    validationSchema={validationSchemaFour}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.props.finishedStepFour && this.props.finishedStepFour();
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
                            <Form className="needs-validation" onReset={handleReset} onSubmit={handleSubmit} noValidate name='organisationForm'>
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
                                        onChange={(e) => { handleChange(e); this.props.dataChange(e); this.generateOrganisationCode(e) }}
                                    >
                                        <option value="">{i18n.t('static.common.select')}</option>
                                        {realmOrganisation}
                                    </Input>
                                    <FormFeedback className="red">{errors.organisationId}</FormFeedback>
                                </FormGroup>
                                <FormGroup>
                                    <Button color="info" size="md" className="float-left mr-1" type="reset" name="organizationPrevious" id="organizationPrevious" onClick={this.props.previousToStepThree} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                    &nbsp;
                                    <Button color="info" size="md" className="float-left mr-1" type="submit" name="organizationSub" id="organizationSub" disabled={!isValid} >{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                    &nbsp;
                                </FormGroup>
                            </Form>
                        )} />
            </>
        );
    }
}