import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';

import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
// import DimensionService from '../../api/DimensionService.js';
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { SPACE_REGEX } from '../../Constants.js';

const initialValues = {
    label: "",
    conversionFactor: '',
}
const entityname = i18n.t('static.usagePeriod.usagePeriod');
const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            // .matches(SPACE_REGEX, i18n.t('static.message.spacetext'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.usagePeriod.usagePeriodtext')),
            conversionFactor: Yup.string()
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .required(i18n.t('static.currency.conversionrateNumber')).min(0, i18n.t('static.currency.conversionrateMin'))
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


export default class AddusagePeriodComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            usagePeriod: {
                label: {
                    label_en: ''
                },
                conversionFactor: '',
            },
            message: '',
            loading: true
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }


    dataChange(event) {
        let { usagePeriod } = this.state
        if (event.target.name === "label") {
            usagePeriod.label.label_en = event.target.value
        } else if (event.target.name === "conversionFactor") {
            this.state.usagePeriod.conversionFactor = event.target.value;
        }
        this.setState(
            {
                usagePeriod
            }
        )
    };

    Capitalize(str) {
        this.state.usagePeriod.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    touchAll(setTouched, errors) {
        setTouched({
            label: true,
            conversionFactor: true,
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
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
        // AuthenticationService.setupAxiosInterceptors();
        this.setState({ loading: false })

    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    render() {

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}

                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}

                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    console.log(this.state.usagePeriod)
                                    // UsagePeriodService.addUsagePeriod(this.state.usagePeriod).then(response => {
                                    //     if (response.status == 200) {
                                    //         this.props.history.push(`/usagePeriod/listUsagePeriod/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                    //     } else {
                                    //         this.setState({
                                    //             message: response.data.messageCode, loading: false
                                    //         },
                                    //             () => {
                                    //                 this.hideSecondComponent();
                                    //             })
                                    //     }
                                    // }
                                    // )
                                    //     .catch(
                                    //         error => {
                                    //             if (error.message === "Network Error") {
                                    //                 this.setState({
                                    //                     message: 'static.unkownError',
                                    //                     loading: false
                                    //                 });
                                    //             } else {
                                    //                 switch (error.response ? error.response.status : "") {

                                    //                     case 401:
                                    //                         this.props.history.push(`/login/static.message.sessionExpired`)
                                    //                         break;
                                    //                     case 403:
                                    //                         this.props.history.push(`/accessDenied`)
                                    //                         break;
                                    //                     case 500:
                                    //                     case 404:
                                    //                     case 406:
                                    //                         this.setState({
                                    //                             message: error.response.data.messageCode,
                                    //                             loading: false
                                    //                         });
                                    //                         break;
                                    //                     case 412:
                                    //                         this.setState({
                                    //                             message: error.response.data.messageCode,
                                    //                             loading: false
                                    //                         });
                                    //                         break;
                                    //                     default:
                                    //                         this.setState({
                                    //                             message: 'static.unkownError',
                                    //                             loading: false
                                    //                         });
                                    //                         break;
                                    //                 }
                                    //             }
                                    //         }
                                    //     );
                                    setTimeout(() => {
                                        setSubmitting(false)
                                    }, 2000)
                                }
                                }

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
                                            <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                                <CardBody style={{ display: this.state.loading ? "none" : "block" }}>

                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.usagePeriod.usagePeriod')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label && this.state.usagePeriod.label.label_en != ''}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.usagePeriod.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="conversionFactor">{i18n.t('static.usagePeriod.conversionFactor')}<span class="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-exchange"></i></InputGroupText> */}
                                                        <Input type="number"
                                                            name="conversionFactor"
                                                            id="conversionFactor"
                                                            valid={!errors.conversionFactor && this.state.usagePeriod.conversionFactor != ''}
                                                            invalid={touched.conversionFactor && !!errors.conversionFactor}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.usagePeriod.conversionFactor}
                                                            bsSize="sm"
                                                            required />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.conversionFactor}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>
                                                <div style={{ display: this.state.loading ? "block" : "none" }}>
                                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                        <div class="align-items-center">
                                                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                                                            <div class="spinner-border blue ml-4" role="status">

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <CardFooter>
                                                    <FormGroup>

                                                        <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;

                                                        {/* <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>

                                                        &nbsp; */}
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>
                                        )}

                            />

                        </Card>
                    </Col>
                </Row>

            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/usagePeriod/listUsagePeriod/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { usagePeriod } = this.state
        usagePeriod.label.label_en = ''
        usagePeriod.conversionFactor = ''

        this.setState({
            usagePeriod
        },
            () => { });
    }
} 