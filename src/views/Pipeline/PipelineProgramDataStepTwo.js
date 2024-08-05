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
import ProgramService from "../../api/ProgramService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
/**
 * Defines the validation schema for program realm country details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchemaTwo = function (values) {
    return Yup.object().shape({
        realmCountryId: Yup.string()
            .required(i18n.t('static.program.validcountrytext')),
    })
}
/**
 * Component for pipeline program import realm country details
 */
export default class PipelineProgramDataStepTwo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realmCountryList: []
        }
    }
    /**
     * Reterives realm country list on component mount
     */
    componentDidMount() {
        var realmId = AuthenticationService.getRealmId();
        ProgramService.getRealmCountryList(realmId)
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realmCountryList: response.data
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
     * Renders the pipeline program import realm country details screen.
     * @returns {JSX.Element} - Pipeline program import realm country details screen.
     */
    render() {
        const { realmCountryList } = this.state;
        let realmCountries = realmCountryList.length > 0
            && realmCountryList.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.country.label, this.state.lang)}
                    </option>
                )
            }, this);
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <Formik
                    enableReinitialize={true}
                    initialValues={{ realmCountryId: this.props.items.program.realmCountry.realmCountryId }}
                    validationSchema={validationSchemaTwo}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.props.endProgramInfoStepOne && this.props.endProgramInfoStepOne();
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
                            <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='realmCountryForm'>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.program.realmcountry')}<span className="red Reqasterisk">*</span></Label>
                                    <Input
                                        valid={!errors.realmCountryId && this.props.items.program.realmCountry.realmCountryId != ''}
                                        invalid={touched.realmCountryId && !!errors.realmCountryId}
                                        onChange={(e) => { handleChange(e); this.props.dataChange(e); this.props.getRegionList(e) }}
                                        bsSize="sm"
                                        className="col-md-4"
                                        onBlur={handleBlur}
                                        value={this.props.items.program.realmCountry.realmCountryId}
                                        type="select" name="realmCountryId" id="realmCountryId">
                                        <option value="">{i18n.t('static.common.select')}</option>
                                        {realmCountries}
                                    </Input>
                                    <FormFeedback className="red">{errors.realmCountryId}</FormFeedback>
                                    <span className="red">{this.props.items.validationFailedMessage}</span>
                                </FormGroup>
                                <FormGroup>
                                    <Button color="info" size="md" className="float-left mr-1" type="submit" >{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                </FormGroup>
                            </Form>
                        )} />
            </>
        );
    }
}