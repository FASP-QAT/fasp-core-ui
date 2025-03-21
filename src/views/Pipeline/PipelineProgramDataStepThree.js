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
import ProgramService from "../../api/ProgramService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
/**
 * Defines the validation schema for program health area details.
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
 * Component for pipeline program import health area details
 */
export default class PipelineProgramDataStepThree extends Component {
    constructor(props) {
        super(props);
        this.state = {
            healthAreaList: []
        }
    }
    /**
     * Reterives health area list on component mount
     */
    componentDidMount() {
        var realmId = AuthenticationService.getRealmId();
        ProgramService.getHealthAreaList(realmId)
            .then(response => {
                if (response.status == 200) {
                    var json = response.data;
                    var haList = [];
                    for (var i = 0; i < json.length; i++) {
                        haList[i] = { healthAreaCode: json[i].healthAreaCode, value: json[i].healthAreaId, label: getLabelText(json[i].label, this.state.lang) }
                    }
                    var listArray = haList;
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
     * Renders the pipeline program import health area details screen.
     * @returns {JSX.Element} - Pipeline program import health area details screen.
     */
    render() {
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <Formik
                    enableReinitialize={true}
                    initialValues={{
                        healthAreaId: this.props.items.program.healthAreaArray
                    }}
                    validationSchema={validationSchemaThree}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.props.endProgramInfoStepTwo && this.props.endProgramInfoStepTwo();
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
                            setFieldValue
                        }) => (
                            <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='healthAreaForm'>
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
                                        }}
                                        onBlur={handleBlur}
                                        bsSize="sm"
                                        multi
                                        name="healthAreaId"
                                        id="healthAreaId"
                                        options={this.state.healthAreaList}
                                        value={this.props.items.program.healthAreaArray}
                                    />
                                    <FormFeedback className="red">{errors.healthAreaId}</FormFeedback>
                                </FormGroup>
                                <FormGroup>
                                    <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.backToprogramInfoStepOne} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                    &nbsp;
                                    <Button color="info" size="md" className="float-left mr-1" type="submit" >{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                    &nbsp;
                                </FormGroup>
                            </Form>
                        )} />
            </>
        );
    }
}