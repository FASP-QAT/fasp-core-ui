import React, { Component } from "react";
import {
    Row, Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Col, FormFeedback, Form, InputGroupAddon, InputGroupText, FormText
} from 'reactstrap';
import Select from 'react-select';
import { Formik } from 'formik';
import * as Yup from 'yup';
import '../Forms/ValidationForms/ValidationForms.css';
import 'react-select/dist/react-select.min.css';
import getLabelText from '../../CommonComponent/getLabelText'
import AuthenticationService from '../Common/AuthenticationService.js';
import i18n from '../../i18n';
import PlanningUnitService from "../../api/PlanningUnitService";
import UnitService from "../../api/UnitService";
import SupplierService from "../../api/SupplierService"
import ProcurementUnitService from "../../api/ProcurementUnitService";

const entityname = i18n.t('static.procurementUnit.procurementUnit');
const initialValues = {
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

export default class AddProcurementUnit extends Component {

    constructor(props) {
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
                    planningUnitId: ''
                },
                multiplier: '',
                unit: {
                    unitId: ''
                },
                supplier: {
                    supplierId: ''
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
            lang: localStorage.getItem('lang'),
            message: '',
            planningUnitList: [],
            unitList: [],
            supplierList: []

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
        PlanningUnitService.getActivePlanningUnitList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        planningUnitList: response.data
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );
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
                                console.log("Error code unkown");
                                break;
                        }
                    }
                }
            );
        AuthenticationService.setupAxiosInterceptors();
        SupplierService.getSupplierListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        supplierList: response.data
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
            <div className="animated fadeIn">
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    AuthenticationService.setupAxiosInterceptors();
                                    ProcurementUnitService.addProcurementUnit(this.state.procurementUnit).then(response => {
                                        if (response.status == "200") {
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
                                                    <strong>{i18n.t('static.procurementUnit.procurementUnit')}</strong>
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
                                                            bsSize="sm"
                                                            valid={!errors.planningUnitId}
                                                            invalid={touched.planningUnitId && !!errors.planningUnitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            type="select" name="planningUnitId" id="planningUnitId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {planningUnits}
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
                                                            type="select" name="unitId" id="unitId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {units}
                                                        </Input>
                                                        <FormFeedback>{errors.unitId}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.supplier')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.supplierId}
                                                            invalid={touched.supplierId && !!errors.supplierId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            type="select" name="supplierId" id="supplierId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {suppliers}
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
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.weightUnit')}</Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.weightUnitId}
                                                            invalid={touched.weightUnitId && !!errors.weightUnitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
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
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')} </Button>
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