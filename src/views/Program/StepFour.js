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

    getOrganisationList() {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getOrganisationList(document.getElementById('realmId').value)
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


    }

    componentDidMount() {

    }
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
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmOrganisation}

                                        </Input>

                                        <FormFeedback className="red">{errors.organisationId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="organizationPrevious" id="organizationPrevious" onClick={this.props.previousToStepThree} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="submit" name="organizationSub" id="organizationSub" onClick={() => this.touchAllFour(setTouched, errors)} disabled={!isValid} >Next <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                    </FormGroup>
                                </Form>
                            )} />


            </>

        );
    }
}