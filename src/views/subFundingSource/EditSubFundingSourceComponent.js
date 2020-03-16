import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'

import SubFundingSourceService from "../../api/SubFundingSourceService";
import AuthenticationService from '../common/AuthenticationService.js';

let initialValues = {
    subFundingSource: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        subFundingSource: Yup.string()
            .required('Please enter Sub Funding source')
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
        console.log("capitalize");
        if (str != null && str != "") {
          console.log("str---" + str)
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
                                <i className="icon-note"></i><strong>Updaet Sub Funding source</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{ subFundingSource: this.state.subFundingSource.label.label_en }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    SubFundingSourceService.updateSubFundingSource(this.state.subFundingSource)
                                        .then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/subFundingSource/listSubFundingSource/${response.data.message}`)
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
                                                            bsSize="sm"
                                                            readOnly
                                                            value={this.state.subFundingSource.fundingSource.label.label_en}
                                                        >
                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="subFundingSource">Sub Funding Source</Label>
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
                                                        <Label>Status&nbsp;&nbsp;</Label>
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
                                                        {/* <Button type="reset" size="sm" color="warning" className="float-right mr-1"><i className="fa fa-refresh"></i> Reset</Button> */}
                                                        <Button type="button" size="sm" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> Cancel</Button>
                                                        <Button type="submit" size="sm" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>Submit</Button>
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
        this.props.history.push(`/subFundingSource/listSubFundingSource/` + "Action Canceled")
    }
}

export default EditSubFundingSourceComponent;
