import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants.js';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import PlanningUnitService from '../../api/PlanningUnitService';
import UnitService from '../../api/UnitService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import DropdownService from '../../api/DropdownService.js';
const entityname = i18n.t('static.planningunit.planningunit');
const validationSchema = function (values) {
    return Yup.object().shape({
        unitId: Yup.string()
            .required(i18n.t('static.planningUnit.plannignUnitMeasure')),
        label: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.planningUnit.plannignUnitName')),
        forecastingUnitId: Yup.string()
            .required(i18n.t('static.planningUnit.enterAssociatedForecastingUnit')),
        multiplier: Yup.string()
            .matches(/^\d{1,10}(\.\d{1,2})?$/, i18n.t('static.planningUnit.conversionFactor'))
            .required(i18n.t('static.planningUnit.multiplier'))
            .min(0, i18n.t('static.program.validvaluetext'))
    })
}
export default class AddPlanningUnit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            units: [],
            forecastingUnits: [],
            forecastingUnitList: [],
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
        this.resetClicked = this.resetClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.changePlanningUnit = this.changePlanningUnit.bind(this);
    }
    changePlanningUnit() {
        let forecastingUnitId = document.getElementById("forecastingUnitId").value;
        if (forecastingUnitId != '') {
            let forecastingUnitText = document.getElementById("forecastingUnitId")
            var selectedText = forecastingUnitText.options[forecastingUnitText.selectedIndex].text;
            let { planningUnit } = this.state;
            planningUnit.label.label_en = selectedText;
            this.setState({ planningUnit }, () => { })
        } else {
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
    
    componentDidMount() {
        UnitService.getUnitListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        units: listArray
                    })
                    DropdownService.getForecastingUnitDropDownList().then(response => {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        let forecastingUnitList = listArray.length > 0
                            && listArray.map((item, i) => {
                                return (
                                    <option key={i} value={item.id}>
                                        {item.label.label_en + "-" + item.unit.label.label_en}
                                    </option>
                                )
                            }, this);
                        this.setState({
                            forecastingUnitList: forecastingUnitList,
                            forecastingUnits: listArray, loading: false
                        })
                    }).catch(
                        error => {
                            if (error.message === "Network Error") {
                                this.setState({
                                    message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                            message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                    
        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col sm={12} md={6} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    label: this.state.planningUnit.label.label_en,
                                    unitId: this.state.planningUnit.unit.id,
                                    forecastingUnitId: this.state.planningUnit.forecastingUnit.forecastingUnitId,
                                    multiplier: this.state.planningUnit.multiplier
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
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
                                                        message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
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
                                            <CardBody style={{ display: this.state.loading ? "none" : "block" }}>
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
                                                        {this.state.forecastingUnitList}
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
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
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
                                            <div style={{ display: this.state.loading ? "block" : "none" }}>
                                                <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                                                    <div class="align-items-center">
                                                        <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                                        <div class="spinner-border blue ml-4" role="status">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <CardFooter>
                                                <FormGroup>
                                                    <Button type="button" color="danger" className="mr-1 float-right" size="md" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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