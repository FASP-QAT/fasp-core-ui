import classNames from 'classnames';
import { Formik } from 'formik';
import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import {
    Button,
    Form,
    FormFeedback,
    FormGroup, Label
} from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants';
import DropdownService from '../../api/DropdownService';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
// Initial values for form fields
const initialValuesThree = {
    healthAreaId: []
}
/**
 * Defines the validation schema for step three of program onboarding.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchemaThree = function (values) {
    return Yup.object().shape({
        healthAreaId: Yup.string()
            .required(i18n.t('static.program.validhealthareatext')),
    })
}
/**
 * Component for program Onboarding step three for taking the realm country details for the program
 */
export default class StepThree extends Component {
    constructor(props) {
        super(props);
        this.state = {
            healthAreaList: [],
            healthAreaId: ''
        }
        this.generateHealthAreaCode = this.generateHealthAreaCode.bind(this);
    }
    /**
     * Generates a health area code based on the selected health ID.
     * @param {Event} event - The change event containing the selected health area ID.
     */
    generateHealthAreaCode(value) {
        var healthAreaId = value;
        let healthAreaCode = ''
        for (var i = 0; i < healthAreaId.length; i++) {
            healthAreaCode += this.state.healthAreaList.filter(c => (c.value == healthAreaId[i].value))[0].healthAreaCode + "/";
        }
        this.props.generateHealthAreaCode(healthAreaCode.slice(0, -1));
    }
    /**
     * Reterives health area list from server
     */
    getHealthAreaList() {
        DropdownService.getHealthAreaDropdownList(this.props.items.program.realm.realmId)
            .then(response => {
                if (response.status == 200) {
                    var json = response.data;
                    var haList = [];
                    for (var i = 0; i < json.length; i++) {
                        haList[i] = { healthAreaCode: json[i].code, value: json[i].id, label: getLabelText(json[i].label, this.state.lang) }
                    }
                    var listArray = haList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase(); 
                        var itemLabelB = b.label.toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        healthAreaId: '',
                        healthAreaList: listArray
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
     * Renders the program onboarding step three screen.
     * @returns {JSX.Element} - Program onboarding step three screen.
     */
    render() {
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <Formik
                    initialValues={initialValuesThree}
                    validationSchema={validationSchemaThree}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.props.finishedStepThree && this.props.finishedStepThree();
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
                            handleReset,
                            setFieldValue
                        }) => (
                            <Form className="needs-validation" onReset={handleReset} onSubmit={handleSubmit} noValidate name='healthAreaForm'>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.program.healtharea')}<span class="red Reqasterisk">*</span></Label>
                                    <Select
                                        className={classNames('form-control', 'col-md-4', 'd-block', 'w-100', 'bg-light',
                                            { 'is-valid': !errors.healthAreaId && this.props.items.program.healthAreaArray.length != 0 },
                                            { 'is-invalid': (touched.healthAreaId && !!errors.healthAreaId) }
                                        )}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setFieldValue("healthAreaId", e);
                                            this.props.updateFieldDataHealthArea(e);
                                            this.generateHealthAreaCode(e)
                                        }}
                                        onBlur={handleBlur}
                                        bsSize="sm"
                                        name="healthAreaId"
                                        id="healthAreaId"
                                        multi
                                        options={this.state.healthAreaList}
                                        value={this.props.items.program.healthAreaArray}
                                    />
                                    <FormFeedback className="red">{errors.healthAreaId}</FormFeedback>
                                </FormGroup>
                                <FormGroup>
                                    <Button color="info" size="md" className="float-left mr-1" type="reset" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepTwo} ><i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                    &nbsp;
                                    <Button color="info" size="md" className="float-left mr-1" type="submit" name="healthAreaSub" id="healthAreaSub" disabled={!isValid}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                    &nbsp;
                                </FormGroup>
                            </Form>
                        )} />
            </>
        );
    }
}