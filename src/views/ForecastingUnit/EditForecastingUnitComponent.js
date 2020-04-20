import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService.js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import ForecastingUnitService from '../../api/ForecastingUnitService.js';
import i18n from '../../i18n';
import getLabelText from '../../CommonComponent/getLabelText'

let initialValues = {
    label: ''

}
const entityname = i18n.t('static.forecastingunit.forecastingunit');
const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            .required(i18n.t('static.forecastingunit.forecastingunittext'))
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


export default class EditForecastingUnitComponent extends Component {


    constructor(props) {
        super(props);
        this.state = {
            message: '',
            forecastingUnit:
            {
                active: '',
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: '',
                    labelId: ''
                }, genericLabel: {
                    label_en: '',
                    labelId: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                realm: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                productCategory: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                },
                tracerCategory: {
                    tracerCategoryId: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    }
                }
            },
            lang: localStorage.getItem('lang')
        }

        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);

    }

    dataChange(event) {
        let { forecastingUnit } = this.state

        if (event.target.name === "label") {
            forecastingUnit.label.label_en = event.target.value
        }
        if (event.target.name == "realmId") {
            forecastingUnit.realm.realmId = event.target.value;
        }
        if (event.target.name == "tracerCategoryId") {
            forecastingUnit.tracerCategory.tracerCategoryId = event.target.value;
        }
        if (event.target.name == "productCategoryId") {
            forecastingUnit.productCategory.productCategoryId = event.target.value;
        }
        if (event.target.name == "genericLabel") {
            forecastingUnit.genericLabel.label_en = event.target.value;
        }


        else if (event.target.name === "active") {
            forecastingUnit.active = event.target.id === "active2" ? false : true
        }


        this.setState(
            {
                forecastingUnit
            }
        )

    };

    touchAll(setTouched, errors) {
        setTouched({
            'label': true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('forecastingUnitForm', (fieldName) => {
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
        ForecastingUnitService.getForcastingUnitById(this.props.match.params.forecastingUnitId).then(response => {
            this.setState({
                forecastingUnit: response.data
            });

        }).catch(
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
    }

    Capitalize(str) {
        if (str != null && str != "") {
            let { forecastingUnit } = this.state
            forecastingUnit.label.label_en = str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return "";
        }
    }

    render() {

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.editEntity', { entityname })}</strong>{' '}
                            </CardHeader>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    message: '',
                                    label: this.state.forecastingUnit.label.label_en,
                                    genericLabel: this.state.forecastingUnit.genericLabel.label_en
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    ForecastingUnitService.editForecastingUnit(this.state.forecastingUnit)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/forecastingUnit/listForecastingUnit/` + i18n.t(response.data.messageCode, { entityname }))
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
                                            <Form onSubmit={handleSubmit} noValidate name='forecastingUnitForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="realmId">{i18n.t('static.realm.realm')}</Label>
                                                        <Input
                                                            type="text"
                                                            name="realmId"
                                                            id="realmId"
                                                            bsSize="sm"
                                                            readOnly
                                                            value={getLabelText(this.state.forecastingUnit.realm.label, this.state.lang)}
                                                        >
                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="tracerCategoryId">{i18n.t('static.tracercategory.tracercategory')}</Label>
                                                        <Input
                                                            type="text"
                                                            name="tracerCategoryId"
                                                            id="tracerCategoryId"
                                                            bsSize="sm"
                                                            readOnly
                                                            value={getLabelText(this.state.forecastingUnit.tracerCategory.label, this.state.lang)}
                                                        >
                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="productCategoryId">{i18n.t('static.productcategory.productcategory')}</Label>
                                                        <Input
                                                            type="text"
                                                            name="productCategoryId"
                                                            id="productCategoryId"
                                                            bsSize="sm"
                                                            readOnly
                                                            value={getLabelText(this.state.forecastingUnit.productCategory.label, this.state.lang)}
                                                        >
                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.forecastingunit.forecastingunit')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.forecastingUnit.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="genericLabel">{i18n.t('static.product.productgenericname')}<span className="red Reqasterisk">*</span><span className="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="genericLabel"
                                                            id="genericLabel"
                                                            bsSize="sm"
                                                            valid={!errors.genericLabel}
                                                            invalid={touched.genericLabel && !!errors.genericLabel}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.forecastingUnit.genericLabel.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.genericLabel}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label>{i18n.t('static.common.status')}  </Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.forecastingUnit.active === true}
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
                                                                checked={this.state.forecastingUnit.active === false}
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
                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}>{i18n.t('static.common.update')}</Button>


                                                        &nbsp;

                                                    </FormGroup>
                                                </CardFooter>
                                            </Form>

                                        )} />

                        </Card>
                    </Col>
                </Row>
                <div>
                    <h6>{i18n.t(this.state.message, { entityname })}</h6>
                    <h6>{i18n.t(this.props.match.params.message, { entityname })}</h6>
                </div>
            </div>
        );
    }
    cancelClicked() {
        this.props.history.push(`/forecastingUnit/listForecastingUnit/` + i18n.t('static.message.cancelled', { entityname }))
    }

}

