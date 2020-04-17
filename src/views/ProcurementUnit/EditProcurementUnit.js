import React, { Component } from "react";
import {
    Row, Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Col, FormFeedback, Form
} from 'reactstrap';
import Select from 'react-select';
import { Formik } from 'formik';
import * as Yup from 'yup';
import '../Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import ProcurementUnitService from "../../api/ProcurementUnitService";
import { lang } from "moment";
import i18n from "../../i18n"
import getLabelText from '../../CommonComponent/getLabelText'
import AuthenticationService from '../Common/AuthenticationService.js';
import UnitService from '../../api/UnitService'


const entityname = i18n.t('static.procurementUnit.procurementUnit');
let initialValues = {
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
    unitsPerContainer: 0
}

const validationSchema = function (values) {
    return Yup.object().shape({
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
        unitsPerContainer: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
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
export default class EditProcurementUnit extends Component {
    constructor(props) {
        console.log("in constructor");
        super(props);
        this.state = {
            procurementUnit: {
                label: {
                    label_en: '',
                    label_sp: '',
                    label_pr: '',
                    label_fr: ''
                },
                planningUnit: {
                    planningUnitId: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    },
                },
                multiplier: '',
                unit: {
                    unitId: ''
                },
                supplier: {
                    supplierId: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    },
                },
                heightUnit: {
                    unitId: '',
                },
                heightQty: 0,
                lengthUnit: {
                    unitId: '',
                },
                lengthQty: 0,
                widthUnit: {
                    unitId: '',
                },
                widthQty: 0,
                weightUnit: {
                    unitId: '',
                },
                weightQty: 0,
                labeling: '',
                unitsPerContainer: 0
            },
            regionId: '',
            lang: localStorage.getItem('lang'),
            unitList: [],
            message: ''

        }

        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.Capitalize = this.Capitalize.bind(this);

    }

    Capitalize(str) {
        let { procurementUnit } = this.state
        procurementUnit.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        console.log("this.props.match.params.procurementUnitId", this.props.match.params.procurementUnitId)
        ProcurementUnitService.getProcurementUnitById(this.props.match.params.procurementUnitId).then(response => {
            this.setState({
                procurementUnit: response.data
            })
            initialValues = {
                procurementUnitName: getLabelText(this.state.procurementUnit.label, lang),
                planningUnitId: this.state.procurementUnit.planningUnit.planningUnitId,
                multiplier: this.state.procurementUnit.multiplier,
                unitId: this.state.procurementUnit.unit.unitId,
                supplierId: this.state.procurementUnit.supplier.supplierId,
                heightUnitId: this.state.procurementUnit.heightUnit.unitId,
                heightQty: this.state.procurementUnit.heightQty,
                lengthUnitId: this.state.procurementUnit.lengthUnit.unitId,
                lengthQty: this.state.procurementUnit.lengthQty,
                widthUnitId: this.state.procurementUnit.widthUnit.unitId,
                widthQty: this.state.procurementUnit.widthQty,
                weightUnitId: this.state.procurementUnit.weightUnit.unitId,
                weightQty: this.state.procurementUnit.weightQty,
                labeling: this.state.procurementUnit.labeling,
                unitsPerContainer: this.state.procurementUnit.unitsPerContainer
            }
            AuthenticationService.setupAxiosInterceptors();
            UnitService.getUnitListAll()
                .then(response => {
                    if (response.status == 200) {
                        this.setState({
                            unitList: response.data
                        })
                    } else {
                        this.setState({
                            message: response.data.messageCode
                        })
                    }
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

    dataChange(event) {
        let { procurementUnit } = this.state;
        if (event.target.name == "procurementUnitName") {
            procurementUnit.label.label_en = event.target.value;
        }
        if (event.target.name == "planningUnitId") {
            procurementUnit.planningUnit.planningUnitId = event.target.value;
        }
        if (event.target.name == "multiplier") {
            procurementUnit.multiplier = event.target.value;
        }
        if (event.target.name == "unitId") {
            procurementUnit.unit.unitId = event.target.value;
        }
        if (event.target.name == "supplierId") {
            procurementUnit.supplier.supplierId = event.target.value;
        }
        if (event.target.name == "heightUnitId") {
            procurementUnit.heightUnit.unitId = event.target.value;
        }
        if (event.target.name == "heightQty") {
            procurementUnit.heightQty = event.target.value;
        }
        if (event.target.name == "lengthUnitId") {
            procurementUnit.lengthUnit.unitId = event.target.value;
        }
        if (event.target.name == "lengthQty") {
            procurementUnit.lengthQty = event.target.value;
        }
        if (event.target.name == "widthUnitId") {
            procurementUnit.widthUnit.unitId = event.target.value;
        }
        if (event.target.name == "widthQty") {
            procurementUnit.widthQty = event.target.value;
        }
        if (event.target.name == "weightUnitId") {
            procurementUnit.weightUnit.unitId = event.target.value;
        }
        if (event.target.name == "weightQty") {
            procurementUnit.weightQty = event.target.value;
        }
        if (event.target.name == "labeling") {
            procurementUnit.labeling = event.target.value;
        }
        if (event.target.name == "unitsPerContainer") {
            procurementUnit.unitsPerContainer = event.target.value;
        } else if (event.target.name === "active") {
            procurementUnit.active = event.target.id === "active2" ? false : true
        }
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
            unitsPerContainer: true
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
        const { unitList } = this.state;
        let units = unitList.length > 0
            && unitList.map((item, i) => {
                return (
                    <option key={i} value={item.unitId}>
                        {getLabelText(item.label, this.state.lang)}
                    </option>
                )
            }, this);

        return (

            <div className="animated fadeIn">
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                enableReinitialize={true}
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    ProcurementUnitService.editProcurementUnit(this.state.procurementUnit).then(response => {
                                        if (response.status == 200) {
                                            this.props.history.push(`/procurementUnit/listProcurementUnit/` + i18n.t(response.data.messageCode, { entityname }))
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode
                                            })
                                        }

                                    }
                                    )
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
                                        )
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

                                            <Form onSubmit={handleSubmit} noValidate name='procurementUnitForm'>
                                                <CardHeader>
                                                    <strong>{i18n.t('static.common.editEntity', { entityname })}</strong>
                                                </CardHeader>
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="procurementUnit">{i18n.t('static.procurementUnit.procurementUnit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="text" name="procurementUnitName" valid={!errors.procurementUnitName}
                                                            bsSize="sm"
                                                            invalid={touched.procurementUnitName && !!errors.procurementUnitName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.label.label_en}
                                                            id="procurementUnitName" placeholder={i18n.t('static.procurementUnit.procurementUnitText')} />
                                                        <FormFeedback className="red">{errors.procurementUnitName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.planningUnit')}</Label>
                                                        <Input
                                                            value={getLabelText(this.state.procurementUnit.planningUnit.label, this.state.lang)}
                                                            bsSize="sm"
                                                            valid={!errors.planningUnitId}
                                                            invalid={touched.planningUnitId && !!errors.planningUnitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            disabled
                                                            type="text"
                                                            name="planningUnitId" id="planningUnitId">
                                                        </Input>
                                                        <FormFeedback>{errors.planningUnitId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="multiplier">{i18n.t('static.procurementUnit.multiplier')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="number" name="multiplier" valid={!errors.multiplier}
                                                            bsSize="sm"
                                                            invalid={touched.multiplier && !!errors.multiplier}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.multiplier}
                                                            id="multiplier" placeholder={i18n.t('static.procurementUnit.multiplierText')} />
                                                        <FormFeedback className="red">{errors.multiplier}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.unit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.unitId}
                                                            invalid={touched.unitId && !!errors.unitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.unit.unitId}
                                                            type="select" name="unitId" id="unitId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {units}
                                                        </Input>
                                                        <FormFeedback>{errors.unitId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.supplier')}</Label>
                                                        <Input
                                                            value={getLabelText(this.state.procurementUnit.supplier.label, this.state.lang)}
                                                            bsSize="sm"
                                                            valid={!errors.supplierId}
                                                            invalid={touched.supplierId && !!errors.supplierId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            onBlur={handleBlur}
                                                            disabled
                                                            type="text"
                                                            name="supplierId" id="supplierId">
                                                        </Input>
                                                        <FormFeedback>{errors.supplierId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.heightUnit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.heightUnitId}
                                                            invalid={touched.heightUnitId && !!errors.heightUnitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.heightUnit.unitId}
                                                            type="select" name="heightUnitId" id="heightUnitId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {units}
                                                        </Input>
                                                        <FormFeedback>{errors.heightUnitId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="heightQty">{i18n.t('static.procurementUnit.heightQty')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="number" name="heightQty" valid={!errors.heightQty}
                                                            bsSize="sm"
                                                            invalid={touched.heightQty && !!errors.heightQty}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.heightQty}
                                                            id="heightQty" placeholder={i18n.t('static.procurementUnit.heightQtyText')} />
                                                        <FormFeedback className="red">{errors.heightQty}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.lengthUnit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.lengthUnitId}
                                                            invalid={touched.lengthUnitId && !!errors.lengthUnitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.lengthUnit.unitId}
                                                            type="select" name="lengthUnitId" id="lengthUnitId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {units}
                                                        </Input>
                                                        <FormFeedback>{errors.lengthUnitId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="lengthQty">{i18n.t('static.procurementUnit.lengthQty')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="number" name="lengthQty" valid={!errors.lengthQty}
                                                            bsSize="sm"
                                                            invalid={touched.lengthQty && !!errors.lengthQty}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.lengthQty}
                                                            id="lengthQty" placeholder={i18n.t('static.procurementUnit.lengthQtyText')} />
                                                        <FormFeedback className="red">{errors.lengthQty}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.widthUnit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.widthUnitId}
                                                            invalid={touched.widthUnitId && !!errors.widthUnitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.widthUnit.unitId}
                                                            type="select" name="widthUnitId" id="widthUnitId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {units}
                                                        </Input>
                                                        <FormFeedback>{errors.widthUnitId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="widthQty">{i18n.t('static.procurementUnit.widthQty')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="number" name="widthQty" valid={!errors.widthQty}
                                                            bsSize="sm"
                                                            invalid={touched.widthQty && !!errors.widthQty}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.widthQty}
                                                            id="widthQty" placeholder={i18n.t('static.procurementUnit.widthQtyText')} />
                                                        <FormFeedback className="red">{errors.widthQty}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.weightUnit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.weightUnitId}
                                                            invalid={touched.weightUnitId && !!errors.weightUnitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.weightUnit.unitId}
                                                            type="select" name="weightUnitId" id="weightUnitId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {units}
                                                        </Input>
                                                        <FormFeedback>{errors.weightUnitId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="weightQty">{i18n.t('static.procurementUnit.weightQty')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="number" name="weightQty" valid={!errors.weightQty}
                                                            bsSize="sm"
                                                            invalid={touched.weightQty && !!errors.weightQty}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.weightQty}
                                                            id="weightQty" placeholder={i18n.t('static.procurementUnit.weightQtyText')} />
                                                        <FormFeedback className="red">{errors.weightQty}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="labeling">{i18n.t('static.procurementUnit.labeling')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="text" name="labeling" valid={!errors.labeling}
                                                            bsSize="sm"
                                                            invalid={touched.labeling && !!errors.labeling}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.labeling}
                                                            id="labeling" placeholder={i18n.t('static.procurementUnit.labelingText')} />
                                                        <FormFeedback className="red">{errors.labeling}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="unitsPerContainer">{i18n.t('static.procurementUnit.unitsPerContainer')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="number" name="unitsPerContainer" valid={!errors.unitsPerContainer}
                                                            bsSize="sm"
                                                            invalid={touched.unitsPerContainer && !!errors.unitsPerContainer}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.unitsPerContainer}
                                                            id="unitsPerContainer" placeholder={i18n.t('static.procurementUnit.unitsPerContainerText')} />
                                                        <FormFeedback className="red">{errors.unitsPerContainer}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>

                                                        <Label className="P-absltRadio">{i18n.t('static.common.status')}&nbsp;&nbsp;</Label>

                                                        <FormGroup check inline>
                                                            <Input
                                                                className="form-check-input"
                                                                type="radio"
                                                                id="active1"
                                                                name="active"
                                                                value={true}
                                                                checked={this.state.procurementUnit.active === true}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-active1">
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
                                                                checked={this.state.procurementUnit.active === false}
                                                                onChange={(e) => { handleChange(e); this.dataChange(e) }}
                                                            />
                                                            <Label
                                                                className="form-check-label"
                                                                check htmlFor="inline-active2">
                                                                {i18n.t('static.common.disabled')}
                                                            </Label>
                                                        </FormGroup>
                                                    </FormGroup>

                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>Update</Button>
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
        this.props.history.push(`/procurementUnit/listProcurementUnit/` + i18n.t('static.message.cancelled', { entityname }))
    }

}