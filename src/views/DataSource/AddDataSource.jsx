import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, FormText, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import AuthenticationService from '../common/AuthenticationService.js';
import DataSourceService from '../../api/DataSourceService';
import DataSourceTypeService from '../../api/DataSourceTypeService';
import i18n from '../../i18n';

const initialValues = {
    label: '',
    dataSourceTypeId: '',
    dataSourceTypeList: []
}


const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            .required(i18n.t('static.datasource.datasourcetext')),
        dataSourceTypeId: Yup.string()
            .required(i18n.t('static.datasource.datasourcetypetext'))
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


export default class AddDataSource extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: '',
            label: {
                label_en: ''
            },
            dataSourceType: {
                dataSourceTypeId: ''
            },
            dataSourceTypeList: []
        }
        this.Capitalize = this.Capitalize.bind(this);

        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        if (event.target.name === "label") {
            this.state.label.label_en = event.target.value
        }
        else if (event.target.name === "dataSourceTypeId") {
            this.state.dataSourceType.dataSourceTypeId = event.target.value
        }

        let { dataSource } = this.state
        this.setState(
            {
                dataSource
            }
        )

    };

    touchAll(setTouched, errors) {
        setTouched({
            'label': true,
            'dataSourceTypeId': true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('dataSourceForm', (fieldName) => {
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
        DataSourceTypeService.getDataSourceTypeListActive().then(response => {
            this.setState({
                dataSourceTypeList: response.data
            })
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
                                message: error.message
                            })
                            break
                    }
                }
            );


    }


    Capitalize(str) {
        this.state.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    render() {

        const { dataSourceTypeList } = this.state;
        let dataSourceTypes = dataSourceTypeList.length > 0
            && dataSourceTypeList.map((item, i) => {
                return (
                    <option key={i} value={item.dataSourceTypeId}>{item.label.label_en}</option>
                )
            }, this);

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.datasource.datasourceadd')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    DataSourceService.addDataSource(this.state)
                                        .then(response => {
                                            if (response.data.status == "Success") {
                                                this.props.history.push(`/dataSource/listDataSource/${response.data.message}`)
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
                                            <Form onSubmit={handleSubmit} noValidate name='dataSourceForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.datasource.datasource')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-database"></i></InputGroupText>
                                                            <Input type="text"
                                                                name="label"
                                                                id="label"
                                                                bsSize="sm"
                                                                valid={!errors.label}
                                                                invalid={touched.label && !!errors.label}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                                onBlur={handleBlur}
                                                                value={this.state.label.label_en}
                                                                required />
                                                        </InputGroupAddon>
                                                        <FormText className="red">{errors.label}</FormText>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="dataSourceTypeId">{i18n.t('static.datasource.datasourcetype')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-table"></i></InputGroupText>
                                                            <Input
                                                                type="select"
                                                                name="dataSourceTypeId"
                                                                id="dataSourceTypeId"
                                                                bsSize="sm"
                                                                valid={!errors.dataSourceTypeId}
                                                                invalid={touched.dataSourceTypeId && !!errors.dataSourceTypeId}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                required>
                                                                <option value="0">{i18n.t('static.common.select')}</option>
                                                                {dataSourceTypes}
                                                            </Input>
                                                        </InputGroupAddon>
                                                        <FormText className="red">{errors.dataSourceTypeId}</FormText>
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
        this.props.history.push(`/dataSource/listDataSource/` + "Action Canceled")
    }

}