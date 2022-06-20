import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, FormFeedback, CardBody, Form, FormGroup, Label, Input, } from 'reactstrap';
import { Formik } from 'formik';
import * as Yup from 'yup'
import '../Forms/ValidationForms/ValidationForms.css'
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import i18n from '../../i18n';
import UnitService from '../../api/UnitService.js';
import getLabelText from '../../CommonComponent/getLabelText';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { SPACE_REGEX } from '../../Constants.js';

let initialValues = {
    unitId: '',
    label: '',
    forecastingUnitId: '',
    multiplier: ''
}
const entityname = i18n.t('static.planningunit.planningunit');

const validationSchema = function (values) {
    return Yup.object().shape({
        unitId: Yup.string()
            .required(i18n.t('static.planningUnit.plannignUnitMeasure')),
        label: Yup.string()
            // .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.planningUnit.plannignUnitName')),
        forecastingUnitId: Yup.string()
            .required(i18n.t('static.planningUnit.enterAssociatedForecastingUnit')),
        multiplier: Yup.string()
            .matches(/^\d{1,10}(\.\d{1,2})?$/, i18n.t('static.planningUnit.conversionFactor'))
            // .matches(/^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .required(i18n.t('static.planningUnit.multiplier'))
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
            forecastingUnits: [],

            message: '',
            planningUnit:
            {
                active: '',
                unit: {
                    id: ''
                },
                label: {
                    label_en: ''
                },
                forecastingUnit: {
                    forecastingUnitId: ''
                },
                multiplier: ''
            },
            loading: true
        }
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.changePlanningUnit = this.changePlanningUnit.bind(this);
    }

    changePlanningUnit() {
        // alert("HI forecastingUnitId");
        let forecastingUnitId = document.getElementById("forecastingUnitId").value;

        if (forecastingUnitId != '') {
            // alert("if";
            let forecastingUnitText = document.getElementById("forecastingUnitId")
            var selectedText = forecastingUnitText.options[forecastingUnitText.selectedIndex].text;
            let { planningUnit } = this.state;
            planningUnit.label.label_en = selectedText;
            this.setState({ planningUnit }, () => { })
        } else {
            // alert("else")
            var selectedText = '';
            let { planningUnit } = this.state;
            planningUnit.label.label_en = selectedText;
            this.setState({ planningUnit }, () => { })
        }
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    dataChange(event) {
        let { planningUnit } = this.state
        console.log(event.target.value);
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
            multipler: true
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
        // AuthenticationService.setupAxiosInterceptors();
        UnitService.getUnitListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        units: listArray, loading: false
                    })
                    // AuthenticationService.setupAxiosInterceptors();
                    ForecastingUnitService.getForecastingUnitList().then(response => {
                        console.log("RESP----->", response.data)
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        this.setState({
                            forecastingUnits: listArray, loading: false
                        })
                    }).catch(
                        error => {
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
                            } else {
                                switch (error.response ? error.response.status : "") {

                                    case 401:
                                        this.props.history.push(`/login/static.message.sessionExpired`)
                                        break;
                                    case 403:
                                        this.props.history.push(`/accessDenied`)
                                        break;
                                    case 500:
                                    case 404:
                                    case 406:
                                        this.setState({
                                            message: error.response.data.messageCode,
                                            loading: false
                                        });
                                        break;
                                    case 412:
                                        this.setState({
                                            message: error.response.data.messageCode,
                                            loading: false
                                        });
                                        break;
                                    default:
                                        this.setState({
                                            message: 'static.unkownError',
                                            loading: false
                                        });
                                        break;
                                }
                            }
                        }
                    );
                }
                else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }

            }).catch(
                error => {
                    if (error.message === "Network Error") {
                        this.setState({
                            message: 'static.unkownError',
                            loading: false
                        });
                    } else {
                        switch (error.response ? error.response.status : "") {

                            case 401:
                                this.props.history.push(`/login/static.message.sessionExpired`)
                                break;
                            case 403:
                                this.props.history.push(`/accessDenied`)
                                break;
                            case 500:
                            case 404:
                            case 406:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            case 412:
                                this.setState({
                                    message: error.response.data.messageCode,
                                    loading: false
                                });
                                break;
                            default:
                                this.setState({
                                    message: 'static.unkownError',
                                    loading: false
                                });
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
                        {item.label.label_en + "-" + item.unit.label.label_en}
                    </option>
                )
            }, this);




        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            {/* <CardHeader>
                                <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                            </CardHeader> */}
                            <Formik
                                // initialValues={initialValues}
                                enableReinitialize={true}
                                initialValues={{
                                    label: this.state.planningUnit.label.label_en,
                                    unitId: this.state.planningUnit.unit.id,
                                    forecastingUnitId: this.state.planningUnit.forecastingUnit.forecastingUnitId,
                                    multiplier: this.state.planningUnit.multiplier
                                }}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    console.log(JSON.stringify(this.state.planningUnit))
                                    PlanningUnitService.addPlanningUnit(this.state.planningUnit)
                                        .then(response => {
                                            if (response.status == 200) {
                                                this.props.history.push(`/planningUnit/listPlanningUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                            } else {
                                                this.setState({
                                                    message: response.data.messageCode, loading: false
                                                },
                                                    () => {
                                                        this.hideSecondComponent();
                                                    })
                                            }
                                        }).catch(
                                            error => {
                                                if (error.message === "Network Error") {
                                                    this.setState({
                                                        message: 'static.unkownError',
                                                        loading: false
                                                    });
                                                } else {
                                                    switch (error.response ? error.response.status : "") {

                                                        case 401:
                                                            this.props.history.push(`/login/static.message.sessionExpired`)
                                                            break;
                                                        case 403:
                                                            this.props.history.push(`/accessDenied`)
                                                            break;
                                                        case 500:
                                                        case 404:
                                                        case 406:
                                                            this.setState({
                                                                message: error.response.data.messageCode,
                                                                loading: false
                                                            });
                                                            break;
                                                        case 412:
                                                            this.setState({
                                                                message: error.response.data.messageCode,
                                                                loading: false
                                                            });
                                                            break;
                                                        default:
                                                            this.setState({
                                                                message: 'static.unkownError',
                                                                loading: false
                                                            });
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
                                        setTouched,
                                        handleReset
                                    }) => (
                                        <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='planningUnitForm' autocomplete="off">
                                            <CardBody>
                                                <FormGroup>
                                                    <Label htmlFor="forecastingUnitId">{i18n.t('static.planningUnit.associatedForecastingUnit')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="forecastingUnitId"
                                                        id="forecastingUnitId"
                                                        bsSize="sm"
                                                        valid={!errors.forecastingUnitId && this.state.planningUnit.forecastingUnit.forecastingUnitId != ''}
                                                        invalid={touched.forecastingUnitId && !!errors.forecastingUnitId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.changePlanningUnit(e); }}
                                                        onBlur={handleBlur}
                                                        required
                                                        value={this.state.planningUnit.forecastingUnit.forecastingUnitId}
                                                    >
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {forecastingUnitList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.forecastingUnitId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="multiplier">{i18n.t('static.planningUnit.labelMultiplier')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input type="number"
                                                        name="multiplier"
                                                        id="multiplier"
                                                        bsSize="sm"
                                                        valid={!errors.multiplier && this.state.planningUnit.multiplier != ''}
                                                        invalid={touched.multiplier && !!errors.multiplier}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.planningUnit.multiplier}
                                                        required />
                                                    <FormFeedback className="red">{errors.multiplier}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="label">{i18n.t('static.product.productName')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input type="text"
                                                        name="label"
                                                        id="label"
                                                        bsSize="sm"
                                                        valid={!errors.label && this.state.planningUnit.label.label_en != ''}
                                                        invalid={touched.label && !!errors.label}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.planningUnit.label.label_en}
                                                        required />
                                                    <FormFeedback className="red">{errors.label}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="unitId">{i18n.t('static.planningUnit.planningUnitOfMeasure')}<span className="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="select"
                                                        name="unitId"
                                                        id="unitId"
                                                        bsSize="sm"
                                                        valid={!errors.unitId && this.state.planningUnit.unit.id != ''}
                                                        invalid={touched.unitId && !!errors.unitId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.planningUnit.unit.id}
                                                        required>
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {unitList}
                                                    </Input>
                                                    <FormFeedback className="red">{errors.unitId}</FormFeedback>
                                                </FormGroup>

                                                <FormGroup>
                                                    <Label htmlFor="unitId">{i18n.t('static.planningUnit.plannignUniteg')}</Label>
                                                </FormGroup>


                                            </CardBody>

                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                                    &nbsp;

                                                </FormGroup>
                                            </CardFooter>
                                        </Form>

                                    )} />

                        </Card>
                    </Col>
                </Row>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    {/* <h6>{i18n.t(this.state.message)}</h6>
                    <h6>{i18n.t(this.props.match.params.message)}</h6> */}
                </div>
            </div>
        );
    }

    cancelClicked() {
        this.props.history.push(`/planningUnit/listPlanningUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { planningUnit } = this.state

        planningUnit.label.label_en = ''
        planningUnit.forecastingUnit.forecastingUnitId = ''
        planningUnit.unit.id = ''
        planningUnit.multiplier = ''

        this.setState(
            {
                planningUnit
            }
        )
    }

}