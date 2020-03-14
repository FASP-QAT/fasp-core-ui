import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'

import FundingSourceService from "../../api/FundingSourceService";
import AuthenticationService from '../common/AuthenticationService.js';

let initialValues = {
    subFundingSource: "anchal"
}

const validationSchema = function (values) {
    return Yup.object().shape({
        subFundingSource: Yup.string()
            .required('Please enter health area')
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
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>Edit Sub Funding Source</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{ subFundingSource: this.state.subFundingSource.label.label_en }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    FundingSourceService.updateSubFundingSource(this.state.subFundingSource)
                                        .then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/subFundingSource/subFundingSourceList/${response.data.message}`)
                                            } else {
                                                this.setState({
                                                    message: response.data.message
                                                })
                                            }
                                        })
                                        .catch(
                                            error => {
                                                switch (error.message) {
                                                    case "Network Error":
                                                        this.setState({
                                                            message: error.message
                                                        })
                                                        break
                                                    default:
                                                        this.setState({
                                                            message: error.response.data.message
                                                        })
                                                        break
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
                                                        <Label htmlFor="fundingSourceId">Funding Source</Label>
                                                        <Input
                                                            type="text"
                                                            name="fundingSourceId"
                                                            id="fundingSourceId"
                                                            bsSize="lg"
                                                            readOnly
                                                            value={this.state.subFundingSource.fundingSource.label.label_en}
                                                        >
                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="healthArea">Sub Funding Source</Label>
                                                        <Input type="text"
                                                            name="subFundingSource"
                                                            id="subFundingSource"
                                                            valid={!errors.subFundingSource}
                                                            invalid={touched.subFundingSource && !!errors.subFundingSource}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.subFundingSource.label.label_en}
                                                            required />
                                                        <FormFeedback>{errors.subFundingSource}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label>Status  </Label>
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
                                                                Active
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
                                                                Disabled
                                                                </Label>
                                                        </FormGroup>
                                                    </FormGroup>
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="submit" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)}>Update</Button>
                                                        <Button type="reset" color="danger" className="mr-1" onClick={this.cancelClicked}>Cancel</Button>
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
        this.props.history.push(`/subFundingSource/subFundingSourceList/` + "Action Canceled")
    }
}

export default EditSubFundingSourceComponent;
