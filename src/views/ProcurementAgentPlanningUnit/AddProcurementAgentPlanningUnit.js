
import React, { Component } from 'react';
import ProcurementAgentService from "../../api/ProcurementAgentService";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup, InputGroup,
    CardFooter, Button, Table, Badge, Col, Row, Form, FormFeedback

} from 'reactstrap';
import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
import AuthenticationService from '../Common/AuthenticationService.js';
import PlanningUnitService from "../../api/PlanningUnitService";
import StatusUpdateButtonFeature from '../../CommonComponent/StatusUpdateButtonFeature';
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature'
import i18n from '../../i18n';
import * as Yup from 'yup';
import { Formik } from "formik";
import getLabelText from '../../CommonComponent/getLabelText';

import CryptoJS from 'crypto-js';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import moment from "moment";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';


const entityname = i18n.t('static.dashboard.procurementAgentPlanningUnit')

let initialValues = {
    planningUnitId: '',
    skuCode: '',
    catalogPrice: '',
    moq: 0,
    unitsPerPallet: 0,
    unitsPerContainer: 0,
    volume: 0,
    weight: 0,
}

// const validationSchema = function (values, t) {
//     return Yup.object().shape({
//         planningUnitId: Yup.string()
//             .required(i18n.t('static.procurementUnit.validPlanningUnitText')),
//         skuCode: Yup.string()
//             .required(i18n.t('static.procurementAgentPlanningUnit.validSKUCode')),
//         catalogPrice: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .required(i18n.t('static.procurementAgentPlanningUnit.validCatalogPrice')).min(0, i18n.t('static.procurementUnit.validValueText')),
//         moq: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .min(0, i18n.t('static.procurementUnit.validValueText')),
//         unitsPerPallet: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .min(0, i18n.t('static.procurementUnit.validValueText')),
//         unitsPerContainer: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .min(0, i18n.t('static.procurementUnit.validValueText')),
//         volume: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .min(0, i18n.t('static.procurementUnit.validValueText')),
//         weight: Yup.number()
//             .typeError(i18n.t('static.procurementUnit.validNumberText'))
//             .min(0, i18n.t('static.procurementUnit.validValueText'))
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


// export default class AddProcurementAgentPlanningUnit extends Component {
//     constructor(props) {
//         super(props);
//         let rows = [];
//         // if (this.props.location.state.procurementAgentPlanningUnit.length > 0) {
//         //     rows = this.props.location.state.procurementAgentPlanningUnit;
//         // }
//         this.state = {
//             // procurementAgentPlanningUnit: this.props.location.state.procurementAgentPlanningUnit,
//             planningUnitId: '',
//             planningUnitName: '',
//             skuCode: '',
//             catalogPrice: '',
//             moq: 0,
//             unitsPerPallet: 0,
//             unitsPerContainer: 0,
//             volume: 0,
//             weight: 0,

//             rows: rows,
//             procurementAgentList: [],
//             planningUnitList: [],
//             rowErrorMessage: '',

//             procurementAgentPlanningUnitId: 0,
//             isNew: true,
//             procurementAgentId: this.props.match.params.procurementAgentId,
//             updateRowStatus: 0,
//             lang: localStorage.getItem('lang')
//         }
//         this.addRow = this.addRow.bind(this);
//         // this.deleteLastRow = this.deleteLastRow.bind(this);
//         this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
//         this.submitForm = this.submitForm.bind(this);
//         this.setTextAndValue = this.setTextAndValue.bind(this);
//         this.cancelClicked = this.cancelClicked.bind(this);

//         this.enableRow = this.enableRow.bind(this);
//         this.disableRow = this.disableRow.bind(this);
//         this.updateRow = this.updateRow.bind(this);
//         this.hideSecondComponent = this.hideSecondComponent.bind(this);
//     }
//     hideSecondComponent() {
//         setTimeout(function () {
//             document.getElementById('div2').style.display = 'none';
//         }, 8000);
//     }

//     updateRow(idx) {
//         if (this.state.updateRowStatus == 1) {
//             this.setState({ rowErrorMessage: 'One Of the mapped row is already in update.' })
//         } else {
//             document.getElementById('select').disabled = true;
//             initialValues = {
//                 planningUnitId: this.state.rows[idx].planningUnit.id,
//                 skuCode: this.state.rows[idx].skuCode,
//                 catalogPrice: this.state.rows[idx].catalogPrice,
//                 moq: this.state.rows[idx].moq,
//                 unitsPerPallet: this.state.rows[idx].unitsPerPallet,
//                 unitsPerContainer: this.state.rows[idx].unitsPerContainer,
//                 volume: this.state.rows[idx].volume,
//                 weight: this.state.rows[idx].weight

//             }
//             const rows = [...this.state.rows]
//             this.setState({
//                 planningUnitId: this.state.rows[idx].planningUnit.id,
//                 planningUnitName: this.state.rows[idx].planningUnit.label.label_en,
//                 skuCode: this.state.rows[idx].skuCode,
//                 catalogPrice: this.state.rows[idx].catalogPrice,
//                 moq: this.state.rows[idx].moq,
//                 unitsPerPallet: this.state.rows[idx].unitsPerPallet,
//                 unitsPerContainer: this.state.rows[idx].unitsPerContainer,
//                 volume: this.state.rows[idx].volume,
//                 weight: this.state.rows[idx].weight,
//                 procurementAgentPlanningUnitId: this.state.rows[idx].procurementAgentPlanningUnitId,
//                 isNew: false,
//                 updateRowStatus: 1
//             })
//             rows.splice(idx, 1);
//             this.setState({ rows });
//         }
//     }

//     enableRow(idx) {
//         this.state.rows[idx].active = true;
//         this.setState({ rows: this.state.rows })
//     }

//     disableRow(idx) {
//         this.state.rows[idx].active = false;
//         this.setState({ rows: this.state.rows })
//     }

//     addRow() {
//         let addRow = true;
//         if (addRow) {
//             this.state.rows.map(item => {
//                 if (item.planningUnit.id == this.state.planningUnitId) {
//                     addRow = false;
//                 }
//             }
//             )
//         }
//         if (addRow == true) {
//             var procurementAgentName = document.getElementById("procurementAgentId");
//             var value = procurementAgentName.selectedIndex;
//             var selectedProcurementAgentName = procurementAgentName.options[value].text;
//             this.state.rows.push(
//                 {
//                     planningUnit: {
//                         id: this.state.planningUnitId,
//                         label: {
//                             label_en: this.state.planningUnitName
//                         }
//                     },
//                     procurementAgent: {
//                         id: this.state.procurementAgentId,
//                         label: {
//                             label_en: selectedProcurementAgentName
//                         }
//                     },
//                     skuCode: this.state.skuCode,
//                     catalogPrice: this.state.catalogPrice,
//                     moq: this.state.moq,
//                     unitsPerPallet: this.state.unitsPerPallet,
//                     unitsPerContainer: this.state.unitsPerContainer,
//                     volume: this.state.volume,
//                     weight: this.state.weight,
//                     active: true,
//                     isNew: this.state.isNew,
//                     procurementAgentPlanningUnitId: this.state.procurementAgentPlanningUnitId
//                 })

//             this.setState({ rows: this.state.rows, rowErrorMessage: '' })
//         } else {
//             this.state.rowErrorMessage = 'Planning Unit Already Exist In List.'
//         }
//         this.setState({
//             planningUnitId: '',
//             planningUnitName: '',
//             skuCode: '',
//             catalogPrice: '',
//             moq: '',
//             unitsPerPallet: '',
//             unitsPerContainer: '',
//             volume: '',
//             weight: '',
//             procurementAgentPlanningUnitId: 0,
//             isNew: true,
//             updateRowStatus: 0
//         });
//         document.getElementById('select').disabled = false;
//     }

//     // deleteLastRow() {
//     //     this.setState({
//     //         rows: this.state.rows.slice(0, -1)
//     //     });
//     // }

//     handleRemoveSpecificRow(idx) {
//         const rows = [...this.state.rows]
//         rows.splice(idx, 1);
//         this.setState({ rows })
//     }

//     setTextAndValue = (event) => {

//         if (event.target.name === 'skuCode') {
//             this.setState({ skuCode: event.target.value.toUpperCase() });
//         }
//         if (event.target.name === 'catalogPrice') {
//             this.setState({ catalogPrice: event.target.value });
//         }
//         if (event.target.name === 'moq') {
//             this.setState({ moq: event.target.value });
//         }
//         if (event.target.name === 'unitsPerPallet') {
//             this.setState({ unitsPerPallet: event.target.value });
//         }
//         if (event.target.name === 'unitsPerContainer') {
//             this.setState({ unitsPerContainer: event.target.value });
//         }
//         if (event.target.name === 'volume') {
//             this.setState({ volume: event.target.value });
//         }
//         if (event.target.name === 'weight') {
//             this.setState({ weight: event.target.value });
//         }
//         else if (event.target.name === 'planningUnitId') {
//             this.setState({ planningUnitName: event.target[event.target.selectedIndex].text });
//             this.setState({ planningUnitId: event.target.value })
//         }
//     };

//     submitForm() {
//         console.log("In submit form", this.state.rows)
//         AuthenticationService.setupAxiosInterceptors();
//         // console.log("------------------programProdcut", programPlanningUnit);
//         ProcurementAgentService.addprocurementAgentPlanningUnitMapping(this.state.rows)
//             .then(response => {
//                 console.log(response.data);
//                 if (response.status == "200") {
//                     console.log(response);
//                     this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }

//             }).catch(
//                 error => {
//                     if (error.message === "Network Error") {
//                         this.setState({ message: error.message });
//                     } else {
//                         switch (error.response ? error.response.status : "") {
//                             case 500:
//                             case 401:
//                             case 404:
//                             case 406:
//                             case 412:
//                                 this.setState({ message: error.response.data.messageCode });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 console.log("Error code unkown");
//                                 break;
//                         }
//                     }
//                 }
//             );
//     }
//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();

//         ProcurementAgentService.getProcurementAgentPlaningUnitList(this.state.procurementAgentId)
//             .then(response => {
//                 if (response.status == 200) {
//                     let myResponse = response.data;
//                     console.log("response.data----",response.data);
//                     if (myResponse.length > 0) {
//                         this.setState({ rows: myResponse });
//                     }

//                 } else {
//                     this.setState({
//                         message: response.data.messageCode
//                     },
//                         () => {
//                             this.hideSecondComponent();
//                         })
//                 }
//             }).catch(
//                 error => {
//                     if (error.message === "Network Error") {
//                         this.setState({ message: error.message });
//                     } else {
//                         switch (error.response ? error.response.status : "") {
//                             case 500:
//                             case 401:
//                             case 404:
//                             case 406:
//                             case 412:
//                                 this.setState({ message: error.response.data.messageCode });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 console.log("Error code unkown");
//                                 break;
//                         }
//                     }
//                 }
//             );

//         ProcurementAgentService.getProcurementAgentListAll().then(response => {
//             console.log(response.data);
//             if (response.status == "200") {
//                 this.setState({
//                     procurementAgentList: response.data
//                 });
//             } else {
//                 this.setState({
//                     message: response.data.messageCode
//                 },
//                     () => {
//                         this.hideSecondComponent();
//                     })
//             }

//         }).catch(
//             error => {
//                 if (error.message === "Network Error") {
//                     this.setState({ message: error.message });
//                 } else {
//                     switch (error.response ? error.response.status : "") {
//                         case 500:
//                         case 401:
//                         case 404:
//                         case 406:
//                         case 412:
//                             this.setState({ message: error.response.data.messageCode });
//                             break;
//                         default:
//                             this.setState({ message: 'static.unkownError' });
//                             console.log("Error code unkown");
//                             break;
//                     }
//                 }
//             }
//         );
//         PlanningUnitService.getActivePlanningUnitList().then(response => {
//             // console.log(response.data.data);
//             if (response.status == 200) {
//                 this.setState({
//                     planningUnitList: response.data
//                 });
//             } else {
//                 this.setState({
//                     message: response.data.messageCode
//                 },
//                     () => {
//                         this.hideSecondComponent();
//                     })
//             }

//         }).catch(
//             error => {
//                 if (error.message === "Network Error") {
//                     this.setState({ message: error.message });
//                 } else {
//                     switch (error.response ? error.response.status : "") {
//                         case 500:
//                         case 401:
//                         case 404:
//                         case 406:
//                         case 412:
//                             this.setState({ message: error.response.data.messageCode });
//                             break;
//                         default:
//                             this.setState({ message: 'static.unkownError' });
//                             console.log("Error code unkown");
//                             break;
//                     }
//                 }
//             }
//         );


//     }
//     touchAll(errors) {
//         this.validateForm(errors);
//     }
//     validateForm(errors) {
//         this.findFirstError('procurementAgentPlanningUnitForm', (fieldName) => {
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
//         const { procurementAgentList } = this.state;
//         const { planningUnitList } = this.state;
//         let programs = procurementAgentList.length > 0 && procurementAgentList.map((item, i) => {
//             return (
//                 <option key={i} value={item.procurementAgentId}>
//                     {getLabelText(item.label, this.state.lang)}
//                 </option>
//             )
//         }, this);
//         let products = planningUnitList.length > 0 && planningUnitList.map((item, i) => {
//             return (
//                 <option key={i} value={item.planningUnitId}>
//                     {getLabelText(item.label, this.state.lang)}
//                 </option>
//             )
//         }, this);
//         return (
//             <div className="animated fadeIn">
//                 <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
//                 <Row>
//                     <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
//                         <Card>

//                             <CardHeader>
//                                 <strong>{i18n.t('static.program.mapPlanningUnit')}</strong>
//                             </CardHeader>
//                             <CardBody>
//                                 <Formik
//                                     enableReinitialize={true}
//                                     initialValues={initialValues}
//                                     validate={validate(validationSchema)}
//                                     onSubmit={(values, { setSubmitting, setErrors, resetForm }) => {
//                                         this.addRow();
//                                         resetForm({
//                                             planningUnitId: "",
//                                             skuCode: "",
//                                             catalogPrice: "",
//                                             moq: "",
//                                             unitsPerPallet: "",
//                                             unitsPerContainer: "",
//                                             volume: "",
//                                             weight: ""
//                                         });
//                                     }}
//                                     render={
//                                         ({
//                                             values,
//                                             errors,
//                                             touched,
//                                             handleChange,
//                                             handleBlur,
//                                             handleSubmit,
//                                             isSubmitting,
//                                             isValid,
//                                             setTouched
//                                         }) => (
//                                                 <Form onSubmit={handleSubmit} noValidate name='procurementAgentPlanningUnitForm'>
//                                                     <Row>
//                                                         <FormGroup className="col-md-6">
//                                                             <Label htmlFor="select">{i18n.t('static.procurementagent.procurementagent')}<span className="red Reqasterisk">*</span></Label>
//                                                             <Input type="select" value={this.state.procurementAgentId} name="procurementAgentId" id="procurementAgentId" disabled>
//                                                                 {programs}
//                                                             </Input>
//                                                         </FormGroup>
//                                                         <FormGroup className="col-md-6">
//                                                             <Label htmlFor="select">{i18n.t('static.planningunit.planningunit')}<span className="red Reqasterisk">*</span></Label>
//                                                             <Input
//                                                                 type="select"
//                                                                 name="planningUnitId"
//                                                                 id="select"
//                                                                 bsSize="sm"
//                                                                 valid={!errors.planningUnitId && this.state.planningUnitId != ''}
//                                                                 invalid={touched.planningUnitId && !!errors.planningUnitId}
//                                                                 value={this.state.planningUnitId}
//                                                                 onBlur={handleBlur}
//                                                                 onChange={event => { handleChange(event); this.setTextAndValue(event) }}
//                                                                 required
//                                                             >
//                                                                 <option value="">Please select</option>
//                                                                 {products}
//                                                             </Input>
//                                                             <FormFeedback className="red">{errors.planningUnitId}</FormFeedback>
//                                                         </FormGroup>
//                                                         <FormGroup className="col-md-6">
//                                                             <Label htmlFor="company">{i18n.t('static.procurementAgentProcurementUnit.skuCode')}<span className="red Reqasterisk">*</span></Label>
//                                                             <Input
//                                                                 type="text"
//                                                                 name="skuCode"
//                                                                 id="skuCode"
//                                                                 value={this.state.skuCode}
//                                                                 // placeholder={i18n.t('static.procurementAgentProcurementUnit.skuCodeText')}
//                                                                 bsSize="sm"
//                                                                 valid={!errors.skuCode && this.state.skuCode != ''}
//                                                                 invalid={touched.skuCode && !!errors.skuCode}
//                                                                 onBlur={handleBlur}
//                                                                 onChange={event => { handleChange(event); this.setTextAndValue(event) }} />
//                                                             <FormFeedback className="red">{errors.skuCode}</FormFeedback>
//                                                         </FormGroup>
//                                                         <FormGroup className="col-md-6">
//                                                             <Label htmlFor="company">{i18n.t('static.procurementAgentPlanningUnit.catalogPrice')}<span className="red Reqasterisk">*</span></Label>
//                                                             <Input
//                                                                 type="number"
//                                                                 min="0"
//                                                                 name="catalogPrice"
//                                                                 id="catalogPrice"
//                                                                 value={this.state.catalogPrice}
//                                                                 // placeholder={i18n.t('static.procurementAgentPlanningUnit.catalogPriceText')}
//                                                                 bsSize="sm"
//                                                                 valid={!errors.catalogPrice && this.state.catalogPrice != ''}
//                                                                 invalid={touched.catalogPrice && !!errors.catalogPrice}
//                                                                 onBlur={handleBlur}
//                                                                 onChange={event => { handleChange(event); this.setTextAndValue(event) }} />
//                                                             <FormFeedback className="red">{errors.catalogPrice}</FormFeedback>
//                                                         </FormGroup>
//                                                         <FormGroup className="col-md-6">
//                                                             <Label htmlFor="company">{i18n.t('static.procurementAgentPlanningUnit.moq')}</Label>
//                                                             <Input
//                                                                 type="number"
//                                                                 min="0"
//                                                                 name="moq"
//                                                                 id="moq"
//                                                                 value={this.state.moq}
//                                                                 // placeholder={i18n.t('static.procurementAgentPlanningUnit.moqText')}
//                                                                 bsSize="sm"
//                                                                 valid={!errors.moq && this.state.moq != ''}
//                                                                 invalid={touched.moq && !!errors.moq}
//                                                                 onBlur={handleBlur}
//                                                                 onChange={event => { handleChange(event); this.setTextAndValue(event) }} />
//                                                             <FormFeedback className="red">{errors.moq}</FormFeedback>
//                                                         </FormGroup>
//                                                         <FormGroup className="col-md-6">
//                                                             <Label htmlFor="company">{i18n.t('static.procurementAgentPlanningUnit.unitPerPallet')}</Label>
//                                                             <Input
//                                                                 type="number"
//                                                                 min="0"
//                                                                 name="unitsPerPallet"
//                                                                 id="unitsPerPallet"
//                                                                 value={this.state.unitsPerPallet}
//                                                                 // placeholder={i18n.t('static.procurementAgentPlanningUnit.unitPerPalletText')}
//                                                                 bsSize="sm"
//                                                                 valid={!errors.unitsPerPallet && this.state.unitsPerPallet != ''}
//                                                                 invalid={touched.unitsPerPallet && !!errors.unitsPerPallet}
//                                                                 onBlur={handleBlur}
//                                                                 onChange={event => { handleChange(event); this.setTextAndValue(event) }} />
//                                                             <FormFeedback className="red">{errors.unitsPerPallet}</FormFeedback>
//                                                         </FormGroup>
//                                                         <FormGroup className="col-md-6">
//                                                             <Label htmlFor="company">{i18n.t('static.procurementAgentPlanningUnit.unitPerContainer')}</Label>
//                                                             <Input
//                                                                 type="number"
//                                                                 min="0"
//                                                                 name="unitsPerContainer"
//                                                                 id="unitsPerContainer"
//                                                                 value={this.state.unitsPerContainer}
//                                                                 // placeholder={i18n.t('static.procurementAgentPlanningUnit.unitPerContainerText')}
//                                                                 bsSize="sm"
//                                                                 valid={!errors.unitsPerContainer && this.state.unitsPerContainer != ''}
//                                                                 invalid={touched.unitsPerContainer && !!errors.unitsPerContainer}
//                                                                 onBlur={handleBlur}
//                                                                 onChange={event => { handleChange(event); this.setTextAndValue(event) }} />
//                                                             <FormFeedback className="red">{errors.unitsPerContainer}</FormFeedback>
//                                                         </FormGroup>
//                                                         <FormGroup className="col-md-6">
//                                                             <Label htmlFor="company">{i18n.t('static.procurementAgentPlanningUnit.volume')}</Label>
//                                                             <Input
//                                                                 type="number"
//                                                                 min="0"
//                                                                 name="volume"
//                                                                 id="volume"
//                                                                 value={this.state.volume}
//                                                                 // placeholder={i18n.t('static.procurementAgentPlanningUnit.volumeText')}
//                                                                 bsSize="sm"
//                                                                 valid={!errors.volume && this.state.volume != ''}
//                                                                 invalid={touched.volume && !!errors.volume}
//                                                                 onBlur={handleBlur}
//                                                                 onChange={event => { handleChange(event); this.setTextAndValue(event) }} />
//                                                             <FormFeedback className="red">{errors.volume}</FormFeedback>
//                                                         </FormGroup>
//                                                         <FormGroup className="col-md-6">
//                                                             <Label htmlFor="company">{i18n.t('static.procurementAgentPlanningUnit.weight')}</Label>
//                                                             <Input
//                                                                 type="number"
//                                                                 min="0"
//                                                                 name="weight"
//                                                                 id="weight"
//                                                                 value={this.state.weight}
//                                                                 // placeholder={i18n.t('static.procurementAgentPlanningUnit.weightText')}
//                                                                 bsSize="sm"
//                                                                 valid={!errors.weight && this.state.weight != ''}
//                                                                 invalid={touched.weight && !!errors.weight}
//                                                                 onBlur={handleBlur}
//                                                                 onChange={event => { handleChange(event); this.setTextAndValue(event) }} />
//                                                             <FormFeedback className="red">{errors.weight}</FormFeedback>
//                                                         </FormGroup>
//                                                         <FormGroup className="col-md-6 mt-md-4">
//                                                             {/* <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> Remove Last Row</Button> */}
//                                                             <Button type="submit" size="sm" color="success" onClick={() => this.touchAll(errors)} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
//                                                             &nbsp;
//                         </FormGroup></Row>
//                                                 </Form>
//                                             )} />
//                                 <h5 className="red">{this.state.rowErrorMessage}</h5>
//                                 <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

//                                     <thead>
//                                         <tr>

//                                             <th className="text-left"> Procurement Agent </th>
//                                             <th className="text-left"> Planing Unit</th>
//                                             <th className="text-left"> SKU Code </th>
//                                             <th className="text-left">Catlog Price </th>
//                                             <th className="text-left">MOQ </th>
//                                             <th className="text-left">Unit Per Pallet </th>
//                                             <th className="text-left">Unit Per Container </th>
//                                             <th className="text-left">Volume </th>
//                                             <th className="text-left">Weight </th>
//                                             <th className="text-left">Status</th>
//                                             <th className="text-left">Update</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>

//                                         {
//                                             this.state.rows.map((item, idx) => (
//                                                 <tr id="addr0" key={idx}>
//                                                     <td>
//                                                         {this.state.rows[idx].procurementAgent.label.label_en}
//                                                     </td>
//                                                     <td>
//                                                         {this.state.rows[idx].planningUnit.label.label_en}
//                                                     </td>
//                                                     <td>

//                                                         {this.state.rows[idx].skuCode}
//                                                     </td>
//                                                     <td>
//                                                         {this.state.rows[idx].catalogPrice}
//                                                     </td>
//                                                     <td>
//                                                         {this.state.rows[idx].moq}
//                                                     </td>
//                                                     <td>
//                                                         {this.state.rows[idx].unitsPerPallet}
//                                                     </td>
//                                                     <td>
//                                                         {this.state.rows[idx].unitsPerContainer}
//                                                     </td>
//                                                     <td>
//                                                         {this.state.rows[idx].volume}
//                                                     </td>
//                                                     <td>
//                                                         {this.state.rows[idx].weight}
//                                                     </td>
//                                                     <td>
//                                                         {/* <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} /> */}
//                                                         <StatusUpdateButtonFeature removeRow={this.handleRemoveSpecificRow} enableRow={this.enableRow} disableRow={this.disableRow} rowId={idx} status={this.state.rows[idx].active} isRowNew={this.state.rows[idx].isNew} />
//                                                     </td>
//                                                     <td className="updateTextwhitebtn">
//                                                         <UpdateButtonFeature updateRow={this.updateRow} rowId={idx} isRowNew={this.state.rows[idx].isNew} />
//                                                     </td>
//                                                 </tr>
//                                             ))
//                                         }

//                                     </tbody>
//                                     {/* <div id="loader" class="center"></div> */}
//                                 </Table>

//                             </CardBody>
//                             <CardFooter>
//                                 <FormGroup>
//                                     <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
//                                     <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
//                                     &nbsp;
//                                 </FormGroup>

//                             </CardFooter>
//                         </Card>
//                     </Col>
//                 </Row>
//             </div>

//         );
//     }
//     cancelClicked() {
//         this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
//     }
// }

//------------------------------------------------------------------------------
export default class AddProcurementAgentPlanningUnit extends Component {
    constructor(props) {
        super(props);
        let rows = [];
        this.state = {
            // procurementAgentPlanningUnit: this.props.location.state.procurementAgentPlanningUnit,
            planningUnitId: '',
            planningUnitName: '',
            skuCode: '',
            catalogPrice: '',
            moq: 0,
            unitsPerPallet: 0,
            unitsPerContainer: 0,
            volume: 0,
            weight: 0,

            rows: rows,
            procurementAgentList: [],
            planningUnitList: [],
            rowErrorMessage: '',

            procurementAgentPlanningUnitId: 0,
            isNew: true,
            procurementAgentId: this.props.match.params.procurementAgentId,
            updateRowStatus: 0,
            lang: localStorage.getItem('lang'),
            loading: true
        }
        this.options = props.options;
        this.addRow = this.addRow.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.checkDuplicatePlanningUnit = this.checkDuplicatePlanningUnit.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.changed = this.changed.bind(this);
    }
    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }


    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();

        ProcurementAgentService.getProcurementAgentPlaningUnitList(this.state.procurementAgentId)
            .then(response => {
                if (response.status == 200) {
                    console.log("getProcurementAgentPlaningUnitList--", response.data);
                    let myResponse = response.data;
                    if (myResponse.length > 0) {
                        this.setState({ rows: myResponse});
                    }

                    ProcurementAgentService.getProcurementAgentListAll()
                        .then(response => {
                            // console.log("ProcurementAgentService---",response.data);
                            if (response.status == "200") {
                                this.setState({
                                    procurementAgentList: response.data
                                });

                                PlanningUnitService.getActivePlanningUnitList()
                                    .then(response => {
                                        // console.log(response.data.data);
                                        if (response.status == 200) {
                                            this.setState({
                                                planningUnitList: response.data
                                            },
                                                () => {
                                                    //jexcel start
                                                    // const { procurementAgentList } = this.state;
                                                    // const { planningUnitList } = this.state;
                                                    // let programs = procurementAgentList.length > 0 && procurementAgentList.map((item, i) => {
                                                    //     return (
                                                    //         <option key={i} value={item.procurementAgentId}>
                                                    //             {getLabelText(item.label, this.state.lang)}
                                                    //         </option>
                                                    //     )
                                                    // }, this);
                                                    // let products = planningUnitList.length > 0 && planningUnitList.map((item, i) => {
                                                    //     return (
                                                    //         <option key={i} value={item.planningUnitId}>
                                                    //             {getLabelText(item.label, this.state.lang)}
                                                    //         </option>
                                                    //     )
                                                    // }, this);

                                                    const { procurementAgentList } = this.state;
                                                    const { planningUnitList } = this.state;

                                                    let programs = [];
                                                    let products = [];
                                                    let tempPlanningUnitArrayList = [];

                                                    if (procurementAgentList.length > 0) {
                                                        for (var i = 0; i < procurementAgentList.length; i++) {
                                                            var paJson = {
                                                                name: getLabelText(procurementAgentList[i].label, this.state.lang),
                                                                id: parseInt(procurementAgentList[i].procurementAgentId)
                                                            }
                                                            programs[i] = paJson
                                                        }
                                                    }

                                                    if (planningUnitList.length > 0) {
                                                        for (var i = 0; i < planningUnitList.length; i++) {
                                                            tempPlanningUnitArrayList[i] = planningUnitList[i].planningUnitId;
                                                            var puJson = {
                                                                name: getLabelText(planningUnitList[i].label, this.state.lang),
                                                                id: parseInt(planningUnitList[i].planningUnitId)
                                                            }
                                                            products[i] = puJson;

                                                        }
                                                    }

                                                    this.setState({
                                                        tempPlanningUnitArrayList: tempPlanningUnitArrayList
                                                    })

                                                    // console.log("tempPlanningUnitArrayList-----",tempPlanningUnitArrayList);
                                                    // console.log("procurementAgentList--",procurementAgentList);
                                                    // console.log("planningUnitList--",planningUnitList);

                                                    // console.log("11111procurementAgentList--",programs);
                                                    // console.log("111111planningUnitList--",products);



                                                    var papuList = this.state.rows;
                                                    var data = [];
                                                    var papuDataArr = []

                                                    var count = 0;
                                                    if (papuList.length != 0) {
                                                        for (var j = 0; j < papuList.length; j++) {


                                                            data = [];
                                                            data[0] = parseInt(papuList[j].procurementAgent.id);
                                                            data[1] = parseInt(papuList[j].planningUnit.id);
                                                            data[2] = papuList[j].skuCode;
                                                            data[3] = papuList[j].catalogPrice;
                                                            data[4] = papuList[j].moq;
                                                            data[5] = papuList[j].unitsPerPallet;
                                                            data[6] = papuList[j].unitsPerContainer;
                                                            data[7] = papuList[j].volume;
                                                            data[8] = papuList[j].weight;
                                                            data[9] = papuList[j].active;
                                                            data[10] = papuList[j].procurementAgentPlanningUnitId;
                                                            data[11] = 0;
                                                            papuDataArr[count] = data;
                                                            count++;


                                                        }
                                                    }

                                                    // console.log("inventory Data Array-->", papuDataArr);
                                                    if (papuDataArr.length == 0) {
                                                        data = [];
                                                        data[0] = this.props.match.params.procurementAgentId;
                                                        papuDataArr[0] = data;
                                                    }
                                                    this.el = jexcel(document.getElementById("paputableDiv"), '');
                                                    this.el.destroy();
                                                    var json = [];
                                                    var data = papuDataArr;

                                                    var options = {
                                                        data: data,
                                                        columnDrag: true,
                                                        colWidths: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
                                                        columns: [

                                                            {
                                                                title: "Procurement Agent",
                                                                type: 'dropdown',
                                                                source: programs,
                                                                readOnly: true
                                                            },
                                                            {
                                                                title: "Planing Unit",
                                                                type: 'autocomplete',
                                                                source: products

                                                            },
                                                            {
                                                                title: "SKU Code",
                                                                type: 'text',

                                                            },
                                                            {
                                                                title: "Catlog Price",
                                                                type: 'numeric',
                                                                // mask: '$ #.##,00',
                                                                // decimal: ',',
                                                            },
                                                            {
                                                                title: "MOQ",
                                                                type: 'number',
                                                            },
                                                            {
                                                                title: "Unit Per Pallet",
                                                                type: 'numeric',
                                                            },
                                                            {
                                                                title: "Unit Per Container",
                                                                type: 'numeric',
                                                            },
                                                            {
                                                                title: "Volume",
                                                                type: 'numeric',

                                                            },
                                                            {
                                                                title: "Weight",
                                                                type: 'numeric',
                                                            },
                                                            {
                                                                title: "Is Active",
                                                                type: 'checkbox'
                                                            },
                                                            {
                                                                title: 'procurementAgentId',
                                                                type: 'hidden'
                                                            },
                                                            {
                                                                title: 'isChange',
                                                                type: 'hidden'
                                                            }

                                                        ],
                                                        pagination: 10,
                                                        search: true,
                                                        columnSorting: true,
                                                        tableOverflow: true,
                                                        wordWrap: true,
                                                        paginationOptions: [10, 25, 50, 100],
                                                        position: 'top',
                                                        allowInsertColumn: false,
                                                        allowManualInsertColumn: false,
                                                        allowDeleteRow: false,
                                                        onchange: this.changed,
                                                        oneditionend: this.onedit,
                                                        copyCompatibility: true,
                                                        text: {
                                                            showingPage: `${i18n.t('static.jexcel.showing')} {0} ${i18n.t('static.jexcel.to')} {1} ${i18n.t('static.jexcel.of')} {1}`,
                                                            show: '',
                                                            entries: '',
                                                        },
                                                        // onload: this.loaded,

                                                    };

                                                    this.el = jexcel(document.getElementById("paputableDiv"), options);
                                                    this.setState({
                                                        loading: false
                                                    })

                                                });
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


    addRow = function () {
        var json = this.el.getJson();
        var data = [];
        data[0] = this.props.match.params.procurementAgentId;
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = "";
        data[6] = "";
        data[7] = "";
        data[8] = "";
        data[9] = true;
        data[10] = 0;
        data[11] = 1;

        this.el.insertRow(
            data, 0, 1
        );
    };

    formSubmit = function () {
        var duplicateValidation = this.checkDuplicatePlanningUnit();
        var validation = this.checkValidation();

        if (validation == true && duplicateValidation == true) {
            var tableJson = this.el.getJson();
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("11")) === 1) {
                    let json = {
                        planningUnit: {
                            id: parseInt(map1.get("1")),
                        },
                        procurementAgent: {
                            id: parseInt(map1.get("0")),
                        },
                        skuCode: map1.get("2"),
                        catalogPrice: map1.get("3"),
                        moq: map1.get("4"),
                        unitsPerPallet: map1.get("5"),
                        unitsPerContainer: map1.get("6"),
                        volume: map1.get("7"),
                        weight: map1.get("8"),
                        active: map1.get("9"),
                        procurementAgentPlanningUnitId: parseInt(map1.get("10"))
                    }
                    changedpapuList.push(json);
                }
            }
            console.log("FINAL SUBMIT changedpapuList---", changedpapuList);
            ProcurementAgentService.addprocurementAgentPlanningUnitMapping(changedpapuList)
                .then(response => {
                    console.log(response.data);
                    if (response.status == "200") {
                        console.log(response);
                        this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))
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



        } else {
            console.log("Something went wrong");
        }
    }

    checkDuplicatePlanningUnit = function () {
        var tableJson = this.el.getJson();
        let count = 0;

        let tempArray = tableJson;
        console.log('hasDuplicate------', tempArray);

        var hasDuplicate = false;
        tempArray.map(v => parseInt(v[Object.keys(v)[1]])).sort().sort((a, b) => {
            if (a === b) hasDuplicate = true
        })
        console.log('hasDuplicate', hasDuplicate);
        if (hasDuplicate) {
            this.setState({
                message: 'Duplicate Planning Unit Details Found',
                changedFlag: 0
            })
            return false;
        } else {
            return true;
        }



        // for (var i = 0; i < tableJson.length; i++) {

        //     count = 0;
        //     var map = new Map(Object.entries(tableJson[i]));

        //     for (var j = 0; j < tableJson.length; j++) {

        //         var map1 = new Map(Object.entries(tableJson[j]));

        //         if (parseInt(map.get("1")) === parseInt(map1.get("1"))) {
        //             count++;
        //         }
        //         if (count > 1) {
        //             i = tableJson.length;
        //             break;
        //         }
        //     }
        // }
        // if (count > 1) {
        //     this.setState({
        //         message: 'Duplicate Planning Unit Details Found',
        //         changedFlag: 0
        //     })
        //     return false;
        // } else {
        //     return true;
        // }
    }

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    // -----------start of changed function
    changed = function (instance, cell, x, y, value) {
        //     $("#saveButtonDiv").show();
        this.setState({
            changedFlag: 1
        })

        //planning unit
        if (x == 1) {
            var col = ("B").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }

        //sku code
        if (x == 2) {
            var col = ("C").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setComments(col, "");
            }
        }


        //catelog price
        if (x == 3) {
            var col = ("D").concat(parseInt(y) + 1);
            var reg = /^[0-9\b]+$/;
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
        }

        //moq
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
            var reg = /^[0-9\b]+$/;
            if (this.el.getValueFromCoords(x, y) != "") {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

        //unit per pallet
        if (x == 5) {
            var col = ("F").concat(parseInt(y) + 1);
            var reg = /^[0-9\b]+$/;
            if (this.el.getValueFromCoords(x, y) != "") {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

        //unit per container
        if (x == 6) {
            var col = ("G").concat(parseInt(y) + 1);
            var reg = /^[0-9\b]+$/;
            if (this.el.getValueFromCoords(x, y) != "") {
                if (isNaN(parseInt(value)) || !(reg.test(value))) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }

        //volume
        if (x == 7) {
            var col = ("H").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
        }

        //weight
        if (x == 8) {
            var col = ("I").concat(parseInt(y) + 1);
            if (value == "") {
                this.el.setStyle(col, "background-color", "transparent");
                this.el.setStyle(col, "background-color", "yellow");
                this.el.setComments(col, i18n.t('static.label.fieldRequired'));
            } else {
                if (isNaN(Number.parseInt(value)) || value < 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

            }
        }

    }.bind(this);
    // -----end of changed function

    onedit = function (instance, cell, x, y, value) {
        this.el.setValueFromCoords(11, y, 1, true);
    }.bind(this);


    checkValidation() {
        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {
            var col = ("L").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(11, y);
            if (parseInt(value) == 1) {

                //planning unit
                var col = ("B").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(1, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //sku code
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //price catelog
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(3, y);
                var reg = /^[0-9\b]+$/;
                // console.log("---------VAL----------", value);
                if (value == "" || isNaN(Number.parseFloat(value)) || value < 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || value < 0) {
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    }
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //MOQ
                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(4, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

                //unitPerPallet
                var col = ("F").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(5, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

                //unitPerContainer
                var col = ("G").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(6, y);
                if (value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    if (isNaN(parseInt(value)) || !(reg.test(value))) {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setStyle(col, "background-color", "yellow");
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                        valid = false;
                    } else {
                        this.el.setStyle(col, "background-color", "transparent");
                        this.el.setComments(col, "");
                    }
                }

                //volume
                var col = ("H").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(7, y);
                if (value == "" || isNaN(Number.parseFloat(value)) || value < 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || value < 0) {
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    }
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //weight
                var col = ("I").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(8, y);
                if (value == "" || isNaN(Number.parseFloat(value)) || value < 0) {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    valid = false;
                    if (isNaN(Number.parseInt(value)) || value < 0) {
                        this.el.setComments(col, i18n.t('static.message.invalidnumber'));
                    } else {
                        this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    }
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }
            }
        }
        return valid;
    }


    render() {
        return (

            <div className="animated fadeIn">
                {/* <AuthenticationServiceComponent history={this.props.history} message={(message) => {
                    this.setState({ message: message })
                }} /> */}
                <h5>{i18n.t(this.props.match.params.message, { entityname })}</h5>
                <h5>{i18n.t(this.state.message, { entityname })}</h5>
                <div style={{ display: this.state.loading ? "none" : "block" }}>
                    <Card>

                        <CardHeader>
                            <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                        </CardHeader>
                        <CardBody className="p-0">

                            <Col xs="12" sm="12">
                                <div className="table-responsive">
                                    <div id="paputableDiv" >
                                    </div>
                                </div>
                            </Col>
                        </CardBody>
                        <CardFooter>
                            <FormGroup>
                                <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
                                <Button type="submit" size="md" color="success" onClick={this.formSubmit} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                                <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> Add Row</Button>
        &nbsp;
    </FormGroup>
                        </CardFooter>
                    </Card>
                </div>


                <Row style={{ display: this.state.loading ? "block" : "none" }}>
                    <div className="d-flex align-items-center justify-content-center" style={{ height: "500px" }} >
                        <div class="align-items-center">
                            <div ><h4> <strong>Loading...</strong></h4></div>

                            <div class="spinner-border blue ml-4" role="status">

                            </div>
                        </div>
                    </div>
                </Row>


            </div >
        );
    }

    cancelClicked() {
        this.props.history.push(`/procurementAgent/listProcurementAgent/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }

}

