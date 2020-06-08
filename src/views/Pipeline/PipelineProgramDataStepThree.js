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

const initialValuesThree = {
    healthAreaId: ''
}

const validationSchemaThree = function (values) {
    return Yup.object().shape({
        healthAreaId: Yup.string()
            .required(i18n.t('static.program.validhealthareatext')),
    })
}

const validateThree = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationErrorThree(error)
        }
    }
}

const getErrorsFromValidationErrorThree = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}


export default class PipelineProgramDataStepThree extends Component {
    constructor(props) {
        super(props);
        this.state = {
            healthAreaList: []
        }
    }

    touchAllThree(setTouched, errors) {
        setTouched({
            healthAreaId: true
        }
        )
        this.validateFormThree(errors)
    }
    validateFormThree(errors) {
        this.findFirstErrorThree('healthAreaForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstErrorThree(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    // getHealthAreaList() {
    //     AuthenticationService.setupAxiosInterceptors();
    //     ProgramService.getHealthAreaList(document.getElementById('realmId').value)
    //         .then(response => {
    //             if (response.status == 200) {
    //                 this.setState({
    //                     healthAreaList: response.data
    //                 })
    //             } else {
    //                 this.setState({
    //                     message: response.data.messageCode
    //                 })
    //             }
    //         })
    // }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        ProgramService.getHealthAreaList(1)
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        healthAreaList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            }).catch(error => {
                console.log("error--------", error);
            })
    }

    render() {
        const { healthAreaList } = this.state;
        let realmHealthArea = healthAreaList.length > 0
            && healthAreaList.map((item, i) => {
                return (
                    <option key={i} value={item.healthAreaId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        return (
            <>
                <Formik
                    enableReinitialize={true}
                    initialValues={{ healthAreaId: this.props.items.program.healthArea.id }}
                    validate={validateThree(validationSchemaThree)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        // console.log("in success--");
                        // this.props.finishedStepThree && this.props.finishedStepThree();
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
                            setTouched
                        }) => (
                                <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='healthAreaForm'>
                                    <FormGroup>
                                        <Label htmlFor="select">{i18n.t('static.program.healtharea')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            valid={!errors.healthAreaId && this.props.items.program.healthArea.id != ''}
                                            invalid={touched.healthAreaId && !!errors.healthAreaId}
                                            onBlur={handleBlur}
                                            bsSize="sm"
                                            type="select"
                                            name="healthAreaId"
                                            id="healthAreaId"
                                            className="col-md-6"
                                            value={this.props.items.program.healthArea.id}
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e) }}
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realmHealthArea}
                                        </Input>
                                        <FormFeedback className="red">{errors.healthAreaId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="healthPrevious" id="healthPrevious" onClick={this.props.backToprogramInfoStepOne} > <i className="fa fa-angle-double-left"></i> Previous</Button>
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="submit" onClick={() => this.touchAllThree(setTouched, errors)}>Next <i className="fa fa-angle-double-right"></i></Button>
                                        &nbsp;
                                    </FormGroup>
                                </Form>
                            )} />

            </>

        );
    }

}