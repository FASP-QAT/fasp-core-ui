import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n';

import DataSourceTypeService from '../../api/DataSourceTypeService.js'

const initialValues = {
    label: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            .required(i18n.t('static.datasourcetype.datasourcetypetext'))
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


export default class AddDataSourceTypeComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataSourceType:
            {
                active: '',

                label: {
                    label_en: '',
                    labelId: 0,
                }
            }
        }

        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);

    }

    dataChange(event) {
        let { dataSourceType } = this.state
        if (event.target.name === "label") {
            dataSourceType.label.label_en = event.target.value
        }

        this.setState(
            {
                dataSourceType
            }, () => {
            }
        )
    };

    touchAll(setTouched, errors) {
        setTouched({
            'label': true,
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('dataSourceType', (fieldName) => {
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

    }

    Capitalize(str) {
        let { dataSourceType } = this.state
        dataSourceType.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.datasourcetype.datasourcetypeadd')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    DataSourceTypeService.addDataSourceType(this.state.dataSourceType.label)
                                        .then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/dataSourceType/listDataSourceType/${response.data.message}`)
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
                                            <Form onSubmit={handleSubmit} noValidate name='dataSourceType'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.datasourcetype.datasourcetype')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-table"></i></InputGroupText>
                                                            <Input type="text"
                                                                name="label"
                                                                id="label"
                                                                bsSize="sm"
                                                                valid={!errors.label}
                                                                invalid={touched.label && !!errors.label}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                                onBlur={handleBlur}
                                                                value={this.state.dataSourceType.label.label_en}
                                                                required />
                                                        </InputGroupAddon>
                                                        <FormFeedback>{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                </CardBody>

                                                <CardFooter>
                                                    <FormGroup>

                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
        this.props.history.push(`/dataSourceType/listDataSourceType/` + "Action Canceled")
    }
}