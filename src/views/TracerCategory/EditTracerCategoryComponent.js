import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, FormFeedback, Label, Input, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';
import RealmService from "../../api/RealmService";
import TracerCategoryService from "../../api/TracerCategoryService";
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'

import getLabelText from '../../CommonComponent/getLabelText';
const entityname = i18n.t('static.tracercategory.tracercategory');

const initialValues = {
    tracerCategoryName: "",
    submittedToApprovedLeadTime: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        tracerCategoryName: Yup.string()
            .required(i18n.t('static.tracerCategory.tracercategorytext')),
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
class EditTracerCategoryComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            realms: [],
            // tracerCategory: this.props.location.state.tracerCategory,
            tracerCategory: {
                realm: {
                    label: {
                        label_en: '',
                        label_fr: '',
                        label_sp: '',
                        label_pr: ''
                    }
                },
                label: {
                    label_en: '',
                    label_fr: '',
                    label_sp: '',
                    label_pr: ''
                }
            },
            message: '',
            lang: localStorage.getItem('lang')
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
    }

    changeMessage(message) {
        this.setState({ message: message })
    }

    Capitalize(str) {
        if (str != null && str != "") {
            let { tracerCategory } = this.state;
            tracerCategory.label.label_en = str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }


    dataChange(event) {
        let { tracerCategory } = this.state;
        if (event.target.name == "realmId") {
            tracerCategory.realm.id = event.target.value;
        }
        if (event.target.name == "tracerCategoryName") {
            tracerCategory.label.label_en = event.target.value;
        }
        if (event.target.name == "active") {
            tracerCategory.active = event.target.id === "active2" ? false : true;
        }


        this.setState({
            tracerCategory
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            tracerCategoryName: true,
            submittedToApprovedLeadTime: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('tracerCategoryForm', (fieldName) => {
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
        AuthenticationService.setupAxiosInterceptors();
        TracerCategoryService.getTracerCategoryById(this.props.match.params.tracerCategoryId).then(response => {
            this.setState({
                tracerCategory: response.data
            });

        })

    }
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} />
                <h5>{this.state.message}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>

                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={
                                    {
                                        tracerCategoryCode: this.state.tracerCategory.tracerCategoryCode,
                                        tracerCategoryName: this.state.tracerCategory.label.label_en,
                                        submittedToApprovedLeadTime: this.state.tracerCategory.submittedToApprovedLeadTime
                                    }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    console.log("this.state.tracerCategory---", this.state.tracerCategory);
                                    AuthenticationService.setupAxiosInterceptors();
                                    TracerCategoryService.updateTracerCategory(this.state.tracerCategory)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/tracerCategory/listTracerCategory/` + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                })
                                            }
                                        })

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
                                            <Form onSubmit={handleSubmit} noValidate name='tracerCategoryForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.realm.realm')}</Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil"></i></InputGroupText> */}
                                                        <Input
                                                            type="text"
                                                            name="realmId"
                                                            id="realmId"
                                                            bsSize="sm"
                                                            readOnly={true}
                                                            value={getLabelText(this.state.tracerCategory.realm.label, this.state.lang)}
                                                        >
                                                        </Input>
                                                        {/* </InputGroupAddon> */}
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label for="tracerCategoryName">{i18n.t('static.tracercategory.tracercategory')}<span className="red Reqasterisk">*</span></Label>
                                                        {/* <InputGroupAddon addonType="prepend"> */}
                                                        {/* <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText> */}
                                                        <Input type="text"
                                                            bsSize="sm"
                                                            name="tracerCategoryName"
                                                            id="tracerCategoryName"
                                                            valid={!errors.tracerCategoryName}
                                                            invalid={touched.tracerCategoryName && !!errors.tracerCategoryName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            required
                                                            value={getLabelText(this.state.tracerCategory.label, this.state.lang)}
                                                        />
                                                        {/* </InputGroupAddon> */}
                                                        <FormFeedback className="red">{errors.tracerCategoryName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label className="P-absltRadio">{i18n.t('static.common.status')}  </Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.tracerCategory.active === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio1">
                                                                {i18n.t('static.common.active')}
                                                            </Label>
                                                        </FormGroup>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active2"
                                                                name="active"
                                                                value={false}
                                                                checked={this.state.tracerCategory.active === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-radio2">
                                                                {i18n.t('static.common.disabled')}
                                                            </Label>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                                        &nbsp;
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>

                                        )} />

                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/tracerCategory/listTracerCategory/` + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        AuthenticationService.setupAxiosInterceptors();
        TracerCategoryService.getTracerCategoryById(this.props.match.params.tracerCategoryId).then(response => {
            this.setState({
                tracerCategory: response.data
            });

        })
        
    }
}

export default EditTracerCategoryComponent;
