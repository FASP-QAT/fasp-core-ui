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
import { API_URL } from '../../Constants';
import ProgramService from "../../api/ProgramService";
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
const initialValuesFour = {
    regionId: []
}
const validationSchemaFour = function (values) {
    return Yup.object().shape({
        regionId: Yup.string()
            .required(i18n.t('static.common.regiontext')),
    })
}
const validateFour = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationErrorFour(error)
        }
    }
}
const getErrorsFromValidationErrorFour = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}
export default class PipelineProgramDataStepFive extends Component {
    constructor(props) {
        super(props);
        this.state = {
            regionList: [],
            regionId: ''
        }
    }
    touchAllFour(setTouched, errors) {
        setTouched({
            regionId: true
        }
        )
        this.validateFormFour(errors)
    }
    validateFormFour(errors) {
        this.findFirstErrorFour('regionForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstErrorFour(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }
    componentDidMount() {
        var realmId = AuthenticationService.getRealmId();
        var realmCountryIdd = document.getElementById("realmCountryId").value;
        var healthAreaIdd = this.props.items.program.healthAreaArray;
        var organisationIdd = document.getElementById("organisationId").value;
        if (realmCountryIdd != "") {
            ProgramService.getRealmCountryList(realmId)
                .then(response => {
                    if (response.status == 200) {
                        let realmCountryCode = response.data.filter(c => (c.realmCountryId == realmCountryIdd))[0].country.countryCode;
                        this.props.generateCountryCode(realmCountryCode);
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
        } if (healthAreaIdd != "") {
            ProgramService.getHealthAreaList(realmId)
                .then(response => {
                    if (response.status == 200) {
                        var healthAreaId = healthAreaIdd;
                        let healthAreaCode = ''
                        for (var i = 0; i < healthAreaId.length; i++) {
                            healthAreaCode += response.data.filter(c => (c.healthAreaId == healthAreaId[i]))[0].healthAreaCode + "/";
                        }
                        this.props.generateHealthAreaCode(healthAreaCode.slice(0, -1));
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
        } if (organisationIdd != "") {
            ProgramService.getOrganisationList(realmId)
                .then(response => {
                    if (response.status == 200) {
                        let organisationCode = response.data.filter(c => (c.organisationId == organisationIdd))[0].organisationCode;
                        this.props.generateOrganisationCode(organisationCode);
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
    }
    render() {
        return (
            <>
                <Formik
                    enableReinitialize={true}
                    initialValues={{
                        regionId: this.props.items.program.regionArray,
                    }}
                    validate={validateFour(validationSchemaFour)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.props.endProgramInfoStepFour && this.props.endProgramInfoStepFour();
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
                            setFieldValue,
                            setFieldTouched
                        }) => (
                            <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='regionForm'>
                                <FormGroup>
                                    <Label htmlFor="select">{i18n.t('static.program.region')}<span class="red Reqasterisk">*</span><span class="red Reqasterisk">*</span></Label>
                                    <Select
                                        className={classNames('form-control', 'col-md-4', 'd-block', 'w-100', 'bg-light',
                                            { 'is-valid': !errors.regionId && this.props.items.program.regionArray.length != 0 },
                                            { 'is-invalid': (touched.regionId && !!errors.regionId) }
                                        )}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setFieldValue("regionId", e);
                                            this.props.updateFieldData(e);
                                        }}
                                        onBlur={() => setFieldTouched("regionId", true)}
                                        bsSize="sm"
                                        name="regionId"
                                        id="regionId"
                                        multi
                                        options={this.props.items.regionList}
                                        value={this.props.items.program.regionArray}
                                    />
                                    <FormFeedback className="red">{errors.regionId}</FormFeedback>
                                </FormGroup>
                                <FormGroup>
                                    <Button color="info" size="md" className="float-left mr-1" type="button" name="regionPrevious" id="regionPrevious" onClick={this.props.backToprogramInfoStepThree} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                    &nbsp;
                                    <Button color="info" size="md" className="float-left mr-1" type="submit" name="regionSub" id="regionSub" onClick={() => this.touchAllFour(setTouched, errors)}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                    &nbsp;
                                </FormGroup>
                            </Form>
                        )} />
            </>
        );
    }
}