import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText, FormFeedback } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import SupplierService from "../../api/SupplierService";
import AuthenticationService from '../Common/AuthenticationService.js';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'

let initialValues = {
    supplier: ""
}
const entityname = i18n.t('static.supplier.supplier');
const validationSchema = function (values) {
    return Yup.object().shape({
        supplier: Yup.string()
            .required(i18n.t('static.supplier.suppliertext'))
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

class EditSupplierComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // supplier: this.props.location.state.supplier,
            supplier: {
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
            message: ''
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
            let { supplier } = this.state;
            supplier.label.label_en = str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }
    dataChange(event) {
        let { supplier } = this.state;
        if (event.target.name == "supplier") {
            supplier.label.label_en = event.target.value;
        }
        if (event.target.name == "active") {
            supplier.active = event.target.id === "active2" ? false : true;
        }
        this.setState({
            supplier
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            supplier: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('supplierForm', (fieldName) => {
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
        SupplierService.getSupplierById(this.props.match.params.supplierId).then(response => {
            this.setState({
                supplier: response.data
            });

        })
    }
    render() {
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} />
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{ supplier: this.state.supplier.label.label_en }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    SupplierService.updateSupplier(this.state.supplier)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/supplier/listSupplier/` + i18n.t(response.data.messageCode, { entityname }))
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
                                            <Form onSubmit={handleSubmit} noValidate name='supplierForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.supplier.realm')}</Label>
                                                        <Input
                                                            type="text"
                                                            name="realmId"
                                                            id="realmId"
                                                            bsSize="sm"
                                                            readOnly
                                                            value={this.state.supplier.realm.label.label_en}
                                                        >
                                                        </Input>
                                                        <FormFeedback className="red">{errors.realmId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="supplier">{i18n.t('static.supplier.supplier')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="supplier"
                                                            id="supplier"
                                                            bsSize="sm"
                                                            valid={!errors.supplier}
                                                            invalid={touched.supplier && !!errors.supplier}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.supplier.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.supplier}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label className="P-absltRadio">{i18n.t('static.common.status')}&nbsp;&nbsp;</Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.supplier.active === true}
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
                                                                checked={this.state.supplier.active === false}
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
                                                        <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.resetClicked}><i className="fa fa-times"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} ><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
                                                        &nbsp;
                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>

                                        )} />

                        </Card>
                    </Col>
                </Row>
                <div>
                    <h6>{i18n.t(this.state.message)}</h6>
                    <h6>{i18n.t(this.props.match.params.message)}</h6>
                </div>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/supplier/listSupplier/` + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        AuthenticationService.setupAxiosInterceptors();
        SupplierService.getSupplierById(this.props.match.params.supplierId).then(response => {
            this.setState({
                supplier: response.data
            });

        })
    }
}

export default EditSupplierComponent;
