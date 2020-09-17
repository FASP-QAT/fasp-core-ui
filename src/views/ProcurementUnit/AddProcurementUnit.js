// import React, { Component } from "react";
// import {
//     Row, Card, CardBody, CardHeader,
//     Label, Input, FormGroup,
//     CardFooter, Button, Col, FormFeedback, Form, InputGroupAddon, InputGroupText, FormText
// } from 'reactstrap';
// import Select from 'react-select';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
// import '../Forms/ValidationForms/ValidationForms.css';
// import 'react-select/dist/react-select.min.css';
// import getLabelText from '../../CommonComponent/getLabelText'
// import AuthenticationService from '../Common/AuthenticationService.js';
// import i18n from '../../i18n';
// import PlanningUnitService from "../../api/PlanningUnitService";
// import UnitService from "../../api/UnitService";
// import SupplierService from "../../api/SupplierService"
// import ProcurementUnitService from "../../api/ProcurementUnitService";
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'

// const entityname = i18n.t('static.procurementUnit.procurementUnit');
// const initialValues = {
//     procurementUnitName: '',
//     planningUnitId: '',
//     multiplier: '',
//     unitId: '',
//     supplierId: '',
//     heightUnitId: '',
//     heightQty: 0,
//     lengthUnitId: '',
//     lengthQty: 0,
//     widthUnitId: '',
//     widthQty: 0,
//     weightUnitId: '',
//     weightQty: 0,
//     labeling: '',
//     unitsPerContainer: 0,
//     unitsPerCase: 0,
//     unitsPerPallet: 0
// }

// const validationSchema = function (values) {
//     return Yup.object().shape({
//         procurementUnitName: Yup.string()
//             .required(i18n.t('static.procurementUnit.validProcurementUnitText')),
//         planningUnitId: Yup.string()
//             .required(i18n.t('static.procurementUnit.validPlanningUnitText')),
//         multiplier: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .required(i18n.t('static.procurementUnit.validMultiplierText')).min(0, i18n.t('static.procurementUnit.validValueText')),
//         unitId: Yup.string()
//             .required(i18n.t('static.procurementUnit.validUnitIdText')),
//         supplierId: Yup.string()
//             .required(i18n.t('static.procurementUnit.validSupplierIdText')),
//         heightQty: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .min(0, i18n.t('static.procurementUnit.validValueText')),
//         lengthQty: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .min(0, i18n.t('static.procurementUnit.validValueText')),
//         widthQty: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .min(0, i18n.t('static.procurementUnit.validValueText')),
//         weightQty: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .min(0, i18n.t('static.procurementUnit.validValueText')),
//         unitsPerCase: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .min(0, i18n.t('static.procurementUnit.validValueText')),
//         unitsPerPallet: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .min(0, i18n.t('static.procurementUnit.validValueText')),
//         unitsPerContainer: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .min(0, i18n.t('static.procurementUnit.validValueText')),
//     })
// }

// const validate = (getValidationSchema) => {
//     return (values) => {
//         const validationSchema = getValidationSchema(values)
//         try {
//             validationSchema.validateSync(values, { abortEarly: false })
//             return {}
//         } catch (error) {
//             return getErrorsFromValidationError(error)
//         }
//     }
// }

// const getErrorsFromValidationError = (validationError) => {
//     const FIRST_ERROR = 0
//     return validationError.inner.reduce((errors, error) => {
//         return {
//             ...errors,
//             [error.path]: error.errors[FIRST_ERROR],
//         }
//     }, {})
// }

// export default class AddProcurementUnit extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             procurementUnit: {
//                 label: {
//                     label_en: '',
//                     label_sp: '',
//                     label_pr: '',
//                     label_fr: ''
//                 },
//                 planningUnit: {
//                     planningUnitId: ''
//                 },
//                 multiplier: '',
//                 unit: {
//                     id: ''
//                 },
//                 supplier: {
//                     id: ''
//                 },
//                 heightUnit: {
//                     id: '',
//                 },
//                 heightQty: 0,
//                 lengthUnit: {
//                     id: '',
//                 },
//                 lengthQty: 0,
//                 widthUnit: {
//                     id: '',
//                 },
//                 widthQty: 0,
//                 weightUnit: {
//                     id: '',
//                 },
//                 weightQty: 0,
//                 labeling: '',
//                 unitsPerCase: 0,
//                 unitsPerPallet: 0,
//                 unitsPerContainer: 0
//             },
//             lang: localStorage.getItem('lang'),
//             message: '',
//             planningUnitList: [],
//             unitList: [],
//             supplierList: []

//         }
//         this.dataChange = this.dataChange.bind(this);
//         this.cancelClicked = this.cancelClicked.bind(this);
//         this.Capitalize = this.Capitalize.bind(this);
//         this.resetClicked = this.resetClicked.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
//     }
//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }
//     Capitalize(str) {
//         let { procurementUnit } = this.state
//         procurementUnit.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
//     }

//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         PlanningUnitService.getActivePlanningUnitList()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         planningUnitList: response.data
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }
//             })

//         AuthenticationService.setupAxiosInterceptors();
//         UnitService.getUnitListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         unitList: response.data
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }
//             })

//         AuthenticationService.setupAxiosInterceptors();
//         SupplierService.getSupplierListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     this.setState({
//                         supplierList: response.data
//                     })
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }
//             })

//     }

//     dataChange(event) {
//         let { procurementUnit } = this.state;
//         if (event.target.name == "procurementUnitName") {
//             procurementUnit.label.label_en = event.target.value;
//         }
//         if (event.target.name == "planningUnitId") {
//             procurementUnit.planningUnit.planningUnitId = event.target.value;
//         }
//         if (event.target.name == "multiplier") {
//             procurementUnit.multiplier = event.target.value;
//         }
//         if (event.target.name == "unitId") {
//             procurementUnit.unit.id = event.target.value;
//         }
//         if (event.target.name == "supplierId") {
//             procurementUnit.supplier.id = event.target.value;
//         }
//         if (event.target.name == "heightUnitId") {
//             procurementUnit.heightUnit.id = event.target.value;
//         }
//         if (event.target.name == "heightQty") {
//             procurementUnit.heightQty = event.target.value;
//         }
//         if (event.target.name == "lengthUnitId") {
//             procurementUnit.lengthUnit.id = event.target.value;
//         }
//         if (event.target.name == "lengthQty") {
//             procurementUnit.lengthQty = event.target.value;
//         }
//         if (event.target.name == "widthUnitId") {
//             procurementUnit.widthUnit.id = event.target.value;
//         }
//         if (event.target.name == "widthQty") {
//             procurementUnit.widthQty = event.target.value;
//         }
//         if (event.target.name == "weightUnitId") {
//             procurementUnit.weightUnit.id = event.target.value;
//         }
//         if (event.target.name == "weightQty") {
//             procurementUnit.weightQty = event.target.value;
//         }
//         if (event.target.name == "labeling") {
//             procurementUnit.labeling = event.target.value;
//         }
//         if (event.target.name == "unitsPerCase") {
//             procurementUnit.unitsPerCase = event.target.value;
//         }
//         if (event.target.name == "unitsPerPallet") {
//             procurementUnit.unitsPerPallet = event.target.value;
//         }
//         if (event.target.name == "unitsPerContainer") {
//             procurementUnit.unitsPerContainer = event.target.value;
//         }
//         this.setState({ procurementUnit }, () => { })

//     }
//     touchAll(setTouched, errors) {
//         setTouched({
//             procurementUnitName: true,
//             planningUnitId: true,
//             multiplier: true,
//             unitId: true,
//             supplierId: true,
//             heightUnitId: true,
//             heightQty: true,
//             lengthUnitId: true,
//             lengthQty: true,
//             widthUnitId: true,
//             widthQty: true,
//             weightUnitId: true,
//             weightQty: true,
//             labeling: true,
//             unitsPerCase: true,
//             unitsPerPallet: true,
//             unitsPerContainer: true
//         }
//         )
//         this.validateForm(errors)
//     }
//     validateForm(errors) {
//         this.findFirstError('procurementUnitForm', (fieldName) => {
//             return Boolean(errors[fieldName])
//         })
//     }
//     findFirstError(formName, hasError) {
//         const form = document.forms[formName]
//         for (let i = 0; i < form.length; i++) {
//             if (hasError(form[i].name)) {
//                 form[i].focus()
//                 break
//             }
//         }
//     }

//     render() {
//         const { planningUnitList } = this.state;
//         let planningUnits = planningUnitList.length > 0
//             && planningUnitList.map((item, i) => {
//                 return (
//                     <option key={i} value={item.planningUnitId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const { unitList } = this.state;
//         let units = unitList.length > 0
//             && unitList.map((item, i) => {
//                 return (
//                     <option key={i} value={item.unitId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         const { supplierList } = this.state;
//         let suppliers = supplierList.length > 0
//             && supplierList.map((item, i) => {
//                 return (
//                     <option key={i} value={item.supplierId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);
//         return (
//             <div className="animated fadeIn">
//                 <AuthenticationServiceComponent history={this.props.history} message={(message) => {
//                     this.setState({ message: message })
//                 }} />
//                 <h5>{i18n.t(this.state.message, { entityname })}</h5>
//                 <Row>
//                     <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
//                         <Card>
//                             <Formik
//                                 initialValues={initialValues}
//                                 validate={validate(validationSchema)}
//                                 onSubmit={(values, { setSubmitting, setErrors }) => {
//                                     AuthenticationService.setupAxiosInterceptors();
//                                     ProcurementUnitService.addProcurementUnit(this.state.procurementUnit).then(response => {
//                                         if (response.status == "200") {
//                                             this.props.history.push(`/procurementUnit/listProcurementUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
//                                         } else {
//                                             this.setState({
//                                                 message: response.data.messageCode
//                                             },
//                                                 () => {
//                                                     this.hideSecondComponent();
//                                                 })
//                                         }
//                                     }
//                                     )
//                                 }}
//                                 render={
//                                     ({
//                                         values,
//                                         errors,
//                                         touched,
//                                         handleChange,
//                                         handleBlur,
//                                         handleSubmit,
//                                         isSubmitting,
//                                         isValid,
//                                         setTouched,
//                                         handleReset
//                                     }) => (

//                                             <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='procurementUnitForm'>
//                                                 {/* <CardHeader>
//                                                     <strong>{i18n.t('static.procurementUnit.procurementUnit')}</strong>
//                                                 </CardHeader> */}
//                                                 <CardBody>
//                                                     <FormGroup>
//                                                         <Label htmlFor="procurementUnit">{i18n.t('static.procurementUnit.procurementUnit')}<span class="red Reqasterisk">*</span></Label>
//                                                         <Input
//                                                             type="text" name="procurementUnitName" valid={!errors.procurementUnitName && this.state.procurementUnit.label.label_en != ''}
//                                                             bsSize="sm"
//                                                             invalid={touched.procurementUnitName && !!errors.procurementUnitName}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.label.label_en}
//                                                             id="procurementUnitName" />
//                                                         <FormFeedback className="red">{errors.procurementUnitName}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="select">{i18n.t('static.procurementUnit.planningUnit')}</Label>
//                                                         <Input
//                                                             bsSize="sm"
//                                                             valid={!errors.planningUnitId && this.state.procurementUnit.planningUnit.planningUnitId != ''}
//                                                             invalid={touched.planningUnitId && !!errors.planningUnitId}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.planningUnit.planningUnitId}
//                                                             type="select" name="planningUnitId" id="planningUnitId">
//                                                             <option value="">{i18n.t('static.common.select')}</option>
//                                                             {planningUnits}
//                                                         </Input>
//                                                         <FormFeedback>{errors.planningUnitId}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="multiplier">{i18n.t('static.procurementUnit.multiplier')}<span class="red Reqasterisk">*</span></Label>
//                                                         <Input
//                                                             type="number" name="multiplier" valid={!errors.multiplier && this.state.procurementUnit.multiplier != ''}
//                                                             bsSize="sm"
//                                                             invalid={touched.multiplier && !!errors.multiplier}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.multiplier}
//                                                             id="multiplier" />
//                                                         <FormFeedback className="red">{errors.multiplier}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="select">{i18n.t('static.procurementUnit.unit')}<span class="red Reqasterisk">*</span></Label>
//                                                         <Input
//                                                             bsSize="sm"
//                                                             valid={!errors.unitId && this.state.procurementUnit.unit.id != ''}
//                                                             invalid={touched.unitId && !!errors.unitId}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.unit.id}
//                                                             type="select" name="unitId" id="unitId">
//                                                             <option value="">{i18n.t('static.common.select')}</option>
//                                                             {units}
//                                                         </Input>
//                                                         <FormFeedback>{errors.unitId}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="select">{i18n.t('static.procurementUnit.supplier')}<span class="red Reqasterisk">*</span></Label>
//                                                         <Input
//                                                             bsSize="sm"
//                                                             valid={!errors.supplierId && this.state.procurementUnit.supplier.id != ''}
//                                                             invalid={touched.supplierId && !!errors.supplierId}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.supplier.id}
//                                                             type="select" name="supplierId" id="supplierId">
//                                                             <option value="">{i18n.t('static.common.select')}</option>
//                                                             {suppliers}
//                                                         </Input>
//                                                         <FormFeedback>{errors.supplierId}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="select">{i18n.t('static.procurementUnit.heightUnit')}</Label>
//                                                         <Input
//                                                             bsSize="sm"
//                                                             valid={!errors.heightUnitId && this.state.procurementUnit.heightUnit.id != ''}
//                                                             invalid={touched.heightUnitId && !!errors.heightUnitId}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.heightUnit.id}
//                                                             type="select" name="heightUnitId" id="heightUnitId">
//                                                             <option value="">{i18n.t('static.common.select')}</option>
//                                                             {units}
//                                                         </Input>
//                                                         <FormFeedback>{errors.heightUnitId}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="heightQty">{i18n.t('static.procurementUnit.heightQty')}</Label>
//                                                         <Input
//                                                             type="number" name="heightQty" valid={!errors.heightQty && this.state.procurementUnit.heightQty != '' && this.state.procurementUnit.heightQty != '0'}
//                                                             bsSize="sm"
//                                                             invalid={touched.heightQty && !!errors.heightQty}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.heightQty}
//                                                             id="heightQty" />
//                                                         <FormFeedback className="red">{errors.heightQty}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="select">{i18n.t('static.procurementUnit.lengthUnit')}</Label>
//                                                         <Input
//                                                             bsSize="sm"
//                                                             valid={!errors.lengthUnitId && this.state.procurementUnit.lengthUnit.id != ''}
//                                                             invalid={touched.lengthUnitId && !!errors.lengthUnitId}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.lengthUnit.id}
//                                                             type="select" name="lengthUnitId" id="lengthUnitId">
//                                                             <option value="">{i18n.t('static.common.select')}</option>
//                                                             {units}
//                                                         </Input>
//                                                         <FormFeedback>{errors.lengthUnitId}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="lengthQty">{i18n.t('static.procurementUnit.lengthQty')}</Label>
//                                                         <Input
//                                                             type="number" name="lengthQty" valid={!errors.lengthQty && this.state.procurementUnit.lengthQty != '' && this.state.procurementUnit.lengthQty != '0'}
//                                                             bsSize="sm"
//                                                             invalid={touched.lengthQty && !!errors.lengthQty}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.lengthQty}
//                                                             id="lengthQty" />
//                                                         <FormFeedback className="red">{errors.lengthQty}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="select">{i18n.t('static.procurementUnit.widthUnit')}</Label>
//                                                         <Input
//                                                             bsSize="sm"
//                                                             valid={!errors.widthUnitId && this.state.procurementUnit.widthUnit.id != ''}
//                                                             invalid={touched.widthUnitId && !!errors.widthUnitId}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.widthUnit.id}
//                                                             type="select" name="widthUnitId" id="widthUnitId">
//                                                             <option value="">{i18n.t('static.common.select')}</option>
//                                                             {units}
//                                                         </Input>
//                                                         <FormFeedback>{errors.widthUnitId}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="widthQty">{i18n.t('static.procurementUnit.widthQty')}</Label>
//                                                         <Input
//                                                             type="number" name="widthQty" valid={!errors.widthQty && this.state.procurementUnit.widthQty != '' && this.state.procurementUnit.widthQty != '0'}
//                                                             bsSize="sm"
//                                                             invalid={touched.widthQty && !!errors.widthQty}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.widthQty}
//                                                             id="widthQty" />
//                                                         <FormFeedback className="red">{errors.widthQty}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="select">{i18n.t('static.procurementUnit.weightUnit')}</Label>
//                                                         <Input
//                                                             bsSize="sm"
//                                                             valid={!errors.weightUnitId && this.state.procurementUnit.weightUnit.id != ''}
//                                                             invalid={touched.weightUnitId && !!errors.weightUnitId}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.weightUnit.id}
//                                                             type="select" name="weightUnitId" id="weightUnitId">
//                                                             <option value="">{i18n.t('static.common.select')}</option>
//                                                             {units}
//                                                         </Input>
//                                                         <FormFeedback>{errors.weightUnitId}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="weightQty">{i18n.t('static.procurementUnit.weightQty')}</Label>
//                                                         <Input
//                                                             type="number" name="weightQty" valid={!errors.weightQty && this.state.procurementUnit.weightQty != '' && this.state.procurementUnit.weightQty != '0'}
//                                                             bsSize="sm"
//                                                             invalid={touched.weightQty && !!errors.weightQty}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.weightQty}
//                                                             id="weightQty" />
//                                                         <FormFeedback className="red">{errors.weightQty}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="labeling">{i18n.t('static.procurementUnit.labeling')}</Label>
//                                                         <Input
//                                                             type="text" name="labeling" valid={!errors.labeling && this.state.procurementUnit.labeling != ''}
//                                                             bsSize="sm"
//                                                             invalid={touched.labeling && !!errors.labeling}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.labeling}
//                                                             id="labeling" />
//                                                         <FormFeedback className="red">{errors.labeling}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="unitsPerCase">{i18n.t('static.procurementUnit.unitsPerCase')}</Label>
//                                                         <Input
//                                                             type="number" name="unitsPerCase" valid={!errors.unitsPerCase && this.state.procurementUnit.unitsPerCase != ''}
//                                                             bsSize="sm"
//                                                             invalid={touched.unitsPerCase && !!errors.unitsPerCase}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.unitsPerCase}
//                                                             id="unitsPerCase" />
//                                                         <FormFeedback className="red">{errors.unitsPerCase}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="unitsPerPallet">{i18n.t('static.procurementUnit.unitsPerPallet')}</Label>
//                                                         <Input
//                                                             type="number" name="unitsPerPallet" valid={!errors.unitsPerPallet && this.state.procurementUnit.unitsPerPallet != ''}
//                                                             bsSize="sm"
//                                                             invalid={touched.unitsPerPallet && !!errors.unitsPerPallet}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.unitsPerPallet}
//                                                             id="unitsPerPallet" />
//                                                         <FormFeedback className="red">{errors.unitsPerPallet}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="unitsPerContainer">{i18n.t('static.procurementUnit.unitsPerContainer')}</Label>
//                                                         <Input
//                                                             type="number" name="unitsPerContainer" valid={!errors.unitsPerContainer && this.state.procurementUnit.unitsPerContainer != ''}
//                                                             bsSize="sm"
//                                                             invalid={touched.unitsPerContainer && !!errors.unitsPerContainer}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.unitsPerContainer}
//                                                             id="unitsPerContainer" />
//                                                         <FormFeedback className="red">{errors.unitsPerContainer}</FormFeedback>
//                                                     </FormGroup>
//                                                 </CardBody>
//                                                 <CardFooter>
//                                                     <FormGroup>
//                                                         <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
//                                                         <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
//                                                         <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')} </Button>
//                                                         &nbsp;
//                                         </FormGroup>
//                                                 </CardFooter>
//                                             </Form>
//                                         )} />
//                         </Card>
//                     </Col>
//                 </Row>
//             </div>

//         );
//     }

//     cancelClicked() {
//         this.props.history.push(`/procurementUnit/listProcurementUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
//     }

//     resetClicked() {
//         let { procurementUnit } = this.state;

//         procurementUnit.label.label_en = ''
//         procurementUnit.planningUnit.planningUnitId = ''
//         procurementUnit.multiplier = ''
//         procurementUnit.unit.id = ''
//         procurementUnit.supplier.id = ''
//         procurementUnit.heightUnit.id = ''
//         procurementUnit.heightQty = ''
//         procurementUnit.lengthUnit.id = ''
//         procurementUnit.lengthQty = ''
//         procurementUnit.widthUnit.id = ''
//         procurementUnit.widthQty = ''
//         procurementUnit.weightUnit.id = ''
//         procurementUnit.weightQty = ''
//         procurementUnit.labeling = ''
//         procurementUnit.unitsPerCase = ''
//         procurementUnit.unitsPerPallet = ''
//         procurementUnit.unitsPerContainer = ''

//         this.setState({ procurementUnit }, () => { })

//     }
// }



// Loader

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
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'

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
    unitsPerContainer: 0,
    unitsPerCase: 0,
    unitsPerPallet: 0
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
        unitsPerCase: Yup.number()
            .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        unitsPerPallet: Yup.number()
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
                heightUnit: {
                    id: '',
                },
                heightQty: 0,
                lengthUnit: {
                    id: '',
                },
                lengthQty: 0,
                widthUnit: {
                    id: '',
                },
                widthQty: 0,
                weightUnit: {
                    id: '',
                },
                weightQty: 0,
                labeling: '',
                unitsPerCase: 0,
                unitsPerPallet: 0,
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
        procurementUnit.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }

    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        PlanningUnitService.getActivePlanningUnitList()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        planningUnitList: response.data, loading: false
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            })

        AuthenticationService.setupAxiosInterceptors();
        UnitService.getUnitListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        unitList: response.data, loading: false
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            })

        AuthenticationService.setupAxiosInterceptors();
        SupplierService.getSupplierListAll()
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        supplierList: response.data, loading: false
                    })
                } else {
                    this.setState({
                        message: response.data.messageCode, loading: false
                    },
                        () => {
                            this.hideSecondComponent();
                        })
                }
            })

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
            procurementUnit.unit.id = event.target.value;
        }
        if (event.target.name == "supplierId") {
            procurementUnit.supplier.id = event.target.value;
        }
        if (event.target.name == "heightUnitId") {
            procurementUnit.heightUnit.id = event.target.value;
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
        if (event.target.name == "widthUnitId") {
            procurementUnit.widthUnit.id = event.target.value;
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
                <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} loading={(loading) => {
                    this.setState({ loading: loading })
                }} />
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <Row style={{ display: this.state.loading ? "none" : "block" }}>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                initialValues={initialValues}
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    AuthenticationService.setupAxiosInterceptors();
                                    ProcurementUnitService.addProcurementUnit(this.state.procurementUnit).then(response => {
                                        if (response.status == "200") {
                                            this.props.history.push(`/procurementUnit/listProcurementUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
                                        } else {
                                            this.setState({
                                                message: response.data.messageCode, loading: false
                                            },
                                                () => {
                                                    this.hideSecondComponent();
                                                })
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
                                        setTouched,
                                        handleReset
                                    }) => (

                                            <Form onSubmit={handleSubmit} onReset={handleReset} noValidate name='procurementUnitForm'>
                                                {/* <CardHeader>
                                                    <strong>{i18n.t('static.procurementUnit.procurementUnit')}</strong>
                                                </CardHeader> */}
                                                <CardBody>
                                                    <FormGroup>
                                                        <Label htmlFor="procurementUnit">{i18n.t('static.procurementUnit.procurementUnit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="text" name="procurementUnitName" valid={!errors.procurementUnitName && this.state.procurementUnit.label.label_en != ''}
                                                            bsSize="sm"
                                                            invalid={touched.procurementUnitName && !!errors.procurementUnitName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.label.label_en}
                                                            id="procurementUnitName" />
                                                        <FormFeedback className="red">{errors.procurementUnitName}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.planningUnit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.planningUnitId && this.state.procurementUnit.planningUnit.planningUnitId != ''}
                                                            invalid={touched.planningUnitId && !!errors.planningUnitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.planningUnit.planningUnitId}
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
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.unit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.unitId && this.state.procurementUnit.unit.id != ''}
                                                            invalid={touched.unitId && !!errors.unitId}
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
                                                            invalid={touched.supplierId && !!errors.supplierId}
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
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.heightUnit')}</Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.heightUnitId && this.state.procurementUnit.heightUnit.id != ''}
                                                            invalid={touched.heightUnitId && !!errors.heightUnitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.heightUnit.id}
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
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.widthUnit')}</Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.widthUnitId && this.state.procurementUnit.widthUnit.id != ''}
                                                            invalid={touched.widthUnitId && !!errors.widthUnitId}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.widthUnit.id}
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
                                                </CardBody>
                                                <CardFooter>
                                                    <FormGroup>
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                                        <Button type="reset" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)} disabled={!isValid} ><i className="fa fa-check"></i>{i18n.t('static.common.submit')} </Button>
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
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }

    cancelClicked() {
        this.props.history.push(`/procurementUnit/listProcurementUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

    resetClicked() {
        let { procurementUnit } = this.state;

        procurementUnit.label.label_en = ''
        procurementUnit.planningUnit.planningUnitId = ''
        procurementUnit.multiplier = ''
        procurementUnit.unit.id = ''
        procurementUnit.supplier.id = ''
        procurementUnit.heightUnit.id = ''
        procurementUnit.heightQty = ''
        procurementUnit.lengthUnit.id = ''
        procurementUnit.lengthQty = ''
        procurementUnit.widthUnit.id = ''
        procurementUnit.widthQty = ''
        procurementUnit.weightUnit.id = ''
        procurementUnit.weightQty = ''
        procurementUnit.labeling = ''
        procurementUnit.unitsPerCase = ''
        procurementUnit.unitsPerPallet = ''
        procurementUnit.unitsPerContainer = ''

        this.setState({ procurementUnit }, () => { })

    }
}