import { Formik } from 'formik';
import React, { Component } from "react";
import 'react-select/dist/react-select.min.css';
import {
    Button,
    Card, CardBody,
    CardFooter,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Row
} from 'reactstrap';
import * as Yup from 'yup';
import getLabelText from '../../CommonComponent/getLabelText';
import { API_URL } from "../../Constants";
import DropdownService from "../../api/DropdownService";
import ProcurementUnitService from "../../api/ProcurementUnitService";
import SupplierService from "../../api/SupplierService";
import UnitService from "../../api/UnitService";
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import { Capitalize, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
// Localized entity name
const entityname = i18n.t('static.procurementUnit.procurementUnit');
/**
 * Defines the validation schema for procurement unit details.
 * @param {Object} values - Form values.
 * @returns {Yup.ObjectSchema} - Validation schema.
 */
const validationSchema = function (values) {
    return Yup.object().shape({
        procurementUnitName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.procurementUnit.validProcurementUnitText')),
        planningUnitId: Yup.string()
            .required(i18n.t('static.procurementUnit.validPlanningUnitText')),
        multiplier: Yup.string()
            .matches(/^\d{1,10}(\.\d{1,2})?$/, i18n.t('static.planningUnit.conversionFactor'))
            .required(i18n.t('static.procurementUnit.validMultiplierText'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        unitId: Yup.string()
            .required(i18n.t('static.procurementUnit.validUnitIdText')),
        supplierId: Yup.string()
            .required(i18n.t('static.procurementUnit.validSupplierIdText')),
        heightQty: Yup.string()
            .matches(/^\d+(\.\d{1,6})?$/, i18n.t('static.currency.conversionrateNumberDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        lengthQty: Yup.string()
            .matches(/^\d+(\.\d{1,6})?$/, i18n.t('static.currency.conversionrateNumberDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        widthQty: Yup.string()
            .matches(/^\d+(\.\d{1,6})?$/, i18n.t('static.currency.conversionrateNumberDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        weightQty: Yup.string()
            .matches(/^\d+(\.\d{1,6})?$/, i18n.t('static.currency.conversionrateNumberDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        volumeQty: Yup.string()
            .matches(/^\d+(\.\d{1,6})?$/, i18n.t('static.currency.conversionrateNumberDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        unitsPerCase: Yup.string()
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        unitsPerPalletEuro1: Yup.string()
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        unitsPerPalletEuro2: Yup.string()
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        unitsPerContainer: Yup.string()
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
    })
}
/**
 * Component for adding procurement unit details.
 */
export default class AddProcurementUnit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
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
                    id: ''
                },
                supplier: {
                    id: ''
                },
                heightQty: 0,
                lengthUnit: {
                    id: '',
                },
                lengthQty: 0,
                widthQty: 0,
                weightUnit: {
                    id: '',
                },
                weightQty: 0,
                volumeUnit: {
                    id: '',
                },
                volumeQty: 0,
                labeling: '',
                unitsPerCase: 0,
                unitsPerPalletEuro1: 0,
                unitsPerPalletEuro2: 0,
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
        this.resetClicked = this.resetClicked.bind(this);
        this.changePlanningUnit = this.changePlanningUnit.bind(this);
    }
    /**
     * Handles data change in planning unit.
     */
    changePlanningUnit() {
        let planningUnitId = document.getElementById("planningUnitId").value;
        if (planningUnitId != '') {
            let planningUnitText = document.getElementById("planningUnitId")
            var selectedText = planningUnitText.options[planningUnitText.selectedIndex].text;
            let { procurementUnit } = this.state;
            procurementUnit.label.label_en = selectedText;
            this.setState({ procurementUnit }, () => { })
        } else {
            var selectedText = '';
            let { procurementUnit } = this.state;
            procurementUnit.label.label_en = selectedText;
            this.setState({ procurementUnit }, () => { })
        }
    }
    /**
     * Reterives planning unit, unit and supplier list on component mount
     */
    componentDidMount() {
        DropdownService.getPlanningUnitDropDownList()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        planningUnitList: listArray, loading: false
                    })
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
                        unitList: listArray, loading: false
                    })
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
        SupplierService.getSupplierListAll()
            .then(response => {
                if (response.status == 200) {
                    var listArray = response.data;
                    listArray.sort((a, b) => {
                        var itemLabelA = getLabelText(a.label, this.state.lang).toUpperCase();
                        var itemLabelB = getLabelText(b.label, this.state.lang).toUpperCase();
                        return itemLabelA > itemLabelB ? 1 : -1;
                    });
                    this.setState({
                        supplierList: listArray, loading: false
                    })
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
     * Handles data change in the form.
     * @param {Event} event - The change event.
     */
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
            procurementUnit.unit.id = event.target.value;
        }
        if (event.target.name == "supplierId") {
            procurementUnit.supplier.id = event.target.value;
        }
        if (event.target.name == "heightQty") {
            procurementUnit.heightQty = event.target.value;
        }
        if (event.target.name == "lengthUnitId") {
            procurementUnit.lengthUnit.id = event.target.value;
        }
        if (event.target.name == "lengthQty") {
            procurementUnit.lengthQty = event.target.value;
        }
        if (event.target.name == "widthQty") {
            procurementUnit.widthQty = event.target.value;
        }
        if (event.target.name == "weightUnitId") {
            procurementUnit.weightUnit.id = event.target.value;
        }
        if (event.target.name == "weightQty") {
            procurementUnit.weightQty = event.target.value;
        }
        if (event.target.name == "volumeUnitId") {
            procurementUnit.volumeUnit.id = event.target.value;
        }
        if (event.target.name == "volumeQty") {
            procurementUnit.volumeQty = event.target.value;
        }
        if (event.target.name == "labeling") {
            procurementUnit.labeling = event.target.value;
        }
        if (event.target.name == "unitsPerCase") {
            procurementUnit.unitsPerCase = event.target.value;
        }
        if (event.target.name == "unitsPerPalletEuro1") {
            procurementUnit.unitsPerPalletEuro1 = event.target.value;
        }
        if (event.target.name == "unitsPerPalletEuro2") {
            procurementUnit.unitsPerPalletEuro2 = event.target.value;
        }
        if (event.target.name == "unitsPerContainer") {
            procurementUnit.unitsPerContainer = event.target.value;
        }
        this.setState({ procurementUnit }, () => { })
    }
    /**
     * Renders the procurement unit details form.
     * @returns {JSX.Element} - Procurement unit details form.
     */
    render() {
        const { planningUnitList } = this.state;
        let planningUnits = planningUnitList.length > 0
            && planningUnitList.map((item, i) => {
                return (
                    <option key={i} value={item.id}>
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
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="red" id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    procurementUnitName: this.state.procurementUnit.label.label_en,
                                    planningUnitId: this.state.procurementUnit.planningUnit.planningUnitId,
                                    multiplier: this.state.procurementUnit.multiplier,
                                    unitId: this.state.procurementUnit.unit.id,
                                    supplierId: this.state.procurementUnit.supplier.id,
                                    heightQty: this.state.procurementUnit.heightQty,
                                    lengthUnitId: this.state.procurementUnit.lengthUnit.id,
                                    lengthQty: this.state.procurementUnit.lengthQty,
                                    widthQty: this.state.procurementUnit.widthQty,
                                    weightUnitId: this.state.procurementUnit.weightUnit.id,
                                    weightQty: this.state.procurementUnit.weightQty,
                                    volumeUnitId: this.state.procurementUnit.volumeUnit.id,
                                    volumeQty: this.state.procurementUnit.volumeQty,
                                    labeling: this.state.procurementUnit.labeling,
                                    unitsPerCase: this.state.procurementUnit.unitsPerCase,
                                    unitsPerPalletEuro1: this.state.procurementUnit.unitsPerPalletEuro1,
                                    unitsPerPalletEuro2: this.state.procurementUnit.unitsPerPalletEuro2,
                                    unitsPerContainer: this.state.procurementUnit.unitsPerContainer
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    ProcurementUnitService.addProcurementUnit(this.state.procurementUnit).then(response => {
                                        if (response.status == "200") {
                                            this.props.history.push(`/procurementUnit/listProcurementUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode, loading: false
                                            },
                                                () => {
                                                    hideSecondComponent();
                                                })
                                        }
                                    }
                                    ).catch(
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
                                                        this.setState({
                                                            message: error.response.data.messageCode,
                                                            loading: false
                                                        });
                                                        break;
                                                    case 406:
                                                        this.setState({
                                                            message: i18n.t('static.procurementAgentProcurementUnit.procurementUnitAlreadyExists'),
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
                                        <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='procurementUnitForm' autocomplete="off">
                                            <CardBody style={{ display: this.state.loading ? "none" : "block" }}>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.procurementUnit.planningUnit')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        bsSize="sm"
                                                        valid={!errors.planningUnitId && this.state.procurementUnit.planningUnit.planningUnitId != ''}
                                                        invalid={(touched.planningUnitId && !!errors.planningUnitId) || (touched.planningUnitId && this.state.procurementUnit.planningUnit.planningUnitId == '')}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); this.changePlanningUnit(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementUnit.planningUnit.planningUnitId}
                                                        type="select" name="planningUnitId" id="planningUnitId">
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {planningUnits}
                                                    </Input>
                                                    <FormFeedback>{errors.planningUnitId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="procurementUnit">{i18n.t('static.procurementUnit.procurementUnit')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="text" name="procurementUnitName"
                                                        bsSize="sm"
                                                        valid={!errors.procurementUnitName && this.state.procurementUnit.label.label_en != ''}
                                                        invalid={(touched.procurementUnitName && !!errors.procurementUnitName) || (touched.procurementUnitName && this.state.procurementUnit.label.label_en == '')}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); Capitalize(e.target.value) }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementUnit.label.label_en}
                                                        id="procurementUnitName" />
                                                    <FormFeedback className="red">{errors.procurementUnitName}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="multiplier">{i18n.t('static.procurementUnit.multiplier')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        type="number" name="multiplier"
                                                        bsSize="sm"
                                                        valid={!errors.multiplier && this.state.procurementUnit.multiplier != ''}
                                                        invalid={(touched.multiplier && !!errors.multiplier) || (touched.multiplier && this.state.procurementUnit.multiplier == '')}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        pattern="[1-9]{1}[0-9]{9}"
                                                        value={this.state.procurementUnit.multiplier}
                                                        id="multiplier" />
                                                    <FormFeedback className="red">{errors.multiplier}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.procurementUnit.unit')}<span class="red Reqasterisk">*</span></Label>
                                                    <Input
                                                        bsSize="sm"
                                                        valid={!errors.unitId && this.state.procurementUnit.unit.id != ''}
                                                        invalid={(touched.unitId && !!errors.unitId) || (touched.unitId && this.state.procurementUnit.unit.id == '')}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementUnit.unit.id}
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
                                                        valid={!errors.supplierId && this.state.procurementUnit.supplier.id != ''}
                                                        invalid={(touched.supplierId && !!errors.supplierId) || (touched.supplierId && this.state.procurementUnit.supplier.id == '')}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementUnit.supplier.id}
                                                        type="select" name="supplierId" id="supplierId">
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {suppliers}
                                                    </Input>
                                                    <FormFeedback>{errors.supplierId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="select">{i18n.t('static.procurementUnit.lengthUnit')}</Label>
                                                    <Input
                                                        bsSize="sm"
                                                        valid={!errors.lengthUnitId && this.state.procurementUnit.lengthUnit.id != ''}
                                                        invalid={touched.lengthUnitId && !!errors.lengthUnitId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementUnit.lengthUnit.id}
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
                                                    <Label htmlFor="select">{i18n.t('static.procurementUnit.weightUnit')}</Label>
                                                    <Input
                                                        bsSize="sm"
                                                        valid={!errors.weightUnitId && this.state.procurementUnit.weightUnit.id != ''}
                                                        invalid={touched.weightUnitId && !!errors.weightUnitId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementUnit.weightUnit.id}
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
                                                    <Label htmlFor="select">{i18n.t('static.procurementUnit.volumeUnit')}</Label>
                                                    <Input
                                                        bsSize="sm"
                                                        valid={!errors.volumeUnitId && this.state.procurementUnit.volumeUnit.id != ''}
                                                        invalid={touched.volumeUnitId && !!errors.volumeUnitId}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementUnit.volumeUnit.id}
                                                        type="select" name="volumeUnitId" id="volumeUnitId">
                                                        <option value="">{i18n.t('static.common.select')}</option>
                                                        {units}
                                                    </Input>
                                                    <FormFeedback>{errors.volumeUnitId}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="volumeQty">{i18n.t('static.procurementUnit.volumeQty')}</Label>
                                                    <Input
                                                        type="number" name="volumeQty" valid={!errors.volumeQty && this.state.procurementUnit.volumeQty != '' && this.state.procurementUnit.volumeQty != '0'}
                                                        bsSize="sm"
                                                        invalid={touched.volumeQty && !!errors.volumeQty}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementUnit.volumeQty}
                                                        id="volumeQty" />
                                                    <FormFeedback className="red">{errors.volumeQty}</FormFeedback>
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
                                                    <Label htmlFor="unitsPerPalletEuro1">{i18n.t('static.procurementUnit.unitsPerPalletEuro1')}</Label>
                                                    <Input
                                                        type="number" name="unitsPerPalletEuro1" valid={!errors.unitsPerPalletEuro1 && this.state.procurementUnit.unitsPerPalletEuro1 != ''}
                                                        bsSize="sm"
                                                        invalid={touched.unitsPerPalletEuro1 && !!errors.unitsPerPalletEuro1}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementUnit.unitsPerPalletEuro1}
                                                        id="unitsPerPalletEuro1" />
                                                    <FormFeedback className="red">{errors.unitsPerPalletEuro1}</FormFeedback>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label htmlFor="unitsPerPalletEuro2">{i18n.t('static.procurementUnit.unitsPerPalletEuro2')}</Label>
                                                    <Input
                                                        type="number" name="unitsPerPalletEuro2" valid={!errors.unitsPerPalletEuro2 && this.state.procurementUnit.unitsPerPalletEuro2 != ''}
                                                        bsSize="sm"
                                                        invalid={touched.unitsPerPalletEuro2 && !!errors.unitsPerPalletEuro2}
                                                        onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                        onBlur={handleBlur}
                                                        value={this.state.procurementUnit.unitsPerPalletEuro2}
                                                        id="unitsPerPalletEuro2" />
                                                    <FormFeedback className="red">{errors.unitsPerPalletEuro2}</FormFeedback>
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
                                                    <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                    <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                    <Button type="submit" size="md" color="success" className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')} </Button>
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
    /**
     * Redirects to the list procurement unit screen when cancel button is clicked.
     */
    cancelClicked() {
        this.props.history.push(`/procurementUnit/listProcurementUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    /**
     * Resets the procurement unit details when reset button is clicked.
     */
    resetClicked() {
        let { procurementUnit } = this.state;
        procurementUnit.label.label_en = ''
        procurementUnit.planningUnit.planningUnitId = ''
        procurementUnit.multiplier = ''
        procurementUnit.unit.id = ''
        procurementUnit.supplier.id = ''
        procurementUnit.heightQty = ''
        procurementUnit.lengthUnit.id = ''
        procurementUnit.lengthQty = ''
        procurementUnit.widthQty = ''
        procurementUnit.weightUnit.id = ''
        procurementUnit.weightQty = ''
        procurementUnit.volumeUnit.id = ''
        procurementUnit.volumeQty = ''
        procurementUnit.labeling = ''
        procurementUnit.unitsPerCase = ''
        procurementUnit.unitsPerPalletEuro1 = ''
        procurementUnit.unitsPerPalletEuro2 = ''
        procurementUnit.unitsPerContainer = ''
        this.setState({ procurementUnit }, () => { })
    }
}