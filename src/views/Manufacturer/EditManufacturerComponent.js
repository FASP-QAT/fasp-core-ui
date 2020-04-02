import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText, FormText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import ManufacturerService from "../../api/ManufacturerService";
import AuthenticationService from '../Common/AuthenticationService.js';

let initialValues = {
    manufacturer: ""
}
const entityname=i18n.t('static.manufacturer.manufacturer');
const validationSchema = function (values) {
    return Yup.object().shape({
        manufacturer: Yup.string()
            .required(i18n.t('static.manufaturer.manufaturertext'))
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

class EditManufacturerComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            manufacturer: this.props.location.state.manufacturer,
            message: ''
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        let { manufacturer } = this.state;
        if (event.target.name == "manufacturer") {
            manufacturer.label.label_en = event.target.value;
        }
        if (event.target.name == "active") {
            manufacturer.active = event.target.id === "active2" ? false : true;
        }
        this.setState({
            manufacturer
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            manufacturer: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('manufacturerForm', (fieldName) => {
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
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity',{entityname})}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{ manufacturer: this.state.manufacturer.label.label_en }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    ManufacturerService.updateManufacturer(this.state.manufacturer)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/manufacturer/listManufacturer/`+i18n.t(response.data.messageCode,{entityname}))
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
                                                    switch (error.response.status) {
                                                        case 500:
                                                        case 401:
                                                        case 404:
                                                        case 406:
                                                        case 412:
                                                            this.setState({ message: error.response.data.messageCode });
                                                            break;
                                                        default:
                                                            this.setState({ message: 'static.unkownError' });
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
                                            <Form onSubmit={handleSubmit} noValidate name='manufacturerForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.manufacturer.realm')}</Label>
                                                         <Input
                                                                type="text"
                                                                name="realmId"
                                                                id="realmId"
                                                                bsSize="sm"
                                                                readOnly
                                                                value={this.state.manufacturer.realm.label.label_en}
                                                            >
                                                            </Input>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="manufacturer">{i18n.t('static.manufacturer.manufacturer')}</Label>
                                                            <Input type="text"
                                                                name="manufacturer"
                                                                id="manufacturer"
                                                                bsSize="sm"
                                                                valid={!errors.manufacturer}
                                                                invalid={touched.manufacturer && !!errors.manufacturer}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                                onBlur={handleBlur}
                                                                value={this.state.manufacturer.label.label_en}
                                                                required />
                                                        <FormText className="red">{errors.manufacturer}</FormText>
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
                                                                checked={this.state.manufacturer.active === true}
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
                                                                checked={this.state.manufacturer.active === false}
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
        this.props.history.push(`/manufacturer/listManufacturer/` +i18n.t('static.message.cancelled',{entityname}))
    }
}

export default EditManufacturerComponent;
