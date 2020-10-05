import React, { Component } from 'react';

import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import ProgramService from "../../api/ProgramService";
import { Formik } from 'formik';
import * as Yup from 'yup'
import {
    Button, FormFeedback, CardBody,
    Form, FormGroup, Label, Input,
} from 'reactstrap';
import getLabelText from '../../CommonComponent/getLabelText';
import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import classNames from 'classnames';

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


export default class StepFive extends Component {
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

    }

    getRegionList() {

        // AuthenticationService.setupAxiosInterceptors();
        ProgramService.getRegionList(document.getElementById('realmCountryId').value)
            .then(response => {
                if (response.status == 200) {
                    var json = response.data;
                    var regList = [];
                    for (var i = 0; i < json.length; i++) {
                        regList[i] = { value: json[i].regionId, label: getLabelText(json[i].label, this.state.lang) }
                    }
                    this.setState({
                        regionId: '',
                        regionList: regList
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
    render() {
        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
                <Formik
                    initialValues={initialValuesFour}
                    validate={validateFour(validationSchemaFour)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
                        this.props.finishedStepFive && this.props.finishedStepFive();

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
                                    <FormGroup className="Selectcontrol-bdrNone">
                                        <Label htmlFor="select">{i18n.t('static.program.region')}<span class="red Reqasterisk">*</span></Label>
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
                                            // onChange={(e) => { this.props.updateFieldData(e) }}
                                            // className="col-md-4"
                                            bsSize="sm"
                                            name="regionId"
                                            id="regionId"
                                            multi
                                            options={this.state.regionList}
                                            // value={this.state.regionId}
                                            value={this.props.items.program.regionArray}
                                        // onChange={(e) => { handleChange(e); this.props.updateFieldData(e) }}
                                        />

                                        <FormFeedback className="red">{errors.regionId}</FormFeedback>
                                    </FormGroup>
                                    <FormGroup>
                                        <Button color="info" size="md" className="float-left mr-1" type="button" name="regionPrevious" id="regionPrevious" onClick={this.props.previousToStepFour} > <i className="fa fa-angle-double-left"></i> {i18n.t('static.common.back')}</Button>
                                        {/* <Button color="info" size="md" className="float-left mr-1" type="button" name="regionPrevious" id="regionPrevious" onClick={this.props.previousToStepFour} > <i className="fa fa-angle-double-left"></i> Back</Button> */}
                                        &nbsp;
                                        <Button color="info" size="md" className="float-left mr-1" type="submit" name="regionSub" id="regionSub" onClick={() => this.touchAllFour(setTouched, errors)} disabled={!isValid} >{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                        {/* <Button color="info" size="md" className="float-left mr-1" type="button" name="regionSub" id="regionSub" onClick={this.props.finishedStepFive}>Next <i className="fa fa-angle-double-right"></i></Button> */}
                                        &nbsp;
                                    </FormGroup>
                                </Form>
                            )} />


                {/* 
                <FormGroup className="col-md-4 pl-0">
                    <Label htmlFor="select">{i18n.t('static.program.region')}<span class="red Reqasterisk">*</span><span class="red Reqasterisk">*</span></Label>
                    <Select
                        onChange={(e) => { this.props.updateFieldData(e) }}
                        // className="col-md-4"
                        bsSize="sm"
                        name="regionId"
                        id="regionId"
                        multi
                        options={this.state.regionList}
                        value={this.state.regionId}
                        onChange={(e) => { handleChange(e); this.props.updateFieldData(e) }}
                    />
                    <FormFeedback className="red">{errors.regionId}</FormFeedback>
                </FormGroup>
                <br></br>
                <FormGroup>
                    <Button color="info" size="md" className="float-left mr-1" type="button" name="regionPrevious" id="regionPrevious" onClick={this.props.previousToStepFour} > <i className="fa fa-angle-double-left"></i> Back</Button>
                    &nbsp;
                    <Button color="info" size="md" className="float-left mr-1" type="button" name="regionSub" id="regionSub" onClick={this.props.finishedStepFive}>Next <i className="fa fa-angle-double-right"></i></Button>
                    &nbsp;
                    </FormGroup> */}


            </>
        );
    }
}