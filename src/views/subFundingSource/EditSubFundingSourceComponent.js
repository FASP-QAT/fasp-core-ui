import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import SubFundingSourceService from "../../api/SubFundingSourceService";
import AuthenticationService from '../common/AuthenticationService.js';

let initialValues = {
    subFundingSource: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        subFundingSource: Yup.string()
        .required( i18n.t('static.fundingsource.validsubfundingsource'))
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

class EditSubFundingSourceComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            subFundingSource: this.props.location.state.subFundingSource,
            message: ''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
    }
    Capitalize(str) {
        if (str != null && str != "") {
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }

    dataChange(event) {
        let { subFundingSource } = this.state;
        if (event.target.name == "subFundingSource") {
            subFundingSource.label.label_en = event.target.value;
        }
        if (event.target.name == "active") {
            subFundingSource.active = event.target.id === "active2" ? false : true;
        }
        this.setState({
            subFundingSource
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            subFundingSource: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('subFundingSourceForm', (fieldName) => {
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

    render() {
        return (
            <div className="animated fadeIn">
                <h5>{this.state.message}</h5>
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.subfundingsource.subfundingsourceedit')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{ subFundingSource: this.state.subFundingSource.label.label_en }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    SubFundingSourceService.updateSubFundingSource(this.state.subFundingSource)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/subFundingSource/listSubFundingSource/${response.data.messageCode}`)
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode
                                                })
                                            }
                                        })
                                        .catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({ message: error.message });
                                                } else {
                                                    switch (error.response ? error.response.status : "") {
                                                        case 500:
                                                        case 401:
                                                        case 404:
                                                        case 406:
                                                        case 412:
                                                            this.setState({ message: error.response.data.messageCode });
                                                            break;
                                                        default:
                                                            this.setState({ message: 'static.unkownError' });
                                                            console.log("Error code unkown");
                                                            break;
                                                    }
                                                }
                                            }
                                        );
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
                                            <Form onSubmit={handleSubmit} noValidate name='subFundingSourceForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="fundingSourceId">{i18n.t('static.subfundingsource.fundingsource')}</Label>
                                                        <Input
                                                            type="text"
                                                            name="fundingSourceId"
                                                            id="fundingSourceId"
                                                            bsSize="sm"
                                                            readOnly
                                                            value={this.state.subFundingSource.fundingSource.label.label_en}
                                                        >
                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="subFundingSource">{i18n.t('static.subfundingsource.subfundingsource')}</Label>
                                                        <Input type="text"
                                                            name="subFundingSource"
                                                            id="subFundingSource"
                                                            bsSize="sm"
                                                            valid={!errors.subFundingSource}
                                                            invalid={touched.subFundingSource && !!errors.subFundingSource}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.Capitalize(this.state.subFundingSource.label.label_en)}
                                                            required />
                                                        <FormFeedback>{errors.subFundingSource}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label>{i18n.t('static.common.status')}&nbsp;&nbsp;</Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.subFundingSource.active === true}
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
                                                                checked={this.state.subFundingSource.active === false}
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
                                                        <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" size="sm" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
        this.props.history.push(`/subFundingSource/listSubFundingSource/` + "static.actionCancelled")
    }
}

export default EditSubFundingSourceComponent;
