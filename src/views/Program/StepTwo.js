import React, { Component } from 'react';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from "../../api/ProgramService";
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

    getRealmCountryList() {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getRealmCountryList(document.getElementById('realmId').value)
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
                    </option>
                )
            }, this);

        return (
            <>
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
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e); this.props.getRegionList(e) }}
                                            bsSize="sm"
                                            className="col-md-6"
                                            onBlur={handleBlur}
                                            type="select" name="realmCountryId" id="realmCountryId">
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmCountries}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmCountryId}</FormFeedback>
                                    </FormGroup>

                                    <FormGroup>
                                        <Button color="info" size="md" className="float-right mr-1" type="submit" onClick={() => this.touchAllTwo(setTouched, errors)} disabled={!isValid}>Next <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-right mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.previousToStepOne} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                        &nbsp;
                                    </FormGroup>

                                </Form>
                            )} />

            </>
        );
    }




}