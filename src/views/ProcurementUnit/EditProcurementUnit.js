// import React, { Component } from "react";
// import {
//     Row, Card, CardBody, CardHeader,
//     Label, Input, FormGroup,
//     CardFooter, Button, Col, FormFeedback, Form
// } from 'reactstrap';
// import Select from 'react-select';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
// import '../Forms/ValidationForms/ValidationForms.css';
// import 'react-select/dist/react-select.min.css';
// import ProcurementUnitService from "../../api/ProcurementUnitService";
// import { lang } from "moment";
// import i18n from "../../i18n"
// import getLabelText from '../../CommonComponent/getLabelText'
// import AuthenticationService from '../Common/AuthenticationService.js';
// import UnitService from '../../api/UnitService'
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
// import { DECIMAL_NO_REGEX } from '../../Constants.js';


// const entityname = i18n.t('static.procurementUnit.procurementUnit');
// let initialValues = {
//     procurementUnitName: '',
//     planningUnitId: '',
//     multiplier: '',
//     unitId: '',
//     supplierId: '',
//     heightUnitId: '',
//     heightQty: "",
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
//             .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
//             // .matches(DECIMAL_NO_REGEX, i18n.t('static.realm.decimalNotAllow'))
//             .decimal(i18n.t('static.realm.decimalNotAllow'))
//             .min(0, i18n.t('static.program.validvaluetext')),
//         lengthQty: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
//             .decimal(i18n.t('static.realm.decimalNotAllow'))
//             .min(0, i18n.t('static.program.validvaluetext')),
//         widthQty: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
//             .decimal(i18n.t('static.realm.decimalNotAllow'))
//             .min(0, i18n.t('static.program.validvaluetext')),
//         weightQty: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
//             .decimal(i18n.t('static.realm.decimalNotAllow'))
//             .min(0, i18n.t('static.program.validvaluetext')),
//         unitsPerCase: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
//             .decimal(i18n.t('static.realm.decimalNotAllow'))
//             .min(0, i18n.t('static.program.validvaluetext')),
//         unitsPerPallet: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
//             .decimal(i18n.t('static.realm.decimalNotAllow'))
//             .min(0, i18n.t('static.program.validvaluetext')),
//         unitsPerContainer: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
//             .decimal(i18n.t('static.realm.decimalNotAllow'))
//             .min(0, i18n.t('static.program.validvaluetext')),
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
// export default class EditProcurementUnit extends Component {
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
//                     planningUnitId: '',
//                     label: {
//                         label_en: '',
//                         label_sp: '',
//                         label_pr: '',
//                         label_fr: ''
//                     },
//                 },
//                 multiplier: '',
//                 unit: {
//                     id: ''
//                 },
//                 supplier: {
//                     id: '',
//                     label: {
//                         label_en: '',
//                         label_sp: '',
//                         label_pr: '',
//                         label_fr: ''
//                     },
//                 },
//                 heightUnit: {
//                     id: '',
//                 },
//                 heightQty: "",
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
//             regionId: '',
//             lang: localStorage.getItem('lang'),
//             unitList: [],
//             message: ''

//         }

//         this.dataChange = this.dataChange.bind(this);
//         this.cancelClicked = this.cancelClicked.bind(this);
//         this.Capitalize = this.Capitalize.bind(this);
//         this.resetClicked = this.resetClicked.bind(this);
//         this.changeMessage = this.changeMessage.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);

//     }
//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }

//     changeMessage(message) {
//         this.setState({ message: message })
//     }

//     Capitalize(str) {
//         let { procurementUnit } = this.state
//         procurementUnit.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
//     }
//     componentDidMount() {
//         console.log("this.props.match.params.procurementUnitId", this.props.match.params.procurementUnitId)
//         ProcurementUnitService.getProcurementUnitById(this.props.match.params.procurementUnitId).then(response => {
//             this.setState({
//                 procurementUnit: response.data
//             })
//             UnitService.getUnitListAll()
//                 .then(response => {
//                     if (response.status == 200) {
//                         this.setState({
//                             unitList: response.data
//                         })
//                     } else {
//                         this.setState({
//                             message: response.data.messageCode
//                         },
//                             () => {
//                                 this.hideSecondComponent();
//                             })
//                     }
//                 })

//         })

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
//         } else if (event.target.name === "active") {
//             procurementUnit.active = event.target.id === "active2" ? false : true
//         }
//         this.setState({
//             procurementUnit
//         },
//             () => { console.log("state-------------------", this.state.procurementUnit) });
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
//         const { unitList } = this.state;
//         let units = unitList.length > 0
//             && unitList.map((item, i) => {
//                 return (
//                     <option key={i} value={item.unitId}>
//                         {getLabelText(item.label, this.state.lang)}
//                     </option>
//                 )
//             }, this);

//         return (

//             <div className="animated fadeIn">
//                 <AuthenticationServiceComponent history={this.props.history} message={this.changeMessage} />
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
//                 <Row>
//                     <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
//                         <Card>
//                             <Formik
//                                 enableReinitialize={true}
//                                 initialValues={{
//                                     procurementUnitName: getLabelText(this.state.procurementUnit.label, lang),
//                                     planningUnitId: this.state.procurementUnit.planningUnit.planningUnitId,
//                                     multiplier: this.state.procurementUnit.multiplier,
//                                     unitId: this.state.procurementUnit.unit.id,
//                                     supplierId: this.state.procurementUnit.supplier.id,
//                                     heightUnitId: this.state.procurementUnit.heightUnit.id,
//                                     heightQty: this.state.procurementUnit.heightQty,
//                                     lengthUnitId: this.state.procurementUnit.lengthUnit.id,
//                                     lengthQty: this.state.procurementUnit.lengthQty,
//                                     widthUnitId: this.state.procurementUnit.widthUnit.id,
//                                     widthQty: this.state.procurementUnit.widthQty,
//                                     weightUnitId: this.state.procurementUnit.weightUnit.id,
//                                     weightQty: this.state.procurementUnit.weightQty,
//                                     labeling: this.state.procurementUnit.labeling,
//                                     unitsPerCase: this.state.procurementUnit.unitsPerCase,
//                                     unitsPerPallet: this.state.procurementUnit.unitsPerPallet,
//                                     unitsPerContainer: this.state.procurementUnit.unitsPerContainer
//                                 }}
//                                 validate={validate(validationSchema)}
//                                 onSubmit={(values, { setSubmitting, setErrors }) => {
//                                     AuthenticationService.setupAxiosInterceptors();
//                                     ProcurementUnitService.editProcurementUnit(this.state.procurementUnit).then(response => {
//                                         if (response.status == 200) {
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
//                                         setTouched
//                                     }) => (

//                                             <Form onSubmit={handleSubmit} noValidate name='procurementUnitForm'>
//                                                 {/* <CardHeader>
//                                                     <strong>{i18n.t('static.common.editEntity', { entityname })}</strong>
//                                                 </CardHeader> */}
//                                                 <CardBody className="pb-0">
//                                                     <FormGroup>
//                                                         <Label htmlFor="procurementUnit">{i18n.t('static.procurementUnit.procurementUnit')}<span class="red Reqasterisk">*</span></Label>
//                                                         <Input
//                                                             type="text" name="procurementUnitName"
//                                                             valid={!errors.procurementUnitName}
//                                                             bsSize="sm"
//                                                             invalid={touched.procurementUnitName && !!errors.procurementUnitName || this.state.procurementUnit.label.label_en == ''}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.label.label_en}
//                                                             id="procurementUnitName" />
//                                                         <FormFeedback className="red">{errors.procurementUnitName}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="select">{i18n.t('static.procurementUnit.planningUnit')}</Label>
//                                                         <Input
//                                                             value={getLabelText(this.state.procurementUnit.planningUnit.label, this.state.lang)}
//                                                             bsSize="sm"
//                                                             valid={!errors.planningUnitId}
//                                                             invalid={touched.planningUnitId && !!errors.planningUnitId}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             onBlur={handleBlur}
//                                                             disabled
//                                                             type="text"
//                                                             name="planningUnitId" id="planningUnitId">
//                                                         </Input>
//                                                         <FormFeedback>{errors.planningUnitId}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="multiplier">{i18n.t('static.procurementUnit.multiplier')}<span class="red Reqasterisk">*</span></Label>
//                                                         <Input
//                                                             type="number" name="multiplier" valid={!errors.multiplier}
//                                                             bsSize="sm"
//                                                             invalid={touched.multiplier && !!errors.multiplier || this.state.procurementUnit.multiplier == ''}
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
//                                                             valid={!errors.unitId}
//                                                             invalid={touched.unitId && !!errors.unitId || this.state.procurementUnit.unit.id == ''}
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
//                                                         <Label htmlFor="select">{i18n.t('static.procurementUnit.supplier')}</Label>
//                                                         <Input
//                                                             value={getLabelText(this.state.procurementUnit.supplier.label, this.state.lang)}
//                                                             bsSize="sm"
//                                                             valid={!errors.supplierId}
//                                                             invalid={touched.supplierId && !!errors.supplierId}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             onBlur={handleBlur}
//                                                             disabled
//                                                             type="text"
//                                                             name="supplierId" id="supplierId">
//                                                         </Input>
//                                                         <FormFeedback>{errors.supplierId}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="select">{i18n.t('static.procurementUnit.heightUnit')}</Label>
//                                                         <Input
//                                                             bsSize="sm"
//                                                             valid={!errors.heightUnitId}
//                                                             // invalid={touched.heightUnitId && !!errors.heightUnitId  || this.state.procurementUnit.heightUnit.id == ''}
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
//                                                             type="number" name="heightQty"
//                                                             bsSize="sm"
//                                                             valid={!errors.heightQty && this.state.procurementUnit.heightQty >= 0}
//                                                             invalid={(touched.heightQty && !!errors.heightQty) || (this.state.procurementUnit.heightQty < 0 || (this.state.procurementUnit.heightQty).toString() == '')}
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
//                                                             valid={!errors.lengthUnitId}
//                                                             // invalid={touched.lengthUnitId && !!errors.lengthUnitId || this.state.procurementUnit.lengthUnit.id == ''}
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
//                                                             type="number" name="lengthQty"
//                                                             bsSize="sm"
//                                                             valid={!errors.lengthQty && this.state.procurementUnit.lengthQty >= 0}
//                                                             invalid={(touched.lengthQty && !!errors.lengthQty) || (this.state.procurementUnit.lengthQty < 0 || (this.state.procurementUnit.lengthQty).toString() == '')}
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
//                                                             valid={!errors.widthUnitId}
//                                                             // invalid={touched.widthUnitId && !!errors.widthUnitId || this.state.procurementUnit.widthUnit.id == ''}
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
//                                                             type="number" name="widthQty"
//                                                             bsSize="sm"
//                                                             valid={!errors.widthQty && this.state.procurementUnit.widthQty >= 0}
//                                                             invalid={(touched.widthQty && !!errors.widthQty) || (this.state.procurementUnit.widthQty < 0 || (this.state.procurementUnit.widthQty).toString() == '')}
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
//                                                             valid={!errors.weightUnitId}
//                                                             // invalid={touched.weightUnitId && !!errors.weightUnitId || this.state.procurementUnit.weightUnit.id == ''}
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
//                                                             type="number" name="weightQty"
//                                                             bsSize="sm"
//                                                             valid={!errors.weightQty && this.state.procurementUnit.weightQty >= 0}
//                                                             invalid={(touched.weightQty && !!errors.weightQty) || (this.state.procurementUnit.weightQty < 0 || (this.state.procurementUnit.weightQty).toString() == '')}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.weightQty}
//                                                             id="weightQty" />
//                                                         <FormFeedback className="red">{errors.weightQty}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="labeling">{i18n.t('static.procurementUnit.labeling')}</Label>
//                                                         <Input
//                                                             type="text" name="labeling" valid={!errors.labeling}
//                                                             bsSize="sm"
//                                                             invalid={touched.labeling && !!errors.labeling || this.state.procurementUnit.labeling == ''}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.labeling}
//                                                             id="labeling" />
//                                                         <FormFeedback className="red">{errors.labeling}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="unitsPerCase">{i18n.t('static.procurementUnit.unitsPerCase')}</Label>
//                                                         <Input
//                                                             type="number" name="unitsPerCase" valid={!errors.unitsPerCase}
//                                                             bsSize="sm"
//                                                             valid={!errors.unitsPerCase && this.state.procurementUnit.unitsPerCase >= 0}
//                                                             invalid={(touched.unitsPerCase && !!errors.unitsPerCase) || (this.state.procurementUnit.unitsPerCase < 0 || (this.state.procurementUnit.unitsPerCase).toString() == '')}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.unitsPerCase}
//                                                             id="unitsPerCase" />
//                                                         <FormFeedback className="red">{errors.unitsPerCase}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="unitsPerPallet">{i18n.t('static.procurementUnit.unitsPerPallet')}</Label>
//                                                         <Input
//                                                             type="number" name="unitsPerPallet" valid={!errors.unitsPerPallet}
//                                                             bsSize="sm"
//                                                             valid={!errors.unitsPerPallet && this.state.procurementUnit.unitsPerPallet >= 0}
//                                                             invalid={(touched.unitsPerPallet && !!errors.unitsPerPallet) || (this.state.procurementUnit.unitsPerPallet < 0 || (this.state.procurementUnit.unitsPerPallet).toString() == '')}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.unitsPerPallet}
//                                                             id="unitsPerPallet" />
//                                                         <FormFeedback className="red">{errors.unitsPerPallet}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>
//                                                         <Label htmlFor="unitsPerContainer">{i18n.t('static.procurementUnit.unitsPerContainer')}</Label>
//                                                         <Input
//                                                             type="number" name="unitsPerContainer" valid={!errors.unitsPerContainer}
//                                                             bsSize="sm"
//                                                             valid={!errors.unitsPerContainer && this.state.procurementUnit.unitsPerContainer >= 0}
//                                                             invalid={(touched.unitsPerContainer && !!errors.unitsPerContainer) || (this.state.procurementUnit.unitsPerContainer < 0 || (this.state.procurementUnit.unitsPerContainer).toString() == '')}
//                                                             onChange={(e) => { handleChange(e); this.dataChange(e); }}
//                                                             onBlur={handleBlur}
//                                                             value={this.state.procurementUnit.unitsPerContainer}
//                                                             id="unitsPerContainer" />
//                                                         <FormFeedback className="red">{errors.unitsPerContainer}</FormFeedback>
//                                                     </FormGroup>
//                                                     <FormGroup>

//                                                         <Label className="P-absltRadio">{i18n.t('static.common.status')}&nbsp;&nbsp;</Label>

//                                                         <FormGroup check inline>
//                                                             <Input
//                                                                 className="form-check-input"
//                                                                 type="radio"
//                                                                 id="active1"
//                                                                 name="active"
//                                                                 value={true}
//                                                                 checked={this.state.procurementUnit.active === true}
//                                                                 onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             />
//                                                             <Label
//                                                                 className="form-check-label"
//                                                                 check htmlFor="inline-active1">
//                                                                 {i18n.t('static.common.active')}
//                                                             </Label>
//                                                         </FormGroup>
//                                                         <FormGroup check inline>
//                                                             <Input
//                                                                 className="form-check-input"
//                                                                 type="radio"
//                                                                 id="active2"
//                                                                 name="active"
//                                                                 value={false}
//                                                                 checked={this.state.procurementUnit.active === false}
//                                                                 onChange={(e) => { handleChange(e); this.dataChange(e) }}
//                                                             />
//                                                             <Label
//                                                                 className="form-check-label"
//                                                                 check htmlFor="inline-active2">
//                                                                 {i18n.t('static.common.disabled')}
//                                                             </Label>
//                                                         </FormGroup>
//                                                     </FormGroup>

//                                                 </CardBody>
//                                                 <CardFooter>
//                                                     <FormGroup>
//                                                         <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
//                                                         <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
//                                                         <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>Update</Button>
//                                                         &nbsp;
//                                             </FormGroup>
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
//         ProcurementUnitService.getProcurementUnitById(this.props.match.params.procurementUnitId).then(response => {
//             this.setState({
//                 procurementUnit: response.data
//             })

//         })

//     }
// }


// Loader



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
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
import { DECIMAL_NO_REGEX } from '../../Constants.js';


const entityname = i18n.t('static.procurementUnit.procurementUnit');
let initialValues = {
    procurementUnitName: '',
    planningUnitId: '',
    multiplier: '',
    unitId: '',
    supplierId: '',
    heightUnitId: '',
    heightQty: "",
    lengthUnitId: '',
    lengthQty: 0,
    widthUnitId: '',
    widthQty: 0,
    weightUnitId: '',
    weightQty: 0,
    labeling: '',
    unitsPerContainer: 0,
    unitsPerCase: 0,
    unitsPerPalletEuro1: 0,
    unitsPerPalletEuro2: 0
}

const validationSchema = function (values) {
    return Yup.object().shape({
        procurementUnitName: Yup.string()
            .matches(/^\S+(?: \S+)*$/, i18n.t('static.validSpace.string'))
            .required(i18n.t('static.procurementUnit.validProcurementUnitText')),
        planningUnitId: Yup.string()
            .required(i18n.t('static.procurementUnit.validPlanningUnitText')),
        multiplier: Yup.string()
            // .typeError(i18n.t('static.procurementUnit.validNumberText'))
            .matches(/^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .required(i18n.t('static.procurementUnit.validMultiplierText'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        // .max(12, i18n.t("Eneter valid number with digits less then 10.")),
        unitId: Yup.string()
            .required(i18n.t('static.procurementUnit.validUnitIdText')),
        supplierId: Yup.string()
            .required(i18n.t('static.procurementUnit.validSupplierIdText')),
        heightQty: Yup.string()
            // .typeError(i18n.t('static.procurementUnit.validNumberText'))
            // .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            // // .matches(DECIMAL_NO_REGEX, i18n.t('static.realm.decimalNotAllow'))
            // .decimal(i18n.t('static.realm.decimalNotAllow'))
            // .min(0, i18n.t('static.program.validvaluetext')),
            .matches(/^\d+(\.\d{1,6})?$/, i18n.t('static.currency.conversionrateNumberDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        lengthQty: Yup.string()
            // .typeError(i18n.t('static.procurementUnit.validNumberText'))
            // .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            // .decimal(i18n.t('static.realm.decimalNotAllow'))
            // .min(0, i18n.t('static.program.validvaluetext')),
            .matches(/^\d+(\.\d{1,6})?$/, i18n.t('static.currency.conversionrateNumberDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        widthQty: Yup.string()
            // .typeError(i18n.t('static.procurementUnit.validNumberText'))
            // .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            // .decimal(i18n.t('static.realm.decimalNotAllow'))
            // .min(0, i18n.t('static.program.validvaluetext')),
            .matches(/^\d+(\.\d{1,6})?$/, i18n.t('static.currency.conversionrateNumberDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        weightQty: Yup.string()
            // .typeError(i18n.t('static.procurementUnit.validNumberText'))
            // .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            // .decimal(i18n.t('static.realm.decimalNotAllow'))
            // .min(0, i18n.t('static.program.validvaluetext')),
            .matches(/^\d+(\.\d{1,6})?$/, i18n.t('static.currency.conversionrateNumberDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        volumeQty: Yup.string()
            // .typeError(i18n.t('static.procurementUnit.validNumberText'))
            // .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            // .decimal(i18n.t('static.realm.decimalNotAllow'))
            // .min(0, i18n.t('static.program.validvaluetext')),
            .matches(/^\d+(\.\d{1,6})?$/, i18n.t('static.currency.conversionrateNumberDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        unitsPerCase: Yup.string()
            // .typeError(i18n.t('static.procurementUnit.validNumberText'))
            // .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            // .decimal(i18n.t('static.realm.decimalNotAllow'))
            // .min(0, i18n.t('static.program.validvaluetext')),
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        unitsPerPalletEuro1: Yup.string()
            // .typeError(i18n.t('static.procurementUnit.validNumberText'))
            // .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            // .decimal(i18n.t('static.realm.decimalNotAllow'))
            // .min(0, i18n.t('static.program.validvaluetext')),
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        unitsPerPalletEuro2: Yup.string()
            // .typeError(i18n.t('static.procurementUnit.validNumberText'))
            // .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            // .decimal(i18n.t('static.realm.decimalNotAllow'))
            // .min(0, i18n.t('static.program.validvaluetext')),
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
            .min(0, i18n.t('static.procurementUnit.validValueText')),
        unitsPerContainer: Yup.string()
            // .typeError(i18n.t('static.procurementUnit.validNumberText'))
            // .positive(i18n.t('static.realm.negativeNumberNotAllowed'))
            // .decimal(i18n.t('static.realm.decimalNotAllow'))
            // .min(0, i18n.t('static.program.validvaluetext')),
            .matches(/^\d+(\.\d{1,2})?$/, i18n.t('static.currency.conversionrateNumberTwoDecimalPlaces'))
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
                    id: ''
                },
                supplier: {
                    id: '',
                    label: {
                        label_en: '',
                        label_sp: '',
                        label_pr: '',
                        label_fr: ''
                    },
                },
                // heightUnit: {
                //     id: '',
                // },
                heightQty: "",
                lengthUnit: {
                    id: '',
                },
                lengthQty: 0,
                // widthUnit: {
                //     id: '',
                // },
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
            regionId: '',
            lang: localStorage.getItem('lang'),
            unitList: [],
            message: ''

        }

        this.dataChange = this.dataChange.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.Capitalize = this.Capitalize.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
        this.changeMessage = this.changeMessage.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.changeLoading = this.changeLoading.bind(this);

    }
    changeLoading(loading) {
        this.setState({ loading: loading })
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    changeMessage(message) {
        this.setState({ message: message })
    }

    Capitalize(str) {
        let { procurementUnit } = this.state
        procurementUnit.label.label_en = str.charAt(0).toUpperCase() + str.slice(1)
    }
    componentDidMount() {
        console.log("this.props.match.params.procurementUnitId", this.props.match.params.procurementUnitId)
        ProcurementUnitService.getProcurementUnitById(this.props.match.params.procurementUnitId).then(response => {
            this.setState({
                procurementUnit: response.data
            })
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
                            unitList: listArray, loading: false
                        })
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
        // if (event.target.name == "heightUnitId") {
        //     procurementUnit.heightUnit.id = event.target.value;
        // }
        if (event.target.name == "heightQty") {
            procurementUnit.heightQty = event.target.value;
        }
        if (event.target.name == "lengthUnitId") {
            procurementUnit.lengthUnit.id = event.target.value;
        }
        if (event.target.name == "lengthQty") {
            procurementUnit.lengthQty = event.target.value;
        }
        // if (event.target.name == "widthUnitId") {
        //     procurementUnit.widthUnit.id = event.target.value;
        // }
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
        } else if (event.target.name === "active") {
            procurementUnit.active = event.target.id === "active2" ? false : true
        }
        this.setState({
            procurementUnit
        },
            () => { console.log("state-------------------", this.state.procurementUnit) });
    }
    touchAll(setTouched, errors) {
        setTouched({
            procurementUnitName: true,
            planningUnitId: true,
            multiplier: true,
            unitId: true,
            supplierId: true,
            // heightUnitId: true,
            heightQty: true,
            lengthUnitId: true,
            lengthQty: true,
            // widthUnitId: true,
            widthQty: true,
            weightUnitId: true,
            weightQty: true,
            volumeUnitId: true,
            volumeQty: true,
            labeling: true,
            unitsPerCase: true,
            unitsPerPalletEuro1: true,
            unitsPerPalletEuro2: true,
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
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message, { entityname })}</h5>
                <Row>
                    <Col sm={12} md={8} style={{ flexBasis: 'auto' }}>
                        <Card>
                            <Formik
                                enableReinitialize={true}
                                initialValues={{
                                    procurementUnitName: getLabelText(this.state.procurementUnit.label, lang),
                                    planningUnitId: this.state.procurementUnit.planningUnit.planningUnitId,
                                    multiplier: this.state.procurementUnit.multiplier,
                                    unitId: this.state.procurementUnit.unit.id,
                                    supplierId: this.state.procurementUnit.supplier.id,
                                    // heightUnitId: this.state.procurementUnit.heightUnit.id,
                                    heightQty: this.state.procurementUnit.heightQty,
                                    lengthUnitId: this.state.procurementUnit.lengthUnit.id,
                                    lengthQty: this.state.procurementUnit.lengthQty,
                                    // widthUnitId: this.state.procurementUnit.widthUnit.id,
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
                                validate={validate(validationSchema)}
                                onSubmit={(values, { setSubmitting, setErrors }) => {
                                    this.setState({
                                        loading: true
                                    })
                                    // AuthenticationService.setupAxiosInterceptors();
                                    ProcurementUnitService.editProcurementUnit(this.state.procurementUnit).then(response => {
                                        if (response.status == 200) {
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
                                    ).catch(
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
                                        setTouched
                                    }) => (

                                            <Form onSubmit={handleSubmit} noValidate name='procurementUnitForm' autocomplete="off">
                                                {/* <CardHeader>
                                                    <strong>{i18n.t('static.common.editEntity', { entityname })}</strong>
                                                </CardHeader> */}
                                                <CardBody className="pb-0" style={{ display: this.state.loading ? "none" : "block" }}>
                                                    <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.planningUnit')}<span class="red Reqasterisk">*</span></Label>
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
                                                        <Label htmlFor="procurementUnit">{i18n.t('static.procurementUnit.procurementUnit')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="text" name="procurementUnitName"
                                                            valid={!errors.procurementUnitName}
                                                            bsSize="sm"
                                                            // invalid={touched.procurementUnitName && !!errors.procurementUnitName || this.state.procurementUnit.label.label_en == ''}
                                                            invalid={touched.procurementUnitName && !!errors.procurementUnitName || !!errors.procurementUnitName}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); this.Capitalize(e.target.value) }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.label.label_en}
                                                            id="procurementUnitName" />
                                                        <FormFeedback className="red">{errors.procurementUnitName}</FormFeedback>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Label htmlFor="multiplier">{i18n.t('static.procurementUnit.multiplier')}<span class="red Reqasterisk">*</span></Label>
                                                        <Input
                                                            type="number" name="multiplier" valid={!errors.multiplier}
                                                            bsSize="sm"
                                                            invalid={touched.multiplier && !!errors.multiplier || this.state.procurementUnit.multiplier == ''}
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
                                                            valid={!errors.unitId}
                                                            invalid={touched.unitId && !!errors.unitId || this.state.procurementUnit.unit.id == ''}
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
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.lengthUnit')}</Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.lengthUnitId && this.state.procurementUnit.lengthUnit.id != ''}
                                                            // invalid={touched.lengthUnitId && !!errors.lengthUnitId || this.state.procurementUnit.lengthUnit.id == ''}
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
                                                            type="number" name="lengthQty"
                                                            bsSize="sm"
                                                            valid={!errors.lengthQty && this.state.procurementUnit.lengthQty >= 0}
                                                            // invalid={(touched.lengthQty && !!errors.lengthQty) || (this.state.procurementUnit.lengthQty < 0 || (this.state.procurementUnit.lengthQty).toString() == '')}
                                                            invalid={(touched.lengthQty && !!errors.lengthQty) || !!errors.lengthQty}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.lengthQty}
                                                            id="lengthQty" />
                                                        <FormFeedback className="red">{errors.lengthQty}</FormFeedback>
                                                    </FormGroup>

                                                    {/* <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.heightUnit')}</Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.heightUnitId}
                                                            // invalid={touched.heightUnitId && !!errors.heightUnitId  || this.state.procurementUnit.heightUnit.id == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.heightUnit.id}
                                                            type="select" name="heightUnitId" id="heightUnitId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {units}
                                                        </Input>
                                                        <FormFeedback>{errors.heightUnitId}</FormFeedback>
                                                    </FormGroup> */}

                                                    <FormGroup>
                                                        <Label htmlFor="heightQty">{i18n.t('static.procurementUnit.heightQty')}</Label>
                                                        <Input
                                                            type="number" name="heightQty"
                                                            bsSize="sm"
                                                            valid={!errors.heightQty && this.state.procurementUnit.heightQty >= 0}
                                                            // invalid={(touched.heightQty && !!errors.heightQty) || (this.state.procurementUnit.heightQty < 0 || (this.state.procurementUnit.heightQty).toString() == '')}
                                                            invalid={(touched.heightQty && !!errors.heightQty) || !!errors.heightQty}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.heightQty}
                                                            id="heightQty" />
                                                        <FormFeedback className="red">{errors.heightQty}</FormFeedback>
                                                    </FormGroup>

                                                    {/* <FormGroup>
                                                        <Label htmlFor="select">{i18n.t('static.procurementUnit.widthUnit')}</Label>
                                                        <Input
                                                            bsSize="sm"
                                                            valid={!errors.widthUnitId}
                                                            // invalid={touched.widthUnitId && !!errors.widthUnitId || this.state.procurementUnit.widthUnit.id == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.widthUnit.id}
                                                            type="select" name="widthUnitId" id="widthUnitId">
                                                            <option value="">{i18n.t('static.common.select')}</option>
                                                            {units}
                                                        </Input>
                                                        <FormFeedback>{errors.widthUnitId}</FormFeedback>
                                                    </FormGroup> */}
                                                    <FormGroup>
                                                        <Label htmlFor="widthQty">{i18n.t('static.procurementUnit.widthQty')}</Label>
                                                        <Input
                                                            type="number" name="widthQty"
                                                            bsSize="sm"
                                                            valid={!errors.widthQty && this.state.procurementUnit.widthQty >= 0}
                                                            // invalid={(touched.widthQty && !!errors.widthQty) || (this.state.procurementUnit.widthQty < 0 || (this.state.procurementUnit.widthQty).toString() == '')}
                                                            invalid={(touched.widthQty && !!errors.widthQty) || !!errors.widthQty}
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
                                                            // invalid={touched.weightUnitId && !!errors.weightUnitId || this.state.procurementUnit.weightUnit.id == ''}
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
                                                            type="number" name="weightQty"
                                                            bsSize="sm"
                                                            valid={!errors.weightQty && this.state.procurementUnit.weightQty >= 0}
                                                            // invalid={(touched.weightQty && !!errors.weightQty) || (this.state.procurementUnit.weightQty < 0 || (this.state.procurementUnit.weightQty).toString() == '')}
                                                            invalid={(touched.weightQty && !!errors.weightQty) || !!errors.weightQty}
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
                                                            // invalid={touched.weightUnitId && !!errors.weightUnitId || this.state.procurementUnit.weightUnit.id == ''}
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
                                                            type="number" name="volumeQty"
                                                            bsSize="sm"
                                                            valid={!errors.volumeQty && this.state.procurementUnit.volumeQty >= 0}
                                                            // invalid={(touched.volumeQty && !!errors.volumeQty) || (this.state.procurementUnit.volumeQty < 0 || (this.state.procurementUnit.volumeQty).toString() == '')}
                                                            invalid={(touched.volumeQty && !!errors.volumeQty) || !!errors.volumeQty}
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
                                                            // invalid={touched.labeling && !!errors.labeling || this.state.procurementUnit.labeling == ''}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.labeling}
                                                            id="labeling" />
                                                        <FormFeedback className="red">{errors.labeling}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="unitsPerCase">{i18n.t('static.procurementUnit.unitsPerCase')}</Label>
                                                        <Input
                                                            type="number" name="unitsPerCase" valid={!errors.unitsPerCase}
                                                            bsSize="sm"
                                                            valid={!errors.unitsPerCase && this.state.procurementUnit.unitsPerCase >= 0}
                                                            // invalid={(touched.unitsPerCase && !!errors.unitsPerCase) || (this.state.procurementUnit.unitsPerCase < 0 || (this.state.procurementUnit.unitsPerCase).toString() == '')}
                                                            invalid={(touched.unitsPerCase && !!errors.unitsPerCase) || !!errors.unitsPerCase}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.unitsPerCase}
                                                            id="unitsPerCase" />
                                                        <FormFeedback className="red">{errors.unitsPerCase}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="unitsPerPalletEuro1">{i18n.t('static.procurementUnit.unitsPerPalletEuro1')}</Label>
                                                        <Input
                                                            type="number" name="unitsPerPalletEuro1" valid={!errors.unitsPerPalletEuro1}
                                                            bsSize="sm"
                                                            valid={!errors.unitsPerPalletEuro1 && this.state.procurementUnit.unitsPerPalletEuro1 >= 0}
                                                            // invalid={(touched.unitsPerPalletEuro1 && !!errors.unitsPerPalletEuro1) || (this.state.procurementUnit.unitsPerPalletEuro1 < 0 || (this.state.procurementUnit.unitsPerPalletEuro1).toString() == '')}
                                                            invalid={(touched.unitsPerPalletEuro1 && !!errors.unitsPerPalletEuro1) || !!errors.unitsPerPalletEuro1}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.unitsPerPalletEuro1}
                                                            id="unitsPerPalletEuro1" />
                                                        <FormFeedback className="red">{errors.unitsPerPalletEuro1}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="unitsPerPalletEuro2">{i18n.t('static.procurementUnit.unitsPerPalletEuro2')}</Label>
                                                        <Input
                                                            type="number" name="unitsPerPalletEuro2" valid={!errors.unitsPerPalletEuro1}
                                                            bsSize="sm"
                                                            valid={!errors.unitsPerPalletEuro2 && this.state.procurementUnit.unitsPerPalletEuro2 >= 0}
                                                            // invalid={(touched.unitsPerPalletEuro2 && !!errors.unitsPerPalletEuro2) || (this.state.procurementUnit.unitsPerPalletEuro2 < 0 || (this.state.procurementUnit.unitsPerPalletEuro2).toString() == '')}
                                                            invalid={(touched.unitsPerPalletEuro2 && !!errors.unitsPerPalletEuro2) || !!errors.unitsPerPalletEuro2}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.unitsPerPalletEuro2}
                                                            id="unitsPerPalletEuro2" />
                                                        <FormFeedback className="red">{errors.unitsPerPalletEuro2}</FormFeedback>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label htmlFor="unitsPerContainer">{i18n.t('static.procurementUnit.unitsPerContainer')}</Label>
                                                        <Input
                                                            type="number" name="unitsPerContainer" valid={!errors.unitsPerContainer}
                                                            bsSize="sm"
                                                            valid={!errors.unitsPerContainer && this.state.procurementUnit.unitsPerContainer >= 0}
                                                            // invalid={(touched.unitsPerContainer && !!errors.unitsPerContainer) || (this.state.procurementUnit.unitsPerContainer < 0 || (this.state.procurementUnit.unitsPerContainer).toString() == '')}
                                                            invalid={(touched.unitsPerContainer && !!errors.unitsPerContainer) || !!errors.unitsPerContainer}
                                                            onChange={(e) => { handleChange(e); this.dataChange(e); }}
                                                            onBlur={handleBlur}
                                                            value={this.state.procurementUnit.unitsPerContainer}
                                                            id="unitsPerContainer" />
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
                                                        <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i>{i18n.t('static.common.cancel')}</Button>
                                                        <Button type="button" size="md" color="warning" className="float-right mr-1 text-white" onClick={this.resetClicked}><i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}</Button>
                                                        <Button type="submit" size="md" color="success" className="float-right mr-1" onClick={() => this.touchAll(setTouched, errors)}><i className="fa fa-check"></i>{i18n.t('static.common.update')}</Button>
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
        this.props.history.push(`/procurementUnit/listProcurementUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
    resetClicked() {
        ProcurementUnitService.getProcurementUnitById(this.props.match.params.procurementUnitId).then(response => {
            this.setState({
                procurementUnit: response.data
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
}