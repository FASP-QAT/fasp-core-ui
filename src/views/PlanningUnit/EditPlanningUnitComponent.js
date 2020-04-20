import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import ForecastingUnitService from '../../api/ForecastingUnitService';
import PlanningUnitService from '../../api/PlanningUnitService';
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';

const entityname = i18n.t('static.planningunit.planningunit');
let initialValues = {
    label: '',
    forecastingUnitId: '',
    forecastingUnitList: [],
    multiplier: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        label: Yup.string()
            .required(i18n.t('static.planningunit.planningunittext')),
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
export default class EditPlanningUnitComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {

            planningUnit: {
                message: '',
                active: '',
                planningUnitId: '',
                label: {
                    label_en: '',
                    label_fr: '',
                    label_sp: '',
                    label_pr: '',
                    labelId: '',
                },
                forecastingUnit: {
                    forecastingUnitId: '',
                    label: {
                        label_en: ''
                    }
                }, unit: {
                    id: '',
                    label: {
                        label_en: ''
                    }
                }
            },

        }

        this.Capitalize = this.Capitalize.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);

    }

    dataChange(event) {
        let { planningUnit } = this.state

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
        } if (event.target.name === "active") {
            planningUnit.active = event.target.id === "active2" ? false : true
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
            'multiplier': true
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

    Capitalize(str) {
        if (str != null && str != "") {
            let { planningUnit } = this.state
            planningUnit.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
        }

    }
    cancelClicked() {
        this.props.history.push(`/planningUnit/listPlanningUnit/` + i18n.t('static.message.cancelled', { entityname }))
    }
    componentWillMount() {
        AuthenticationService.setupAxiosInterceptors();
        console.log(this.props.match.params.planningUnitId)
        PlanningUnitService.getPlanningUnitById(this.props.match.params.planningUnitId).then(response => {
            this.setState({
                planningUnit: response.data
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
                                    label: this.state.planningUnit.label.label_en,
                                    forecastingUnitId: this.state.planningUnit.forecastingUnit.forecastingUnitId,
                                    multiplier: this.state.planningUnit.multiplier
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    console.log(JSON.stringify(this.state.planningUnit))
                                    AuthenticationService.setupAxiosInterceptors();
                                    PlanningUnitService.editPlanningUnit(this.state.planningUnit)
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
                                            <Form onSubmit={handleSubmit} noValidate name='planningUnitForm'>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="forecastingUnitId">{i18n.t('static.planningunit.forecastingunit')}</Label>

                                                        <Input
                                                            type="text"
                                                            name="forecastingUnitId"
                                                            id="forecastingUnitId"
                                                            bsSize="sm"
                                                            readOnly
                                                            value={this.state.planningUnit.forecastingUnit.label.label_en}
                                                        >
                                                        </Input>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="unitId">{i18n.t('static.unit.unit')}</Label>
                                                        <Input
                                                            type="text"
                                                            name="unitId"
                                                            id="unitId"
                                                            bsSize="sm"
                                                            readOnly
                                                            value={this.state.planningUnit.unit.label.label_en}
                                                        >
                                                        </Input>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="label">{i18n.t('static.planningunit.planningunit')}</Label>
                                                        <Input
                                                            type="text"
                                                            name="label"
                                                            id="label"
                                                            bsSize="sm"
                                                            valid={!errors.label}
                                                            invalid={touched.label && !!errors.label}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.planningUnit.label.label_en}
                                                            required
                                                        >
                                                        </Input>
                                                        <FormFeedback className="red">{errors.label}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="multiplier">{i18n.t('static.unit.multiplier')}</Label>
                                                        <Input type="number"
                                                            name="multiplier"
                                                            id="multiplier"
                                                            bsSize="sm"
                                                            valid={!errors.multiplier}
                                                            invalid={touched.multiplier && !!errors.multiplier}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.planningUnit.multiplier}
                                                            required />
                                                        <FormFeedback className="red">{errors.multiplier}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label className="P-absltRadio">{i18n.t('static.common.status')}  </Label>
                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.planningUnit.active === true}
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
                                                                checked={this.state.planningUnit.active === false}
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
                                                        <Button type="reset" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="success" className="float-right mr-1" onClick={this.resetClicked}><i className="fa fa-times"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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

    resetClicked() {
        AuthenticationService.setupAxiosInterceptors();
        console.log(this.props.match.params.planningUnitId)
        PlanningUnitService.getPlanningUnitById(this.props.match.params.planningUnitId).then(response => {
            this.setState({
                planningUnit: response.data
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

}