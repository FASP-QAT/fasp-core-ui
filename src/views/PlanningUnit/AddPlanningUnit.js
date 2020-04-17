import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input,  } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import i18n from '../../i18n';
import UnitService from '../../api/UnitService.js';

const initialValues = {
    unitId: [],
    label: '',
    forecastingUnitId: [],
    multiplier:''
}
const entityname = i18n.t('static.planningunit.planningunit');

const validationSchema = function (values) {
    return Yup.object().shape({
        unitId: Yup.string()
            .required(i18n.t('static.planningunit.unittext')),
        label: Yup.string()
            .required(i18n.t('static.planningunit.planningunittext')),
        forecastingUnitId: Yup.string()
            .required(i18n.t('static.planningunit.forcastingunittext')),
            multiplier: Yup.string()
            .required(i18n.t('static.planningunit.multipliertext'))
            .min(0, i18n.t('static.program.validvaluetext'))
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


export default class AddPlanningUnit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            units: [],
            forecastingUnits:[],

            message: '',
            planningUnit:
            {
                active: '',
             unit: {
                id:''
            },
            label: {
                label_en: ''
            },
            forecastingUnit: {
                forecastingUnitId: ''
            },
            }
        }
        this.Capitalize = this.Capitalize.bind(this);

        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
    }

    dataChange(event) {
        let { planningUnit } = this.state
        console.log( event.target.value);
        if (event.target.name === "label") {
            planningUnit.label.label_en = event.target.value
        }
        else if (event.target.name === "forecastingUnitId") {
            planningUnit.forecastingUnit.forecastingUnitId = event.target.value
        }
        if (event.target.name === "unitId") {
            planningUnit.unit.id = event.target.value;
        }
        if (event.target.name === "multiplier") {
            planningUnit.multiplier = event.target.value;
        }
      
        this.setState(
            {
                planningUnit
            }
        )

    };

    touchAll(setTouched, errors) {
        setTouched({
            'label': true,
            'forecastingUnitId': true,
            'unitId': true,
            multipler:true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('planningUnitForm', (fieldName) => {
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
        UnitService.getUnitListAll()
            .then(response => {
                this.setState({
                    units: response.data
                })
            }).catch(
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
        AuthenticationService.setupAxiosInterceptors();
        ForecastingUnitService.getForecastingUnitList().then(response => {
            console.log(response.data)
            this.setState({
                forecastingUnits: response.data
            })
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
                                break;
                        }
                    }
                }
            );

    }


    Capitalize(str) {
        let { planningUnit } = this.state
        planningUnit.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    render() {
        const { units } = this.state;
        let unitList = units.length > 0
            && units.map((item, i) => {
                return (
                    <option key={i} value={item.unitId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);
        const { forecastingUnits } = this.state;
        let forecastingUnitList = forecastingUnits.length > 0
            && forecastingUnits.map((item, i) => {
                return (
                    <option key={i} value={item.forecastingUnitId}>
                        {item.label.label_en}
                    </option>
                )
            }, this);


        

        return (
            <div className="animated fadeIn">
                <Row>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    console.log(JSON.stringify(this.state.planningUnit))
                                    PlanningUnitService.addPlanningUnit(this.state.planningUnit)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/planningUnit/listPlanningUnit/` + i18n.t(response.data.messageCode, { entityname }))
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
                                            <Form onSubmit={handleSubmit} noValidate name='planningUnitForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="forecastingUnitId">{i18n.t('static.forecastingunit.forecastingunit')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="forecastingUnitId"
                                                            id="forecastingUnitId"
                                                            bsSize="sm"
                                                            valid={!errors.forecastingUnitId}
                                                            invalid={touched.forecastingUnitId && !!errors.forecastingUnitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required
                                                             >
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {forecastingUnitList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.forecastingUnitId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="unitId">{i18n.t('static.unit.unit')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="select"
                                                            name="unitId"
                                                            id="unitId"
                                                            bsSize="sm"
                                                            valid={!errors.unitId}
                                                            invalid={touched.unitId && !!errors.unitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            required>
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {unitList}
                                                        </Input>
                                                        <FormFeedback className="red">{errors.unitId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="label">{i18n.t('static.planningunit.planningunit')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.planningUnit.label.label_en}
                                                            required />
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="multiplier">{i18n.t('static.unit.multiplier')}<span className="red Reqasterisk">*</span></Label>
                                                        <Input type="number"
                                                            name="multiplier"
                                                            id="multiplier"
                                                            bsSize="sm"
                                                            valid={!errors.multiplier}
                                                            invalid={touched.multiplier && !!errors.multiplier}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e);  }}
                                                            onBlur={handleBlur}
                                                            value={this.state.multiplier}
                                                            required />
                                                        <FormFeedback className="red">{errors.multiplier}</FormFeedback>
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
                <div>
                    <h6>{i18n.t(this.state.message)}</h6>
                    <h6>{i18n.t(this.props.match.params.message)}</h6>
                </div>
            </div>
        );
    }

    cancelClicked() {
        this.props.history.push(`/planningUnit/listPlanningUnit/` + i18n.t('static.message.cancelled', { entityname }))
    }

}