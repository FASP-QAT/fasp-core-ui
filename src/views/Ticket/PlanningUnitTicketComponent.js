import React, { Component } from 'react';
import { Row, Col, Card, CardHeader, CardFooter, Button, CardBody, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon, InputGroupText, ModalFooter } from 'reactstrap';
import AuthenticationService from '../Common/AuthenticationService';
import imageHelp from '../../assets/img/help-icon.png';
import InitialTicketPageComponent from './InitialTicketPageComponent';
import { Formik } from 'formik';
import i18n from '../../i18n';
import * as Yup from 'yup';
import JiraTikcetService from '../../api/JiraTikcetService';
import UnitService from '../../api/UnitService';
import ForecastingUnitService from '../../api/ForecastingUnitService';
import { SPACE_REGEX } from '../../Constants';
import getLabelText from '../../CommonComponent/getLabelText';

import Select from 'react-select';
import 'react-select/dist/react-select.min.css';
import classNames from 'classnames';
import '../Forms/ValidationForms/ValidationForms.css'

let summaryText_1 = (i18n.t("static.common.add") + " " + i18n.t("static.planningunit.planningunit"))
let summaryText_2 = "Add Planning Unit"
const initialValues = {
    summary: "",
    planningUnitDesc: "",
    forecastingUnitDesc: "",
    unit: "",
    multiplier: "",
    notes: ""
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        planningUnitDesc: Yup.string()
            // .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.product.productnametext')),
        forecastingUnitDesc: Yup.string()
            .required(i18n.t('static.planningunit.forcastingunittext').concat((i18n.t('static.ticket.unavailableDropdownValidationText')).replace('?', i18n.t('static.forecastingunit.forecastingunit')))).nullable(),
        unit: Yup.string()
            .required(i18n.t('static.procurementUnit.validUnitIdText')),
        multiplier: Yup.string()
            .matches(/^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .required(i18n.t('static.planningUnit.multiplier'))
            .min(0, i18n.t('static.program.validvaluetext'))
        // notes: Yup.string()
        //     .required(i18n.t('static.common.notestext'))
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

export default class PlanningUnitTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            planningUnit: {
                summary: summaryText_1,
                planningUnitDesc: '',
                forecastingUnitDesc: '',
                unit: '',
                multiplier: '',
                notes: ''
            },
            lang: localStorage.getItem('lang'),
            message: '',
            units: [],
            forecastingUnits: [],
            forecastingUnitList: [],
            unitId: '',
            forecastingUnitId: '',
            loading: true
        }
        this.dataChange = this.dataChange.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.changeForecastingUnit = this.changeForecastingUnit.bind(this);
    }

    dataChange(event) {
        let { planningUnit } = this.state
        if (event.target.name == "summary") {
            planningUnit.summary = event.target.value;
        }
        if (event.target.name == "planningUnitDesc") {
            planningUnit.planningUnitDesc = event.target.value;
        }
        if (event.target.name == "forecastingUnitDesc") {
            planningUnit.forecastingUnitDesc = event.target.value !== "" ? this.state.forecastingUnits.filter(c => c.forecastingUnitId == event.target.value)[0].label.label_en : "";
            this.setState({
                forecastingUnitId: event.target.value
            })
        }
        if (event.target.name == "unit") {
            planningUnit.unit = event.target.value !== "" ? this.state.units.filter(c => c.unitId == event.target.value)[0].label.label_en : "";
            this.setState({
                unitId: event.target.value
            })
        }
        if (event.target.name == "multiplier") {
            planningUnit.multiplier = event.target.value;
        }
        if (event.target.name == "notes") {
            planningUnit.notes = event.target.value;
        }
        this.setState({
            planningUnit
        }, () => { })
    };

    changeForecastingUnit(event) {        
        if (event === null) {
            let { planningUnit } = this.state;
            planningUnit.forecastingUnitDesc = ''
            this.setState({
                planningUnit: planningUnit,
                forecastingUnitId: ''
            });
        } else {
            let { planningUnit } = this.state;
            var outText = "";
            if (event.value !== "") {
                var forecastingUnitT = this.state.forecastingUnits.filter(c => c.forecastingUnitId == event.value)[0];
                outText = forecastingUnitT.label.label_en;
            }
            planningUnit.forecastingUnitDesc = outText;
            this.setState({
                planningUnit: planningUnit,
                forecastingUnitId: event.value
            });
        }
    }

    touchAll(setTouched, errors) {
        setTouched({
            summary: true,
            planningUnitDesc: true,
            forecastingUnitDesc: true,
            unit: true,
            multiplier: true,
            notes: true
        })
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('simpleForm', (fieldName) => {
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
                        units: listArray
                    })
                    // AuthenticationService.setupAxiosInterceptors();
                    ForecastingUnitService.getForecastingUnitList().then(response => {
                        var listArray = response.data;
                        listArray.sort((a, b) => {
                            var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase(); // ignore upper and lowercase
                            var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase(); // ignore upper and lowercase                   
                            return itemLabelA > itemLabelB ? 1 : -1;
                        });
                        var unitList = [];
                        for (var i = 0; i < listArray.length; i++) {
                            unitList[i] = { value: listArray[i].forecastingUnitId, label: getLabelText(listArray[i].label, this.state.lang) }
                        }
                        this.setState({
                            forecastingUnits: listArray,
                            forecastingUnitList: unitList,
                            loading: false
                        })
                    })
                }
                else {
                    this.setState({
                        message: response.data.messageCode
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

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 30000);
    }

    submitHandler = event => {
        event.preventDefault();
        event.target.className += " was-validated";
    }

    resetClicked() {
        let { planningUnit } = this.state;
        // planningUnit.summary = '';
        planningUnit.planningUnitDesc = '';
        planningUnit.forecastingUnitDesc = '';
        planningUnit.unit = '';
        planningUnit.multiplier = '';
        planningUnit.notes = '';
        this.setState({
            planningUnit: planningUnit,
            unitId: '',
            forecastingUnitId: ''
        },
            () => { });
    }

    render() {

        const { units } = this.state;
        let unitList = units.length > 0
            && units.map((item, i) => {
                return (
                    <option key={i} value={item.unitId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);
        // const { forecastingUnits } = this.state;
        // let forecastingUnitList = forecastingUnits.length > 0
        //     && forecastingUnits.map((item, i) => {
        //         return (
        //             <option key={i} value={item.forecastingUnitId}>
        //                 {getLabelText(item.label, this.state.lang)}
        //             </option>
        //         )
        //     }, this);

        return (
            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.planningunit.planningunit')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        enableReinitialize={true}
                        initialValues={{
                            summary: summaryText_1,
                            planningUnitDesc: "",
                            forecastingUnitDesc: "",
                            unit: "",
                            multiplier: "",
                            notes: ""
                        }}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            this.state.planningUnit.summary = summaryText_2;
                            this.state.planningUnit.userLanguageCode = this.state.lang;
                            JiraTikcetService.addEmailRequestIssue(this.state.planningUnit).then(response => {
                                console.log("Response :", response.status, ":", JSON.stringify(response.data));
                                if (response.status == 200 || response.status == 201) {
                                    var msg = response.data.key;
                                    this.setState({
                                        message: msg, loading: false
                                    },
                                        () => {
                                            this.resetClicked();
                                            this.hideSecondComponent();
                                        })
                                } else {
                                    this.setState({
                                        message: i18n.t('static.unkownError'), loading: false
                                    },
                                        () => {
                                            this.hideSecondComponent();
                                        })
                                }
                                this.props.togglehelp();
                                this.props.toggleSmall(this.state.message);
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
                                handleReset,
                                setFieldValue,
                                setFieldTouched
                            }) => (
                                    <Form className="needs-validation" onSubmit={handleSubmit} onReset={handleReset} noValidate name='simpleForm' autocomplete="off">
                                        < FormGroup >
                                            <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text" name="summary" id="summary" readOnly={true}
                                                bsSize="sm"
                                                valid={!errors.summary && this.state.planningUnit.summary != ''}
                                                invalid={touched.summary && !!errors.summary}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.planningUnit.summary}
                                                required />
                                            <FormFeedback className="red">{errors.summary}</FormFeedback>
                                        </FormGroup>
                                        < FormGroup className="Selectcontrol-bdrNone">
                                            <Label for="forecastingUnitDesc">{i18n.t('static.forecastingunit.forecastingunit')}<span class="red Reqasterisk">*</span></Label>
                                            {/* <Input type="select" name="forecastingUnitDesc" id="forecastingUnitDesc"
                                                bsSize="sm"
                                                valid={!errors.forecastingUnitDesc && this.state.planningUnit.forecastingUnitDesc != ''}
                                                invalid={touched.forecastingUnitDesc && !!errors.forecastingUnitDesc}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.forecastingUnitId}
                                                required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {forecastingUnitList}
                                            </Input> */}

                                            <Select
                                                className={classNames('form-control', 'd-block', 'w-100', 'bg-light',
                                                    { 'is-valid': !errors.forecastingUnitDesc && this.state.planningUnit.forecastingUnitDesc != '' },
                                                    { 'is-invalid': (touched.forecastingUnitDesc && !!errors.forecastingUnitDesc) }
                                                )}
                                                bsSize="sm"
                                                name="forecastingUnitDesc"
                                                id="forecastingUnitDesc"
                                                isClearable={true}
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    setFieldValue("forecastingUnitDesc", e);
                                                    this.changeForecastingUnit(e);
                                                }}
                                                onBlur={() => setFieldTouched("forecastingUnitDesc", true)}
                                                required
                                                min={1}
                                                options={this.state.forecastingUnitList}
                                                value={this.state.forecastingUnitId}
                                            />

                                            <FormFeedback className="red">{errors.forecastingUnitDesc}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="multiplier">{i18n.t('static.unit.multiplier')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="number" name="multiplier" id="multiplier"
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
                                            <Label for="planningUnitDesc">{i18n.t('static.planningUnit.planningUnitName')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text" name="planningUnitDesc" id="planningUnitDesc"
                                                bsSize="sm"
                                                valid={!errors.planningUnitDesc && this.state.planningUnit.planningUnitDesc != ''}
                                                invalid={touched.planningUnitDesc && !!errors.planningUnitDesc}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.planningUnit.planningUnitDesc}
                                                required />
                                            <FormFeedback className="red">{errors.planningUnitDesc}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="unit">{i18n.t('static.unit.unit')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="select" name="unit" id="unit"
                                                bsSize="sm"
                                                valid={!errors.unit && this.state.planningUnit.unit != ''}
                                                invalid={touched.unit && !!errors.unit}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.unitId}
                                                required >
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {unitList}
                                            </Input>
                                            <FormFeedback className="red">{errors.unit}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                            <Input type="textarea" name="notes" id="notes"
                                                bsSize="sm"
                                                valid={!errors.notes && this.state.planningUnit.notes != ''}
                                                invalid={touched.notes && !!errors.notes}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                maxLength={600}
                                                value={this.state.planningUnit.notes}
                                            // required 
                                            />
                                            <FormFeedback className="red">{errors.notes}</FormFeedback>
                                        </FormGroup>
                                        <ModalFooter className="pb-0 pr-0">
                                            <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                            <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                            <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                        </ModalFooter>
                                        {/* <br></br><br></br>
                                    <div className={this.props.className}>
                                        <p>{i18n.t('static.ticket.drodownvaluenotfound')}</p>
                                    </div> */}
                                    </Form>
                                )} />
                </div>
                <div style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>{i18n.t('static.common.loading')}</strong></h4></div>
                            <div class="spinner-border blue ml-4" role="status"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}