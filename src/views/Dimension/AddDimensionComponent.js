import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';

import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import UnitTypeService from '../../api/UnitTypeService.js';
import AuthenticationService from '../Common/AuthenticationService.js';

const initialValues = {
    label: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            .required('Please enter diamension type')
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


export default class AddUnitTypeComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            unitType: {
                label: {
                    label_en: ''
                }
            }
        }
        this.Capitalize = this.Capitalize.bind(this);

        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        let { unitType } = this.state
        if (event.target.name === "label") {
            unitType.label.label_en = event.target.value
        }
        this.setState(
            {
                unitType
            }
        )
    };

    Capitalize(str) {
        this.state.unitType.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    touchAll(setTouched, errors) {
        setTouched({
            label: true
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
        AuthenticationService.setupAxiosInterceptors();

    }

    render() {

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>Add Dimension Type</strong>{' '}
                            </CardHeader>
                            <CardBody>
                                <Formik

                                    validate={validate(validationSchema)}

                                    onSubmit={(values, { setSubmitting, setErrors }) => {
                                        console.log(this.state.unitType)
                                        UnitTypeService.addUniType(this.state.unitType).then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/diamension/diamensionlist/${response.data.message}`)
                                            } else {
                                                this.setState({
                                                    message: response.data.message
                                                })
                                            }
                                        }
                                        )
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
                                            )
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
                                            setTouched
                                        }) => (
                                                <Form className="needs-validation" onSubmit={handleSubmit} noValidate name='simpleForm'>


                                                    <FormGroup>
                                                        <Label for="label">Dimension Type</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-pencil-square-o"></i></InputGroupText>
                                                            <Input type="text"
                                                                name="label"
                                                                id="label"
                                                                bsSize="sm"
                                                                valid={!errors.label}
                                                                invalid={touched.label && !!errors.label}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                                onBlur={handleBlur}
                                                                value={this.state.unitType.label.label_en}
                                                                required />
                                                        </InputGroupAddon>
                                                        <FormText className="red">{errors.label}</FormText>
                                                    </FormGroup>

                                                    <FormGroup>

                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-check"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                        &nbsp;
                                                    </FormGroup>
                                                </Form>
                                            )}

                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/diamension/diamensionlist/` + "Action Canceled")
    }
} 