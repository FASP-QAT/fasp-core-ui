import React, { Component } from 'react';

import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import ProgramService from "../../api/ProgramService";
import { Formik } from 'formik';
import * as Yup from 'yup'
import {
    Button, FormFeedback, CardBody,
    Form, FormGroup, Label, Input, Dropdown,
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants';
import DropdownService from '../../api/DropdownService';

const initialValuesFour = {
    organisationId: ''
}

const validationSchemaFour = function (values) {
    return Yup.object().shape({
        organisationId: Yup.string()
            .required(i18n.t('static.program.validorganisationtext')),
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


export default class StepFour extends Component {
    constructor(props) {
        super(props);
        this.state = {
            organisationList: []
        }
        this.generateOrganisationCode = this.generateOrganisationCode.bind(this);
    }

    touchAllFour(setTouched, errors) {
        setTouched({
            organisationId: true
        }
        )
        this.validateFormFour(errors)
    }
    validateFormFour(errors) {
        this.findFirstErrorFour('organisationForm', (fieldName) => {
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

    generateOrganisationCode(event) {
        let organisationCode = this.state.organisationList.filter(c => (c.id == event.target.value))[0].code;
        // alert(organisationCode);
        this.props.generateOrganisationCode(organisationCode);
    }

    getOrganisationList() {
        // AuthenticationService.setupAxiosInterceptors();
        // ProgramService.getOrganisationList(this.props.items.program.realm.realmId)
        DropdownService.getOrganisationListByRealmCountryId(this.props.items.program.realmCountry.realmCountryId)
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
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
                            // message: 'static.unkownError',
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

    componentDidMount() {

    }
    render() {
        const { organisationList } = this.state;
        let realmOrganisation = organisationList.length > 0
            && organisationList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
                        {/* {item.organisationCode} */}
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <Formik
                    initialValues={initialValuesFour}
                    validate={validateFour(validationSchemaFour)}
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
                                    <Button color="info" size="md" className="float-left mr-1" type="submit" name="organizationSub" id="organizationSub" onClick={() => this.touchAllFour(setTouched, errors)} disabled={!isValid} >{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                    &nbsp;
                                </FormGroup>
                            </Form>
                        )} />


            </>

        );
    }
}