import React, { Component } from 'react';
import i18n from '../../i18n';
import AuthenticationService from '../Common/AuthenticationService.js';
import ProgramService from "../../api/ProgramService";
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
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
        // AuthenticationService.setupAxiosInterceptors();
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
        // const { healthAreaList } = this.state;
        // let realmHealthArea = healthAreaList.length > 0
        //     && healthAreaList.map((item, i) => {
        //         return (
        //             <option key={i} value={item.healthAreaId}>
        //                 {getLabelText(item.label, this.state.lang)}
        //             </option>
        //         )
        //     }, this);

        return (
            <>
                <AuthenticationServiceComponent history={this.props.history} />
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
                                    <Button color="info" size="md" className="float-left mr-1" type="submit" onClick={() => this.touchAllThree(setTouched, errors)}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                    &nbsp;
                                </FormGroup>
                            </Form>
                        )} />

            </>

        );
    }

}