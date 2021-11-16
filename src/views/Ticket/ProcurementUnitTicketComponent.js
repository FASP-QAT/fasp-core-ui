import React, { Component } from "react";
import {
    Row, Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Col, FormFeedback, Form, InputGroupAddon, InputGroupText, FormText, ModalFooter
} from 'reactstrap';
import Select from 'react-select';
import { Formik } from 'formik';
import * as Yup from 'yup';
import '../Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import JiraTikcetService from '../../api/JiraTikcetService';
import getLabelText from "../../CommonComponent/getLabelText";
import SupplierService from "../../api/SupplierService";
import UnitService from "../../api/UnitService";
import PlanningUnitService from "../../api/PlanningUnitService";
import { SPACE_REGEX } from "../../Constants";

const initialValues = {
    summary: 'Add Procurement Unit',
    procurementUnitName: '',
    planningUnitId: '',
    multiplier: '',
    unitId: '',
    supplierId: '',
    heightUnitId: '',
    heightQty: 0,
    lengthUnitId: '',
    lengthQty: 0,
    widthUnitId: '',
    widthQty: 0,
    weightUnitId: '',
    weightQty: 0,
    labeling: '',
    unitsPerContainer: 0,
    unitsPerCase: 0,
    unitsPerPallet: 0,
    notes: ''
}

const validationSchema = function (values) {
    return Yup.object().shape({
        summary: Yup.string()
            .matches(SPACE_REGEX, i18n.t('static.common.spacenotallowed'))
            .required(i18n.t('static.common.summarytext')),
        procurementUnitName: Yup.string()
            .required(i18n.t('static.procurementUnit.validProcurementUnitText')),
        planningUnitId: Yup.string()
            .required(i18n.t('static.procurementUnit.validPlanningUnitText')),
        multiplier: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .required(i18n.t('static.procurementUnit.validMultiplierText')).min(0, i18n.t('static.procurementUnit.validValueText')),
        unitId: Yup.string()
            .required(i18n.t('static.procurementUnit.validUnitIdText')),
        supplierId: Yup.string()
            .required(i18n.t('static.procurementUnit.validSupplierIdText')),
        heightQty: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        lengthQty: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        widthQty: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        weightQty: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        unitsPerCase: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        unitsPerPallet: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        unitsPerContainer: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
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

export default class ProcurementUnitTicketComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            procurementUnit: {
                summary: 'Add Procurement Unit',
                planningUnitId: '',
                multiplier: '',
                unitId: '',
                supplierId: '',
                heightUnitId: '',
                heightQty: 0,
                lengthUnitId: '',
                lengthQty: 0,
                widthUnitId: '',
                widthQty: 0,
                weightUnitId: '',
                weightQty: 0,
                labeling: '',
                unitsPerCase: 0,
                unitsPerPallet: 0,
                unitsPerContainer: 0,
                notes: ''
            },
            lang: localStorage.getItem('lang'),
            message: '',
            planningUnitList: [],
            unitList: [],
            supplierList: [],
            planningUnitId: '',
            unitId: '',
            supplierId: '',
            heightUnitId: '',
            lengthUnitId: '',
            widthUnitId: '',
            weightUnitId: '',
            loading: false

        }
        this.dataChange = this.dataChange.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }
    Capitalize(str) {
        let { procurementUnit } = this.state
        procurementUnit.procurementUnitName = str.charAt(0).toUpperCase() + str.slice(1)
    }

    componentDidMount() {
        // AuthenticationService.setupAxiosInterceptors();
        PlanningUnitService.getActivePlanningUnitList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        planningUnitList: response.data
                    })
                } else {
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

        // AuthenticationService.setupAxiosInterceptors();
        UnitService.getUnitListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        unitList: response.data
                    })
                } else {
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

        // AuthenticationService.setupAxiosInterceptors();
        SupplierService.getSupplierListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        supplierList: response.data
                    })
                } else {
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

    dataChange(event) {
        let { procurementUnit } = this.state;
        if (event.target.name == "summary") {
            procurementUnit.summary = event.target.value;
        }
        if (event.target.name == "procurementUnitName") {
            procurementUnit.procurementUnitName = event.target.value;
        }
        if (event.target.name == "planningUnitId") {
            procurementUnit.planningUnitId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                planningUnitId: event.target.value
            })
        }
        if (event.target.name == "multiplier") {
            procurementUnit.multiplier = event.target.value;
        }
        if (event.target.name == "unitId") {
            procurementUnit.unitId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                unitId: event.target.value
            })
        }
        if (event.target.name == "supplierId") {
            procurementUnit.supplierId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                supplierId: event.target.value
            })
        }
        if (event.target.name == "heightUnitId") {
            procurementUnit.heightUnitId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                heightUnitId: event.target.value
            })
        }
        if (event.target.name == "heightQty") {
            procurementUnit.heightQty = event.target.value;
        }
        if (event.target.name == "lengthUnitId") {
            procurementUnit.lengthUnitId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                lengthUnitId: event.target.value
            })
        }
        if (event.target.name == "lengthQty") {
            procurementUnit.lengthQty = event.target.value;
        }
        if (event.target.name == "widthUnitId") {
            procurementUnit.widthUnitId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                widthUnitId: event.target.value
            })
        }
        if (event.target.name == "widthQty") {
            procurementUnit.widthQty = event.target.value;
        }
        if (event.target.name == "weightUnitId") {
            procurementUnit.weightUnitId = event.target.options[event.target.selectedIndex].innerHTML;
            this.setState({
                weightUnitId: event.target.value
            })
        }
        if (event.target.name == "weightQty") {
            procurementUnit.weightQty = event.target.value;
        }
        if (event.target.name == "labeling") {
            procurementUnit.labeling = event.target.value;
        }
        if (event.target.name == "unitsPerCase") {
            procurementUnit.unitsPerCase = event.target.value;
        }
        if (event.target.name == "unitsPerPallet") {
            procurementUnit.unitsPerPallet = event.target.value;
        }
        if (event.target.name == "unitsPerContainer") {
            procurementUnit.unitsPerContainer = event.target.value;
        }
        if (event.target.name == "notes") {
            procurementUnit.notes = event.target.value;
        }
        this.setState({ procurementUnit }, () => { })

    }
    touchAll(setTouched, errors) {
        setTouched({
            procurementUnitName: true,
            planningUnitId: true,
            multiplier: true,
            unitId: true,
            supplierId: true,
            heightUnitId: true,
            heightQty: true,
            lengthUnitId: true,
            lengthQty: true,
            widthUnitId: true,
            widthQty: true,
            weightUnitId: true,
            weightQty: true,
            labeling: true,
            unitsPerCase: true,
            unitsPerPallet: true,
            unitsPerContainer: true,
            summary: true,
            notes: true
        }
        )
        this.validateForm(errors)
    }
    validateForm(errors) {
        this.findFirstError('procurementUnitForm', (fieldName) => {
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

        const { planningUnitList } = this.state;
        let planningUnits = planningUnitList.length > 0
            && planningUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.planningUnitId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { unitList } = this.state;
        let units = unitList.length > 0
            && unitList.map((item, i) => {
                return (
                    <option key={i} value={item.unitId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        const { supplierList } = this.state;
        let suppliers = supplierList.length > 0
            && supplierList.map((item, i) => {
                return (
                    <option key={i} value={item.supplierId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        return (

            <div className="col-md-12">
                <h5 className="red" id="div2">{i18n.t(this.state.message)}</h5>
                <h4>{i18n.t('static.procurementUnit.procurementUnit')}</h4>
                <br></br>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Formik
                        initialValues={initialValues}
                        validate={validate(validationSchema)}
                        onSubmit={(values, { setSubmitting, setErrors }) => {
                            this.setState({
                                loading: true
                            })
                            JiraTikcetService.addEmailRequestIssue(this.state.procurementUnit).then(response => {
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
                                handleReset
                            }) => (

                                    <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='procurementUnitForm'>
                                        < FormGroup >
                                            <Label for="summary">{i18n.t('static.common.summary')}<span class="red Reqasterisk">*</span></Label>
                                            <Input type="text" name="summary" id="summary" readOnly={true}
                                                bsSize="sm"
                                                valid={!errors.summary && this.state.procurementUnit.summary != ''}
                                                invalid={touched.summary && !!errors.summary}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.procurementUnit.summary}
                                                required />
                                            <FormFeedback className="red">{errors.summary}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="procurementUnitName">{i18n.t('static.procurementUnit.procurementUnit')}<span class="red Reqasterisk">*</span></Label>
                                            <Input
                                                type="text" name="procurementUnitName" id="procurementUnitName"
                                                bsSize="sm"
                                                valid={!errors.procurementUnitName && this.state.procurementUnit.procurementUnitName != ''}
                                                invalid={touched.procurementUnitName && !!errors.procurementUnitName}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                onBlur={handleBlur}
                                                value={this.state.procurementUnit.procurementUnitName}
                                                required />
                                            <FormFeedback className="red">{errors.procurementUnitName}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="planningUnitId">{i18n.t('static.procurementUnit.planningUnit')}</Label>
                                            <Input
                                                bsSize="sm"
                                                valid={!errors.planningUnitId && this.state.procurementUnit.planningUnitId != ''}
                                                invalid={touched.planningUnitId && !!errors.planningUnitId}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.planningUnitId}
                                                type="select" name="planningUnitId" id="planningUnitId">
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {planningUnits}
                                            </Input>
                                            <FormFeedback>{errors.planningUnitId}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="multiplier">{i18n.t('static.procurementUnit.multiplier')}<span class="red Reqasterisk">*</span></Label>
                                            <Input
                                                type="number" name="multiplier" valid={!errors.multiplier && this.state.procurementUnit.multiplier != ''}
                                                bsSize="sm"
                                                invalid={touched.multiplier && !!errors.multiplier}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.procurementUnit.multiplier}
                                                id="multiplier" />
                                            <FormFeedback className="red">{errors.multiplier}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="unitId">{i18n.t('static.procurementUnit.unit')}<span class="red Reqasterisk">*</span></Label>
                                            <Input
                                                bsSize="sm"
                                                valid={!errors.unitId && this.state.procurementUnit.unitId != ''}
                                                invalid={touched.unitId && !!errors.unitId}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.unitId}
                                                type="select" name="unitId" id="unitId">
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {units}
                                            </Input>
                                            <FormFeedback>{errors.unitId}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="supplierId">{i18n.t('static.procurementUnit.supplier')}<span class="red Reqasterisk">*</span></Label>
                                            <Input
                                                bsSize="sm"
                                                valid={!errors.supplierId && this.state.procurementUnit.supplierId != ''}
                                                invalid={touched.supplierId && !!errors.supplierId}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.supplierId}
                                                type="select" name="supplierId" id="supplierId">
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {suppliers}
                                            </Input>
                                            <FormFeedback>{errors.supplierId}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="heightUnitId">{i18n.t('static.procurementUnit.heightUnit')}</Label>
                                            <Input
                                                bsSize="sm"
                                                valid={!errors.heightUnitId && this.state.procurementUnit.heightUnitId != ''}
                                                invalid={touched.heightUnitId && !!errors.heightUnitId}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.heightUnitId}
                                                type="select" name="heightUnitId" id="heightUnitId">
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {units}
                                            </Input>
                                            <FormFeedback>{errors.heightUnitId}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="heightQty">{i18n.t('static.procurementUnit.heightQty')}</Label>
                                            <Input
                                                type="number" name="heightQty" valid={!errors.heightQty && this.state.procurementUnit.heightQty != '' && this.state.procurementUnit.heightQty != '0'}
                                                bsSize="sm"
                                                invalid={touched.heightQty && !!errors.heightQty}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.procurementUnit.heightQty}
                                                id="heightQty" />
                                            <FormFeedback className="red">{errors.heightQty}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="lengthUnitId">{i18n.t('static.procurementUnit.lengthUnit')}</Label>
                                            <Input
                                                bsSize="sm"
                                                valid={!errors.lengthUnitId && this.state.procurementUnit.lengthUnitId != ''}
                                                invalid={touched.lengthUnitId && !!errors.lengthUnitId}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.lengthUnitId}
                                                type="select" name="lengthUnitId" id="lengthUnitId">
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {units}
                                            </Input>
                                            <FormFeedback>{errors.lengthUnitId}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="lengthQty">{i18n.t('static.procurementUnit.lengthQty')}</Label>
                                            <Input
                                                type="number" name="lengthQty" valid={!errors.lengthQty && this.state.procurementUnit.lengthQty != '' && this.state.procurementUnit.lengthQty != '0'}
                                                bsSize="sm"
                                                invalid={touched.lengthQty && !!errors.lengthQty}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.procurementUnit.lengthQty}
                                                id="lengthQty" />
                                            <FormFeedback className="red">{errors.lengthQty}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="widthUnitId">{i18n.t('static.procurementUnit.widthUnit')}</Label>
                                            <Input
                                                bsSize="sm"
                                                valid={!errors.widthUnitId && this.state.procurementUnit.widthUnitId != ''}
                                                invalid={touched.widthUnitId && !!errors.widthUnitId}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.widthUnitId}
                                                type="select" name="widthUnitId" id="widthUnitId">
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {units}
                                            </Input>
                                            <FormFeedback>{errors.widthUnitId}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="widthQty">{i18n.t('static.procurementUnit.widthQty')}</Label>
                                            <Input
                                                type="number" name="widthQty" valid={!errors.widthQty && this.state.procurementUnit.widthQty != '' && this.state.procurementUnit.widthQty != '0'}
                                                bsSize="sm"
                                                invalid={touched.widthQty && !!errors.widthQty}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.procurementUnit.widthQty}
                                                id="widthQty" />
                                            <FormFeedback className="red">{errors.widthQty}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="weightUnitId">{i18n.t('static.procurementUnit.weightUnit')}</Label>
                                            <Input
                                                bsSize="sm"
                                                valid={!errors.weightUnitId && this.state.procurementUnit.weightUnitId != ''}
                                                invalid={touched.weightUnitId && !!errors.weightUnitId}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.weightUnitId}
                                                type="select" name="weightUnitId" id="weightUnitId">
                                                <option value="">{i18n.t('static.common.select')}</option>
                                                {units}
                                            </Input>
                                            <FormFeedback>{errors.weightUnitId}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="weightQty">{i18n.t('static.procurementUnit.weightQty')}</Label>
                                            <Input
                                                type="number" name="weightQty" valid={!errors.weightQty && this.state.procurementUnit.weightQty != '' && this.state.procurementUnit.weightQty != '0'}
                                                bsSize="sm"
                                                invalid={touched.weightQty && !!errors.weightQty}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.procurementUnit.weightQty}
                                                id="weightQty" />
                                            <FormFeedback className="red">{errors.weightQty}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="labeling">{i18n.t('static.procurementUnit.labeling')}</Label>
                                            <Input
                                                type="text" name="labeling" valid={!errors.labeling && this.state.procurementUnit.labeling != ''}
                                                bsSize="sm"
                                                invalid={touched.labeling && !!errors.labeling}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.procurementUnit.labeling}
                                                id="labeling" />
                                            <FormFeedback className="red">{errors.labeling}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="unitsPerCase">{i18n.t('static.procurementUnit.unitsPerCase')}</Label>
                                            <Input
                                                type="number" name="unitsPerCase" valid={!errors.unitsPerCase && this.state.procurementUnit.unitsPerCase != ''}
                                                bsSize="sm"
                                                invalid={touched.unitsPerCase && !!errors.unitsPerCase}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.procurementUnit.unitsPerCase}
                                                id="unitsPerCase" />
                                            <FormFeedback className="red">{errors.unitsPerCase}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="unitsPerPallet">{i18n.t('static.procurementUnit.unitsPerPallet')}</Label>
                                            <Input
                                                type="number" name="unitsPerPallet" valid={!errors.unitsPerPallet && this.state.procurementUnit.unitsPerPallet != ''}
                                                bsSize="sm"
                                                invalid={touched.unitsPerPallet && !!errors.unitsPerPallet}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.procurementUnit.unitsPerPallet}
                                                id="unitsPerPallet" />
                                            <FormFeedback className="red">{errors.unitsPerPallet}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label htmlFor="unitsPerContainer">{i18n.t('static.procurementUnit.unitsPerContainer')}</Label>
                                            <Input
                                                type="number" name="unitsPerContainer" valid={!errors.unitsPerContainer && this.state.procurementUnit.unitsPerContainer != ''}
                                                bsSize="sm"
                                                invalid={touched.unitsPerContainer && !!errors.unitsPerContainer}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.procurementUnit.unitsPerContainer}
                                                id="unitsPerContainer" />
                                            <FormFeedback className="red">{errors.unitsPerContainer}</FormFeedback>
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="notes">{i18n.t('static.common.notes')}</Label>
                                            <Input type="textarea" name="notes" id="notes"
                                                bsSize="sm"
                                                valid={!errors.notes && this.state.procurementUnit.notes != ''}
                                                invalid={touched.notes && !!errors.notes}
                                                onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                onBlur={handleBlur}
                                                value={this.state.procurementUnit.notes}
                                                maxLength={600}
                                            // required 
                                            />
                                            <FormFeedback className="red">{errors.notes}</FormFeedback>
                                        </FormGroup>
                                        <ModalFooter className="pb-0 pr-0">
                                            <Button type="button" size="md" color="info" className="mr-1 pr-3 pl-3" onClick={this.props.toggleMaster}><i className="fa fa-angle-double-left "></i>  {i18n.t('static.common.back')}</Button>
                                            <Button type="reset" size="md" color="warning" className="mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                            <Button type="submit" size="md" color="success" className="mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid}><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                        </ModalFooter>
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

    resetClicked() {
        let { procurementUnit } = this.state;
        // procurementUnit.summary = ''
        procurementUnit.procurementUnitName = ''
        procurementUnit.planningUnitId = ''
        procurementUnit.multiplier = ''
        procurementUnit.unitId = ''
        procurementUnit.supplierId = ''
        procurementUnit.heightUnitId = ''
        procurementUnit.heightQty = ''
        procurementUnit.lengthUnitId = ''
        procurementUnit.lengthQty = ''
        procurementUnit.widthUnitId = ''
        procurementUnit.widthQty = ''
        procurementUnit.weightUnitId = ''
        procurementUnit.weightQty = ''
        procurementUnit.labeling = ''
        procurementUnit.unitsPerCase = ''
        procurementUnit.unitsPerPallet = ''
        procurementUnit.unitsPerContainer = ''
        procurementUnit.notes = ''

        this.setState({ procurementUnit }, () => { })

    }
}