import React, { Component } from 'react';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from "../../api/ProgramService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { Formik } from 'formik';
import * as Yup from 'yup'
import {
    Button, FormFeedback, CardBody,
    Form, FormGroup, Label, Input,
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';

const initialValuesTwo = {
    realmCountryId: ''
}

const validationSchemaTwo = function (values) {
    return Yup.object().shape({
        realmCountryId: Yup.string()
            .required(i18n.t('static.program.validcountrytext')),
    })
}

const validateTwo = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationErrorTwo(error)
        }
    }
}

const getErrorsFromValidationErrorTwo = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}


export default class Steptwo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            realmCountryList: []
        }
        this.generateCountryCode = this.generateCountryCode.bind(this);

    }

    touchAllTwo(setTouched, errors) {
        setTouched({
            realmCountryId: true
        }
        )
        this.validateFormTwo(errors)
    }
    validateFormTwo(errors) {
        this.findFirstErrorTwo('realmCountryForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstErrorTwo(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    generateCountryCode(event) {
        let realmCountryCode = this.state.realmCountryList.filter(c => (c.realmCountryId == event.target.value))[0].country.countryCode;
        // alert(realmCountryCode);
        this.props.generateCountryCode(realmCountryCode);
    }

    getRealmCountryList() {
        // AuthenticationService.setupAxiosInterceptors();
        console.log("in get realmCOuntry list----->", this.props.items.program.realm.realmId);
        ProgramService.getRealmCountryList(this.props.items.program.realm.realmId)
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
            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
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
        const { realmCountryList } = this.state;
        let realmCountries = realmCountryList.length > 0
            && realmCountryList.map((item, i) => {
                return (
                    <option key={i} value={item.realmCountryId}>
                        {getLabelText(item.country.label, this.state.lang)}
                        {/* {item.country.countryCode} */}
                    </option>
                )
            }, this);

        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <Formik
                    initialValues={initialValuesTwo}
                    validate={validateTwo(validationSchemaTwo)}
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
                                        <Button color="info" size="md" className="float-left mr-1" type="submit" onClick={() => this.touchAllTwo(setTouched, errors)} disabled={!isValid}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                    </FormGroup>

                                </Form>
                            )} />

            </>
        );
    }




}