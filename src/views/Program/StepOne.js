import React, { Component } from 'react';
import i18n from '../../i18n';
import HealthAreaService from "../../api/HealthAreaService";
import AuthenticationService from '../Common/AuthenticationService.js';

import { Formik } from 'formik';
import * as Yup from 'yup'

import {
    Row, Col,
    Card, CardHeader, CardFooter,
    Button, FormFeedback, CardBody,
    FormText, Form, FormGroup, Label, Input,
    InputGroupAddon, InputGroupText
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';


const initialValues = {
    realmId: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({

        realmId: Yup.string()
            .required(i18n.t('static.common.realmtext')),


    })
}

const validate = (getValidationSchema) => {
    return (values) => {
        const validationSchema = getValidationSchema(values)
        try {
            validationSchema.validateSync(values, { abortEarly: false })
            return {}
        } catch (error) {
            return getErrorsFromValidationError(error)
        }
    }
}

const getErrorsFromValidationError = (validationError) => {
    const FIRST_ERROR = 0
    return validationError.inner.reduce((errors, error) => {
        return {
            ...errors,
            [error.path]: error.errors[FIRST_ERROR],
        }
    }, {})
}


export default class StepOne extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realmList: [],
            realmId: '',
        }

    }

    touchAll(setTouched, errors) {
        setTouched({
            realmId: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('realmForm', (fieldName) => {
            return Boolean(errors[fieldName])
        })
    }
    findFirstError(formName, hasError) {
        const form = document.forms[formName]
        for (let i = 0; i < form.length; i++) {
            if (hasError(form[i].name)) {
                form[i].focus()
                break
            }
        }
    }

    componentDidMount() { 
        console.log("-----------------------------------FIRST STEP-------->", this.props.items);
        AuthenticationService.setupAxiosInterceptors();
        HealthAreaService.getRealmList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        realmList: response.data
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode
                    })
                }
            })
    }
    render() {
        const { realmList } = this.state;
        let realms = realmList.length > 0
            && realmList.map((item, i) => {
                return (
                    <option key={i} value={item.realmId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        return (
            <>

                <Formik
                    enableReinitialize={true}
                    initialValues={{
                        realmId:this.props.items.program.realm.realmId
                    }}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        // console.log("in succcess--------------->");
                        this.props.finishedStepOne && this.props.finishedStepOne();

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
                                <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='realmForm'>
                             
                                    <FormGroup>
                                        <Label htmlFor="select">{i18n.t('static.program.realm')}<span class="red Reqasterisk">*</span></Label>
                                        <Input
                                            valid={!errors.realmId}
                                            invalid={touched.realmId && !!errors.realmId}
                                            bsSize="sm"
                                            className="col-md-4"
                                            onBlur={handleBlur}
                                            type="select" name="realmId" id="realmId"
                                            value={this.props.items.program.realm.realmId}
                                            onChange={(e) => { handleChange(e); this.props.dataChange(e); this.props.getDependentLists(e) }}
                                        >
                                            <option value="">{i18n.t('static.common.select')}</option>
                                            {realms}
                                        </Input>
                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                        {/* <Button color="info" size="md" className="float-right mr-1" type="button" name="planningPrevious" id="planningPrevious" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}>Next <i className="fa fa-angle-double-right"></i></Button> */}
                                       
                                    </FormGroup>

                                    <FormGroup className="pb-3">
                                        <Button color="info" size="md" className="float-left mr-1" type="submit" onClick={() => this.touchAll(setTouched, errors)}>Next <i className="fa fa-angle-double-right"></i></Button>
                                    </FormGroup>

                                </Form>
                            )} />

            </>
        );
    }
}