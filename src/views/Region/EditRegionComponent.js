import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroupAddon, InputGroupText, FormText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import i18n from '../../i18n'
import RegionService from "../../api/RegionService";
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText';

const entityname = i18n.t('static.region.region');

let initialValues = {
    region: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        region: Yup.string()
            .required(i18n.t('static.region.validregion'))
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

class EditRegionComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            region: this.props.location.state.region,
            message: '',
            lang: localStorage.getItem('lang')
        }
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize= this.Capitalize.bind(this);
    }

    dataChange(event) {
        let { region } = this.state;
        if (event.target.name == "region") {
            region.label.label_en = event.target.value;
        }
        if (event.target.name == "active") {
            region.active = event.target.id === "active2" ? false : true;
        }
        this.setState({
            region
        },
            () => { });
    };

    touchAll(setTouched, errors) {
        setTouched({
            region: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('regionForm', (fieldName) => {
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
    Capitalize(str) {
        this.state.region.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    render() {
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.region.regionedit')}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{ region: getLabelText(this.state.region.label, this.state.lang) }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    RegionService.updateRegion(this.state.region)
                                        .then(response => {
                                            console.log("---------->", response);
                                            if (response.status == 200) {
                                                this.props.history.push(`/region/listRegion/` + i18n.t(response.data.messageCode, { entityname }))
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
                                            <Form onSubmit={handleSubmit} noValidate name='regionForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="realmCountryId">{i18n.t('static.region.country')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-globe "></i></InputGroupText>
                                                            <Input
                                                                type="text"
                                                                name="realmCountryId"
                                                                id="realmCountryId"
                                                                bsSize="sm"
                                                                readOnly
                                                                value={getLabelText(this.state.region.realmCountry.country.label, this.state.lang)}
                                                            >
                                                            </Input>
                                                        </InputGroupAddon>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="region">{i18n.t('static.region.region')}</Label>
                                                        <InputGroupAddon addonType="prepend">
                                                            <InputGroupText><i className="fa fa-pie-chart"></i></InputGroupText>
                                                            <Input type="text"
                                                                name="region"
                                                                id="region"
                                                                bsSize="sm"
                                                                valid={!errors.region}
                                                                invalid={touched.region && !!errors.region}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e);this.Capitalize(e.target.value) }}
                                                                onBlur={handleBlur}
                                                                value={getLabelText(this.state.region.label,this.state.lang)}
                                                                required />
                                                        </InputGroupAddon>
                                                        <FormText className="red">{errors.region}</FormText>
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
                                                                checked={this.state.region.active === true}
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
                                                                checked={this.state.region.active === false}
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
                                                        {/* <Button type="reset" size="md" color="warning" className="float-right mr-1"><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button> */}
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
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
        this.props.history.push(`/region/listRegion/` + i18n.t('static.message.cancelled', { entityname }))
    }
}

export default EditRegionComponent;
