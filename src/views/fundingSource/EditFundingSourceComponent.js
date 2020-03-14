import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input} from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'

import FundingSourceService from "../../api/FundingSourceService";
import AuthenticationService from '../common/AuthenticationService.js';

let initialValues = {
    fundingSource: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        fundingSource: Yup.string()
            .required('Please enter Funding source')
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

class EditFundingSourceComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fundingSource: this.props.location.state.fundingSource,
            message: ''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        let { fundingSource } = this.state;
        if (event.target.name == "fundingSource") {
            fundingSource.label.label_en = event.target.value;
        }
        if (event.target.name == "active") {
            fundingSource.active = event.target.id === "active2" ? false : true;
        }
        this.setState({
            fundingSource
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            fundingSource: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('fundingSourceForm', (fieldName) => {
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
                                <i className="icon-note"></i><strong>Edit Funding Source</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{ fundingSource: this.state.fundingSource.label.label_en }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    FundingSourceService.updateFundingSource(this.state.fundingSource)
                                        .then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/fundingSource/listFundingSource/${response.data.message}`)
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
                                            <Form onSubmit={handleSubmit} noValidate name='fundingSourceForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">Realm</Label>
                                                        <Input
                                                            type="text"
                                                            name="realmId"
                                                            id="realmId"
                                                            bsSize="lg"
                                                            readOnly
                                                            value={this.state.fundingSource.realm.label.label_en}
                                                        >
                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="fundingSource">Funding Source</Label>
                                                        <Input type="text"
                                                            name="fundingSource"
                                                            id="fundingSource"
                                                            valid={!errors.fundingSource}
                                                            invalid={touched.fundingSource && !!errors.fundingSource}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.fundingSource.label.label_en}
                                                            required />
                                                        <FormFeedback>{errors.fundingSource}</FormFeedback>
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
                                                                checked={this.state.fundingSource.active === true}
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
                                                                checked={this.state.fundingSource.active === false}
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
        this.props.history.push(`/fundingSource/listFundingSource/` + "Action Canceled")
    }
}

export default EditFundingSourceComponent;
