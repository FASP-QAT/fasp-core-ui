import { Formik } from 'formik';
import React, { Component } from 'react';
import {
    Button,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label
} from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants';
import HealthAreaService from "../../api/HealthAreaService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
const initialValues = {
    realmId: 1
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
export default class PipelineProgramDataStepOne extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realmList: [],
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
                <AuthenticationServiceComponent history={this.props.history} />
                <Formik
                    initialValues={initialValues}
                    validate={validate(validationSchema)}
                    onSubmit={(values, { setSubmitting, setErrors }) => {
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
                                        className="col-md-6"
                                        onBlur={handleBlur}
                                        type="select" name="realmId" id="realmId"
                                        value={this.props.realmId}
                                    >
                                        {realms}
                                    </Input>
                                    <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                    &nbsp;
                                </FormGroup>
                                <FormGroup>
                                    <Button color="info" size="md" className="float-left mr-1" type="button" onClick={this.props.endProgramInfoStepOne}>{i18n.t('static.common.next')} <i className="fa fa-angle-double-right"></i></Button>
                                </FormGroup>
                            </Form>
                        )} />
            </>
        );
    }
}