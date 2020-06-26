// import React, { Component } from "react";
// import {
//     Card, CardBody, CardHeader,
//     Label, Input, FormGroup,
//     CardFooter, Button, Table, Col, Row, FormFeedback, Form

// } from 'reactstrap';
// import { Date } from 'core-js';
// import { Formik } from 'formik';
// import * as Yup from 'yup'
// import i18n from '../../i18n'
// import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
// import getLabelText from '../../CommonComponent/getLabelText';
// import SupplierService from "../../api/SupplierService";
// import AuthenticationService from "../Common/AuthenticationService";
// import PlanningUnitService from "../../api/PlanningUnitService";
// import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
// import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature'
// let initialValues = {
//     startDate: '',
//     stopDate: '',
//     supplier: [],
//     capacity: ''

// }
// const entityname = i18n.t('static.dashboad.planningunitcapacity')
// const validationSchema = function (values, t) {
//     return Yup.object().shape({
//         supplier: Yup.string()
//             .required(i18n.t('static.planningunit.suppliertext')),
//         capacity: Yup.number()
//             .required(i18n.t('static.planningunit.capacitytext')).min(0, i18n.t('static.program.validvaluetext')),
//         startDate: Yup.string()
//             .required(i18n.t('static.budget.startdatetext')),
//         stopDate: Yup.string()
//             .required(i18n.t('static.budget.stopdatetext'))
//     })
// }

// const validate = (getValidationSchema) => {
//     return (values) => {
//         const validationSchema = getValidationSchema(values, i18n.t)
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

// class PlanningUnitCapacity extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             lang: localStorage.getItem('lang'),
//             planningUnitCapacity: {},
//             planningUnitCapacityId: '',
//             suppliers: [],
//             supplier: {
//                 supplierId: '',
//                 label: {
//                     label_en: ''
//                 }
//             }, supplierName: '',
//             capacity: '',
//             startDate: '',
//             stopDate: '',
//             rows: [],
//             planningUnit: {
//                 planningUnitId: '',
//                 label: {
//                     label_en: ''
//                 }
//             }, isNew: true,
//             updateRowStatus: 0
//         }
//         this.currentDate = this.currentDate.bind(this);
//         this.setTextAndValue = this.setTextAndValue.bind(this);
//         this.deleteLastRow = this.deleteLastRow.bind(this);
//         this.disableRow = this.disableRow.bind(this);
//         this.submitForm = this.submitForm.bind(this);
//         this.enableRow = this.enableRow.bind(this);
//         this.cancelClicked = this.cancelClicked.bind(this);
//         this.handleRemoveSpecificRow = this.handleRemoveSpecificRow.bind(this);
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
//             console.log(JSON.stringify(this.state.rows[idx]))
//             initialValues = {
//                 planningUnitCapacityId: this.state.rows[idx].planningUnitCapacityId,
//                 supplierId: this.state.rows[idx].supplier.id,
//                 supplier: {
//                     supplierId: this.state.rows[idx].supplier.id,
//                     label: {
//                         label_en: this.state.rows[idx].supplier.label.label_en
//                     }
//                 },
//                 startDate: this.state.rows[idx].startDate,
//                 stopDate: this.state.rows[idx].stopDate,
//                 gtin: this.state.rows[idx].gtin,
//                 capacity: this.state.rows[idx].capacity
//             }
//             const rows = [...this.state.rows]
//             this.setState({
//                 planningUnitCapacityId: this.state.rows[idx].planningUnitCapacityId,
//                 supplierId: this.state.rows[idx].supplier.id,
//                 supplier: {
//                     supplierId: this.state.rows[idx].supplier.id,
//                     label: {
//                         label_en: this.state.rows[idx].supplier.label.label_en
//                     }
//                 },
//                 startDate: this.state.rows[idx].startDate,
//                 stopDate: this.state.rows[idx].stopDate,
//                 gtin: this.state.rows[idx].gtin,
//                 capacity: this.state.rows[idx].capacity,
//                 isNew: false,
//                 updateRowStatus: 1
//             }
//             );

//             rows.splice(idx, 1);
//             this.setState({ rows });
//         }
//     }





//     currentDate() {
//         var todaysDate = new Date();
//         var yyyy = todaysDate.getFullYear().toString();
//         var mm = (todaysDate.getMonth() + 1).toString();
//         var dd = todaysDate.getDate().toString();
//         var mmChars = mm.split('');
//         var ddChars = dd.split('');
//         let date = yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
//         // console.log("------date", date)
//         return date;
//     }
//     touchAll(setTouched, errors) {
//         setTouched({
//             supplier: true,
//             startDate: true,
//             stopDate: true,
//             capacity: true,

//         }
//         )
//         this.validateForm(errors)
//     }
//     validateForm(errors) {
//         this.findFirstError('capacityForm', (fieldName) => {
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

//     setTextAndValue = (event) => {
//         // let { budget } = this.state;
//         console.log(event.target.name, event.target.value)
//         if (event.target.name === "supplier") {
//             this.state.supplier.supplierId = event.target.value;
//             this.state.supplier.label.label_en = event.target[event.target.selectedIndex].text;
//         }
//         if (event.target.name === "capacity") {
//             this.state.capacity = event.target.value;
//         }
//         if (event.target.name === "startDate") {
//             this.state.startDate = event.target.value;

//         }
//         if (event.target.name === "stopDate") {
//             this.state.stopDate = event.target.value;
//         }
//         console.log(JSON.stringify(this.state.supplier))

//     }


//     deleteLastRow() {
//         const rows = [...this.state.rows]
//         /*  rows[this.state.rows.length - 1].active=false
//           var row=   rows.slice(-1).pop();
//           rows.push(row);*/
//         this.setState({
//             rows
//         });
//     }
//     disableRow(idx) {
//         const rows = [...this.state.rows]
//         rows[idx].active = false
//         // rows.splice(idx, 1);
//         this.setState({ rows })
//     }
//     handleRemoveSpecificRow(idx) {
//         const rows = [...this.state.rows]
//         rows.splice(idx, 1);
//         this.setState({ rows })
//     }
//     enableRow(idx) {
//         const rows = [...this.state.rows]
//         rows[idx].active = true
//         // rows.splice(idx, 1);
//         this.setState({ rows })
//     }

//     submitForm() {
//         console.log(JSON.stringify(this.state))
//         var planningUnitCapacity = this.state.rows
//         console.log("planningUnitCapacity------",planningUnitCapacity);


//         AuthenticationService.setupAxiosInterceptors();
//         PlanningUnitService.editPlanningUnitCapacity(planningUnitCapacity)
//             .then(response => {
//                 if (response.status == 200) {
//                     this.props.history.push(`/planningUnit/listPlanningUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))

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
//                                 this.setState({ message: error.response.messageCode });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 break;
//                         }
//                     }
//                 }
//             );



//     }
//     componentDidMount() {
//         AuthenticationService.setupAxiosInterceptors();
//         PlanningUnitService.getPlanningUnitById(this.props.match.params.planningUnitId).then(response => {
//             if (response.status == 200) {
//                 console.log(response.data);
//                 this.setState({
//                     planningUnit: response.data,
//                     //  rows:response.data
//                 })
//             }
//             else {
//                 this.setState({
//                     message: response.data.messageCode
//                 },
//                     () => {
//                         this.hideSecondComponent();
//                     })
//             }

//         }).catch(
//             error => {
//                 console.log(JSON.stringify(error))
//                 if (error.message === "Network Error") {
//                     this.setState({ message: error.message });
//                 } else {
//                     switch (error.response ? error.response.status : "") {
//                         case 500:
//                         case 401:
//                         case 404:
//                         case 406:
//                         case 412:
//                             this.setState({ message: error.response.messageCode });
//                             break;
//                         default:
//                             this.setState({ message: 'static.unkownError' });
//                             console.log("Error code unkown");
//                             break;
//                     }
//                 }
//             }
//         );
//         PlanningUnitService.getPlanningUnitCapacityForId(this.props.match.params.planningUnitId).then(response => {
//             if (response.status == 200) {
//                 console.log(response.data);
//                 this.setState({
//                     planningUnitCapacity: response.data,
//                     rows: response.data
//                 })
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
//         SupplierService.getSupplierListAll()
//             .then(response => {
//                 if (response.status == 200) {
//                     console.log(response.data)
//                     this.setState({
//                         suppliers: response.data
//                     })
//                 }else {
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
//                         switch (error.response.status) {
//                             case 500:
//                             case 401:
//                             case 404:
//                             case 406:
//                             case 412:
//                                 this.setState({ message: error.response.messageCode });
//                                 break;
//                             default:
//                                 this.setState({ message: 'static.unkownError' });
//                                 break;
//                         }
//                     }
//                 }
//             );

//     }
//     render() {
//         const { suppliers } = this.state;
//         let supplierList = suppliers.length > 0 && suppliers.map((item, i) => {
//             return (
//                 <option key={i} value={item.supplierId}>
//                     {getLabelText(item.label, this.state.lang)}
//                 </option>
//             )
//         }, this);
//         return (<div className="animated fadeIn">
//             <h5 style={{ color: "red" }} id="div2">{i18n.t(this.state.message)}</h5>
//             <Row>
//                 <Col sm={12} md={12} style={{ flexBasis: 'auto' }}>
//                     <Card>
//                         <CardHeader>
//                             <strong>{i18n.t('static.dashboad.planningunitcapacity')}</strong>
//                         </CardHeader>
//                         <CardBody>
//                             <Formik
//                                 enableReinitialize={true}
//                                 initialValues={initialValues}
//                                 validate={validate(validationSchema)}
//                                 onSubmit={(values, { setSubmitting, setErrors, resetForm }) => {
//                                     if (this.state.supplier.supplierId != "" && this.state.startDate != "" && this.state.stopDate != "" && this.state.capacity != "") {
//                                         var json =
//                                         {
//                                             planningUnitCapacityId: this.state.planningUnitCapacityId,
//                                             planningUnit: {
//                                                 id: this.props.match.params.planningUnitId
//                                             }
//                                             ,
//                                             supplier: {
//                                                 id: this.state.supplier.supplierId,
//                                                 label: {
//                                                     label_en: this.state.supplier.label.label_en
//                                                 }
//                                             }
//                                             ,
//                                             startDate: this.state.startDate,

//                                             stopDate: this.state.stopDate,

//                                             capacity: this.state.capacity,
//                                             isNew: this.state.isNew,
//                                             active: true

//                                         }
//                                         this.state.rows.push(json)
//                                         this.setState({ rows: this.state.rows, updateRowStatus: 0 })
//                                         this.setState({
//                                             planningUnitCapacityId: '',

//                                             supplier: {
//                                                 supplierId: '',
//                                                 label: {
//                                                     label_en: ''
//                                                 }
//                                             }
//                                             ,
//                                             startDate: '',

//                                             stopDate: '',

//                                             capacity: '',
//                                             active: true


//                                         });
//                                     }
//                                     resetForm({
//                                         planningUnitCapacityId: '',
//                                         planningUnit: {
//                                             id: this.props.match.params.planningUnitId
//                                         }
//                                         ,
//                                         supplier: {
//                                             supplierId: '',
//                                             label: {
//                                                 label_en: ''
//                                             }
//                                         }
//                                         ,
//                                         startDate: '',

//                                         stopDate: '',

//                                         capacity: '',
//                                         active: true


//                                     });

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
//                                     }) => (<Form onSubmit={handleSubmit} noValidate name='capacityForm'>
//                                         <Row>
//                                             <FormGroup className="col-md-6">
//                                                 <Label htmlFor="select">{i18n.t('static.planningunit.planningunit')}</Label>
//                                                 <Input
//                                                     type="text"
//                                                     name="planningUnitId"
//                                                     id="progplanningUnitIdramId"
//                                                     bsSize="sm"
//                                                     readOnly
//                                                     valid={!errors.planningUnitId && this.state.planningUnit.label != ''}
//                                                     invalid={touched.planningUnitId && !!errors.planningUnitId}
//                                                     onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
//                                                     onBlur={handleBlur}

//                                                     value={getLabelText(this.state.planningUnit.label, this.state.lang)}
//                                                 >
//                                                 </Input>
//                                             </FormGroup>
//                                             <FormGroup className="col-md-6">
//                                                 <Label htmlFor="select">{i18n.t('static.supplier.supplier')}</Label>
//                                                 <Input type="select" name="supplier" id="supplier" bsSize="sm"
//                                                     valid={!errors.supplier && this.state.supplier.supplierId != ''}
//                                                     invalid={touched.realmId && !!errors.supplier}
//                                                     onBlur={handleBlur}
//                                                     onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
//                                                     value={this.state.supplier.supplierId} required>
//                                                     <option value="">{i18n.t('static.common.select')}</option>
//                                                     {supplierList}
//                                                 </Input> <FormFeedback className="red">{errors.supplier}</FormFeedback>
//                                             </FormGroup>
//                                             <FormGroup className="col-md-6">
//                                                 <Label for="startDate">{i18n.t('static.common.startdate')}</Label>
//                                                 <Input
//                                                     className="fa fa-calendar Fa-right"
//                                                     name="startDate"
//                                                     id="startDate"
//                                                     type="date"
//                                                     bsSize="sm"
//                                                     valid={!errors.startDate && this.state.startDate != ''}
//                                                     invalid={touched.startDate && !!errors.startDate}
//                                                     onBlur={handleBlur}
//                                                     min={this.currentDate()}
//                                                     onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
//                                                     value={this.state.startDate}
//                                                     // placeholder={i18n.t('static.budget.budgetstartdate')}
//                                                     required />
//                                                 <FormFeedback className="red">{errors.startDate}</FormFeedback>
//                                             </FormGroup>
//                                             <FormGroup className="col-md-6">
//                                                 <Label for="stopDate">{i18n.t('static.common.stopdate')}</Label>
//                                                 <Input

//                                                     className="fa fa-calendar Fa-right"
//                                                     name="stopDate"
//                                                     id="stopDate"
//                                                     bsSize="sm"
//                                                     type="date"
//                                                     valid={!errors.stopDate && this.state.stopDate != ''}
//                                                     invalid={touched.stopDate && !!errors.stopDate}
//                                                     onBlur={handleBlur}
//                                                     min={this.state.startDate}
//                                                     onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
//                                                     value={this.state.stopDate}
//                                                     // placeholder={i18n.t('static.budget.budgetstopdate')}
//                                                     required /> <FormFeedback className="red">{errors.stopDate}</FormFeedback>

//                                             </FormGroup>
//                                             <FormGroup className="col-md-6">
//                                                 <Label for="capacity">{i18n.t('static.planningunit.capacity')}</Label>
//                                                 <Input

//                                                     type="number"
//                                                     min="0"
//                                                     name="capacity"
//                                                     id="capacity"
//                                                     bsSize="sm"
//                                                     valid={!errors.capacity && this.state.capacity != ''}
//                                                     invalid={touched.capacity && !!errors.capacity}
//                                                     onBlur={handleBlur}
//                                                     onChange={(e) => { handleChange(e); this.setTextAndValue(e) }}
//                                                     value={this.state.capacity}
//                                                     type="number"
//                                                     // placeholder={i18n.t('static.planningunit.capacitytext')}
//                                                     required />
//                                                 <FormFeedback className="red">{errors.capacity}</FormFeedback>
//                                             </FormGroup>

//                                             <FormGroup className="col-md-6 mt-md-4" >
//                                                 {/* <Button type="button" size="sm" color="danger" onClick={this.deleteLastRow} className="float-right mr-1" ><i className="fa fa-times"></i> {i18n.t('static.common.rmlastrow')}</Button>*/}
//                                                 <Button type="submit" size="sm" color="success" onClick={() => this.touchAll(setTouched, errors)} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.add')}</Button>
//                                                 &nbsp;


//                 </FormGroup></Row></Form>)} />

//                             <h5 className="red">{this.state.rowErrorMessage}</h5>

//                             <Table responsive className="table-striped table-hover table-bordered text-center mt-2">

//                                 <thead>
//                                     <tr>
//                                         <th className="text-center"> {i18n.t('static.supplier.supplier')} </th>
//                                         <th className="text-center"> {i18n.t('static.common.startdate')}</th>
//                                         <th className="text-center"> {i18n.t('static.common.stopdate')} </th>
//                                         <th className="text-center">{i18n.t('static.planningunit.capacity')}</th>
//                                         <th className="text-center">{i18n.t('static.common.status')}</th>
//                                         <th className="text-center">{i18n.t('static.common.action')}</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {
//                                         this.state.rows.length > 0
//                                         &&
//                                         this.state.rows.map((item, idx) =>
//                                             <tr id="addr0" key={idx} >
//                                                 <td>
//                                                     {this.state.rows[idx].supplier.label.label_en}
//                                                 </td>
//                                                 <td>

//                                                     {this.state.rows[idx].startDate}
//                                                 </td>
//                                                 <td>
//                                                     {this.state.rows[idx].stopDate}
//                                                 </td>
//                                                 <td>
//                                                     {this.state.rows[idx].capacity}
//                                                 </td>
//                                                 <td>
//                                                     {this.state.rows[idx].active ? i18n.t('static.common.active') : i18n.t('static.common.disabled')}
//                                                 </td>
//                                                 <td>
//                                                     {/* <DeleteSpecificRow handleRemoveSpecificRow={this.handleRemoveSpecificRow} rowId={idx} /> */}
//                                                     <StatusUpdateButtonFeature removeRow={this.handleRemoveSpecificRow} enableRow={this.enableRow} disableRow={this.disableRow} rowId={idx} status={this.state.rows[idx].active} isRowNew={this.state.rows[idx].isNew} />

//                                                     <UpdateButtonFeature updateRow={this.updateRow} rowId={idx} isRowNew={this.state.rows[idx].isNew} />
//                                                 </td>
//                                             </tr>)

//                                     }
//                                 </tbody>

//                             </Table>
//                         </CardBody>
//                         <CardFooter>
//                             <FormGroup>
//                                 <Button type="button" size="md" color="danger" className="float-right mr-1" onClick={this.cancelClicked}><i className="fa fa-times"></i> {i18n.t('static.common.cancel')}</Button>
//                                 {/*this.state.rows.length > 0 &&*/ <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>}
//                                 &nbsp;
//                         </FormGroup>

//                         </CardFooter>
//                     </Card>
//                 </Col>
//             </Row>
//         </div>

//         );
//     }
//     cancelClicked() {
//         this.props.history.push(`/planningUnit/listPlanningUnit/`+ 'red/' + i18n.t('static.message.cancelled', { entityname }))
//     }
// }

// export default PlanningUnitCapacity

//MyPage

import React, { Component } from "react";
import {
    Card, CardBody, CardHeader,
    Label, Input, FormGroup,
    CardFooter, Button, Table, Col, Row, FormFeedback, Form

} from 'reactstrap';
import { Date } from 'core-js';
import { Formik } from 'formik';
import * as Yup from 'yup'
import i18n from '../../i18n'
import DeleteSpecificRow from '../ProgramProduct/TableFeatureTwo';
import getLabelText from '../../CommonComponent/getLabelText';
import SupplierService from "../../api/SupplierService";
import AuthenticationService from "../Common/AuthenticationService";
import PlanningUnitService from "../../api/PlanningUnitService";
import StatusUpdateButtonFeature from "../../CommonComponent/StatusUpdateButtonFeature";
import UpdateButtonFeature from '../../CommonComponent/UpdateButtonFeature';

import CryptoJS from 'crypto-js';
import jexcel from 'jexcel';
import "../../../node_modules/jexcel/dist/jexcel.css";
import moment from "moment";
import { jExcelLoadedFunction } from '../../CommonComponent/JExcelCommonFunctions.js';

let initialValues = {
    startDate: '',
    stopDate: '',
    supplier: [],
    capacity: ''

}
const entityname = i18n.t('static.dashboad.planningunitcapacity')
// const validationSchema = function (values, t) {
//     return Yup.object().shape({
//         supplier: Yup.string()
//             .required(i18n.t('static.planningunit.suppliertext')),
//         capacity: Yup.number()
//             .required(i18n.t('static.planningunit.capacitytext')).min(0, i18n.t('static.program.validvaluetext')),
//         startDate: Yup.string()
//             .required(i18n.t('static.budget.startdatetext')),
//         stopDate: Yup.string()
//             .required(i18n.t('static.budget.stopdatetext'))
//     })
// }

class PlanningUnitCapacity extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lang: localStorage.getItem('lang'),
            planningUnitCapacity: {},
            planningUnitCapacityId: '',
            suppliers: [],
            supplier: {
                supplierId: '',
                label: {
                    label_en: ''
                }
            }, supplierName: '',
            capacity: '',
            startDate: '',
            stopDate: '',
            rows: [],
            planningUnit: {
                planningUnitId: '',
                label: {
                    label_en: ''
                }
            }, isNew: true,
            updateRowStatus: 0
        }
        this.currentDate = this.currentDate.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.cancelClicked = this.cancelClicked.bind(this);
        this.hideSecondComponent = this.hideSecondComponent.bind(this);
        this.addRow = this.addRow.bind(this);
        this.checkValidation = this.checkValidation.bind(this);
    }

    hideSecondComponent() {
        setTimeout(function () {
            document.getElementById('div2').style.display = 'none';
        }, 8000);
    }

    currentDate() {
        var todaysDate = new Date();
        var yyyy = todaysDate.getFullYear().toString();
        var mm = (todaysDate.getMonth() + 1).toString();
        var dd = todaysDate.getDate().toString();
        var mmChars = mm.split('');
        var ddChars = dd.split('');
        let date = yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
        // console.log("------date", date)
        return date;
    }

    submitForm() {
        var validation = this.checkValidation();
        console.log("validation************",validation);
        if (validation) {
            var tableJson = this.el.getJson();
            let changedpapuList = [];
            for (var i = 0; i < tableJson.length; i++) {
                var map1 = new Map(Object.entries(tableJson[i]));
                if (parseInt(map1.get("7")) === 1) {
                    let json = {
                        planningUnitCapacityId: parseInt(map1.get("6")),
                        planningUnit: {
                            id: this.props.match.params.planningUnitId
                        }
                        ,
                        supplier: {
                            id: parseInt(map1.get("1")),
                            // label: {
                            //     label_en: this.state.supplier.label.label_en
                            // }
                        }
                        ,
                        startDate: map1.get("2"),

                        stopDate: map1.get("3"),

                        capacity: map1.get("4"),
                        active: map1.get("5"),
                    }
                    changedpapuList.push(json);
                }
            }

            AuthenticationService.setupAxiosInterceptors();
            PlanningUnitService.editPlanningUnitCapacity(changedpapuList)
                .then(response => {
                    if (response.status == 200) {
                        this.props.history.push(`/planningUnit/listPlanningUnit/` + 'green/' + i18n.t(response.data.messageCode, { entityname }))

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
                                    this.setState({ message: error.response.messageCode });
                                    break;
                                default:
                                    this.setState({ message: 'static.unkownError' });
                                    break;
                            }
                        }
                    }
                );

        } else {
            console.log("Something went wrong");
        }



    }
    componentDidMount() {
        AuthenticationService.setupAxiosInterceptors();
        PlanningUnitService.getPlanningUnitById(this.props.match.params.planningUnitId).then(response => {
            if (response.status == 200) {
                console.log(response.data);
                this.setState({
                    planningUnit: response.data,
                    //  rows:response.data
                })

                PlanningUnitService.getPlanningUnitCapacityForId(this.props.match.params.planningUnitId).then(response => {
                    if (response.status == 200) {
                        console.log(response.data);
                        this.setState({
                            planningUnitCapacity: response.data,
                            rows: response.data
                        })


                        SupplierService.getSupplierListAll()
                            .then(response => {
                                if (response.status == 200) {
                                    console.log(response.data)
                                    this.setState({
                                        suppliers: response.data
                                    },
                                        () => {
                                            const { suppliers } = this.state;
                                            let supplierList = [];
                                            if (suppliers.length > 0) {
                                                for (var i = 0; i < suppliers.length; i++) {
                                                    var paJson = {
                                                        name: getLabelText(suppliers[i].label, this.state.lang),
                                                        id: parseInt(suppliers[i].supplierId)
                                                    }
                                                    supplierList[i] = paJson
                                                }
                                            }

                                            var papuList = this.state.rows;
                                            var data = [];
                                            var papuDataArr = []

                                            var count = 0;
                                            if (papuList.length != 0) {
                                                for (var j = 0; j < papuList.length; j++) {


                                                    data = [];
                                                    data[0] = getLabelText(this.state.planningUnit.label, this.state.lang);
                                                    data[1] = parseInt(papuList[j].supplier.id);
                                                    data[2] = papuList[j].startDate;
                                                    data[3] = papuList[j].stopDate;
                                                    data[4] = papuList[j].capacity;
                                                    data[5] = papuList[j].active;
                                                    data[6] = papuList[j].planningUnitId;
                                                    data[7] = 0;
                                                    papuDataArr[count] = data;
                                                    count++;


                                                }
                                            }

                                            // console.log("inventory Data Array-->", papuDataArr);
                                            if (papuDataArr.length == 0) {
                                                // data = [];
                                                // papuDataArr[0] = data;
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
                                                        title: "Planning Unit",
                                                        type: 'text',
                                                        readOnly: true
                                                    },
                                                    {
                                                        title: "Supplier",
                                                        type: 'autocomplete',
                                                        source: supplierList

                                                    },
                                                    {
                                                        title: "Start Date",
                                                        type: 'calendar',
                                                        options: {
                                                            format: 'YYYY-MM-DD'
                                                        }

                                                    },
                                                    {
                                                        title: "End Date",
                                                        type: 'calendar',
                                                        options: {
                                                            format: 'YYYY-MM-DD'
                                                        }
                                                    },
                                                    {
                                                        title: "Capacity",
                                                        type: 'number',
                                                    },
                                                    {
                                                        title: "Is Active",
                                                        type: 'checkbox'
                                                    },
                                                    {
                                                        title: 'planningUnitId',
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
                                        this.setState({ message: error.message });
                                    } else {
                                        switch (error.response.status) {
                                            case 500:
                                            case 401:
                                            case 404:
                                            case 406:
                                            case 412:
                                                this.setState({ message: error.response.messageCode });
                                                break;
                                            default:
                                                this.setState({ message: 'static.unkownError' });
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
                console.log(JSON.stringify(error))
                if (error.message === "Network Error") {
                    this.setState({ message: error.message });
                } else {
                    switch (error.response ? error.response.status : "") {
                        case 500:
                        case 401:
                        case 404:
                        case 406:
                        case 412:
                            this.setState({ message: error.response.messageCode });
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

        var data = [];
        data[0] = getLabelText(this.state.planningUnit.label, this.state.lang);
        data[1] = "";
        data[2] = "";
        data[3] = "";
        data[4] = "";
        data[5] = true;
        data[6] = 0;
        data[7] = 1;
        this.el.insertRow(
            data, 0, 1
        );
    };

    changed = function (instance, cell, x, y, value) {
        //     $("#saveButtonDiv").show();
        this.setState({
            changedFlag: 1
        })

        //Supplier
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

        //start Date
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


        //End Date
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

        //Capacity
        if (x == 4) {
            var col = ("E").concat(parseInt(y) + 1);
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
        this.el.setValueFromCoords(7, y, 1, true);
    }.bind(this);

    loaded = function (instance, cell, x, y, value) {
        jExcelLoadedFunction(instance);
    }

    checkValidation() {
        var valid = true;
        var json = this.el.getJson();
        for (var y = 0; y < json.length; y++) {
            var col = ("H").concat(parseInt(y) + 1);
            var value = this.el.getValueFromCoords(7, y);
            if (parseInt(value) == 1) {

                //Supplier
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

                //StartDate
                var col = ("C").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(2, y);
                if (value == "Invalid date" || value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //EndDate
                var col = ("D").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(3, y);
                if (value == "Invalid date" || value == "") {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setStyle(col, "background-color", "yellow");
                    this.el.setComments(col, i18n.t('static.label.fieldRequired'));
                    valid = false;
                } else {
                    this.el.setStyle(col, "background-color", "transparent");
                    this.el.setComments(col, "");
                }

                //Capacity
                var col = ("E").concat(parseInt(y) + 1);
                var value = this.el.getValueFromCoords(4, y);
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

                <Card>

                    <CardHeader>
                        <i className="icon-note"></i><strong>{i18n.t('static.common.addEntity', { entityname })}</strong>{' '}
                    </CardHeader>
                    <CardBody>

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
                            <Button type="submit" size="md" color="success" onClick={this.submitForm} className="float-right mr-1" ><i className="fa fa-check"></i>{i18n.t('static.common.submit')}</Button>
                            <Button color="info" size="md" className="float-right mr-1" type="button" onClick={() => this.addRow()}> <i className="fa fa-plus"></i> Add Row</Button>
                            &nbsp;
                </FormGroup>
                    </CardFooter>
                </Card>


            </div >
        );
    }

    cancelClicked() {
        this.props.history.push(`/planningUnit/listPlanningUnit/` + 'red/' + i18n.t('static.message.cancelled', { entityname }))
    }
}

export default PlanningUnitCapacity
