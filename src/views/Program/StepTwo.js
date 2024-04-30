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
const initialValuesTwo = {
    realmCountryId: ''
}
/**
 * Defines the validation schema for step two of program onboarding.
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
 * Component for program Onboarding step two for taking the realm country details for the program
 */
export default class Steptwo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realmCountryList: []
        }
        this.generateCountryCode = this.generateCountryCode.bind(this);
    }
    /**
     * Generates a country code based on the selected realm country ID.
     * @param {Event} event - The change event containing the selected realm country ID.
     */ 
    generateCountryCode(event) {
        let realmCountryCode = this.state.realmCountryList.filter(c => (c.id == event.target.value))[0].code;
        this.props.generateCountryCode(realmCountryCode);
    }
    /**
     * Reterives Realm country list from server
     */
    getRealmCountryList() {
        DropdownService.getRealmCountryDropdownList(this.props.items.program.realm.realmId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        realmCountryList: listArray
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
     * Renders the program onboarding step two screen.
     * @returns {JSX.Element} - Program onboarding step two screen.
     */
    render() {
        const { realmCountryList } = this.state;
        let realmCountries = realmCountryList.length > 0
            && realmCountryList.map((item, i) => {
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
                    initialValues={initialValuesTwo}
                    validationSchema={validationSchemaTwo}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.props.finishedStepTwo && this.props.finishedStepTwo();
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
                                    <Label htmlFor="select">{i18n.t('static.program.realmcountry')}<span class="red Reqasterisk">*</span></Label>
                                    <Input
                                        valid={!errors.realmCountryId && this.props.items.program.realmCountry.realmCountryId != ''}
                                        invalid={touched.realmCountryId && !!errors.realmCountryId}
                                        onChange={(e) => { handleChange(e); this.props.dataChange(e); this.props.getRegionList(e); this.generateCountryCode(e) }}
                                        bsSize="sm"
                                        className="col-md-4"
                                        onBlur={handleBlur}
                                        type="select" name="realmCountryId" id="realmCountryId">
                                        <option value="">{i18n.t('static.common.select')}</option>
                                        {realmCountries}
                                    </Input>
                                    <FormFeedback className="red">{errors.realmCountryId}</FormFeedback>
                                </FormGroup>
                                <FormGroup>
                                    <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepOne} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                    &nbsp;
                                    <Button color="info" size="md" className="float-left mr-1" type="submit" disabled={!isValid}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                    &nbsp;
                                </FormGroup>
                            </Form>
                        )} />
            </>
        );
    }
}