import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Formik } from 'formik';
import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Form, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from '../../Constants.js';
import PlanningUnitService from '../../api/PlanningUnitService';
import UnitService from '../../api/UnitService.js';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import DropdownService from '../../api/DropdownService.js';
import { hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.planningunit.planningunit');
/**
 * Defines the validation schema for planning unit details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
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
/**
 * Component for adding planning unit details.
 */
export default class AddPlanningUnit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
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
            autocompleteData: [],
            searchedValue: '',
            autocompleteError: true,
            loading: true
        }
        this.submitClicked = this.submitClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.dataChange = this.dataChange.bind(this);
        this.changePlanningUnit = this.changePlanningUnit.bind(this);
    }
    /**
     * Updates the planning unit based on the selected forecasting unit.
     * If a forecasting unit is selected, the planning unit label is updated
     * with the selected unit's text. Otherwise, the planning unit label is cleared.
     */
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
    /**
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
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
                planningUnit,
                autocompleteError: false
            }
        )
    };
    /**
     * Reterives unit and forecasting units list on component mount
     */
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
                                    case 409:
                                        this.setState({
                                            message: i18n.t('static.common.accessDenied'),
                                            loading: false,
                                            color: "#BA0C2F",
                                        });
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
                            hideSecondComponent();
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
                            case 409:
                                this.setState({
                                    message: i18n.t('static.common.accessDenied'),
                                    loading: false,
                                    color: "#BA0C2F",
                                });
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
    /**
     * Retrieves autocomplete suggestions for forecasting units based on the given term.
     * @param {string} term - The search term to retrieve autocomplete suggestions for.
     */
    getAutocompleteForecastingUnit = (term) => {
        var language = this.state.lang;
        var autocompletejson = {
            "searchText": term,
            "language": language
        }
        if(term.length > 2) {
            DropdownService.getAutocompleteForecastingUnit(autocompletejson)
                .then(response => {
                    var forecastingUnitList = [];
                    for (var i = 0; i < response.data.length; i++) {
                        var label = response.data[i].label.label_en + '|' + response.data[i].id;
                        forecastingUnitList[i] = { value: response.data[i].id, label: label }
                    }
                    var listArray = forecastingUnitList;
                    listArray.sort((a, b) => {
                        var itemLabelA = a.label.toUpperCase(); 
                        var itemLabelB = b.label.toUpperCase(); 
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        autocompleteData: listArray,
                    });
                }).catch(
                    error => {
                        if (error.message === "Network Error") {
                            this.setState({
                                message: API_URL.includes("uat") ? i18n.t("static.common.uatNetworkErrorMessage") : (API_URL.includes("demo") ? i18n.t("static.common.demoNetworkErrorMessage") : i18n.t("static.common.prodNetworkErrorMessage")),
                                loading: false
                            }, () => {
                                hideSecondComponent()
                            });
                        } else {
                            switch (error.response ? error.response.status : "") {
                                case 401:
                                    this.props.history.push(`/login/static.message.sessionExpired`)
                                    break;
                                case 409:
                                    this.setState({
                                        message: i18n.t('static.common.accessDenied'),
                                        loading: false,
                                        color: "#BA0C2F",
                                    });
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
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                                case 412:
                                    this.setState({
                                        message: error.response.data.messageCode,
                                        loading: false
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                                default:
                                    this.setState({
                                        message: 'static.unkownError',
                                        loading: false
                                    }, () => {
                                        hideSecondComponent()
                                    });
                                    break;
                            }
                        }
                    }
                );
        }
    }
    /**
     * Renders the planning unit details form.
     * @returns {JSX.Element} - Planning Unit details form.
     */
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
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
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
                                                        hideSecondComponent();
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
                                                        case 409:
                                                            this.setState({
                                                                message: i18n.t('static.common.accessDenied'),
                                                                loading: false,
                                                                color: "#BA0C2F",
                                                            });
                                                            break;
                                                        case 403:
                                                            this.props.history.push(`/accessDenied`)
                                                            break;
                                                        case 500:
                                                        case 404:
                                                            this.setState({
                                                                message: error.response.data.messageCode,
                                                                loading: false
                                                            });
                                                            break;
                                                        case 406:
                                                            this.setState({
                                                                message: i18n.t('static.message.planningUnitAlreadyExists'),
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
                                                    <Autocomplete
                                                        id="forecastingUnitId"
                                                        name="forecastingUnitId"
                                                        options={this.state.autocompleteData}
                                                        getOptionLabel={(option) => option.label || ""}
                                                        onChange={(event, value) => {
                                                            if (value != null) {
                                                                let { planningUnit } = this.state;
                                                                planningUnit.forecastingUnit.forecastingUnitId = value.value;
                                                                this.setState({ planningUnit, searchedValue: value.label, }, () => { })
                                                            } else {
                                                                this.setState({
                                                                    searchedValue: '',
                                                                    autocompleteData: []
                                                                });
                                                            }
                                                        }} 
                                                        renderInput={(params) => <TextField placeholder={i18n.t('static.common.typeAtleast3')} {...params} variant="outlined"
                                                            onChange={(e) => {
                                                                this.getAutocompleteForecastingUnit(e.target.value)
                                                            }} />}
                                                    />
                                                    {this.state.autocompleteError ? <span className='red12'>{errors.forecastingUnitId}</span> : ""}
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
                                                    <Button type="submit" color="success" className="mr-1 float-right" size="md" onClick={this.submitClicked}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
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
    /**
     * Handles the submission of the form when the submit button is clicked.
     * Checks if the planning unit's forecasting unit is empty and sets an error flag accordingly.
     */
    submitClicked() {
        if(this.state.planningUnit.forecastingUnit.forecastingUnitId == ""){
            this.setState({ autocompleteError: true});
        }
    }
    /**
     * Redirects to the list planning unit screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/planningUnit/listPlanningUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the planning unit details when reset button is clicked.
     */
    resetClicked() {
        let { planningUnit } = this.state
        planningUnit.label.label_en = ''
        planningUnit.forecastingUnit.forecastingUnitId = ''
        planningUnit.unit.id = ''
        planningUnit.multiplier = ''
        let autocompleteData = []
        let searchedValue = ''
        this.setState(
            {
                planningUnit,
                autocompleteData,
                searchedValue
            }
        )
        window.location.reload(false);
    }
}